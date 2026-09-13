import React from 'react';
import { Icon } from '../core/Icon.jsx';
import { textStyle } from '../core/Text.jsx';
import { Avatar } from '../core/Avatar.jsx';
import { Logo } from '../core/Logo.jsx';
import { Tabs } from './Tabs.jsx';
import { MODULES } from './Header.jsx';

/** 390px mobile shell (shrinks to fit narrower screens). Header = 12px + 56px top row + 48px scrolling sub-section tabs = 116px (--header-mobile); 56px without tabs. Content, then a 70px bottom module bar (+ safe area). */
export function MobileShell({ title, subTabs, subTab, onSubTabChange, module = 'command', onModuleChange, initials = 'TM', right, children, height = 844, showBottomBar = true, safeArea = 34, style }) {
  const bottom = showBottomBar ? MODULES.slice(0, 5) : [];
  return (
    <div style={{ width: 390, maxWidth: '100%', height, background: 'var(--surface)', display: 'flex', flexDirection: 'column', overflow: 'hidden', position: 'relative', ...style }}>
      <div style={{ flex: 'none', boxSizing: 'border-box', height: subTabs ? 'var(--header-mobile)' : 'var(--header-top)', paddingTop: subTabs ? 12 : 0, boxShadow: 'inset 0 -1px 0 var(--border)', background: 'var(--surface)' }}>
        <div style={{ height: 56, display: 'flex', alignItems: 'center', gap: 12, padding: '0 16px' }}>
          {title ? <span style={{ flex: 1, minWidth: 0, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap', ...textStyle('heading-4', { strong: true }) }}>{title}</span> : <span style={{ flex: 1 }}><Logo size="sm" /></span>}
          {right}
          <Avatar initials={initials} size={32} />
        </div>
        {subTabs ? <div style={{ overflowX: 'auto', padding: '0 16px', scrollbarWidth: 'none' }}><Tabs tabs={subTabs} value={subTab || (typeof subTabs[0] === 'string' ? subTabs[0] : subTabs[0].value)} onChange={onSubTabChange} height={48} gap={20} style={{ width: 'max-content' }} /></div> : null}
      </div>
      <div style={{ flex: 1, minHeight: 0, overflowY: 'auto', padding: 16, display: 'flex', flexDirection: 'column', gap: 16 }}>{children}</div>
      {showBottomBar ? (
        <nav style={{ flex: 'none', height: 70 + safeArea, paddingBottom: safeArea, boxShadow: 'inset 0 1px 0 var(--border)', background: 'var(--surface)', display: 'grid', gridTemplateColumns: `repeat(${bottom.length}, 1fr)` }}>
          {bottom.map((m) => { const active = m.value === module; const c = active ? 'var(--content-primary)' : 'var(--content-tertiary)'; return (
            <button key={m.value} type="button" onClick={() => onModuleChange && onModuleChange(m.value)} style={{ border: 0, background: 'transparent', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', gap: 4, cursor: 'pointer', color: c }}>
              <Icon name={m.icon} size={20} stroke={1.75} /><span style={textStyle('caption-2', { strong: active, color: c })}>{m.label}</span>
            </button>); })}
        </nav>
      ) : null}
    </div>
  );
}
