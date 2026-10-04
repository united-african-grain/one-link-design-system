import React from 'react';
import { StatusMark } from '../feedback/StatusMark.jsx';

// A weighbridge ticket's readiness, its status (UX-14: an icon and a word). It is drawn apart from the weight's
// source (the labelled field Source) and from counterparty agreement (Counterparty status), never merged or nested
// (P9). "Weighed in only" lives here: it is readiness, never a source. Composed from StatusMark, so it adds no look.
const READINESS_SPEC = {
  ready: { mark: 'clean', word: 'Ready' },
  'weighed-in-only': { mark: 'neutral', word: 'Weighed in only' },
  stalled: { mark: 'pending', word: 'Stalled' },
  problem: { mark: 'breach', word: 'Problem' },
  'pending-reading': { mark: 'neutral', word: 'Pending reading' },
  'awaiting-confirmation': { mark: 'pending', word: 'Waiting for confirmation' },
  received: { mark: 'clean', word: 'Received' },
  closed: { mark: 'flat', word: 'Closed' },
};
export const READINESS_KINDS = Object.keys(READINESS_SPEC);

/** Readiness of a weighbridge ticket: Ready, Weighed in only, Stalled, Problem, Pending reading, Waiting for
    confirmation, Received, Closed. A StatusMark, so icon plus word. */
export function ReadinessChip({ kind = 'ready', size = 'body-4', style }) {
  const r = READINESS_SPEC[kind] || READINESS_SPEC.ready;
  return <span data-readiness={kind} style={{ display: 'inline-flex', ...style }}><StatusMark kind={r.mark} label={r.word} size={size} /></span>;
}
