-- Fix: "Database error creating new user" when auth trigger fails on profile insert

CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  INSERT INTO public.profiles (id, email, first_name, last_name, role, is_active)
  VALUES (
    NEW.id,
    NEW.email,
    NULLIF(COALESCE(NEW.raw_user_meta_data->>'first_name', split_part(COALESCE(NEW.raw_user_meta_data->>'full_name', ''), ' ', 1)), ''),
    NULLIF(COALESCE(NEW.raw_user_meta_data->>'last_name', split_part(COALESCE(NEW.raw_user_meta_data->>'full_name', ''), ' ', 2)), ''),
    'PARENT',
    true
  )
  ON CONFLICT (id) DO UPDATE SET
    email = EXCLUDED.email,
    updated_at = NOW();
  RETURN NEW;
EXCEPTION
  WHEN others THEN
    RAISE LOG 'handle_new_user failed for %: %', NEW.id, SQLERRM;
    RAISE;
END;
$$;

-- Ensure trigger exists (idempotent)
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

-- Belt-and-suspenders: allow profile creation from auth flow
DROP POLICY IF EXISTS profiles_insert_own ON profiles;
CREATE POLICY profiles_insert_own ON profiles
  FOR INSERT
  WITH CHECK (id = auth.uid());
