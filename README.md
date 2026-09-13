# One Link Design System

Tokens, type, motion, components and screens for **One Link**, the grain trading and warehousing platform: the web app, the mobile app, the partner portal and the field app.

**Live: [united-african-grain.github.io/one-link-design-system](https://united-african-grain.github.io/one-link-design-system/)**. It reads on a phone as well as on a desktop.

| What | Where |
|---|---|
| **The design system** | [Landing page](https://united-african-grain.github.io/one-link-design-system/): rules, colour, type, shape, motion, live components, screens |
| **Screens** | [Desktop app](https://united-african-grain.github.io/one-link-design-system/ui_kits/one_link/) · [mobile app](https://united-african-grain.github.io/one-link-design-system/ui_kits/one_link_mobile/) · [partner portal](https://united-african-grain.github.io/one-link-design-system/ui_kits/partner_portal/) · [field app](https://united-african-grain.github.io/one-link-design-system/ui_kits/field_app/) |
| Tokens, the source of truth for code | [`project/tokens/`](project/tokens), imported together by [`project/styles.css`](project/styles.css) |
| Components | [`project/components/`](project/components): React primitives, each with a `.d.ts` and a usage note |
| Content and visual rules | [`project/readme.md`](project/readme.md) |
| Skill for coding and design agents | [`project/SKILL.md`](project/SKILL.md) |

Web app: [united-african-grain/one-link](https://github.com/united-african-grain/one-link) · Mobile app: [united-african-grain/one-link-mobile](https://github.com/united-african-grain/one-link-mobile)

---

## For coding agents

**Read `project/tokens/` and `project/readme.md` before introducing any colour, type, spacing, radius, shadow or motion in One Link.** Components use semantic tokens only (`--surface`, `--content-primary`, `--border`…), never a palette step or a hex.

### The rules that govern everything

These come from how the business works. Every component and screen obeys them.

1. **Exceptions are the interface.** Screens lead with what needs attention. "Nothing needs your attention" is a designed state. Show changes, not levels.
2. **Every figure is derived, and can show how.** Balances, stock, exposure, coverage and margin are computed, never typed. A headline figure opens its derivation.
3. **Provenance and confirmation never merge.** How a weight was captured (`contrast`) and whether the counterparty agrees (`diamond`) are two separate chips.
4. **Absent is not zero.** A figure withheld from a role is a quaternary dash with `eye-off`, never K0, blank, loading or blurred.
5. **Three outcomes, three looks.** Within tolerance books. Held for review goes to the owner. A hard block (tare above gross) never books, and is shown calmly.
6. **Nothing is edited.** Corrections are compensating entries with a reason, an actor and a time, beside the original.
7. **Freshness is visible, degraded modes are loud.** Sync health is always shown; a silent feed is unmistakable; offline is a state with a queue.
8. **Every working button shows it is working.** The label fades and scales to 0.8 over 500ms on the spring while a spinner takes its place. The button keeps its size and stays busy until the action lands. Every platform.
9. **Status is an icon and a word**, never colour alone.
10. **The commodity takes over.** Brand blue `#2563EB` is for links and entry points. Inside a commodity, its colour drives share bars, chart lines and the trade ticket. Decisions (Approve, Finalise, Resolve) stay primary dark.

### Type

- **Inter** (variable, `wght` and `opsz`) for everything you read: 480 regular, 540 regular headings, 580 strong, 600 strong headings, features `cv02 cv07 ss04 cv15 calt`, headings add `cv09` and `opsz 14`.
- **Instrument Sans condensed** (75% width, 700, uppercase) for headline figures, commodity tabs and detail titles.
- **Every figure is tabular**: money, tonnes, percentages, refs, timestamps. No monospace.
- Kwacha millions take M (`K125M`, `K11.8M`); smaller amounts use full digits (`K174,840`), never `K175k`. USD in farmer finance. Tonnes `28.20t`.

### Icons

**Lucide only.** No emoji, no Unicode symbols standing in for icons, no second set. The vocabulary is fixed, so one meaning has one icon everywhere; the table is in [`project/readme.md`](project/readme.md) under Iconography.

### Charts

**TradingView Lightweight Charts v5.** White background, dotted horizontal grid, magnet crosshair with `#23272d` labels, 2px lines in the commodity colour (brand for money), end-of-line labels, dashed policy lines. Keep `attributionLogo` on, and keep a visible "Charts by TradingView" link: the Apache 2.0 licence requires the NOTICE attribution and a link to tradingview.com.

### Colour decisions worth knowing

- **Brand ramp:** built from `#2563EB` at the reference theme's lightness per step, so 500 is `#2563EB`.
- **AA fixes on text:** warning text is `#a16207`, not `#ca8a04` (2.9:1). Up-delta text is `#007e26`, not `#04af52` (2.9:1). `#04af52` is used only for fills.
- **Commodity colours** carry white labels at AA or better: maize `#C2410C` (5.2:1), wheat `#7A6937` (5.4:1), soya `#5A7A1E` (5.0:1), soya meal `#8A5A36` (5.8:1), fertilizer `#7A3FB8` (6.5:1).

---

## Adopting it

### Web app (Angular)

The web app vendors the tokens from `project/tokens/`. When it adopts this system:

- **Tokens.** Replace the flat `--uag-*` names in `src/styles/_tokens.scss` with the semantic tokens here.
- **Type.** Moving from Geist to Inter and Instrument Sans means updating the app's `npm run verify:design` check and its `CLAUDE.md`, which currently enforce Geist.
- **Icons.** Nothing changes: the `<uag-icon>` registry already draws Lucide data from `lucide` 1.39.
- **Charts.** Chart.js gives way to `lightweight-charts` 5.2.

### Mobile (Flutter)

The mobile app is a sibling, not a second system: the same tokens, semantics and voice.

- **Type.** Bundle Inter and Instrument Sans as font assets (SIL OFL). Never fetch fonts at runtime, because the field app renders offline.
- **Icons.** `lucide_icons_flutter`, the same package the other Obsydian mobile apps use.
- **Field app.** Offline first: never block the person in front of you. Commit actions sit in the bottom third, and offline shows a queue count, not an error.

---

## Building and publishing

```bash
npm ci
npm run preview        # builds dist/ and serves it at http://localhost:4400
```

`project/` is the Claude Design export and stays the source. `scripts/build.mjs` makes it fast on a phone:

- **Components:** compiled once into `_ds_bundle.js`, with each UI kit's screens bundled beside its page.
- **Pages:** switched to production React with Babel removed, so nothing compiles in the browser.
- **Landing page:** built from `site/`, with every token table generated from `project/tokens`, so the page cannot disagree with the CSS.

Pushing to `main` builds and deploys GitHub Pages (`.github/workflows/pages.yml`).

### Re-exporting from Claude Design

1. Replace `project/` with the new export.
2. Keep sample data fictional, and the product named One Link.
3. Run `npm run preview` and check the landing page and every kit at desktop and phone widths.

A new card only needs its `@dsCard` comment to appear on the landing page.

---

## Source layout

```
project/                 ← the Claude Design export, the design system itself
├── styles.css           ← imports every token file; start here for code
├── tokens/              ← colors, typography, shape, motion, spacing, fonts, base
├── guidelines/          ← foundation specimen cards
├── components/          ← React primitives (.jsx, .d.ts, .prompt.md) and their cards
├── ui_kits/             ← one_link (desktop), one_link_mobile, partner_portal, field_app
├── readme.md            ← content rules, visual foundations, iconography
└── SKILL.md             ← agent skill entry point
site/                    ← landing page template and live demos
scripts/                 ← build, landing renderer, local server
```

## Attribution

- **Visual craft** is adapted from a public light theme. No third-party names, marks, copy or imagery are used, and all sample data is fictional.
- **Icons:** [Lucide](https://lucide.dev), ISC.
- **Type:** [Inter](https://rsms.me/inter/) and [Instrument Sans](https://fonts.google.com/specimen/Instrument+Sans), SIL Open Font License.
- **Charts:** TradingView Lightweight Charts™, Copyright (c) 2025 TradingView, Inc., [tradingview.com](https://www.tradingview.com/), Apache License 2.0.
