# UI kit: the Trading workspace (1440 and 390)

The screens M6 (trading complete) happens on, for Trading (J. Tembo), Trading support (A. Mwale), Finance (N. Phiri), Operations (M. Chanda), the Clerk (S. Banda), stock control (R. Daka) and the Managing Director (T. Mwila). A feature card ports a screen from here and never styles one of its own. They are composed only from published components and the kits' shared parts: `../one_link/Shell.jsx` (Page, Sections, WithRail, ScrollRow, SectionLabel), `../one_link/Home.jsx` (HmHead, HmCard, HmTable, HmFacts, HmLink, HmRefreshed) and `../one_link/TradingStates.jsx` (the trade record, the statuses and the M6 states of the existing kit screens).

`index.html` opens on the trade working view. Two segmented controls switch the screens and their states, and every state opens directly with `?screen=<Screen>&state=<State>`, which the screenshot review uses at 1440 and 390. Each screen draws in its own person's frame (`twFrame` in `Workspace.jsx`). From the desktop kit, Trade Desk's "Trading workspace" opens this kit.

The canvases give layout, content and flow: S50 "One Link Jacques" (pricing and committing a trade with margin and exposure, the import corridors), S60 "One Link Sid" (import allocation by mill, lots and stock cost), S17 "One Link Alka" (the import schedule by mill), "One Link Ashraf" (preparing a contract, the day plan) and S09 "One Link Owen 1" (Trade SYN4810 pending approval, its Reject dialog, Contract SYN4702). UX-01 to UX-34 win where a canvas detail differs (Map D-43). The look is the current design system's, unchanged (Henry, 30 Sep 2026).

## Screens

| Screen | File | States |
|---|---|---|
| TradeWorkingView | `Trades.jsx` | Working · Calculation details · Negative margin · Rate not set · Uncovered tonnage · Submitting · Without the contract tier · Loading |
| ContractTerms | `Terms.jsx` | Sale · Purchase leg · Amendment history · Basis missing · Without the contract tier |
| ScheduleGrid | `Supply.jsx` | Contracts · Allocations · Not fully scheduled · Saving · Empty · Loading |
| PriceLadder | `Supply.jsx` | Ladder · Version 2 · Lot not assigned · Without the contract tier · Loading |
| ShipmentAllocations | `Supply.jsx` | Allocations · Allocate · Allocating · Refused allocation · Fully allocated · Operations, read only |
| LongShort | `Supply.jsx` | By origin · By corridor · Calculation details · Import wheat · Loading |
| TradeRecord | `Trades.jsx` | Details · Related · History · Pending approval · Close suggested · Closed with balance · Without the contract tier · Loading |
| NewTrade | `Trades.jsx` | Enquiry · Missing fields · Saving |
| CloseTrade | `Trades.jsx` | Close · Reason given · Closing · Closed |
| GenerateContracts | `Trades.jsx` | Approved · Generate contracts · Generating · Drafts · Record signature · Recording · 3 of 4 signed · Signed |
| AmendmentConfirm | `Terms.jsx` | Confirm · Missing reason · Submitting · Pending approval |
| LotDefinition | `Terms.jsx` | New lot · Missing base month · Saving · Lot picker · One open lot |
| PermitsList | `Supply.jsx` | All · At limit · Permit limit exception · Operations, read only · No match |
| DiversionTask | `Supply.jsx` | Task · Submitting · Pending approval · Completed · Rejected · Clerk view |
| ContractList | `Trades.jsx` | All · Wheat purchases · Warehouse view · Exporting · No match · Loading |

The quality specification editor, screen (k), is in Setup under Reference data (`../admin_workspace/QualitySpecs.jsx`, QualitySpecifications: Specifications · Editor · Missing field · Saving · Version 4 saved); this kit lists it with the others. The trading screens of the UAG One Link app at 390 are in `../field_app/TradingApp.jsx`.

## The M6 states of the existing kit screens

Added beside each screen's own states, which draw exactly as before (Henry, 30 Sep 2026: add, never delete). They open here in their own frames, and in the desktop kit from each screen's state control.

