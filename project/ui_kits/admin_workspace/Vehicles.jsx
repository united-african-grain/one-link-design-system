/** Vehicles and transporters (M4.DS.01, UAG-53; M4.REF.03, S10 reference data, M4 round): the Setup list view and
    record page for the vehicle register, with a transporter's truck, a farmer's own owner-operated truck and a truck
    added unverified at the gate, and the transporters list. Every screen takes `state`, one of its VEHICLES_STATES
    entry, for ?screen=&state=.

    A vehicle belongs to a transporter or is owner-operated by a farmer. Its legal payload is its own figure, effective
    dated; an unverified vehicle carries its configuration's default payload until an administrator verifies it.
    Registrations match however they are typed. A referenced vehicle is deactivated, never deleted. Fictional sample
    data only: Copperbelt Haulage Ltd, Kafue Transport Ltd, Lakeview Farms Ltd, Cameron Estates. */

export const VEHICLES_STATES = {
  VehiclesList: ['All', 'To verify', 'No match'],
  VehicleRecord: ['Transporter', 'Owner-operated', 'Unverified', 'Verifying', 'Delete refused', 'History'],
  TransportersList: ['All'],
};

export function vehiclesTitle(screen, state) {
  if (screen === 'VehicleRecord') return vhFor(state).reg;
  return null;
}

const VH_ACTIVE = <StatusMark kind="clean" label="Active" size="body-4" />;
const VH_UNVERIFIED = <StatusMark kind="attention" label="Unverified" size="body-4" />;
const VH_INACTIVE = <StatusMark kind="neutral" label="Inactive" size="body-4" />;
const vhStatus = (s) => (s === 'Unverified' ? VH_UNVERIFIED : s === 'Inactive' ? VH_INACTIVE : VH_ACTIVE);

const VEHICLES = [
  { id: 'bap9229', reg: 'BAP 9229', config: 'Interlink', payload: '34.000', transporter: 'Copperbelt Haulage Ltd', operated: 'Transporter', status: 'Active' },
  { id: 'abz4501', reg: 'ABZ 4501', config: 'Tri-axle', payload: '28.000', transporter: 'Copperbelt Haulage Ltd', operated: 'Transporter', status: 'Active' },
  { id: 'bca2210', reg: 'BCA 2210', config: 'Interlink', payload: '34.000', transporter: 'Kafue Transport Ltd', operated: 'Transporter', status: 'Active' },
  { id: 'lkf1120', reg: 'LKF 1120', config: 'Rigid', payload: '15.500', transporter: 'Lakeview Farms Ltd', operated: 'Owner-operated', status: 'Active' },
  { id: 'bcd4410', reg: 'BCD 4410', config: 'Rigid', payload: '16.000', transporter: '', operated: '', status: 'Unverified' },
  { id: 'alb3305', reg: 'ALB 3305', config: 'Tri-axle', payload: '28.000', transporter: 'Kafue Transport Ltd', operated: 'Transporter', status: 'Inactive' },
];

function vhFor(state) {
  if (state === 'Owner-operated') return VEHICLES[3];
  if (state === 'Unverified' || state === 'Verifying') return VEHICLES[4];
  return VEHICLES[0];
}

export function VehiclesList({ state = 'All', onOpen }) {
  const rows = state === 'No match' ? [] : state === 'To verify' ? VEHICLES.filter((v) => v.status === 'Unverified') : VEHICLES;
  return (
    <ListView title="Vehicles" objects="vehicles" search="Search registrations" view="All vehicles" primary={<Button size="small">New vehicle</Button>}
      filters={<Capsule selected={state === 'To verify'}>To verify</Capsule>}
      columns={[
        { key: 'reg', label: 'Registration', width: '140px', render: (r) => <RecordLink onClick={() => onOpen && onOpen(r.id)}>{r.reg}</RecordLink> },
        { key: 'config', label: 'Configuration', width: '130px' },
        { key: 'payload', label: 'Legal payload (t)', width: '150px', align: 'right', tabular: true },
        { key: 'transporter', label: 'Transporter or owner', wrap: true },
        { key: 'operated', label: 'Operated by', width: '150px' },
        { key: 'status', label: 'Status', width: '130px', render: (r) => vhStatus(r.status) },
      ]} rows={rows} />
  );
}

