-- Dojo Kaizen Martial Arts Platform — Full Schema
-- Phase 1 MVP + Phase 2 readiness

-- Enums
CREATE TYPE user_role AS ENUM ('SUPER_ADMIN', 'ADMIN', 'COACH', 'PARENT', 'STUDENT');
CREATE TYPE membership_type AS ENUM ('MONTHLY', 'WALK_IN', 'SESSION_PACKAGE', 'PRIVATE_COACHING', 'UNLIMITED', 'CUSTOM');
CREATE TYPE membership_status AS ENUM ('ACTIVE', 'PAUSED', 'EXPIRED', 'CANCELLED', 'TRIAL');
CREATE TYPE pricing_type AS ENUM ('REGULAR', 'FIGHTER', 'COACH', 'VIP', 'LEGACY', 'SCHOLARSHIP', 'CUSTOM');
CREATE TYPE payment_method AS ENUM ('CASH', 'GCASH', 'BANK_TRANSFER', 'CARD', 'OTHER');
CREATE TYPE locker_status AS ENUM ('AVAILABLE', 'OCCUPIED', 'RESERVED', 'EXPIRED');
CREATE TYPE check_in_method AS ENUM ('LOGIN', 'QR', 'ADMIN_OVERRIDE');
CREATE TYPE student_status AS ENUM ('ACTIVE', 'INACTIVE', 'SUSPENDED');
CREATE TYPE notification_channel AS ENUM ('EMAIL', 'SMS', 'PUSH', 'MESSENGER');

