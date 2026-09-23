import React from 'react';
import { Icon } from '../core/Icon.jsx';
import { textStyle } from '../core/Text.jsx';
import { useInteraction } from '../core/Interaction.jsx';

/* Where an answer came from.
 *
 * A small pill under a piece of written text, naming the help page it was taken from and going
 * there. It is a link and not a button, because a reader has every right to open it in a new tab
 * and read the whole page rather than the sentence an assistant chose for them.
 *
 * It carries a page name and nothing else. No figure, no counterparty, no date, no confidence
 * score: a citation that says "92% match" invites the reader to trust the number instead of
 * reading the page, which is the opposite of the point. Radius 8 and the grouped-light fill, the
 * same recipe as the dimmed quantity chip, so it reads as a label rather than as an action
 * competing with the answer above it.
 */

/** A source pill under an answer: the help page it came from, as a link. */
export function CitationChip({ label, href = '#', icon = 'file-text', onClick, style, ...rest }) {
  const { hover, focusVisible, handlers } = useInteraction();
  return (
    <a
      href={href}
      onClick={onClick}
      {...handlers}
      style={{
        display: 'inline-flex', alignItems: 'center', gap: 6, maxWidth: '100%',
        height: 26, padding: '0 9px 0 8px', borderRadius: 'var(--radius-2xs)',
        background: hover ? 'var(--grouped)' : 'var(--grouped-light)',
        textDecoration: 'none', outline: 'none',
        boxShadow: focusVisible ? '0 0 0 4px color-mix(in srgb, var(--content-primary) 25%, transparent)' : 'none',
        transition: 'background var(--dur-default) var(--ease-default), box-shadow var(--dur-default) var(--ease-default)',
        ...textStyle('caption-1', { tone: hover ? 'primary' : 'secondary' }),
        ...style,
      }}
      {...rest}
    >
      <Icon name={icon} size={12} />
      <span style={{ overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{label}</span>
    </a>
  );
}
