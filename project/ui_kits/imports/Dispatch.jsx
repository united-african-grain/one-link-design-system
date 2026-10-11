/** Imports: stock control's dispatch report (M7.DS.01, UAG-99; S14 R1, canvas S15 "One Link Ryan" screens 3 to 5):
    choosing the file, then the preview where each line is classified Physical warehouse (the default), Virtual
    warehouse or Direct delivery, a virtual or direct line naming its farmer, and the lines sorted into On the road, At
    warehouse awaiting receipt and Already received, with totals, then Discard or Import. Every screen takes `state`,
    one of its IM_DISPATCH_STATES entry, for ?screen=&state=.

    The dispatch report is uploaded as received and never re-keyed (RL-DISPATCH-NOREKEY); it is never a receipt. A
    re-sent line is recognised, not duplicated. Stock control sees stock in tonnes and bags only: no price, value or
    margin anywhere (UX-10). Import, never Commit (UX-33). Fictional sample data on the golden fixture names. */

export const IM_DISPATCH_STATES = {
  DispatchUpload: ['No file', 'File chosen', 'Previewing', 'Not a dispatch report'],
  DispatchPreview: ['Validating', 'Classifying', 'Ready to import', 'Importing', 'Imported', 'Failed'],
};

export function imDispatchFrame(screen) {
  return { who: 'stock', module: 'home', breadcrumb: ['Home', 'Dispatch report', screen === 'DispatchUpload' ? 'Import' : 'Preview'] };
}

/** The three classifications (S14 R1) and the three places a dispatched line can be (S14 R1 step 4). */
export const IM_CLASSIFICATIONS = ['Physical warehouse', 'Virtual warehouse', 'Direct delivery'];
export const IM_SPLITS = ['On the road', 'At warehouse awaiting receipt', 'Already received'];

/** The dispatch report of 22 Sep 2026 from the port of Beira, as received: one line a truck. */
export const IM_DISPATCH = [
  { row: 2, leg: 'LEG-5101', truck: 'BCA 2210', product: 'Urea', pack: '50 kg bag', bags: '600', tonnes: '30.000', classification: 'Physical warehouse', farmer: '', split: 'On the road' },
  { row: 3, leg: 'LEG-5102', truck: 'BCA 2211', product: 'Urea', pack: '50 kg bag', bags: '600', tonnes: '30.000', classification: 'Physical warehouse', farmer: '', split: 'On the road' },
  { row: 4, leg: 'LEG-5103', truck: 'BCA 2214', product: 'Urea', pack: '50 kg bag', bags: '600', tonnes: '30.000', classification: 'Physical warehouse', farmer: '', split: 'On the road' },
  { row: 5, leg: 'LEG-5104', truck: 'BCA 2218', product: 'Urea', pack: '50 kg bag', bags: '600', tonnes: '30.000', classification: 'Physical warehouse', farmer: '', split: 'On the road' },
  { row: 6, leg: 'LEG-5105', truck: 'BCA 2220', product: 'Urea', pack: '50 kg bag', bags: '800', tonnes: '40.000', classification: 'Virtual warehouse', farmer: 'Lakeview Farms Ltd', split: 'On the road' },
  { row: 7, leg: 'LEG-5106', truck: 'BCA 2231', product: 'Urea', pack: '50 kg bag', bags: '800', tonnes: '40.000', classification: 'Direct delivery', farmer: 'Cameron Estates', split: 'On the road' },
  { row: 8, leg: 'LEG-5107', truck: 'BCA 2236', product: 'Urea', pack: '20 kg bag', bags: '500', tonnes: '10.000', classification: 'Physical warehouse', farmer: '', split: 'At warehouse awaiting receipt' },
  { row: 9, leg: 'LEG-5096', truck: 'BCA 2198', product: 'Urea', pack: '50 kg bag', bags: '600', tonnes: '30.000', classification: 'Physical warehouse', farmer: '', split: 'Already received', check: 'already-recorded', cell: 'A9' },
];

/** The split with totals: lines and whole tonnes for each place, and the bold Total (UX-12, UX-26). */
export function imDispatchSplit(lines = IM_DISPATCH) {
  const rows = IM_SPLITS.map((s) => {
    const ls = lines.filter((l) => l.split === s);
    return { id: s, split: s, lines: String(ls.length), tonnes: imWhole(imSum(ls, 'tonnes')) };
  });
  return [...rows, { id: 'total', total: true, split: 'Total', lines: String(lines.length), tonnes: imWhole(imSum(lines, 'tonnes')) }];
}

/** A classification's tile: its lines and tonnes, excluding a line already received. */
export function imClassTiles(lines = IM_DISPATCH) {
  const fresh = lines.filter((l) => l.split !== 'Already received');
  return IM_CLASSIFICATIONS.map((c) => {
    const ls = fresh.filter((l) => l.classification === c);
    return { label: c, value: String(ls.length), note: `${ls.length === 1 ? 'Line' : 'Lines'}, ${tonnes(imSum(ls, 'tonnes'))} t` };
  });
}

