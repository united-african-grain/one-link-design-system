/** Quality specifications (M6.DS.01 screen (k), UAG-82; M6.REF.01, S10 reference data): the Setup list of
    specifications per product, with the product default and the version in force, and the editor for a new version
    with each parameter's limit, step, deduction per step and reject limit. Every screen takes `state`, one of its
    QUALITY_SPEC_STATES entry, for ?screen=&state=. The Trading workspace kit lists it too.

    A specification is versioned reference data: a saved version is never edited, a change is a new version, and every
    contract keeps the version it was written on. A parameter without its limit, step, deduction per step or reject
    limit cannot be saved, because the deduction arithmetic cannot run without them. Exactly one specification per
    product is the product default. Quality is operational, not money, so every role that grades reads it whole.
    Fictional sample data only. */

export const QUALITY_SPEC_STATES = {
  QualitySpecifications: ['Specifications', 'Editor', 'Missing field', 'Saving', 'Version 4 saved'],
};

export const QS_SPECS = [
  { id: 'q1', name: 'White maize, ZAMACE grade 1', product: 'White maize (Zambia)', version: '3', isDefault: 'Yes', inUse: '14', status: 'active' },
  { id: 'q2', name: 'White maize, ZAMACE grade 2', product: 'White maize (Zambia)', version: '1', isDefault: '', inUse: '2', status: 'active' },
  { id: 'q3', name: 'Wheat, ZAMACE grade 1', product: 'Wheat (Zambia)', version: '3', isDefault: 'Yes', inUse: '9', status: 'active' },
  { id: 'q4', name: 'Soya, commercial', product: 'Soya (Zambia)', version: '1', isDefault: 'Yes', inUse: '3', status: 'active' },
];
const QS_PARAMS = [
  { id: 'p1', parameter: 'Moisture', unit: '%', limit: '12.5', step: '0.5', deduction: '0.1', reject: '17.0' },
  { id: 'p2', parameter: 'Foreign matter', unit: '%', limit: '1.0', step: '1.0', deduction: '1.0', reject: '5.0' },
  { id: 'p3', parameter: 'Broken grain', unit: '%', limit: '4.0', step: '1.0', deduction: '0.5', reject: '10.0' },
];
const QS_VERSIONS = [
  { id: 'v4', version: '4', from: '01 Oct 2026', by: 'N. Phiri', note: 'Broken grain added with the QC team', contracts: '0' },
  { id: 'v3', version: '3', from: '01 Aug 2026', by: 'N. Phiri', note: 'Moisture reject limit 17.0%', contracts: '14' },
  { id: 'v2', version: '2', from: '01 May 2026', by: 'N. Phiri', note: 'Foreign matter step 1.0 point', contracts: '6' },
];
const qsStatus = (s) => (s === 'draft' ? <StatusMark kind="neutral" label="Draft" size="body-4" /> : <StatusMark kind="clean" label="Active" size="body-4" />);

export function QualitySpecifications({ state = 'Specifications', onOpen }) {
  if (state === 'Specifications') {
    return (
      <ListView title="Quality specifications" objects="specifications" view="All specifications" search="Search this list" primary={<Button size="small">New</Button>}
        filters={<Capsule chevron>Product</Capsule>} rows={QS_SPECS} columns={[
          { key: 'name', label: 'Specification', width: 'minmax(200px, 1fr)', render: (r) => <RecordLink onClick={() => onOpen && onOpen(r.id)}>{r.name}</RecordLink> },
          { key: 'product', label: 'Product', width: '180px' },
          { key: 'version', label: 'Version in force', width: '130px', align: 'right' },
          { key: 'isDefault', label: 'Product default', width: '130px' },
          { key: 'inUse', label: 'Contracts using it', width: '150px', align: 'right' },
          { key: 'status', label: 'Status', width: '110px', render: (r) => qsStatus(r.status) },
        ]} />
    );
  }
  const saved = state === 'Version 4 saved';
  const busy = state === 'Saving';
  const missing = state === 'Missing field';
  const params = saved ? QS_PARAMS : QS_PARAMS.map((p) => (missing && p.id === 'p3' ? { ...p, step: '' } : p));
  const cell = (key, align = 'right') => (r) => (saved ? r[key] : <Input align={align} defaultValue={r[key]} disabled={busy} invalid={missing && key === 'step' && !r.step} aria-label={`${r.parameter}, ${key}`} />);
  return (
    <Sections>
      <SetupHead title="White maize, ZAMACE grade 1" right={saved ? <Button variant="outline" size="small">New version</Button> : <><Button variant="outline" size="small" disabled={busy}>Cancel</Button><Button size="small" loading={busy} disabled={missing}>Save</Button></>} />
      {missing ? <Refusal action="Save" reason="Broken grain has no step. Every parameter needs its limit, step, deduction per step and reject limit" /> : null}
      <RecordHighlights kind="Quality specification" title="White maize, ZAMACE grade 1" status={saved ? qsStatus('active') : qsStatus('draft')} tabs={[]}
        fields={[{ label: 'Product', value: 'White maize (Zambia)' }, { label: 'Version', value: '4' }, { label: 'Version in force', value: saved ? '4, for new contracts' : '3' },
          { label: 'Product default', value: 'Yes' }, { label: 'Effective from', value: '01 Oct 2026' }]} />
      <CountCard title="Parameters" count={params.length} objects="parameters" action={saved ? null : <Button variant="outline" size="xsmall" icon="plus" disabled={busy}>Add parameter</Button>}>
        <SetupTable rows={params} columns={[
          { key: 'parameter', label: 'Parameter', width: 'minmax(150px, 1fr)', render: cell('parameter', 'left') },
          { key: 'unit', label: 'Unit', width: '70px' },
          { key: 'limit', label: 'Limit (%)', width: '110px', align: 'right', render: cell('limit') },
          { key: 'step', label: 'Step (points)', width: '120px', align: 'right', render: cell('step') },
          { key: 'deduction', label: 'Deduction per step (% of weight)', width: '230px', align: 'right', render: cell('deduction') },
          { key: 'reject', label: 'Reject limit (%)', width: '130px', align: 'right', render: cell('reject') },
        ]} />
      </CountCard>
      <CountCard title="Versions" count={saved ? 3 : 2} objects="versions">
        <SetupTable rows={saved ? QS_VERSIONS : QS_VERSIONS.slice(1)} columns={[
          { key: 'version', label: 'Version', width: '90px', align: 'right' },
          { key: 'from', label: 'Effective from', width: '140px', tabular: true },
          { key: 'by', label: 'Saved by', width: '110px' },
          { key: 'note', label: 'Reason', width: 'minmax(200px, 1fr)', wrap: true },
          { key: 'contracts', label: 'Contracts on it', width: '140px', align: 'right' },
        ]} />
      </CountCard>
    </Sections>
  );
}
