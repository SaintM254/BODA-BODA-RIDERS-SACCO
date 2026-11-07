/* =========================================================
   Boda Boda Sacco — demo data layer
   Everything lives in the visitor's browser (localStorage).
   No server, no real money, no personal data leaves the page.
   ========================================================= */
window.Store = (function () {
  'use strict';

  const DB_KEY = 'bbs.db.v1';
  const SESSION_KEY = 'bbs.session.v1';
  const MAX_LOAN = 200000;
  const MIN_SAVINGS_TO_BORROW = 500;
  const SAVINGS_MULTIPLIER = 3;
  const MAX_ACTIVE_LOANS = 2;
  const DIVIDEND_RATE = 0.12; // 12% a year on locked savings, for the demo

  let memory = {}; // fallback when localStorage is blocked

  function readRaw(key) {
    try { return window.localStorage.getItem(key); } catch (e) { return memory[key] || null; }
  }
  function writeRaw(key, value) {
    try { window.localStorage.setItem(key, value); } catch (e) { memory[key] = value; }
  }
  function removeRaw(key) {
    try { window.localStorage.removeItem(key); } catch (e) { delete memory[key]; }
  }

  function blankDb() {
    return { version: 1, seq: 0, members: {} };
  }

  let db = (function load() {
    const raw = readRaw(DB_KEY);
    if (raw) {
      try {
        const parsed = JSON.parse(raw);
        if (parsed && parsed.members && typeof parsed.members === 'object') return parsed;
      } catch (e) { /* corrupted store — start clean */ }
    }
    return blankDb();
  })();

  function persist() {
    writeRaw(DB_KEY, JSON.stringify(db));
  }

  /* ---------- helpers ---------- */
  function makeId(prefix) {
    return prefix + Date.now().toString(36) + Math.random().toString(36).slice(2, 6);
  }
  function nowIso() { return new Date().toISOString(); }
  function round(n) { return Math.round(Number(n) || 0); }

  function normalisePhone(phone) {
    let digits = String(phone || '').replace(/\D/g, '');
    if (digits.indexOf(getCountryCode()) === 0 && digits.length > 9) {
      // 254712345678 → 0712345678
      digits = '0' + digits.slice(getCountryCode().length);
    } else if (digits.length === 9 && /^[17]/.test(digits)) {
      // 712345678 → 0712345678
      digits = '0' + digits;
    }
    return digits;
  }
  function getCountryCode() { return '254'; }
  function isValidPhone(phone) { return /^0[17]\d{8}$/.test(normalisePhone(phone)); }

  /* Demo-only PIN hash. A real Sacco would never store PINs in a browser. */
  function hashPin(pin) {
    const str = 'bbs::' + String(pin);
    let hash = 0x811c9dc5;
    for (let i = 0; i < str.length; i++) {
      hash ^= str.charCodeAt(i);
      hash = Math.imul(hash, 0x01000193) >>> 0;
    }
    return hash.toString(16);
  }

  function maskPhone(phone) {
    const p = normalisePhone(phone);
    return p.length >= 9 ? p.slice(0, 4) + ' ' + p.slice(4, 7) + ' ' + p.slice(7) : p;
  }

  function totalSavings(member) {
    if (!member) return 0;
    return round(member.savings.daily + member.savings.locked + member.savings.bike);
  }

  function maxLoanFor(member) {
    if (!member) return 0;
    if (totalSavings(member) < MIN_SAVINGS_TO_BORROW) return 0;
    return Math.min(MAX_LOAN, totalSavings(member) * SAVINGS_MULTIPLIER);
  }

  function activeLoans(member) {
    if (!member) return [];
    return member.loans.filter(function (l) { return l.status === 'active'; });
  }

  function outstandingTotal(member) {
    return activeLoans(member).reduce(function (sum, l) { return sum + l.outstanding; }, 0);
  }

  function addTx(member, tx) {
    member.tx.unshift(Object.assign({ id: makeId('t'), ts: nowIso() }, tx));
    if (member.tx.length > 200) member.tx.length = 200;
  }

  function lastAutosaveLabel(member) {
    return member.autosave && member.autosave.lastRun ? member.autosave.lastRun : null;
  }

  /* ---------- session ---------- */
  function current() {
    const id = readRaw(SESSION_KEY);
    return id && db.members[id] ? db.members[id] : null;
  }
  function isLoggedIn() { return !!current(); }

  function login(phone, pin) {
    const p = normalisePhone(phone);
    if (!isValidPhone(p)) return { ok: false, code: 'phone' };
    if (!/^\d{4}$/.test(String(pin || ''))) return { ok: false, code: 'pin' };
    const member = Object.keys(db.members).map(function (id) { return db.members[id]; })
      .filter(function (m) { return m.phone === p; })[0];
    if (!member) return { ok: false, code: 'notfound' };
    if (member.pinHash !== hashPin(pin)) return { ok: false, code: 'wrongpin' };
    writeRaw(SESSION_KEY, member.id);
    return { ok: true, member: member };
  }

  function logout() {
    removeRaw(SESSION_KEY);
  }

  /* ---------- members ---------- */
  function createMember(data) {
    const phone = normalisePhone(data.phone);
    if (!isValidPhone(phone)) return { ok: false, code: 'phone' };
    const existing = Object.keys(db.members).map(function (id) { return db.members[id]; })
      .filter(function (m) { return m.phone === phone; })[0];
    if (existing) return { ok: false, code: 'exists' };

    db.seq = (db.seq || 0) + 1;
    const member = {
      id: makeId('m'),
      memberNo: 'BBS-' + new Date().getFullYear() + '-' + String(db.seq).padStart(4, '0'),
      name: String(data.name || '').trim(),
      phone: phone,
      idNumber: String(data.idNumber || '').trim(),
      stage: String(data.stage || '').trim(),
      pinHash: hashPin(data.pin),
      joinedAt: nowIso(),
      savings: { daily: 0, locked: 0, bike: 0 },
      goals: { locked: 20000, bike: 150000 },
      autosave: { enabled: true, amount: Number(data.dailyAmount) || 50, lastRun: null },
      tx: [],
      loans: []
    };
    db.members[member.id] = member;
    writeRaw(SESSION_KEY, member.id);
    persist();
    return { ok: true, member: member };
  }

  /* ---------- savings ---------- */
  function saveTo(bucket, amount) {
    const member = current();
    if (!member) return { ok: false, code: 'auth' };
    if (!member.savings.hasOwnProperty(bucket)) return { ok: false, code: 'bucket' };
    const value = round(amount);
    if (!value || value < 1) return { ok: false, code: 'amount' };
    if (value > 200000) return { ok: false, code: 'toolarge' };

    member.savings[bucket] += value;
    if (bucket === 'daily') {
      member.autosave.lastRun = todayKey();
    }
    addTx(member, {
      kind: 'save', bucket: bucket, amount: value,
      note: bucket === 'daily' ? 'Daily savings' : bucket === 'locked' ? 'Locked savings' : 'Bike replacement fund',
      balanceAfter: totalSavings(member)
    });
    persist();
    return { ok: true, member: member, balance: totalSavings(member) };
  }

  function withdrawDaily(amount) {
    const member = current();
    if (!member) return { ok: false, code: 'auth' };
    const value = round(amount);
    if (!value || value < 1) return { ok: false, code: 'amount' };
    if (value > member.savings.daily) return { ok: false, code: 'nofunds' };
    member.savings.daily -= value;
    addTx(member, { kind: 'withdraw', bucket: 'daily', amount: value, note: 'Withdrawal to M-Pesa', balanceAfter: totalSavings(member) });
    persist();
    return { ok: true, member: member };
  }

  function setGoal(bucket, target) {
    const member = current();
    if (!member) return { ok: false, code: 'auth' };
    if (bucket !== 'locked' && bucket !== 'bike') return { ok: false, code: 'bucket' };
    const value = round(target);
    if (value < 1000) return { ok: false, code: 'small' };
    member.goals[bucket] = value;
    persist();
    return { ok: true, member: member };
  }

  function setAutosave(patch) {
    const member = current();
    if (!member) return { ok: false, code: 'auth' };
    if (typeof patch.enabled === 'boolean') member.autosave.enabled = patch.enabled;
    if (patch.amount != null) {
      const value = round(patch.amount);
      if (value < 10 || value > 20000) return { ok: false, code: 'amount' };
      member.autosave.amount = value;
    }
    persist();
    return { ok: true, member: member };
  }

  function todayKey() { return new Date().toISOString().slice(0, 10); }
  function autosaveDue() {
    const member = current();
    if (!member || !member.autosave.enabled) return false;
    return member.autosave.lastRun !== todayKey();
  }

  /* ---------- loans ---------- */
  function quote(amount, months, rate) {
    const principal = round(amount);
    const n = Math.max(1, round(months));
    const interest = Math.round(principal * (rate / 100) * n);
    const total = principal + interest;
    return {
      principal: principal,
      months: n,
      rate: rate,
      interest: interest,
      total: total,
      monthly: Math.ceil(total / n)
    };
  }

  function dueDate(monthsAhead) {
    const d = new Date();
    d.setMonth(d.getMonth() + monthsAhead);
    return d.toISOString();
  }

  function applyLoan(data) {
    const member = current();
    if (!member) return { ok: false, code: 'auth' };
    const amount = round(data.amount);
    const months = round(data.months);
    if (!amount || amount < 1000) return { ok: false, code: 'minamount' };
    if (!months || months < 1 || months > 36) return { ok: false, code: 'months' };
    if (activeLoans(member).length >= MAX_ACTIVE_LOANS) return { ok: false, code: 'maxloans' };
    const max = maxLoanFor(member);
    if (!max) return { ok: false, code: 'nosavings' };
    if (amount > max) return { ok: false, code: 'limit', limit: max };

    const q = quote(amount, months, data.rate);
    const loan = {
      id: makeId('l'),
      typeId: data.typeId,
      typeName: data.typeName,
      purpose: String(data.purpose || '').trim(),
      principal: q.principal,
      months: q.months,
      rate: q.rate,
      interest: q.interest,
      total: q.total,
      monthly: q.monthly,
      outstanding: q.total,
      paid: 0,
      status: 'active',
      createdAt: nowIso(),
      nextDue: dueDate(1)
    };
    member.loans.unshift(loan);
    addTx(member, { kind: 'loan', amount: q.principal, note: 'Loan disbursed' });
    persist();
    return { ok: true, member: member, loan: loan };
  }

  function repayLoan(loanId, amount) {
    const member = current();
    if (!member) return { ok: false, code: 'auth' };
    const loan = member.loans.filter(function (l) { return l.id === loanId; })[0];
    if (!loan) return { ok: false, code: 'notfound' };
    if (loan.status !== 'active') return { ok: false, code: 'closed' };
    const value = round(amount);
    if (!value || value < 1) return { ok: false, code: 'amount' };
    if (value > loan.outstanding) return { ok: false, code: 'over' };

    loan.outstanding -= value;
    loan.paid += value;
    if (loan.outstanding <= 0) {
      loan.outstanding = 0;
      loan.status = 'closed';
      loan.closedAt = nowIso();
    } else {
      const remaining = Math.ceil(loan.outstanding / loan.monthly);
      loan.nextDue = dueDate(Math.max(1, remaining));
    }
    addTx(member, { kind: 'repay', amount: value, note: 'Loan repayment' });
    persist();
    return { ok: true, member: member, loan: loan, closed: loan.status === 'closed' };
  }

  /* ---------- demo ---------- */
  function seedDemoMember() {
    const phone = '0712345678';
    const existing = Object.keys(db.members).map(function (id) { return db.members[id]; })
      .filter(function (m) { return m.phone === phone; })[0];

    let member = existing;
    if (!member) {
      const res = createMember({
        name: 'John Kamau', phone: phone, idNumber: '28473651',
        stage: 'Githurai 45', dailyAmount: 100, pin: '1234'
      });
      if (!res.ok) return res;
      member = res.member;
    }

    // A believable 45 days of saving, then one active repairs loan.
    if (!member.tx.length) {
      member.savings = { daily: 2400, locked: 6000, bike: 3500 };
      member.goals = { locked: 30000, bike: 150000 };
      member.joinedAt = new Date(Date.now() - 70 * 864e5).toISOString();
      const history = [
        { kind: 'save', bucket: 'locked', amount: 6000, note: 'Locked savings', days: 38 },
        { kind: 'save', bucket: 'bike', amount: 3500, note: 'Bike replacement fund', days: 21 },
        { kind: 'save', bucket: 'daily', amount: 100, note: 'Daily savings', days: 2 },
        { kind: 'save', bucket: 'daily', amount: 100, note: 'Daily savings', days: 1 },
        { kind: 'save', bucket: 'daily', amount: 100, note: 'Daily savings', days: 0 }
      ];
      history.forEach(function (h) {
        member.tx.push({
          id: makeId('t'),
          ts: new Date(Date.now() - h.days * 864e5).toISOString(),
          kind: h.kind, bucket: h.bucket, amount: h.amount, note: h.note,
          balanceAfter: member.savings.daily + member.savings.locked + member.savings.bike
        });
      });
      member.tx.sort(function (a, b) { return a.ts < b.ts ? 1 : -1; });
      member.autosave.lastRun = todayKey();

      const q = quote(15000, 6, 1.2);
      member.loans.push({
        id: makeId('l'),
        typeId: 'repairs',
        typeName: 'Spare parts and repairs',
        purpose: 'Engine overhaul',
        principal: q.principal, months: q.months, rate: q.rate,
        interest: q.interest, total: q.total, monthly: q.monthly,
        outstanding: q.total - q.monthly * 2, paid: q.monthly * 2,
        status: 'active',
        createdAt: new Date(Date.now() - 65 * 864e5).toISOString(),
        nextDue: dueDate(1)
      });
      member.tx.unshift({
        id: makeId('t'),
        ts: new Date(Date.now() - 64 * 864e5).toISOString(),
        kind: 'loan', amount: q.principal, note: 'Loan disbursed'
      });
      persist();
    }
    writeRaw(SESSION_KEY, member.id);
    return { ok: true, member: member };
  }

  function reset() {
    db = blankDb();
    persist();
    removeRaw(SESSION_KEY);
    try { window.localStorage.removeItem(DB_KEY); } catch (e) {}
  }

  /* ---------- exports ---------- */
  return {
    MAX_LOAN: MAX_LOAN,
    MIN_SAVINGS_TO_BORROW: MIN_SAVINGS_TO_BORROW,
    SAVINGS_MULTIPLIER: SAVINGS_MULTIPLIER,
    DIVIDEND_RATE: DIVIDEND_RATE,
    isValidPhone: isValidPhone,
    isValidPin: function (pin) { return /^\d{4}$/.test(String(pin || '')); },
    normalisePhone: normalisePhone,
    maskPhone: maskPhone,
    current: current,
    isLoggedIn: isLoggedIn,
    login: login,
    logout: logout,
    createMember: createMember,
    totalSavings: totalSavings,
    maxLoanFor: maxLoanFor,
    activeLoans: activeLoans,
    outstandingTotal: outstandingTotal,
    saveTo: saveTo,
    withdrawDaily: withdrawDaily,
    setGoal: setGoal,
    setAutosave: setAutosave,
    autosaveDue: autosaveDue,
    todayKey: todayKey,
    lastAutosaveLabel: lastAutosaveLabel,
    quote: quote,
    applyLoan: applyLoan,
    repayLoan: repayLoan,
    seedDemoMember: seedDemoMember,
    reset: reset
  };
})();