-- Profiles (extends auth.users)
CREATE TABLE profiles (
  id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  role user_role NOT NULL DEFAULT 'PARENT',
  first_name TEXT,
  last_name TEXT,
  phone TEXT,
  avatar_url TEXT,
  email TEXT,
  metadata JSONB DEFAULT '{}',
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Site settings (single row)
CREATE TABLE site_settings (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  academy_name TEXT NOT NULL DEFAULT 'Dojo Kaizen Martial Arts 2600',
  logo_url TEXT,
  phone TEXT,
  email TEXT,
  address TEXT,
  facebook_url TEXT,
  messenger_url TEXT,
  map_embed_url TEXT,
  seo_title TEXT,
  seo_description TEXT,
  brand_colors JSONB DEFAULT '{"blue":"#0D74D1","gold":"#F2C94C","black":"#0B0B0B","gray":"#F4F4F4"}',
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Students
CREATE TABLE students (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  profile_id UUID REFERENCES profiles(id) ON DELETE SET NULL,
  first_name TEXT NOT NULL,
  last_name TEXT NOT NULL,
  nickname TEXT,
  photo_url TEXT,
  birthday DATE,
  gender TEXT,
  address TEXT,
  email TEXT,
  phone TEXT,
  medical JSONB DEFAULT '{}',
  status student_status NOT NULL DEFAULT 'ACTIVE',
  digital_card_token TEXT,
  metadata JSONB DEFAULT '{}',
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE guardians (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  student_id UUID NOT NULL REFERENCES students(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  relationship TEXT NOT NULL,
  phone TEXT,
  email TEXT,
  is_primary BOOLEAN NOT NULL DEFAULT false,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE emergency_contacts (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  student_id UUID NOT NULL REFERENCES students(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  relationship TEXT NOT NULL,
  phone TEXT NOT NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE authorized_pickups (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  student_id UUID NOT NULL REFERENCES students(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  relationship TEXT NOT NULL,
  phone TEXT,
  notes TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE parent_students (
  parent_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  student_id UUID NOT NULL REFERENCES students(id) ON DELETE CASCADE,
  PRIMARY KEY (parent_id, student_id)
);

-- Programs & Coaches
CREATE TABLE programs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  slug TEXT NOT NULL UNIQUE,
  description TEXT,
  age_min INT,
  age_max INT,
  default_price DECIMAL(10,2) NOT NULL DEFAULT 0,
  is_active BOOLEAN NOT NULL DEFAULT true,
  sort_order INT NOT NULL DEFAULT 0,
  metadata JSONB DEFAULT '{}',
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE coaches (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  profile_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  bio TEXT,
  experience TEXT,
  certifications JSONB DEFAULT '[]',
  achievements JSONB DEFAULT '[]',
  photo_url TEXT,
  is_active BOOLEAN NOT NULL DEFAULT true,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE program_coaches (
  program_id UUID NOT NULL REFERENCES programs(id) ON DELETE CASCADE,
  coach_id UUID NOT NULL REFERENCES coaches(id) ON DELETE CASCADE,
  PRIMARY KEY (program_id, coach_id)
);

CREATE TABLE program_schedules (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  program_id UUID NOT NULL REFERENCES programs(id) ON DELETE CASCADE,
  day_of_week INT NOT NULL CHECK (day_of_week BETWEEN 0 AND 6),
  start_time TIME NOT NULL,
  end_time TIME NOT NULL,
  coach_id UUID REFERENCES coaches(id) ON DELETE SET NULL,
  age_group TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Memberships & Billing
CREATE TABLE memberships (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  student_id UUID NOT NULL REFERENCES students(id) ON DELETE CASCADE,
  program_id UUID NOT NULL REFERENCES programs(id) ON DELETE CASCADE,
  type membership_type NOT NULL DEFAULT 'MONTHLY',
  status membership_status NOT NULL DEFAULT 'ACTIVE',
  pricing_type pricing_type NOT NULL DEFAULT 'REGULAR',
  custom_rate DECIMAL(10,2),
  due_date DATE,
  start_date DATE,
  end_date DATE,
  metadata JSONB DEFAULT '{}',
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE session_packages (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  membership_id UUID NOT NULL REFERENCES memberships(id) ON DELETE CASCADE UNIQUE,
  purchased INT NOT NULL DEFAULT 0,
  used INT NOT NULL DEFAULT 0,
  remaining INT NOT NULL DEFAULT 0,
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE payments (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  student_id UUID NOT NULL REFERENCES students(id) ON DELETE CASCADE,
  amount DECIMAL(10,2) NOT NULL,
  method payment_method NOT NULL DEFAULT 'CASH',
  reference_number TEXT,
  membership_id UUID REFERENCES memberships(id) ON DELETE SET NULL,
  locker_rental_id UUID,
  payment_type TEXT NOT NULL DEFAULT 'membership',
  notes TEXT,
  stripe_payment_id TEXT,
  paid_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE lockers (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  number TEXT NOT NULL UNIQUE,
  status locker_status NOT NULL DEFAULT 'AVAILABLE',
  monthly_fee DECIMAL(10,2) NOT NULL DEFAULT 0,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE locker_rentals (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  locker_id UUID NOT NULL REFERENCES lockers(id) ON DELETE CASCADE,
  student_id UUID NOT NULL REFERENCES students(id) ON DELETE CASCADE,
  start_date DATE NOT NULL,
  renewal_date DATE,
  monthly_fee DECIMAL(10,2) NOT NULL DEFAULT 0,
  status locker_status NOT NULL DEFAULT 'OCCUPIED',
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

ALTER TABLE payments ADD CONSTRAINT payments_locker_rental_fkey
  FOREIGN KEY (locker_rental_id) REFERENCES locker_rentals(id) ON DELETE SET NULL;

-- Attendance & Stats
CREATE TABLE attendance (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  student_id UUID NOT NULL REFERENCES students(id) ON DELETE CASCADE,
  date DATE NOT NULL,
  check_in_method check_in_method NOT NULL DEFAULT 'LOGIN',
  checked_in_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  kiosk_id TEXT,
  notes TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  UNIQUE (student_id, date)
);

CREATE TABLE student_stats (
  student_id UUID PRIMARY KEY REFERENCES students(id) ON DELETE CASCADE,
  total_visits INT NOT NULL DEFAULT 0,
  monthly_visits INT NOT NULL DEFAULT 0,
  yearly_visits INT NOT NULL DEFAULT 0,
  current_streak INT NOT NULL DEFAULT 0,
  longest_streak INT NOT NULL DEFAULT 0,
  xp_points INT NOT NULL DEFAULT 0,
  level INT NOT NULL DEFAULT 1,
  last_visit DATE,
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Gamification
CREATE TABLE achievements (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  slug TEXT NOT NULL UNIQUE,
  name TEXT NOT NULL,
  description TEXT,
  icon TEXT,
  threshold INT,
  category TEXT NOT NULL DEFAULT 'attendance',
  xp_reward INT NOT NULL DEFAULT 0,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE student_achievements (
  student_id UUID NOT NULL REFERENCES students(id) ON DELETE CASCADE,
  achievement_id UUID NOT NULL REFERENCES achievements(id) ON DELETE CASCADE,
  earned_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  PRIMARY KEY (student_id, achievement_id)
);

-- Competitions
CREATE TABLE competitions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  student_id UUID NOT NULL REFERENCES students(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  date DATE NOT NULL,
  division TEXT,
  weight_class TEXT,
  opponent TEXT,
  result TEXT,
  placement TEXT,
  medal TEXT,
  photos JSONB DEFAULT '[]',
  coach_notes TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Coach portal
CREATE TABLE coach_time_logs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  coach_id UUID NOT NULL REFERENCES coaches(id) ON DELETE CASCADE,
  time_in TIMESTAMPTZ NOT NULL,
  time_out TIMESTAMPTZ,
  notes TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE session_plans (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  coach_id UUID NOT NULL REFERENCES coaches(id) ON DELETE CASCADE,
  program_id UUID REFERENCES programs(id) ON DELETE SET NULL,
  topic TEXT NOT NULL,
  techniques TEXT,
  conditioning TEXT,
  sparring TEXT,
  notes TEXT,
  plan_date DATE NOT NULL DEFAULT CURRENT_DATE,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE student_notes (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  student_id UUID NOT NULL REFERENCES students(id) ON DELETE CASCADE,
  coach_id UUID NOT NULL REFERENCES coaches(id) ON DELETE CASCADE,
  note TEXT NOT NULL,
  category TEXT DEFAULT 'progress',
  is_private BOOLEAN NOT NULL DEFAULT true,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE coach_students (
  coach_id UUID NOT NULL REFERENCES coaches(id) ON DELETE CASCADE,
  student_id UUID NOT NULL REFERENCES students(id) ON DELETE CASCADE,
  PRIMARY KEY (coach_id, student_id)
);

-- CMS
CREATE TABLE cms_pages (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  slug TEXT NOT NULL UNIQUE,
  title TEXT NOT NULL,
  sections JSONB NOT NULL DEFAULT '{}',
  is_published BOOLEAN NOT NULL DEFAULT true,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE cms_programs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  program_id UUID REFERENCES programs(id) ON DELETE SET NULL,
  title TEXT NOT NULL,
  description TEXT,
  image_url TEXT,
  cta_text TEXT DEFAULT 'Enroll Now',
  sort_order INT NOT NULL DEFAULT 0,
  is_published BOOLEAN NOT NULL DEFAULT true,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE cms_events (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  title TEXT NOT NULL,
  description TEXT,
  event_date DATE,
  event_type TEXT DEFAULT 'announcement',
  image_url TEXT,
  is_published BOOLEAN NOT NULL DEFAULT true,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE cms_testimonials (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  author_name TEXT NOT NULL,
  author_role TEXT,
  content TEXT NOT NULL,
  rating INT CHECK (rating BETWEEN 1 AND 5),
  photo_url TEXT,
  is_published BOOLEAN NOT NULL DEFAULT true,
  sort_order INT NOT NULL DEFAULT 0,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE cms_gallery (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  title TEXT,
  image_url TEXT NOT NULL,
  category TEXT DEFAULT 'general',
  sort_order INT NOT NULL DEFAULT 0,
  is_published BOOLEAN NOT NULL DEFAULT true,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE cms_pricing (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  title TEXT NOT NULL,
  description TEXT,
  price DECIMAL(10,2) NOT NULL,
  billing_period TEXT DEFAULT 'monthly',
  features JSONB DEFAULT '[]',
  is_promoted BOOLEAN NOT NULL DEFAULT false,
  sort_order INT NOT NULL DEFAULT 0,
  is_published BOOLEAN NOT NULL DEFAULT true,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Enrollment leads
CREATE TABLE enrollment_leads (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  first_name TEXT NOT NULL,
  last_name TEXT NOT NULL,
  birthday DATE,
  email TEXT,
  phone TEXT,
  program_interest TEXT,
  parent_name TEXT,
  parent_phone TEXT,
  parent_email TEXT,
  emergency_contact TEXT,
  waiver_accepted BOOLEAN NOT NULL DEFAULT false,
  status TEXT NOT NULL DEFAULT 'new',
  notes TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Audit & Notifications
CREATE TABLE audit_logs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES profiles(id) ON DELETE SET NULL,
  action TEXT NOT NULL,
  entity_type TEXT NOT NULL,
  entity_id UUID,
  old_value JSONB,
  new_value JSONB,
  ip_address TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE notifications (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES profiles(id) ON DELETE CASCADE,
  student_id UUID REFERENCES students(id) ON DELETE CASCADE,
  channel notification_channel NOT NULL DEFAULT 'EMAIL',
  subject TEXT NOT NULL,
  body TEXT NOT NULL,
  sent_at TIMESTAMPTZ,
  status TEXT NOT NULL DEFAULT 'pending',
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Phase 2: Merchandise
CREATE TABLE merchandise_products (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  description TEXT,
  price DECIMAL(10,2) NOT NULL,
  stock INT NOT NULL DEFAULT 0,
  category TEXT,
  image_url TEXT,
  is_active BOOLEAN NOT NULL DEFAULT true,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE merchandise_orders (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  student_id UUID REFERENCES students(id) ON DELETE SET NULL,
  total DECIMAL(10,2) NOT NULL,
  status TEXT NOT NULL DEFAULT 'pending',
  items JSONB NOT NULL DEFAULT '[]',
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Indexes
CREATE INDEX idx_students_status ON students(status);
CREATE INDEX idx_students_profile ON students(profile_id);
CREATE INDEX idx_memberships_student ON memberships(student_id);
CREATE INDEX idx_memberships_status ON memberships(status);
CREATE INDEX idx_memberships_due_date ON memberships(due_date);
CREATE INDEX idx_attendance_student_date ON attendance(student_id, date DESC);
CREATE INDEX idx_attendance_date ON attendance(date);
CREATE INDEX idx_payments_student ON payments(student_id);
CREATE INDEX idx_payments_paid_at ON payments(paid_at);
CREATE INDEX idx_student_stats_last_visit ON student_stats(last_visit);
CREATE INDEX idx_audit_logs_created ON audit_logs(created_at DESC);
CREATE INDEX idx_enrollment_leads_status ON enrollment_leads(status);

-- Updated_at trigger
CREATE OR REPLACE FUNCTION update_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER profiles_updated_at BEFORE UPDATE ON profiles FOR EACH ROW EXECUTE FUNCTION update_updated_at();
CREATE TRIGGER students_updated_at BEFORE UPDATE ON students FOR EACH ROW EXECUTE FUNCTION update_updated_at();
CREATE TRIGGER programs_updated_at BEFORE UPDATE ON programs FOR EACH ROW EXECUTE FUNCTION update_updated_at();
CREATE TRIGGER memberships_updated_at BEFORE UPDATE ON memberships FOR EACH ROW EXECUTE FUNCTION update_updated_at();
CREATE TRIGGER site_settings_updated_at BEFORE UPDATE ON site_settings FOR EACH ROW EXECUTE FUNCTION update_updated_at();
CREATE TRIGGER cms_pages_updated_at BEFORE UPDATE ON cms_pages FOR EACH ROW EXECUTE FUNCTION update_updated_at();

-- Auto-create profile on signup
CREATE OR REPLACE FUNCTION handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO profiles (id, email, first_name, last_name)
  VALUES (
    NEW.id,
    NEW.email,
    COALESCE(NEW.raw_user_meta_data->>'first_name', split_part(COALESCE(NEW.raw_user_meta_data->>'full_name', ''), ' ', 1)),
    COALESCE(NEW.raw_user_meta_data->>'last_name', split_part(COALESCE(NEW.raw_user_meta_data->>'full_name', ''), ' ', 2))
  );
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION handle_new_user();

-- Init student_stats on student create
CREATE OR REPLACE FUNCTION init_student_stats()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO student_stats (student_id) VALUES (NEW.id);
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER on_student_created
  AFTER INSERT ON students
  FOR EACH ROW EXECUTE FUNCTION init_student_stats();

-- RLS
ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE students ENABLE ROW LEVEL SECURITY;
ALTER TABLE guardians ENABLE ROW LEVEL SECURITY;
ALTER TABLE emergency_contacts ENABLE ROW LEVEL SECURITY;
ALTER TABLE authorized_pickups ENABLE ROW LEVEL SECURITY;
ALTER TABLE parent_students ENABLE ROW LEVEL SECURITY;
ALTER TABLE programs ENABLE ROW LEVEL SECURITY;
ALTER TABLE coaches ENABLE ROW LEVEL SECURITY;
ALTER TABLE memberships ENABLE ROW LEVEL SECURITY;
ALTER TABLE session_packages ENABLE ROW LEVEL SECURITY;
ALTER TABLE payments ENABLE ROW LEVEL SECURITY;
ALTER TABLE lockers ENABLE ROW LEVEL SECURITY;
ALTER TABLE locker_rentals ENABLE ROW LEVEL SECURITY;
ALTER TABLE attendance ENABLE ROW LEVEL SECURITY;
ALTER TABLE student_stats ENABLE ROW LEVEL SECURITY;
ALTER TABLE achievements ENABLE ROW LEVEL SECURITY;
ALTER TABLE student_achievements ENABLE ROW LEVEL SECURITY;
ALTER TABLE competitions ENABLE ROW LEVEL SECURITY;
ALTER TABLE coach_time_logs ENABLE ROW LEVEL SECURITY;
ALTER TABLE session_plans ENABLE ROW LEVEL SECURITY;
ALTER TABLE student_notes ENABLE ROW LEVEL SECURITY;
ALTER TABLE site_settings ENABLE ROW LEVEL SECURITY;
ALTER TABLE cms_pages ENABLE ROW LEVEL SECURITY;
ALTER TABLE cms_programs ENABLE ROW LEVEL SECURITY;
ALTER TABLE cms_events ENABLE ROW LEVEL SECURITY;
ALTER TABLE cms_testimonials ENABLE ROW LEVEL SECURITY;
ALTER TABLE cms_gallery ENABLE ROW LEVEL SECURITY;
ALTER TABLE cms_pricing ENABLE ROW LEVEL SECURITY;
ALTER TABLE enrollment_leads ENABLE ROW LEVEL SECURITY;
ALTER TABLE audit_logs ENABLE ROW LEVEL SECURITY;
ALTER TABLE notifications ENABLE ROW LEVEL SECURITY;

-- Helper: is admin
CREATE OR REPLACE FUNCTION is_admin()
RETURNS BOOLEAN AS $$
  SELECT EXISTS (
    SELECT 1 FROM profiles
    WHERE id = auth.uid()
    AND role IN ('SUPER_ADMIN', 'ADMIN')
  );
$$ LANGUAGE sql SECURITY DEFINER STABLE;

-- Profiles policies
CREATE POLICY profiles_select ON profiles FOR SELECT USING (
  id = auth.uid() OR is_admin()
);
CREATE POLICY profiles_update ON profiles FOR UPDATE USING (
  id = auth.uid() OR is_admin()
);

-- Public CMS read
CREATE POLICY cms_pages_public ON cms_pages FOR SELECT USING (is_published = true OR is_admin());
CREATE POLICY cms_programs_public ON cms_programs FOR SELECT USING (is_published = true OR is_admin());
CREATE POLICY cms_events_public ON cms_events FOR SELECT USING (is_published = true OR is_admin());
CREATE POLICY cms_testimonials_public ON cms_testimonials FOR SELECT USING (is_published = true OR is_admin());
CREATE POLICY cms_gallery_public ON cms_gallery FOR SELECT USING (is_published = true OR is_admin());
CREATE POLICY cms_pricing_public ON cms_pricing FOR SELECT USING (is_published = true OR is_admin());
CREATE POLICY site_settings_public ON site_settings FOR SELECT USING (true);
CREATE POLICY programs_public ON programs FOR SELECT USING (is_active = true OR is_admin());
CREATE POLICY coaches_public ON coaches FOR SELECT USING (is_active = true OR is_admin());
CREATE POLICY achievements_public ON achievements FOR SELECT USING (true);

-- Admin full access
CREATE POLICY admin_students ON students FOR ALL USING (is_admin());
CREATE POLICY admin_guardians ON guardians FOR ALL USING (is_admin());
CREATE POLICY admin_emergency ON emergency_contacts FOR ALL USING (is_admin());
CREATE POLICY admin_pickups ON authorized_pickups FOR ALL USING (is_admin());
CREATE POLICY admin_memberships ON memberships FOR ALL USING (is_admin());
CREATE POLICY admin_session_packages ON session_packages FOR ALL USING (is_admin());
CREATE POLICY admin_payments ON payments FOR ALL USING (is_admin());
CREATE POLICY admin_lockers ON lockers FOR ALL USING (is_admin());
CREATE POLICY admin_locker_rentals ON locker_rentals FOR ALL USING (is_admin());
CREATE POLICY admin_attendance ON attendance FOR ALL USING (is_admin());
CREATE POLICY admin_student_stats ON student_stats FOR ALL USING (is_admin());
CREATE POLICY admin_competitions ON competitions FOR ALL USING (is_admin());
CREATE POLICY admin_coach_time ON coach_time_logs FOR ALL USING (is_admin());
CREATE POLICY admin_session_plans ON session_plans FOR ALL USING (is_admin());
CREATE POLICY admin_student_notes ON student_notes FOR ALL USING (is_admin());
CREATE POLICY admin_cms_pages ON cms_pages FOR ALL USING (is_admin());
CREATE POLICY admin_cms_programs ON cms_programs FOR ALL USING (is_admin());
CREATE POLICY admin_cms_events ON cms_events FOR ALL USING (is_admin());
CREATE POLICY admin_cms_testimonials ON cms_testimonials FOR ALL USING (is_admin());
CREATE POLICY admin_cms_gallery ON cms_gallery FOR ALL USING (is_admin());
CREATE POLICY admin_cms_pricing ON cms_pricing FOR ALL USING (is_admin());
CREATE POLICY admin_enrollment ON enrollment_leads FOR ALL USING (is_admin());
CREATE POLICY admin_audit ON audit_logs FOR SELECT USING (
  EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND role = 'SUPER_ADMIN')
);
CREATE POLICY admin_audit_insert ON audit_logs FOR INSERT WITH CHECK (is_admin());
CREATE POLICY admin_coaches ON coaches FOR ALL USING (is_admin());
CREATE POLICY admin_programs ON programs FOR ALL USING (is_admin());

-- Parent access
CREATE POLICY parent_students_select ON parent_students FOR SELECT USING (
  parent_id = auth.uid() OR is_admin()
);
CREATE POLICY parent_students_admin ON parent_students FOR ALL USING (is_admin());

CREATE POLICY parent_view_students ON students FOR SELECT USING (
  is_admin() OR EXISTS (
    SELECT 1 FROM parent_students ps WHERE ps.student_id = students.id AND ps.parent_id = auth.uid()
  )
);

CREATE POLICY parent_view_attendance ON attendance FOR SELECT USING (
  is_admin() OR EXISTS (
    SELECT 1 FROM parent_students ps WHERE ps.student_id = attendance.student_id AND ps.parent_id = auth.uid()
  )
);

CREATE POLICY parent_view_stats ON student_stats FOR SELECT USING (
  is_admin() OR EXISTS (
    SELECT 1 FROM parent_students ps WHERE ps.student_id = student_stats.student_id AND ps.parent_id = auth.uid()
  )
);

CREATE POLICY parent_view_memberships ON memberships FOR SELECT USING (
  is_admin() OR EXISTS (
    SELECT 1 FROM parent_students ps WHERE ps.student_id = memberships.student_id AND ps.parent_id = auth.uid()
  )
);

CREATE POLICY parent_view_payments ON payments FOR SELECT USING (
  is_admin() OR EXISTS (
    SELECT 1 FROM parent_students ps WHERE ps.student_id = payments.student_id AND ps.parent_id = auth.uid()
  )
);

CREATE POLICY parent_view_achievements ON student_achievements FOR SELECT USING (
  is_admin() OR EXISTS (
    SELECT 1 FROM parent_students ps WHERE ps.student_id = student_achievements.student_id AND ps.parent_id = auth.uid()
  )
);

CREATE POLICY parent_view_competitions ON competitions FOR SELECT USING (
  is_admin() OR EXISTS (
    SELECT 1 FROM parent_students ps WHERE ps.student_id = competitions.student_id AND ps.parent_id = auth.uid()
  )
);

-- Student self access
CREATE POLICY student_self ON students FOR SELECT USING (
  is_admin() OR profile_id = auth.uid()
);

CREATE POLICY student_self_attendance ON attendance FOR SELECT USING (
  is_admin() OR EXISTS (
    SELECT 1 FROM students s WHERE s.id = attendance.student_id AND s.profile_id = auth.uid()
  )
);

CREATE POLICY student_check_in ON attendance FOR INSERT WITH CHECK (
  is_admin() OR EXISTS (
    SELECT 1 FROM students s WHERE s.id = attendance.student_id AND s.profile_id = auth.uid()
  )
);

CREATE POLICY student_self_stats ON student_stats FOR SELECT USING (
  is_admin() OR EXISTS (
    SELECT 1 FROM students s WHERE s.id = student_stats.student_id AND s.profile_id = auth.uid()
  )
);

CREATE POLICY student_self_memberships ON memberships FOR SELECT USING (
  is_admin() OR EXISTS (
    SELECT 1 FROM students s WHERE s.id = memberships.student_id AND s.profile_id = auth.uid()
  )
);

CREATE POLICY student_self_achievements ON student_achievements FOR SELECT USING (
  is_admin() OR EXISTS (
    SELECT 1 FROM students s WHERE s.id = student_achievements.student_id AND s.profile_id = auth.uid()
  )
);

-- Coach access
CREATE POLICY coach_self ON coaches FOR SELECT USING (
  is_admin() OR profile_id = auth.uid()
);

CREATE POLICY coach_time_self ON coach_time_logs FOR ALL USING (
  is_admin() OR EXISTS (
    SELECT 1 FROM coaches c WHERE c.id = coach_time_logs.coach_id AND c.profile_id = auth.uid()
  )
);

CREATE POLICY coach_session_plans ON session_plans FOR ALL USING (
  is_admin() OR EXISTS (
    SELECT 1 FROM coaches c WHERE c.id = session_plans.coach_id AND c.profile_id = auth.uid()
  )
);

CREATE POLICY coach_notes ON student_notes FOR ALL USING (
  is_admin() OR EXISTS (
    SELECT 1 FROM coaches c WHERE c.id = student_notes.coach_id AND c.profile_id = auth.uid()
  )
);

-- Public enrollment insert
CREATE POLICY enrollment_public_insert ON enrollment_leads FOR INSERT WITH CHECK (true);

-- Seed data
INSERT INTO site_settings (academy_name, phone, email, address, seo_title, seo_description)
VALUES (
  'Dojo Kaizen Martial Arts 2600',
  '+63 912 345 6789',
  'info@dojokaizen.com',
  '2600 Baguio City, Philippines',
  'Dojo Kaizen Martial Arts 2600 | Muay Thai, MMA, Boxing',
  'Premium martial arts academy. Muay Thai, MMA, Boxing, Kids & Teen programs. Train with discipline. Improve continuously.'
);

INSERT INTO programs (name, slug, description, age_min, age_max, default_price, sort_order) VALUES
  ('Muay Thai', 'muay-thai', 'Traditional Thai boxing with modern training methods.', 13, NULL, 3500, 1),
  ('MMA', 'mma', 'Mixed martial arts combining striking and grappling.', 16, NULL, 4000, 2),
  ('Boxing', 'boxing', 'Classic boxing fundamentals and competition prep.', 13, NULL, 3000, 3),
  ('Kids Martial Arts', 'kids-martial-arts', 'Fun, safe martial arts for children ages 5-12.', 5, 12, 2500, 4),
  ('Teen Martial Arts', 'teen-martial-arts', 'Dynamic training for teens ages 13-17.', 13, 17, 2800, 5),
  ('Self Defense', 'self-defense', 'Practical self-defense for all skill levels.', 16, NULL, 2000, 6),
  ('Fitness Conditioning', 'fitness-conditioning', 'High-intensity conditioning for fighters and athletes.', 16, NULL, 1800, 7),
  ('Private Coaching', 'private-coaching', 'One-on-one coaching tailored to your goals.', 13, NULL, 1500, 8);

INSERT INTO cms_pages (slug, title, sections) VALUES
  ('home', 'Home', '{
    "hero": {
      "headline": "TRAIN HARD. IMPROVE DAILY.",
      "subheadline": "Premium martial arts training in Muay Thai, MMA, Boxing & more. Built on discipline, respect, and the Kaizen philosophy of continuous improvement.",
      "primaryCta": "Enroll Now",
      "secondaryCta": "Book Free Trial",
      "imageUrl": null
    },
    "about_preview": {
      "title": "THE KAIZEN WAY",
      "content": "At Dojo Kaizen, we believe martial arts is a journey of continuous improvement. Every session is an opportunity to become stronger, sharper, and more disciplined."
    },
    "faq": [
      {"q": "What programs do you offer?", "a": "Muay Thai, MMA, Boxing, Kids & Teen Martial Arts, Self Defense, Fitness Conditioning, and Private Coaching."},
      {"q": "Do you offer free trials?", "a": "Yes! Book a free trial class to experience our training firsthand."},
      {"q": "What should I bring?", "a": "Comfortable workout clothes, water bottle, and a positive attitude. Gloves and wraps available for purchase."}
    ]
  }'),
  ('about', 'About Us', '{
    "history": "Dojo Kaizen Martial Arts 2600 was founded with a vision to create a world-class training environment where students of all ages can develop martial arts skills, physical fitness, and mental discipline.",
    "mission": "To empower every student through martial arts training, fostering discipline, respect, and continuous improvement.",
    "vision": "To be the premier martial arts academy in the region, producing champions in sport and in life.",
    "philosophy": "Kaizen — continuous improvement. Small daily progress leads to extraordinary results.",
    "values": ["Discipline", "Respect", "Continuous Improvement", "Consistency", "Community", "Warrior Mindset"]
  }');

INSERT INTO cms_pricing (title, description, price, billing_period, features, is_promoted, sort_order) VALUES
  ('Monthly Membership', 'Unlimited classes in your chosen program', 3500, 'monthly', '["Unlimited group classes", "Open mat access", "Progress tracking"]', true, 1),
  ('Session Package (12)', '12 sessions — use at your pace', 3000, 'package', '["12 class sessions", "3-month validity", "All group classes"]', false, 2),
  ('Walk-In Rate', 'Single class drop-in', 400, 'session', '["One group class", "No commitment"]', false, 3),
  ('Private Coaching', 'One-on-one with a coach', 1500, 'session', '["60-minute session", "Personalized curriculum", "Flexible scheduling"]', false, 4),
  ('Locker Rental', 'Secure locker for your gear', 500, 'monthly', '["Personal locker", "24/7 access", "Lock included"]', false, 5);

INSERT INTO achievements (slug, name, description, icon, threshold, category, xp_reward) VALUES
  ('first-visit', 'First Visit', 'Completed your first class', '🥋', 1, 'attendance', 10),
  ('10-visits', '10 Visits', 'Attended 10 classes', '🔟', 10, 'attendance', 25),
  ('25-visits', '25 Visits', 'Attended 25 classes', '💪', 25, 'attendance', 50),
  ('50-visits', '50 Visits', 'Attended 50 classes', '⭐', 50, 'attendance', 100),
  ('100-visits', '100 Visits', 'Attended 100 classes', '🏆', 100, 'attendance', 200),
  ('250-visits', '250 Visits', 'Attended 250 classes', '👑', 250, 'attendance', 500),
  ('500-visits', '500 Visits', 'Attended 500 classes', '💎', 500, 'attendance', 1000),
  ('1000-visits', '1000 Visits', 'Attended 1000 classes', '🌟', 1000, 'attendance', 2000),
  ('1-month-active', '1 Month Active', 'Active for 1 month', '📅', 30, 'consistency', 50),
  ('6-months-active', '6 Months Active', 'Active for 6 months', '📆', 180, 'consistency', 150),
  ('1-year-active', '1 Year Active', 'Active for 1 year', '🎉', 365, 'consistency', 300),
  ('competition-participant', 'Competition Participant', 'Competed in a tournament', '🥊', NULL, 'competition', 100),
  ('competition-winner', 'Competition Winner', 'Won a competition', '🏅', NULL, 'competition', 250),
  ('champion', 'Champion', 'Became a champion', '🏆', NULL, 'competition', 500),
  ('weekend-warrior', 'Weekend Warrior', 'Trained 8 weekends in a row', '🌅', 8, 'consistency', 75),
  ('consistency-master', 'Consistency Master', '30-day attendance streak', '🔥', 30, 'consistency', 200);

INSERT INTO cms_testimonials (author_name, author_role, content, rating, sort_order) VALUES
  ('Maria Santos', 'Parent', 'My son has gained so much confidence since joining Dojo Kaizen. The coaches are amazing with kids!', 5, 1),
  ('Jake Rivera', 'Muay Thai Student', 'Best gym in the area. The training is intense but the community is supportive. Kaizen mindset changed my life.', 5, 2),
  ('Ana Cruz', 'MMA Student', 'From beginner to competitor in 8 months. The coaches pushed me to levels I never thought possible.', 5, 3);

INSERT INTO cms_events (title, description, event_date, event_type) VALUES
  ('Open Mat Saturday', 'Free open mat for all members. Bring your gear!', CURRENT_DATE + 7, 'event'),
  ('Kids Belt Promotion', 'Quarterly belt promotion ceremony for kids program.', CURRENT_DATE + 30, 'promotion'),
  ('Regional MMA Tournament', 'Competition team registration now open.', CURRENT_DATE + 60, 'competition');
