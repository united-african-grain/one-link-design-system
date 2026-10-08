A leg's transit residue (M4.DS.01, M4.VIR.03): the tonnes lost on the road beyond the allowance, and its write-off. A transfer clears on its goods received note; a difference within the allowance clears on its own; bagged product has zero allowance, so any bag missing is residue.

```jsx
<TransitResidue residue="0.300" />                       // Request write-off
<TransitResidue residue="0.300" requesting />            // its working state
<TransitResidue residue="0.300" writeOff="pending" />    // Pending approval
<TransitResidue residue="0.300" writeOff="approved" />
```

- Requested is Pending approval until the approver decides (Owen or the Managing Director's deputy). It is never drawn as done before that, so stock is not shown as written off while the decision is open.
- No value: the residue is in tonnes. Stock control sees no money (UX-10).
