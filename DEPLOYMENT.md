# Deployment Guide (Vercel + Supabase)

## Prerequisites
- Vercel account with access to the Git repo
- Supabase project with the schema and auth tables created (run the SQL in [supabase/migrations/001_create_schema.sql](supabase/migrations/001_create_schema.sql) or [COMPLETE_DATABASE_SETUP.sql](COMPLETE_DATABASE_SETUP.sql))
- Environment variables ready from Supabase → Settings → API

## Required environment variables
Set these in Vercel Project Settings → Environment Variables (apply to `Production`, `Preview`, and `Development`):
- `VITE_SUPABASE_URL` – your Supabase project URL (https://xxxx.supabase.co)
- `VITE_SUPABASE_ANON_KEY` – your anon public API key

## Prepare Supabase for production
- Run the migrations so all tables exist before first deploy.
- In Supabase → Authentication → URL Configuration, add your production domain (e.g., `https://gearguard-eosin.vercel.app`) and preview domain (`https://*.vercel.app`) to the allowed redirect URLs.
- If you enable email confirmations or password reset flows later, set the site URL to the production domain so Supabase emails link to the right host.

## Deploy with the Vercel dashboard (recommended)
1. Push the main branch to GitHub.
2. In Vercel, click **Add New Project** → **Import Git Repository** and select this repo.
3. Framework preset: **Vite**. Root directory: project root (leave blank). Install command: `npm install`. Build command: `npm run build`. Output directory: `dist`.
4. Add the environment variables listed above.
5. Click **Deploy**. Vercel will build and give you a preview URL. Promote to production when ready.

## Deploy with the Vercel CLI (optional)
```bash
npm install -g vercel
vercel login
vercel link   # select the project
vercel env pull .env.local  # optional: sync envs
vercel --prod
```
Make sure `.env.local` contains `VITE_SUPABASE_URL` and `VITE_SUPABASE_ANON_KEY` before running `vercel --prod`.

## Post-deploy checks
- Open the deployed URL and confirm the app loads without console errors.
- Verify auth: create an account or log in with an existing one; confirm redirects complete on the Vercel domain.
- Create equipment, teams, and maintenance requests to ensure the Supabase connection works (rows should appear in your Supabase tables).
- If anything fails, re-check the Vercel environment variables and that your Supabase redirect URLs include the deployed hostname.
