# @goobits/ui

Reusable UI primitives for Svelte 5 projects — buttons, forms, layout shells,
navigation, and a showcase grid. Components are token-driven (consume CSS
custom properties from the host) and have no brand coupling.

## What's public

A single barrel export at `./src/index.ts`. Components are grouped by intent:

| Group | Examples |
| --- | --- |
| `buttons/` | `Button`, `PillButton` |
| `collections/` | `FilterableCollection`, `FilterChipGroup`, `SearchToolbar`, `SegmentedControl` |
| `content/` | `Hero`, `LegalPage`, `Prose`, `SitemapCategory` |
| `feedback/` | `ResultsEmpty`, `SuccessPage` |
| `forms/` | `FormField`, `FormControl`, `FormCheckbox`, `FormRadioGroup`, `FormSelect`, `FormTextarea`, `InlineField`, `NumberStepper`, `SearchField`, `TimeSelector` |
| `layout/` | `Card`, `PageClosing`, `PageContainer`, `PageShell`, `Section`, `SectionLabel` |
| `navigation/` | `Breadcrumbs`, `FooterNav`, `ShellNav`, `ThemeSelect`, `Topbar` |
| `showcase/` | `ShowcaseCard`, `ShowcaseCTA`, `ShowcaseGrid`, `ShowcaseHero`, `ShowcaseList`, `ShowcaseSection` |

The `types/` folder exports shared shapes (`NavItem`, etc.).

## How to extend

1. Add the component under the matching group folder (`src/<group>/MyComponent.svelte`).
2. Re-export it from that group's `index.ts`.
3. Re-export from `src/index.ts` so it's reachable via `@goobits/ui`.
4. If it's a brand-new group, create `src/<group>/index.ts` and add the group to the table above.

## Conventions

- Svelte 5 runes (`$props`, `$state`, `$derived`); BEM-style class names
  (`block__element--modifier`); breakpoints in `em` matching the site tier
  convention (30/40/48/64em).
- Components consume host design tokens (`--color-*`, `--spacing-*`, `--button-*`,
  `--text`, `--link`, etc.) — never hard-code colors or sizes when a token exists.
- Stay platform-agnostic: no SvelteKit-specific imports (`$app/...`, `$env/...`)
  inside primitives. If a component needs route awareness, take it as a prop.

## Resolution

`svelte.config.js` aliases `@goobits/ui` to `./packages/ui/src`, and the package
declares matching `main`/`svelte`/`exports`, so both alias-style and
package-style imports resolve to the same entry.
