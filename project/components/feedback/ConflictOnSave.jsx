import React from 'react';
import { Banner } from './Banner.jsx';
import { Button } from '../actions/Button.jsx';
import { textStyle } from '../core/Text.jsx';

/** Conflict on save (S57 message pattern, architecture 13.1): someone else saved this record first, so this save was
    not applied and nothing of theirs was lost. The message names who and when; the person's own values stay listed
    beside the current record, so nothing they typed is lost either; Reload brings the latest version. Nobody is locked
    out while a record is open: the check happens at save. */
export function ConflictOnSave({ user, time, yours = [], onReload, style }) {
  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 8, ...style }}>
      <Banner tone="warning" icon="git-compare-arrows" action={<Button variant="outline" size="xsmall" icon="refresh-cw" onClick={onReload}>Reload</Button>}>
        {`This record was changed by ${user} at ${time}. Reload to see the latest version.`}
      </Banner>
      {yours.length ? (
        <dl style={{ margin: 0, padding: '12px 16px', borderRadius: 'var(--radius-md)', border: '1px solid var(--border-light)', display: 'grid', gridTemplateColumns: 'minmax(120px, max-content) minmax(0, 1fr)', gap: '4px 16px' }}>
          <dt style={{ gridColumn: '1 / -1', ...textStyle('caption-1', { color: 'var(--content-tertiary)' }) }}>Your changes, not saved</dt>
          {yours.map((y) => (
            <React.Fragment key={y.label}>
              <dt style={textStyle('body-4', { color: 'var(--content-secondary)' })}>{y.label}</dt>
              <dd style={{ margin: 0, ...textStyle('body-4', { color: 'var(--content-primary)' }) }}>{y.value}</dd>
            </React.Fragment>
          ))}
        </dl>
      ) : null}
    </div>
  );
}
