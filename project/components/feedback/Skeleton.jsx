import React from 'react';

/** Grouped fill in the exact footprint of the real element. Text lines use radius 4. */
export function Skeleton({ width = '100%', height = 16, radius = 'var(--radius-4xs)', style }) {
  return <span aria-hidden style={{ display: 'block', width, height, borderRadius: radius, background: 'var(--grouped)', animation: 'ol-reveal var(--dur-skeleton) var(--ease-default)', ...style }} />;
}

/** Skeleton of a trade card (radius 20 card footprint). */
export function CardSkeleton({ style }) {
  return (
    <div style={{ background: 'var(--elevated)', borderRadius: 'var(--radius-lg)', boxShadow: 'var(--shadow-minimal-soft)', padding: 16, display: 'flex', flexDirection: 'column', gap: 12, ...style }}>
      <Skeleton width="55%" height={20} />
      <Skeleton width="40%" height={14} />
      {[0, 1, 2].map((i) => (
        <div key={i} style={{ display: 'flex', alignItems: 'center', gap: 12, height: 36 }}>
          <Skeleton width={28} height={28} radius="var(--radius-max)" />
          <Skeleton width="30%" height={14} />
          <Skeleton width={40} height={28} radius="var(--radius-2xs)" style={{ marginLeft: 'auto' }} />
          <Skeleton width={60} height={40} radius="var(--radius-sm)" />
        </div>
      ))}
    </div>
  );
}
