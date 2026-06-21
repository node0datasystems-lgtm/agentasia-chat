---
name: react
description: 'AgentAsia React component conventions. Use when editing TSX UI, choosing base-ui vs @agentasia/ui vs antd, styling with antd-style, routing, desktop variants, layouts, or component state.'
user-invocable: false
---

# React Component Writing Guide

## Styling

| Scenario                                                   | Approach                                                       |
| ---------------------------------------------------------- | -------------------------------------------------------------- |
| Most cases                                                 | `createStaticStyles` + `cssVar.*` (zero-runtime, module-level) |
| Simple one-off                                             | Inline `style` attribute                                       |
| Truly dynamic (JS color fns like `readableColor`/`chroma`) | `createStyles` + `token` — **last resort**                     |

## Component Priority

1. **`src/components`** — project-specific reusable components
2. **`@agentasia/ui/base-ui`** — headless primitives. **If the component lives here, use it. Do NOT import the same-named root export.**
3. **`@agentasia/ui`** — higher-level / antd-wrapping components (only when no base-ui equivalent)
4. **antd** — only when neither base-ui nor `@agentasia/ui` root provides it
5. **Custom implementation** — true last resort

If unsure about available components, search existing code or check `node_modules/@agentasia/ui/es/index.mjs` and `node_modules/@agentasia/ui/es/base-ui/`.

### `@agentasia/ui/base-ui` — always prefer for these

| Component                                  | Import                                                                                                  |
| ------------------------------------------ | ------------------------------------------------------------------------------------------------------- |
| `Select` (+ `SelectProps`, `SelectOption`) | `import { Select } from '@agentasia/ui/base-ui';`                                                         |
| `Modal` (imperative API)                   | `import { createModal, confirmModal, useModalContext, type ModalInstance } from '@agentasia/ui/base-ui';` |
| `DropdownMenu`                             | `import { DropdownMenu } from '@agentasia/ui/base-ui';`                                                   |
| `ContextMenu`                              | `import { ContextMenu } from '@agentasia/ui/base-ui';`                                                    |
| `Popover`                                  | `import { Popover } from '@agentasia/ui/base-ui';`                                                        |
| `ScrollArea`                               | `import { ScrollArea } from '@agentasia/ui/base-ui';`                                                     |
| `Switch`                                   | `import { Switch } from '@agentasia/ui/base-ui';`                                                         |
| `Toast`                                    | `import { Toast } from '@agentasia/ui/base-ui';`                                                          |
| `FloatingSheet`                            | `import { FloatingSheet } from '@agentasia/ui/base-ui';`                                                  |

For Modal specifically, see the dedicated **modal** skill — use the imperative `createModal({ content: … })` pattern over the legacy `<Modal open … />` declarative pattern. base-ui has its own `ModalHost` already mounted in `SPAGlobalProvider`.

> Common slip: `import { Select } from '@agentasia/ui'` looks fine but it's the antd-backed Select. Use base-ui Select. Same for `Modal`, `DropdownMenu`, etc.

### `@agentasia/ui` root — use when base-ui has no equivalent

| Category     | Components                                                                            |
| ------------ | ------------------------------------------------------------------------------------- |
| General      | ActionIcon, ActionIconGroup, Block, Button, Icon                                      |
| Data Display | Avatar, Collapse, Empty, Highlighter, Markdown, Tag, Tooltip                          |
| Data Entry   | CodeEditor, CopyButton, EditableText, Form, Input, InputPassword, SearchBar, TextArea |
| Feedback     | Alert, Drawer                                                                         |
| Layout       | Center, DraggablePanel, Flexbox, Grid, Header, MaskShadow                             |
| Navigation   | Burger, Menu, SideNav, Tabs                                                           |

## Loading indicators

**Do NOT use antd `Spin` / `<Spin />`.** Use a project loader
(`NeuralNetworkLoading`, `DotsLoading`, …) — see the **ux** skill ("Loading
visuals") for the component table and when to use each.

## State

When a feature component manages more than 3 pieces of state (`useState`/`useReducer`/derived state), extract the logic into a custom hook (e.g. `useXxx`). Keep the component focused on rendering — the hook holds state and handlers, so logic can be unit-tested without rendering the component.

## Layout

Use `Flexbox` and `Center` from `@agentasia/ui`. See `references/layout-kit.md` for full props and examples.

- Use `gap` instead of `margin` for spacing between flex children
- Use `flex={1}` to fill available space
- Nest Flexbox for complex layouts; set `overflow: 'auto'` for scrollable regions

## Navigation

**For SPA pages, use `react-router-dom`, NOT `next/link`.**

```tsx
// ❌ Wrong
import Link from 'next/link';

// ✅ Correct
import { Link, useNavigate } from 'react-router-dom';
```

Access navigate from stores: `useGlobalStore.getState().navigate?.('/settings');`

## Desktop File Sync Rule

Files with a `.desktop.ts(x)` variant must be edited **in sync**. Drift causes blank pages in Electron.

| Base file (web)            | Desktop file (Electron)            |
| -------------------------- | ---------------------------------- |
| `desktopRouter.config.tsx` | `desktopRouter.config.desktop.tsx` |
| `componentMap.ts`          | `componentMap.desktop.ts`          |

**After editing any `.ts`/`.tsx`:** glob for `<filename>.desktop.{ts,tsx}` in the same directory. If found, apply the equivalent sync-import change.

## Routing Architecture

| Route Type         | Use Case   | Implementation                                     |
| ------------------ | ---------- | -------------------------------------------------- |
| Next.js App Router | Auth pages | `src/app/[variants]/(auth)/`                       |
| React Router DOM   | Main SPA   | `desktopRouter.config.tsx` + `.desktop.tsx` (pair) |

Router utilities:

```tsx
import { dynamicElement, redirectElement, ErrorBoundary } from '@/utils/router';
element: dynamicElement(() => import('./chat'), 'Desktop > Chat');
element: redirectElement('/settings/profile');
errorElement: <ErrorBoundary />;
```

## Common Mistakes

| Mistake                                                            | Fix                                                                         |
| ------------------------------------------------------------------ | --------------------------------------------------------------------------- |
| Using `next/link` in SPA                                           | Use `react-router-dom` `Link`                                               |
| Using antd directly                                                | Use `@agentasia/ui/base-ui` first, then `@agentasia/ui`                         |
| antd `Spin` / `<Spin />` for loading                               | Use `NeuralNetworkLoading` / project loaders (see the **ux** skill)         |
| `import { Select } from '@agentasia/ui'`                             | `import { Select } from '@agentasia/ui/base-ui'`                              |
| `import { Modal } from '@agentasia/ui'` + `<Modal open>` declarative | `createModal` / `confirmModal` from `@agentasia/ui/base-ui` (see modal skill) |
| `import { DropdownMenu/Popover/Switch } from '@agentasia/ui'`        | Import same name from `@agentasia/ui/base-ui` instead                         |
| `createStyles` for static styles                                   | Use `createStaticStyles` + `cssVar`                                         |
| Editing only `desktopRouter.config.tsx`                            | Must edit both `.tsx` and `.desktop.tsx`                                    |
| Using `margin` for flex spacing                                    | Use `gap` prop on Flexbox                                                   |
| Accessing zustand store without selector                           | Use selectors to access store data (see zustand skill)                      |
| Text or icon-text actions built with `Flexbox`/`Text` + `onClick`  | Use `Button type={'text'} size={'small'}` with `icon` when needed           |
