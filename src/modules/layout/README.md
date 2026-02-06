# Layout module

App-specific layout lives here so that **`src/components` stays shadcn-only** and can be updated with `npx shadcn@latest add ...` without overwriting your customizations.

## Convention

- **`src/components`** – Only shadcn UI primitives (`ui/`) and registry blocks. Do not add app-specific logic here; treat it as upstream.
- **`src/modules/layout`** – Your app shell and sidebar. Clone or compose from `@/components` (e.g. `NavMain`, `TeamSwitcher`, `ui/sidebar`). Edit freely.

## Usage

- **`AppShell`** – Full layout with sidebar + main area. Use as the route element for authenticated app routes.
- **`AppSidebar`** – Sidebar only (e.g. if you need a different shell).

Both import from `@/components`; only the composition and data live in this module.
