import React, { useEffect, useRef, useState } from 'react';
import { Icon } from '../core/Icon.jsx';
import { textStyle } from '../core/Text.jsx';
import { Avatar } from '../core/Avatar.jsx';
import { Logo } from '../core/Logo.jsx';
import { SearchField } from '../inputs/SearchField.jsx';
import { SyncStatus } from './SyncStatus.jsx';
import { IconButton } from './Header.jsx';
import { useInteraction, useMinWidth, usePrefersReducedMotion } from '../core/Interaction.jsx';

const RING = '0 0 0 4px color-mix(in srgb, var(--content-primary) 25%, transparent)';
const HOVER = 'color-mix(in srgb, var(--hover-mix-light), var(--surface))';

/** Small count beside a nav label: 20px, radius 8, white on shadow middle, caption-1-strong tabular (the quantity chip, sized for a 40px row). */
function NavCount({ children }) {
  return <span style={{ display: 'inline-flex', alignItems: 'center', justifyContent: 'center', flex: 'none', height: 20, minWidth: 24, paddingInline: 6, borderRadius: 'var(--radius-2xs)', background: 'var(--elevated)', boxShadow: 'var(--shadow-middle)', ...textStyle('caption-1', { strong: true, tabular: true, tone: 'secondary' }) }}>{children}</span>;
}

