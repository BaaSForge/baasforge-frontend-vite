# Contributing

BaaSForge was previously named BAAL. Use `BaaSForge` in all new code and documentation.

1. Use Node.js 22.17.0: `nvm use`.
2. Install dependencies: `npm install && npm install --prefix docs-site`.
3. Create a focused branch and make the change.
4. Run the checks below.
5. Update documentation when behavior or setup changes.
6. Open a pull request with the purpose, main changes, and test results.

## Checks

There are no test files or test runner. `npm test` is a type check (`tsc --noEmit`), not an automated test suite.

Husky installs with `npm install` and runs:

- Commit: `npm test`.
- Push: `npm run lint:strict`.

These hooks do not run Prettier, production builds, or the docs build. Before you commit or push, run:

```bash
npm run format
npm run build
npm run build --prefix docs-site
```

`npm run format` changes supported files under `src/`. `npm run build` runs TypeScript, ESLint with zero warnings, the Vite client and SSR builds, and static prerendering. ESLint excludes `docs-site/` and `src/components/ui/`. The final command validates and exports the docs.

The deployment workflow repeats both builds inside Docker. There is no pull-request CI or Prettier check.

## Modal convention

Use the centric modal stack from `@/components/ui/centric-modal` for user-facing dialogs and sheets. Do not build new flows with raw `Dialog` or `DialogContent` from `@/components/ui/dialog`.

Centric modal provides the shared `max-h-[80dvh]` shell, a scrollable body with edge fades, and a mobile drawer.

Do not give `CentricModalContent` block-size classes such as `h-*`, `min-h-*`, `max-h-*`, or `size-full`. Width classes such as `sm:max-w-2xl` are allowed. Invalid development values throw an error.

See `src/components/ui/centric-modal.tsx`, `src/modules/project/components/release-notes-modal.tsx`, and `src/modules/project-chat/components/chat-sessions-list-modal/index.tsx`.

## Documentation

Edit pages in `docs-site/app/**/page.mdx`. Update `docs-site/app/_meta.global.tsx` when you add, remove, rename, or reorder a page. See [README.md](./README.md#documentation) for development and production URLs.

For setup, environment, Docker, Nginx, and deployment details, see [README.md](./README.md).
