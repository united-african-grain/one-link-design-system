/** The Trading workspace kit (M6.DS.01, UAG-82): the screens M6's trading, contract, import and grading cards port,
    composed only from published components and the kits' shared parts (Shell.jsx page anatomy, Home.jsx's HmHead,
    HmCard, HmTable, HmFacts and HmLink, TradingStates.jsx's trade record and statuses). This file holds what every
    screen shares: the states each screen draws, the frames (Trading, Finance, the Clerk, stock control, the Managing
    Director and Setup), and the contract rows the lists read. Every screen takes `state`, one of its entries here, for
    ?screen=&state=, which the screenshot review opens at 1440 and 390.

    The canvases (S50 "One Link Jacques", S60 "One Link Sid", S17 "One Link Alka", "One Link Ashraf", S09 "One Link
    Owen 1") give layout, content and flow; UX-01 to UX-34 win where a canvas detail differs (Map D-43). The look is the
    current design system's (Henry, 30 Sep 2026). Fictional sample data on the golden fixture names: Riverbend Milling
    stands for the canvases' mill, and the other mills are invented. */

export const TRADING_WORKSPACE_STATES = {
  TradeWorkingView: ['Working', 'Calculation details', 'Negative margin', 'Rate not set', 'Uncovered tonnage', 'Submitting', 'Without the contract tier', 'Loading'],
  ContractTerms: ['Sale', 'Purchase leg', 'Amendment history', 'Basis missing', 'Without the contract tier'],
  ScheduleGrid: ['Contracts', 'Allocations', 'Not fully scheduled', 'Saving', 'Empty', 'Loading'],
  PriceLadder: ['Ladder', 'Version 2', 'Lot not assigned', 'Without the contract tier', 'Loading'],
  ShipmentAllocations: ['Allocations', 'Allocate', 'Allocating', 'Refused allocation', 'Fully allocated', 'Operations, read only'],
  LongShort: ['By origin', 'By corridor', 'Calculation details', 'Import wheat', 'Loading'],
  TradeRecord: ['Details', 'Related', 'History', 'Pending approval', 'Close suggested', 'Closed with balance', 'Without the contract tier', 'Loading'],
  NewTrade: ['Enquiry', 'Missing fields', 'Saving'],
  CloseTrade: ['Close', 'Reason given', 'Closing', 'Closed'],
  GenerateContracts: ['Approved', 'Generate contracts', 'Generating', 'Drafts', 'Record signature', 'Recording', '3 of 4 signed', 'Signed'],
  AmendmentConfirm: ['Confirm', 'Missing reason', 'Submitting', 'Pending approval'],
  LotDefinition: ['New lot', 'Missing base month', 'Saving', 'Lot picker', 'One open lot'],
  PermitsList: ['All', 'At limit', 'Permit limit exception', 'Operations, read only', 'No match'],
  DiversionTask: ['Task', 'Submitting', 'Pending approval', 'Completed', 'Rejected', 'Clerk view'],
  ContractList: ['All', 'Wheat purchases', 'Warehouse view', 'Exporting', 'No match', 'Loading'],
};

/** How the screen index names each screen, in the card's order (a) to (n), then the contract list and the M6 states of
    the existing kit screens. */
export const TW_LABEL = {
  TradeWorkingView: 'Trade working view', ContractTerms: 'Contract terms', ScheduleGrid: 'Monthly schedule', PriceLadder: 'Price ladder',
  ShipmentAllocations: 'Shipment and allocations', LongShort: 'Long and short', TradeRecord: 'Trade record', NewTrade: 'New trade', CloseTrade: 'Close trade',
  GenerateContracts: 'Generate contracts and signatures', AmendmentConfirm: 'Amendment', QualitySpecifications: 'Quality specifications', LotDefinition: 'Lot and lot picker',
  PermitsList: 'Permits', DiversionTask: 'Diversion', ContractList: 'Contracts',
  TradeBoard: 'Trade board', Approval: 'Approval', GradingDispute: 'Grading dispute', GRNFinalise: 'Goods received note', StockBoard: 'Stock board',
};

/* ------------------------------------------------------------------ Frames */

/** Trading's navigation (canvas S50 menu): Home, Trading with its sections, Logistics, Inventory, Counterparties,
    Reports, Assistant. The frame is the design system's AppShell, unchanged. */
