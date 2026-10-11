# UI kit: One Link desktop app (1440)

Click-through recreation of the owner-facing platform. `index.html` mounts the shell and switches screens from the sidebar; a Segmented control per module switches that screen's states.

| Screen | File | States |
|---|---|---|
| 01 Command Center | `CommandCenter.jsx` | Calm · Exception (+ sync silent banner and stalled header pill) |
| 03 Trade Board | `TradeBoard.jsx` | Owner · Restricted · Loading; cards or table view |
| 04 Coverage: Wheat (local) | `Coverage.jsx` | commodity tabs, firm/declared overlays, season chart; Board · Calculation details (short = sold minus firm secured, M5.DS.02) |
| 05 Approval T-0141 | `Approval.jsx` | decision panel with Approve busy |
| 06 Weighbridge tickets | `Weighbridge.jsx` → `Weighbridge` | default · sync silent · empty (a ticket weighed in only shows `ReadinessChip`) |
| 07 GRN finalise | `Weighbridge.jsx` → `GRNFinalise` | within tolerance · held · hard block |
| 08 Grading dispute | `Weighbridge.jsx` → `GradingDispute` | Resolve case busy |
| 09 Stock board | `StockBoard.jsx` | Owner · Stock Control (restricted cells) |
| 10 Credit book | `CreditBook.jsx` | approved price, read only, with its approval date and history (M5.DS.02) |

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
| NewGoodsReceivedNote | `Inbound.jsx` | Grain · Grain, beyond tolerance · Grain, tally in bags · Grain, over legal payload · Fertiliser · Fertiliser, count short · Gate purchase · Transfer · Saving draft · Finalising |
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

## Captures in review, stock control's decision (`../admin_workspace/CaptureReview.jsx`, M4.DS.03)

A field capture that arrives more than 24 hours late, or from a revoked phone, waits in Captures in review. Stock control decides it, with Operations as deputy (RL-CAPTURE-REVIEW). The list and the record are the Setup ones, drawn here in stock control's frame (Inventory, Captures in review, added after Stock take) with the decision.

| Screen | File | States |
|---|---|---|
| CapturesToReview | `../admin_workspace/CaptureReview.jsx` | In review · Empty |
| CaptureDecision | `../admin_workspace/CaptureReview.jsx` | Late capture · From a revoked phone · Approving · Reject · Rejecting · Approved · Rejected |

Approve and Reject are the decision's outcomes as data (`DecisionActions`, UX-33). Reject asks for a comment before it is enabled (UX-22), and the decision being saved shows its working state. Device numbers and user names are plain text here: stock control cannot open them.

## Outbound and transport (M4.DS.02)

The outbound half of the Operations kit (canvases S13, S15 and S59; S12 C1, C4, C5, S14 R5 to R7, S47 JQ5) and Ashraf's transport screens. The Clerk's screens open in his frame (Logistics highlighted on loading order and delivery note pages, UX-04; Loading orders and Delivery notes added under Logistics), Ryan's in stock control's frame (Loading orders, Delivery notes and Direct deliveries added under Logistics), Jacques's grain orders and Trading's view of a note in Trading's frame, and Ashraf's in his own (Home, Trading, Logistics with Transport planning, Loading orders and Transporters, Reports). From Warehouse choose "Outbound screens" or "Transport screens", or open any state directly with `?screen=<Screen>&state=<State>`.

