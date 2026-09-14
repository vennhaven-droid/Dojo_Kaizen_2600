# Dojo Kaizen Martial Arts 2600

Premium martial arts academy management platform and marketing website.

## Stack

- **Next.js 15** (App Router, TypeScript)
- **Self-hosted Supabase** on the VPS (Auth, PostgreSQL, RLS) — API at `https://api.dojokaizen2600.com`
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

1. Copy `.env.example` to `.env.local`. Production already uses the VPS Supabase at `https://api.dojokaizen2600.com` — copy the anon/service keys from the server (see [docs/SUPABASE_SETUP.md](docs/SUPABASE_SETUP.md)).

2. New schema changes are SQL files in `supabase/migrations/`. Apply them in Studio at `https://api.dojokaizen2600.com` (not hosted supabase.com). Group chat is `0010_group_chat.sql`.

3. Create a super admin user:
   - Sign up at `/signup`
   - In Supabase SQL editor: `UPDATE profiles SET role = 'SUPER_ADMIN' WHERE email = 'your@email.com';`

4. Install and run:
   ```bash
   npm install
   npm run dev
   ```

5. Open [http://localhost:3000](http://localhost:3000)

## Google sign-in

Members and staff can log in with Google using the same email the dojo used when creating their account.

### Supabase

1. **Authentication → Providers → Google** — enable Google and add your OAuth client ID and secret from [Google Cloud Console](https://console.cloud.google.com/apis/credentials).
2. **Authentication → URL Configuration** — add redirect URLs:
   - `http://localhost:3000/auth/callback` (local dev)
   - `https://dojokaizen2600.com/auth/callback` (production)
3. **Authentication → Providers → Google** (or Auth settings) — enable **Automatic linking** so Google sign-in attaches to existing email/password accounts with the same email.

### Google Cloud Console

1. Create an OAuth 2.0 **Web application** client.
2. **Authorized JavaScript origins:** `http://localhost:3000`, `https://dojokaizen2600.com`
3. **Authorized redirect URIs:** the VPS Supabase callback (`https://api.dojokaizen2600.com/auth/v1/callback`).

Run migration `0009_google_oauth_login.sql` so OAuth-only sign-ups do not auto-create parent accounts.

## Deployment (Hostinger VPS)

This app is **not** on Vercel. Production is a Hostinger VPS:

| Piece | How it runs |
|-------|-------------|
| Next.js | `/var/www/dojokaizen`, `npm run build` then `next start` (port 3000) |
| Process manager | PM2 process name `dojokaizen` (`ecosystem.config.cjs`) |
| Reverse proxy + SSL | nginx → `https://dojokaizen2600.com` |
| Database / Auth / Storage | Self-hosted Supabase Docker at `/opt/supabase`, public URL `https://api.dojokaizen2600.com` |

The member app talks to **this** Next.js process for `/api/me` and attendance. Set `EXPO_PUBLIC_API_URL=https://dojokaizen2600.com` (already in `mobile/eas.json`). Chat uses the same Supabase API as the website (`EXPO_PUBLIC_SUPABASE_URL=https://api.dojokaizen2600.com`). Native apps do not use browser CORS; `lib/http/cors.ts` is only needed if you open Expo web against the VPS API.

### Ship a release (git pull → migrate → rebuild → restart)

SSH into the VPS, then:

```bash
cd /var/www/dojokaizen
git pull
```

Apply group chat (once), in Studio SQL editor at `https://api.dojokaizen2600.com`, or:

```bash
docker exec -i supabase-db psql -U postgres -d postgres \
  < /var/www/dojokaizen/supabase/migrations/0010_group_chat.sql
```

Rebuild and restart Next.js:

```bash
cd /var/www/dojokaizen
npm install
npm run build
pm2 restart dojokaizen
pm2 status
```

If the process is missing: `pm2 start ecosystem.config.cjs && pm2 save`.

### Env on the VPS

Keep secrets in `/var/www/dojokaizen/.env.production` (or `.env.local` if that is what `next start` already loads). Required:

- `NEXT_PUBLIC_SUPABASE_URL=https://api.dojokaizen2600.com`
- `NEXT_PUBLIC_SUPABASE_ANON_KEY` / `SUPABASE_SERVICE_ROLE_KEY` (from `/opt/supabase/.env`)
- `NEXT_PUBLIC_APP_URL=https://dojokaizen2600.com`
- `ADMIN_EMAIL`, `CRON_SECRET`, plus Cloudinary/Resend if you use them

Cron is not Vercel Cron. On the VPS, hit `/api/cron/notifications` from crontab with `Authorization: Bearer $CRON_SECRET`.

### Mobile EAS builds

Preview and production in `mobile/eas.json` already set `EXPO_PUBLIC_API_URL=https://dojokaizen2600.com` so the APK talks to the VPS, not localhost. Also set `EXPO_PUBLIC_SUPABASE_URL` / `EXPO_PUBLIC_SUPABASE_ANON_KEY` to the same VPS Supabase values as Next.js. See `mobile/.env.example`.

## Brand Colors

| Token | Hex |
|-------|-----|
| Primary Blue | `#0D74D1` |
| Gold Accent | `#F2C94C` |
| Black | `#0B0B0B` |
| Light Gray | `#F4F4F4` |

Replace `public/logo.svg` with your academy logo PNG for production.
