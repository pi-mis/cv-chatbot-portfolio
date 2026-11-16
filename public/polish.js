// Rifinitura: altezza esatta della prima schermata, nastro usabile da tastiera, menu che segue la sezione.
(function () {
  const root = document.documentElement;
  const bar = document.querySelector('.topbar');
  const ticker = document.getElementById('ticker');
  const setChrome = () => root.style.setProperty('--chrome-h', ((bar ? bar.offsetHeight : 60) + (ticker ? ticker.offsetHeight : 40)) + 'px');
  setChrome();
  addEventListener('resize', setChrome, { passive: true });

  // il nastro scorre da solo: col tasto Tab si ferma e diventa una riga che si sposta col focus
  if (ticker) {
    let kbd = false;
    addEventListener('keydown', (e) => { if (e.key === 'Tab') kbd = true; });
    addEventListener('pointerdown', () => { kbd = false; });
    ticker.addEventListener('focusin', () => { if (kbd) ticker.classList.add('kbd'); });
    ticker.addEventListener('focusout', (e) => { if (!ticker.contains(e.relatedTarget)) ticker.classList.remove('kbd'); });
  }

  // sul telefono il menu scorre di lato: porta in vista la voce della sezione attuale
  const nav = document.querySelector('.nav');
  if (nav && 'MutationObserver' in window) {
    new MutationObserver(() => {
      const a = nav.querySelector('a.active');
      if (a && nav.scrollWidth > nav.clientWidth) nav.scrollTo({ left: a.offsetLeft - 12, behavior: 'smooth' });
    }).observe(nav, { subtree: true, attributes: true, attributeFilter: ['class'] });
  }
})();