| Screen | File | States |
|---|---|---|
| ClerkOutbound | `Outbound.jsx` | All · Loading orders due · Ready to dispatch · Proof missing · Empty |
| NewLoadingOrder | `Outbound.jsx` | Within maximum · Approaching · At maximum · Over · No truck yet · Saving draft · Committing · Grain · Commit refused |
| LoadingOrder | `Outbound.jsx` | Committed · Awaiting truck · Ready to load · Close short · Closing · Closed short · Closed within tolerance · Trading view · Transport view · Related · History |
| NewDeliveryNote | `Outbound.jsx` | Grain · Grain, at legal payload · Grain, over legal payload · Override payload · Overriding · Fertiliser · Bag count mismatch · Supervised recount · Saving draft · Shipping |
| DeliveryNote | `Outbound.jsx` | Ready to dispatch · Shipping · Superseded weighing · Variance flagged · Variance flagged, clerk · Override variance · Overriding variance · Within variance · Shipped · Proof missing · Pending sync · In review · Delivery refused · Delivered · Received beside shipped · Superseded proof · Reversed · Closed · Trading view · Related · History |
| DeliveryNotes | `Outbound.jsx` | All · Physical · Virtual · Direct · Today · Exporting · Empty |
| DirectDelivery | `Outbound.jsx` | Counts match · Count difference · Finalising · Finalised · Virtual warehouse · On hold |
| TransportHome | `Transport.jsx` | Home · Empty |
| LoadsNeedTruck | `Transport.jsx` | Needs a truck · Truck assigned · All · Assign truck · Over the legal payload · Assigning · Empty |
| TransportPlanning | `Transport.jsx` | By farm · By contract · Day plan |
| Transporters | `Transport.jsx` | Transporters · Trucks · Rates |
| TransportersUpload | `Transport.jsx` | Ready to import · Row to fix · Importing · Imported |

The Clerk's Home Outbound tab is `ClerkOutbound`; the Inbound tab (`ClerkHome`) now counts it and opens it. The inbound form gains Grain, over legal payload: a receipt is never blocked for capacity, and the near-miss is recorded.

Rules these screens keep:

- Loading orders are raised and committed by Ryan (fertiliser) or Jacques (grain), never the clerk (Map D-37). The clerk opens a committed order Ready to load with Create delivery note as his only action. Ashraf gives the order its transporter and truck and never commits it.
- One boundary for a load against its limit (`LoadMeter`): Approaching from the payload approach setting (95%), At maximum at exactly the limit, a warning that needs no override, and Over above it. On the loading order Over reads "Over by 0.255 t" and disables Commit; on a grain delivery note Over legal payload needs an override with a reason, recorded as a near-miss. Ashraf's Assign truck draws the same meter against the truck's legal payload.
- Commit is refused against stock not received: "Commit is not allowed. Stock not received." (`Refusal`). Ship is refused on a bag count mismatch, "Ship is not allowed. Bag count 399 does not match count sheet 400." (`CountMatch`, no warn mode), and on a fertiliser note beyond the allowed variance until Ryan overrides with a reason (`VarianceReconcile`, Override variance, Ryan only).
- The delivery note's Reconcile card shows Ordered, Loaded and Ticket net side by side with the pair that is out named (`OutboundReconcile`); its legal payload is its own card. Superseded weighings and superseded proof are kept beside what replaced them.
- Proof of delivery (`ProofOfDelivery`) lists Photograph, Receiver signature and Receiver name: Awaiting proof inside the window, Proof missing after it (with the condition banner), Pending sync, In review and Delivery refused as states of their own, Delivered, and the received quantity beside the shipped one.
- The outbound queue's counts (Loading orders due, Ready to dispatch, Proof missing) are filters on the list, never tiles (UX-08). Its statuses are M4.QUE.02's, one or two words with an icon, in its order: Short load, Refused, Slip unconfirmed, Count mismatch, Variance flagged, Over legal payload, Proof missing, Price changed, Below plan, Window ended, Ready to load past its age (Age with the warning icon), a transfer Ready to load, Ready to dispatch, In review, Pending sync, Ready to load.
- No price, value or margin on any Clerk or stock control layout (UX-10). Trading's view of the same loading order or delivery note shows the sell price and value; Transport's view of the shared loading order shows the `Restricted` mark. Margin is parked with realised margin and is not drawn.
- A weight's Source (Weighbridge or Scanned slip) and its Counterparty status are separate fields. A direct delivery's quantity source is "Supplier document, Farmer confirmation"; it has no UAG weighbridge.
- Loading order, delivery note, ticket, leg and contract references are blue links where the viewer can open them; customers and the sale contract are plain text for the Clerk and Ryan. Route is plain text (UX-26).
- Every commit, ship, close, override, assign, finalise and export button draws its working state.
- Sample data is fictional: SYN4702 (delivered), SYN4790 (collected), FRT-218-S, FRT-221-S, Riverbend Milling, Lakeview Farms Ltd, Cameron Estates, Northside Haulage, Kafue Transport Ltd, Copperbelt Haulage Ltd, Lusaka Freight Ltd. People are S. Banda (clerk), R. Daka (stock control), J. Tembo (trading), A. Mwale (transport), T. Mwila (owner) and G. Phiri (field staff); the rate card figures are examples.

