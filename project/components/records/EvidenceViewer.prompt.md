The slip photo at reading size, in the Slip photo card beside the Weights table and on a ticket's Details tab.

```jsx
<Card title="Slip photo"><EvidenceViewer src="../../assets/samples/slip-wbt10001614.svg" fingerprint="7C4E 19A2 D0B3 B21A" /></Card>
```

Zoom in and Zoom out step by 50% between 100% and 300%; the photo scrolls inside its frame when zoomed. The fingerprint is the short form of the photo's hash under the label Fingerprint: the same photo used twice is refused by naming the ticket it is on. `EvidenceTile` stays the 96 by 72 thumbnail for lists and evidence rows.

No weight is ever entered without one of these beside it (R-08): `FieldCheck` only offers its Confirmed inputs when it is given the `evidence` it sits beside.

To outline where each field was read from (a document's reading, M3.ING.06), pass `regions` as boxes in fractions of the image and name the one to draw solid:

```jsx
<EvidenceViewer src={photo} fingerprint="7C4E 19A2 D0B3 B21A" regions={[{ key: 'gross', x: 0.52, y: 0.31, width: 0.2, height: 0.05 }]} activeRegion="gross" />
```
