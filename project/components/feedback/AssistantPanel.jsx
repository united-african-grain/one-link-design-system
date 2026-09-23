import React, { useEffect, useRef, useState } from 'react';
import { Icon } from '../core/Icon.jsx';
import { Logo } from '../core/Logo.jsx';
import { textStyle } from '../core/Text.jsx';
import { useInteraction, usePrefersReducedMotion } from '../core/Interaction.jsx';

/* The assistant's panel: a small conversation in the corner of the product.
 *
 * WHY THE TWO SIDES OF A TURN LOOK NOTHING ALIKE. A question is a pill, right aligned, in the
 * inverted fill. An answer is not a bubble at all: it is plain set text on the surface, the same
 * body-2 the help centre itself uses. Two bubbles facing each other is a chat app, and a chat app
 * asks to be talked to. This is a reference book that was asked a question, and it should read
 * like one, so the answer gets the width of the panel and the reader's whole attention while the
 * question stays a small record of what was asked. Keep the asymmetry.
 *
 * WHAT IT IS NOT. There is no avatar for the assistant, no name, no typing dots, no thumbs, no
 * personality. The only thing under an answer is where it came from. An assistant that performs
 * being a person invites the reader to believe it the way they would believe a person, and this
 * one is only ever as right as the page it is quoting.
 *
 * The footer line is part of the component rather than something a caller remembers to pass,
 * because it is a promise about what the thing does and it must be on every instance of it.
 *
 * 400px wide, 620px tall at the most, radius 20, elevated, shadow-dialog: a dialog that happens to
 * live in a corner. Below 768px it becomes a full-height sheet instead, because a 400px panel
 * floating on a 390px phone is a panel with no phone around it. Opening runs on the spring; under
 * reduced motion it fades.
 *
 * Focus, Escape and the top layer are the caller's job in a real app (the Angular port renders it
 * inside a native dialog). This component draws the panel and its parts.
 */

const ASSISTANT_RING = '0 0 0 4px color-mix(in srgb, var(--content-primary) 25%, transparent)';

/** A 32px round icon button in the panel header. */
function AssistantIconButton({ icon, label, onClick }) {
  const { hover, focusVisible, handlers } = useInteraction();
  return (
    <button type="button" aria-label={label} title={label} onClick={onClick} {...handlers}
      style={{ width: 32, height: 32, flex: 'none', display: 'inline-flex', alignItems: 'center', justifyContent: 'center',
        border: 0, borderRadius: 'var(--radius-max)', cursor: 'pointer', outline: 'none',
        background: hover ? 'var(--grouped)' : 'transparent', color: 'var(--content-tertiary)',
        boxShadow: focusVisible ? ASSISTANT_RING : 'none',
        transition: 'background var(--dur-default) var(--ease-default), box-shadow var(--dur-default) var(--ease-default)' }}>
      <Icon name={icon} size={16} stroke={1.75} />
    </button>
  );
}

/** One thing the reader could ask, as a full-width row. Only ever a real help page, never an invented question. */
export function AssistantSuggestion({ children, icon = 'file-text', onClick, style }) {
  const { hover, focusVisible, handlers } = useInteraction();
  return (
    <button type="button" onClick={onClick} {...handlers}
      style={{ display: 'flex', alignItems: 'center', gap: 9, width: '100%', textAlign: 'left',
        padding: '10px 12px', border: 0, borderRadius: 'var(--radius-md)', cursor: 'pointer', outline: 'none',
        background: hover ? 'var(--grouped)' : 'var(--grouped-light)',
        boxShadow: focusVisible ? ASSISTANT_RING : 'none',
        transition: 'background var(--dur-default) var(--ease-default), box-shadow var(--dur-default) var(--ease-default)',
        ...textStyle('body-3'), ...style }}>
      <Icon name={icon} size={15} color="var(--content-tertiary)" />
      <span style={{ minWidth: 0 }}>{children}</span>
    </button>
  );
}

/** What was asked: a right-aligned pill in the inverted fill. */
export function AssistantQuestion({ children, style }) {
  return (
    <div style={{ alignSelf: 'flex-end', maxWidth: '84%', padding: '9px 13px',
      borderRadius: '14px 14px 4px 14px', background: 'var(--inverted)',
      ...textStyle('body-3', { tone: 'label' }), ...style }}>{children}</div>
  );
}

/** The answer: plain set text on the surface. Sources go under it as citation chips. */
export function AssistantAnswer({ children, sources, style }) {
  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 11, ...style }}>
      <div style={{ textWrap: 'pretty', ...textStyle('body-2') }}>{children}</div>
      {sources ? <div style={{ display: 'flex', flexWrap: 'wrap', gap: 6 }}>{sources}</div> : null}
    </div>
  );
}

/** The wait, said plainly: what it is doing, not that it is thinking. */
export function AssistantWorking({ label = 'Reading the help centre', style }) {
  return (
    <div role="status" style={{ display: 'inline-flex', alignItems: 'center', gap: 8, ...textStyle('body-3', { tone: 'tertiary' }), ...style }}>
      <Icon name="loader-circle" size={14} stroke={2} spin />
      {label}
    </div>
  );
}

