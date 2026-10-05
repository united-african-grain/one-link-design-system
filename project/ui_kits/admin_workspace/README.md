# UI kit: Setup, the admin workspace (1440 and 390)

Setup is a view inside One Link, opened from the user menu by holders of the Administrator bundle (map UX-06). The folder is `admin_workspace`; on screen the view is only ever called Setup. The kit is the design: the web app ports a Setup screen from here, in the feature card that first needs it, and never styles a Setup screen of its own.

`index.html` mounts the Setup frame. The Setup navigation switches sections, and two segmented controls switch a section's screens and a screen's states. Every state opens directly with `?screen=<Screen>&state=<State>`, which is what the screenshot review uses at 1440 and 390.

`Shell.jsx` holds the frame and the shared parts: `SetupFrame`, the design system's `AppShell` with `context="Setup"`, "Search Setup", Exit Setup and Help. It also holds:
- `SETUP_NAV`, `shippedNav`, which drops the items whose milestone has not shipped
- `SetupHead`, the sentence-case title with its count
- `CountCard`, a titled card with a count, which says "No [objects] to display." at 0
- `ListView` (UX-07) and `SetupTable`, a table that scrolls on a phone
- `RecordLink`, `HeaderLink` and `DrawnElsewhere`

It reuses `Sections`, `ScrollRow` and `PageHead` from `../one_link/Shell.jsx`.

## Settings and governance (`Settings.jsx`, M1.DS.01)

| Screen | File | States |
|---|---|---|
| SetupHome | `Settings.jsx` | Needs attention · Nothing waiting · Before reference data |
| UserMenuWithSetup | `Settings.jsx` | Administrator · Without the Administrator bundle |
| SettingsList | `Settings.jsx` | All · High impact · Not set · No match |
| SettingRecord | `Settings.jsx` | Change scheduled · No change scheduled · Schedule change · Value in the past · Scheduling · High-impact confirmation · Lookup · History · Commercial |
| ScopedValues | `Settings.jsx` | Bagged at Chisamba Shed · Default case |
| SwitchesList | `Settings.jsx` | All · No match · Weight source per site |
| SwitchRecord | `Settings.jsx` | On · Off · Propose change · Submitting · Pending approval · Rejected · Precondition not met |
| ApprovalStepsList | `Settings.jsx` | All |
| ApprovalStepRecord | `Settings.jsx` | Gate price · Variance hold · Edit · Saving |
| PolicyMethodsList | `Settings.jsx` | All |
| PolicyRecord | `Settings.jsx` | In force · Alternative chosen · Confirm change · Unavailable refused |
| ItemsToApprove | `Settings.jsx` | Waiting · Approving · Reject · Reject variance hold · As the administrator · Nothing waiting |
| FiguresList | `Settings.jsx` | All |
| FigureRecord | `Settings.jsx` | Contract · Change scheduled · Change tier · High-impact confirmation |

## People and access (`People.jsx`, M1.DS.02)

| Screen | File | States |
|---|---|---|
| SignIn | `People.jsx` | Email and password · Incorrect credentials · Account locked · Session expired · Code · Wrong code · Signing in |
| Activate | `People.jsx` | Activation code · Wrong code · Code expired · Choose a password · Set up two-step sign-in · Wrong two-step code |
| UsersList | `People.jsx` | All · Locked · No match |
| NewUser | `People.jsx` | Form · Missing fields · Saving · Code shown once |
| UserRecord | `People.jsx` | Active · Invited · Code expired · Locked · Reissued code · Reset authenticator · Deactivated · Deactivated for inactivity · Own record · Only administrator |
| BundlesList | `People.jsx` | All |
| BundleRecord | `People.jsx` | Finance · Edit · Submitting · Pending approval · Own bundle refused |
| AccessLog | `People.jsx` | Access log · Exporting · No match |
| AccessReview | `People.jsx` | Who holds what · Exporting |

The signed-out screens, Sign in and Activate, keep the app's current design and wording (Henry's ruling of 30 Sep 2026 on this card). That means the AuthShell frame, a heading and one sentence, Forgot password and Back to home. They show nothing before sign-in: no name, reference, figure or preview. The user menu's "Last sign-in" line is AppShell's `user.detail`, drawn in Settings' UserMenuWithSetup.

