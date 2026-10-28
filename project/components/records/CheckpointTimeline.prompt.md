An import truck leg's checkpoints (M7.DS.01; S16 AL3 and AL5, Map D-22): Loaded at origin, In transit, Border arrival, Border departure and Offloaded, always all five and in that order, each with its status, date, who recorded it and its Source.

```jsx
<CheckpointTimeline checkpoints={[
  { key: 'loaded', status: 'done', date: '22 Sep 2026, 08:40', by: 'K. Zulu', source: 'port-schedule' },
  { key: 'in-transit', status: 'done', date: '22 Sep 2026, 09:10', by: 'System', source: 'port-schedule' },
  { key: 'border-arrival', status: 'done', date: '24 Sep 2026, 11:20', by: 'M. Chanda', source: 'transporter-call' },
  { key: 'border-departure', status: 'waiting' },
]} />
<CheckpointTimeline variant="list" checkpoints={...} />
```

- A position the transporter reports (a call, a message) is a checkpoint row like any other, its Source naming the report: Transporter call. It is a plain labelled field. Never a badge, a chip, a provenance mark or a confidence score.
- A source reports a weight, a position or both (`CHECKPOINT_SOURCES`). `checkpointSource` returns '' for a pair that cannot be: a reported position is never Source: Weighbridge, and a transporter's report never stands for a weight. Capture forms offer `checkpointSourceOptions(key)` only.
- The weight's source stays on the weight checkpoints (Port schedule on Loaded at origin, a mill source on Offloaded), apart from the position sources.
- An offload's Source is one of the mill's five, `OFFLOAD_SOURCES` (M7.IMP.05): `mill-call` Mill call (typed from a phone call), `email` Email, `mill-offload-sheet` Mill offload sheet, `scanned-slip` Scanned slip (a photographed mill slip confirmed through OCR) and `mill-portal` Mill portal (the mill's own entry). An offload is never Source: Weighbridge, and never Port schedule. Record offload offers `checkpointSourceOptions('offloaded')`, which is Mill call, Email and Mill offload sheet: Scanned slip and Mill portal are set by how the offload arrived, never picked. An offload that matched no leg reads its Source through `offloadSource(key)`.
- Statuses are Done and Waiting, an icon and a word. A checkpoint not reached is blank, never "Not recorded" (UX-09).
- `CHECKPOINTS`, `CHECKPOINT_SOURCES` and `CHECKPOINT_STATUS` are the one copy module for these words: screens import them and never retype them.
