# Contributing

## Platform API assumptions

The backend and product model treat **production as having a single runtime per project** (unlike stage, where several runtimes may exist). The release-controller UI therefore opens the **stage** runtime picker for stage deploy/swap, but uses a **confirm dialog** and deploys to the first (and expected only) production runtime without asking the user to pick a target.

## Modals

Use the **centric modal** stack from `@/components/ui/centric-modal` (`CentricModal`, `CentricModalContent`, `CentricModalHeader`, `CentricModalTitle`, etc.) for user-facing dialogs and sheets.

Do **not** build new flows on raw `Dialog` / `DialogContent` from `@/components/ui/dialog`.

**Why:** Centric modal applies a shared shell height (`max-h-[80dvh]`), a scrollable body with top/bottom edge fades, and switches to a drawer on small screens.

**Sizing:** Do not pass Tailwind classes on `CentricModalContent` that set block-axis size (`h-*`, `min-h-*`, `max-h-*`, `size-full`, and similar). Width utilities such as `sm:max-w-2xl` are allowed. In development, invalid `className` values throw with a clear error.

**References:** `src/components/ui/centric-modal.tsx`; examples include `src/modules/project/components/release-notes-modal.tsx` and `src/modules/project-chat/components/chat-sessions-list-modal/index.tsx`.
