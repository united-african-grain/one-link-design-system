import React, { useEffect, useState } from 'react';
import { Icon } from '../core/Icon.jsx';
import { textStyle } from '../core/Text.jsx';
import { Avatar } from '../core/Avatar.jsx';
import { Logo } from '../core/Logo.jsx';
import { SearchField } from '../inputs/SearchField.jsx';
import { SyncStatus } from './SyncStatus.jsx';
import { Tabs } from './Tabs.jsx';
import { useInteraction, useMinWidth } from '../core/Interaction.jsx';

export const MODULES = [
  { value: 'command', label: 'Command Center', icon: 'gauge' },
  { value: 'trade', label: 'Trade Desk', icon: 'arrow-left-right' },
  { value: 'warehouse', label: 'Warehouse', icon: 'warehouse' },
  { value: 'stock', label: 'Stock', icon: 'package' },
  { value: 'finance', label: 'Farmer Finance', icon: 'hand-coins' },
  { value: 'ai', label: 'Ask AI', icon: 'sparkles' },
];

/** Round 36px icon-only button (digest, search, menu). Shared with AppShell; always give it a label. */
export function IconButton({ icon, label, onClick, style, ...rest }) {
  const { hover, focusVisible, handlers } = useInteraction();
  return <button type="button" aria-label={label} title={label} onClick={onClick} {...handlers} {...rest} style={{ ...style, width: 36, height: 36, flex: 'none', borderRadius: 'var(--radius-max)', border: 0, outline: 'none', background: hover ? 'var(--hover-overlay-darker)' : 'transparent', color: 'var(--content-primary)', display: 'inline-flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer', boxShadow: focusVisible ? '0 0 0 4px color-mix(in srgb, var(--content-primary) 25%, transparent)' : 'none', transition: 'background var(--dur-default) var(--ease-default)' }}><Icon name={icon} size={20} stroke={1.75} /></button>;
}

/** Desktop header, sticky at the top (z 30): 2px + 56px top row (logo + BETA, search, sync pill, bell, avatar) + 48px module tab row = 106px (--header-desktop).
    Turns 80% white with a 24px blur once the page scrolls past 8px (blurOnScroll, on by default); `scrolled` forces that surface.
    Side padding 16px, 24px from 1024px. Below 768px search collapses to an icon and the sync pill shows its dot only; tabs scroll sideways. */
export function Header({ modules = MODULES, module, onModuleChange, sync = 'live', syncLabel, initials = 'TM', userLine = 'T. Mwila · Owner', product = 'One Link', showBeta = true, showTabs = true, scrolled = false, blurOnScroll = true, showSearch = true, right, style }) {
  const [menu, setMenu] = useState(false);
  const [pastTop, setPastTop] = useState(false);
  const desktop = useMinWidth(1024);
  const roomy = useMinWidth(768);
  useEffect(() => {
    if (!blurOnScroll || typeof window === 'undefined') return undefined;
    const on = () => setPastTop(window.scrollY > 8);
    on();
    window.addEventListener('scroll', on, { passive: true });
    return () => window.removeEventListener('scroll', on);
  }, [blurOnScroll]);
  const blurred = scrolled || (blurOnScroll && pastTop);
  const pad = desktop ? 24 : 16;
  return (
    <header data-blurred={blurred || undefined} style={{ position: 'sticky', top: 0, zIndex: 30, background: blurred ? 'color-mix(in srgb, var(--surface) 80%, transparent)' : 'var(--surface)', backdropFilter: blurred ? 'blur(24px)' : undefined, WebkitBackdropFilter: blurred ? 'blur(24px)' : undefined, boxShadow: 'inset 0 -1px 0 var(--border)', transition: 'background var(--dur-default) var(--ease-default)', ...style }}>
      <div style={{ maxWidth: 'var(--shell-max)', margin: '0 auto', padding: `${showTabs ? 2 : 0}px ${pad}px 0`, boxSizing: 'border-box' }}>
        <div style={{ height: 56, display: 'flex', alignItems: 'center', gap: roomy ? 16 : 8, minWidth: 0 }}>
          <Logo product={product} showBeta={showBeta} style={{ flex: 'none' }} />
          {showSearch && roomy ? <div style={{ flex: 1, minWidth: 0, display: 'flex', justifyContent: 'flex-start', marginLeft: 8 }}><SearchField /></div> : <div style={{ flex: 1 }} />}
          <div style={{ display: 'flex', alignItems: 'center', gap: 8, flex: 'none' }}>
            {right}
            {sync ? <SyncStatus state={sync} label={syncLabel} compact={!roomy} /> : null}
            {showSearch && !roomy ? <IconButton icon="search" label="Search" /> : null}
            <IconButton icon="bell" label="Digest" />
            <div style={{ position: 'relative' }}>
              <button type="button" aria-haspopup="menu" aria-expanded={menu} onClick={() => setMenu((m) => !m)} style={{ border: 0, padding: 0, background: 'transparent', cursor: 'pointer', display: 'inline-flex', borderRadius: 'var(--radius-max)' }}><Avatar initials={initials} size={32} /></button>
              {menu ? (
                <div role="menu" style={{ position: 'absolute', right: 0, top: 40, minWidth: 220, background: 'var(--elevated)', borderRadius: 'var(--radius-md)', boxShadow: 'var(--shadow-strong)', padding: 8, zIndex: 20 }}>
                  <div style={{ padding: '8px 12px', ...textStyle('body-3', { strong: true }) }}>{userLine}</div>
                  {['Preferences', 'Restricted view preview', 'Sign out'].map((l) => <div key={l} role="menuitem" style={{ padding: '8px 12px', borderRadius: 'var(--radius-2xs)', cursor: 'pointer', ...textStyle('body-3', { tone: 'secondary' }) }}>{l}</div>)}
                </div>
              ) : null}
            </div>
          </div>
        </div>
        {showTabs ? (
          <div style={{ overflowX: 'auto', scrollbarWidth: 'none', margin: `0 -${pad}px`, padding: `0 ${pad}px` }}>
            <Tabs tabs={modules} value={module || modules[0].value} onChange={onModuleChange} height={48} gap={20} style={{ width: 'max-content' }} />
          </div>
        ) : null}
      </div>
    </header>
  );
}
