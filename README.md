# Mintcom Website

Vite/React website for Mintcom public pages, web content, downloadable assets, and deployment-facing frontend workflows.

## Setup

```powershell
npm install
```

## Development

```powershell
npm run dev
```

## Build

```powershell
npm run build
```

## Tests

```powershell
npm test
npm run test:e2e
```

## Deploy

Production is a **Cloudflare Worker** (`wrangler.toml`). Pushes to `main` auto-deploy via GitHub Actions once secrets are set — see [docs/CLOUDFLARE_DEPLOY.md](docs/CLOUDFLARE_DEPLOY.md).

Manual:

```bash
npm run deploy
```

Required once: `npx wrangler login` (or `CLOUDFLARE_API_TOKEN` + `CLOUDFLARE_ACCOUNT_ID` in the environment / GitHub Actions secrets).

## Notes

This folder replaces the old `PaymintWebsite` path. The npm package is `mintcom-website`.

