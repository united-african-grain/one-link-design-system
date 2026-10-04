import React from 'react';
import { DataTable, RefCell } from '../data/DataTable.jsx';
import { EmptyState } from '../feedback/EmptyState.jsx';
import { StatusMark } from '../feedback/StatusMark.jsx';

const EXCEPTION_STATUS_SPEC = { open: { kind: 'breach', label: 'Open' }, acknowledged: { kind: 'pending', label: 'Acknowledged' }, closed: { kind: 'clean', label: 'Closed' } };
export const EXCEPTION_STATUSES = Object.keys(EXCEPTION_STATUS_SPEC);

/** The status of an exception (UX-32): Open is the red exclamation circle (UX-14), Acknowledged stays open, Closed. */
export function ExceptionStatus({ status = 'open', size = 'body-4' }) {
  const s = EXCEPTION_STATUS_SPEC[status] || EXCEPTION_STATUS_SPEC.open;
  return <StatusMark kind={s.kind} label={s.label} size={size} />;
}

/** The Exceptions list (UX-07): Type, Exception (a link that opens it), Record (a link only where the viewer can open
    that record, otherwise plain text), Value at risk (USD) only with the price tier, Owner, Age and Status. Severity
    shows through the type and the order of the rows, never a coloured tag. The `owner` variant draws each row's
    business wording (`business`, `businessRecord`) and nothing else from the row: no source, connection or ticket
    reference reaches the owner. The `clerk` variant draws the operational wording (`title`, `record`). Wording wraps,
    never cut. */
export function ExceptionList({ rows = [], variant = 'clerk', priceTier = false, onOpen, onOpenRecord, style }) {
  const owner = variant === 'owner';
  const title = (r) => (owner ? r.business : r.title);
  const record = (r) => (owner ? r.businessRecord : r.record);
  const canOpen = (r) => (owner ? !!r.businessRecordLink : !!r.recordLink);
  const columns = [
    { key: 'type', label: 'Type', width: '120px', wrap: true },
    { key: 'title', label: 'Exception', width: 'minmax(220px, 2fr)', wrap: true, render: (r) => <span data-exception={r.id} onClick={() => onOpen && onOpen(r.id)}><RefCell>{title(r)}</RefCell></span> },
    { key: 'record', label: 'Record', width: 'minmax(180px, 1.4fr)', wrap: true, render: (r) => (canOpen(r) ? <span onClick={() => onOpenRecord && onOpenRecord(r.id)}><RefCell>{record(r)}</RefCell></span> : record(r)) },
    ...(priceTier ? [{ key: 'value', label: 'Value at risk (USD)', align: 'right', width: '160px' }] : []),
    { key: 'owner', label: 'Owner', width: '170px', wrap: true },
    { key: 'age', label: 'Age', width: '100px', tabular: true },
    { key: 'status', label: 'Status', width: '150px', render: (r) => <ExceptionStatus status={r.status} /> },
  ];
  const min = columns.reduce((n, c) => n + (c.width && /^\d+px$/.test(c.width) ? parseInt(c.width, 10) : parseInt(String(c.width || '').replace(/^minmax\((\d+)px.*$/, '$1'), 10) || 200), 0);
  return (
    <div data-exception-list={variant} style={{ minWidth: 0, ...style }}>
      {rows.length ? <DataTable rowKey="id" columns={columns} rows={rows} minWidth={min} /> : <EmptyState title="No exceptions to display." />}
    </div>
  );
}
