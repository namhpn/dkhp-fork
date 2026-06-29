# Cloudflare Pages deployment

This project is prepared for Cloudflare Pages as a Create React App static SPA.

Build settings:

- Framework preset: Create React App, or None/custom
- Build command: `npm run build`
- Build output directory: `build`
- Root directory: repository root of this ZIP

The `public/_redirects` file is included so Cloudflare Pages serves `index.html` for client-side routes.
The old `public/404.html` GitHub Pages fallback was removed because it conflicts with Cloudflare Pages SPA fallback behavior.
