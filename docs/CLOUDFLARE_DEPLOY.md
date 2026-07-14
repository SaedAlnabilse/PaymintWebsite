# Cloudflare deploy (auto on push to `main`)

This site is a **Cloudflare Worker** (`name = "mintcom"` in `wrangler.toml`) that serves the Vite `dist/` assets.  
Pushing to GitHub alone does **not** update production until Wrangler deploys.

## Auto-deploy (GitHub Actions)

Workflow: `.github/workflows/deploy-cloudflare.yml`

Runs on every push to **`main`** (and manual “Run workflow”).

### 1. Create a Cloudflare API token

1. https://dash.cloudflare.com/profile/api-tokens  
2. **Create Token** → use **Edit Cloudflare Workers** template (or custom):
   - Account → Workers Scripts → Edit  
   - Account → Account Settings → Read (if required by the template)  
3. Copy the token once.

### 2. Find Account ID

Cloudflare dashboard → any domain/worker → **Account ID** in the right sidebar  
(or Workers overview).

### 3. Add GitHub repository secrets

Repo **SaedAlnabilse/mintcom-website** → **Settings → Secrets and variables → Actions → Secrets**:

| Secret | Value |
|--------|--------|
| `CLOUDFLARE_API_TOKEN` | token from step 1 |
| `CLOUDFLARE_ACCOUNT_ID` | account id from step 2 |

Without these, the deploy job will fail (and Cloudflare will not update).

### 4. Edge secrets (never commit)

```bash
cd mintcom-website
npx wrangler login   # once on your machine
npx wrangler secret put QA_ACCESS_KEY
# paste a long random string, e.g. openssl rand -hex 32
```

Optional public vars (dashboard or `wrangler.toml` `[vars]` only for non-secrets):

- `MAINTENANCE_MODE` = `true` \| `false`  
- `API_TARGET` = Railway API origin  

### 5. Maintenance bypass (production)

1. Set `MAINTENANCE_MODE=true` on the Worker (Cloudflare dashboard Variables).  
2. Set secret `QA_ACCESS_KEY`.  
3. Open: `https://mintcompos.com/qa-access?key=YOUR_SECRET`  
4. Worker validates the key, sets an **HttpOnly signed cookie**, redirects home.  
5. The bypass key is **not** in the public JS bundle.

### 6. Manual deploy (local)

```bash
cd mintcom-website
npx wrangler login
npm run deploy
```

## Security notes

- Do **not** put `QA_ACCESS_KEY` / API tokens in `wrangler.toml` or git.  
- The old key that lived in `wrangler.toml` is **revoked by removal** — set a **new** secret with `wrangler secret put`.  
- `API_TARGET` and GA measurement IDs are public frontend/edge config, not credentials.