export const TW_NAV = [{ items: [
  { value: 'home', label: 'Home', icon: 'house' },
  { value: 'trade', label: 'Trading', icon: 'arrow-left-right', sections: [
    { value: 'trades', label: 'Trades' }, { value: 'contracts', label: 'Contracts' }, { value: 'schedule', label: 'Delivery schedule' },
    { value: 'longshort', label: 'Long and short' }, { value: 'diversions', label: 'Diversions' }] },
  { value: 'logistics', label: 'Logistics', icon: 'truck' },
  { value: 'inventory', label: 'Inventory', icon: 'warehouse' },
  { value: 'counterparties', label: 'Counterparties', icon: 'building-2' },
  { value: 'reports', label: 'Reports', icon: 'chart-column' },
  { value: 'assistant', label: 'Assistant', icon: 'message-square' },
] }];
/** Finance's navigation (canvas S60 menu): the import allocation, permits and lots sit under Finance. */
export const TW_FIN_NAV = [{ items: [
  { value: 'home', label: 'Home', icon: 'house' },
  { value: 'finance', label: 'Finance', icon: 'hand-coins', sections: [
    { value: 'shipments', label: 'Shipments' }, { value: 'permits', label: 'Permits' }, { value: 'lots', label: 'Lots and ladders' }, { value: 'rates', label: 'Exchange rates' }] },
  { value: 'counterparties', label: 'Counterparties', icon: 'building-2' },
  { value: 'reports', label: 'Reports', icon: 'chart-column' },
] }];
/** The Clerk's and stock control's navigation, as their kits draw them, for the screens they open here. */
export const TW_CLERK_NAV = [{ items: [
  { value: 'home', label: 'Home', icon: 'house' },
  { value: 'logistics', label: 'Logistics', icon: 'truck', sections: [{ value: 'received', label: 'Goods received notes' }] },
  { value: 'inventory', label: 'Inventory', icon: 'warehouse' },
] }];
export const TW_STOCK_NAV = [{ items: [
  { value: 'home', label: 'Home', icon: 'house' },
  { value: 'inventory', label: 'Inventory', icon: 'warehouse', sections: [{ value: 'units', label: 'Stock by storage unit' }] },
  { value: 'logistics', label: 'Logistics', icon: 'truck' },
] }];

export const TW_USERS = {
  trading: { initials: 'JT', name: 'J. Tembo', meta: 'Trading' },
  support: { initials: 'AM', name: 'A. Mwale', meta: 'Trading support' },
  finance: { initials: 'NP', name: 'N. Phiri', meta: 'Finance' },
  ops: { initials: 'MC', name: 'M. Chanda', meta: 'Operations' },
  warehouse: { initials: 'SM', name: 'S. Mumba', meta: 'Warehouse' },
  clerk: { initials: 'SB', name: 'S. Banda', meta: 'Clerk, Chisamba Shed' },
  stock: { initials: 'RD', name: 'R. Daka', meta: 'Stock control' },
};

/** Where each screen and state sits: whose frame, the module and section the navigation highlights, and the
    breadcrumb (UX-04: every trading page has the Trading breadcrumb). */
export function twFrame(screen, state) {
  const trading = (section, crumbs, user = 'trading') => ({ who: 'trading', nav: 'trading', module: 'trade', section, breadcrumb: ['Trading', ...crumbs], user });
  const finance = (section, crumbs, user = 'finance') => ({ who: 'finance', nav: 'finance', module: 'finance', section, breadcrumb: ['Finance', ...crumbs], user });
  const noTier = state === 'Without the contract tier';
  switch (screen) {
    case 'TradeWorkingView': return trading('trades', ['Trades', 'SYN4810'], noTier ? 'warehouse' : 'trading');
    case 'ContractTerms': return trading('contracts', ['Contracts', state === 'Purchase leg' ? 'SYN4702-A' : state === 'Basis missing' ? 'SYN4810-B' : 'SYN4702'], noTier ? 'warehouse' : 'trading');
    case 'ScheduleGrid': return trading('schedule', ['Delivery schedule']);
    case 'PriceLadder': return finance('lots', ['Lots and ladders', 'SYN4666-L2'], noTier ? 'warehouse' : 'finance');
    case 'ShipmentAllocations': return finance('shipments', ['Shipments', 'MV Kalahari'], state === 'Operations, read only' ? 'ops' : 'finance');
    case 'LongShort': return trading('longshort', ['Long and short']);
    case 'TradeRecord':
      if (state === 'Pending approval') return { who: 'md', module: 'trading', breadcrumb: ['Trading', 'Trades', 'SYN4810'] };
      return trading('trades', ['Trades', state === 'Close suggested' ? 'SYN4790' : state === 'Closed with balance' ? 'SYN4798' : 'SYN4702'], noTier ? 'warehouse' : 'trading');
    case 'NewTrade': return trading('trades', ['Trades', 'New']);
    case 'CloseTrade': return trading('trades', ['Trades', 'SYN4790']);
    case 'GenerateContracts': return trading('trades', ['Trades', 'SYN4810'], 'support');
    case 'AmendmentConfirm': return trading('contracts', ['Contracts', 'SYN4702-A']);
    case 'QualitySpecifications': return { who: 'setup', section: 'quality', crumbs: ['Quality specifications', ...(state === 'Specifications' ? [] : ['White maize, ZAMACE grade 1'])] };
    case 'LotDefinition':
      if (state === 'Lot picker' || state === 'One open lot') return { who: 'clerk', nav: 'clerk', module: 'logistics', section: 'received', breadcrumb: ['Logistics', 'Goods received notes', 'New'], user: 'clerk' };
      return finance('lots', ['Lots and ladders', 'New']);
    case 'PermitsList': return finance('permits', ['Permits'], state === 'Operations, read only' ? 'ops' : 'finance');
    case 'DiversionTask':
      if (state === 'Clerk view') return { who: 'clerk', nav: 'clerk', module: 'logistics', section: 'received', breadcrumb: ['Logistics', 'Goods received notes', 'GRN10000402'], user: 'clerk' };
      return trading('diversions', ['Diversions', 'BAD 1187']);
    case 'ContractList': return trading('contracts', ['Contracts'], state === 'Warehouse view' ? 'warehouse' : 'trading');
    case 'TradeBoard': return trading('trades', ['Trades']);
    case 'Approval': return { who: 'md', module: 'trading', breadcrumb: ['Trading', 'Trades', 'SYN4810'] };
    case 'GradingDispute': return trading('trades', ['Grading disputes', 'DSP-0231']);
    case 'GRNFinalise': return { who: 'clerk', nav: 'clerk', module: 'logistics', section: 'received', breadcrumb: ['Logistics', 'Goods received notes', 'GRN10000402'], user: 'clerk' };
    case 'StockBoard': return { who: 'stock', nav: 'stock', module: 'inventory', section: 'units', breadcrumb: ['Inventory', 'Stock by storage unit'], user: 'stock' };
    default: return trading('trades', ['Trades']);
  }
}

