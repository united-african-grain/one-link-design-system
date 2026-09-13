# One Link Design System

**One Link** is a single-tenant operating platform for a grain and fertilizer trader, warehouse operator and farmer input financier with about 80 staff. One Link gives the owner a morning view of position and margin, traders a board of trades and mill coverage, clerks fast weighbridge and goods-received capture, stock control a live stock board, and the programmes team a farmer credit book. Counterparties (farmers, mills, transporters) use a separate **Partner Portal**; drivers use an offline-first **field app**.

The visual system borrows the craft of a public light-theme teardown (white-on-white elevation, translucent navy greys, physical 3D press buttons, spring motion) but none of its identity. By the owner's request the **BETA badge** and the **colour palettes** from that reference are kept. No other marks, copy or motifs from it appear.

## Sources
- The One Link brief (pasted spec, §1–§8) — authoritative for every value here.
- Reference (orientation only): a public light-theme teardown; Inter (rsms.me/inter); Instrument Sans (Google Fonts); Lucide (lucide.dev); TradingView Lightweight Charts v5.
- **No logo file was supplied.** The mark in `Logo.jsx` is a typographic placeholder (dark rounded square with "OL"). Replace when the asset arrives.

## Surfaces
Desktop 1440 (shell max 1293) and mobile 390. Modules: Command Center · Trade Desk · Warehouse · Stock · Farmer Finance · Ask AI. Plus Partner Portal (no module row) and Field app (mobile only).

## Content fundamentals
- **Plain, matter-of-fact, sentence case.** Titles and buttons in sentence case (`New trade`, `Finalise GRN`, `Resolve case`). Uppercase only in condensed type (figures, commodity tabs, detail titles, severity tags).
- **Lead with what needs attention.** Every screen starts with a banner or "Needs you" rail. Empty is a good state: `Nothing needs your attention · Checked 07:02 · next digest 13:00`.
- **Every figure is derived, never typed** — say so on screen (`Nobody types a balance.`, `Every number here is derived from the ledger.`). Headline figures carry a derivation line.
- **Status = icon + word**, never colour alone: `circle-check Clean`, `triangle-alert Attention`, `circle-alert Breach`, `octagon-x Hard block`, `clock Awaiting`.
- **Provenance and confirmation are separate chips**: `contrast Synced` · `diamond check Confirmed`.
- **Degraded states are loud** but calm: `Weighbridge feed silent — position may look flat. Tickets can still be photographed.` A hard block explains physics (`tare cannot exceed gross`) with no red flood.
- Refs and IDs verbatim: `ZAM4702`, `GR10000377`, `T-0141`, `WBT10001605`. Meta lines are segments separated by 3px content-quaternary dots with 6px either side (`MetaParts`/`Dot`; a string meta splits on ` · `); `·` stays only inside free sentences. "You/your" addresses the user (`your position right now`). Portal copy is plainer still and never says "GRN" in a heading.
- **Numbers:** K125M / K11.8M above a million, full digits below (`K174,840`, never `K175k`); USD in farmer finance; tonnes `28.20t` / `2,000 MT`; percentages one decimal; times in CAT `Tue 24 Jun · 07:02`. Arrows between two values are text (`K400 → K360`); leading/trailing arrows are Lucide icons.
- No emoji. No exclamation marks. No marketing language.