/** A 40px module row: icon 20, body-3 label, optional count. Active = grouped fill, primary strong text; inactive secondary; hover the light mix. */
function NavItem({ item, active, onSelect }) {
  const { hover, focusVisible, handlers } = useInteraction();
  const color = active ? 'var(--content-primary)' : 'var(--content-secondary)';
  return (
    <button type="button" aria-current={active ? 'page' : undefined} data-active={active ? 'true' : 'false'} onClick={onSelect} {...handlers}
      style={{ display: 'flex', alignItems: 'center', gap: 10, width: '100%', height: 40, padding: '0 10px', boxSizing: 'border-box', border: 0, borderRadius: 'var(--radius-sm)', textAlign: 'left', cursor: 'pointer', outline: 'none',
        background: active ? 'var(--grouped)' : hover ? HOVER : 'transparent', color, boxShadow: focusVisible ? RING : 'none',
        transition: 'background var(--dur-default) var(--ease-default), color var(--dur-default) var(--ease-default)' }}>
      {item.icon ? <Icon name={item.icon} size={20} stroke={1.75} /> : null}
      <span style={{ flex: 1, minWidth: 0, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap', ...textStyle('body-3', { strong: active, color }) }}>{item.label}</span>
      {item.count != null ? <NavCount>{item.count}</NavCount> : null}
    </button>
  );
}

/** A section under the active module: indented 36px, 32px tall, body-3; active strong primary, others secondary. */
function NavSection({ section, active, onSelect }) {
  const { hover, focusVisible, handlers } = useInteraction();
  const color = active ? 'var(--content-primary)' : 'var(--content-secondary)';
  return (
    <button type="button" aria-current={active ? 'page' : undefined} data-active={active ? 'true' : 'false'} onClick={onSelect} {...handlers}
      style={{ display: 'flex', alignItems: 'center', gap: 10, width: '100%', height: 32, padding: '0 10px 0 40px', boxSizing: 'border-box', border: 0, borderRadius: 'var(--radius-xs)', textAlign: 'left', cursor: 'pointer', outline: 'none',
        background: hover ? HOVER : 'transparent', color, boxShadow: focusVisible ? RING : 'none', transition: 'background var(--dur-default) var(--ease-default), color var(--dur-default) var(--ease-default)' }}>
      <span style={{ flex: 1, minWidth: 0, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap', ...textStyle('body-3', { strong: active, color }) }}>{section.label}</span>
      {section.count != null ? <NavCount>{section.count}</NavCount> : null}
    </button>
  );
}

/** Body-3 row in the account popover (8px 12px, radius 8, grouped on hover). critical = the sign out colour. busy swaps the icon for the spinner. */
function MenuRow({ icon, label, tone = 'default', busy = false, onClick }) {
  const { hover, focusVisible, handlers } = useInteraction({ inert: busy });
  const color = tone === 'critical' ? 'var(--buttons-critical)' : 'var(--content-primary)';
  return (
    <button type="button" role="menuitem" aria-busy={busy || undefined} disabled={busy} onClick={busy ? undefined : onClick} {...handlers}
      style={{ display: 'flex', alignItems: 'center', gap: 10, width: '100%', boxSizing: 'border-box', padding: '8px 12px', border: 0, borderRadius: 'var(--radius-2xs)', textAlign: 'left', outline: 'none',
        background: hover && !busy ? 'var(--grouped)' : 'transparent', color, cursor: busy ? 'progress' : 'pointer', boxShadow: focusVisible ? RING : 'none', transition: 'background var(--dur-default) var(--ease-default)', ...textStyle('body-3', { color }) }}>
      <Icon name={busy ? 'loader-circle' : icon} size={16} spin={busy} />
      <span>{label}</span>
    </button>
  );
}

const Hairline = () => <div aria-hidden style={{ height: 1, margin: '4px 0', background: 'var(--border)' }} />;

/** The account block far right of the toolbar: Avatar 32, name (body-3 strong), meta (caption-1 tertiary), chevron. Its popover holds identity, product items and Sign out. */
function Account({ user, roomy, menu, signingOut, onSignOut, open, setOpen }) {
  const wrap = useRef(null);
  const trigger = useRef(null);
  const { hover, focusVisible, handlers } = useInteraction();
  const items = () => (wrap.current ? [...wrap.current.querySelectorAll('[role="menuitem"]')] : []);
  const close = (returnFocus) => { setOpen(false); if (returnFocus) queueMicrotask(() => trigger.current && trigger.current.focus()); };
  useEffect(() => {
    if (!open) return undefined;
    const down = (e) => { if (wrap.current && !wrap.current.contains(e.target)) close(false); };
    const key = (e) => { if (e.key === 'Escape') { e.preventDefault(); close(true); } };
    document.addEventListener('pointerdown', down);
    document.addEventListener('keydown', key);
    return () => { document.removeEventListener('pointerdown', down); document.removeEventListener('keydown', key); };
  }, [open]);
  const onTriggerKey = (e) => { if (e.key === 'ArrowDown' && !open) { e.preventDefault(); setOpen(true); queueMicrotask(() => { const [first] = items(); first && first.focus(); }); } };
  const onPanelKey = (e) => {
    const list = items(); if (!list.length) return;
    const at = list.indexOf(document.activeElement);
    const next = { ArrowDown: at < 0 ? 0 : (at + 1) % list.length, ArrowUp: at < 0 ? list.length - 1 : (at - 1 + list.length) % list.length, Home: 0, End: list.length - 1 }[e.key];
    if (next != null) { e.preventDefault(); list[next].focus(); }
  };
  return (
    <div ref={wrap} style={{ position: 'relative', flex: 'none', minWidth: 0 }}>
      <button ref={trigger} type="button" aria-haspopup="menu" aria-expanded={open} aria-label={`Account, ${user.name}`} onClick={() => (open ? close(true) : setOpen(true))} onKeyDown={onTriggerKey} {...handlers}
        style={{ display: 'inline-flex', alignItems: 'center', gap: 8, maxWidth: '100%', padding: roomy ? '3px 8px 3px 3px' : 3, border: 0, borderRadius: 'var(--radius-max)', cursor: 'pointer', outline: 'none',
          background: hover || open ? 'var(--hover-overlay-darker)' : 'transparent', boxShadow: focusVisible ? RING : 'none', transition: 'background var(--dur-default) var(--ease-default)' }}>
        <Avatar initials={user.initials} size={32} />
        {roomy ? (
          <span style={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-start', minWidth: 0, textAlign: 'left' }}>
            <span style={{ maxWidth: 180, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap', ...textStyle('body-3', { strong: true }) }}>{user.name}</span>
            {user.meta ? <span style={{ maxWidth: 180, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap', ...textStyle('caption-1', { tone: 'tertiary' }) }}>{user.meta}</span> : null}
          </span>
        ) : null}
        {roomy ? <Icon name="chevron-down" size={14} color="var(--content-tertiary)" style={{ transform: open ? 'rotate(180deg)' : 'none', transition: 'transform var(--dur-default) var(--ease-default)' }} /> : null}
      </button>
      {open ? (
        <div role="menu" aria-label="Account" onKeyDown={onPanelKey} style={{ position: 'absolute', top: 'calc(100% + 8px)', right: 0, zIndex: 40, minWidth: 260, maxWidth: 'calc(100vw - 32px)', padding: 8, boxSizing: 'border-box', background: 'var(--elevated)', borderRadius: 'var(--radius-md)', boxShadow: 'var(--shadow-strong)', display: 'flex', flexDirection: 'column' }}>
          <div style={{ display: 'flex', gap: 12, alignItems: 'flex-start', padding: '8px 8px 12px' }}>
            <Avatar initials={user.initials} size={40} />
            <div style={{ display: 'flex', flexDirection: 'column', gap: 3, minWidth: 0 }}>
              <span style={textStyle('body-3', { strong: true })}>{user.name}</span>
              {user.email ? <span style={{ overflowWrap: 'anywhere', ...textStyle('body-4', { tone: 'secondary' }) }}>{user.email}</span> : null}
              {user.meta ? <span style={{ alignSelf: 'flex-start', marginTop: 3, padding: '3px 6px', borderRadius: 'var(--radius-2xs)', background: 'var(--grouped)', ...textStyle('caption-1-condensed', { tone: 'secondary' }) }}>{user.meta}</span> : null}
            </div>
          </div>
          {menu ? <><Hairline />{menu}</> : null}
          {onSignOut ? <><Hairline /><MenuRow icon="log-out" label="Sign out" tone="critical" busy={signingOut} onClick={onSignOut} /></> : null}
        </div>
      ) : null}
    </div>
  );
}

/** Body-3 breadcrumb: tertiary parts with chevron-right 14 between; the current part primary strong and never truncated
    (earlier parts give way first). Below 768px only the current part shows; the drawer carries the rest. */
function Breadcrumb({ parts, roomy }) {
  if (!parts || !parts.length) return null;
  const shown = roomy ? parts : parts.slice(-1);
  return (
    <nav aria-label="Breadcrumb" style={{ display: 'flex', alignItems: 'center', gap: 4, minWidth: 0, overflow: 'hidden' }}>
      {shown.map((p, i) => {
        const last = i === shown.length - 1;
        return (
          <React.Fragment key={i}>
            {i > 0 ? <Icon name="chevron-right" size={14} color="var(--content-tertiary)" /> : null}
            <span aria-current={last ? 'page' : undefined} style={{ flexShrink: last ? 0 : 1, minWidth: 0, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap', ...textStyle('body-3', last ? { strong: true } : { tone: 'tertiary' }) }}>{p}</span>
          </React.Fragment>
        );
      })}
    </nav>
  );
}

/** The signed-in frame: a 260px sidebar (brand, grouped module nav with the active module's sections, a foot slot),
    a 56px sticky toolbar (burger below 1024, breadcrumb, search, right slot, sync, digest, account) and the page column
    (main at --shell-max, then a footer slot). Grid from 1024px; below, the sidebar is a 264px drawer with a scrim,
    inert when closed, closed by Escape, the scrim or a nav click. Below 768 the product adds the MobileShell bar itself.
    The toolbar turns 80% white with a 24px blur once the page scrolls past 8px, like Header. */
export function AppShell({ nav = [], module, section, onNavigate, home = 'home', breadcrumb = [], sync = 'live', syncLabel, showSearch = true, searchPlaceholder, showDigest = true, user, signingOut = false, onSignOut, menu, right, foot, footer, children, product = 'One Link', showBeta = true, accountOpen = false, scrolled = false, style }) {
  const desktop = useMinWidth(1024);
  const roomy = useMinWidth(768);
  const reduced = usePrefersReducedMotion();
  const [open, setOpen] = useState(false);
  const [account, setAccount] = useState(accountOpen);
  const [searchRow, setSearchRow] = useState(false);
  const [pastTop, setPastTop] = useState(false);
  const [navScrolled, setNavScrolled] = useState(false);
  const pad = desktop ? 24 : 16;
  useEffect(() => {
    if (typeof window === 'undefined') return undefined;
    const on = () => setPastTop(window.scrollY > 8);
    on();
    window.addEventListener('scroll', on, { passive: true });
    return () => window.removeEventListener('scroll', on);
  }, []);
  useEffect(() => { if (desktop) setOpen(false); }, [desktop]);
  useEffect(() => {
    if (desktop || !open) return undefined;
    const key = (e) => { if (e.key === 'Escape') setOpen(false); };
    document.addEventListener('keydown', key);
    return () => document.removeEventListener('keydown', key);
  }, [desktop, open]);
  const blurred = scrolled || pastTop;
  const go = (value) => { setOpen(false); setAccount(false); onNavigate && onNavigate(value); };
  const drawer = !desktop;
  const hidden = drawer && !open;

  return (
    <div style={{ display: 'grid', gridTemplateColumns: desktop ? 'var(--sidebar-w) minmax(0,1fr)' : 'minmax(0,1fr)', minHeight: '100dvh', background: 'var(--surface)', ...style }}>
      {drawer && open ? <div aria-hidden onClick={() => setOpen(false)} style={{ position: 'fixed', inset: 0, zIndex: 39, background: 'color-mix(in srgb, var(--content-primary) 32%, transparent)' }} /> : null}
      <aside id="ol-app-shell-nav" inert={hidden ? '' : undefined} aria-hidden={hidden || undefined} style={drawer
        ? { position: 'fixed', top: 0, bottom: 0, left: 0, zIndex: 40, width: 264, display: 'flex', flexDirection: 'column', background: 'var(--surface)', boxShadow: open ? 'var(--shadow-strong)' : 'none', transform: open ? 'translateX(0)' : 'translateX(-100%)', transition: reduced ? 'none' : 'transform 180ms var(--ease-default)', overflow: 'hidden' }
        : { position: 'sticky', top: 0, height: '100dvh', display: 'flex', flexDirection: 'column', background: 'var(--surface)', boxShadow: 'inset -1px 0 0 var(--border)', overflow: 'hidden' }}>
        <div style={{ flex: 'none', height: 56, display: 'flex', alignItems: 'center', padding: '0 16px', boxShadow: navScrolled ? 'inset 0 -1px 0 var(--border)' : 'none', transition: 'box-shadow var(--dur-default) var(--ease-default)' }}>
          <a href="#" aria-label="Home" onClick={(e) => { e.preventDefault(); go(home); }} style={{ display: 'inline-flex', textDecoration: 'none', color: 'inherit', borderRadius: 'var(--radius-2xs)' }}><Logo product={product} showBeta={showBeta} /></a>
        </div>
        <nav aria-label="Modules" onScroll={(e) => setNavScrolled(e.currentTarget.scrollTop > 0)} style={{ flex: 1, minHeight: 0, overflowY: 'auto', padding: '8px 12px 16px', display: 'flex', flexDirection: 'column', gap: 16 }}>
          {nav.map((group, gi) => (
            <div key={gi} style={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
              {group.label ? <span style={{ padding: '8px 10px 6px', ...textStyle('caption-1-condensed', { tone: 'tertiary' }) }}>{group.label}</span> : null}
              {group.items.map((item) => {
                const active = item.value === module;
                return (
                  <React.Fragment key={item.value}>
                    <NavItem item={item} active={active} onSelect={() => go(item.value)} />
                    {active && item.sections && item.sections.length ? (
                      <div style={{ display: 'flex', flexDirection: 'column', gap: 2, padding: '2px 0 4px' }}>
                        {item.sections.map((s) => <NavSection key={s.value} section={s} active={s.value === section} onSelect={() => go(s.value)} />)}
                      </div>
                    ) : null}
                  </React.Fragment>
                );
              })}
            </div>
          ))}
        </nav>
        {foot ? <div style={{ flex: 'none', padding: 12, boxShadow: 'inset 0 1px 0 var(--border)' }}>{foot}</div> : null}
      </aside>

      <div style={{ display: 'flex', flexDirection: 'column', minWidth: 0, minHeight: '100dvh' }}>
        <header data-blurred={blurred || undefined} style={{ position: 'sticky', top: 0, zIndex: 30, background: blurred ? 'color-mix(in srgb, var(--surface) 80%, transparent)' : 'var(--surface)', backdropFilter: blurred ? 'blur(24px)' : undefined, WebkitBackdropFilter: blurred ? 'blur(24px)' : undefined, boxShadow: 'inset 0 -1px 0 var(--border)', transition: 'background var(--dur-default) var(--ease-default)' }}>
          <div style={{ height: 'var(--header-top)', display: 'flex', alignItems: 'center', gap: roomy ? 12 : 8, padding: `0 ${pad}px`, minWidth: 0 }}>
            {drawer ? <IconButton icon={open ? 'x' : 'menu'} label={open ? 'Close navigation' : 'Open navigation'} aria-expanded={open} aria-controls="ol-app-shell-nav" onClick={() => setOpen((o) => !o)} /> : null}
            <Breadcrumb parts={breadcrumb} roomy={roomy} />
            <div style={{ flex: 1, minWidth: 0, display: 'flex', justifyContent: 'flex-end' }}>
              {showSearch && roomy ? <SearchField placeholder={searchPlaceholder} maxWidth={320} /> : null}
            </div>
            <div style={{ display: 'flex', alignItems: 'center', gap: 4, flex: 'none', minWidth: 0 }}>
              {right}
              {sync ? <SyncStatus state={sync} label={syncLabel} compact={!roomy} /> : null}
              {showSearch && !roomy ? <IconButton icon="search" label="Search" aria-expanded={searchRow} onClick={() => setSearchRow((s) => !s)} /> : null}
              {showDigest ? <IconButton icon="bell" label="Digest" /> : null}
              {user ? <span aria-hidden style={{ width: 1, height: 24, margin: '0 4px', background: 'var(--border)', flex: 'none' }} /> : null}
              {user ? <Account user={user} roomy={roomy} menu={menu} signingOut={signingOut} onSignOut={onSignOut} open={account} setOpen={setAccount} /> : null}
            </div>
          </div>
          {showSearch && !roomy && searchRow ? <div style={{ padding: `0 ${pad}px 12px` }}><SearchField placeholder={searchPlaceholder} maxWidth="none" /></div> : null}
        </header>
        <main style={{ flex: 1, width: '100%', maxWidth: 'var(--shell-max)', margin: '0 auto', padding: desktop ? '32px 24px 96px' : '24px 16px 64px', boxSizing: 'border-box', minWidth: 0 }}>{children}</main>
        {footer ? <footer style={{ width: '100%', maxWidth: 'var(--shell-max)', margin: '0 auto', padding: `0 ${pad}px 32px`, boxSizing: 'border-box' }}>{footer}</footer> : null}
      </div>
    </div>
  );
}
