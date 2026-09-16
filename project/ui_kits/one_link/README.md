# UI kit — One Link desktop app (1440)

Click-through recreation of the owner-facing platform. `index.html` mounts the shell and switches screens from the sidebar; a Segmented control per module switches that screen's states.

| Screen | File | States |
|---|---|---|
| 01 Command Center | `CommandCenter.jsx` | Calm · Exception (+ sync silent banner and stalled header pill) |
| 03 Trade Board | `TradeBoard.jsx` | Owner · Restricted · Loading; cards or table view |
| 04 Coverage — Wheat (local) | `Coverage.jsx` | commodity tabs, firm/declared overlays, season chart |
| 05 Approval T-0141 | `Approval.jsx` | decision panel with Approve busy |
| 06 Weighbridge tickets | `Weighbridge.jsx` → `Weighbridge` | default · sync silent · empty |
| 07 GRN finalise | `Weighbridge.jsx` → `GRNFinalise` | within tolerance · held · hard block |
| 08 Grading dispute | `Weighbridge.jsx` → `GradingDispute` | Resolve case busy |
| 09 Stock board | `StockBoard.jsx` | Owner · Stock Control (restricted cells) |
| 10 Credit book | `CreditBook.jsx` | planning-price stepper rescoring |

`Shell.jsx` holds the layout parts every screen shares: `Page`, `WithRail`, `PageHead`, `SectionLabel`, `FigureStrip`.

`Page` is the signed-in frame: it renders the design system's `AppShell` (260px sidebar with the modules and the active module's sections, 56px toolbar with breadcrumb, search, sync, digest and the account menu) around the centred content column, with the chart attribution below. `module`, `onModule`, `sync`, `syncLabel` and `children` are all a screen needs; `nav`, `section`, `onSection`, `breadcrumb`, `user`, `menu` and `foot` are optional and default to `MODULES` and the placeholder user, so any kit that reuses `Page` gets the frame without changes.

Every screen composes the published components — no bespoke UI. Pass `mobile` to any screen to get the 390px stacking used by `../one_link_mobile/`.

Choices made where the brief left them open (kept consistent everywhere): GRN tolerance 0.5 MT with the reviewer named on the banner; stock valued at a weighted average cost of K5,590/t; the restricted view is reachable from the owner menu and from a "Restricted view" button in the page head.
