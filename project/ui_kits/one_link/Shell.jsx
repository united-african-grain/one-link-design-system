/** Desktop page shell: sticky header + centred content column. Side padding 16px, 24px from 1024px. The Header owns its scroll blur. */
export function Page({ module, onModule, sync = 'live', syncLabel, children }) {
  const desktop = useMinWidth(1024);
  const pad = desktop ? 24 : 16;
  return (
    <div style={{ minHeight: '100%', background: 'var(--surface)' }}>
      <Header module={module} onModuleChange={onModule} sync={sync} syncLabel={syncLabel} />
      <main style={{ maxWidth: 'var(--shell-max)', margin: '0 auto', padding: `${desktop ? 32 : 24}px ${pad}px 64px`, boxSizing: 'border-box' }}>{children}</main>
      <footer style={{ maxWidth: 'var(--shell-max)', margin: '0 auto', padding: `0 ${pad}px 32px`, boxSizing: 'border-box' }}><ChartAttribution /></footer>
    </div>
  );
}

/** Vertical stack with the section gap: 24px, 32px from 1024px. */
export function Sections({ children, style }) {
  const desktop = useMinWidth(1024);
  return <div style={{ display: 'flex', flexDirection: 'column', gap: desktop ? 32 : 24, minWidth: 0, ...style }}>{children}</div>;
}

/** Content column + sticky rail (top 128px), 40px gap. Rail 320px from 1152px, 358px from 1280px; below 1152px a single column with the rail stacked first, under the page head. */
export function WithRail({ rail, railWidth, children }) {
  const two = useMinWidth(1152);
  const wide = useMinWidth(1280);
  const w = railWidth || (wide ? 358 : 320);
  if (!two) {
    return <Sections><Sections>{rail}</Sections>{children}</Sections>;
  }
  return (
    <div style={{ display: 'grid', gridTemplateColumns: `minmax(0,1fr) ${w}px`, gap: 'var(--rail-gap)', alignItems: 'start' }}>
      <Sections>{children}</Sections>
      <aside style={{ position: 'sticky', top: 128, minWidth: 0 }}><Sections>{rail}</Sections></aside>
    </div>
  );
}

/** Detail page: content column + 350px action panel (sticky, top 128px). Below 1024px the panel goes full width under the content. */
export function WithPanel({ panel, children }) {
  const two = useMinWidth(1024);
  if (!two) return <Sections><Sections>{children}</Sections>{panel}</Sections>;
  return (
    <div style={{ display: 'grid', gridTemplateColumns: 'minmax(0,1fr) var(--panel-w)', gap: 'var(--rail-gap)', alignItems: 'start' }}>
      <Sections>{children}</Sections>
      <div style={{ position: 'sticky', top: 128 }}>{panel}</div>
    </div>
  );
}

/** true when a desktop screen should use its one-column arrangement (mobile kit, or a viewport under 720px). */
export function useCompact(mobile) {
  const roomy = useMinWidth(720);
  return mobile || !roomy;
}

/** Page title block: condensed title, meta line (a string splits on " · " into dot-separated parts), and optional right-side controls. */
export function PageHead({ title, meta, right, intro, breadcrumb, children }) {
  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 12, minWidth: 0 }}>
      {breadcrumb ? <span style={{ display: 'flex', alignItems: 'center', flexWrap: 'wrap', gap: 4, ...textStyle('body-3', { tone: 'tertiary' }) }}>{breadcrumb.map((b, i) => <React.Fragment key={i}>{i > 0 ? <Icon name="chevron-right" size={14} /> : null}<span>{b}</span></React.Fragment>)}</span> : null}
      <div style={{ display: 'flex', alignItems: 'flex-end', gap: 16, flexWrap: 'wrap' }}>
        <div style={{ flex: '1 1 240px', minWidth: 0, display: 'flex', flexDirection: 'column', gap: 6 }}>
          <Text variant="heading-1-condensed" style={{ overflowWrap: 'anywhere' }}>{title}</Text>
          {meta ? <span style={{ display: 'block', ...textStyle('body-3', { tone: 'secondary' }), fontVariantNumeric: 'tabular-nums' }}><MetaParts meta={meta} /></span> : null}
        </div>
        {right ? <div style={{ display: 'flex', alignItems: 'center', flexWrap: 'wrap', gap: 8 }}>{right}</div> : null}
      </div>
      {intro ? <span style={{ ...textStyle('body-3', { tone: 'secondary' }), maxWidth: 640, textWrap: 'pretty' }}>{intro}</span> : null}
      {children}
    </div>
  );
}

/** Section label above a group: caption-1-condensed tertiary. */
export function SectionLabel({ children, right }) {
  return <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: 12 }}><Text variant="caption-1-condensed" tone="tertiary">{children}</Text>{right}</div>;
}

/** White card of figure cells split by 1px dividers. Cells wrap onto more rows when the card is narrower than ~150px per cell. */
export function FigureStrip({ cells, padding = 16 }) {
  const ref = useRef(null);
  const width = useElementWidth(ref);
  const perRow = width ? Math.max(1, Math.min(cells.length, Math.floor((width - padding * 2) / 150))) : cells.length;
  return (
    <div ref={ref} style={{ background: 'var(--elevated)', borderRadius: 'var(--radius-lg)', boxShadow: 'var(--shadow-minimal-soft)', padding, display: 'grid', gridTemplateColumns: `repeat(${perRow}, minmax(0,1fr))`, rowGap: 16 }}>
      {cells.map((c, i) => { const col = i % perRow; return <div key={i} style={{ paddingLeft: col ? 20 : 0, paddingRight: col < perRow - 1 && i < cells.length - 1 ? 20 : 0, borderLeft: col ? '1px solid var(--border-light)' : 0, minWidth: 0 }}>{c}</div>; })}
    </div>
  );
}

/** Horizontal scroller for a control row that may be wider than a phone (segmented controls with many options). */
export function ScrollRow({ children, align = 'flex-start', style }) {
  return (
    <div style={{ overflowX: 'auto', scrollbarWidth: 'none', maxWidth: '100%', ...style }}>
      <div style={{ display: 'flex', gap: 8, width: 'max-content', marginLeft: align === 'flex-end' ? 'auto' : 0 }}>{children}</div>
    </div>
  );
}
