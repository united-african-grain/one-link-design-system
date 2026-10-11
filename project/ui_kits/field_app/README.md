# UI kit: the UAG One Link app (390 only)

The field staff's phone app, offline first. `index.html` opens on the delivery proof online and offline, and two segmented controls switch the screens and their states. Every state opens directly with `?screen=<Screen>&state=<State>`, which the screenshot review uses at 390.

`DeliveryProof.jsx` covers all three steps (Photo · Sign · Send) and both states: online (Send now) and offline queued (`refresh-cw 1 waiting to send`, action reads "Send when signal returns" and the busy state persists).

## Enrolment, sign-in, field tasks and capture (`FieldApp.jsx`, M4.DS.03)

| Screen | File | States |
|---|---|---|
| EnrolPhone | `FieldApp.jsx` | Enrolment code · Wrong code · Code expired · Enrolling |
| AppSignIn | `FieldApp.jsx` | Email and password · Incorrect credentials · Account locked · No connection · Code · Wrong code · Signing in |
| PinSet | `FieldApp.jsx` | Choose a PIN · Confirm PIN · Does not match · Saving · Use fingerprint |
| PinUnlock | `FieldApp.jsx` | Fingerprint · Switching · PIN · Wrong PIN · Unlocking · Locked |
| FieldTasks | `FieldApp.jsx` | Tasks · Offline · Empty |
| ProveDelivery | `FieldApp.jsx` | Photograph · Capturing · Signature · Details · Signature missing · Sending · Queued · Synced |
| DeliveryRefused | `FieldApp.jsx` | Reason · Missing reason · Sending · Queued |
| PendingSync | `FieldApp.jsx` | Offline · Sending · Damaged file · All synced |
| SignOutWarning | `FieldApp.jsx` | Pending captures · Signing out |
| RevokedPhone | `FieldApp.jsx` | Capture blocked |

- The phone is enrolled once with the code the administrator was shown once in Setup. Full sign-in happens once while connected (S08 J1); after that the app opens with the PIN or the fingerprint. Five wrong PINs lock PIN entry until the person signs in again.
- The signed-out screens keep the app's current sign-in design and wording (Henry's ruling of 30 Sep 2026): the name, one sentence and the ways in, nothing before sign-in. The PIN screens show nothing of the business either.
- Every capture screen shows the connection status and Pending sync (count) (`CaptureStatus`), and the count is never 0 while a capture waits (`pendingSyncCount`). Task screens hide the bottom bar, carry the back chevron and put the main action full width at the bottom (UX-31). The task list and Pending sync carry the field staff's own bottom bar, Tasks and Pending sync (`MobileShell` `modules`).
- Proof of delivery needs both the photograph and the receiver's signature (F4.8, F3.9): Send stays disabled until both are captured. Once pressed, Send stays busy until the capture has synced, however long the phone is offline.
- A capture waiting to send is a `CaptureTile`: busy until synced, and a damaged file reads "File is damaged. Capture it again." with Capture again.
- A revoked phone reads "Capture is not allowed. This phone is revoked." and says what to do next.
- Operations words only. No price, value or margin anywhere in the kit.

## The Managing Director on the phone (`OwnerApp.jsx`, M5.DS.01)

Owen's screens as S08 J11 locks them, at 390, with his own bottom bar (Home, Approvals, Exceptions). The figures are Home's (`../one_link/Home.jsx`), so the phone and the web agree.

| Screen | File | States |
|---|---|---|
| OwnerHome | `OwnerApp.jsx` | With items · No items · Stale data |
| OwnerList | `OwnerApp.jsx` | Items to approve · Exceptions · No items |
| OwnerApproval | `OwnerApp.jsx` | Pending approval · Approving · Reject · Rejecting · Approved |
| OwnerMobileException | `OwnerApp.jsx` | Open · Acknowledging · Acknowledged |

- Mobile Home carries Last refreshed, the KPI tiles, Items to approve and Exceptions. An approval offers Approve and Reject, Reject asking for a comment before it is enabled (UX-22); an exception offers Acknowledge. No other action appears on the phone.
- Approve, Reject and Acknowledge draw their working state until the decision lands. The approval and the exception are task screens: no bottom bar, the back chevron, the actions full width at the bottom (UX-31).

## Trading and Transport on the phone (`TradingApp.jsx`, M6.DS.01)

The trading screens of the UAG One Link app at 390 (M6.APP.01): Trading's contracts and short list with Trading's own bottom bar (Contracts, Short list), and Transport's day of trucks with Transport's (Day plan, Loading orders). The trade approval on the phone is the Managing Director's `OwnerApproval` above, which shows Trade SYN4810's legs and margin; it is not drawn twice. The rows are the Trading workspace's (`../trading_workspace/Workspace.jsx`), so the phone and the web agree.

| Screen | File | States |
|---|---|---|
| AppContracts | `TradingApp.jsx` | By status · Wheat · No signal |
| AppShortList | `TradingApp.jsx` | Short contracts · Suppliers to call · No signal |
| AppDayPlan | `TradingApp.jsx` | Today · No signal · No loads |

- Contracts are grouped by status (Pending approval, Approved, Active, Draft), the commodity marker on every row, with tonnes left and, for a sale, its cover.
- The short list ranks short contracts by severity; a contract opens its suppliers to call, each with the reason and a contact or "no contact on record".
- The day plan lists today's loads per contract: transporter, truck, where it loads, the loading order, tonnes and whether it has loaded (Planned, Loading, In transit).
- With no signal the phone shows "No signal. Last refreshed 07:02 CAT" with the warning icon and keeps what it last loaded. No price appears on these screens.

## Imports on the phone (`ImportsApp.jsx`, M7.DS.01)

The operations lead's import schedule and Record offload (S16 AL3, AL4; canvas S17 "Record offload on the app"), Finance's pipeline and stock control's stock, at 390. The legs, checkpoints and loss allowance are the Imports kit's (`../imports/Schedule.jsx`), so the phone and the web agree.

| Screen | File | States |
|---|---|---|
| ImportScheduleApp | `ImportsApp.jsx` | Schedule · Leg KAL-11 · Offline · No legs |
| RecordOffloadApp | `ImportsApp.jsx` | Weight entered · Missing weight · Beyond tolerance · Recording · Queued · Recorded |
| PipelineApp | `ImportsApp.jsx` | Pipeline · No rate today · Loading |
| StockApp | `ImportsApp.jsx` | Position · On the road · Loading |

- Record offload is a capture screen (UX-31): the connection status and Pending sync (count), the back chevron, no bottom bar, and the full-width 48 px Record offload at the bottom, busy until the offload has synced however long the phone is offline. The source is the mill's (Mill phone call, Mill offload sheet, Mill email); the difference against the loss allowance, 0.080 t a truck for bulk grain, is computed, never typed.
- A truck leg's checkpoints are `CheckpointTimeline` stacked (`variant="list"`): a position the transporter reported shows its Source, never a badge.
- Finance's pipeline: Still to invoice in tonnes, Today's USD rate (Not set when it has not been entered), Receivables ageing and Payables ageing in USD. The schedule and stock control's screens carry no money.
