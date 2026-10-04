# UI kit: One Link desktop app (1440)

Click-through recreation of the owner-facing platform. `index.html` mounts the shell and switches screens from the sidebar; a Segmented control per module switches that screen's states.

| Screen | File | States |
|---|---|---|
| 01 Command Center | `CommandCenter.jsx` | Calm · Exception (+ sync silent banner and stalled header pill) |
| 03 Trade Board | `TradeBoard.jsx` | Owner · Restricted · Loading; cards or table view |
| 04 Coverage: Wheat (local) | `Coverage.jsx` | commodity tabs, firm/declared overlays, season chart |
| 05 Approval T-0141 | `Approval.jsx` | decision panel with Approve busy |
| 06 Weighbridge tickets | `Weighbridge.jsx` → `Weighbridge` | default · sync silent · empty (a ticket weighed in only shows `ReadinessChip`) |
| 07 GRN finalise | `Weighbridge.jsx` → `GRNFinalise` | within tolerance · held · hard block |
| 08 Grading dispute | `Weighbridge.jsx` → `GradingDispute` | Resolve case busy |
| 09 Stock board | `StockBoard.jsx` | Owner · Stock Control (restricted cells) |
| 10 Credit book | `CreditBook.jsx` | planning-price stepper rescoring |

`Shell.jsx` holds the layout parts every screen shares: `Page`, `WithRail`, `PageHead`, `SectionLabel`, `FigureStrip`.

`Page` is the signed-in frame: it renders the design system's `AppShell` (260px sidebar with the modules and the active module's sections, 56px toolbar with breadcrumb, search, sync, digest and the account menu) around the centred content column, with the chart attribution below. `module`, `onModule`, `sync`, `syncLabel` and `children` are all a screen needs; `nav`, `section`, `onSection`, `breadcrumb`, `user`, `menu` and `foot` are optional and default to `MODULES` and the placeholder user, so any kit that reuses `Page` gets the frame without changes.

Every screen composes the published components. No bespoke UI. Pass `mobile` to any screen to get the 390px stacking used by `../one_link_mobile/`.

Choices made where the brief left them open (kept consistent everywhere): GRN tolerance 0.5 MT with the reviewer named on the banner; stock valued at a weighted average cost of K5,590/t; the restricted view is reachable from the owner menu and from a "Restricted view" button in the page head.

## Weighbridge continuity (M2.DS.01)

The Clerk's continuity screens (canvas S13) and the Exceptions screens (canvas S09), beside `Weighbridge.jsx`, which keeps its own screens. They open in the Clerk's frame (Home, Logistics, Inventory, Reports; Logistics highlighted on ticket and slip pages, UX-04), and the owner's Exceptions view opens in the owner's frame. From the Warehouse module choose "Clerk screens", or open any state directly with `?screen=<Screen>&state=<State>`, which is what the screenshot review uses at 1440 and 390.

| Screen | File | States |
|---|---|---|
| ClerkHome | `Tickets.jsx` | Inbound · Weighbridge offline · Close problem · Closing problem |
| TicketsList | `Tickets.jsx` | All · Delayed · Offline · Stalled · Scanned slip site · Closed · Close · Closing · One site and date · Exporting · Empty |
| ScannedSlip | `Tickets.jsx` | Read clearly · Check · Corrected · Net disagrees · Tare at or above gross · Photo already used · Confirming · Reading · Pending reading · Reading failed · Second confirmation · Second confirmation, first confirmer · Withdraw |
| TicketRecord | `Tickets.jsx` | Ready · Receiving · From scanned slip · History · Later scale record · Keeping weights · Closed |
| FeedHealth | `Tickets.jsx` | Connected · Delayed · Offline |
| ExceptionsList | `Exceptions.jsx` | Clerk · Owner · Acknowledged · Closed · Empty |
| ExceptionRecord | `Exceptions.jsx` | Open · Acknowledge · Acknowledging · Acknowledged · History · Closed |

The Setup kit draws the Weight source switch per site, with its value in force, any pending change and its Connection status (`../admin_workspace/Settings.jsx`, SwitchesList, Weight source per site).

Rules these screens keep:

- The weight's source is the labelled field Source, Weighbridge or Scanned slip, in the highlights panel and the Ticket source card, never a chip. A ticket completed from a scanned slip reads Scanned slip. The ticket's readiness is its status (`ReadinessChip`); counterparty agreement is the field Counterparty status. Three things, never merged or nested.
- No price or money on any weighbridge screen. The owner's Exceptions view adds Value at risk (USD) because he holds the price tiers.
- No weight is entered without the slip photo beside it: `FieldCheck` offers its inputs only with the `evidence` it sits beside, and `EvidenceViewer` zooms the photo and shows its fingerprint. No confidence level, word or score is shown; a doubtful reading is the status Check.
- Confirm weights is the one primary button, disabled while a Check field is open. Every save, confirm, close, acknowledge, export and receive button draws its working state (spinner, no text).
- Blocked actions read "[Action] is not allowed. [Reason]." (`Refusal`). A silent weighbridge is the banner "Chisamba Shed weighbridge is offline since 09:10 CAT.", and Connection status reads Connected, Delayed or Offline. A site on Scanned slip shows no connection status and offers Scan slip.
- Close asks for a reason in a 480px dialog titled with the record ("Close WBT10001599?"), Close disabled until a reason is entered, the footer Cancel and Close (`ReasonDialog`).
- Exceptions read Open, Acknowledged and Closed; Acknowledge takes an optional note and the exception stays open. Severity shows through the type and the order of the rows, never a coloured tag. The owner reads business wording only, with no source, connection or ticket reference.
- A record reference is a blue link only where the viewer can open the record; a counterparty is plain text for the Clerk.
- Empty lists keep their title and count 0 and read "No [objects] to display."
- Sample data is fictional: Chisamba Shed, Mpongwe Depot, Site A gate, Lakeview Farms Ltd, Cameron Estates. The slip photo is a drawn sample (`assets/samples/slip-chisamba-10001614.svg`).
- The look is this system's current one (Henry's ruling of 30 Sep 2026): the canvases give layout, content and flow; buttons, radii, shadows and type are the published ones.

Components this card introduced: `ReadinessChip`, `EvidenceViewer`, `FieldCheck` (with `fieldOpen`, `fieldCorrected`, `fieldsReady`), `SecondConfirmation` and `ExceptionList` (with `ExceptionStatus`), all in `components/records`. `ProvenanceChip` renamed `typed` to `unverified`, dropped `bridge` (now `ReadinessChip` Weighed in only) and reads in S57 words only; `ConfirmationChip` gained `pending` for Counterparty status Pending.
