# Dojo Kaizen Martial Arts 2600

Premium martial arts academy management platform and marketing website.

## Stack

- **Next.js 15** (App Router, TypeScript)
- **Supabase** (Auth, PostgreSQL, RLS)
- **Tailwind CSS 4** + custom design system
- **Framer Motion**, **Recharts**, **Resend**, **Cloudinary** (ready)

## Features

- Public marketing website (Home, About, Programs, Coaches, Schedule, Pricing, Events, Contact, Enroll)
- Admin portal (students, payments, lockers, attendance, CMS, retention, reports, audit)
- Parent portal (multi-child dashboard, attendance, achievements, payments)
- Student portal (gamified dashboard, one-tap check-in, achievements, competitions)
- Coach portal (time tracking, session plans, student notes)
- Manual payment ledger & accounts receivable
- Session package tracking with auto-deduct on check-in
- Gamification (badges, XP, levels, streaks)
- Retention dashboard with risk levels

## Setup

1. Copy `.env.example` to `.env.local` and fill in Supabase credentials.

2. Run the database migration in your Supabase project:
   ```bash
   # Using Supabase CLI
   supabase db push
   # Or paste supabase/migrations/0001_init.sql into the SQL editor
   ```

3. Create a super admin user:
   - Sign up at `/signup`
   - In Supabase SQL editor: `UPDATE profiles SET role = 'SUPER_ADMIN' WHERE email = 'your@email.com';`

4. Install and run:
   ```bash
   npm install
   npm run dev
   ```

5. Open [http://localhost:3000](http://localhost:3000)

## Deployment

- **Vercel** for the Next.js app
- **Supabase** hosted Postgres for the database
- Set all env vars from `.env.example` in Vercel project settings

## Brand Colors

| Token | Hex |
|-------|-----|
| Primary Blue | `#0D74D1` |
| Gold Accent | `#F2C94C` |
| Black | `#0B0B0B` |
| Light Gray | `#F4F4F4` |

Replace `public/logo.svg` with your academy logo PNG for production.