Components this card introduced, all in `components/records`: `LoadMeter` (+ `loadState`, `loadUsed`, `LOAD_MARKS`), `CountMatch` (+ `bagCountState`, `bagCountReason`, `COUNT_MARKS`), `OutboundReconcile` (+ `outboundCheck`), `VarianceReconcile` (+ `weighbridgeVariance`, `variancePct`) and `ProofOfDelivery` (+ `proofState`, `PROOF_MARKS`, `PROOF_ITEM_MARKS`). `ReconcileCard` gains an opt-in `mark`.

## The Managing Director's Home and awareness screens (M5.DS.01)

Owen's screens as S08 locks them (J2 to J11, canvas S09 "One Link Owen 1"), in his frame: the AppShell with his navigation (UX-06: Home, Trading, Logistics, Inventory, Finance, Counterparties, Reports, Assistant), Notifications and Help, and no connection pill or digest bell. Home is added beside the Command Center screen (`CommandCenter.jsx`), which stays and still opens first (Henry, 30 Sep 2026: new work adds to the design and never deletes; renaming allowed). Its words that S57 bans are renamed: "Chisamba Shed weighbridge is offline", "last record", "ready to receive". Reach Owen's screens from the Command Center's "Managing Director screens", or open any state directly with `?screen=<Screen>&state=<State>`.

| Screen | File | States |
|---|---|---|
| Home | `Home.jsx` | With items · No items · Stale data · Calculation details · Rate not set · Row expanded · Loading |
| ItemsToApproveList | `Home.jsx` | With items · No items |
| OwnerExceptions | `Home.jsx` | Open · Acknowledged · Exporting · No items |
| OwnerException | `Home.jsx` | Open · Acknowledge · Acknowledging · Acknowledged · Related · History |
| ReportsList | `Reports.jsx` | All · No match |
| EndOfDayReport | `Reports.jsx` | With items · No items · Exporting |
| ExposureReport | `Reports.jsx` | Report · Calculation details · Rate not set · Exporting |
| DailySummary | `Reports.jsx` | With items · No items |
| AssistantPage | `Reports.jsx` | Question · Working · Answer · Withheld answer |

Owen's phone screens are in the UAG One Link app kit (`../field_app/OwnerApp.jsx`); Assistant settings and the daily summary times are in Setup (`../admin_workspace/AssistantSettings.jsx`, `Settings.jsx`).

Rules these screens keep:

