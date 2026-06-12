# Dojo Kaizen 2600 — Supabase Setup

Use a **dedicated Supabase project** for Dojo Kaizen. Do not reuse keys from VenEvents or other apps.

## 1. Create project

1. Go to [supabase.com/dashboard](https://supabase.com/dashboard)
2. **New project** → name it e.g. `dojo-kaizen-2600`
3. Choose a strong database password and region (Singapore is closest to Baguio)

## 2. Run the database schema

In **SQL Editor**, paste and run the full contents of:

```
supabase/migrations/0001_init.sql
```

## 3. Copy API keys to `.env.local`

Project **Settings → API**:

| `.env.local` variable | Supabase value |
|----------------------|----------------|
| `NEXT_PUBLIC_SUPABASE_URL` | Project URL |
| `NEXT_PUBLIC_SUPABASE_ANON_KEY` | anon public |
| `SUPABASE_SERVICE_ROLE_KEY` | service_role (secret — server only) |

## 4. Create your admin account

1. `npm run dev` → open http://localhost:3000/signup
2. Register with your email
3. In Supabase **SQL Editor**:

```sql
UPDATE profiles SET role = 'SUPER_ADMIN' WHERE email = 'your@email.com';
```

## 5. Restart dev server

After saving `.env.local`, restart `npm run dev`.

Marketing pages work without Supabase; admin and portals require steps 2–4.
