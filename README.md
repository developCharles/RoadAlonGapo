# RoadAlongapo

Civic infrastructure & mobility reporting app for Olongapo City.
React + Vite + Tailwind front end, Supabase backend (auth, database, storage, realtime).

## Portals

| Role | Route | What it does |
| --- | --- | --- |
| Citizen | `/` | Map, file hazard reports, upvote, track own reports |
| Barangay official | `/barangay` | Verify / reject reports, escalate to engineering, messages |
| City engineer | `/engineer` | Assign crews, update repair stages, resolve tasks, messages |
| Admin | `/admin` | Admin shell (approvals/user management next) |

Without Supabase env vars the app runs in **demo mode** with sample data stored in the browser.

## 1. Local setup

```bash
npm install
cp .env.example .env
npm run dev
```

Open the URL Vite prints (usually `http://localhost:5173`).
Leave `.env` empty to preview the demo portals.

## 2. Supabase setup (fresh project)

1. Create a project at <https://supabase.com/dashboard>.
2. Open **SQL Editor** and run the whole of [`supabase/schema.sql`](supabase/schema.sql).
   This creates tables, triggers, RLS policies and the `report-images` / `official-documents` buckets.
3. Copy **Project Settings → API** values into `.env`:

   ```env
   VITE_SUPABASE_URL=https://YOUR-PROJECT.supabase.co
   VITE_SUPABASE_ANON_KEY=YOUR-ANON-KEY
   ```

4. **Authentication → URL Configuration**
   - Site URL: your deployed URL (or `http://localhost:5173` while developing)
   - Redirect URLs: `http://localhost:5173/**` and `https://YOUR-DOMAIN/**`
5. **Authentication → Providers → Email**: decide whether email confirmation is required.
   For quick testing, disable “Confirm email”.
6. Create the first admin:
   - **Authentication → Users → Add user** (email + password).
   - In SQL Editor:
     ```sql
     update public.profiles
       set role = 'admin', status = 'active', password_changed = true
       where email = 'you@example.com';
     ```
7. Restart `npm run dev`.

## 3. Deploy to Netlify

`netlify.toml` is already configured:

- Build command: `npm run build`
- Publish directory: `dist`
- SPA redirect: all routes → `index.html`

### Option A — Dashboard (recommended)

1. Push this folder to GitHub (already done if you followed step 1).
2. In Netlify: **Add new site → Import an existing project → GitHub**.
3. Pick the `RoadAlonGapo` repository.
4. Confirm the build settings (they come from `netlify.toml`):
   - Build command: `npm run build`
   - Publish directory: `dist`
5. Add Environment Variables (all scopes):
   - `VITE_SUPABASE_URL`
   - `VITE_SUPABASE_ANON_KEY`
6. Click **Deploy site**.
7. Copy the site URL (e.g. `https://roadalongapo.netlify.app`) and add it to
   Supabase **Authentication → URL Configuration**:
   - Site URL: the Netlify URL
   - Redirect URLs: `https://YOUR-SITE.netlify.app/**`

### Option B — CLI

```bash
npx netlify-cli login
npx netlify-cli init          # link this folder to a site
npx netlify-cli env:import .env
npx netlify-cli deploy --prod
```

## 4. Domain / HTTPS

Netlify gives you `https://<site>.netlify.app` automatically. Add a custom domain under
**Site configuration → Domain management**, then update the Supabase Auth URLs to the custom domain.

## Notes

- `VITE_*` variables are embedded in the browser bundle. Only ever use the **anon/public** key, never the service-role key.
- Report images are public (`report-images` bucket). Official ID documents are private (`official-documents`) and readable by the owner or an admin.
- Admin provisioning and official-request approval use normal authenticated calls; for bulk user creation use the Supabase dashboard or an Edge Function with the service role.
