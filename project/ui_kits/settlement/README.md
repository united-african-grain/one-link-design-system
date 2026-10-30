# UI kit: Invoice preparation and settlement (1440 and 390)

The M7 money screens (M7.DS.02, UAG-200): invoice preparation, receivables, costs and farmer settlement. `index.html` opens on the invoice preparation run, and two segmented controls switch the screens and their states. Every state opens directly with `?screen=<Screen>&state=<State>`, which the screenshot review uses at 1440 and 390.

The screens compose the published components and tokens only, with the kit parts of `../one_link/` (`Shell.jsx`, and Home's `HmHead`, `HmCard`, `HmTable`, `HmFacts`, `HmLink`, `HmRefreshed`), the page anatomy of the Imports kit. The look is this system's current one (Henry's ruling of 30 Sep 2026): the canvases (S17 Alka screen 13, S60 Sid screens 2 to 6, 9 and 11) give layout, content and flow; UX-01 to UX-33 win where a canvas detail differs (Map D-43). Frames: Finance (N. Phiri: Home, Finance with invoice preparation, receivables, farmer settlement, settlement batches, statements due, farmer accounts, stock cost and exchange rates, Counterparties, Reports, Setup with GL cost categories), the operations lead (M. Chanda) who builds the run, the Managing Director (T. Mwila) who approves a settlement, and a reader without the price tiers (R. Daka, stock control).

## Invoice preparation and receivables (`Invoicing.jsx`, S16 AL8, S60 screens 2 to 4)

| Screen | File | States |
|---|---|---|
| InvoicePrepRuns | `Invoicing.jsx` | Runs · Start run · Starting · No runs · Loading · Error |
| InvoicePrepRun | `Invoicing.jsx` | Lines prepared · Submitting · Awaiting destination weight · Waiting for review · Reference chain · Exclude line · Line excluded · Marking prepared · Prepared · Exporting · Export preview · Withdraw · Withdrawn · Without the sell tier · History · Loading · Error |
| ContractReceivables | `Invoicing.jsx` | Invoices and payments · Record invoiced · Amount differs · Recording invoice · Invoice recorded · Record payment · No rate for the day · Recording payment · Payment recorded · Without the sell tier · Loading |
| SettlementPipeline | `Invoicing.jsx` | By contract · Gap to invoice · Gap to pay · Nothing outstanding · Without the sell tier · Loading · Error |

## Costs (`Costs.jsx`, F7.1 to F7.3, F8.5, S60 screens 9 and 10)

| Screen | File | States |
|---|---|---|
| CostCategories | `Costs.jsx` | Categories · Change account code · Saving code · Change where it applies · Saving change · Saved · Loading · Error |
| StockCost | `Costs.jsx` | Holdings · Lots · Calculation details · Cost withheld · Without the contract tier · Exporting · No stock · Loading · Error |
| SupplierPrepayment | `Costs.jsx` | Open · Calculation details · Delivered in full · Reverse · Reversing · Reversed · Without the farmer account tier · Loading |

## Farmer settlement (`Settlement.jsx`, F8.6, F8.7, SJ3, SJ4, S60 screens 5 and 6)

| Screen | File | States |
|---|---|---|
| StatementsDue | `Settlement.jsx` | Due · Overdue · Nothing due · Loading · Error |
| SettlementProposal | `Settlement.jsx` | Proposal · Net less · Net less with a reason · Netted less · Submitting · Pending approval · Approver view · Approved · Record payment · Recording payment · Paid · Reverse · Reversed · Settlement statement · Incomplete · Out of date · Nothing to net · Without the farmer account tier · Loading |
| SettlementBatches | `Settlement.jsx` | Batches · Batch · Incomplete · Out of date · Nothing to net · Nothing to settle · Loading · Error |

## The trade board's money states

Added beside its states, which are unchanged; nothing is removed. `../one_link/SettlementStates.jsx` holds them, and TradeBoard hands it one of these states. Choose them here or from the Trade Board's state control in the desktop app kit.

| Screen | File | States |
|---|---|---|
| TradeBoard | `../one_link/SettlementStates.jsx` | Cost tags · Supplier prepayment · Import trucks · Payments · Without the price tiers |

## How the screens meet the card

- **(f) Invoice preparation run.** Alka's record page (S17 screen 13): Period, Contracts, Loads prepared, Loads blocked, Amount and Prepared by, then Details, Related and History. Lines are Contract, Load, Basis, Weight (t), Price (USD/t), Amount (USD) and Status, each on its contract's basis: the offloaded weight on a delivered contract, the collected weight on a collected one, with the grade on a local farmer load. A load with no mill offload is Blocked: no mill offload, in no total, its load a blue link with Record offload; the Awaiting destination weight view lists only those. View details opens the reference chain (truck leg, truck, port schedule row and mill delivery note on an import; consignment, delivery note, goods received note, weighbridge ticket and truck on a farm-direct load). Finance takes a disputed line out with Exclude line and a reason; it stays on the run as Excluded with the reason under its status. Contract costs sit under the lines for reference only. Mark prepared, then Export draws the invoice-ready data.
- **(u) Withdrawn.** Withdraw takes a reason; the run reads Withdrawn, a banner gives who, when and why, the actions go, and the loads are free for a later run.
- **(g) Record invoiced and Record payment.** Record invoiced takes the lines it covers, the UAG invoice reference as free text with no default, no suggestion and no sequence, the invoice date, the amount (a different amount needs a reason) and the issued document. Record payment takes the date paid, currency, amount and reference, and shows the exchange rate for that day; with no rate for that day it asks for the rate and its source, never an earlier rate (Map D-40).
- **(h) Receivables pipeline** (M7.SET.04). One row a contract: Awaiting destination weight, Collected, Invoiced and Paid (t), then the gap to invoice (collected less invoiced) and the gap to pay (invoiced less paid) side by side, each worked out by `gapsOf` from that row, the `GapBar`, the gaps' value at the contract price with the Sell tier, the mill's terms and the oldest unpaid invoice, Overdue beyond the terms. A contract with nothing invoiced reads Ready to invoice.
- **(j) GL cost categories.** The twelve categories with their account codes (sample codes) and next change, then Where each category applies: a matrix by trade pattern, each cell Applies or Not applicable. Changing a code is a dated change; changing a cell is a high-impact change with a reason. Nothing posts to a ledger.
- **(k) Stock cost.** Holdings by site, stack, product and grade, each opening its lots: Agreed a tonne, Rate, Rate as at, Cost (USD/t) and Cost (USD), so each converted lot shows the rate and its date. The weighted average is an `IndicativeFigure`, opening Calculation details that name the purchase contract cost of each lot as the basis, the cost categories it leaves out and the rate with its date. A lot with no purchase price withholds its holding's cost with the reason, never a zero.
- **(l) Statements due** (M7.SET.08). When a period closes, every farmer owed a statement: contract type, cadence (Weekly, Fortnightly or Monthly), period, due date, the settlement's own state, Due or Overdue, and Run statement. A farmer on two cadences follows the most frequent, and the row says why. No tonnes or money, so no tier.
- **(m) Supplier prepayment.** The prepayment's amount, the price used and its tonnage equivalence, delivered against it and remaining, the expected recovery with its Calculation details, and the conversions to stock. Reverse takes a reason.
- **(n) Settlement proposal.** `NettingSides`: Owed to the farmer for grain beside Owed by the farmer, the prepayment first and then oldest first, the offset and the net, worked out. The exchange rate shows with its date. Net less, with a reason cannot confirm without the reason. Draft, then Submit for approval to Pending approval, Approve to Approved, Record payment to Paid, and Reverse with a reason. The Statement tab is the Settlement statement.
- **(t) Settlement batches.** Draft, Pending approval, Approved, Rejected and Paid. A batch without the day's exchange rate is incomplete and cannot be submitted; one built before a delivery changed is out of date with Refresh; a farmer with no debt reads Nothing to net; a day with no grain payable has nothing to settle.

## Rules these screens keep

- **The boundary words** (Map D-02, D-12): invoice preparation, invoice-ready data, settlement statement, indicative. One Link never issues, numbers, sends or fiscalises an invoice and never pays anyone. Invoice-ready data carries Not a tax invoice in its header and footer (`MoneyDocument`); the settlement statement is titled Settlement statement and carries no bank detail.
- **Indicative** (RL-NOT-VALUATION): every indicative figure is named Indicative and labelled Indicative, not a valuation, and no field is named a valuation or a month-end value.
- **Money and the price tiers** (UX-09, UX-10): invoice preparation and receivables money carry the Sell tier, stock cost the Contract tier, prepayments and settlement the Farmer account tier. A reader without the tier gets the same layout with the column left out, and the `Restricted` lock where a shared field has to appear: never a dash, a zero or a figure.
- **Statuses** are an icon and a word. Every save, submit, mark prepared, export, record, reverse and start button draws its working state.
- **Sample data** is fictional: Riverbend Milling, Crest Milling, Kafue Valley Milling, Antelope Mills, Lakeview Farms Ltd, Cameron Estates, Mpongwe Valley Farms, Chongwe Growers Ltd, Kazungula Freight, Northside Haulage, Corridor Clearing Ltd. People are M. Chanda (Operations), N. Phiri (Finance), T. Mwila (Managing Director) and R. Daka (stock control). Account codes are sample codes.

Components this card introduced: `IndicativeFigure` (with `INDICATIVE_LABEL`, `INDICATIVE_NAME`, `INDICATIVE_BASIS`, `indicativeName`, `indicativeCalc`) and `GapBar` (with `GAP_WORDS`, `gapsOf`) in `components/data`; `NettingSides` (with `SETTLEMENT_STATUS`, `SettlementStatus`, `NETTING_WORDS`, `nettingOrder`, `nettingOf`, `canConfirmPartial`, `PartialNettingDialog`) and `MoneyDocument` (with `MONEY_DOCUMENTS`, `BANK_FIELD`, `documentFields`) in `components/records`.