- Home is read only: the page header reads Home with Last refreshed, the date, 24-hour time and CAT, a green check when current and an amber warning past its threshold; no breadcrumb and no action button. View report and View all are links. No edit control on any of Owen's screens (S08, C8-2).
- Three KPI tiles, Total exposure, Uncovered exposure and Coverage (`KpiTile`, at most four through `kpiTiles`), each opening Calculation details with its components, the bold total, the exchange rate as "ZMW 25.00 per USD" and Rates as of. With no rate at all the dependent figure, the tile and its panel show Not set with the amber warning, and the panel names the setting, Exchange rate source, and its owner (S08 J3, UX-16). No Price sensitivity tile until U-14 is answered.
- Position by commodity: stock, open purchases, open sales, net position as Long, Short or Flat in tonnes, and value in USD; every figure opens Calculation details. Grain paid for and not yet delivered counts as an open purchase (Map D-41). Exposure by commodity, opened by View report, adds Committed, In transit and Held for others, shown apart and never added in. Every value is the weighted average cost roll-up in US dollars (Map D-16).
- Inventory by site: site, commodity, tonnes, weighted average cost and value in USD, each row expanding to its contracts with a chevron (`DataTable` `expand`).
- Items to approve and Exceptions carry their counts; Exceptions are grouped by type (Position, Inventory, Counterparty, Execution, a type with nothing open left out) and sorted by value at risk. Recent changes lists Record, Change, By and Date, newest first: approvals, holds and contract status changes since the last daily summary.
- An empty card keeps its title with count 0 and reads "No [objects] to display.". Record numbers and names are blue links. Statuses are an icon and a word (Pending approval, Open, Acknowledged, In transit, On hold). Money carries its code before the amount, K or M only in KPI tiles and the email's tiles; dates read DD MMM YYYY, times 24-hour with CAT on first display.
- The Daily summary email carries the KPI tiles, Items to approve, new and open exceptions sorted by value at risk, and Recent changes, every item a link to its record; it never prints the times it is sent at. The End-of-day report lists open exceptions, pending approvals and loads not yet reconciled, with filters and Export.
- The Assistant is a page from the navigation: a question, an answer showing the figure with the records it used as links, an answer withheld when its figures cannot be confirmed against the records, and the working state while it reads.
- Business language only, in text and accessible labels: no word on the M5 banned-word list and no left-column term of the S57 glossary (`guidelines/banned-words.json`, `m5`). Owen holds every tier, so no Restricted field appears on his screens. Any button that runs, acknowledges or asks draws its working state.
- Sample data is the S08 example data on the golden fixture names: Riverbend Milling, Lakeview Farms Ltd, Cameron Estates, Mpongwe Valley Farms, Northfield Agro Supplies, Chisamba Shed, Mpongwe Depot, Hired store, Mkushi. People are T. Mwila (Managing Director), J. Tembo (Trading), R. Daka (stock control), A. Mwale (Logistics) and M. Chanda (Operations).

Components this card introduced: `KpiTile` (+ `kpiTiles`, `KPI_TILE_CAP`) in `components/data`, and `DataTable`'s opt-in `expand` (with `expanded`, `onExpand`, `expandLabel`).

## Trading, operations and farmer finance (M5.DS.02)

The working screens M5's demonstration steps happen on (S47 JQ1 and JQ2, canvas S50; S16 AL6 and AL7, canvas S17; canvas S60): Trading's Home, the cover board, with its forward view and priority list; the farm-direct consignments, their capture, record and import preview, and the Exceptions list with Follow-up as the operations lead's saved view; the farm-direct variance decision; the farmer account, the credit book's farmer detail, the statement run and the statement layout approval; and the exchange rate table. They open in Trading's frame (J. Tembo: Home, Trading with Priority list and Forward view, Logistics, Inventory, Counterparties, Reports, Assistant), Operations' (M. Chanda: Home, Logistics with Farm-direct, Finance, Counterparties, Reports) or Finance's (N. Phiri: Home, Finance with Farmer accounts, Credit book, Farmer statements and Exchange rates, Counterparties, Reports). From Trade Desk choose "Trading screens", from Warehouse "Farm-direct screens", from Farmer Finance "Farmer accounts screens", or open any state directly with `?screen=<Screen>&state=<State>`. The key-upload list and the exception rules are in Setup (`../admin_workspace/Monitoring.jsx`).

