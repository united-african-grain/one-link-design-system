Use `PermitHeadroom` wherever a mill's import permit meets an allocation (M6.DS.01, M6.COV.01): beside the tonnage on Allocate, once per mill on a shipment, and on a permit's row in the permits list.

```jsx
<PermitHeadroom permit="SI-2026-014" mill="Riverbend Milling" holder="Riverbend Milling" period="01 May 2026 to 30 Apr 2027"
  wanted="10,400" allowed="10,000" booked="9,950" adding={typed} onOpen={() => open('SI-2026-014')} />
```

- Four figures, whole tonnes with t in the label (UX-12): Wanted, Allowed, Booked and Headroom, the headroom in the condensed face. Wanted is left out where the mill has no monthly orders.
- `adding` is the allocation being typed. The panel shows the headroom after it as it moves; one that would pass the permit draws `Refusal`: "Allocation is not allowed. Exceeds permit SI-2026-014 headroom of 50 t by 50 t." (UX-21). The screen disables Allocate at the same time; `permitHeadroom(...)` gives it `refused`, `excess` and `after`. Exactly 0 headroom after the allocation is allowed.
- Ordered above the permit reads "Ordered 400 t more than permitted" with the warning icon. It is a flag, never a block.
- A permit is tonnes only: no price, value or margin, so every role that may see allocations sees it whole.

The web app's twin is `ol-permit-headroom`.
