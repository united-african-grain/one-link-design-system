import React from 'react';
import { Banner } from './Banner.jsx';

/** The S57 blocked-action pattern, "[Action] is not allowed. [Reason].", as an error banner with the hard-block icon.
    Use it when a press is refused (a switch whose precondition is unmet, an alternative that cannot be chosen yet);
    a field's own problem is a Field error instead. */
export function Refusal({ action, reason, style }) {
  const end = (s) => (/[.!?]$/.test(String(s).trim()) ? String(s).trim() : `${String(s).trim()}.`);
  return <Banner tone="error" icon="octagon-x" style={style}>{`${action} is not allowed. ${end(reason)}`}</Banner>;
}
