import React from 'react';

const INTER = {
  /* 4th entry = fixed weight: display-1 is regular only (520); display-4 and heading-1 are strong only (600). */
  'display-1': ['var(--font-display-1)', 'var(--display-1-tracking)', true, 520],
  'display-4': ['var(--font-display-4)', 'var(--display-4-tracking)', true, 'var(--weight-strong-heading)'],
  'heading-1': ['var(--font-heading-1)', 'var(--heading-1-tracking)', true, 'var(--weight-strong-heading)'],
  'heading-2': ['var(--font-heading-2)', 'var(--heading-2-tracking)', true],
  'heading-3': ['var(--font-heading-3)', 'var(--heading-3-tracking)', true],
  'heading-4': ['var(--font-heading-4)', 'var(--heading-4-tracking)', true],
  'body-1': ['var(--font-body-1)', 'var(--body-1-tracking)'],
  'body-2': ['var(--font-body-2)', 'var(--body-2-tracking)'],
  'body-3': ['var(--font-body-3)', 'var(--body-3-tracking)'],
  'body-4': ['var(--font-body-4)', 'var(--body-4-tracking)'],
  'caption-1': ['var(--font-caption-1)', 'var(--caption-1-tracking)'],
  'caption-2': ['var(--font-caption-2)', 'var(--caption-2-tracking)'],
};
const COND = {
  'display-1-condensed': ['var(--font-display-1-condensed)', '0'],
  'display-2-condensed': ['var(--font-display-2-condensed)', '0'],
  'display-3-condensed': ['var(--font-display-3-condensed)', '0'],
  'display-4-condensed': ['var(--font-display-4-condensed)', '0'],
  'heading-1-condensed': ['var(--font-heading-1-condensed)', '0.3px'],
  'heading-2-condensed': ['var(--font-heading-2-condensed)', '0.1px'],
  'heading-3-condensed': ['var(--font-heading-3-condensed)', '0.2px'],
  'body-2-condensed': ['var(--font-body-2-condensed)', '0.2px'],
  'caption-1-condensed': ['var(--font-caption-1-condensed)', '0.15px'],
  'caption-2-condensed': ['var(--font-caption-2-condensed)', '0.15px'],
};
const TONE = {
  primary: 'var(--content-primary)', secondary: 'var(--content-secondary)', tertiary: 'var(--content-tertiary)',
  quaternary: 'var(--content-quaternary)', disabled: 'var(--content-disabled)', brand: 'var(--content-accent-brand)',
  up: 'var(--content-accent-up)', down: 'var(--content-accent-down)', success: 'var(--success-strong)',
  warning: 'var(--warning-strong)', error: 'var(--error-strong)', info: 'var(--info-strong)', inherit: 'inherit', label: 'var(--buttons-label)',
};

/** Returns a style object for a named text style. Use when you need the style without the element. */
export function textStyle(variant = 'body-3', { strong = false, tone = 'primary', tabular = false, color } = {}) {
  const c = COND[variant];
  if (c) {
    return { font: c[0], letterSpacing: c[1], fontStretch: '75%', textTransform: 'uppercase',
      fontFeatureSettings: /^(display|heading)/.test(variant) ? 'var(--features-condensed-display)' : 'var(--features-condensed)',
      fontVariantNumeric: 'tabular-nums', color: color || TONE[tone], margin: 0 };
  }
  const v = INTER[variant] || INTER['body-3'];
  const isHeading = !!v[2];
  const weight = v[3] != null ? v[3] : strong ? (isHeading ? 'var(--weight-strong-heading)' : 'var(--weight-strong)') : (isHeading ? 'var(--weight-heading)' : 'var(--weight-regular)');
  return { font: v[0], fontWeight: weight, letterSpacing: v[1],
    fontFeatureSettings: isHeading ? 'var(--features-heading)' : 'var(--features-text)',
    fontVariationSettings: isHeading ? 'var(--variation-heading)' : undefined,
    fontVariantNumeric: tabular ? 'tabular-nums' : undefined, color: color || TONE[tone], margin: 0 };
}

/** Typed text. variant = any Inter or condensed style; tone = semantic content colour. Figures: tabular. */
export function Text({ as = 'span', variant = 'body-3', strong = false, tone = 'primary', tabular = false, color, style, children, ...rest }) {
  const Tag = as;
  return <Tag style={{ ...textStyle(variant, { strong, tone, tabular, color }), ...style }} {...rest}>{children}</Tag>;
}
