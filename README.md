# One Link Design System

Tokens, components and screen references for **One Link**, United African Grain's operating layer, on the web and on mobile.

- Web app: [united-african-grain/one-link](https://github.com/united-african-grain/one-link)
- Mobile app: [united-african-grain/one-link-mobile](https://github.com/united-african-grain/one-link-mobile)
- Jira: project `UAG`

Nothing has been published here yet.

## Design DNA

Decided on 13 September 2026. These hold for every One Link surface, web and mobile, and
anything drawn here must follow them.

### Type: Geist

[Geist](https://vercel.com/font) by Vercel for everything, and **Geist Mono** for figures,
references and codes. It is self-hosted, never fetched from a CDN at runtime:

- **Web:** `@fontsource-variable/geist` and `@fontsource-variable/geist-mono`, the variable
  fonts, so every weight from 100 to 900 is real.
- **Mobile:** the Geist font files bundled as app assets, because the field app has to
  render offline.

### Icons: Lucide

[Lucide](https://lucide.dev/icons/) is the only icon set. There are no emoji or Unicode
glyphs standing in for icons, and no second set.

- **Web:** `@lucide/angular` through the app's single `<uag-icon>` component.
- **Mobile:** `lucide_icons_flutter`, the same package the other Obsydian mobile apps use.

Icons follow a fixed vocabulary, so one meaning has one icon everywhere. The canonical
table is "Icon vocabulary" in the web app's
[CLAUDE.md](https://github.com/united-african-grain/one-link/blob/dev/CLAUDE.md). Two
entries matter most: **provenance** (how a weight was captured) is `contrast`, and
**confirmation** (whether the counterparty agrees) is `diamond`. They are separate
dimensions and are never merged.

## For coding agents

The web app currently carries its own tokens: the `--uag-*` custom properties in `src/styles/` and the PrimeNG preset in `src/app/core/config/uag-theme.config.ts`. Until this repo holds a system, **the web app is the source of truth**. Once it does, colour, spacing and typography are introduced here first. When the app and this repo diverge, the app wins and the change is backported here.

## Layout

The canvas and its CSS will live in `project/`, which is what gets published.
