# Cloudflare Pages deployment

This package is a static Create React App deployment target. There is no backend server.

Use these settings for Cloudflare Pages Git integration:

- Root directory: `/`
- Build command: `npm run build`
- Build output directory: `build`
- Deploy command: leave blank for Pages Git integration
- Build variables: none required

Do not use `npx wrangler deploy` for a Cloudflare Pages Git deployment. That command targets Workers deployment. If you are using Wrangler Direct Upload instead of Git integration, build first and deploy the build folder with:

```bash
npm install
npm run build
npx wrangler pages deploy build
```

The `build` script sets `CI=false` because Create React App otherwise treats warnings as hard build failures in Cloudflare's CI environment. A strict CI equivalent is available as:

```bash
npm run build:strict
```

SPA routing note: this package intentionally has no top-level `public/404.html`. Cloudflare Pages will then serve the React app for unknown client-side routes.
