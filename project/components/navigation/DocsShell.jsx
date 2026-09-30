import React, { useEffect, useState } from 'react';
import { Icon } from '../core/Icon.jsx';
import { textStyle } from '../core/Text.jsx';
import { Logo } from '../core/Logo.jsx';
import { Button } from '../actions/Button.jsx';
import { IconButton } from './Header.jsx';
import { useInteraction, useMinWidth, usePrefersReducedMotion } from '../core/Interaction.jsx';

const DOCS_RING = '0 0 0 4px color-mix(in srgb, var(--content-primary) 25%, transparent)';
const DOCS_HOVER = 'color-mix(in srgb, var(--hover-mix-light), var(--surface))';

/** A row in the topics rail: 32px, body-3, the current page grouped fill and strong primary, the rest secondary. */
function TopicRow({ label, icon, active, onSelect, tall = false }) {
  const { hover, focusVisible, handlers } = useInteraction();
  const color = active ? 'var(--content-primary)' : 'var(--content-secondary)';
  return (
    <button type="button" aria-current={active ? 'page' : undefined} data-active={active ? 'true' : 'false'} onClick={onSelect} {...handlers}
      style={{ display: 'flex', alignItems: 'center', gap: 10, width: '100%', minHeight: tall ? 40 : 32, padding: '6px 10px', boxSizing: 'border-box', border: 0, borderRadius: tall ? 'var(--radius-sm)' : 'var(--radius-xs)', textAlign: 'left', cursor: 'pointer', outline: 'none',
        background: active ? 'var(--grouped)' : hover ? DOCS_HOVER : 'transparent', color, boxShadow: focusVisible ? DOCS_RING : 'none',
        transition: 'background var(--dur-default) var(--ease-default), color var(--dur-default) var(--ease-default)' }}>
      {icon ? <Icon name={icon} size={20} stroke={1.75} /> : null}
      <span style={{ flex: 1, minWidth: 0, ...textStyle('body-3', { strong: active, color }) }}>{label}</span>
    </button>
  );
}

/**
 * A reading frame that stands on its own, outside the app: the help centre.
 *
 * A signed-in reader should not lose their place to read help, so help is not a page inside the
 * AppShell. It is its own screen with one clear way back: a 56px sticky header (the lockup, a hairline
 * and the frame's label, a search, and the way back at the right), the topics down the left (sections
 * and their pages, the current one marked) and the article on the right. There is no module rail, no
 * toolbar and no ticker: those belong to the app, and the point of this frame is that it is not inside it.
 *
 * From 1024px the topics are a sticky 260px rail. Below it they are a 264px drawer behind a "Topics"
 * button at the left of the header, with a scrim, inert when closed, closed by Escape, the scrim or a
 * choice, exactly like the AppShell's drawer, so the article is never pushed down by a list of links.
 * Below 768px the label gives way and the search takes a row of its own under the header, full width,
 * because on a help screen the search is the main way in.
 */
