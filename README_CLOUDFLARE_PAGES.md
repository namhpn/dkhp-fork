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

## Cloudflare Workers Builds / Pages deploy command

If the Cloudflare UI requires a deploy command, use:

```txt
npm run deploy
```

The deploy script uploads the generated `build/` directory with Wrangler Pages:

```bash
npx wrangler pages deploy build --project-name=${CLOUDFLARE_PAGES_PROJECT_NAME:-dkhp-fork} --branch=${CF_PAGES_BRANCH:-main}
```

Default project name is `dkhp-fork`. If your actual Cloudflare Pages project slug is different, set a build variable named `CLOUDFLARE_PAGES_PROJECT_NAME` to that slug, or edit the script in `package.json`.

Recommended settings:

```txt
Root directory: /
Build command: npm run build
Build output directory: build
Deploy command: npm run deploy
Build variables: optional CLOUDFLARE_PAGES_PROJECT_NAME if project slug is not dkhp-fork
```
