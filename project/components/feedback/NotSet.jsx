import React from 'react';
import { StatusMark } from './StatusMark.jsx';
import { Dot } from '../data/Card.jsx';
import { textStyle } from '../core/Text.jsx';

/**
 * Not set (map UX-16): a required setting with no value. The words "Not set" as a status with the
 * amber triangle, in the value's place, with the setting's owner when the layout shows it. A figure
 * that depends on the setting shows the same state, and Calculation details names the setting.
 */
export function NotSet({ owner, size = 'body-3', style }) {
  return (
    <span style={{ display: 'inline-flex', alignItems: 'center', whiteSpace: 'nowrap', ...style }}>
      <StatusMark kind="notSet" size={size} />
      {owner ? <><Dot /><span style={textStyle('body-4', { tone: 'secondary' })}>{owner}</span></> : null}
    </span>
  );
}
