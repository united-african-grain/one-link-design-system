import React from 'react';
import { StatusMark } from '../feedback/StatusMark.jsx';

/** A count as a whole number: "1,200" is 1200; a blank is not a count. */
function count(n) {
  const v = parseInt(String(n == null ? '' : n).replace(/,/g, ''), 10);
  return Number.isFinite(v) ? v : null;
}

/** The bag count against the signed count sheet (RL-BAG-MATCH, M4.OUT.06): matches only when the loaded count equals
    the sheet within the tolerance, which stays at 0. There is no warn mode: any other difference is a mismatch, and a
    missing count is never a match. */
export function bagCountState(sheet, loaded, tolerance = 0) {
  const s = count(sheet);
  const l = count(loaded);
  if (s == null || l == null) return 'mismatch';
  return Math.abs(s - l) <= (count(tolerance) || 0) ? 'matches' : 'mismatch';
}

/** The reason Ship is refused, for Refusal's "[Action] is not allowed. [Reason].": "Bag count 399 does not match count
    sheet 400". */
export function bagCountReason(sheet, loaded) {
  return `Bag count ${String(loaded)} does not match count sheet ${String(sheet)}`;
}

export const COUNT_MARKS = {
  matches: { kind: 'clean', word: 'Count sheet matches' },
  mismatch: { kind: 'breach', word: 'Count mismatch' },
};

/** The bag count's closing line (M4.DS.02): Count sheet matches, or Count mismatch, an icon and a word (UX-14). It is
    the Reconcile card's `mark` on a fertiliser delivery note; Ship is disabled while it reads Count mismatch. */
export function CountMatch({ sheet, loaded, tolerance = 0, size = 'body-3', style }) {
  const m = COUNT_MARKS[bagCountState(sheet, loaded, tolerance)];
  return <StatusMark kind={m.kind} label={m.word} size={size} style={style} />;
}
