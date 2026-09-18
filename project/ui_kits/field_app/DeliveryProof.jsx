/** 12 Field app: Delivery proof (390 only). Online and offline-queued. */
export function DeliveryProof({ offline = false }) {
  const [step, setStep] = useState('Photo');
  const [busy, setBusy] = useState(false);
  const [queued, setQueued] = useState(offline);
  return (
    <>
      <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
        <Text variant="heading-3" strong>Delivery proof</Text>
        <Text variant="body-3" tone="secondary">Order LD10000025 · Peter Sakala</Text>
      </div>
      {offline ? <Banner tone="warning" icon="clock" title="No signal">{queued ? '1 waiting to send' : 'you can still capture everything'}</Banner> : null}
      <Segmented fullWidth options={['Photo', 'Sign', 'Send']} value={step} onChange={setStep} />
      {step === 'Photo' ? (
        <Card gap={16}>
          <div style={{ height: 196, borderRadius: 'var(--radius-md)', background: 'var(--grouped-elevated)', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', gap: 10, textAlign: 'center', padding: 16 }}>
            <Icon name="camera" size={24} stroke={1.75} color="var(--content-secondary-solid)" />
            <Text variant="body-2" strong>Photograph the signed note</Text>
            <Text variant="body-3" tone="secondary" style={{ maxWidth: 260, textWrap: 'pretty' }}>Lay it flat. Make sure the tonnage and the signature are readable.</Text>
          </div>
          <Text variant="body-4" tone="tertiary" style={{ textAlign: 'center' }}>The load details are already here. You do not need to type anything.</Text>
          <SummaryList items={[{ label: 'Commodity', value: 'White maize' }, { label: 'Booked', value: '28.20 t' }, { label: 'Destination', value: 'Kafue Road, Lusaka' }]} />
        </Card>
      ) : step === 'Sign' ? (
        <Card gap={16}>
          <div style={{ height: 196, borderRadius: 'var(--radius-md)', background: 'var(--grouped-elevated)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}><Text variant="body-3" tone="secondary">Sign in the box</Text></div>
          <Text variant="body-4" tone="tertiary" style={{ textAlign: 'center' }}>The receiver signs once. The photo stays attached either way.</Text>
        </Card>
      ) : (
        <Card gap={16}>
          <div style={{ display: 'flex', gap: 12 }}><EvidenceTile caption="photo-ld10000025-note" time="14:41" /><EvidenceTile kind="document" caption="signature-ld10000025" /></div>
          {queued ? <Banner tone="warning" icon="refresh-cw" title="1 waiting to send">Will send when signal returns</Banner> : <Banner tone="success" title="Sent">the office has your proof</Banner>}
        </Card>
      )}
      <div style={{ marginTop: 'auto', paddingTop: 16 }}>
        <PressButton kind="large" variant="primary" fullWidth loading={busy}
          onClick={() => { setBusy(true); setTimeout(() => { setBusy(false); if (step === 'Photo') setStep('Sign'); else if (step === 'Sign') setStep('Send'); else setQueued(offline); }, 1600); }}>
          {step === 'Photo' ? 'Tap to photograph' : step === 'Sign' ? 'Capture signature' : offline ? 'Send when signal returns' : 'Send now'}
        </PressButton>
      </div>
    </>
  );
}
