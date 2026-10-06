The Weights card of the Scanned slip screen: Field, Read from slip, Confirmed.

```jsx
const [fields, setFields] = useState(FIELDS);
const change = (key, patch) => setFields((fs) => fs.map((f) => (f.key === key ? { ...f, ...patch } : f)));
<Card title="Weights"><FieldCheck fields={fields} onChange={change} evidence="7C4E 19A2 D0B3 B21A" /></Card>
<Button disabled={!fieldsReady(fields)} loading={confirming}>Confirm weights</Button>
```

- A doubtful reading shows the status Check and a red ring on its Confirmed input. It stays open until the clerk ticks Checked or edits the value; Confirm weights stays disabled while any field is open (UX-17).
- A corrected field keeps the reading in Read from slip and the clerk's value in Confirmed, marked Corrected.
- No confidence level, word or score is shown. The reading's confidence decides `doubtful` and nothing else.
- The inputs exist only with `evidence`, the fingerprint of the photo beside the table. There is no typed weight anywhere (R-08).

For a document rather than a slip, name the column `readLabel="Read from document"`, and pass `onFieldFocus` to learn which field is being looked at, so the EvidenceViewer beside it can outline where that field was read from.
