import React from 'react';
import { textStyle } from '../core/Text.jsx';
import { Logo } from '../core/Logo.jsx';
import { useMinWidth } from '../core/Interaction.jsx';

/**
 * The signed-out frame: one column, centred as a group, and nothing else on the screen.
 *
 * The lockup, the heading and one sentence, the form, a row of ways back, at most 400px wide, with
 * `align-items: safe center` so a tall column (set your password, under an error banner, on a short
 * laptop) still starts at the top rather than pushing its heading off screen.
 *
 * No decoration of any kind. A screen whose only job is to let somebody in is the whole screen, and
 * the system's "no decorative imagery" rule holds here as it does everywhere else.
 *
 *   <AuthShell heading="Sign in" sentence="Use the email and password for your account."
 *     links={<><a href="/forgot-password">Forgot password</a><a href="/">Back to home</a></>}>
 *     …the form…
 *   </AuthShell>
 */
export function AuthShell({
  heading, sentence, children, links, product = 'One Link', showBeta = true, style,
}) {
  const wide = useMinWidth(1024);
  return (
    <div style={{ display: 'grid', gridTemplateColumns: 'minmax(0,1fr)', minHeight: '100dvh', background: 'var(--surface)', color: 'var(--content-primary)', ...style }}>
      <main style={{ display: 'flex', justifyContent: 'center', alignItems: 'safe center', boxSizing: 'border-box', width: '100%', minHeight: '100dvh', padding: wide ? '56px 24px 40px' : '40px 16px 32px' }}>
        <div style={{ display: 'flex', flexDirection: 'column', gap: 32, width: '100%', maxWidth: 400, minWidth: 0 }}>
          <a href="#" aria-label={product} onClick={(e) => e.preventDefault()} style={{ display: 'inline-flex', alignSelf: 'flex-start', textDecoration: 'none', color: 'inherit', borderRadius: 'var(--radius-2xs)' }}>
            <Logo product={product} showBeta={showBeta} />
          </a>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 6, minWidth: 0 }}>
            <h1 style={textStyle('heading-1-condensed')}>{heading}</h1>
            {sentence ? <p style={{ maxWidth: '36ch', textWrap: 'pretty', ...textStyle('body-3', { tone: 'secondary' }) }}>{sentence}</p> : null}
          </div>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 20, minWidth: 0 }}>{children}</div>
          {links ? <nav aria-label="Other ways" style={{ display: 'flex', flexWrap: 'wrap', justifyContent: 'space-between', gap: 8 }}>{links}</nav> : null}
        </div>
      </main>
    </div>
  );
}
