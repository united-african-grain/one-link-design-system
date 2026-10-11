# UI kit: Imports (1440 and 390)

The M7 import screens (M7.DS.01, UAG-99): imported wheat from the port to the mill, and fertiliser from the dispatch report onto the road. `index.html` opens on the operations lead's Home, and two segmented controls switch the screens and their states. Every state opens directly with `?screen=<Screen>&state=<State>`, which the screenshot review uses at 1440 and 390.

The screens compose the published components and tokens only, with the kit parts of `../one_link/` (`Shell.jsx`, and Home's `HmHead`, `HmCard`, `HmTable`, `HmFacts`, `HmLink`, `HmRefreshed`). The look is this system's current one (Henry's ruling of 30 Sep 2026): the canvases (S17 Alka, S15 Ryan, S09 Owen, S61 Jacques) give layout, content and flow; UX-01 to UX-33 win where a canvas detail differs (Map D-43). Frames: the operations lead (M. Chanda: Home, Logistics with the import sections, Finance with Import allocation, Counterparties, Reports), the warehouse (K. Zulu), stock control (R. Daka) and the Managing Director (T. Mwila).

## The operations lead's import screens (`Schedule.jsx`, S16 AL1 to AL5)

| Screen | File | States |
|---|---|---|
| OperationsHome | `Schedule.jsx` | With items · Cannot invoice yet · Uploads today · Waiting on partners · No items · Stale data · Loading · Error |
| PortSchedulePreview | `Schedule.jsx` | Validating · Row to fix · Ready to import · Importing · Imported · Failed |
| ImportSchedule | `Schedule.jsx` | By mill · By port · At the border · Exporting · Nothing scheduled · No results · Loading · Error |
| TruckLeg | `Schedule.jsx` | At the border · Record border departure · Record offload · Offload missing weight · Recording offload · Within allowance · Beyond tolerance · Documents not released · Release port documents · Releasing · Related · History · Loading |

## The corridor screens (`Corridor.jsx`, Proposed: no canvas yet)

| Screen | File | States |
|---|---|---|
| TransportPerformance | `Corridor.jsx` | Week by week · Behind schedule · Exporting · No legs · Loading |
| ShortageClaim | `Corridor.jsx` | Draft · Submitting · Pending approval · Approved · Within tolerance · Warehouse view · History |
| AllocationDrawdown | `Corridor.jsx` | All allocations · Over-delivered · Beyond permit · Behind schedule · Calculation details · Nothing allocated · Loading |
| ContractedRhythm | `Corridor.jsx` | Rhythms · New rhythm · Missing fields · Saving · Saved · No rhythms |
| ToleranceAgreements | `Corridor.jsx` | Agreements · Agreement · Evidence missing · Activating · No agreements |
| UnmatchedOffloads | `Corridor.jsx` | Unmatched · Match to leg · Matching · No items |

## Stock control's dispatch report (`Dispatch.jsx`, S14 R1)

| Screen | File | States |
|---|---|---|
| DispatchUpload | `Dispatch.jsx` | No file · File chosen · Previewing · Not a dispatch report |
| DispatchPreview | `Dispatch.jsx` | Validating · Classifying · Ready to import · Importing · Imported · Failed |

## The M7 states of existing screens

Added beside the existing states, which are unchanged; nothing is removed.

| Screen | File | States |
|---|---|---|
| Coverage | `../one_link/Coverage.jsx` | In transit |
| StockPosition | `../one_link/StockControl.jsx` | Stock by route · Direct share |
| OnTheRoad | `../one_link/StockControl.jsx` | All |
| Home | `../one_link/Home.jsx` | With items |

- **Coverage, In transit:** supply on the way (640 MT, imported legs loaded and not yet offloaded) sits beside the gap, with the in-transit column by mill. It is never subtracted: short stays sold minus firm secured.
- **Stock control's Home, Stock by route:** the position by product and pack with On the road beside Physical warehouse, Virtual warehouse, Committed, On hold and Free; four tiles (UX-08); stock by route this season with the direct share, which opens Calculation details (Direct share). Import dispatch report is the Home's action.
- **On the road** already lists each leg with its route as plain text, its dispatch date and age; M7 adds no state to it.
- **The Managing Director's Home** keeps its three KPI tiles and gains no imports lane or tile. The imports work sits on the operations lead's Home: Cannot invoice yet, Uploads today, Waiting on partners and Exceptions.

The UAG One Link app draws the import schedule, a truck leg's checkpoints, Record offload, Finance's pipeline and stock control's stock at 390 (`../field_app/ImportsApp.jsx`).

## Rules these screens keep

- **No money on the import schedule, for anyone**, because the mills see the same view (M7.IMP.03, UX-09, UX-10). Its Invoice column says Ready to invoice or Blocked, never an amount, and the blocking total, Cannot invoice yet, counts legs and tonnes. Stock control sees no price or value anywhere. The only money in the kit is the shortage claim's value and contract price, and the operations lead's exceptions' value at risk; the warehouse's view of the claim shows the `Restricted` lock in their place, never a dash, a zero or a figure.
- **A leg is a load** (UX-32): In transit until the mill offloads it, Delivered with the offload, Reconciled within the loss allowance. The difference is loaded minus offloaded, computed and never typed (RL-DIFF), against the allowed loss on the road, 0.080 t a truck for bulk grain and 0 for bagged (Map D-44, CFG-LOSS), in a Reconcile card that reads Within allowance or Beyond tolerance (UX-20). The canvas's 1.0% is superseded.
- **Checkpoints** are `CheckpointTimeline`: Loaded at origin, In transit, Border arrival, Border departure and Offloaded, each with its status (Done, Waiting, or blank when not reached), date, recorded by and Source. A position the transporter reports is a checkpoint row whose Source names the report (Transporter call): a plain labelled field, no badge and no confidence, and never Source: Weighbridge. The weight's source sits on the weight checkpoints (Port schedule, Mill offload sheet), apart.
- **The truck leg record page** (UX-19): the highlights with Vessel, Mill, Contract, Transporter, Truck and Loaded, then Details, Related and History. A truck at the border and not departed is one condition banner, the only sentence on the page (UX-23). Record offload, Record border departure and Release port documents are 480 px dialogs titled with the act and the leg (UX-22); a phone draws them as sheets.
- **Lists** (UX-07): By mill and By port are saved views in the view selector, never pill chips; vessel, corridor and checkpoint are filters. A mill group's vessel, allocation and totals are labelled fields, not a run-on line (UX-26). Weights on a leg carry three decimals, totals none, the unit in the header (UX-12). Dates read 22 Sep 2026, 08:40, with CAT in the header (UX-13).
- **The operations lead's Home** (UX-05, UX-08): Home and Last refreshed; the four queue counts, Cannot invoice yet, Uploads today, Waiting on partners and Exceptions, are filters on the lists below, not tiles. Uploads today lists each expected upload with its uploader, time, rows and status: Imported (never Committed, UX-33), Ready to import with its rows to fix, and Not received by its due time (AL1).
- **Previews** (UX-25): the File card, summary tiles, rows with their Result, Discard and Import; Import stays disabled while a row has an error. The dispatch report preview classifies each line Physical warehouse, Virtual warehouse or Direct delivery, a virtual or direct line naming its farmer, and sorts the lines into On the road, At warehouse awaiting receipt and Already received with totals. A re-sent line is recognised, not duplicated.
- **Statuses** are an icon and a word. Every save, record, release, import, match, activate, submit and export button draws its working state (a spinner, no label animation).
- **Sample data** is fictional: Riverbend Milling, Crest Milling, Kafue Valley Milling, Greenfield Agri, MV Kalahari, MV Zambezi Star, Kazungula Freight, Northside Haulage, Ridgeway Transport, Corridor Clearing Ltd, Lakeview Farms Ltd, Cameron Estates. People are M. Chanda (Operations), K. Zulu (Warehouse), R. Daka (stock control), N. Phiri (Finance) and T. Mwila (Managing Director).

Component this card introduced: `CheckpointTimeline` (with `CHECKPOINTS`, `CHECKPOINT_SOURCES`, `CHECKPOINT_STATUS`, `checkpointSource`, `checkpointSourceOptions` and `CheckpointStatusMark`) in `components/records`, the one copy module for checkpoint and source words.