const VH_HISTORY = [
  { id: 'h3', field: 'Legal payload (t), from 01 Oct 2026', user: 'N. Phiri', old: '32.000', next: '34.000', date: '26 Sep 2026, 10:40', reason: 'New trailer, papers checked' },
  { id: 'h2', field: 'Transporter', user: 'N. Phiri', old: '', next: 'Copperbelt Haulage Ltd', date: '02 Sep 2026, 08:15', reason: 'Verified from the registration book' },
  { id: 'h1', field: 'Vehicle', user: 'S. Banda', old: '', next: 'Created', date: '02 Sep 2026, 07:58', reason: 'Added at the gate, Chisamba Shed' },
];

export function VehicleRecord({ state = 'Transporter' }) {
  const v = vhFor(state);
  const initial = state === 'History' ? 'History' : 'Details';
  const [tab, setTab] = useState(initial);
  useEffect(() => setTab(initial), [state]);
  const unverified = v.status === 'Unverified';
  const owner = v.operated === 'Owner-operated';
  const actions = unverified
    ? <><Button variant="outline" size="small" disabled={state === 'Verifying'}>Edit</Button><Button size="small" loading={state === 'Verifying'}>Verify</Button></>
    : <><Button variant="outline" size="small">Deactivate</Button><Button variant="outline" size="small">Edit</Button></>;
  return (
    <Sections>
      <SetupHead title={v.reg} />
      {unverified ? <ConditionBanner>Added at the gate by S. Banda, 26 Sep 2026, 10:05 CAT. Payload is the Rigid default until verified.</ConditionBanner> : null}
      {state === 'Delete refused' ? <Refusal action="Delete" reason="BAP 9229 is on 41 tickets and 3 loads. Deactivate it instead" /> : null}
      <RecordHighlights kind="Vehicle" title={v.reg} status={vhStatus(v.status)} tab={tab} onTab={setTab} actions={actions}
        fields={[{ label: 'Configuration', value: v.config }, { label: 'Legal payload', value: `${v.payload} t` },
          { label: owner ? 'Owner' : 'Transporter', value: v.transporter }, { label: 'Operated by', value: v.operated }]} />
      {tab === 'History' ? <ChangesCard rows={VH_HISTORY} /> : tab === 'Related' ? (
        <CountCard title="Weighbridge tickets" objects="weighbridge tickets" count={unverified ? 0 : 2}>
          <SetupTable rowKey="id" columns={[{ key: 'ref', label: 'Ticket', width: '140px' }, { key: 'site', label: 'Site' }, { key: 'date', label: 'Weighed (CAT)', width: '170px', tabular: true }]}
            rows={[{ id: 't1', ref: 'WBT10001597', site: 'Chisamba Shed', date: '26 Sep 2026, 06:41' }, { id: 't2', ref: 'WBT10001571', site: 'Chisamba Shed', date: '24 Sep 2026, 11:05' }]} />
        </CountCard>
      ) : (
        <>
          <DetailsCard title="Vehicle information" fields={[['Registration', v.reg], ['Configuration', v.config], ['Legal payload', `${v.payload} t`],
            ['Payload source', unverified ? 'Rigid default, 16.000 t' : 'Registration book'], ['Effective from', unverified ? '26 Sep 2026, 10:05 CAT' : '01 Oct 2026, 00:00 CAT'],
            [owner ? 'Owner' : 'Transporter', v.transporter], ['Operated by', v.operated]]} />
          <DetailsCard title="System information" fields={[['Created by', 'S. Banda'], ['Created date', unverified ? '26 Sep 2026, 10:05' : '02 Sep 2026, 07:58'],
            ['Last modified by', unverified ? 'S. Banda' : 'N. Phiri'], ['Last modified date', unverified ? '26 Sep 2026, 10:05' : '26 Sep 2026, 10:40']]} />
        </>
      )}
    </Sections>
  );
}

const TRANSPORTERS = [
  { id: 'copperbelt', name: 'Copperbelt Haulage Ltd', vehicles: 2, capability: 'Transporter' },
  { id: 'kafue', name: 'Kafue Transport Ltd', vehicles: 2, capability: 'Transporter' },
  { id: 'lakeview', name: 'Lakeview Farms Ltd', vehicles: 1, capability: 'Farmer, own trucks' },
];

export function TransportersList({ onOpen }) {
  return (
    <ListView title="Transporters" objects="transporters" search="Search transporters" view="All transporters"
      columns={[
        { key: 'name', label: 'Transporter', render: (r) => <RecordLink onClick={() => onOpen && onOpen(r.id)}>{r.name}</RecordLink> },
        { key: 'capability', label: 'Capability', width: '170px' },
        { key: 'vehicles', label: 'Vehicles', width: '110px', align: 'right', tabular: true },
        { key: 'status', label: 'Status', width: '120px', render: () => VH_ACTIVE },
      ]} rows={TRANSPORTERS} />
  );
}
