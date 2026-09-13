/** Desktop page shell: header + centred content column with a sticky right rail. */
export function Page({ module, onModule, sync = 'live', syncLabel, children }) {
  return (
    <div style={{ minHeight: '100%', background: 'var(--surface)' }}>
      <Header module={module} onModuleChange={onModule} sync={sync} syncLabel={syncLabel} />
      <main style={{ maxWidth: 'var(--shell-max)', margin: '0 auto', padding: '32px var(--shell-pad-desktop) 64px' }}>{children}</main>
      <footer style={{ maxWidth: 'var(--shell-max)', margin: '0 auto', padding: '0 var(--shell-pad-desktop) 32px' }}><ChartAttribution /></footer>
    </div>
  );
}

/** Content column + 358px sticky rail, 40px gap. */
export function WithRail({ rail, railWidth = 358, children }) {
  return (
    <div style={{ display: 'grid', gridTemplateColumns: `minmax(0,1fr) ${railWidth}px`, gap: 'var(--rail-gap)', alignItems: 'start' }}>
      <div style={{ minWidth: 0, display: 'flex', flexDirection: 'column', gap: 'var(--section-gap-desktop)' }}>{children}</div>
      <aside style={{ position: 'sticky', top: 24, display: 'flex', flexDirection: 'column', gap: 'var(--section-gap-desktop)' }}>{rail}</aside>
    </div>
  );
}

/** Page title block: condensed title, meta line, and optional right-side controls. */
export function PageHead({ title, meta, right, intro, breadcrumb, children }) {
  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
      {breadcrumb ? <span style={{ display: 'flex', alignItems: 'center', gap: 4, ...textStyle('body-3', { tone: 'tertiary' }) }}>{breadcrumb.map((b, i) => <React.Fragment key={i}>{i > 0 ? <Icon name="chevron-right" size={14} /> : null}<span>{b}</span></React.Fragment>)}</span> : null}
      <div style={{ display: 'flex', alignItems: 'flex-end', gap: 16, flexWrap: 'wrap' }}>
        <div style={{ flex: 1, minWidth: 0, display: 'flex', flexDirection: 'column', gap: 6 }}>
          <Text variant="heading-1-condensed">{title}</Text>
          {meta ? <span style={{ ...textStyle('body-3', { tone: 'secondary' }), fontVariantNumeric: 'tabular-nums' }}>{meta}</span> : null}
        </div>
        {right ? <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>{right}</div> : null}
      </div>
      {intro ? <span style={{ ...textStyle('body-3', { tone: 'secondary' }), maxWidth: 640, textWrap: 'pretty' }}>{intro}</span> : null}
      {children}
    </div>
  );
}

/** Section label above a group: caption-1-condensed tertiary. */
export function SectionLabel({ children, right }) {
  return <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 12 }}><Text variant="caption-1-condensed" tone="tertiary">{children}</Text>{right}</div>;
}

/** White card of figure cells split by 1px dividers. */
export function FigureStrip({ cells, padding = 16 }) {
  return (
    <div style={{ background: 'var(--elevated)', borderRadius: 'var(--radius-lg)', boxShadow: 'var(--shadow-minimal-soft)', padding, display: 'grid', gridTemplateColumns: `repeat(${cells.length}, minmax(0,1fr))` }}>
      {cells.map((c, i) => <div key={i} style={{ paddingLeft: i ? 20 : 0, paddingRight: i < cells.length - 1 ? 20 : 0, borderLeft: i ? '1px solid var(--border-light)' : 0, minWidth: 0 }}>{c}</div>)}
    </div>
  );
}
