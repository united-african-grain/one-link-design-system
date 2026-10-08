import React from 'react';
import { textStyle } from '../core/Text.jsx';
import { Tabs } from '../navigation/Tabs.jsx';
import { RefCell } from '../data/DataTable.jsx';

/** The record highlights panel (map UX-19): what the record is, its name and status, at most one primary action with
    the others beside it, then its key fields as label and value pairs. Below it, the Details, Related and History
    tabs. Fields wrap onto more rows on a narrow screen; a value that does not exist is left blank (UX-09). A field with
    a `link` draws its value as the blue reference link (an exception's Linked record): Tab reaches it, Enter opens it,
    and `onLink` is told which field. */
export function RecordHighlights({ kind, title, status, actions, fields = [], tabs = ['Details', 'Related', 'History'], tab = 'Details', onTab, onLink, style }) {
  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 16, minWidth: 0, ...style }}>
      <section aria-label={kind ? `${kind} ${title}` : String(title)} style={{ background: 'var(--elevated)', borderRadius: 'var(--radius-lg)', boxShadow: 'var(--shadow-minimal-soft)', padding: 16, display: 'flex', flexDirection: 'column', gap: 16, minWidth: 0 }}>
        <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', gap: 12, flexWrap: 'wrap' }}>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 4, minWidth: 0, flex: '1 1 240px' }}>
            {kind ? <span style={textStyle('body-4', { tone: 'secondary' })}>{kind}</span> : null}
            <span style={{ display: 'flex', alignItems: 'center', flexWrap: 'wrap', gap: 8 }}>
              <span style={{ ...textStyle('heading-4', { strong: true }), overflowWrap: 'anywhere' }}>{title}</span>
              {status}
            </span>
          </div>
          {actions ? <div style={{ display: 'flex', alignItems: 'center', flexWrap: 'wrap', gap: 8 }}>{actions}</div> : null}
        </div>
        {fields.length ? (
          <dl style={{ margin: 0, paddingTop: 16, boxShadow: 'inset 0 1px 0 var(--border-light)', display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(150px, 1fr))', gap: '16px 24px' }}>
            {fields.map((f, i) => (
              <div key={i} style={{ display: 'flex', flexDirection: 'column', gap: 4, minWidth: 0 }}>
                <dt style={textStyle('body-4', { tone: 'secondary' })}>{f.label}</dt>
                <dd style={{ margin: 0, ...textStyle('body-3'), fontVariantNumeric: 'tabular-nums', overflowWrap: 'anywhere' }}>{f.link && f.value != null && f.value !== '' ? <span data-highlight-link><RefCell href={f.link} onOpen={() => onLink && onLink(f)}>{f.value}</RefCell></span> : f.value}</dd>
              </div>
            ))}
          </dl>
        ) : null}
      </section>
      {tabs && tabs.length ? <Tabs tabs={tabs} value={tab} onChange={onTab} height={44} variant="panel" /> : null}
    </div>
  );
}
