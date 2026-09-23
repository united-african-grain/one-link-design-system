import React from 'react';
import { Icon } from '../core/Icon.jsx';
import { textStyle } from '../core/Text.jsx';
import { useInteraction, usePrefersReducedMotion } from '../core/Interaction.jsx';

/* The way into the assistant, and the only thing it leaves on the screen while it is shut.
 *
 * A 44px pill in the inverted fill, bottom right, carrying an icon and one word. One word rather
 * than a bare circle because a circle with a sparkle in it is a guess: the word says what pressing
 * it gets you. Inverted rather than brand blue because it is not a decision, it is a door, and the
 * brand fill in One Link belongs to the things that commit something.
 *
 * It floats, so it carries shadow-strong: the same elevation as every other large action that sits
 * over the page. It is never fixed by the component itself. Where it goes is the frame's business,
 * and in the app that means clear of the bottom ticker and clear of the phone's module bar. The
 * component only draws the pill.
 */

/** The assistant's launcher: a 44px inverted pill with an icon and one word. Give it `expanded` while its panel is open. */
export function AssistantLauncher({ label = 'Guide', icon = 'sparkles', expanded = false, onClick, style, ...rest }) {
  const { hover, down, focusVisible, handlers } = useInteraction();
  const reduced = usePrefersReducedMotion();
  const ring = focusVisible ? ', 0 0 0 4px color-mix(in srgb, var(--inverted) 25%, transparent)' : '';
  return (
    <button
      type="button"
      aria-expanded={expanded}
      onClick={onClick}
      {...handlers}
      style={{
        display: 'inline-flex', alignItems: 'center', gap: 9, height: 44, padding: '0 16px 0 13px',
        border: 0, borderRadius: 'var(--radius-max)', cursor: 'pointer', outline: 'none', whiteSpace: 'nowrap', userSelect: 'none',
        background: hover ? 'color-mix(in srgb, var(--hover-mix-filled), var(--inverted))' : 'var(--inverted)',
        color: 'var(--buttons-label)',
        boxShadow: `var(--shadow-strong)${ring}`,
        transform: down && !reduced ? 'scale(var(--scale-press-button))' : 'scale(1)',
        transition: 'background var(--dur-default) var(--ease-default), transform var(--dur-default) var(--ease-default), box-shadow var(--dur-default) var(--ease-default)',
        ...textStyle('body-3', { strong: true, tone: 'label' }),
        ...style,
      }}
      {...rest}
    >
      <Icon name={icon} size={18} stroke={1.75} />
      {label}
    </button>
  );
}