/** The assistant's panel: header, conversation, composer and the line about what it will not do. */
export function AssistantPanel({
  open = true,
  title = 'Guide',
  subtitle = 'Answers from the help centre',
  footer = 'It explains the product. It never reads your business figures.',
  placeholder = 'Ask about One Link',
  value = '',
  onValueChange,
  onSend,
  onClose,
  onRestart,
  sending = false,
  sheet = false,
  contained = false,
  width = 400,
  maxHeight = 620,
  children,
  style,
}) {
  const [shown, setShown] = useState(false);
  const reduced = usePrefersReducedMotion();
  const field = useRef(null);
  const send = useInteraction({ inert: sending });
  useEffect(() => {
    if (!open) { setShown(false); return undefined; }
    const t = requestAnimationFrame(() => setShown(true));
    return () => cancelAnimationFrame(t);
  }, [open]);
  if (!open) return null;

  const submit = (e) => {
    e.preventDefault();
    if (!sending && onSend) onSend(value);
  };

  return (
    <div role="dialog" aria-label={title} style={{
      position: contained ? 'absolute' : 'relative',
      ...(contained ? { right: 0, bottom: 0 } : null),
      display: 'flex', flexDirection: 'column', boxSizing: 'border-box',
      width: sheet ? '100%' : width, maxWidth: '100%',
      height: sheet ? '100%' : undefined, maxHeight: sheet ? '100%' : maxHeight,
      background: 'var(--elevated)',
      borderRadius: sheet ? 'var(--radius-lg) var(--radius-lg) 0 0' : 'var(--radius-lg)',
      boxShadow: 'var(--shadow-dialog)', overflow: 'hidden',
      transformOrigin: 'bottom right',
      opacity: shown ? 1 : 0,
      transform: shown || reduced ? 'none' : (sheet ? 'translateY(100%)' : 'translateY(8px) scale(.96)'),
      transition: reduced
        ? 'opacity var(--dur-default) var(--ease-default)'
        : 'transform var(--dur-swap) var(--ease-spring), opacity var(--dur-default) var(--ease-default)',
      ...style,
    }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: 10, flex: 'none', padding: '14px 12px 14px 18px', boxShadow: 'inset 0 -1px 0 var(--border-light)' }}>
        <Logo markOnly size="sm" />
        <span style={{ flex: 1, minWidth: 0, display: 'flex', flexDirection: 'column', gap: 1 }}>
          <span style={textStyle('body-3', { strong: true })}>{title}</span>
          <span style={textStyle('caption-1', { tone: 'tertiary' })}>{subtitle}</span>
        </span>
        {onRestart ? <AssistantIconButton icon="rotate-ccw" label="Start again" onClick={onRestart} /> : null}
        {onClose ? <AssistantIconButton icon="x" label="Close" onClick={onClose} /> : null}
      </div>

      <div style={{ flex: 1, minHeight: 0, overflowY: 'auto', overscrollBehavior: 'contain', padding: 18, display: 'flex', flexDirection: 'column', gap: 20 }}>
        {children}
      </div>

      <form onSubmit={submit} style={{ flex: 'none', display: 'flex', gap: 8, alignItems: 'center', padding: 12, boxShadow: 'inset 0 1px 0 var(--border-light)' }}>
        <input ref={field} value={value} placeholder={placeholder} aria-label={placeholder}
          onChange={(e) => onValueChange && onValueChange(e.target.value)}
          style={{ flex: 1, minWidth: 0, height: 44, padding: '0 14px', border: 0, outline: 'none',
            borderRadius: 'var(--radius-sm-h)', background: 'var(--grouped)', ...textStyle('body-3') }} />
        <button type="submit" aria-label="Send" disabled={sending} {...send.handlers}
          style={{ width: 44, height: 44, flex: 'none', display: 'inline-flex', alignItems: 'center', justifyContent: 'center',
            border: 0, borderRadius: 'var(--radius-sm-h)', cursor: sending ? 'progress' : 'pointer', outline: 'none',
            background: send.hover && !sending ? 'color-mix(in srgb, var(--hover-mix-filled), var(--buttons-primary))' : 'var(--buttons-primary)',
            color: 'var(--buttons-label)',
            boxShadow: send.focusVisible ? ASSISTANT_RING : 'none',
            transform: send.down && !reduced ? 'scale(var(--scale-press-button))' : 'scale(1)',
            transition: 'background var(--dur-default) var(--ease-default), transform var(--dur-default) var(--ease-default), box-shadow var(--dur-default) var(--ease-default)' }}>
          <Icon name={sending ? 'loader-circle' : 'arrow-right'} size={17} stroke={1.75} spin={sending} />
        </button>
      </form>

      <div style={{ flex: 'none', padding: '0 18px 12px', ...textStyle('caption-1', { tone: 'quaternary' }) }}>{footer}</div>
    </div>
  );
}