| Screen | File | States |
|---|---|---|
| CoverHome | `Trading.jsx` | Current · Stale data · Upload failed · Upload missing · Calculation details · Could cover · Loading |
| ForwardView | `Trading.jsx` | Next 30 days · Next 90 days · Week opened · Loading · Error |
| PriorityList | `Trading.jsx` | Short contracts · Suppliers to call · Acknowledging · Acknowledged · Without the contract tier · All covered |
| FarmDirectConsignments | `Operations.jsx` | All · Waiting for a side · Exporting · Empty |
| NewConsignment | `Operations.jsx` | Loaded side · Mill side · Missing fields · Saving |
| Consignment | `Operations.jsx` | Loaded side only · Mill side only · Both sides · Grade below contract · Acknowledging · Beyond allowance · Related · History |
| FarmDirectUpload | `Operations.jsx` | Validating · Ready to import · Row to fix · Importing · Imported · Failed |
| FollowUp | `Operations.jsx` | Follow-up · Acknowledged · Exporting · No items |
| VarianceDecision | `Operations.jsx` | Open · Correct a side · Deciding · Decided · Operations, read only |
| FarmerAccount | `Finance.jsx` | Details · Calculation details · Without the farmer account tier · Related · History · Loading |
| CreditBookFarmer | `Finance.jsx` | Red band · Amber band · Chart loading · Price history |
| StatementRun | `Finance.jsx` | Preview · Running · Run history · Downloading · No approved layout |
| StatementLayout | `Finance.jsx` | Pending approval · Approving · Reject · Rejecting · Approved · Rejected |
| ExchangeRates | `Finance.jsx` | Rates · Enter rate · Saving · Rate already entered · Correct rate · Correcting · No rate today |

Two kit details were corrected at source, by rewording, with nothing deleted: the Coverage screen's short figure is sold minus firm secured, opening Calculation details with Sold and Firm secured as rows and the gap as the bold total, declared supply drawn dashed and never subtracted, and uncommitted stock and stock in transit in their own Could cover figure; the Credit book's market-price stepper is now the approved price, read only, with its approval date, who approved it, how it changes (Approval of a new price) and its history. No control on either screen edits a price or runs a what-if.

Rules these screens keep:

