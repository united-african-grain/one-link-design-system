import React from 'react';
import { Icon } from '../core/Icon.jsx';
import { textStyle } from '../core/Text.jsx';
import { Button } from '../actions/Button.jsx';
import { StatusMark } from '../feedback/StatusMark.jsx';
import { CardRow } from '../data/Card.jsx';

/** What a capture's sync state draws (M4.DS.03, UX-31). The state is the sync state machine's own value: queued and
    sending stay busy until the server confirms, so nothing is drawn as sent before it has synced; a damaged file asks
    for the capture again in the S57 words. */
export const CAPTURE_SYNC = {
  queued: { word: 'Pending sync', busy: true },
  sending: { word: 'Sending', busy: true },
  synced: { word: 'Synced', kind: 'clean' },
  damaged: { word: 'File is damaged. Capture it again.', kind: 'breach' },
};

/** True while a capture waits for the server: every state but synced and damaged. An unknown state is treated as
    queued, so a capture is never shown as done by mistake. */
export function captureBusy(sync) {
  return !!(CAPTURE_SYNC[sync] || CAPTURE_SYNC.queued).busy;
}

/** The count behind "Pending sync (count)": every capture the server has not confirmed, damaged ones included, so the
    count is never 0 while anything is queued. */
export function pendingSyncCount(captures = []) {
  return captures.filter((c) => c && c.sync !== 'synced').length;
}

const LEADING = { photo: 'camera', signature: 'pencil', document: 'file-text' };

/** One capture on the phone (M4.DS.03): what it is, when it was taken, and its sync state. Queued and sending show the
    spinner and "Pending sync" until synced; synced is a status mark; a damaged file says "File is damaged. Capture it
    again." with Capture again, which shows its working state while the new capture is taken. */
export function CaptureTile({ kind = 'photo', title, meta, sync = 'queued', recapturing = false, onRecapture, style }) {
  const s = CAPTURE_SYNC[sync] || CAPTURE_SYNC.queued;
  const busy = captureBusy(sync);
  const leading = (
    <span aria-hidden style={{ width: 40, height: 40, flex: 'none', borderRadius: 'var(--radius-sm)', background: 'var(--grouped-elevated)', display: 'inline-flex', alignItems: 'center', justifyContent: 'center', color: 'var(--content-secondary-solid)' }}>
      <Icon name={LEADING[kind] || 'file-text'} size={20} stroke={1.75} />
    </span>
  );
  const trailing = busy ? (
    <span role="status" aria-busy="true" style={{ display: 'inline-flex', alignItems: 'center', gap: 4, ...textStyle('body-4', { strong: true, tone: 'secondary' }) }}>
      <Icon name="loader-circle" size={14} spin />{s.word}
    </span>
  ) : sync === 'damaged' ? (
    <Button variant="outline" size="xsmall" loading={recapturing} onClick={onRecapture}>Capture again</Button>
  ) : <StatusMark kind={s.kind} label={s.word} size="body-4" />;
  return (
    <div data-capture-sync={sync} style={style}>
      <CardRow stacked leading={leading} name={title} sub={meta} trailing={trailing}
        bar={sync === 'damaged' ? <StatusMark kind={s.kind} label={s.word} size="body-4" style={{ whiteSpace: 'normal' }} /> : null} />
    </div>
  );
}
