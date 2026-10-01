import React from 'react';
import { Card } from '../data/Card.jsx';
import { StatusMark } from '../feedback/StatusMark.jsx';
import { textStyle } from '../core/Text.jsx';

const RECONCILE_OUTCOMES = {
  within: { kind: 'clean', word: 'Within tolerance' },
  allowance: { kind: 'clean', word: 'Within allowance' },
  beyond: { kind: 'attention', word: 'Beyond tolerance' },
};

/**
 * The Reconcile card (map UX-20): where a record or form checks one quantity against another, a
 * card at the right with label and value rows, the key difference in bold, and a closing status
 * line with its icon: Within tolerance, Within allowance or Beyond tolerance.
 */
export function ReconcileCard({ title = 'Reconcile', rows = [], outcome = 'within', status, style }) {
  const o = RECONCILE_OUTCOMES[outcome] || RECONCILE_OUTCOMES.within;
  return (
    <Card title={title} style={style}>
      <dl style={{ margin: 0, display: 'grid', gridTemplateColumns: '1fr auto', rowGap: 8, columnGap: 16 }}>
        {rows.map((r, i) => (
          <React.Fragment key={i}>
            <dt style={textStyle('body-3', { tone: 'secondary', strong: !!r.strong })}>{r.label}</dt>
            <dd style={{ margin: 0, textAlign: 'right', ...textStyle('body-3', { strong: !!r.strong, tabular: true }) }}>{r.value}</dd>
          </React.Fragment>
        ))}
      </dl>
      <StatusMark kind={o.kind} label={status || o.word} />
    </Card>
  );
}
