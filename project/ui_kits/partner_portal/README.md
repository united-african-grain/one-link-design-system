# UI kit — Partner Portal (390)

The same system with no module tab row: header is the One Link lockup, "Partner Portal", and the counterparty avatar. Copy is plainer than the platform's and never says "GRN" in a heading.

- `PortalHome.jsx` → `PortalHome` (home: what needs you, deliveries list with confirmation chips) and `PortalConfirm` (booked weight in display-4-condensed, provenance chip, two-up Confirm | Dispute, busy action, success banner).
- `index.html` shows both screens side by side and the home → confirm flow is live (tap Review or a "Confirm now" row).
