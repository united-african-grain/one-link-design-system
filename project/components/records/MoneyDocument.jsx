import React from 'react';
import { Text, textStyle } from '../core/Text.jsx';
import { Logo } from '../core/Logo.jsx';
import { Card } from '../data/Card.jsx';
import { DataTable } from '../data/DataTable.jsx';

/** The two money documents One Link draws (M7.DS.02 AC 5, 6), sharing one layout so the screen and the PDF cannot
    drift (Architecture notes). Their titles and labels are fixed here and cannot be passed in:
    - Invoice-ready data carries "Not a tax invoice" in its header and its footer. It has no invoice number and no
      issue, send or fiscalise control: the tax invoice is raised outside One Link (Map D-02, D-12).
    - The settlement statement is titled Settlement statement. It is a statement of what was netted and what is owed;
      it carries no bank detail of any kind. */
export const MONEY_DOCUMENTS = {
  'invoice-ready': { title: 'Invoice-ready data', label: 'Not a tax invoice' },
  'settlement-statement': { title: 'Settlement statement', label: 'Settlement statement' },
};

/** A field a money document never carries: a bank, an account number, a branch, sort or swift code, an IBAN. */
export const BANK_FIELD = /\b(bank|account (?:number|no\.?)|iban|swift|bic|sort code|branch(?: code)?|routing)\b/i;
/** The fields a document draws: every given field except a bank detail. */
export function documentFields(fields = []) {
  return fields.filter(([label]) => !BANK_FIELD.test(String(label)));
}

/**
 * Money document (M7.DS.02): the invoice-ready data export and the settlement statement, as the PDF prints them, in a
 * preview card. `kind` picks the title and label, which are fixed. The header names the counterparty and the
 * document's facts (`fields`, label and value; a bank detail is dropped), then the lines as a table (`columns`,
 * `rows`, with a bold total row), then a footer that repeats the label with the reference and when it was generated.
 * There is no slot for an action: what a reader does with the document (Export, Download) sits on the page around it.
 */
export function MoneyDocument({ kind = 'invoice-ready', counterparty, reference, generated, fields = [], columns = [], rows = [], minWidth = 560, style }) {
  const doc = MONEY_DOCUMENTS[kind] || MONEY_DOCUMENTS['invoice-ready'];
  const label = <span data-document-label="" style={{ ...textStyle('body-4', { strong: true, tone: 'secondary' }), whiteSpace: 'nowrap' }}>{doc.label}</span>;
  return (
    <Card title="Preview" padding={16} style={style}>
      <div style={{ background: 'var(--grouped)', borderRadius: 'var(--radius-md)', padding: 16, minWidth: 0 }}>
        <div data-money-document={kind} style={{ background: 'var(--elevated)', boxShadow: 'var(--shadow-minimal-soft)', maxWidth: 760, margin: '0 auto', padding: 24, display: 'flex', flexDirection: 'column', gap: 16, minWidth: 0 }}>
          <span data-document-header="" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', gap: 12, flexWrap: 'wrap' }}>
            <span style={{ display: 'flex', flexDirection: 'column', gap: 4, minWidth: 0 }}>
              <Text variant="heading-4" strong>{doc.title}</Text>
              {kind === 'invoice-ready' ? label : null}
              {counterparty ? <Text variant="body-3" tone="secondary">{counterparty}</Text> : null}
            </span>
            <Logo markOnly product="One Link" />
          </span>
          {fields.length ? (
            <dl style={{ margin: 0, display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(150px, 1fr))', gap: 16 }}>
              {documentFields(fields).map(([l, v]) => (
                <div key={l} style={{ display: 'flex', flexDirection: 'column', gap: 4, minWidth: 0 }}>
                  <dt style={textStyle('body-4', { tone: 'secondary' })}>{l}</dt>
                  <dd style={{ margin: 0, ...textStyle('body-3', { tabular: true }), overflowWrap: 'anywhere' }}>{v}</dd>
                </div>
              ))}
            </dl>
          ) : null}
          <DataTable rowKey="id" rows={rows} minWidth={minWidth} columns={columns.map((c) => ({ ...c, render: (r, i) => {
            const v = c.render ? c.render(r, i) : r[c.key];
            return r.total ? <Text variant="body-3" strong tabular>{v}</Text> : v;
          } }))} />
          <span data-document-footer="" style={{ display: 'flex', justifyContent: 'space-between', gap: 12, flexWrap: 'wrap', paddingTop: 12, boxShadow: 'inset 0 1px 0 var(--border-light)' }}>
            {label}
            <span style={{ ...textStyle('body-4', { tone: 'tertiary' }), fontVariantNumeric: 'tabular-nums' }}>{[reference, generated ? `Generated ${generated}` : ''].filter(Boolean).join(', ')}</span>
          </span>
        </div>
      </div>
    </Card>
  );
}
