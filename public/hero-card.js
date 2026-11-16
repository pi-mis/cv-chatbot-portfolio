// Scheda "Live" sopra BTC Frontline nell'apertura: copia prezzo, muri del book e pressione
// dall'HUD della scena (frontline-embed.js), così la scheda segue il mercato in tempo reale.
(function () {
  const $ = (id) => document.getElementById(id);
  const card = $('liveCard');
  if (!card) return;
  const pairs = [['flPrice', 'ncPrice'], ['flChg', 'ncChg'], ['flSup', 'ncSup'], ['flRes', 'ncRes']];
  function sync() {
    pairs.forEach(([from, to]) => {
      const a = $(from), b = $(to);
      if (a && b && b.textContent !== a.textContent) { b.textContent = a.textContent; b.className = a.className; }
    });
    const bu = $('flBulls'), be = $('flBears'), f = $('ncFlow');
    if (bu && be && f) {
      const v = /%/.test(bu.textContent) ? `${bu.textContent} / ${be.textContent}` : '–';
      if (f.textContent !== v) f.textContent = v;
    }
    const st = $('flStatus');
    card.classList.toggle('is-live', !!(st && st.classList.contains('live')));
  }
  const hud = $('flStage');
  if (hud && 'MutationObserver' in window) new MutationObserver(sync).observe(hud, { subtree: true, childList: true, characterData: true, attributes: true, attributeFilter: ['class'] });
  const st = $('flStatus');
  if (st && 'MutationObserver' in window) new MutationObserver(sync).observe(st, { attributes: true, attributeFilter: ['class'] });
  sync();
})();