## Records and data (`Records.jsx`, M1.DS.03)

| Screen | File | States |
|---|---|---|
| SitesList | `Records.jsx` | All · Inactive · No match |
| SiteRecord | `Records.jsx` | Details · Related · History · Edit · Conflict on save · Effective-dated change · Deactivate refused |
| CorridorsList | `Records.jsx` | All |
| ProductsList | `Records.jsx` | All |
| DeliveryPointsList | `Records.jsx` | All |
| OperatingCalendar | `Records.jsx` | Week · Holiday added |
| ReferenceList | `Records.jsx` | Counterparty classes · Grades · Seasons |
| CounterpartiesList | `Records.jsx` | All · Flagged · No match |
| CounterpartyRecord | `Records.jsx` | Details · Related · History · Without the contacts capability · Same name |
| NameResolve | `Records.jsx` | Suggestions · Remembered match · No match · Re-point |
| UploadPreview | `Records.jsx` | Validating · Preview with errors · Preview clean · Imported · Failed · Duplicate file · Without the price tier · Wrong type · Too large · Protected · Empty · Wrong sheet · Heading not found · Columns not read · Price tier missing · Earlier version · Amendment · Confirm amendment · Confirming amendment · Already recorded · Differs from recorded · Sheet figure differs · Duplicate refused · Importing |
| TemplateBuilder | `Records.jsx` | Columns · Who may upload · Versions |
| BusinessChanges | `Records.jsx` | Business changes · Without the price tier · Exporting · No match |
| LedgerView | `Records.jsx` | Entries · Posted entry · Reverse · Reversed |
| ContractView | `Records.jsx` | With the contract tier · Without the contract tier |

Reference data (sites and storage units, corridors and routes, products, delivery points with their capture mode, operating calendars in Zambian time, and counterparty classes, grades and seasons) uses one list view and record page. A site never offers Delete: it offers Deactivate, refused in the blocked pattern while stock remains, and a change takes effect from a date and time. The counterparty register, the counterparty record, the ledger and the contract view draw outside Setup, in One Link's own frame. The Business changes log is also the Audit logs page's second tab.

The upload and import preview composes `ImportPreview`: a File card, the tiles, the rows with Row and Result, and Import disabled while any row has an error. A file refused before it is read says why under the File field, in the S57 "[Field] [requirement]." pattern. A price column is left out for a viewer without its tier. A price shown on a shared layout, such as a contract or a Business changes row, is the `Restricted` mark: a lock, no value, and the tooltip Restricted.

## Data: templates, upload history and production readiness (`Data.jsx`, M3.DS.01)

The Setup navigation's Data group (S11), renamed from Uploads, holds Templates, Upload history and Production readiness (Henry, 5 Oct 2026: navigation entries may be added, renamed or regrouped; the layout does not change).

| Screen | File | States |
|---|---|---|
| TemplatesList | `Data.jsx` | All · No match |
| NewTemplate | `Data.jsx` | Form · Missing fields · Saving |
| TemplateVersion | `Data.jsx` | From a headers file · From an upload · Remove a column · Make a column required · Saving |
| TemplateCompare | `Data.jsx` | Version 1 and version 2 |
| UploadHistory | `Data.jsx` | All · Reversed · Discarded · No match |
| UploadRecord | `Data.jsx` | Reversed · Related · History · Imported · Reverse · Reversing · Reverse refused |
| ProductionReadiness | `Data.jsx` | Evidence missing · Ready to open · Propose opening · Submitting · Pending approval · Open |

