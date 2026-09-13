import React from 'react';
import { Icon } from '../core/Icon.jsx';
import { textStyle } from '../core/Text.jsx';
import { Dot } from '../data/Card.jsx';

/** 96×72 evidence tile (radius 12, grouped-elevated, photo cover) with a body-4 secondary caption. Voice-note variant shows volume-2 + duration. */
export function EvidenceTile({ kind = 'photo', src, caption, duration, time, onClick, style }) {
  return (
    <button type="button" onClick={onClick} style={{ border: 0, background: 'transparent', padding: 0, cursor: onClick ? 'pointer' : 'default', display: 'flex', flexDirection: 'column', gap: 6, alignItems: 'flex-start', textAlign: 'left', width: 96, ...style }}>
      <span style={{ width: 96, height: 72, borderRadius: 'var(--radius-sm)', background: 'var(--grouped-elevated)', overflow: 'hidden', display: 'flex', alignItems: 'center', justifyContent: 'center', position: 'relative', color: 'var(--content-secondary-solid)' }}>
        {kind === 'photo' && src ? <img src={src} alt="" style={{ width: '100%', height: '100%', objectFit: 'cover', animation: 'ol-reveal var(--dur-photo) var(--ease-default)' }} /> : <Icon name={kind === 'voice' ? 'volume-2' : kind === 'document' ? 'file-text' : kind === 'receipt' ? 'receipt' : 'camera'} size={20} stroke={1.75} />}
        {kind === 'voice' && duration ? <span style={{ position: 'absolute', right: 6, bottom: 6, padding: '1px 5px', borderRadius: 'var(--radius-4xs)', background: 'var(--inverted)', ...textStyle('caption-2', { strong: true, color: '#fff' }), fontVariantNumeric: 'tabular-nums' }}>{duration}</span> : null}
      </span>
      {caption ? <span style={{ ...textStyle('body-4', { tone: 'secondary' }), fontVariantNumeric: 'tabular-nums', width: 96, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }} title={time ? `${caption}, ${time}` : caption}>{caption}{time ? <><Dot />{time}</> : null}</span> : null}
    </button>
  );
}
