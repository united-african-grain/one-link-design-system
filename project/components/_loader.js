/* Card-only helper: loads the component sources directly when the compiled bundle isn't present yet.
   Prefers window.<Namespace> from _ds_bundle.js when available. */
(function () {
  var FILES = [
    'core/Icon.jsx', 'core/Interaction.jsx', 'core/Text.jsx', 'core/Avatar.jsx', 'core/Logo.jsx',
    'actions/Button.jsx', 'actions/PressButton.jsx', 'actions/Capsule.jsx', 'actions/Segmented.jsx', 'actions/LineStepper.jsx',
    'feedback/StatusMark.jsx', 'feedback/TrustChip.jsx', 'feedback/Banner.jsx', 'feedback/SeverityTag.jsx', 'feedback/EmptyState.jsx', 'feedback/Skeleton.jsx', 'feedback/Dialog.jsx',
    'inputs/SearchField.jsx',
    'navigation/Tabs.jsx', 'navigation/SyncStatus.jsx', 'navigation/Header.jsx', 'navigation/AppShell.jsx', 'navigation/AuthShell.jsx', 'navigation/MobileShell.jsx', 'navigation/CommodityTabs.jsx',
    'data/QuantityChip.jsx', 'data/ShareBar.jsx', 'data/Figure.jsx', 'data/Card.jsx', 'data/RailRow.jsx', 'data/DataTable.jsx', 'data/ChartCard.jsx',
    'records/EvidenceTile.jsx', 'records/Timeline.jsx', 'records/ActionPanel.jsx', 'records/ReconcilePanel.jsx'
  ];
  function findBundle() {
    try { for (var k in window) { try { var v = window[k]; if (v && typeof v === 'object' && v.Button && v.Icon && v.Text) return v; } catch (e) {} } } catch (e) {}
    return null;
  }
  window.loadDS = async function (base) {
    var b = findBundle(); if (b) { window.DS = b; return b; }
    var src = 'const {useState,useRef,useEffect,useLayoutEffect,useMemo,useCallback}=React;\n';
    var texts = await Promise.all(FILES.map(function (f) { return fetch(base + f).then(function (r) { return r.ok ? r.text() : ''; }).catch(function () { return ''; }); }));
    texts.forEach(function (t) { src += t.replace(/^import[^\n]*$/mg, '').replace(/^export\s+(function|const|let)/mg, '$1') + '\n'; });
    var names = []; src.replace(/^(?:function|const)\s+([A-Za-z_]\w*)/mg, function (m, n) { if (names.indexOf(n) < 0) names.push(n); return m; });
    var code = Babel.transform(src + '\nwindow.DS={' + names.join(',') + '};', { presets: [['react', { runtime: 'classic' }]] }).code;
    (0, eval)(code);
    return window.DS;
  };
  /** Load DS from dsBase, then the kit's own screen files (relative to kitBase). Returns {...DS, ...screens}. */
  window.loadKit = async function (dsBase, kitBase, kitFiles) {
    var DS = await window.loadDS(dsBase);
    var texts = await Promise.all(kitFiles.map(function (f) { return fetch(kitBase + f).then(function (r) { return r.ok ? r.text() : ''; }).catch(function () { return ''; }); }));
    var src = '';
    texts.forEach(function (t) { src += t.replace(/^import[^\n]*$/mg, '').replace(/^export\s+(function|const|let)/mg, '$1') + '\n'; });
    var names = []; src.replace(/^(?:function|const)\s+([A-Za-z_]\w*)/mg, function (m, n) { if (names.indexOf(n) < 0) names.push(n); return m; });
    var pre = 'const {' + Object.keys(DS).join(',') + '}=window.DS;const {useState,useRef,useEffect,useMemo}=React;\n';
    var code = Babel.transform(pre + src + '\nwindow.KIT={' + names.join(',') + '};', { presets: [['react', { runtime: 'classic' }]] }).code;
    (0, eval)(code);
    return Object.assign({}, DS, window.KIT);
  };
})();
