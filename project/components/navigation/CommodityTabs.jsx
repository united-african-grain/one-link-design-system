import React from 'react';
import { Tabs } from './Tabs.jsx';

export const COMMODITY_COLORS = {
  'white-maize': 'var(--commodity-maize)', maize: 'var(--commodity-maize)', wheat: 'var(--commodity-wheat)', 'wheat-local': 'var(--commodity-wheat)', 'wheat-import': 'var(--commodity-wheat)',
  soya: 'var(--commodity-soya)', 'soya-meal': 'var(--commodity-soya-meal)', 'se-meal': 'var(--commodity-soya-meal)', fertilizer: 'var(--commodity-fertilizer)',
};

/** Condensed commodity section tabs; the active underline takes the commodity colour. */
export function CommodityTabs({ tabs, value, onChange, style }) {
  const active = tabs.find((t) => t.value === value) || tabs[0];
  return <Tabs variant="commodity" tabs={tabs} value={value} onChange={onChange} height={40} underlineColor={active && active.color ? active.color : COMMODITY_COLORS[value] || 'var(--content-primary)'} style={style} />;
}
