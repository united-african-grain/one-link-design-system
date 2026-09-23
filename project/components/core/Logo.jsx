import React from 'react';
import { textStyle } from './Text.jsx';

/** The One Link mark, a single link with two loops (assets/one-link-mark.svg), set white on a brand-blue tile:
    the same tile as the app icon, so the sidebar, the browser tab and the phone all show one unit. Wordmark and BETA badge follow.
    Set showBeta={false} to drop the badge. markOnly keeps the mark alone, for the collapsed sidebar's brand row:
    the mark then carries the product name itself, so the row is still named for a screen reader. */
/** Path of the One Link mark, from assets/one-link-mark.svg (viewBox 268 362 488 300). */
const MARK_D = 'M449.424 367.733C488.216 368.424 513.821 387.283 538.052 415.931C533.432 421.265 525.379 428.902 520.264 434.037C508.762 445.701 497.097 457.202 485.272 468.538C477.851 454.166 466.146 442.897 448.918 443.457C442.041 443.692 435.372 445.87 429.681 449.738C422.813 454.324 416.562 461.91 410.717 467.922L388.881 490.133C386.09 493.004 383.225 495.987 380.435 498.778C365.308 513.908 348.764 525.959 349.821 549.572C350.615 567.317 364.882 579.451 382.343 578.842C390.84 578.546 400.921 574.558 407.787 569.594C415.345 563.685 421.07 554.337 427.391 547.141C461.898 510.937 499.11 477.396 533.646 441.214C536.526 438.455 539.349 435.354 542.33 432.718C552.503 423.722 559.761 412.477 568.816 402.444C587.24 381.79 613.269 369.512 640.925 368.429C667.754 367.276 693.906 377.041 713.413 395.495C736.101 416.321 749.424 445.422 750.361 476.205C751.222 504.733 740.579 531.088 720.779 551.402C706.785 565.76 692.109 580.409 678.201 594.765C646.141 627.856 627.038 654.685 576.503 656.158C572.098 656.15 567.696 655.897 563.318 655.4C532.42 651.743 506.036 632.163 487.113 608.243C498.458 597.073 509.705 585.804 520.852 574.438C526.167 569.038 532.913 561.583 538.426 556.788C540.629 561.403 543.139 565.383 546.666 568.984C561.097 583.721 581.075 585.75 597.766 573.481C607.285 566.484 611.967 559.112 619.846 550.945C631.923 538.425 644.53 526.51 656.674 514.066C666.967 503.594 674.575 493.124 674.045 477.849C673.382 458.735 660.278 444.963 640.796 445.936C621.785 446.885 610.298 463.512 598.207 475.981C593.362 480.977 588.391 485.827 583.425 490.687C562.11 511.764 540.946 532.994 519.935 554.375C504.574 569.751 488.87 584.929 473.869 600.638C467.593 607.211 462.132 614.872 456.074 621.568C437.973 641.906 412.545 654.236 385.366 655.853C374.071 656.417 357.218 654.854 346.68 650.729C306.059 634.829 275.926 596.182 273.955 552.153C272.508 519.845 284.61 492.449 306.445 469.372C311.648 463.874 316.92 458.932 322.111 453.648L348.493 426.641C381.259 393.531 397.847 369.442 449.424 367.733Z';

export function Logo({ product = 'One Link', showBeta = true, size = 'md', markOnly = false, style }) {
  const h = size === 'sm' ? 24 : 28;
  return (
    <span style={{ display: 'inline-flex', alignItems: 'center', gap: 8, ...style }}>
      <span aria-hidden={markOnly ? undefined : true} role={markOnly ? 'img' : undefined} aria-label={markOnly ? product : undefined}
        style={{ width: h, height: h, flex: 'none', borderRadius: 'var(--radius-2xs)', background: 'var(--buttons-brand)', display: 'inline-flex', alignItems: 'center', justifyContent: 'center' }}>
        <svg viewBox="268 362 488 300" width={Math.round(h * 0.74)} height={Math.round(h * 0.74 * 300 / 488)} aria-hidden="true" focusable="false"><path fill="#fff" d={MARK_D} /></svg>
      </span>
      {markOnly ? null : <span style={{ ...textStyle('heading-4', { strong: true }) }}>{product}</span>}
      {showBeta && !markOnly ? (
        <span style={{ ...textStyle('caption-2-condensed', { color: 'var(--beta-label)' }), background: 'var(--beta-fill)', borderRadius: 'var(--radius-4xs)', padding: '3px 5px 2px', lineHeight: '11px' }}>Beta</span>
      ) : null}
    </span>
  );
}
