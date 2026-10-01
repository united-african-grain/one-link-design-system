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
| SwitchesList | `Settings.jsx` | All · No match |
| SwitchRecord | `Settings.jsx` | On · Off · Propose change · Submitting · Pending approval · Rejected · Precondition not met |
| ApprovalStepsList | `Settings.jsx` | All |
| ApprovalStepRecord | `Settings.jsx` | Gate price · Variance hold · Edit · Saving |
| PolicyMethodsList | `Settings.jsx` | All |
| PolicyRecord | `Settings.jsx` | In force · Alternative chosen · Confirm change · Unavailable refused |
| ItemsToApprove | `Settings.jsx` | Waiting · Approving · Reject · Reject variance hold · As the administrator · Nothing waiting |

People and access (`People.jsx`, M1.DS.02) and records and data (`Records.jsx`, M1.DS.03) add their own tables here.

## Components this section introduced

- `Field`, `Input`, `Select`, `RadioList` (inputs/Field): form fields with the error under the field. RadioList draws an alternative that cannot be chosen yet as disabled, with its reason.
- `ReasonDialog` (feedback): the high-impact confirmation and Reject with a mandatory comment. Confirm waits for the reason.
- `Refusal` (feedback): "[Action] is not allowed. [Reason]."
- `RecordHighlights` (records): the highlights panel with the Details, Related and History tabs.
- `MenuRow` and AppShell's `context` (navigation): the Setup row in the user menu, and "Setup" beside the product name.

## Rules the screens keep

- Configuration words only: effective date, version, scope, bundle, approver. Never a table or column name.
- No commercial value in Setup. A commercial setting shows its name, owner and status (Hired store storage rate: Not set, owner Owner) and no Schedule change.
- Setup Home has the four cards and no KPI tiles or price figures. Recent changes reads Record, Change, By, Date, newest first.
- A value that does not exist is a blank cell, never "None". Impact is plain text, never a tag.
- Effective dates read DD MMM YYYY, 24-hour, CAT on first display.
- A pending proposal is a condition banner, with no other explanatory text. A change never takes effect in the past.
- Every save, propose and decide button shows its spinner in place until it lands.
- Sample data is fictional: SYN4702, Lakeview Farms Ltd, Riverbend Milling, Chisamba Shed, Mpongwe Depot, and people with initials only. The logo is the One Link mark; public copy says One Link.
- The look is this system's, the flow is the map's canvases (Henry's ruling of 30 Sep 2026, D-58). So buttons, radii and shadows are the current ones, not the canvas restyle.
