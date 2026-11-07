/* =========================================================
   Boda Boda Sacco — front-end app
   A working prototype: joining, saving, borrowing and repaying
   all run in the browser using Store (localStorage).
   ========================================================= */
(function () {
  'use strict';

  const $ = function (sel, root) { return (root || document).querySelector(sel); };
  const $$ = function (sel, root) { return Array.prototype.slice.call((root || document).querySelectorAll(sel)); };
  const T = function (s) { return window.I18N.t(s); };
  const TF = function (s, vars) { return window.I18N.tf(s, vars); };

  const view = $('#view');
  const modalRoot = $('#modal-root');
  const toastHost = $('#toasts');

  const LOAN_TYPES = [
    { id: 'repairs', name: 'Spare parts and repairs', rate: 1.2, icon: 'wrench', text: 'Fix it and get back on the road.', tag: 'Most requested' },
    { id: 'bike', name: 'Motorbike asset loan', rate: 1.0, icon: 'bike', text: 'Finance a bike of your own.', tag: 'Asset finance' },
    { id: 'emergency', name: 'Emergency loan', rate: 1.5, icon: 'alert', text: 'Fast help for urgent needs.', tag: 'Same day' },
    { id: 'gear', name: 'Gear and license', rate: 1.2, icon: 'helmet', text: 'Helmets, reflectors and your licence.', tag: 'Safety first' },
    { id: 'school', name: 'School fees loan', rate: 1.2, icon: 'book', text: 'Keep your children in school.', tag: 'Term one to three' },
    { id: 'business', name: 'Business booster', rate: 1.5, icon: 'briefcase', text: 'Grow a side business beyond the bike.', tag: 'Grow income' }
  ];

  const BUCKETS = {
    daily: { label: 'Daily savings', icon: 'money', hint: 'Withdraw any time' },
    locked: { label: 'Locked savings', icon: 'lock', hint: 'Earns yearly dividends' },
    bike: { label: 'Bike replacement fund', icon: 'bike', hint: 'For your next bike' }
  };

  const SITE = 'Boda Boda Sacco';
  let calcState = { amount: 20000, months: 6, typeId: 'repairs', rate: 1.2 };

  /* ---------------------------------------------------------
     Small helpers
     --------------------------------------------------------- */
  function esc(value) {
    return String(value == null ? '' : value).replace(/[&<>"']/g, function (c) {
      return { '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c];
    });
  }
  function money(n) {
    return 'KSh ' + Math.round(Number(n) || 0).toLocaleString('en-KE');
  }
  function lang() { return window.I18N.lang(); }
  function fmtDate(iso, short) {
    if (!iso) return '—';
    const d = new Date(iso);
    if (isNaN(d.getTime())) return '—';
    try {
      return d.toLocaleDateString(lang() === 'sw' ? 'sw-KE' : 'en-KE',
        short ? { day: 'numeric', month: 'short' } : { day: 'numeric', month: 'short', year: 'numeric' });
    } catch (e) {
      return d.toDateString();
    }
  }
  function icon(name, cls) {
    return '<svg class="icon ' + (cls || '') + '" aria-hidden="true"><use href="#i-' + name + '"/></svg>';
  }
  function firstName(member) {
    return String(member.name || '').trim().split(/\s+/)[0] || 'rider';
  }
  function loanType(id) {
    return LOAN_TYPES.filter(function (t) { return t.id === id; })[0] || LOAN_TYPES[0];
  }
  function monthName(d) {
    try {
      return new Date(d).toLocaleDateString(lang() === 'sw' ? 'sw-KE' : 'en-KE', { month: 'long' });
    } catch (e) { return ''; }
  }

  /* ---------------------------------------------------------
     Toasts
     --------------------------------------------------------- */
  function toast(message, kind) {
    if (!toastHost) return;
    const el = document.createElement('div');
    el.className = 'toast' + (kind === 'error' ? ' error' : '');
    el.innerHTML = icon(kind === 'error' ? 'alert' : 'check') + '<span>' + esc(message) + '</span>';
    toastHost.appendChild(el);
    window.setTimeout(function () {
      el.style.transition = 'opacity .3s';
      el.style.opacity = '0';
      window.setTimeout(function () { if (el.parentNode) el.parentNode.removeChild(el); }, 320);
    }, 4200);
  }

  /* ---------------------------------------------------------
     Modal
     --------------------------------------------------------- */
  let activeModal = null;

  function openModal(cfg) {
    closeModal();
    const overlay = document.createElement('div');
    overlay.className = 'overlay';
    overlay.innerHTML =
      '<div class="sheet' + (cfg.wide ? ' wide' : '') + '" role="dialog" aria-modal="true" aria-labelledby="sheet-title">' +
        '<div class="sheet-head">' +
          '<div><h2 id="sheet-title">' + esc(cfg.title || '') + '</h2>' +
          (cfg.subtitle ? '<p>' + esc(cfg.subtitle) + '</p>' : '') + '</div>' +
          '<button type="button" class="icon-btn" data-action="modal-cancel" aria-label="' + esc(T('Close')) + '">' +
            icon('x') + '</button>' +
        '</div>' +
        '<div class="sheet-body">' + (cfg.body || '') + '</div>' +
        (cfg.footer ? '<div class="sheet-foot">' + cfg.footer + '</div>' : '') +
      '</div>';
    modalRoot.appendChild(overlay);
    document.body.style.overflow = 'hidden';

    activeModal = {
      overlay: overlay,
      onClose: cfg.onClose || null,
      lastFocus: document.activeElement
    };
    window.I18N.translateStatic(overlay);
    if (typeof cfg.onMount === 'function') cfg.onMount(overlay);

    const focusable = overlay.querySelector('input, select, textarea, button:not([data-action="modal-cancel"])');
    if (focusable) focusable.focus();
    return overlay;
  }

  function closeModal() {
    if (!activeModal) return;
    const current = activeModal;
    activeModal = null;
    if (current.overlay && current.overlay.parentNode) current.overlay.parentNode.removeChild(current.overlay);
    document.body.style.overflow = '';
    if (typeof current.onClose === 'function') current.onClose();
    if (current.lastFocus && typeof current.lastFocus.focus === 'function') current.lastFocus.focus();
  }

  document.addEventListener('keydown', function (e) {
    if (e.key === 'Escape' && activeModal) closeModal();
  });

  /* Fake M-Pesa checkout: nothing leaves the page. */
  function mpesaPay(opts) {
    return new Promise(function (resolve) {
      let done = false;
      function finish(ok) {
        if (done) return;
        done = true;
        resolve(ok);
      }
      openModal({
        title: T('M-Pesa payment'),
        subtitle: T('Demo checkout — no money moves.'),
        body:
          '<div class="mpesa-line">' + icon('phone') +
            '<div><strong>' + money(opts.amount) + '</strong>' +
            '<span>' + esc(opts.phone || '') + ' · ' + esc(opts.purpose || '') + '</span></div>' +
          '</div>' +
          '<p class="fine">' + T('In a real Sacco an M-Pesa request would pop up on this phone. Here you can just confirm to continue.') + '</p>',
        footer:
          '<button type="button" class="btn outline" id="mp-cancel">' + T('Cancel') + '</button>' +
          '<button type="button" class="btn" id="mp-pay">' + T('Confirm payment') + '</button>',
        onMount: function (overlay) {
          $('#mp-pay', overlay).addEventListener('click', function () {
            const btn = this;
            btn.disabled = true;
            btn.innerHTML = '<span class="spinner"></span> ' + T('Processing…');
            const cancel = $('#mp-cancel', overlay);
            if (cancel) cancel.disabled = true;
            window.setTimeout(function () {
              done = true;
              closeModal();
              resolve(true);
            }, 900);
          });
          $('#mp-cancel', overlay).addEventListener('click', function () {
            finish(false);
            closeModal();
          });
        },
        onClose: function () { finish(false); }
      });
    });
  }

  /* ---------------------------------------------------------
     Form validation helpers
     --------------------------------------------------------- */
  function setError(input, message) {
    const label = input.closest('label') || input.parentNode;
    label.classList.add('field-error');
    let text = label.querySelector('.error-text');
    if (!text) {
      text = document.createElement('span');
      text.className = 'error-text';
      label.appendChild(text);
    }
    text.textContent = message;
    input.setAttribute('aria-invalid', 'true');
  }
  function clearErrors(form) {
    $$('.field-error', form).forEach(function (el) { el.classList.remove('field-error'); });
    $$('input, select', form).forEach(function (el) { el.removeAttribute('aria-invalid'); });
    const alert = $('.form-alert', form);
    if (alert) alert.classList.remove('show');
  }
  function showFormAlert(form, message) {
    let alert = $('.form-alert', form);
    if (!alert) {
      alert = document.createElement('div');
      alert.className = 'form-alert';
      form.insertBefore(alert, form.firstChild);
    }
    alert.textContent = message;
    alert.classList.add('show');
  }

  /* ---------------------------------------------------------
     Routing
     --------------------------------------------------------- */
  const ROUTES = {
    '/home': { title: 'Home', view: renderHome },
    '/savings': { title: 'Savings', view: renderSavings },
    '/loans': { title: 'Loans', view: renderLoans },
    '/perks': { title: 'Rider perks', view: renderPerks },
    '/join': { title: 'Become a member', view: renderJoin },
    '/login': { title: 'Log in', view: renderLogin },
    '/dashboard': { title: 'My account', view: renderDashboard, auth: true }
  };

  function rawPath() {
    const raw = (window.location.hash || '').replace(/^#/, '');
    return raw.charAt(0) === '/' ? raw : '/home';
  }
  function effectivePath() {
    let path = rawPath();
    if (!ROUTES[path]) path = '/home';
    if (ROUTES[path].auth && !Store.isLoggedIn()) path = '/login';
    return path;
  }
  function go(path) {
    if (rawPath() === path) {
      render({ scroll: true });
    } else {
      window.location.hash = '#' + path;
    }
  }

  function render(opts) {
    opts = opts || {};
    const path = effectivePath();
    const member = Store.current();
    const route = ROUTES[path];

    if (window.location.hash && window.location.hash !== '#' + path) {
      try { history.replaceState(null, '', '#' + path); } catch (e) { /* file:// and sandboxes */ }
    }

    document.title = (route.title ? T(route.title) + ' · ' : '') + SITE;
    view.innerHTML = route.view(member);
    window.I18N.translateStatic(document.body);
    updateNav(path);
    bindView(path);
    if (opts.scroll !== false) {
      window.scrollTo(0, 0);
      if (view.focus) view.focus({ preventScroll: true });
    }
  }

  function updateNav(path) {
    const logged = Store.isLoggedIn();
    $$('.menu a[data-nav]').forEach(function (a) {
      const isCurrent = a.getAttribute('data-nav') === path;
      a.classList.toggle('current', isCurrent);
      if (isCurrent) a.setAttribute('aria-current', 'page');
      else a.removeAttribute('aria-current');
    });
    $$('[data-auth-only]').forEach(function (el) { el.hidden = !logged; });
    $$('[data-guest-only]').forEach(function (el) { el.hidden = logged; });

    const join = $('#nav-join');
    if (join) {
      join.textContent = logged ? T('My account') : T('Join');
      join.setAttribute('href', logged ? '#/dashboard' : '#/join');
    }
    const logout = $('#nav-logout');
    if (logout) logout.hidden = !logged;

    const en = $('#lang-en');
    const sw = $('#lang-sw');
    if (en && sw) {
      const isSw = lang() === 'sw';
      en.classList.toggle('on', !isSw);
      sw.classList.toggle('on', isSw);
      en.setAttribute('aria-pressed', String(!isSw));
      sw.setAttribute('aria-pressed', String(isSw));
    }

    const menu = $('#menu');
    const toggle = $('.nav-toggle');
    if (menu && toggle) {
      menu.classList.remove('open');
      toggle.setAttribute('aria-expanded', 'false');
    }
  }

  function bindView(path) {
    if (path === '/join') bindJoinForm();
    if (path === '/login') bindLoginForm();
    if (path === '/loans') bindCalculator();
    if (path === '/dashboard') bindDashboard();
  }

  /* ---------------------------------------------------------
     Shared partials
     --------------------------------------------------------- */
  function sectionCta(title, text, primaryHref, primaryLabel, secondaryHref, secondaryLabel) {
    return '<section class="section">' +
      '<div class="wrap"><div class="cta">' +
        '<h2>' + title + '</h2><p>' + text + '</p>' +
        '<div class="cta-actions">' +
          '<a class="btn light" href="' + primaryHref + '">' + primaryLabel + '</a>' +
          (secondaryHref ? '<a class="btn outline" style="color:#fff;border-color:rgba(255,255,255,.35)" href="' + secondaryHref + '">' + secondaryLabel + '</a>' : '') +
        '</div>' +
      '</div></div></section>';
  }

  function savingsTile(bucket, text, tag) {
    const meta = BUCKETS[bucket];
    return '<div class="tile">' +
      '<div class="iconbox">' + icon(meta.icon) + '</div>' +
      '<h3>' + meta.label + '</h3>' +
      '<p>' + text + '</p>' +
      (tag ? '<span class="tag">' + tag + '</span>' : '') +
      '</div>';
  }

  function loanTile(type) {
    return '<div class="tile">' +
      '<div class="iconbox">' + icon(type.icon) + '</div>' +
      '<h3>' + type.name + '</h3>' +
      '<p>' + type.text + '</p>' +
      '<p class="price">' + TF('From {rate}% per month', { rate: type.rate.toFixed(1) }) + '</p>' +
      '<span class="tag">' + type.tag + '</span>' +
      '</div>';
  }

  function statBlock(label, value, sub, primary, iconName) {
    return '<div class="stat' + (primary ? ' primary' : '') + '">' +
      '<div class="label">' + icon(iconName || 'wallet', 'tiny') + ' ' + label + '</div>' +
      '<div class="value">' + value + '</div>' +
      (sub ? '<div class="sub">' + sub + '</div>' : '') +
      '</div>';
  }

  /* ---------------------------------------------------------
     HOME
     --------------------------------------------------------- */
  function renderHome() {
    const member = Store.current();
    return '' +
    '<section class="hero">' +
      '<div class="wrap hero-grid">' +
        '<div>' +
          '<span class="eyebrow">Built for riders</span>' +
          '<h1>Your ride. Your savings. Your future.</h1>' +
          '<p class="lead">Save from just KSh 50 a day, borrow when the road gets tough, and grow together with riders like you.</p>' +
          '<div class="hero-actions">' +
            (member
              ? '<a class="btn" href="#/dashboard">Go to my account</a>'
              : '<a class="btn" href="#/join">Become a member</a>') +
            '<a class="btn ghost" href="#/loans">Try the loan calculator →</a>' +
          '</div>' +
          '<div class="hero-stats">' +
            '<div><strong>KSh 50</strong><span>Start saving daily</span></div>' +
            '<div><strong>24 hrs</strong><span>Loan processing</span></div>' +
            '<div><strong>Yearly</strong><span>Dividends</span></div>' +
          '</div>' +
        '</div>' +
        '<div class="hero-visual">' +
          '<div class="hero-badge">' + icon('check') + ' <span>Member owned</span></div>' +
          '<figure class="hero-image">' +
            '<img src="assets/img/hero-rider.jpg" alt="A boda boda rider on his motorbike in Nairobi" width="900" height="1117" fetchpriority="high">' +
            '<figcaption class="float-card">' +
              '<div class="iconbox">' + icon('chart', 'small') + '</div>' +
              '<div><strong>Savings growing</strong><span>Every day counts</span></div>' +
            '</figcaption>' +
          '</figure>' +
        '</div>' +
      '</div>' +
    '</section>' +

    '<section class="section">' +
      '<div class="wrap">' +
        '<div class="head"><h2>Save the way you ride</h2><p>Simple savings built around a rider\'s day.</p></div>' +
        '<div class="grid g3">' +
          savingsTile('daily', 'Turn on autosave from as little as KSh 50 a day. Small amounts, every day, add up.', 'From KSh 50 a day') +
          savingsTile('locked', 'Non-withdrawable savings that earn you annual dividends at the end of the year.', 'Annual dividends') +
          savingsTile('bike', 'Saving for a new motorbike or an engine overhaul? Set it aside here, bit by bit.', 'Your next bike') +
        '</div>' +
        '<div class="split" style="margin-top:56px">' +
          '<div class="split-media"><figure class="photo-card" style="aspect-ratio:4/3">' +
            '<img src="assets/img/savings-phone.jpg" alt="A rider checking his savings on his phone" loading="lazy" width="1192" height="800">' +
            '<figcaption><strong>M-Pesa in, savings out</strong>Save in seconds from the phone in your pocket.</figcaption>' +
          '</figure></div>' +
          '<div>' +
            '<h2>Built around your day</h2>' +
            '<p>You earn fare by fare. So we let you save fare by fare — not in big lumps at the end of the month.</p>' +
            '<ul class="bullets">' +
              '<li>' + icon('check') + '<span>Autosave from KSh 50 a day, straight from M-Pesa.</span></li>' +
              '<li>' + icon('check') + '<span>Works on any phone — USSD when you have no data.</span></li>' +
              '<li>' + icon('check') + '<span>Your locked savings earn a share of the Sacco profit every year.</span></li>' +
              '<li>' + icon('check') + '<span>Withdraw from daily savings any time, no penalties.</span></li>' +
            '</ul>' +
            '<p style="margin-top:22px"><a class="btn" href="#/savings">Explore savings</a></p>' +
          '</div>' +
        '</div>' +
      '</div>' +
    '</section>' +

    '<section class="section tint">' +
      '<div class="wrap">' +
        '<div class="head"><h2>Loans made for riders</h2><p>Real help for the real things that come up on the road.</p></div>' +
        '<div class="grid g3">' +
          loanTile(LOAN_TYPES[1]) + loanTile(LOAN_TYPES[2]) + loanTile(LOAN_TYPES[0]) +
        '</div>' +
        '<p style="text-align:center;margin-top:32px"><a class="btn" href="#/loans">See all loans</a></p>' +
      '</div>' +
    '</section>' +

    '<section class="section">' +
      '<div class="wrap">' +
        '<div class="head"><h2>How it works</h2><p>Three steps from the stage to your savings.</p></div>' +
        '<div class="steps">' +
          '<div class="step"><div class="num">1</div><h3>Join with your phone</h3><p>Name, phone number, ID and a 4-digit PIN. It takes under a minute.</p></div>' +
          '<div class="step"><div class="num">2</div><h3>Save a little daily</h3><p>Pick KSh 50, 100, 200 or more. Autosave runs on M-Pesa every day.</p></div>' +
          '<div class="step"><div class="num">3</div><h3>Borrow when you need</h3><p>Borrow up to 3× your savings for a bike, repairs, fees or an emergency.</p></div>' +
        '</div>' +
      '</div>' +
    '</section>' +

    '<section class="section tight">' +
      '<div class="wrap">' +
        '<div class="media-band">' +
          '<img src="assets/img/community.jpg" alt="A group of riders standing with their motorbikes at a stage" loading="lazy" width="1200" height="670">' +
          '<div class="media-band-copy">' +
            '<h2>A Sacco that belongs to riders</h2>' +
            '<p>Every member owns a share. Profits come back to the people who saved — not to outsiders.</p>' +
            '<div class="mini-stats">' +
              '<div><strong>3×</strong><span>Savings to borrow</span></div>' +
              '<div><strong>12%</strong><span>Sample dividend rate</span></div>' +
              '<div><strong>0</strong><span>Hidden charges</span></div>' +
            '</div>' +
          '</div>' +
        '</div>' +
      '</div>' +
    '</section>' +

    sectionCta('Ready to start?', 'Join in under a minute. Start with KSh 50.',
      '#/join', 'Become a member', '#/login', 'I already have an account');
  }

  /* ---------------------------------------------------------
     SAVINGS
     --------------------------------------------------------- */
  function renderSavings() {
    const member = Store.current();
    const total = member ? Store.totalSavings(member) : 0;

    let summary = '';
    if (member) {
      summary = '<div class="card" style="margin-bottom:28px">' +
        '<div class="card-head"><h2>Your savings</h2><span class="badge">' + esc(member.memberNo) + '</span></div>' +
        '<div class="stats" style="margin-bottom:0">' +
          statBlock('Total saved', money(total), TF('{n} buckets', { n: 3 }), true, 'wallet') +
          statBlock('Daily savings', money(member.savings.daily), T('Withdraw any time'), false, 'money') +
          statBlock('Locked savings', money(member.savings.locked), T('Earns dividends'), false, 'lock') +
          statBlock('Bike fund', money(member.savings.bike), T('Your next bike'), false, 'bike') +
        '</div>' +
        '<div class="bucket-actions" style="margin-top:16px">' +
          '<button type="button" class="btn sm" data-action="save" data-bucket="daily">' + icon('plus') + ' Save now</button>' +
          '<a class="btn sm outline" href="#/dashboard">' + T('My account') + '</a>' +
        '</div>' +
      '</div>';
    }

    return '' +
    '<div class="wrap"><div class="page-title"><h1>Savings</h1><p>Three simple ways to put money aside, all built for riders.</p></div></div>' +
    '<section class="section">' +
      '<div class="wrap">' +
        summary +
        '<div class="grid g3">' +
          '<div class="tile"><div class="iconbox">' + icon('money') + '</div><h3>Daily boda savings</h3>' +
            '<p>Autosave from KSh 50 a day straight from your M-Pesa. Choose an amount that fits your day.</p>' +
            '<span class="tag">Autosave</span>' +
            '<div class="bucket-actions"><button type="button" class="btn sm" data-action="save" data-bucket="daily">' + (member ? T('Save now') : T('Start saving')) + '</button></div></div>' +
          '<div class="tile"><div class="iconbox">' + icon('lock') + '</div><h3>Locked savings</h3>' +
            '<p>Non-withdrawable savings that grow untouched and earn annual dividends.</p>' +
            '<span class="tag">Annual dividends</span>' +
            '<div class="bucket-actions"><button type="button" class="btn sm" data-action="save" data-bucket="locked">' + (member ? T('Save now') : T('Start saving')) + '</button></div></div>' +
          '<div class="tile"><div class="iconbox">' + icon('bike') + '</div><h3>Bike replacement fund</h3>' +
            '<p>For a new motorbike or a big engine overhaul. Build it up a little every day.</p>' +
            '<span class="tag">Bike goals</span>' +
            '<div class="bucket-actions"><button type="button" class="btn sm" data-action="save" data-bucket="bike">' + (member ? T('Save now') : T('Start saving')) + '</button></div></div>' +
        '</div>' +
      '</div>' +
    '</section>' +

    '<section class="section tint">' +
      '<div class="wrap">' +
        '<div class="head"><h2>Small money adds up</h2><p>A year of saving, at three everyday amounts.</p></div>' +
        '<div class="grid g3">' +
          '<div class="tile"><h3>KSh 50 a day</h3><p class="price" style="font-size:28px;letter-spacing:-1px">KSh 18,250</p><p>after one year</p></div>' +
          '<div class="tile"><h3>KSh 100 a day</h3><p class="price" style="font-size:28px;letter-spacing:-1px">KSh 36,500</p><p>after one year</p></div>' +
          '<div class="tile"><h3>KSh 200 a day</h3><p class="price" style="font-size:28px;letter-spacing:-1px">KSh 73,000</p><p>after one year</p></div>' +
        '</div>' +
        '<p class="fine" style="text-align:center;margin-top:24px">' + T('Illustration only. Savings are held in your own account and are not affected by other members.') + '</p>' +
      '</div>' +
    '</section>' +

    '<section class="section">' +
      '<div class="wrap"><div class="split">' +
        '<div>' +
          '<h2>Locked savings earn dividends</h2>' +
          '<p>Locked savings and share capital cannot be withdrawn, but they earn a share of the Sacco profit each year.</p>' +
          '<div class="dividend">' + icon('chart') +
            '<div><strong>' + T('Sample: KSh 10,000 locked') + '</strong>' +
            T('At a 12% dividend rate that is about KSh 1,200 at the end of the year.') + '</div>' +
          '</div>' +
          '<p style="margin-top:20px">' + T('Final dividend rates are proposed by the board and approved by members at the AGM.') + '</p>' +
        '</div>' +
        '<div class="split-media"><figure class="photo-card" style="aspect-ratio:4/3">' +
          '<img src="assets/img/community.jpg" alt="Riders at a stage" loading="lazy" width="1200" height="670">' +
          '<figcaption><strong>' + T('Member owned') + '</strong>' + T('Profits come back to riders.') + '</figcaption>' +
        '</figure></div>' +
      '</div></div>' +
    '</section>' +

    sectionCta('Start with KSh 50', 'Open your savings account in under a minute.',
      '#/join', 'Become a member', '#/loans', 'See loans');
  }

  /* ---------------------------------------------------------
     LOANS
     --------------------------------------------------------- */
  function renderLoans() {
    const member = Store.current();
    const eligible = member ? Store.maxLoanFor(member) : 0;
    const active = member ? Store.activeLoans(member).length : 0;

    let eligibility;
    if (member) {
      eligibility = '<div class="eligibility">' +
        '<div>' +
          '<h3>' + TF('You can borrow up to {amount}', { amount: money(eligible) }) + '</h3>' +
          '<p>' + TF('Based on {saved} in savings. You may borrow up to 3× your savings, capped at KSh 200,000.', { saved: money(Store.totalSavings(member)) }) + '</p>' +
          '<p class="fine">' + TF('Active loans: {n} of 2.', { n: active }) + '</p>' +
        '</div>' +
        '<div class="amount">' +
          '<div class="big">' + money(eligible) + '</div>' +
          '<span>' + T('Available to borrow') + '</span>' +
          '<div class="bucket-actions" style="justify-content:flex-end;margin-top:12px">' +
            '<button type="button" class="btn sm" data-action="apply-loan">' + T('Apply for a loan') + '</button>' +
          '</div>' +
        '</div>' +
      '</div>';
      if (!eligible) {
        eligibility = '<div class="eligibility">' +
          '<div><h3>' + T('Save KSh 500 to unlock borrowing') + '</h3>' +
          '<p>' + T('Your loan limit grows with your savings: 3× whatever you have saved, up to KSh 200,000.') + '</p></div>' +
          '<div class="amount"><div class="big">' + money(Store.totalSavings(member)) + '</div><span>' + T('Saved so far') + '</span>' +
          '<div class="bucket-actions" style="justify-content:flex-end;margin-top:12px">' +
            '<button type="button" class="btn sm" data-action="save" data-bucket="daily">' + T('Save now') + '</button>' +
          '</div></div></div>';
      }
    } else {
      eligibility = '<div class="eligibility">' +
        '<div><h3>' + T('Join to see your loan limit') + '</h3>' +
        '<p>' + T('Members can borrow up to 3× their savings, up to KSh 200,000. Save KSh 500 to get started.') + '</p></div>' +
        '<div class="amount"><div class="big">3×</div><span>' + T('Your savings') + '</span>' +
        '<div class="bucket-actions" style="justify-content:flex-end;margin-top:12px">' +
          '<a class="btn sm" href="#/join">' + T('Become a member') + '</a></div></div>' +
      '</div>';
    }

    return '' +
    '<div class="wrap"><div class="page-title"><h1>Loans for riders</h1><p>Pick the loan that fits what you need, then see what it costs.</p></div></div>' +

    '<section class="section">' +
      '<div class="wrap">' +
        eligibility +
        '<div class="grid g3" style="margin-top:26px">' + LOAN_TYPES.map(loanTile).join('') + '</div>' +
      '</div>' +
    '</section>' +

    '<section class="section tint">' +
      '<div class="wrap">' +
        '<div class="head"><h2>Loan calculator</h2><p>Slide to see your estimated monthly repayment.</p></div>' +
        '<div class="calc">' +
          '<div class="calc-form">' +
            '<div class="field">' +
              '<div class="field-top"><label for="amount">Loan amount</label><output id="amountOut">KSh 20,000</output></div>' +
              '<input type="range" id="amount" min="2000" max="200000" step="1000" value="' + calcState.amount + '">' +
              '<div class="range-labels"><span>KSh 2,000</span><span>KSh 200,000</span></div>' +
            '</div>' +
            '<div class="field">' +
              '<div class="field-top"><label for="months">Repayment period</label><output id="monthsOut">6 months</output></div>' +
              '<input type="range" id="months" min="1" max="36" step="1" value="' + calcState.months + '">' +
              '<div class="range-labels"><span>1 month</span><span>36 months</span></div>' +
            '</div>' +
            '<div class="field">' +
              '<div class="field-top"><label for="type">Loan type</label></div>' +
              '<select id="type">' +
                LOAN_TYPES.map(function (t) {
                  return '<option value="' + t.id + '"' + (t.id === calcState.typeId ? ' selected' : '') + '>' + t.name + '</option>';
                }).join('') +
              '</select>' +
            '</div>' +
          '</div>' +
          '<div class="result">' +
            '<div>' +
              '<div class="small-label">Estimated monthly repayment</div>' +
              '<div class="big" id="monthly">KSh 0</div>' +
              '<div class="per">per month</div>' +
              '<div class="rows">' +
                '<div><span>Interest rate</span><span id="rateOut">1.2% per month</span></div>' +
                '<div><span>Total interest</span><span id="interestOut">KSh 0</span></div>' +
                '<div><span>Total to repay</span><span id="totalOut">KSh 0</span></div>' +
              '</div>' +
            '</div>' +
            '<div>' +
              '<button type="button" class="btn light" style="width:100%" data-action="apply-loan" data-from="calc">' + T('Apply for this amount') + '</button>' +
              '<p class="fine">' + T('Sample rates for the prototype only. Final rates will be set by the Sacco.') + '</p>' +
            '</div>' +
          '</div>' +
        '</div>' +
      '</div>' +
    '</section>' +

    '<section class="section">' +
      '<div class="wrap">' +
        '<div class="head"><h2>Getting a loan</h2><p>Straightforward, and no paperwork queues.</p></div>' +
        '<div class="steps">' +
          '<div class="step"><div class="num">1</div><h3>Check your limit</h3><p>Your limit is 3× your savings, up to KSh 200,000. You need at least KSh 500 saved.</p></div>' +
          '<div class="step"><div class="num">2</div><h3>Apply in the app</h3><p>Choose the loan, amount and repayment period. Most requests are reviewed within 24 hours.</p></div>' +
          '<div class="step"><div class="num">3</div><h3>Get paid by M-Pesa</h3><p>Approved loans go straight to your phone. Repay a little each month, also on M-Pesa.</p></div>' +
        '</div>' +
        '<div class="split" style="margin-top:56px">' +
          '<div class="split-media"><figure class="photo-card" style="aspect-ratio:4/3">' +
            '<img src="assets/img/repair.jpg" alt="A mechanic repairing a boda boda engine beside its rider" loading="lazy" width="1192" height="800">' +
            '<figcaption><strong>Keep the bike earning</strong>Repairs should not cost you a week of fares.</figcaption>' +
          '</figure></div>' +
          '<div>' +
            '<h2>Borrow for the things that keep you moving</h2>' +
            '<p>An engine that needs work, a licence that needs renewing, a child who needs fees. Short, clear loans with a repayment plan you can see.</p>' +
            '<ul class="bullets">' +
              '<li>' + icon('check') + '<span>Flat, transparent interest — see the total before you apply.</span></li>' +
              '<li>' + icon('check') + '<span>Repay early with no penalty.</span></li>' +
              '<li>' + icon('check') + '<span>Two active loans at a time, so repayment stays manageable.</span></li>' +
              '<li>' + icon('info') + '<span>Prototype: applications are approved instantly and are simulated.</span></li>' +
            '</ul>' +
          '</div>' +
        '</div>' +
      '</div>' +
    '</section>' +

    sectionCta('Need a loan?', 'Join the Sacco, save a little, and your limit starts growing today.',
      '#/join', 'Become a member', '#/login', 'Log in');
  }

  /* ---------------------------------------------------------
     PERKS
     --------------------------------------------------------- */
  function renderPerks() {
    const perks = [
      { icon: 'phone', title: 'M-Pesa and USSD', text: 'Save and repay with M-Pesa. USSD support means it works on any phone, no data needed.' },
      { icon: 'cap', title: 'Rider training', text: 'Road safety, first aid, customer service and more, taught to members.' },
      { icon: 'doc', title: 'License and compliance help', text: 'Get help with your license and the paperwork that keeps you legal on the road.' },
      { icon: 'chart', title: 'Annual dividends', text: 'When the Sacco does well, members share in the profit every year.' },
      { icon: 'shield', title: 'Insurance cover', text: 'Protection for you and your bike through trusted insurance partners.' },
      { icon: 'users', title: 'A community of riders', text: 'Belong to a group that backs each other up, on and off the road.' }
    ];
    return '' +
    '<div class="wrap"><div class="page-title"><h1>More rider advantages</h1><p>Membership is more than savings and loans.</p></div></div>' +
    '<section class="section">' +
      '<div class="wrap"><div class="grid g2">' +
        perks.map(function (p) {
          return '<div class="tile perk" style="display:flex;gap:18px;align-items:flex-start">' +
            '<div class="iconbox" style="flex-shrink:0;margin-bottom:0">' + icon(p.icon) + '</div>' +
            '<div><h3>' + p.title + '</h3><p>' + p.text + '</p></div></div>';
        }).join('') +
      '</div></div>' +
    '</section>' +
    '<section class="section tight">' +
      '<div class="wrap"><div class="media-band">' +
        '<img src="assets/img/community.jpg" alt="Riders together at a stage" loading="lazy" width="1200" height="670">' +
        '<div class="media-band-copy">' +
          '<h2>You are not riding alone</h2>' +
          '<p>A Sacco is only as strong as its members. Ride with people who understand the road, the fares and the bad days.</p>' +
          '<a class="btn light" style="align-self:flex-start" href="#/join">Join the Sacco</a>' +
        '</div>' +
      '</div></div>' +
    '</section>' +
    sectionCta('Ride with us', 'Join the Sacco and start with KSh 50.', '#/join', 'Become a member', '#/savings', 'How savings work');
  }

  /* ---------------------------------------------------------
     JOIN
     --------------------------------------------------------- */
  function renderJoin() {
    const logged = Store.isLoggedIn();
    return '<div class="wrap"><div class="form-page">' +
      '<form class="form-card" id="join-form" novalidate>' +
        '<h1>Become a member</h1>' +
        '<p class="lead">It takes less than a minute.</p>' +
        '<div class="form-alert" role="alert"></div>' +
        '<div class="form-grid">' +
          '<label class="field-label">Full name<input type="text" name="fullname" autocomplete="name" placeholder="John Kamau" required></label>' +
          '<label class="field-label">Phone number<input type="tel" name="phone" inputmode="tel" autocomplete="tel" placeholder="0712 345 678" required></label>' +
          '<label class="field-label">ID number<input type="text" name="idNumber" inputmode="numeric" placeholder="National ID" required></label>' +
          '<label class="field-label">Stage or area<input type="text" name="stage" placeholder="Githurai Stage"></label>' +
          '<label class="field-label">Daily saving' +
            '<select name="dailyAmount">' +
              '<option value="50">KSh 50</option>' +
              '<option value="100" selected>KSh 100</option>' +
              '<option value="200">KSh 200</option>' +
              '<option value="500">KSh 500</option>' +
            '</select></label>' +
          '<label class="field-label">PIN<input type="password" name="pin" inputmode="numeric" maxlength="4" pattern="[0-9]{4}" autocomplete="new-password" placeholder="4 digits" required></label>' +
          '<label class="field-label">Confirm PIN<input type="password" name="pin2" inputmode="numeric" maxlength="4" pattern="[0-9]{4}" autocomplete="new-password" placeholder="4 digits" required></label>' +
        '</div>' +
        '<label class="checkbox"><input type="checkbox" name="terms">' +
          '<span>I agree to the Sacco rules and I understand this is a working prototype, not a real financial account.</span></label>' +
        '<button class="btn block" type="submit">Join now</button>' +
        '<p class="hint">Prototype only. No real account is created.</p>' +
        '<div class="auth-switch">' + T('Already a member?') + ' <a href="#/login">' + T('Log in') + '</a></div>' +
      '</form>' +
      '<aside class="form-side">' +
        '<figure class="photo-card">' +
          '<img src="assets/img/savings-phone.jpg" alt="A rider using M-Pesa on his phone" width="1192" height="800">' +
          '<figcaption><strong>Start with KSh 50</strong>Autosave from your M-Pesa, every day.</figcaption>' +
        '</figure>' +
        '<div class="info-card">' +
          '<h3>What you get</h3>' +
          '<ul class="bullets">' +
            '<li>' + icon('check') + '<span>A member number and your own savings account.</span></li>' +
            '<li>' + icon('check') + '<span>Three savings buckets: daily, locked and bike fund.</span></li>' +
            '<li>' + icon('check') + '<span>A loan limit that grows with your savings.</span></li>' +
            '<li>' + icon('check') + '<span>Training, insurance and dividend benefits.</span></li>' +
          '</ul>' +
        '</div>' +
        '<p class="fine">' + T('Your details stay in this browser. Nothing is sent to a server.') + '</p>' +
      '</aside>' +
    '</div></div>';
  }

  function bindJoinForm() {
    const form = $('#join-form');
    if (!form) return;
    form.addEventListener('submit', function (e) {
      e.preventDefault();
      clearErrors(form);
      const el = form.elements;
      const data = {
        name: el.fullname.value.trim(),
        phone: el.phone.value.trim(),
        idNumber: el.idNumber.value.trim(),
        stage: el.stage.value.trim(),
        dailyAmount: Number(el.dailyAmount.value),
        pin: el.pin.value,
        pin2: el.pin2.value
      };
      let firstBad = null;
      function bad(input, message) {
        setError(input, message);
        if (!firstBad) firstBad = input;
      }
      if (data.name.replace(/\s+/g, ' ').length < 3) bad(el.fullname, T('Enter your full name.'));
      if (!Store.isValidPhone(data.phone)) bad(el.phone, T('Use a Kenyan mobile number, e.g. 0712 345 678.'));
      if (!/^\d{6,10}$/.test(data.idNumber)) bad(el.idNumber, T('Enter a valid ID number.'));
      if (!Store.isValidPin(data.pin)) bad(el.pin, T('Your PIN must be 4 digits.'));
      if (data.pin !== data.pin2) bad(el.pin2, T('The two PINs do not match.'));
      if (!el.terms.checked) showFormAlert(form, T('Please accept the Sacco rules to continue.'));

      if (firstBad) { firstBad.focus(); return; }
      if (!el.terms.checked) return;

      const existing = Store.isLoggedIn();
      const res = Store.createMember(data);
      if (!res.ok) {
        if (res.code === 'exists') {
          bad(el.phone, T('This number is already registered. Try logging in.'));
          firstBad.focus();
        } else if (res.code === 'phone') {
          bad(el.phone, T('Use a Kenyan mobile number, e.g. 0712 345 678.'));
          firstBad.focus();
        } else {
          showFormAlert(form, T('Something went wrong. Please try again.'));
        }
        return;
      }
      if (existing) { /* replaced session */ }
      toast(TF('Welcome to the Sacco! Your member number is {no}.', { no: res.member.memberNo }));
      go('/dashboard');
    });
  }

  /* ---------------------------------------------------------
     LOGIN
     --------------------------------------------------------- */
  function renderLogin() {
    return '<div class="wrap"><div class="form-page" style="grid-template-columns:minmax(0,460px);justify-content:center">' +
      '<form class="form-card" id="login-form" novalidate>' +
        '<h1>Welcome back</h1>' +
        '<p class="lead">Log in with the phone number you joined with.</p>' +
        '<div class="form-alert" role="alert"></div>' +
        '<label class="field-label">Phone number<input type="tel" name="phone" inputmode="tel" autocomplete="tel" placeholder="0712 345 678" required></label>' +
        '<label class="field-label">PIN<input type="password" name="pin" inputmode="numeric" maxlength="4" autocomplete="current-password" placeholder="4 digits" required></label>' +
        '<button class="btn block" type="submit">Log in</button>' +
        '<div class="demo-box">' +
          '<button type="button" class="btn outline block" data-action="demo-login">' + T('Open the demo account') + '</button>' +
          '<p class="hint">' + T('A ready-made member with savings history and an active loan.') + '</p>' +
        '</div>' +
        '<div class="auth-switch">' + T('New here?') + ' <a href="#/join">' + T('Become a member') + '</a></div>' +
      '</form>' +
    '</div></div>';
  }

  function bindLoginForm() {
    const form = $('#login-form');
    if (!form) return;
    form.addEventListener('submit', function (e) {
      e.preventDefault();
      clearErrors(form);
      const el = form.elements;
      const res = Store.login(el.phone.value, el.pin.value);
      if (!res.ok) {
        if (res.code === 'phone') setError(el.phone, T('Use a Kenyan mobile number, e.g. 0712 345 678.'));
        else if (res.code === 'pin') setError(el.pin, T('Your PIN must be 4 digits.'));
        else if (res.code === 'notfound') setError(el.phone, T('No member found with that number.'));
        else setError(el.pin, T('Incorrect PIN. Try again.'));
        const first = $('.field-error input', form);
        if (first) first.focus();
        return;
      }
      toast(TF('Welcome back, {name}.', { name: firstName(res.member) }));
      go('/dashboard');
    });
  }

  /* ---------------------------------------------------------
     DASHBOARD
     --------------------------------------------------------- */
  function savedThisMonth(member) {
    const now = new Date();
    return member.tx.filter(function (tx) {
      if (tx.kind !== 'save') return false;
      const d = new Date(tx.ts);
      return d.getFullYear() === now.getFullYear() && d.getMonth() === now.getMonth();
    }).reduce(function (sum, tx) { return sum + tx.amount; }, 0);
  }

  function bucketRow(member, bucket) {
    const meta = BUCKETS[bucket];
    const balance = member.savings[bucket];
    const goal = bucket === 'daily' ? 0 : (member.goals[bucket] || 0);
    const pct = goal ? Math.min(100, Math.round((balance / goal) * 100)) : 0;
    return '<div class="bucket">' +
      '<div class="bucket-top"><strong>' + meta.label + '</strong><span class="amount">' + money(balance) + '</span></div>' +
      (goal
        ? '<div class="progress green"><span style="width:' + pct + '%"></span></div>' +
          '<div class="bucket-meta"><span>' + TF('Goal {goal}', { goal: money(goal) }) + '</span><span>' + pct + '%</span></div>'
        : '<div class="bucket-meta"><span>' + meta.hint + '</span><span>' + T('No lock-in') + '</span></div>') +
      '<div class="bucket-actions">' +
        '<button type="button" class="btn sm outline" data-action="save" data-bucket="' + bucket + '">' + icon('plus') + ' ' + T('Save') + '</button>' +
        (bucket === 'daily'
          ? '<button type="button" class="btn sm ghost" data-action="withdraw">' + T('Withdraw') + '</button>'
          : '<button type="button" class="btn sm ghost" data-action="goal" data-bucket="' + bucket + '">' + T('Edit goal') + '</button>') +
      '</div>' +
    '</div>';
  }

  function txRow(tx) {
    const isOut = tx.kind === 'withdraw' || tx.kind === 'repay';
    const icons = { save: 'plus', withdraw: 'arrow-right', loan: 'wallet', repay: 'check' };
    const noteKey = tx.note;
    return '<li class="tx">' +
      '<div class="tx-icon ' + (isOut ? 'out' : 'in') + '">' + icon(icons[tx.kind] || 'receipt') + '</div>' +
      '<div class="tx-body"><strong>' + esc(T(noteKey)) + '</strong><span>' + fmtDate(tx.ts) + '</span></div>' +
      '<div class="tx-amt' + (isOut ? ' out' : '') + '">' + (isOut ? '−' : '+') + money(tx.amount) + '</div>' +
    '</li>';
  }

  function loanCard(loan) {
    const paidPct = Math.min(100, Math.round((loan.paid / loan.total) * 100));
    return '<div class="loan-item">' +
      '<div class="loan-top"><div><h3>' + T(loan.typeName) + '</h3>' +
        (loan.purpose ? '<p class="fine" style="margin:2px 0 6px">' + esc(loan.purpose) + '</p>' : '') +
        '<span class="badge ' + (loan.status === 'closed' ? 'green' : 'amber') + '">' + (loan.status === 'closed' ? T('Cleared') : T('Active')) + '</span></div>' +
        '<div class="loan-amount">' + money(loan.outstanding) + '<span class="fine" style="display:block;text-align:right">' + T('remaining') + '</span></div>' +
      '</div>' +
      '<div class="progress' + (loan.status === 'closed' ? ' green' : '') + '"><span style="width:' + paidPct + '%"></span></div>' +
      '<div class="loan-meta"><span>' + TF('Paid {paid} of {total}', { paid: money(loan.paid), total: money(loan.total) }) + '</span>' +
        '<span>' + (loan.status === 'closed' ? T('Loan cleared') : TF('Next payment {amount}', { amount: money(Math.min(loan.monthly, loan.outstanding)) })) + '</span></div>' +
      (loan.status === 'active'
        ? '<div class="bucket-actions"><button type="button" class="btn sm" data-action="repay" data-loan="' + loan.id + '">' + T('Repay') + '</button>' +
          '<span class="fine" style="align-self:center;margin:0">' + TF('Due {date}', { date: fmtDate(loan.nextDue, true) }) + '</span></div>'
        : '') +
    '</div>';
  }

  function renderDashboard(member) {
    if (!member) return '';
    const total = Store.totalSavings(member);
    const active = Store.activeLoans(member);
    const outstanding = Store.outstandingTotal(member);
    const dividends = Math.round(member.savings.locked * Store.DIVIDEND_RATE);
    const due = Store.autosaveDue();
    const monthSaved = savedThisMonth(member);
    const recent = member.tx.slice(0, 8);

    return '<div class="wrap dash">' +
      '<div class="dash-head">' +
        '<div>' +
          '<span class="eyebrow">' + T('Member dashboard') + '</span>' +
          '<h1>' + TF('Hello, {name}', { name: firstName(member) }) + '</h1>' +
          '<div class="who">' +
            '<span class="badge">' + esc(member.memberNo) + '</span>' +
            (member.stage ? '<span class="dot"></span><span>' + esc(member.stage) + '</span>' : '') +
            '<span class="dot"></span><span>' + TF('Member since {date}', { date: fmtDate(member.joinedAt) }) + '</span>' +
          '</div>' +
        '</div>' +
        '<div class="bucket-actions">' +
          '<button type="button" class="btn" data-action="apply-loan">' + icon('plus') + ' ' + T('Apply for a loan') + '</button>' +
          '<button type="button" class="btn outline" data-action="logout">' + icon('logout') + ' ' + T('Log out') + '</button>' +
        '</div>' +
      '</div>' +

      '<div class="stats">' +
        statBlock(T('Total savings'), money(total), TF('+{amount} this month', { amount: money(monthSaved) }), true, 'wallet') +
        statBlock(T('Loan balance'), money(outstanding), active.length ? TF('{n} active', { n: active.length }) : T('No active loans'), false, 'receipt') +
        statBlock(T('Projected dividends'), money(dividends), TF('{rate}% on locked savings', { rate: 12 }), false, 'chart') +
        statBlock(T('Autosave'), member.autosave.enabled ? money(member.autosave.amount) + ' / ' + T('day') : T('Off'), due ? T('Due today') : T('Done for today'), false, 'calendar') +
      '</div>' +

      '<div class="dash-grid">' +
        '<div>' +
          '<div class="card">' +
            '<div class="card-head"><h2>' + T('Your savings') + '</h2>' + icon('wallet') + '</div>' +
            bucketRow(member, 'daily') + bucketRow(member, 'locked') + bucketRow(member, 'bike') +
          '</div>' +

          '<div class="card">' +
            '<div class="card-head"><h2>' + T('Your loans') + '</h2>' +
              '<button type="button" class="btn sm outline" data-action="apply-loan">' + T('New loan') + '</button></div>' +
            (member.loans.length
              ? member.loans.map(loanCard).join('')
              : '<div class="empty">' + icon('receipt') + '<p>' + T('No loans yet. Your limit grows with every shilling you save.') + '</p></div>') +
          '</div>' +

          '<div class="card">' +
            '<div class="card-head"><h2>' + T('Recent activity') + '</h2>' + icon('receipt') + '</div>' +
            (recent.length
              ? '<ul class="tx-list">' + recent.map(txRow).join('') + '</ul>'
              : '<div class="empty">' + icon('receipt') + '<p>' + T('No activity yet. Make your first deposit to get started.') + '</p></div>') +
          '</div>' +
        '</div>' +

        '<div>' +
          '<div class="card">' +
            '<div class="card-head"><h2>' + T('Daily autosave') + '</h2>' + icon('calendar') + '</div>' +
            '<div class="autosave-row">' +
              '<div><strong>' + T('Autosave on M-Pesa') + '</strong>' +
                '<span class="muted">' + (member.autosave.enabled ? TF('{amount} every day', { amount: money(member.autosave.amount) }) : T('Paused')) + '</span></div>' +
              '<label class="switch"><input type="checkbox" id="autosave-toggle"' + (member.autosave.enabled ? ' checked' : '') + ' aria-label="' + T('Autosave on M-Pesa') + '"><span class="slider"></span></label>' +
            '</div>' +
            '<div class="autosave-row">' +
              '<div><strong>' + T('Daily amount') + '</strong><span class="muted">' + T('Change any time') + '</span></div>' +
              '<select id="autosave-amount" class="mini-select">' +
                [50, 100, 200, 500].map(function (v) {
                  return '<option value="' + v + '"' + (v === member.autosave.amount ? ' selected' : '') + '>KSh ' + v + '</option>';
                }).join('') +
              '</select>' +
            '</div>' +
            '<div class="autosave-row">' +
              '<div><strong>' + T('Today') + '</strong><span class="muted">' + (due ? T('Autosave not run yet') : T('Autosave complete')) + '</span></div>' +
              (due
                ? '<button type="button" class="btn sm" data-action="run-autosave">' + T('Save now') + '</button>'
                : '<span class="badge green">' + icon('check', 'tiny') + ' ' + T('Done') + '</span>') +
            '</div>' +
            '<p class="fine">' + T('In the real product autosave is charged from M-Pesa each morning. Here it is simulated.') + '</p>' +
          '</div>' +

          '<div class="card">' +
            '<div class="card-head"><h2>' + T('Quick actions') + '</h2></div>' +
            '<div class="quick-grid">' +
              '<button type="button" class="btn sm outline" data-action="save" data-bucket="daily">' + icon('plus') + ' ' + T('Save daily') + '</button>' +
              '<button type="button" class="btn sm outline" data-action="save" data-bucket="locked">' + icon('lock') + ' ' + T('Lock savings') + '</button>' +
              '<button type="button" class="btn sm outline" data-action="save" data-bucket="bike">' + icon('bike') + ' ' + T('Bike fund') + '</button>' +
              '<button type="button" class="btn sm outline" data-action="withdraw">' + icon('arrow-right') + ' ' + T('Withdraw') + '</button>' +
            '</div>' +
          '</div>' +

          '<div class="card">' +
            '<div class="card-head"><h2>' + T('Dividends') + '</h2>' + icon('chart') + '</div>' +
            '<p class="muted">' + TF('Your locked savings of {amount} are projected to earn about {dividend} this year at a 12% rate.', {
              amount: money(member.savings.locked), dividend: money(dividends)
            }) + '</p>' +
            '<div class="dividend">' + icon('info') +
              '<div><strong>' + T('Paid once a year') + '</strong>' + T('Dividends are approved at the AGM and paid to your savings account.') + '</div>' +
            '</div>' +
          '</div>' +
        '</div>' +
      '</div>' +

      '<div class="dash-foot">' +
        '<p class="fine">' + T('Prototype only. Balances are simulated and stored in this browser.') + '</p>' +
        '<button type="button" class="link-btn" data-action="reset-data">' + T('Reset demo data') + '</button>' +
      '</div>' +
    '</div>';
  }

  function bindDashboard() {
    const toggle = $('#autosave-toggle');
    if (toggle) {
      toggle.addEventListener('change', function () {
        const res = Store.setAutosave({ enabled: toggle.checked });
        if (res.ok) {
          toast(toggle.checked ? T('Autosave turned on.') : T('Autosave paused.'));
          render({ scroll: false });
        }
      });
    }
    const amount = $('#autosave-amount');
    if (amount) {
      amount.addEventListener('change', function () {
        const res = Store.setAutosave({ amount: Number(amount.value) });
        if (res.ok) {
          toast(TF('Daily autosave set to {amount}.', { amount: money(Number(amount.value)) }));
          render({ scroll: false });
        }
      });
    }
  }

  /* ---------------------------------------------------------
     CALCULATOR
     --------------------------------------------------------- */
  function bindCalculator() {
    const amount = $('#amount');
    const months = $('#months');
    const type = $('#type');
    if (!amount || !months || !type) return;

    function update() {
      const a = Number(amount.value);
      const n = Number(months.value);
      const selected = loanType(type.value);
      const q = Store.quote(a, n, selected.rate);
      calcState = { amount: a, months: n, typeId: selected.id, rate: selected.rate };

      const amountOut = $('#amountOut');
      const monthsOut = $('#monthsOut');
      const rateOut = $('#rateOut');
      const interestOut = $('#interestOut');
      const totalOut = $('#totalOut');
      const monthly = $('#monthly');
      if (amountOut) amountOut.textContent = money(a);
      if (monthsOut) monthsOut.textContent = n === 1 ? T('1 month') : TF('{n} months', { n: n });
      if (rateOut) rateOut.textContent = TF('{rate}% per month', { rate: selected.rate.toFixed(1) });
      if (interestOut) interestOut.textContent = money(q.interest);
      if (totalOut) totalOut.textContent = money(q.total);
      if (monthly) monthly.textContent = money(q.monthly);
    }

    amount.addEventListener('input', update);
    months.addEventListener('input', update);
    type.addEventListener('change', update);
    update();
  }

  /* ---------------------------------------------------------
     Actions — save, withdraw, goals, loans
     --------------------------------------------------------- */
  function openSaveModal(bucket) {
    const member = Store.current();
    if (!member) {
      toast(T('Join first — it takes less than a minute.'), 'error');
      go('/join');
      return;
    }
    const meta = BUCKETS[bucket] || BUCKETS.daily;
    const preset = member.autosave.amount || 100;

    openModal({
      title: T('Save to') + ' ' + T(meta.label),
      subtitle: T('Simulated M-Pesa deposit'),
      body:
        '<form id="save-form" novalidate>' +
          '<label>' + T('Amount') +
            '<input type="number" name="amount" min="1" max="200000" step="1" inputmode="numeric" value="' + preset + '" required>' +
          '</label>' +
          '<div class="chip-row">' +
            [50, 100, 200, 500, 1000].map(function (v) {
              return '<button type="button" class="chip" data-action="quick-amount" data-amount="' + v + '">KSh ' + v + '</button>';
            }).join('') +
          '</div>' +
          '<div class="summary">' +
            '<div><span>' + T('Bucket') + '</span><strong>' + T(meta.label) + '</strong></div>' +
            '<div><span>' + T('Current balance') + '</span><strong>' + money(member.savings[bucket]) + '</strong></div>' +
            '<div><span>' + T('M-Pesa number') + '</span><strong>' + Store.maskPhone(member.phone) + '</strong></div>' +
          '</div>' +
        '</form>',
      footer:
        '<button type="button" class="btn outline" data-action="modal-cancel">' + T('Cancel') + '</button>' +
        '<button type="submit" class="btn" form="save-form">' + T('Save now') + '</button>',
      onMount: function (overlay) {
        const form = $('#save-form', overlay);
        const input = form.elements.amount;
        $$('[data-action="quick-amount"]', overlay).forEach(function (chip) {
          chip.addEventListener('click', function () {
            input.value = chip.getAttribute('data-amount');
            input.focus();
          });
        });
        form.addEventListener('submit', function (e) {
          e.preventDefault();
          const value = Number(input.value);
          if (!value || value < 1) { setError(input, T('Enter an amount of at least KSh 1.')); return; }
          if (value > 200000) { setError(input, T('The most you can save at once is KSh 200,000.')); return; }
          mpesaPay({ amount: value, phone: Store.maskPhone(member.phone), purpose: T(meta.label) }).then(function (ok) {
            if (!ok) return;
            const res = Store.saveTo(bucket, value);
            if (res.ok) {
              toast(TF('{amount} added to {bucket}.', { amount: money(value), bucket: T(meta.label) }));
              render({ scroll: false });
            } else {
              toast(T('That did not work. Please try again.'), 'error');
            }
          });
        });
      }
    });
  }

  function openWithdrawModal() {
    const member = Store.current();
    if (!member) return go('/login');
    if (member.savings.daily < 1) {
      openModal({
        title: T('Nothing to withdraw yet'),
        subtitle: T('Only daily savings can be withdrawn.'),
        body: '<p class="muted">' + T('Save something in daily savings first, then you can withdraw it to M-Pesa any time.') + '</p>',
        footer: '<button type="button" class="btn" data-action="modal-cancel">' + T('Close') + '</button>'
      });
      return;
    }
    openModal({
      title: T('Withdraw to M-Pesa'),
      subtitle: T('Only daily savings can be withdrawn'),
      body:
        '<form id="withdraw-form" novalidate>' +
          '<label>' + T('Amount') +
            '<input type="number" name="amount" min="1" max="' + member.savings.daily + '" step="1" inputmode="numeric" value="' + member.savings.daily + '" required>' +
          '</label>' +
          '<div class="summary">' +
            '<div><span>' + T('Available in daily savings') + '</span><strong>' + money(member.savings.daily) + '</strong></div>' +
            '<div><span>' + T('Locked savings') + '</span><strong>' + money(member.savings.locked) + ' · ' + T('not withdrawable') + '</strong></div>' +
            '<div><span>' + T('Bike fund') + '</span><strong>' + money(member.savings.bike) + ' · ' + T('not withdrawable') + '</strong></div>' +
          '</div>' +
        '</form>',
      footer:
        '<button type="button" class="btn outline" data-action="modal-cancel">' + T('Cancel') + '</button>' +
        '<button type="submit" class="btn" form="withdraw-form">' + T('Withdraw') + '</button>',
      onMount: function (overlay) {
        const form = $('#withdraw-form', overlay);
        const input = form.elements.amount;
        form.addEventListener('submit', function (e) {
          e.preventDefault();
          const value = Number(input.value);
          if (!value || value < 1) { setError(input, T('Enter an amount of at least KSh 1.')); return; }
          if (value > member.savings.daily) { setError(input, TF('You can withdraw up to {amount}.', { amount: money(member.savings.daily) })); return; }
          const res = Store.withdrawDaily(value);
          if (res.ok) {
            closeModal();
            toast(TF('{amount} sent to M-Pesa.', { amount: money(value) }));
            render({ scroll: false });
          }
        });
      }
    });
  }

  function openGoalModal(bucket) {
    const member = Store.current();
    if (!member) return go('/login');
    const meta = BUCKETS[bucket];
    openModal({
      title: T('Savings goal') + ' — ' + T(meta.label),
      subtitle: T('Set a target and watch the bar fill up.'),
      body:
        '<form id="goal-form" novalidate>' +
          '<label>' + T('Target amount') +
            '<input type="number" name="target" min="1000" max="500000" step="500" inputmode="numeric" value="' + (member.goals[bucket] || 20000) + '" required>' +
          '</label>' +
          '<div class="chip-row">' +
            [10000, 20000, 50000, 100000, 150000].map(function (v) {
              return '<button type="button" class="chip" data-action="quick-amount" data-amount="' + v + '">' + money(v) + '</button>';
            }).join('') +
          '</div>' +
          '<div class="summary">' +
            '<div><span>' + T('Saved so far') + '</span><strong>' + money(member.savings[bucket]) + '</strong></div>' +
            '<div><span>' + T('Still to go') + '</span><strong>' + money(Math.max(0, (member.goals[bucket] || 0) - member.savings[bucket])) + '</strong></div>' +
          '</div>' +
        '</form>',
      footer:
        '<button type="button" class="btn outline" data-action="modal-cancel">' + T('Cancel') + '</button>' +
        '<button type="submit" class="btn" form="goal-form">' + T('Save goal') + '</button>',
      onMount: function (overlay) {
        const form = $('#goal-form', overlay);
        const input = form.elements.target;
        $$('[data-action="quick-amount"]', overlay).forEach(function (chip) {
          chip.addEventListener('click', function () { input.value = chip.getAttribute('data-amount'); });
        });
        form.addEventListener('submit', function (e) {
          e.preventDefault();
          const res = Store.setGoal(bucket, Number(input.value));
          if (!res.ok) {
            setError(input, T('Choose a target of at least KSh 1,000.'));
            return;
          }
          closeModal();
          toast(T('Goal updated.'));
          render({ scroll: false });
        });
      }
    });
  }

  function openLoanModal(prefill) {
    const member = Store.current();
    if (!member) {
      toast(T('Join first — then you can apply in one tap.'), 'error');
      go('/join');
      return;
    }
    const max = Store.maxLoanFor(member);
    if (!max) {
      openModal({
        title: T('Save KSh 500 to unlock borrowing'),
        subtitle: T('Your limit is 3× your savings.'),
        body: '<p class="muted">' + TF('You have saved {amount}. Save at least KSh 500 and your loan limit starts at KSh 1,500.', { amount: money(Store.totalSavings(member)) }) + '</p>',
        footer: '<button type="button" class="btn outline" data-action="modal-cancel">' + T('Close') + '</button>' +
          '<button type="button" class="btn" data-action="save" data-bucket="daily">' + T('Save now') + '</button>'
      });
      return;
    }
    if (Store.activeLoans(member).length >= 2) {
      openModal({
        title: T('You already have two active loans'),
        subtitle: T('Repay one to apply again.'),
        body: '<p class="muted">' + T('Members can hold two active loans at a time. Clear one and you can borrow again straight away.') + '</p>',
        footer: '<button type="button" class="btn" data-action="modal-cancel">' + T('Close') + '</button>'
      });
      return;
    }

    const start = prefill || calcState;
    const startType = loanType(start.typeId);
    const startAmount = Math.min(start.amount || 20000, max);
    const startMonths = start.months || 6;

    openModal({
      wide: true,
      title: T('Apply for a loan'),
      subtitle: TF('You can borrow up to {amount}.', { amount: money(max) }),
      body:
        '<form id="loan-form" novalidate>' +
          '<label>' + T('Loan type') +
            '<select name="type">' +
              LOAN_TYPES.map(function (t) {
                return '<option value="' + t.id + '"' + (t.id === startType.id ? ' selected' : '') + '>' + t.name + '</option>';
              }).join('') +
            '</select>' +
          '</label>' +
          '<label>' + T('Amount') +
            '<input type="number" name="amount" min="1000" max="' + max + '" step="500" inputmode="numeric" value="' + startAmount + '" required>' +
          '</label>' +
          '<label>' + T('Repayment period') +
            '<select name="months">' +
              [1, 2, 3, 6, 9, 12, 18, 24, 36].map(function (m) {
                return '<option value="' + m + '"' + (m === startMonths ? ' selected' : '') + '>' + (m === 1 ? T('1 month') : TF('{n} months', { n: m })) + '</option>';
              }).join('') +
            '</select>' +
          '</label>' +
          '<label>' + T('What is it for?') +
            '<input type="text" name="purpose" placeholder="e.g. Engine overhaul" maxlength="60">' +
          '</label>' +
          '<div class="summary" id="loan-summary"></div>' +
        '</form>',
      footer:
        '<button type="button" class="btn outline" data-action="modal-cancel">' + T('Cancel') + '</button>' +
        '<button type="submit" class="btn" form="loan-form">' + T('Submit application') + '</button>',
      onMount: function (overlay) {
        const form = $('#loan-form', overlay);
        const amountInput = form.elements.amount;
        const monthsSelect = form.elements.months;
        const typeSelect = form.elements.type;
        const summary = $('#loan-summary', overlay);

        function updateSummary() {
          const t = loanType(typeSelect.value);
          const q = Store.quote(Number(amountInput.value) || 0, Number(monthsSelect.value), t.rate);
          summary.innerHTML =
            '<div><span>' + T('Monthly repayment') + '</span><strong>' + money(q.monthly) + '</strong></div>' +
            '<div><span>' + TF('Interest ({detail})', { detail: t.rate.toFixed(1) + '% × ' + q.months }) + '</span><strong>' + money(q.interest) + '</strong></div>' +
            '<div><span>' + T('Total to repay') + '</span><strong>' + money(q.total) + '</strong></div>';
          window.I18N.translateStatic(summary);
        }
        amountInput.addEventListener('input', updateSummary);
        monthsSelect.addEventListener('change', updateSummary);
        typeSelect.addEventListener('change', updateSummary);
        updateSummary();

        form.addEventListener('submit', function (e) {
          e.preventDefault();
          const t = loanType(typeSelect.value);
          const amount = Number(amountInput.value);
          if (!amount || amount < 1000) { setError(amountInput, T('The smallest loan is KSh 1,000.')); return; }
          if (amount > max) { setError(amountInput, TF('Your current limit is {amount}.', { amount: money(max) })); return; }
          const res = Store.applyLoan({
            typeId: t.id, typeName: t.name, rate: t.rate,
            amount: amount, months: Number(monthsSelect.value),
            purpose: form.elements.purpose.value
          });
          if (!res.ok) {
            if (res.code === 'limit') setError(amountInput, TF('Your current limit is {amount}.', { amount: money(res.limit) }));
            else setError(amountInput, T('Please check the amount and try again.'));
            return;
          }
          closeModal();
          toast(TF('Loan approved: {amount} sent to M-Pesa. Repay {monthly} a month.', {
            amount: money(res.loan.principal), monthly: money(res.loan.monthly)
          }));
          go('/dashboard');
        });
      }
    });
  }

  function openRepayModal(loanId) {
    const member = Store.current();
    if (!member) return go('/login');
    const loan = member.loans.filter(function (l) { return l.id === loanId; })[0];
    if (!loan) return;
    const dueNow = Math.min(loan.monthly, loan.outstanding);

    openModal({
      title: T('Repay loan'),
      subtitle: T(loan.typeName) + ' · ' + TF('{amount} remaining', { amount: money(loan.outstanding) }),
      body:
        '<form id="repay-form" novalidate>' +
          '<label>' + T('Amount to repay') +
            '<input type="number" name="amount" min="1" max="' + loan.outstanding + '" step="1" inputmode="numeric" value="' + dueNow + '" required>' +
          '</label>' +
          '<div class="chip-row">' +
            '<button type="button" class="chip" data-action="quick-amount" data-amount="' + dueNow + '">' + TF('This month {amount}', { amount: money(dueNow) }) + '</button>' +
            '<button type="button" class="chip" data-action="quick-amount" data-amount="' + loan.outstanding + '">' + T('Clear the loan') + '</button>' +
          '</div>' +
          '<div class="summary">' +
            '<div><span>' + T('Outstanding') + '</span><strong>' + money(loan.outstanding) + '</strong></div>' +
            '<div><span>' + T('Monthly payment') + '</span><strong>' + money(loan.monthly) + '</strong></div>' +
            '<div><span>' + T('Next due') + '</span><strong>' + fmtDate(loan.nextDue) + '</strong></div>' +
          '</div>' +
        '</form>',
      footer:
        '<button type="button" class="btn outline" data-action="modal-cancel">' + T('Cancel') + '</button>' +
        '<button type="submit" class="btn" form="repay-form">' + T('Pay with M-Pesa') + '</button>',
      onMount: function (overlay) {
        const form = $('#repay-form', overlay);
        const input = form.elements.amount;
        $$('[data-action="quick-amount"]', overlay).forEach(function (chip) {
          chip.addEventListener('click', function () { input.value = chip.getAttribute('data-amount'); });
        });
        form.addEventListener('submit', function (e) {
          e.preventDefault();
          const value = Number(input.value);
          if (!value || value < 1) { setError(input, T('Enter an amount of at least KSh 1.')); return; }
          if (value > loan.outstanding) { setError(input, TF('You can repay up to {amount}.', { amount: money(loan.outstanding) })); return; }
          mpesaPay({ amount: value, phone: Store.maskPhone(member.phone), purpose: T('Loan repayment') }).then(function (ok) {
            if (!ok) return;
            const res = Store.repayLoan(loan.id, value);
            if (res.ok) {
              toast(res.closed ? T('Loan cleared. Hongera!') : TF('{amount} paid. Thank you.', { amount: money(value) }));
              render({ scroll: false });
            }
          });
        });
      }
    });
  }

  function runAutosave() {
    const member = Store.current();
    if (!member) return;
    const amount = member.autosave.amount;
    mpesaPay({ amount: amount, phone: Store.maskPhone(member.phone), purpose: T('Daily autosave') }).then(function (ok) {
      if (!ok) return;
      const res = Store.saveTo('daily', amount);
      if (res.ok) {
        toast(TF('{amount} autosaved today.', { amount: money(amount) }));
        render({ scroll: false });
      }
    });
  }

  function confirmReset() {
    openModal({
      title: T('Reset demo data?'),
      subtitle: T('This clears your account and savings in this browser.'),
      body: '<p class="muted">' + T('Everything you created in this prototype will be deleted. You can join again or use the demo account.') + '</p>',
      footer: '<button type="button" class="btn outline" data-action="modal-cancel">' + T('Keep my data') + '</button>' +
        '<button type="button" class="btn accent" data-action="reset-confirm">' + T('Reset everything') + '</button>'
    });
  }

  /* ---------------------------------------------------------
     Global interactions
     --------------------------------------------------------- */
  document.addEventListener('click', function (e) {
    const langBtn = e.target.closest('[data-lang]');
    if (langBtn) {
      window.I18N.setLang(langBtn.getAttribute('data-lang'));
      render({ scroll: false });
      return;
    }

    const target = e.target.closest('[data-action]');
    if (!target) return;
    const action = target.getAttribute('data-action');

    switch (action) {
      case 'menu': {
        const menu = $('#menu');
        if (!menu) return;
        const open = !menu.classList.contains('open');
        menu.classList.toggle('open', open);
        target.setAttribute('aria-expanded', String(open));
        return;
      }
      case 'logout':
        Store.logout();
        toast(T('You are logged out.'));
        go('/home');
        return;
      case 'demo-login': {
        const res = Store.seedDemoMember();
        if (res.ok) {
          toast(TF('Demo account loaded. Phone 0712 345 678, PIN 1234.') );
          go('/dashboard');
        }
        return;
      }
      case 'save':
        openSaveModal(target.getAttribute('data-bucket') || 'daily');
        return;
      case 'withdraw':
        openWithdrawModal();
        return;
      case 'goal':
        openGoalModal(target.getAttribute('data-bucket') || 'locked');
        return;
      case 'run-autosave':
        runAutosave();
        return;
      case 'apply-loan':
        openLoanModal(target.getAttribute('data-from') === 'calc' ? calcState : null);
        return;
      case 'repay':
        openRepayModal(target.getAttribute('data-loan'));
        return;
      case 'quick-amount': {
        const input = target.closest('.sheet').querySelector('input[name="amount"], input[name="target"]');
        if (input) {
          input.value = target.getAttribute('data-amount');
          input.dispatchEvent(new Event('input', { bubbles: true }));
        }
        return;
      }
      case 'modal-cancel':
        closeModal();
        return;
      case 'reset-data':
        confirmReset();
        return;
      case 'reset-confirm':
        Store.reset();
        closeModal();
        toast(T('Demo data cleared.'));
        go('/home');
        return;
      default:
        return;
    }
  });

  // Close the mobile menu when a link inside it is used.
  document.addEventListener('click', function (e) {
    const link = e.target.closest('#menu a');
    if (!link) return;
    const menu = $('#menu');
    const toggle = $('.nav-toggle');
    if (menu) menu.classList.remove('open');
    if (toggle) toggle.setAttribute('aria-expanded', 'false');
  });

  // Backdrop click closes a modal.
  document.addEventListener('mousedown', function (e) {
    if (activeModal && e.target === activeModal.overlay) closeModal();
  });

  window.addEventListener('hashchange', function () {
    render({ scroll: true });
  });

  /* ---------------------------------------------------------
     Boot
     --------------------------------------------------------- */
  /* Fall back to the shipped favicon if the brand logo cannot be read
     (missing/renamed file, blocked request, offline copy without the image).
     A probe is used instead of trusting img.complete, so a lazy-loading
     footer logo that simply has not loaded yet is never swapped by mistake. */
  function bindBrandFallback() {
    const FALLBACK = 'assets/favicon.svg';
    function swap(img) {
      if (img.getAttribute('src') !== FALLBACK) img.setAttribute('src', FALLBACK);
    }
    function probe(src, onMissing) {
      const img = new Image();
      img.onerror = onMissing;
      img.src = src;
      return img;
    }
    $$('[data-brand-logo]').forEach(function (img) {
      img.addEventListener('error', function () { swap(img); });
      if (img.complete && img.naturalWidth === 0) {
        probe(img.getAttribute('src'), function () { swap(img); });
      }
    });
    const iconLink = $('[data-brand-icon]');
    if (!iconLink) return;
    probe(iconLink.getAttribute('href'), function () {
      iconLink.setAttribute('href', FALLBACK);
    });
  }

  function boot() {
    window.I18N.init();
    bindBrandFallback();
    const year = $('#year');
    if (year) year.textContent = String(new Date().getFullYear());
    if (!window.location.hash) {
      try { history.replaceState(null, '', '#/home'); } catch (e) { /* file:// */ }
    }
    render({ scroll: false });
    window.I18N.translateStatic(document.body);
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', boot);
  } else {
    boot();
  }
})();