## Visual foundations
- **Colour.** Page white; cards white on white separated only by soft shadows. Grey (`#f4f5f7` solid, `#00153f0b` translucent) marks secondary or off: search, unselected capsules, disabled fills, skeletons, closed records. Text/hairlines are navy-black at opacities (primary 86%, secondary 58%, tertiary 45% — never for a figure, quaternary 25%) with solid twins for use over photos. Two layers: components use semantic tokens only; those point at 11-step palettes (gray, gray-translucent, brand, green, red, yellow, teal, purple).
- **Brand blue `#2563EB`** for links, active stepper values, focus, entry-point buttons. **Commodity colours** (maize `#C2410C`, wheat `#7A6937`, soya `#5A7A1E`, soya meal `#8A5A36`, fertilizer `#7A3FB8`) take over inside a commodity context: share underlines, chart lines, active commodity tab, trade-ticket action. Decision buttons (Approve, Finalise, Resolve) stay primary dark `#23272d`.
- **Type.** Inter variable (family `InterVariable`, so 480/520/540/580/600 and opsz resolve) for everything you read (480/540/580/600; features cv02 cv07 ss04 cv15 calt; headings add cv09 + opsz 14). Instrument Sans condensed (700, stretch 75%, uppercase, "case") for headline figures, commodity tabs, detail titles. Every figure `tabular-nums`. No monospace.
- **Radius.** 2 · 4 · 6 · 8 · 10 · 12 · 14 · 16 · 20 · 24 · 32 · 999. Cards/tickets/dialogs 20; hover rows/tiles/banners 16; 40px buttons and search 12; 32px buttons 10; chips 8; severity tags/kbd 4; pills 999.
- **Elevation.** Six exact shadow stacks (flat, minimal, minimal-soft, middle, strong, dialog). Cards use minimal-soft; quantity chips middle; large actions and popovers strong.
- **Motion.** `spring` (overshoot 1.015) for tab underline (300ms), label↔spinner swaps (500ms), toggles; `expand` for sheets/accordions; card hover cubic-bezier(.2,.75,.25,1) 400ms in / 160ms out; default 150ms ease-out. 3D press 50ms down / 100ms up. Buttons scale .97, cards .99. Live dot ping 1.5s ease-out, scale 0 → 3.75 while fading. Reduced motion drops press scale and translate, the underline glide, sheet slide, loading-swap scale, share-bar growth and the ping (CSS vars + `usePrefersReducedMotion` from `core/Interaction.jsx`).
- **Hover.** Light fills mix 5% black; filled buttons mix 10% white (`color-mix(in srgb, …)`). Rows and rail rows fade in a grouped radius-16 surface. Cards with a commodity get a radial 9% wash from the left plus a conic border at 38–68%.
- **Press.** Anything that commits sits on a 4px edge and sinks into it. Every button that starts work shows a spinner in place (fixed size, not re-pressable) until the work lands.
- **Focus.** Keyboard focus only (`:focus-visible` semantics via `useInteraction`): 4px ring of the control's colour at 25%; segmented segments 3px; tabs an inset 2px ring.
- **Borders.** Hairlines `#00123719` (10%) and `#0000000f` (6%). Outline buttons use an inset 1px ring, not a CSS border.
- **Layout.** Shell 1293 max, padding 16/24. List pages: content + sticky 358px rail (320 from 1152) with 40px gap; below 1152 the rail stacks. Detail pages: content + 350px action panel; below 1024 it becomes a bottom sheet. Sections 24/32 apart, cards 16. Header 106 desktop (56 + 48), 116 mobile; bottom bar 70 + safe area. Header turns 80% white + 24px blur when content scrolls under.
- **Imagery.** Photos only as evidence (slips, probes, farm scale tickets) in 96×72 tiles; no decorative imagery, no illustration, no gradients beyond the commodity hover wash. Use solid grey twins for text over photos.
- **Charts.** TradingView Lightweight Charts v5 only: white background, dotted horizontal grid `rgba(0,18,55,.10)`, no scale borders, magnet crosshair with `#23272d` labels, attribution logo visible bottom-left. Line 2px in commodity colour (brand for money); area brand with 12% fill; baseline red above / green below a policy line; histogram in `#04af52` / out `#bfc3ca`. End-of-line HTML label: 8px dot + 4px halo, caption-1 name, heading-3-condensed value. Footer link `Charts by TradingView`.
- **Skeletons** in the exact footprint and radius; **empty states** centred with a green check; **restricted values** are a quaternary dash + eye-off — never blank, zero or loading.

