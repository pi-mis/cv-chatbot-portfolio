(function () {
  const TEXT = window.SITE_TEXT;
  const $ = (id) => document.getElementById(id);
  const get = (obj, path) => path.split('.').reduce((o, k) => (o ? o[k] : undefined), obj);

  // ---------- Lingua ----------
  const LANG_KEY = 'site-lang';
  function initialLang() {
    const saved = localStorage.getItem(LANG_KEY);
    if (saved && TEXT[saved]) return saved;
    const nav = (navigator.language || 'en').slice(0, 2).toLowerCase();
    return TEXT[nav] ? nav : 'en';
  }
  window.currentLang = initialLang();
  const T = () => TEXT[window.currentLang];

  function applyLanguage() {
    const t = T();
    document.documentElement.lang = window.currentLang;
    document.querySelectorAll('[data-i18n]').forEach((el) => {
      const v = get(t, el.dataset.i18n);
      if (typeof v === 'string') el.textContent = v;
    });
    document.querySelectorAll('[data-lang]').forEach((b) =>
      b.setAttribute('aria-pressed', String(b.dataset.lang === window.currentLang))
    );
    // chat (stessi campi della versione originale)
    inputEl.placeholder = t.chat.placeholder;
    sendBtn.textContent = t.chat.send;
    hintLabel.textContent = t.chat.hint;
    disclaimerEl.textContent = t.chat.disclaimer;
    renderChat();
    renderTimeline();
    renderProjects();
    renderLife();
    window.dispatchEvent(new Event('langchange'));
  }

  document.querySelectorAll('[data-lang]').forEach((b) =>
    b.addEventListener('click', () => {
      window.currentLang = b.dataset.lang;
      localStorage.setItem(LANG_KEY, window.currentLang);
      applyLanguage();
    })
  );

  // ---------- Chat ----------
  // Il contratto con il backend è invariato: POST /api/chat { messages, language } -> { answer }.
  const chatEl = $('chat');
  const inputEl = $('input');
  const sendBtn = $('send-btn');
  const resetBtn = $('reset-btn');
  const hintLabel = $('hint-label');
  const suggestionsEl = $('suggestions');
  const disclaimerEl = $('disclaimer');
  const STORAGE_KEY = 'cv-chat-messages';

  let messages = [];
  try { messages = JSON.parse(localStorage.getItem(STORAGE_KEY) || '[]'); } catch { messages = []; }
  let pending = false;

  function renderChat() {
    const t = T().chat;
    chatEl.innerHTML = '';
    if (!messages.length) {
      const meta = document.createElement('div');
      meta.className = 'msg meta';
      meta.textContent = t.metaTips;
      chatEl.appendChild(meta);
    } else {
      for (const m of messages) {
        const div = document.createElement('div');
        div.className = 'msg ' + (m.role === 'user' ? 'user' : 'bot');
        div.textContent = m.content;
        chatEl.appendChild(div);
      }
    }
    if (pending) {
      const typing = document.createElement('div');
      typing.className = 'msg bot typing';
      typing.innerHTML = `${t.thinking} <span>.</span><span>.</span><span>.</span>`;
      chatEl.appendChild(typing);
    }

    suggestionsEl.innerHTML = '';
    t.suggestions.forEach((q) => {
      const btn = document.createElement('button');
      btn.type = 'button';
      btn.className = 'suggestion-btn';
      btn.textContent = q;
      btn.onclick = () => { inputEl.value = q; send(); };
      suggestionsEl.appendChild(btn);
    });

    chatEl.scrollTop = chatEl.scrollHeight;
    localStorage.setItem(STORAGE_KEY, JSON.stringify(messages.slice(-30)));
    sendBtn.disabled = pending;
  }

  async function send() {
    const text = inputEl.value.trim();
    if (!text || pending) return;
    inputEl.value = '';
    messages.push({ role: 'user', content: text });
    pending = true;
    renderChat();

    try {
      const res = await fetch('/api/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ messages, language: window.currentLang })
      });
      const data = await res.json().catch(() => ({}));
      if (!res.ok || !data.answer) {
        console.error('Chat API error', res.status, data);
        const detail = data?.details?.body || data?.error || `HTTP ${res.status}`;
        messages.push({ role: 'assistant', content: `Error: ${detail}` });
      } else {
        messages.push({ role: 'assistant', content: data.answer });
      }
    } catch (err) {
      console.error('Chat fetch failed', err);
      messages.push({ role: 'assistant', content: 'Error: connection failed.' });
    }
    pending = false;
    renderChat();
  }

  sendBtn.onclick = send;
  inputEl.addEventListener('keydown', (e) => {
    if (e.key === 'Enter' && !e.shiftKey) { e.preventDefault(); send(); }
  });
  resetBtn.onclick = () => {
    if (!confirm(T().chat.resetConfirm)) return;
    messages = [];
    localStorage.removeItem(STORAGE_KEY);
    renderChat();
  };

  // Qualsiasi pulsante "chiedi al gemello" nel sito passa di qui.
  window.askTwin = function (question) {
    document.getElementById('chat').closest('section').scrollIntoView({ behavior: NS.reducedMotion ? 'auto' : 'smooth', block: 'start' });
    inputEl.value = question;
    setTimeout(send, NS.reducedMotion ? 0 : 350);
  };
  document.addEventListener('click', (e) => {
    const b = e.target.closest('[data-ask-key]');
    if (b) window.askTwin(get(T(), b.dataset.askKey));
  });

  // "/" porta il focus sulla chat
  document.addEventListener('keydown', (e) => {
    if (e.key === '/' && !/INPUT|TEXTAREA/.test(document.activeElement.tagName)) {
      e.preventDefault(); inputEl.focus();
    }
  });

  // ---------- Percorso ----------
  let tlIndex = 4; // parte dal 2026
  function renderTimeline() {
    const items = T().journey.items;
    const tl = $('timeline');
    tl.innerHTML = '';
    items.forEach((it, i) => {
      const b = document.createElement('button');
      b.type = 'button'; b.className = 'tl-btn'; b.setAttribute('role', 'tab');
      b.textContent = it.year;
      b.setAttribute('aria-selected', String(i === tlIndex));
      b.onclick = () => { tlIndex = i; renderTimeline(); };
      tl.appendChild(b);
    });
    const it = items[tlIndex];
    $('tlTitle').textContent = it.title;
    $('tlBody').textContent = it.body;
    $('tlAsk').textContent = T().journey.ask;
    $('tlAsk').onclick = () => window.askTwin(it.q);
    $('tlPrev').disabled = tlIndex === 0;
    $('tlNext').disabled = tlIndex === items.length - 1;
  }
  $('tlPrev').onclick = () => { tlIndex = Math.max(0, tlIndex - 1); renderTimeline(); };
  $('tlNext').onclick = () => { tlIndex = Math.min(T().journey.items.length - 1, tlIndex + 1); renderTimeline(); };
  $('timeline').addEventListener('keydown', (e) => {
    if (e.key === 'ArrowRight') $('tlNext').click();
    if (e.key === 'ArrowLeft') $('tlPrev').click();
    if (e.key.startsWith('Arrow')) $('timeline').children[tlIndex].focus();
  });

  // ---------- Progetti ----------
  let filter = 'all';
  const open = new Set(['ns']);
  function renderProjects() {
    const t = T().projects;
    const fEl = $('filters');
    fEl.innerHTML = '';
    Object.entries(t.filters).forEach(([k, label]) => {
      const b = document.createElement('button');
      b.type = 'button'; b.textContent = label;
      b.setAttribute('aria-pressed', String(k === filter));
      b.onclick = () => { filter = k; renderProjects(); };
      fEl.appendChild(b);
    });

    const list = $('projList');
    list.innerHTML = '';
    window.PROJECTS.forEach((p) => {
      const c = t.items[p.id];
      const li = document.createElement('li');
      li.className = 'proj';
      li.hidden = filter !== 'all' && !p.tags.includes(filter);
      const isOpen = open.has(p.id);
      li.innerHTML = `
        <button type="button" class="proj-head" aria-expanded="${isOpen}" aria-controls="pb-${p.id}">
          <span><span class="proj-name"></span><span class="proj-line"></span></span>
          <span class="proj-toggle" aria-hidden="true">+</span>
        </button>
        <div class="proj-body" id="pb-${p.id}" ${isOpen ? '' : 'hidden'}>
          <div><p></p><button type="button" class="link-btn ask"></button></div>
          <div><p class="stack-label"></p><div class="chips"></div></div>
        </div>`;
      li.querySelector('.proj-name').textContent = c.name;
      li.querySelector('.proj-line').textContent = c.line;
      li.querySelector('.proj-body p').textContent = c.body;
      li.querySelector('.stack-label').textContent = t.stack;
      li.querySelector('.ask').textContent = t.ask;
      li.querySelector('.ask').onclick = () => window.askTwin(c.q);
      const chips = li.querySelector('.chips');
      p.stack.forEach((s) => {
        const sp = document.createElement('span'); sp.className = 'chip'; sp.textContent = s; chips.appendChild(sp);
      });
      li.querySelector('.proj-head').onclick = () => {
        open.has(p.id) ? open.delete(p.id) : open.add(p.id);
        renderProjects();
      };
      list.appendChild(li);
    });
  }

  // ---------- Fuori ufficio ----------
  function renderLife() {
    const t = T().life;
    const g = $('lifeGrid');
    g.innerHTML = '';
    t.items.forEach((it) => {
      const d = document.createElement('div');
      d.className = 'life-item';
      d.innerHTML = '<h3></h3><p></p><button type="button" class="link-btn"></button>';
      d.querySelector('h3').textContent = it.title;
      d.querySelector('p').textContent = it.body;
      const b = d.querySelector('button');
      b.textContent = t.ask;
      b.onclick = () => window.askTwin(it.q);
      g.appendChild(d);
    });
  }

  // ---------- Contatti ----------
  $('copyEmail').onclick = async () => {
    try {
      await navigator.clipboard.writeText('pietro.mischi@yahoo.it');
      const c = $('copied');
      c.classList.add('show');
      setTimeout(() => c.classList.remove('show'), 1800);
    } catch { location.href = 'mailto:pietro.mischi@yahoo.it'; }
  };

  // ---------- Navigazione: evidenzia la sezione visibile ----------
  const links = [...document.querySelectorAll('.nav a')];
  const obs = new IntersectionObserver((entries) => {
    entries.forEach((en) => {
      if (en.isIntersecting) links.forEach((a) => a.classList.toggle('active', a.getAttribute('href') === '#' + en.target.id));
    });
  }, { rootMargin: '-45% 0px -50% 0px' });
  links.forEach((a) => { const s = document.querySelector(a.getAttribute('href')); if (s) obs.observe(s); });

  applyLanguage();
})();
