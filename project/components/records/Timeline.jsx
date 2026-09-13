import React from 'react';
import { Icon } from '../core/Icon.jsx';
import { textStyle } from '../core/Text.jsx';
import { MetaParts } from '../data/Card.jsx';

/** History timeline: 12px dots on a 1px border line. Compensating entries show rotate-ccw. */
export function Timeline({ entries = [], style }) {
  return (
    <ol style={{ listStyle: 'none', margin: 0, padding: 0, display: 'flex', flexDirection: 'column', ...style }}>
      {entries.map((e, i) => (
        <li key={i} style={{ display: 'grid', gridTemplateColumns: '12px minmax(0,1fr)', gap: 12, position: 'relative', paddingBottom: i < entries.length - 1 ? 16 : 0 }}>
          <span aria-hidden style={{ position: 'relative', width: 12, height: 12, marginTop: 4, borderRadius: '50%', background: e.compensating ? 'var(--elevated)' : (e.color || 'var(--content-secondary)'), boxShadow: e.compensating ? 'inset 0 0 0 2px var(--content-secondary)' : 'none', flex: 'none', zIndex: 1 }} />
          {i < entries.length - 1 ? <span aria-hidden style={{ position: 'absolute', left: 5.5, top: 16, bottom: 0, width: 1, background: 'var(--border)' }} /> : null}
          <div style={{ display: 'flex', flexDirection: 'column', gap: 2, minWidth: 0 }}>
            <span style={{ display: 'flex', alignItems: 'center', gap: 6, ...textStyle('body-3'), textWrap: 'pretty' }}>{e.compensating ? <Icon name="rotate-ccw" size={14} color="var(--content-secondary)" /> : null}{e.text}</span>
            <span style={{ display: 'block', ...textStyle('body-4', { tone: 'secondary' }), fontVariantNumeric: 'tabular-nums' }}><MetaParts meta={[e.actor, e.time]} /></span>
          </div>
        </li>
      ))}
    </ol>
  );
}
