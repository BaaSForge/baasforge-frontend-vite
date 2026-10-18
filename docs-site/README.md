# BaaSForge Docs

Static [Nextra](https://nextra.site/) docs site.

Run all commands from `docs-site/`:

```bash
npm install
npm run dev            # http://localhost:1220/docs
npm run build          # static export → out/
npm run preview:ssr    # production-like static preview → http://localhost:1221/docs
```

From the SPA repo root, the landing page links to `/docs` (proxied to `:1220` in Vite dev).

## Add a page

Create `app/your-page/page.mdx`, then register it in `app/_meta.global.tsx`. Use components from `nextra/components` when needed.
