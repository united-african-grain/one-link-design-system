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
| ClerkHome | `Tickets.jsx` | Inbound · Weighbridge offline · Close problem · Closing problem · Ready · Problem · Stalled · On hold · Drafts · Empty |
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

Components this card introduced: `ReadinessChip`, `EvidenceViewer`, `FieldCheck` (with `fieldOpen`, `fieldCorrected`, `fieldsReady`), `SecondConfirmation` and `ExceptionList` (with `ExceptionStatus`), all in `components/records`. `ProvenanceChip` renamed `typed` to `unverified`, dropped `bridge` (now `ReadinessChip` Weighed in) and reads in S57 words only; `ConfirmationChip` gained `pending` for Counterparty status Pending.

## Counterparties for Owen (M3.DS.01)

Owen's Counterparties module (S08 J7, canvas AB-OWEN-NMC), in his frame with Counterparties added to the navigation (UX-06: Owen and Alka only). From Trade Desk choose "Counterparties", or open any state directly with `?screen=<Screen>&state=<State>`.

| Screen | File | States |
|---|---|---|
| CounterpartyFind | `Counterparties.jsx` | Global search · Did you mean · Also known as · List view · No match |
| CounterpartyView | `Counterparties.jsx` | Related · Details · History · Calculation details · Load awaiting offload · Without the sell tier · Farmer · Farmer, without the farmer account tier |
| CounterpartyGroup | `Counterparties.jsx` | Group overview |

Rules these screens keep:

- Read-only: no capture, edit, confirm or upload control (S08). The highlights panel is `CounterpartyOverview`: Type, Sales under contract, Delivered, Left to deliver, Receivables and Oldest unpaid, each with the date it is as of, and the status.
- Business language only, from one shared list (`guidelines/banned-words.json`): no batch, upload, template, sync, virtual warehouse or error code. The source of a figure is the labelled field Source, "Stock sheet, 30 Sep 2026" (`SourceLine`), or a Basis row in Calculation details; dates read DD MMM YYYY and freshness reads Last refreshed.
- A figure opens Calculation details, read-only (UX-18), with its components, its source and its date.
- A figure the viewer's price tier does not allow is the Restricted mark on a shared layout (the highlights, the farmer account card) and is left out elsewhere (the invoice amount column).
- Loads read Loading, In transit, Delivered and Reconciled (UX-32); a load awaiting offload is In transit, and its over-delivery variance is a labelled field.
- Contract, load, invoice and counterparty references are blue links, because Owen can open them.
- The look is this system's current one (Henry's ruling of 30 Sep 2026). The canvas's customer is replaced by the golden synthetic Riverbend Milling.

Components this card introduced: `CounterpartyOverview` (records) and `SourceLine` (+ `sourceWords`, `SOURCE_KINDS`) (data).

## Inbound, gate price and stock (M4.DS.01)

The inbound half of the Operations kit and the stock control screens (canvases S13, S15 and S09; S12 C1 to C6, S14 R2, R3 and R8, S08 J4 and J5). The Clerk's screens open in his frame (Logistics highlighted on goods received note pages, Inventory on Warehouse stock, UX-04), stock control's in Ryan's frame (Home, Logistics, Inventory, Reports), and the decisions and gate prices in the owner's. From Warehouse choose "Clerk screens", from Stock choose "Stock control screens", from Trade Desk choose "Gate prices", or open any state directly with `?screen=<Screen>&state=<State>`.

