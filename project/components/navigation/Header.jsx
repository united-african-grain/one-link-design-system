import React, { useState } from 'react';
import { Icon } from '../core/Icon.jsx';
import { textStyle } from '../core/Text.jsx';
import { Avatar } from '../core/Avatar.jsx';
import { Logo } from '../core/Logo.jsx';
import { SearchField } from '../inputs/SearchField.jsx';
import { SyncStatus } from './SyncStatus.jsx';
import { Tabs } from './Tabs.jsx';

export const MODULES = [
  { value: 'command', label: 'Command Center', icon: 'gauge' },
  { value: 'trade', label: 'Trade Desk', icon: 'arrow-left-right' },
  { value: 'warehouse', label: 'Warehouse', icon: 'warehouse' },
  { value: 'stock', label: 'Stock', icon: 'package' },
  { value: 'finance', label: 'Farmer Finance', icon: 'hand-coins' },
  { value: 'ai', label: 'Ask AI', icon: 'sparkles' },
];

function IconButton({ icon, label, onClick }) {
  const [h, setH] = useState(false);
  return <button type="button" aria-label={label} onClick={onClick} onMouseEnter={() => setH(true)} onMouseLeave={() => setH(false)} style={{ width: 36, height: 36, borderRadius: 'var(--radius-max)', border: 0, background: h ? 'var(--hover-overlay-darker)' : 'transparent', color: 'var(--content-primary)', display: 'inline-flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer', transition: 'background var(--dur-default) var(--ease-default)' }}><Icon name={icon} size={20} stroke={1.75} /></button>;
}

/** Desktop header: 56px top row (logo + BETA, search, sync pill, bell, avatar) and a 48px module tab row. Set scrolled for the 80% white + blur surface. */
export function Header({ modules = MODULES, module, onModuleChange, sync = 'live', syncLabel, initials = 'TM', userLine = 'T. Mwila · Owner', product = 'One Link', showBeta = true, showTabs = true, scrolled = false, showSearch = true, right, style }) {
  const [menu, setMenu] = useState(false);
  return (
    <header style={{ position: 'relative', background: scrolled ? 'rgba(255,255,255,.8)' : 'var(--surface)', backdropFilter: scrolled ? 'blur(24px)' : undefined, WebkitBackdropFilter: scrolled ? 'blur(24px)' : undefined, boxShadow: 'inset 0 -1px 0 var(--border)', ...style }}>
      <div style={{ maxWidth: 'var(--shell-max)', margin: '0 auto', padding: '0 var(--shell-pad-desktop)' }}>
        <div style={{ height: 56, display: 'flex', alignItems: 'center', gap: 16 }}>
          <Logo product={product} showBeta={showBeta} />
          {showSearch ? <div style={{ flex: 1, display: 'flex', justifyContent: 'flex-start', marginLeft: 8 }}><SearchField /></div> : <div style={{ flex: 1 }} />}
          <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
            {right}
            {sync ? <SyncStatus state={sync} label={syncLabel} /> : null}
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
        {showTabs ? <Tabs tabs={modules} value={module || modules[0].value} onChange={onModuleChange} height={48} gap={24} /> : null}
      </div>
    </header>
  );
}