export function DispatchUpload({ state = 'File chosen' }) {
  const chosen = state !== 'No file';
  const busy = state === 'Previewing';
  return (
    <Sections>
      <HmHead title="Import dispatch report" right={<><Button variant="ghost" size="small" disabled={busy}>Cancel</Button><Button size="small" loading={busy} disabled={!chosen || state === 'Not a dispatch report'}>Preview</Button></>} />
      {state === 'Not a dispatch report' ? <Refusal action="Preview" reason="The file has no sheet named Dispatch" /> : null}
      <Card padding={16} gap={16}>
        <Field label="Import as" required><Select options={['Fertiliser dispatch report, version 1']} defaultValue="Fertiliser dispatch report, version 1" disabled={busy} /></Field>
        <Card padding={16}>
          <EmptyState tone="neutral" icon="upload" title="Drag a file here" />
          <div style={{ display: 'flex', justifyContent: 'center' }}><Button variant="outline" size="small" disabled={busy}>Choose file</Button></div>
        </Card>
        {chosen ? (
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 12 }}>
            <EvidenceTile kind="document" caption="Dispatch report 22 Sep 2026.xlsx" time="8 rows, 38 KB" />
            <IconButton icon="x" label="Remove file" />
          </div>
        ) : null}
      </Card>
    </Sections>
  );
}

export function DispatchPreview({ state = 'Ready to import' }) {
  const classifying = state === 'Classifying';
  const status = { Validating: 'validating', Imported: 'imported', Failed: 'failed' }[state] || 'ready';
  const blank = status === 'validating' || status === 'failed';
  const done = status === 'imported';
  const lines = IM_DISPATCH.map((l) => (classifying && l.leg === 'LEG-5106' ? { ...l, farmer: '', error: 'Select a farmer.' } : l));
  const blocked = classifying || blank || done;
  const pick = (r) => (done || r.split === 'Already received' ? r.classification
    : <Select aria-label={`Classification, ${r.leg}`} options={IM_CLASSIFICATIONS} defaultValue={r.classification} disabled={state === 'Importing'} style={{ minWidth: 172 }} />);
  const farmer = (r) => (r.classification === 'Physical warehouse' ? ''
    : done ? r.farmer
    : <Select aria-label={`Farmer, ${r.leg}`} invalid={!!r.error} options={['Select a farmer', 'Lakeview Farms Ltd', 'Cameron Estates', 'Chongwe Growers Ltd']} defaultValue={r.farmer || 'Select a farmer'} disabled={state === 'Importing'} style={{ minWidth: 172 }} />);
  return (
    <Sections>
      <HmHead title="Dispatch report preview" right={<>
        <Button variant="outline" size="small" disabled={state === 'Importing' || done}>Discard</Button>
        <Button size="small" loading={state === 'Importing'} disabled={blocked}>Import</Button>
      </>} />
      <ImportPreview status={status} statusWord="map" actions="none" importing={state === 'Importing'} rows={blank ? [] : lines}
        readyWord={(r) => r.split}
        refusal={status === 'failed' ? { action: 'Import', reason: 'The file has no sheet named Dispatch' } : undefined}
        file={{ name: 'Dispatch report 22 Sep 2026.xlsx', by: '22 Sep 2026, from the port of Beira', byLabel: 'Dispatched', rows: IM_DISPATCH.length, template: 'Fertiliser dispatch report, version 1' }}
        tiles={blank ? [] : imClassTiles(lines)}
        columns={[
          { key: 'leg', label: 'Leg', width: '76px' }, { key: 'truck', label: 'Truck', width: '72px' },
          { key: 'product', label: 'Product', width: '76px', render: (r) => <CommodityMarker commodity="fertilizer">{r.product}</CommodityMarker> },
          { key: 'pack', label: 'Pack', width: '84px', wrap: true },
          { key: 'bags', label: 'Bags', width: '52px', align: 'right', tabular: true },
          { key: 'tonnes', label: 'Tonnes (t)', width: '80px', align: 'right', tabular: true },
          { key: 'classification', label: 'Classification', width: '184px', render: pick },
          { key: 'farmer', label: 'Farmer', width: '184px', render: farmer },
        ]} />
      {blank ? null : (
        <HmCard title="On the road, at the warehouse and received">
          <HmTable rows={imDispatchSplit(lines)} columns={[
            { key: 'split', label: 'Where it is', width: 'minmax(140px, 1fr)', wrap: true, render: (r) => (r.total ? <Text variant="body-3" strong>{r.split}</Text> : r.split) },
            { key: 'lines', label: 'Lines', width: '80px', align: 'right', render: (r) => (r.total ? <Text variant="body-3" strong tabular>{r.lines}</Text> : r.lines) },
            { key: 'tonnes', label: 'Tonnes (t)', width: '110px', align: 'right', render: (r) => (r.total ? <Text variant="body-3" strong tabular>{r.tonnes}</Text> : r.tonnes) },
          ]} />
        </HmCard>
      )}
    </Sections>
  );
}
