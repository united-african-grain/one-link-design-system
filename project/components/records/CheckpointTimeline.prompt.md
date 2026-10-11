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
- The weight's source stays on the weight checkpoints (Port schedule on Loaded at origin, Mill offload sheet on Offloaded), apart from the position sources.
- Statuses are Done and Waiting, an icon and a word. A checkpoint not reached is blank, never "Not recorded" (UX-09).
- `CHECKPOINTS`, `CHECKPOINT_SOURCES` and `CHECKPOINT_STATUS` are the one copy module for these words: screens import them and never retype them.