export function DocsShell({
  label = 'Help', sections = [], current, home = 'home', homeLabel = 'All topics', onNavigate,
  search, back, children, product = 'One Link', showBeta = true, topicsOpen = false, scrolled = false, style,
}) {
  const desktop = useMinWidth(1024);
  const roomy = useMinWidth(768);
  const reduced = usePrefersReducedMotion();
  const [open, setOpen] = useState(topicsOpen);
  const [pastTop, setPastTop] = useState(false);
  const pad = desktop ? 24 : 16;
  useEffect(() => { setOpen(topicsOpen); }, [topicsOpen]);
  useEffect(() => { if (desktop) setOpen(false); }, [desktop]);
  useEffect(() => {
    if (typeof window === 'undefined') return undefined;
    const on = () => setPastTop(window.scrollY > 8);
    on();
    window.addEventListener('scroll', on, { passive: true });
    return () => window.removeEventListener('scroll', on);
  }, []);
  useEffect(() => {
    if (desktop || !open) return undefined;
    const key = (e) => { if (e.key === 'Escape') setOpen(false); };
    document.addEventListener('keydown', key);
    return () => document.removeEventListener('keydown', key);
  }, [desktop, open]);
  const go = (value) => { setOpen(false); onNavigate && onNavigate(value); };
  const drawer = !desktop;
  const hidden = drawer && !open;
  const blurred = scrolled || pastTop;

  const topics = (
    <nav aria-label="Topics" style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
      <TopicRow tall icon="circle-help" label={homeLabel} active={current === home} onSelect={() => go(home)} />
      {sections.map((s) => (
        <div key={s.title} style={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
          <span style={{ padding: '0 10px 6px', ...textStyle('caption-1-condensed', { tone: 'tertiary' }) }}>{s.title}</span>
          {s.pages.map((p) => <TopicRow key={p.value} label={p.label} active={p.value === current} onSelect={() => go(p.value)} />)}
        </div>
      ))}
    </nav>
  );

  return (
    <div style={{ minHeight: '100dvh', background: 'var(--surface)', color: 'var(--content-primary)', ...style }}>
      <header data-blurred={blurred || undefined} style={{ position: 'sticky', top: 0, zIndex: 30, background: blurred ? 'color-mix(in srgb, var(--surface) 80%, transparent)' : 'var(--surface)', backdropFilter: blurred ? 'blur(24px)' : undefined, WebkitBackdropFilter: blurred ? 'blur(24px)' : undefined, boxShadow: 'inset 0 -1px 0 var(--border)', transition: 'background var(--dur-default) var(--ease-default)' }}>
        <div style={{ height: 'var(--header-top)', display: 'flex', alignItems: 'center', gap: roomy ? 12 : 8, padding: `0 ${pad}px`, minWidth: 0 }}>
          {drawer ? <Button variant="outline" size="small" icon="list" aria-expanded={open} aria-controls="ol-docs-shell-topics" onClick={() => setOpen((o) => !o)}>Topics</Button> : null}
          <a href="#" aria-label={`${product} ${label}`} onClick={(e) => { e.preventDefault(); go(home); }} style={{ display: 'inline-flex', alignItems: 'center', gap: 12, flex: 'none', textDecoration: 'none', color: 'inherit', borderRadius: 'var(--radius-2xs)' }}>
            <Logo product={product} showBeta={showBeta && roomy} markOnly={!roomy} />
            {roomy ? <span aria-hidden style={{ width: 1, height: 20, background: 'var(--border)' }} /> : null}
            {roomy ? <span style={textStyle('body-3', { tone: 'secondary' })}>{label}</span> : null}
          </a>
          <div style={{ flex: 1, minWidth: 0, display: 'flex', justifyContent: 'flex-end' }}>
            {roomy && search ? <div style={{ width: '100%', maxWidth: 400 }}>{search}</div> : null}
          </div>
          {back ? <div style={{ flex: 'none', display: 'flex', alignItems: 'center' }}>{back}</div> : null}
        </div>
        {!roomy && search ? <div style={{ padding: `0 ${pad}px 12px` }}>{search}</div> : null}
      </header>

      {drawer && open ? <div aria-hidden onClick={() => setOpen(false)} style={{ position: 'fixed', inset: 0, zIndex: 39, background: 'color-mix(in srgb, var(--content-primary) 32%, transparent)' }} /> : null}

      <div style={{ display: 'grid', gridTemplateColumns: desktop ? 'var(--sidebar-w) minmax(0,1fr)' : 'minmax(0,1fr)' }}>
        <aside id="ol-docs-shell-topics" inert={hidden ? '' : undefined} aria-hidden={hidden || undefined} style={drawer
          ? { position: 'fixed', top: 0, bottom: 0, left: 0, zIndex: 40, width: 264, display: 'flex', flexDirection: 'column', background: 'var(--surface)', boxShadow: open ? 'var(--shadow-strong)' : 'none', transform: open ? 'translateX(0)' : 'translateX(-100%)', transition: reduced ? 'none' : 'transform 180ms var(--ease-default)' }
          : { position: 'sticky', top: 'var(--header-top)', alignSelf: 'start', height: 'calc(100dvh - var(--header-top))', overflowY: 'auto', boxShadow: 'inset -1px 0 0 var(--border)', padding: '24px 12px', boxSizing: 'border-box' }}>
          {drawer ? (
            <>
              <div style={{ flex: 'none', height: 'var(--header-top)', display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '0 8px 0 16px', boxShadow: 'inset 0 -1px 0 var(--border)' }}>
                <span style={textStyle('body-3', { strong: true })}>Topics</span>
                <IconButton icon="x" label="Close topics" onClick={() => setOpen(false)} />
              </div>
              <div style={{ flex: 1, minHeight: 0, overflowY: 'auto', padding: '16px 12px' }}>{topics}</div>
            </>
          ) : topics}
        </aside>
        <main style={{ minWidth: 0, width: '100%', maxWidth: 'var(--shell-max)', margin: '0 auto', padding: desktop ? '32px 24px 96px' : '24px 16px 96px', boxSizing: 'border-box' }}>{children}</main>
      </div>
    </div>
  );
}