| Screen | File | States |
|---|---|---|
| NewGoodsReceivedNote | `Inbound.jsx` | Grain · Grain, beyond tolerance · Grain, tally in bags · Fertiliser · Fertiliser, count short · Gate purchase · Transfer · Saving draft · Finalising |
| GoodsReceivedNote | `Inbound.jsx` | Booked · On hold · Escalated · Returned · Re-finalising · Weight dispute · Re-weigh slip · Gate purchase · Gate purchase, valued · Over-delivery · Related · History |
| LoadOnHold | `Inbound.jsx` | On hold · Reject · Rejecting · Rejected · Releasing · Released · Escalated |
| OverDeliveryNotice | `Inbound.jsx` | Open · Acknowledge · Acknowledging · Acknowledged · Stock control |
| WarehouseStock | `Inbound.jsx` | All · Exporting · Empty |
| StockPosition | `StockControl.jsx` | Position · Calculation details · No gate price in force |
| OnTheRoad | `StockControl.jsx` | All · Past window · Empty |
| TransferOrder | `StockControl.jsx` | In transit · Past clearing window · Cleared · Within allowance · Transit difference · Requesting write-off · Write-off pending approval |
| StockTake | `StockControl.jsx` | Counted · Request write-off · Requesting write-off · Write-off pending approval · Third-party count · Adjustments to book |
| GatePrices | `GatePrice.jsx` | All · No price in force · Pending approval |
| NewGatePrice | `GatePrice.jsx` | Form · Missing price · Submitting |
| GatePriceRecord | `GatePrice.jsx` | Pending approval · Approving · Reject · Rejecting · Approved · Rejected · History · Own proposal |

The Clerk's Home (`ClerkHome`, above) gains the inbound queue: goods received notes returned for correction, in a weight dispute, on hold and in draft, a ticket not received for too long, and a transfer on its way in, with the counts Ready, Problem, Stalled, On hold and Drafts as filters. The Setup kit draws Vehicles and Transporters (`../admin_workspace/Vehicles.jsx`).

Rules these screens keep:

- No price, value or margin on any Clerk or stock control layout (UX-10). The Clerk's gate purchase shows the field Gate price with only its status, Awaiting gate price. Today's gate price, in ZMW per t, is the only price stock control sees. On a layout shared with a viewer who holds the tier (the over-delivery notice), stock control sees the `Restricted` mark.
- A weight's source is the labelled field Source (Weighbridge or Scanned slip); counterparty agreement is the separate field Counterparty status (Confirmed, Disputed, Pending).
- Every screen that shows a contract shows its Basis (Delivered or Collected) as a field.
- The goods received note checks ticket net, lines total and offload tally in the Reconcile card (`ThreeWayReconcile`), with the lines' running sum under the Lines card (`RunningSum`). Beyond tolerance, the note is On hold and names who acts next as the field "Waiting for: T. Mwila or J. Tembo".
- The approver's choices are data (`DecisionActions`): Release hold, or Reject with a mandatory comment naming the follow-up (correct lines, re-weigh or cancel the receipt). Stock moves only after the decision. A gate price is decided the same way: Reject or Approve. Nobody decides their own proposal.
- No gate price in force is a state naming who sets it (`NoPriceInForce`, "Set by Trading"), never a zero, a blank or a stale price.
- A leg past its clearing window (7 days, a setting) is an exception. A transit difference within its allowance clears; bagged product has none. A residue's write-off is Pending approval until decided, never shown as done (`TransitResidue`).
- Stock take differences show tonnes and per cent with two decimals against 0.20%. The Virtual warehouse line must be empty. Counts name the Stock control role or the third-party organisation, never a person.
- Every figure on stock control's Home opens Calculation details. Other owners' stock is shown apart, never added into ours. No shortfall is drawn: demand is not recorded (S14).
- Every save, finalise, decide, close, acknowledge, request and export button draws its working state.
- Sample data is fictional: SYN4702 (delivered basis), SYN4790 (collected basis), Lakeview Farms Ltd, Cameron Estates, Riverbend Milling, Chisamba Shed, Mpongwe Depot. People are T. Mwila (owner), J. Tembo (trading), S. Banda (clerk) and R. Daka (stock control).

Components this card introduced, all in `components/records`: `RunningSum` (+ `runningSumState`, `thousandths`, `tonnes`), `ThreeWayReconcile` (+ `threeWayCheck`), `DecisionActions` and `TransitResidue` (+ `WRITE_OFF_MARKS`).
