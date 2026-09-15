# Dojo Kaizen 2600 — Supabase

Production uses **self-hosted Supabase on the Hostinger VPS**, not supabase.com.

| Piece | Where |
|-------|--------|
| Docker stack | `/opt/supabase` on the VPS |
| Public API / Studio | `https://api.dojokaizen2600.com` |
| Postgres | Docker container `supabase-db` (not a separate Hostinger Postgres) |
| Next.js keys | `/var/www/dojokaizen/.env.production` |

Do not reuse keys from VenEvents or other apps. Do not commit `.env` files.

## Production: apply a migration

New SQL (for example group chat) lives in `supabase/migrations/`. Apply it against the **VPS** database.

### Studio SQL editor (usual path)

1. Open [https://api.dojokaizen2600.com](https://api.dojokaizen2600.com) (dashboard user/password from `/opt/supabase/.env`).
2. Open **SQL Editor**.
3. Paste the migration file and run it.

Group chat:

```text
supabase/migrations/0010_group_chat.sql
```

### Or from SSH

```bash
docker exec -i supabase-db psql -U postgres -d postgres \
  < /var/www/dojokaizen/supabase/migrations/0010_group_chat.sql
```

## Local development

Copy `.env.example` to `.env.local` and use the **same** production API URL and anon key unless you run a local Supabase stack.

```
NEXT_PUBLIC_SUPABASE_URL=https://api.dojokaizen2600.com
NEXT_PUBLIC_SUPABASE_ANON_KEY=   # ANON_KEY from /opt/supabase/.env
SUPABASE_SERVICE_ROLE_KEY=       # SERVICE_ROLE_KEY from /opt/supabase/.env
```

Marketing pages work without these; admin, portals, chat, and the member app require them.

## Mobile Google sign-in

The Expo app uses the same Google **Web** OAuth client as the website. Google Cloud’s authorized redirect URI stays the Kong callback:

```
https://api.dojokaizen2600.com/auth/v1/callback
```

On the VPS Auth URL allow-list (Studio **Authentication → URL Configuration**, or `GOTRUE_URI_ALLOW_LIST` / `GOTRUE_ADDITIONAL_REDIRECT_URLS` in `/opt/supabase/.env`), include:

```
https://dojokaizen2600.com/auth/callback
dojokaizen://auth/callback
```

Keep the website callback. Add the `dojokaizen://` URI so Google sign-in can return to the Android/iOS app.

## Create a super admin (if needed)

```sql
UPDATE profiles SET role = 'SUPER_ADMIN' WHERE email = 'your@email.com';
```
