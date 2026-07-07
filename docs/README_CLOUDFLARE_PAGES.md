# Cloudflare Pages deployment

Static Create React App package. No backend server.

Recommended settings for the Cloudflare UI you are using:

```txt
Root directory: /
Build command: npm run build
Build output directory: build
Deploy command: npm run deploy
```

The deploy script uploads the generated `build/` folder with Wrangler Pages:

```bash
npx wrangler pages deploy build --project-name=${CLOUDFLARE_PAGES_PROJECT_NAME:-dkhp-fork} --branch=${CF_PAGES_BRANCH:-main}
```

If your Cloudflare Pages project slug is not `dkhp-fork`, set this build variable:

```txt
CLOUDFLARE_PAGES_PROJECT_NAME=your-project-slug
```

The API token used by Wrangler must allow Pages deploys:

```txt
Account → Cloudflare Pages → Edit
User → User Details → Read
```

Do not use `npx wrangler deploy`; that targets Workers, not Pages static assets.