- Short is sold minus firm secured, never typed (RL-COVER-DERIVED, RL-NO-REKEY-COV). Expected is shown apart and drawn dashed beyond the cover bar; Could cover sits in its own column; neither reduces the gap. Every Short and Could cover figure opens Calculation details. Weighed loads not yet received are labelled fields (loads and tonnage) in their own card.
- Freshness is Last refreshed with the green check, or amber with the warning icon past its threshold, and one condition banner naming the input that is stale, failed or missing (UX-23, UX-24). The forward view is a ChartCard, its key drawn with ShareBar swatches.
- The priority list ranks short contracts by severity, then value at risk; each opens its suppliers to call, each with its reason and its contact or "no contact on record". Acknowledge marks a quiet supplier seen and never resolves it. Without the contract tier the value at risk column is left out.
- A farm-direct consignment is a load: In transit with the loaded side, Delivered with the mill side, Reconciled once the difference and grade are settled; what it waits for is the field Waiting for (UX-32). The mill's offloaded weight and grade count on both legs and set what the farmer is paid on; the farmer's loaded weight is kept to show the difference (Map D-36). The Reconcile card closes with the weight line and the grade line.
- Exceptions is one list; Follow-up is the operations lead's saved view, ranked by value at risk, with Type, Exception, Record, Value at risk (USD), Owner, Age and Status. A weight difference beyond allowance is read only for Operations; Trading or the Managing Director decides it with exactly three outcomes: Accept the mill's offloaded weight, Correct a side, with a reason, or Send for re-weigh (`DecisionActions`, UAG-150).
- Farmer figures carry the Farmer account tier: on the shared farmer account layout, Trading sees the `Restricted` lock in each figure's place, and the money columns are left out of its tables. Finance's figures are USD with two decimals; the LTV is facility over crop value at the approved price, banded green, amber from 20.00% and red from 22.00%, on a ChartCard baseline with both lines.
- A statement run keeps every earlier run, marked Superseded and still downloadable, with its layout version, language and fingerprint. A statement in a language with no approved layout is refused. A layout is approved by Operations on sample data (Sample Farm Ltd), carries its language, and needs a comment to reject.
- Rates read "ZMW 25.00 per USD" with their date, beside the Exchange rate source setting and its owner. A second rate for a date is refused; a correction needs a reason and keeps the original row beside it, marked Corrected.
- Operations screens carry operations data only: no price or value on a consignment; value at risk appears on the exceptions. Every save, import, run, approve, acknowledge, decide, correct and export button draws its working state.
- Sample data is fictional, on the golden fixture names: Riverbend Milling (the canvas's mill), Lakeview Farms Ltd, Cameron Estates, Kapiri Farms, Chisomo Agri, Chongwe Growers Ltd, Mpongwe Valley Farms, Chisamba Shed. People are J. Tembo (Trading), M. Chanda (Operations), N. Phiri (Finance) and T. Mwila (Managing Director).

Component change this card made: `ChartCard` reads a token colour (`color: 'var(--commodity-wheat)'`, a price line's `var(--warning-strong)`) from the page through `chartColor`, so a kit screen never writes a hex. Plain colours draw as before.

## The M6 states of the existing screens (M6.DS.01)

The states M6 needs on the existing kit screens, added beside each screen's own states, which draw exactly as before (Henry, 30 Sep 2026: new work adds to the design and never deletes). `TradingStates.jsx` holds them; TradeBoard, Approval, GradingDispute, GRNFinalise and StockBoard hand it one of these states. Choose them from each screen's state control here, or open them in their own frames in the Trading workspace kit (`../trading_workspace/`), which Trade Desk's "Trading workspace" opens.

| Screen | File | States |
|---|---|---|
| TradeBoard | `TradingStates.jsx` | Trades by status · Amendment pending approval · Close suggested · Closed with balance · Gate purchase |
| Approval | `TradingStates.jsx` | Pending approval · Approving · Reject · Rejecting · Approved · Deputy decision · Requester's view · History |
| GradingDispute | `TradingStates.jsx` | Re-test recorded · Deciding · Decided |
| GRNFinalise | `TradingStates.jsx` | Failed quality · Saving route · Held for drying · Awaiting diversion · Rejected and returned |
| StockBoard | `TradingStates.jsx` | By storage unit · Third-party sites · Owned by others |

- The trade board lists trades with the statuses Draft, Pending approval, Approved, Active and Closed. An amendment waiting for a decision is a Pending approval item on its trade and a suggested close an exception on it; neither changes the trade's status. A closed trade opens to its Remaining balance and each leg's contracted, delivered and remaining tonnes. Gate purchase is a plain-text Type, its gate price in kwacha per tonne and its value in US dollars with the exchange rate and its date.
- The approval record is Owen's (S09 "Trade SYN4810, pending approval"): highlights with Counterparty, Commodity, Quantity, Margin, Owner, Submitted and Waiting for; Trade information with Rates as of and Exchange rate; Purchase legs with a Total row; Approval history; Approve and Reject, Reject asking "Reject trade SYN4810?" with a comment first. A deputy's decision reads Approved by and On behalf of: Managing Director, with the authority snapshot; the requester's view has no Approve.
- A grading dispute keeps both results with their assessor, instrument and time; the re-test supersedes the first only once decided, and the money is corrected by a correction beside the original, which stays.
- A goods received note that failed quality offers three routes (Return to farmer, Dry on site, Divert), each with a reason, then reads Held for drying, Awaiting diversion or Rejected. The Clerk's layout carries no price.
- Stock groups by stack, bay, silo and drying bay, with third-party sites and stock owned by others shown apart and never in the own position; capacity counts every owner. Stock control's layout carries no price or value.