| Screen | File | States |
|---|---|---|
| TradeBoard | `../one_link/TradingStates.jsx` | Trades by status · Amendment pending approval · Close suggested · Closed with balance · Gate purchase |
| Approval | `../one_link/TradingStates.jsx` | Pending approval · Approving · Reject · Rejecting · Approved · Deputy decision · Requester's view · History |
| GradingDispute | `../one_link/TradingStates.jsx` | Re-test recorded · Deciding · Decided |
| GRNFinalise | `../one_link/TradingStates.jsx` | Failed quality · Saving route · Held for drying · Awaiting diversion · Rejected and returned |
| StockBoard | `../one_link/TradingStates.jsx` | By storage unit · Third-party sites · Owned by others |

## Rules these screens keep

- **Words are the map's.** A trade or contract is Draft, Pending approval, Approved, Active or Closed (UX-32); enquiry, working and contracted are lifecycle names for specs, never status words. An amendment waiting for a decision is a Pending approval item on its trade, and a suggested close is an exception on it. Leg, allocation, permit, headroom, long and short; no system words. Actions are S57's: Save, Submit for approval, Approve, Reject, Close, Export, Edit, New; Generate contracts and Allocate are the business actions these cards name.
- **Margin** is sale less purchase less transport, per leg and in total, recomputed as a line changes, and every margin opens Calculation details (UX-18). The transport rate fills itself from the pickup district and destination and is visible before Submit for approval, as is the buyer's exposure against the single client limit (S47 JQ4). Rates as of and Exchange rate are labelled fields (Map D-40). A negative margin is a signal, never hidden (`MarginCell`). A missing transport rate is Not set with the amber warning in the rate cell and in each margin resting on it; Calculation details names the missing rate; Submit for approval is refused: "Submit for approval is not allowed. No transport rate for Mpongwe to Riverbend Mill Kitwe intake."
- **The approval record** matches Owen's canvas: highlights with Counterparty, Commodity, Quantity, Margin, Owner and Submitted and a Waiting for field; Trade information with Rates as of and Exchange rate and the margin frozen at submission; Purchase legs with a Total row; Approval history (Step, Assigned to, Status, Date). Approve is the primary button and Reject red on an outline; Reject opens "Reject trade SYN4810?" and needs a comment first. A deputy's decision reads Approved by and On behalf of: Managing Director, with the authority snapshot frozen at the decision; the requester never sees Approve. History records the decision, the role and the time.
- **Contract basis** says what it governs on the contract: the invoice weight, the price adjustment for grade and who carries transit loss. A term changes only by an amendment that names the loads it touches, with a reason and an effective date.
- **Permits.** A refused allocation reads "Allocation is not allowed. Exceeds permit SI-2026-014 headroom of 50 t by 50 t." (`PermitHeadroom`, UX-21). Each mill's permit panel shows Wanted, Allowed, Booked and Headroom. The permit-limit exception reads "Riverbend Milling at permit limit: cannot allocate more".
- **Grids.** The schedule grid and the ladder are compact tables with the unit in the header (UX-26). At 390 they scroll inside their own container and the page does not. No ladder cell is an input; its prices carry Source: Price rule.
- **Money and visibility.** Currency code before the amount, two decimals on a record, the currency in table headers (UX-11). A gate purchase reads its gate price in kwacha per tonne, "ZMW 4,300.00 per t"; position, valuation and margin roll up in US dollars with the exchange rate and its date (Map D-38, D-16, D-40). Clerk and Warehouse layouts show no price, value, margin or position: a withheld figure on a shared layout is the `Restricted` lock, never a zero; otherwise the field or column is left out (UX-09, UX-10).
- **Formats.** Numbers right-aligned in tabular numerals with the unit or currency in the header; summary tonnages with no decimals and weighbridge weights with three; month ranges read "Sep 2026 to Nov 2026"; a commodity carries its marker; a missing value is a blank cell; a record number or counterparty is a blue link only where the viewer can open it (UX-01, UX-12, UX-13, UX-27).
- **Working states.** Every button that saves, submits for approval, approves, rejects, generates, records, allocates, closes or exports draws its working state.
- **Sample data** is fictional, on the golden fixture names: Riverbend Milling (the canvases' mill), Kafue Valley Milling, Crestline Milling, Copperhill Mills, Kafue Stockfeeds Ltd, Lakeview Farms Ltd, Cameron Estates, Kapiri Farms, Mpongwe Valley Farms, Chongwe Growers Ltd, Chisamba Shed, Mpongwe Depot. Public copy says One Link.

Components this card introduced: `MarginCell` (+ `marginSign`, `marginWords`) in `components/data` and `PermitHeadroom` (+ `permitHeadroom`, `permitReason`) in `components/records`, with the live example `components/records/trading.card.html`.
