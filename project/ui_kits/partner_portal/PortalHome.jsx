const DELIVERIES = [
  { date: '29 Jun', com: 'White Maize', t: '28.20 t', state: 'confirm', ref: 'GR10000360' },
  { date: '27 Jun', com: 'White Maize', t: '28.80 t', state: 'confirm', ref: 'GR10000356' },
  { date: '20 Jun', com: 'Soya Beans', t: '31.50 t', state: 'confirmed', ref: 'GR10000348' },
];

/** 11 Partner Portal: home (NORTHSTAR COMMODITIES). */
export function PortalHome({ onReview, mobile = true }) {
  const maize = 'var(--commodity-maize)';
  return (
    <>
      <div style={{ display: 'flex', flexDirection: 'column', gap: 4 }}>
        <Text variant="heading-2" strong>Good morning.</Text>
        <Text variant="body-2" tone="secondary">Here's what needs you.</Text>
      </div>
      <Card title="2 delivery receipts awaiting your confirmation" meta="Check what we booked against your deliveries."
        headerRight={<Button size="xsmall" variant="brand" onClick={onReview}>Review</Button>} />
      <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
        <SectionLabel>your deliveries to us</SectionLabel>
        <Card padding={4}>
          {DELIVERIES.map((d) => (
            <RailRow key={d.ref} onClick={d.state === 'confirm' ? onReview : undefined}
              subject={`${d.date} · ${d.com} · ${d.t}`} context={d.ref}
              right={d.state === 'confirm' ? <ConfirmationChip kind="confirm" /> : <ConfirmationChip kind="confirmed" />}
              style={{ padding: '10px 12px' }} />
          ))}
        </Card>
      </div>
      <div style={{ display: 'flex', flexDirection: 'column', gap: 4 }}>
        <Text variant="body-4" tone="tertiary">Reference numbers: GR10000360 · GR10000356 · GR10000348</Text>
        <Text variant="body-4" tone="tertiary">You're viewing NORTHSTAR COMMODITIES's relationship with us.</Text>
      </div>
    </>
  );
}

/** 11 Partner Portal: confirm receipt. */
export function PortalConfirm({ onBack }) {
  const [choice, setChoice] = useState('Confirm');
  const [busy, setBusy] = useState(false);
  const [done, setDone] = useState(false);
  return (
    <>
      <span style={{ display: 'flex' }}><Button size="xsmall" variant="ghost" icon="arrow-left" onClick={onBack}>Back</Button></span>
      <div style={{ display: 'flex', flexDirection: 'column', gap: 4 }}>
        <Text variant="heading-3" strong>29 Jun · White Maize</Text>
        <Text variant="body-3" tone="secondary">This is what we booked for your delivery.</Text>
      </div>
      <Card gap={16}>
        <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 8, padding: '8px 0' }}>
          <Text variant="body-3" tone="secondary">booked weight</Text>
          <span style={{ display: 'inline-flex', alignItems: 'baseline', gap: 6 }}><Text variant="display-4-condensed" tabular>28.20</Text><Text variant="body-2" tone="quaternary">t</Text></span>
          <ProvenanceChip kind="synced" />
        </div>
        <SummaryList items={[{ label: 'Weighed in', value: '34.20 t' }, { label: 'Truck tare', value: '6.00 t' }, { label: 'Net booked', value: '28.20 t', strong: true }, { label: 'Reference', value: 'GR10000360' }]} />
        {done ? <Banner tone="success" title="Confirmed">thank you, we have your confirmation</Banner> : null}
        <PressToggle options={['Confirm', 'Dispute']} value={choice} onChange={setChoice} selectedVariant={choice === 'Dispute' ? 'critical' : 'primary'} />
        <PressButton kind="large" variant={choice === 'Dispute' ? 'critical' : 'primary'} fullWidth loading={busy}
          onClick={() => { setBusy(true); setTimeout(() => { setBusy(false); setDone(choice === 'Confirm'); }, 1600); }}>
          {choice === 'Dispute' ? 'Raise a dispute' : 'Confirm receipt'}
        </PressButton>
        <Text variant="body-4" tone="tertiary" style={{ textAlign: 'center' }}>If the weight looks wrong, raise a dispute and someone will call you.</Text>
      </Card>
    </>
  );
}