/* ------------------------------------------------------------------ Shared parts */

/** A form grid: labels above inputs (UX-21), as many columns as fit, one on a phone. */
export function TwFields({ children, min = 220 }) {
  return <div style={{ display: 'grid', gridTemplateColumns: `repeat(auto-fit, minmax(min(100%, ${min}px), 1fr))`, gap: 16 }}>{children}</div>;
}

/** The view selector, filters and search of a list view (UX-07). */
export function TwFilters({ view, children }) {
  return (
    <div style={{ display: 'flex', alignItems: 'center', gap: 8, flexWrap: 'wrap', justifyContent: 'space-between' }}>
      <ScrollRow><Capsule chevron selected>{view}</Capsule>{children}</ScrollRow>
      <SearchField placeholder="Search this list" hint={null} maxWidth={320} />
    </div>
  );
}

/** A record page while it loads: the highlights and two cards in their own footprint. */
export function TwLoading({ title }) {
  return (
    <Sections>
      <HmHead title={title} />
      <div aria-busy="true" style={{ display: 'contents' }}><CardSkeleton /><CardSkeleton /><CardSkeleton /></div>
    </Sections>
  );
}

/** A record reference: the blue link where the viewer can open the record, plain text where they cannot (UX-01). */
export function TwRef({ children, open = true, onOpen }) {
  return open ? <HmLink onOpen={onOpen}>{children}</HmLink> : children;
}

/** Sales and purchase contracts in their statuses, the commodity on every row (M6.TRD.13). Summary tonnes carry no
    decimals; a sale's cover reads from coverage, Short, Long or Covered with its tonnage. */
export const TW_CONTRACTS = [
  { id: 'SYN4810', kind: 'Sale', cp: 'Riverbend Milling', commodity: 'Maize', marker: 'maize', quantity: '1,500', delivered: '0', left: '1,500', cover: 'Covered 1,500', status: 'pending' },
  { id: 'SYN4702', kind: 'Sale', cp: 'Riverbend Milling', commodity: 'Wheat', marker: 'wheat', quantity: '5,000', delivered: '4,200', left: '800', cover: 'Short 800', status: 'active' },
  { id: 'SYN4702-A', kind: 'Purchase', cp: 'Cameron Estates', commodity: 'Wheat', marker: 'wheat', quantity: '1,700', delivered: '1,700', left: '0', cover: '', status: 'active' },
  { id: 'SYN4702-B', kind: 'Purchase', cp: 'Kapiri Farms', commodity: 'Wheat', marker: 'wheat', quantity: '1,800', delivered: '1,800', left: '0', cover: '', status: 'active' },
  { id: 'SYN4702-C', kind: 'Purchase', cp: 'Lakeview Farms Ltd', commodity: 'Wheat', marker: 'wheat', quantity: '700', delivered: '400', left: '300', cover: '', status: 'active' },
  { id: 'SYN4845', kind: 'Sale', cp: 'Riverbend Milling', commodity: 'Wheat', marker: 'wheat', quantity: '4,000', delivered: '0', left: '4,000', cover: 'Short 400', status: 'active' },
  { id: 'SYN4790', kind: 'Sale', cp: 'Riverbend Milling', commodity: 'Wheat', marker: 'wheat', quantity: '1,200', delivered: '1,196', left: '4', cover: 'Covered 1,200', status: 'active' },
  { id: 'SYN4815', kind: 'Sale', cp: 'Kafue Valley Milling', commodity: 'Soya', marker: 'soya', quantity: '600', delivered: '0', left: '600', cover: 'Short 600', status: 'approved' },
  { id: 'SYN4813', kind: 'Sale', cp: 'Riverbend Milling', commodity: 'Wheat', marker: 'wheat', quantity: '900', delivered: '0', left: '900', cover: 'Short 900', status: 'draft' },
  { id: 'SYN4798', kind: 'Sale', cp: 'Kafue Valley Milling', commodity: 'Maize', marker: 'maize', quantity: '1,000', delivered: '962', left: '38', cover: '', status: 'closed' },
];