## Iconography
- **Lucide only**, loaded from CDN: `https://unpkg.com/lucide@1.39.0/dist/umd/lucide.min.js`, rendered via `components/core/Icon.jsx` (`<Icon name="triangle-alert" />`). No other set, no emoji, no Unicode glyphs as icons. Icons paint in currentColor.
- Sizes: 20px in buttons and header (stroke 1.75); 16px inline with body-3 (stroke 2); 12–14px in captions and chips (stroke 2).
- Vocabulary (one meaning, one icon): check (done/within spec) · circle-check (good) · triangle-alert (attention) · circle-alert (breach) · octagon-x (hard block) · clock (awaiting) · contrast (provenance) · diamond + check/clock/triangle-alert (counterparty confirmation) · link · signal-high/medium/low (OCR confidence) · trending-up/down, minus · chevron-right (breadcrumb) · chevron-down (dropdown) · arrow-left/right · x · info · file-text / receipt / volume-2 / camera · pencil / rotate-ccw / refresh-cw · sparkles (AI) · search · bell (digest) · eye-off (restricted) · loader-circle (spinner).
- Modules: gauge (Command Center) · arrow-left-right (Trade Desk) · warehouse · package (Stock) · hand-coins (Farmer Finance) · sparkles (Ask AI).
- No logo or illustration assets were supplied; `assets/` is empty by design.

## Index
- `styles.css` → `tokens/` (fonts, colors, typography, shape, motion, spacing, base). Typography also ships `.t-*` utility classes.
- `guidelines/` — foundation specimen cards (Colors, Type, Shape, Motion, Spacing, Icons, Brand).
- `components/` — React primitives, each with `.d.ts` and `.prompt.md`, one card per directory:
  - `core/` Icon, Interaction (useInteraction, usePrefersReducedMotion, useMediaQuery, useMinWidth, useElementWidth), Text (+textStyle), Avatar (incl. commodity tile), Logo (with BETA)
  - `actions/` Button, PressButton + PressToggle (3D), Capsule + CapsuleGroup, Segmented, LineStepper
  - `inputs/` SearchField
  - `navigation/` Header (+MODULES), Tabs, CommodityTabs (+COMMODITY_COLORS), SyncStatus, MobileShell
  - `feedback/` Banner, StatusMark, ProvenanceChip + ConfirmationChip, SeverityTag, EmptyState, Skeleton + CardSkeleton, Dialog (sheet)
  - `data/` Card + CardRow + Dot + MetaParts, QuantityChip, ShareBar, Figure (derivation popover), RailRow, DataTable (+RestrictedCell, DerivedCell, RefCell), ChartCard (+ChartAttribution)
  - `records/` ActionPanel (+AmountRow, SummaryList, RadioList), ReconcilePanel, EvidenceTile, Timeline
  - `_loader.js` — card-only helper that loads sources directly when the compiled bundle is absent.
- `SKILL.md` — agent skill entry point.
- `ui_kits/one_link/` — desktop app (1440): Command Center (calm/exception), Trade Board (owner/restricted/loading, cards or table), Coverage — Wheat (local), Approval T-0141, Weighbridge tickets (default/silent/empty), GRN finalise (three outcomes), Grading dispute GR10000377, Stock board (Owner/Stock Control), Credit book. `Shell.jsx` holds Page / Sections / WithRail / WithPanel / PageHead / SectionLabel / FigureStrip / ScrollRow / useCompact. Responsive: side padding 16 (24 from 1024), rail 320 from 1152 and 358 from 1280 (stacks under the page head below 1152), action panel full width below 1024, no horizontal page overflow at 390.
- `ui_kits/one_link_mobile/` — the same screens at 390 inside `MobileShell` (every screen takes a `mobile` prop).
- `ui_kits/partner_portal/` — counterparty home and confirm receipt (390).
- `ui_kits/field_app/` — offline-first delivery proof (390), online and queued.

## Intentional additions
- `Text`/`textStyle`, `Icon`, `Avatar`, `Logo`, `ShareBar`, `SeverityTag`, `Dot` — small primitives the brief describes inline but does not name; they exist so every screen composes the same parts.

## External dependencies
- Inter via rsms.me; Instrument Sans via Google Fonts (wdth axis) — hosted substitutes, no binaries supplied.
- Lucide 1.39.0 UMD (`https://unpkg.com/lucide@1.39.0/dist/umd/lucide.min.js`, exposes `window.lucide.icons` + `createElement`); TradingView Lightweight Charts 5.2.1 standalone (`https://unpkg.com/lightweight-charts@5.2.1/dist/lightweight-charts.standalone.production.js`).
