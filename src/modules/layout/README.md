# Layout module

App-specific layout lives here so that **`src/components` stays shadcn-only** and can be updated with `npx shadcn@latest add ...` without overwriting your customizations.

## Convention

- **`src/components`** – Only shadcn UI primitives (`ui/`) and registry blocks. Do not add app-specific logic here; treat it as upstream.
- **`src/modules/layout`** – Your app shell and sidebar. Clone or compose from `@/components` (e.g. `ui/sidebar`). Edit freely.

### When you need to modify a component from `src/components`

1. **Copy** it into this module (e.g. `src/modules/layout/components/`).
2. **Refactor** all usages to import from the new location.
3. **Remove** the original file from `src/components`.

This keeps `src/components` pristine for shadcn registry updates while giving you full control over customized components.

## Usage

- **`AppShell`** – Full layout with sidebar + main area. Use as the route element for authenticated app routes.
- **`AppSidebar`** – Sidebar only (e.g. if you need a different shell).
- **`ProjectSwitcher`** – Project switcher in the sidebar header (customized from shadcn’s TeamSwitcher).
- **`NavMain`** – Main navigation with collapsible items (copied from shadcn).
- **`NavProjects`** – Project links section in the sidebar (copied from shadcn).
- **`NavUser`** – User menu in the sidebar footer (copied from shadcn).

Both import from `@/components`; only the composition, data, and customized copies live in this module.
