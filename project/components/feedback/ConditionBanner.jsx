import React from 'react';
import { Banner } from './Banner.jsx';

/**
 * The condition banner (map UX-23): a condition that affects the whole page or record (integration
 * offline, waiting for approval, not departed, proof missing), pale yellow with the warning icon,
 * above the highlights panel or tiles, in one or two short sentences. It is the only explanatory
 * text a screen carries; every other fact is a labelled field.
 */
export function ConditionBanner({ children, action, style }) {
  return <Banner tone="warning" action={action} style={style}>{children}</Banner>;
}