- Templates is a list view (UX-07): name, what it loads, the current version, its effective date, who may upload and the status, with New as the primary button. Who may upload is set per template by the administrator (Map D-39); no person is named by default, so a template with no bundle reads Not set. Statuses are icon and word: Active, Draft, Scheduled, Retired (UX-14).
- The template record is `TemplateBuilder` (M1.DS.03), which gains New version. The version editor maps each column of the file to a field, its type, Required and its price tier, tested against a header row from a file of headers only or captured from an upload whose headers did not match (`ColumnMapping`). A tier from the figure-to-tier mapping is read-only, with no control that removes it. A destructive change (a column removed, moved to another field, a new type, an optional column made required) opens the existing `ReasonDialog` naming the change, and Save version waits for the reason (UX-22).
- Version comparison draws version 1 beside version 2 with Added, Removed, Remapped and Changed marked (`VersionCompare`).
- The template editor shows column names, types and tags, never a row's values (S10 control 4).
- Upload history is a list view: each upload with its file, fingerprint, template version, uploader, time, rows, rows imported and status (Imported, Reversed, Discarded). An upload's record page in its Reversed state names who reversed it, when and why, lists the reversal records on the Related tab and the warnings recorded at import with their cells. Reverse is the existing `ReverseDialog`; refused, it reads "Reverse is not allowed. [Reason]." with the records that depend on the upload.
- The upload preview additions (`UploadPreview`, from Heading not found to Importing) are the checks of `ImportPreview`: each cites its cell or record, warnings never stop Import, an amendment does until it is confirmed (Old value and New value columns and a confirm step), and a refused file shows no rows.
- Production readiness is the evidence record with the Records open switch, drawn with the switch pattern (highlights, Propose change, the approver). While it is off, a condition banner says so. Evidence names who recorded it, when and where it sits; a missing piece reads Missing.

## Components this section introduced

- `Field`, `Input`, `Select`, `RadioList` (inputs/Field): form fields with the error under the field. RadioList draws an alternative that cannot be chosen yet as disabled, with its reason.
- `ReasonDialog` (feedback): the high-impact confirmation and Reject with a mandatory comment. Confirm waits for the reason.
- `Refusal` (feedback): "[Action] is not allowed. [Reason]."
- `RecordHighlights` (records): the highlights panel with the Details, Related and History tabs.
- `Count` (data): the count beside a title or in a card header. The kit's `CountBadge` is this.
- `MenuRow` and AppShell's `context` (navigation): the Setup row in the user menu, and "Setup" beside the product name.
- `OneTimeCode` (feedback): the activation code, shown once, with Copy and its expiry (M1.DS.02).
- `CheckboxList` (inputs/Field) and Input's `size="large"`: bundles and sites, and the signed-out fields (M1.DS.02).
- AppShell's `user.detail`: "Last sign-in" in the user menu (M1.DS.02).
- `ColumnMapping` (+ `TierTag`, `mappingChanges`, `MAPPING_TYPES`, `TIER_TAGS`), `VersionCompare` (+ `compareVersions`, `COMPARE_MARKS`) (records, M3.DS.01): the template version editor's mapping and two versions compared. `ImportPreview` gains its checks (`PREVIEW_CHECKS`, `PREVIEW_STATES`, `previewBlocked`, `file.template`, `file.inForce`, `file.missing`, `file.notRead`, `refusal`), and its Result column wraps so a check is read in full.
- `ReverseDialog` (records): "Reverse [record]? A reversal entry will be created." with a required reason, for a permanent record, which never draws Edit (M1.DS.03). It composes `ReasonDialog`; the restricted figure is the existing `Restricted`, and the import preview is the existing `ImportPreview`.

## Rules the screens keep

- Configuration words only: effective date, version, scope, bundle, approver. Never a table or column name.
- Figures and price tiers (M1.ID.04) is the Managing Director's catalogue of which tier receives each money figure. It shows tiers and who receives them, never a figure's value; a change of tier is high-impact.
- No commercial value in Setup. A commercial setting shows its name, owner and status (Hired store storage rate: Not set, owner Owner) and no Schedule change.
- Setup Home has the four cards and no KPI tiles or price figures. Recent changes reads Record, Change, By, Date, newest first.
- A value that does not exist is a blank cell, never "None". Impact is plain text, never a tag.
- Effective dates read DD MMM YYYY, 24-hour, CAT on first display.
- A pending proposal is a condition banner, with no other explanatory text. A change never takes effect in the past.
- Every save, propose and decide button shows its spinner in place until it lands.
- Sample data is fictional: SYN4702, Lakeview Farms Ltd, Riverbend Milling, Chisamba Shed, Mpongwe Depot, and people with initials only. The logo is the One Link mark; public copy says One Link.
- The look is this system's, the flow is the map's canvases (Henry's ruling of 30 Sep 2026, D-58). So buttons, radii and shadows are the current ones, not the canvas restyle.
