if (!window.HH || typeof window.HH.paymentOf !== 'function') {
  // Stale cached store.js detected — force a fresh load once.
  if (!sessionStorage.getItem('hh_reloaded')) { sessionStorage.setItem('hh_reloaded', '1'); location.reload(true); }
} else { sessionStorage.removeItem('hh_reloaded'); }
/* ==========================================================================
   Heaven Haven Campsite — Admin / Owner dashboard
   ========================================================================== */
(function () {
  const $ = (s, el = document) => el.querySelector(s);
  const $$ = (s, el = document) => [...el.querySelectorAll(s)];
  const H = window.HH;

  /* ---------- session guard ---------- */
  let session = null;
  try { session = JSON.parse(sessionStorage.getItem('hh_session')); } catch (e) { /* ignore */ }
  if (!session || !session.role) { window.location.replace('index.html#login'); return; }
  const isOwner = session.role === 'owner';

  $('#userName').textContent = session.name;
  $('#userRole').textContent = session.role;
  $('#userAvatar').textContent = session.name[0].toUpperCase();
  $('#roleBadge').textContent = isOwner ? 'Owner' : 'Admin';
  $('#roleBadge').classList.toggle('owner', isOwner);
  $('#logoutBtn').addEventListener('click', () => { sessionStorage.removeItem('hh_session'); window.location.href = 'index.html'; });
  $('#menuBtn').addEventListener('click', () => $('#side').classList.toggle('open'));
  $('#resetBtn').addEventListener('click', () => { if (confirm('Restore the sample data? Bookings made on the website will be removed.')) { H.reset(); render(); toast('Demo data restored.'); } });

  /* ---------- icons ---------- */
  const I = {
    home: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round"><path d="M3 11 12 3l9 8"/><path d="M5 10v10h14V10"/></svg>',
    bed: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round"><path d="M3 18V8M3 12h18v6M3 16h18"/><path d="M6 12V9.5A1.5 1.5 0 0 1 7.5 8h3A1.5 1.5 0 0 1 12 9.5V12"/></svg>',
    cal: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round"><rect x="3" y="5" width="18" height="16" rx="2"/><path d="M8 3v4M16 3v4M3 10h18"/></svg>',
    box: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round"><path d="m3 8 9-5 9 5v8l-9 5-9-5z"/><path d="m3 8 9 5 9-5M12 13v8"/></svg>',
    chart: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round"><path d="M4 20V10M10 20V4M16 20v-7M22 20H2"/></svg>',
    trend: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round"><path d="m3 17 6-6 4 4 8-8"/><path d="M14 7h7v7"/></svg>',
    receipt: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round"><path d="M5 3h14v18l-3-2-2 2-2-2-2 2-2-2-3 2z"/><path d="M9 8h6M9 12h6M9 16h4"/></svg>',
    users: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round"><circle cx="9" cy="8" r="3.5"/><path d="M2.5 20a6.5 6.5 0 0 1 13 0"/><path d="M16 4.5a3.5 3.5 0 0 1 0 7"/><path d="M17.5 14a6.5 6.5 0 0 1 4 6"/></svg>',
    edit: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round"><path d="M4 20h4l10-10-4-4L4 16z"/><path d="m12.5 7.5 4 4"/></svg>',
    trash: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round"><path d="M4 7h16M9 7V4h6v3M6 7l1 13h10l1-13"/></svg>',
  };

  const STATUS = {
    available: { label: 'Available', color: '#3f9a52', desc: 'Vacant & open for booking' },
    occupied: { label: 'Not Available', color: '#c0392b', desc: 'Occupied or blocked' },
    cleaning: { label: 'For Cleaning', color: '#d99a06', desc: 'Awaiting housekeeping' },
    ready: { label: 'Ready', color: '#2b6cb0', desc: 'Cleaned & set up for arrival' },
  };
  const BSTATUS = { confirmed: 'Confirmed', checked_in: 'Checked-in', checked_out: 'Checked-out', cancelled: 'Cancelled' };

  /* ---------- navigation ---------- */
  const VIEWS = [
    { id: 'overview', label: 'Overview', icon: I.home, title: 'Overview', sub: () => `Today is ${new Date().toLocaleDateString('en-PH', { weekday: 'long', month: 'long', day: 'numeric', year: 'numeric' })}` },
    { id: 'rooms', label: 'Rooms', icon: I.bed, title: 'Room Status Board', sub: () => 'Available · Not available · For cleaning · Ready' },
    { id: 'bookings', label: 'Bookings', icon: I.cal, title: 'Bookings', sub: () => 'Website and walk-in reservations' },
    { id: 'inventory', label: 'Inventory', icon: I.box, title: 'Inventory', sub: () => isOwner ? 'Stock levels · admin requests · deductions log' : 'Stock levels — file a request to restock or log usage; the owner approves' },
    { group: 'Owner' },
    { id: 'sales', label: 'Monthly Sales', icon: I.chart, owner: true, title: 'Monthly Sales', sub: () => 'Last 12 months of room sales' },
    { id: 'finance', label: 'Revenue & Profit', icon: I.trend, owner: true, title: 'Revenue & Profit', sub: () => 'Revenue vs. expenses' },
    { id: 'expenses', label: 'Expenses', icon: I.receipt, owner: true, title: 'Expenses', sub: () => 'Operating costs by category' },
    { id: 'employees', label: 'Employees & Salary', icon: I.users, owner: true, title: 'Employees & Salary', sub: () => 'Attendance and payroll for Mark, May and Vincent' },
  ];
  let current = location.hash.replace('#', '') || 'overview';
  if (!VIEWS.find(v => v.id === current && (!v.owner || isOwner))) current = 'overview';
  const uiState = { roomFilter: 'all', bookingFilter: 'all', bookingSearch: '', expMonth: H.monthKey(new Date()), empMonth: H.monthKey(new Date()) };

  function renderNav() {
    const counts = H.statusCounts();
    $('#sideNav').innerHTML = VIEWS.filter(v => isOwner || (!v.owner && !v.group)).map(v => v.group ? `<div class="side-group">${v.group}</div>` :
      `<a data-view="${v.id}" class="${v.id === current ? 'active' : ''}">${v.icon}${v.label}${v.id === 'rooms' ? `<span class="count">${counts.cleaning} to clean</span>` : ''}${v.id === 'bookings' ? (n => n ? `<span class="count">${n} to verify</span>` : '')(H.load().bookings.filter(b => H.paymentOf(b).status === 'verifying').length) : ''}${v.id === 'inventory' ? (n => n ? `<span class="count">${n} ${isOwner ? 'to approve' : 'pending'}</span>` : '')(H.stockRequests(r => r.status === 'pending').length) : ''}</a>`).join('');
    $$('#sideNav a').forEach(a => a.addEventListener('click', () => { current = a.dataset.view; location.hash = current; $('#side').classList.remove('open'); render(); }));
  }
  const canView = id => !!VIEWS.find(x => x.id === id && (!x.owner || isOwner));
  window.addEventListener('hashchange', () => { const v = location.hash.replace('#', ''); if (v && v !== current) { current = canView(v) ? v : 'overview'; if (!canView(v)) { toast('That section is for the owner account.'); location.hash = current; } render(); } });

  function render() {
    renderNav();
    const v = VIEWS.find(x => x.id === current);
    $('#pageTitle').textContent = v.title; $('#pageSub').textContent = v.sub();
    ({ overview, rooms, bookings, inventory, sales, finance, expenses, employees })[current]();
    window.scrollTo({ top: 0 });
  }

  /* ---------- helpers ---------- */
  let toastTimer;
  function toast(msg) { const t = $('#toast'); t.textContent = msg; t.classList.add('show'); clearTimeout(toastTimer); toastTimer = setTimeout(() => t.classList.remove('show'), 3000); }
  const pill = (s, label) => `<span class="pill ${s}">${label || STATUS[s]?.label || BSTATUS[s] || s}</span>`;
  const PAY_LABEL = { unpaid: 'Unpaid', verifying: 'For verification', paid: 'Paid' };
  const payPill = b => { const p = H.paymentOf(b); return `<span class="pill pay-${p.status}">${PAY_LABEL[p.status] || p.status}</span>`; };
  const nights = b => H.nightsBetween(b.checkIn, b.checkOut);
  const pct = (a, b) => b ? Math.round(a / b * 100) : 0;
  const initials = n => n.split(' ').filter(Boolean).slice(0, 2).map(x => x[0]).join('').toUpperCase();
  const monthOptions = (sel) => { const out = []; const now = new Date(); for (let i = 0; i < 12; i++) { const d = new Date(now.getFullYear(), now.getMonth() - i, 1); const k = H.monthKey(d); out.push(`<option value="${k}" ${k === sel ? 'selected' : ''}>${H.monthLabel(k)}</option>`); } return out.join(''); };

  /* ---------- charts (pure SVG) ---------- */
  function barChart(opts) {
    const { labels, series, height = 260, money = true } = opts; const W = 900, Hh = height, padL = 64, padR = 16, padT = 18, padB = 40;
    const max = Math.max(...series.flatMap(s => s.values)) * 1.15 || 1;
    const cw = (W - padL - padR) / labels.length; const bw = (cw * .72) / series.length;
    const y = v => padT + (Hh - padT - padB) * (1 - v / max);
    const fmt = v => money ? (v >= 1000 ? '₱' + Math.round(v / 1000) + 'k' : '₱' + v) : v;
    let g = '';
    for (let i = 0; i <= 4; i++) { const v = max / 4 * i; g += `<line x1="${padL}" x2="${W - padR}" y1="${y(v)}" y2="${y(v)}" stroke="#e1f0d9"/><text x="${padL - 8}" y="${y(v) + 4}" text-anchor="end" font-size="11" fill="#5b6d5e">${fmt(v)}</text>`; }
    labels.forEach((l, i) => {
      const x0 = padL + i * cw + (cw - bw * series.length) / 2;
      series.forEach((s, j) => { const v = s.values[i]; const h = y(0) - y(v); g += `<rect x="${x0 + j * bw}" y="${y(v)}" width="${bw - 2}" height="${h}" rx="4" fill="${s.color}" opacity="${opts.highlight === i ? 1 : .88}"><title>${l} — ${s.name}: ${money ? H.peso(v) : v}</title></rect>`; });
      g += `<text x="${padL + i * cw + cw / 2}" y="${Hh - padB + 18}" text-anchor="middle" font-size="11" fill="#5b6d5e" font-weight="${opts.highlight === i ? 800 : 600}">${l}</text>`;
    });
    if (opts.line) { const pts = opts.line.values.map((v, i) => `${padL + i * cw + cw / 2},${y(Math.max(0, v))}`).join(' '); g += `<polyline points="${pts}" fill="none" stroke="${opts.line.color}" stroke-width="3" stroke-linejoin="round"/>` + opts.line.values.map((v, i) => `<circle cx="${padL + i * cw + cw / 2}" cy="${y(Math.max(0, v))}" r="4.5" fill="#fff" stroke="${opts.line.color}" stroke-width="3"><title>${labels[i]} — ${opts.line.name}: ${H.peso(v)}</title></circle>`).join(''); }
    return `<svg class="chart" viewBox="0 0 ${W} ${Hh}" role="img">${g}</svg>`;
  }
  function donut(items) {
    const total = items.reduce((a, b) => a + b.value, 0) || 1; let acc = 0; const R = 70, C = 2 * Math.PI * R;
    const segs = items.map(it => { const len = it.value / total * C; const s = `<circle r="${R}" cx="90" cy="90" fill="none" stroke="${it.color}" stroke-width="28" stroke-dasharray="${len} ${C - len}" stroke-dashoffset="${-acc}" transform="rotate(-90 90 90)"><title>${it.label}: ${H.peso(it.value)} (${pct(it.value, total)}%)</title></circle>`; acc += len; return s; }).join('');
    return `<svg viewBox="0 0 180 180" width="180" height="180">${segs}<text x="90" y="86" text-anchor="middle" font-size="12" fill="#5b6d5e" font-weight="700">TOTAL</text><text x="90" y="106" text-anchor="middle" font-size="16" font-weight="800" fill="#0c3319">${H.peso(total)}</text></svg>`;
  }
  const CAT_COLORS = { 'Salaries': '#14532d', 'Utilities': '#3f9a52', 'Supplies': '#8fd19a', 'Maintenance': '#d99a06', 'Food & Beverage': '#2b6cb0', 'Marketing': '#c0392b', 'Transport': '#7b1fa2', 'Misc': '#78857a' };

  /* ======================================================================
     OVERVIEW
     ====================================================================== */
  function overview() {
    const S = H.load(); const T = H.today(); const c = H.statusCounts(); const total = S.units.length;
    const arrivals = S.bookings.filter(b => b.status === 'confirmed' && b.checkIn === T);
    const departures = S.bookings.filter(b => (b.status === 'checked_in' && b.checkOut === T) || (b.status === 'checked_out' && b.checkOut === T));
    const inhouse = S.bookings.filter(b => b.status === 'checked_in');
    const guests = inhouse.reduce((a, b) => a + b.adults + b.children, 0);
    const recent = [...S.bookings].sort((a, b) => (b.createdAt > a.createdAt ? 1 : -1)).slice(0, 6);
    let ownerKpis = '';
    if (isOwner) {
      const sales = H.monthlySales(); const cur = sales[sales.length - 1], prev = sales[sales.length - 2]; const exp = H.expensesByMonth()[cur.month] || 0; const profit = cur.amount - exp;
      const ch = pct(cur.amount - prev.amount, prev.amount);
      ownerKpis = `<div class="kpis">
        <div class="kpi" style="--c:var(--royal)"><small>Sales · ${H.monthLabel(cur.month)}</small><b>${H.peso(cur.amount)}</b><span>${cur.bookings} bookings · ${cur.nights} room-nights</span></div>
        <div class="kpi" style="--c:var(--rose)"><small>Expenses · month to date</small><b>${H.peso(exp)}</b><span>${S.expenses.filter(e => e.date.startsWith(cur.month)).length} entries</span></div>
        <div class="kpi" style="--c:${profit >= 0 ? 'var(--leaf)' : 'var(--rose)'}"><small>Net profit · month to date</small><b>${H.peso(profit)}</b><span>${pct(profit, cur.amount)}% margin</span></div>
        <div class="kpi" style="--c:var(--amber)"><small>vs. last month (full)</small><b class="trend ${ch >= 0 ? 'up' : 'down'}">${ch >= 0 ? '▲' : '▼'} ${Math.abs(ch)}%</b><span>Last month: ${H.peso(prev.amount)}</span></div>
      </div>`;
    }
    $('#view').innerHTML = `
      <div class="kpis">
        ${Object.entries(STATUS).map(([k, s]) => `<div class="kpi clickable" style="--c:${s.color}" data-goto="${k}"><small>${s.label} rooms</small><b>${c[k]}</b><span>${s.desc} · ${pct(c[k], total)}% of ${total}</span><div class="bar"><i style="width:${pct(c[k], total)}%"></i></div></div>`).join('')}
      </div>
      ${ownerKpis}
      <div class="two-col">
        <div class="panel"><div class="panel-head"><h3>Arriving today</h3><span class="pill ready">${arrivals.length} arrival${arrivals.length === 1 ? '' : 's'}</span></div>
          ${arrivals.length ? `<ul class="mini-list">${arrivals.map(b => `<li><div class="avatar">${initials(b.guest.name)}</div><div><b>${b.guest.name}</b><br><span class="muted">${H.type(b.typeId).name} · Unit ${b.unit} · ${b.adults + b.children} pax</span></div><div class="right">${pill(H.unit(b.unit).status)} ${payPill(b)}<br><button class="btn btn-primary btn-sm" style="margin-top:.4rem" data-checkin="${b.ref}">Check in</button></div></li>`).join('')}</ul>` : '<div class="empty">No arrivals scheduled today.</div>'}
        </div>
        <div class="panel"><div class="panel-head"><h3>Departing today</h3><span class="pill cleaning">${departures.length} departure${departures.length === 1 ? '' : 's'}</span></div>
          ${departures.length ? `<ul class="mini-list">${departures.map(b => `<li><div class="avatar">${initials(b.guest.name)}</div><div><b>${b.guest.name}</b><br><span class="muted">${H.type(b.typeId).name} · Unit ${b.unit}</span></div><div class="right">${pill(b.status)}<br>${b.status === 'checked_in' ? `<button class="btn btn-soft btn-sm" style="margin-top:.4rem" data-checkout="${b.ref}">Check out</button>` : '<span class="muted" style="font-size:.75rem">Unit for cleaning</span>'}</div></li>`).join('')}</ul>` : '<div class="empty">No departures today.</div>'}
        </div>
      </div>
      <div class="three-col">
        <div class="panel"><div class="panel-head"><h3>Recent bookings</h3><a class="btn btn-soft btn-sm" data-view-link="bookings">View all</a></div>
          <div class="table-wrap"><table class="tbl"><thead><tr><th>Ref</th><th>Guest</th><th>Room</th><th>Dates</th><th class="num">Total</th><th>Payment</th><th>Status</th></tr></thead><tbody>
          ${recent.map(b => `<tr><td class="mono">${b.ref}</td><td><b>${b.guest.name}</b><br><span class="muted">${b.source}</span></td><td>${H.type(b.typeId).name}<br><span class="muted">Unit ${b.unit}</span></td><td>${H.fmtShort(b.checkIn)} → ${H.fmtShort(b.checkOut)}<br><span class="muted">${nights(b)} night${nights(b) > 1 ? 's' : ''}</span></td><td class="num">${H.peso(b.total)}</td><td>${payPill(b)}${H.paymentOf(b).status === 'verifying' ? `<br><button class="btn btn-soft btn-sm" style="margin-top:.3rem;padding:.3rem .6rem;font-size:.72rem" data-receipt="${b.ref}">View receipt</button>` : ''}</td><td>${pill(b.status)}</td></tr>`).join('')}
          </tbody></table></div>
        </div>
        <div>
          <div class="panel"><div class="panel-head"><h3>Tonight</h3></div>
            <div class="kpi" style="--c:var(--royal);margin-bottom:.8rem"><small>Occupancy</small><b>${pct(c.occupied + c.ready, total)}%</b><span>${c.occupied + c.ready} of ${total} units in use or reserved</span><div class="bar"><i style="width:${pct(c.occupied + c.ready, total)}%"></i></div></div>
            <div class="kpi" style="--c:var(--leaf)"><small>Guests in-house</small><b>${guests}</b><span>${inhouse.length} active stays</span></div>
          </div>
          <div class="panel"><div class="panel-head"><h3>Payments to verify</h3><span class="pill pay-verifying">${S.bookings.filter(b => H.paymentOf(b).status === 'verifying').length}</span></div>
            ${S.bookings.filter(b => H.paymentOf(b).status === 'verifying').length ? `<ul class="mini-list">${S.bookings.filter(b => H.paymentOf(b).status === 'verifying').slice(0, 4).map(b => `<li><div><b>${b.guest.name}</b><br><span class="muted">${b.ref} · ${H.peso(H.paymentOf(b).amount)} GCash</span></div><button class="btn btn-soft btn-sm right" data-receipt="${b.ref}">Review</button></li>`).join('')}</ul>` : '<div class="empty">No receipts waiting for review.</div>'}
          </div>
          ${(p => p.length || isOwner ? `<div class="panel"><div class="panel-head"><h3>${isOwner ? 'Stock requests to approve' : 'My stock requests'}</h3><span class="pill pay-verifying">${p.length} pending</span></div>
            ${p.length ? `<ul class="mini-list">${p.slice(0, 4).map(r => `<li><div><b>${(S.inventory.find(i => i.id === r.itemId) || { item: '?' }).item}</b><br><span class="muted">${r.type === 'add' ? 'Restock +' : 'Deduct −'}${r.qty} · ${r.by}</span></div>${isOwner ? `<button class="btn btn-primary btn-sm right" data-view-link="inventory">Review</button>` : '<span class="pill pay-verifying right">Pending</span>'}</li>`).join('')}</ul>${p.length > 4 ? `<a class="btn btn-soft btn-sm" style="margin-top:.6rem" data-view-link="inventory">See all ${p.length} in Inventory</a>` : ''}` : '<div class="empty">No stock requests waiting.</div>'}
          </div>` : '')(S.stockRequests.filter(r => r.status === 'pending'))}
          <div class="panel"><div class="panel-head"><h3>Housekeeping queue</h3></div>
            ${c.cleaning ? `<ul class="mini-list">${S.units.filter(u => u.status === 'cleaning').map(u => `<li><b>${u.code}</b><span class="muted">${H.type(u.typeId).name}</span><button class="btn btn-primary btn-sm right" data-clean="${u.code}">Mark cleaned</button></li>`).join('')}</ul>` : '<div class="empty">All caught up — nothing to clean.</div>'}
          </div>
        </div>
      </div>`;
    $$('[data-goto]').forEach(k => k.addEventListener('click', () => { uiState.roomFilter = k.dataset.goto; current = 'rooms'; location.hash = 'rooms'; render(); }));
    $$('[data-view-link]').forEach(a => a.addEventListener('click', () => { current = a.dataset.viewLink; location.hash = current; render(); }));

    bindBookingActions();
    $$('[data-clean]').forEach(b => b.addEventListener('click', () => { H.setUnitStatus(b.dataset.clean, 'available', ''); toast(`${b.dataset.clean} marked as cleaned & available.`); render(); }));
  }

  function bindBookingActions() {
    $$('[data-checkin]').forEach(b => b.addEventListener('click', () => { const bk = H.checkIn(b.dataset.checkin); toast(`${bk.guest.name} checked in to ${bk.unit}.`); render(); }));
    $$('[data-checkout]').forEach(b => b.addEventListener('click', () => { const bk = H.checkOut(b.dataset.checkout); toast(`${bk.guest.name} checked out — ${bk.unit} is now for cleaning.`); render(); }));
    $$('[data-cancel]').forEach(b => b.addEventListener('click', () => { if (confirm('Cancel this booking?')) { H.cancel(b.dataset.cancel); toast('Booking cancelled.'); render(); } }));
    $$('[data-markpaid]').forEach(b => b.addEventListener('click', () => {
      const cur = H.load().bookings.find(x => x.ref === b.dataset.markpaid); const p = H.paymentOf(cur);
      const extra = p.status === 'unpaid' ? { method: cur.source === 'walk-in' ? 'cash' : 'gcash', amount: p.amount || Math.round(cur.total * H.DOWNPAYMENT) } : {};
      const bk = H.setPaymentStatus(b.dataset.markpaid, 'paid', extra); toast(`${bk.ref} marked as paid.`); render();
    }));
    $$('[data-receipt]').forEach(b => b.addEventListener('click', () => openReceipt(b.dataset.receipt)));
  }

  function openReceipt(ref) {
    const b = H.load().bookings.find(x => x.ref === ref); const p = H.paymentOf(b);
    $('#receiptBody').innerHTML = `
      <div class="sum-row"><span class="muted">Booking</span><b>${b.ref} · ${b.guest.name}</b></div>
      <div class="sum-row"><span class="muted">Amount sent</span><b>${H.peso(p.amount)} via ${(p.method || 'gcash').toUpperCase()}</b></div>
      <div class="sum-row"><span class="muted">GCash ref no.</span><b>${p.gcashRef || '—'}</b></div>
      <div class="sum-row"><span class="muted">Uploaded</span><b>${p.uploadedAt ? new Date(p.uploadedAt).toLocaleString('en-PH', { month: 'short', day: 'numeric', hour: 'numeric', minute: '2-digit' }) : '—'}</b></div>
      <div class="sum-row"><span class="muted">Downpayment due</span><b>${H.peso(b.total * H.DOWNPAYMENT)}</b></div>
      <div style="margin:1rem 0;border-radius:14px;overflow:hidden;border:1.5px solid var(--line);background:var(--light)">
        ${p.receipt ? `<img src="${p.receipt}" alt="Uploaded receipt" style="width:100%;max-height:46vh;object-fit:contain;display:block;background:#f4f7f5">` : `<div class="empty" style="border:0">${p.receiptName ? p.receiptName + ' — ' : ''}Receipt image not stored in this demo record.</div>`}
      </div>
      <div style="display:flex;gap:.7rem;justify-content:flex-end;flex-wrap:wrap">
        <button class="btn btn-danger btn-sm" id="rcReject">Reject — ask to resend</button>
        <button class="btn btn-primary" id="rcApprove">Approve & mark paid</button>
      </div>`;
    openModal('#receiptModal');
    $('#rcApprove').addEventListener('click', () => { H.setPaymentStatus(ref, 'paid'); closeModal('#receiptModal'); toast(`${ref} marked as paid.`); render(); });
    $('#rcReject').addEventListener('click', () => { H.setPaymentStatus(ref, 'unpaid', { receipt: '', receiptName: '', gcashRef: '' }); closeModal('#receiptModal'); toast('Receipt rejected — guest will be asked to resend.'); render(); });
  }

  /* ======================================================================
     ROOMS
     ====================================================================== */
  function rooms() {
    const S = H.load(); const c = H.statusCounts(); const T = H.today();
    const f = uiState.roomFilter;
    $('#view').innerHTML = `
      <div class="kpis">${Object.entries(STATUS).map(([k, s]) => `<div class="kpi clickable ${f === k ? 'active' : ''}" style="--c:${s.color}" data-filter="${k}"><small>${s.label}</small><b>${c[k]}</b><span>${s.desc}</span></div>`).join('')}</div>
      <div class="panel">
        <div class="panel-head">
          <div class="chips">${[['all', `All units <i>${S.units.length}</i>`], ...Object.entries(STATUS).map(([k, s]) => [k, `${s.label} <i>${c[k]}</i>`])].map(([k, l]) => `<button class="chip ${f === k ? 'active' : ''}" data-filter="${k}">${l}</button>`).join('')}</div>
          <p>Change a unit's status with the dropdown. Check-ins and check-outs update it automatically.</p>
        </div>
        ${H.ROOM_TYPES.map(t => {
          const units = S.units.filter(u => u.typeId === t.id && (f === 'all' || u.status === f));
          if (!units.length) return '';
          return `<div class="room-group"><h4>${t.name} <small>· ${units.length} unit${units.length > 1 ? 's' : ''} · ${H.peso(t.rate)}/night</small></h4><div class="unit-grid">
            ${units.map(u => {
              const b = H.unitBooking(u.code); const nb = !b && H.nextBooking(u.code);
              return `<div class="unit ${u.status}">
                <div class="unit-top"><span class="unit-code">${u.code}</span>${pill(u.status)}</div>
                <div class="unit-guest">${b ? `<b>${b.guest.name}</b><span class="muted">${H.fmtShort(b.checkIn)} → ${H.fmtShort(b.checkOut)} · ${b.adults + b.children} pax</span>` : nb ? `<span class="muted">Next: <b style="display:inline">${nb.guest.name}</b> on ${H.fmtShort(nb.checkIn)}</span>` : '<span class="muted">No guest assigned</span>'}</div>
                <div class="unit-note">${u.note ? '“' + u.note + '”' : ''}</div>
                <div class="unit-actions">
                  <select data-unit="${u.code}">${Object.entries(STATUS).map(([k, s]) => `<option value="${k}" ${u.status === k ? 'selected' : ''}>${s.label}</option>`).join('')}</select>
                  <button class="icon-btn" title="Edit note" data-note="${u.code}">${I.edit}</button>
                </div>
                ${b && b.status === 'confirmed' && b.checkIn <= T ? `<button class="btn btn-primary btn-sm btn-block" style="margin-top:.6rem" data-checkin="${b.ref}">Check in ${b.guest.name.split(' ')[0]}</button>` : ''}
                ${b && b.status === 'checked_in' ? `<button class="btn btn-soft btn-sm btn-block" style="margin-top:.6rem" data-checkout="${b.ref}">Check out</button>` : ''}
                ${u.status === 'cleaning' ? `<button class="btn btn-primary btn-sm btn-block" style="margin-top:.6rem" data-clean="${u.code}">Mark cleaned → Available</button>` : ''}
              </div>`;
            }).join('')}</div></div>`;
        }).join('') || '<div class="empty">No units match this filter.</div>'}
      </div>`;
    $$('[data-filter]').forEach(el => el.addEventListener('click', () => { uiState.roomFilter = el.dataset.filter; rooms(); }));
    $$('select[data-unit]').forEach(s => s.addEventListener('change', () => { H.setUnitStatus(s.dataset.unit, s.value); toast(`${s.dataset.unit} → ${STATUS[s.value].label}`); render(); }));
    $$('[data-note]').forEach(b => b.addEventListener('click', () => { const u = H.unit(b.dataset.note); const n = prompt(`Note for ${u.code}:`, u.note || ''); if (n !== null) { H.setUnitStatus(u.code, u.status, n.trim()); rooms(); } }));
    $$('[data-clean]').forEach(b => b.addEventListener('click', () => { H.setUnitStatus(b.dataset.clean, 'available', ''); toast(`${b.dataset.clean} is clean and available.`); render(); }));
    bindBookingActions();
  }

  /* ======================================================================
     BOOKINGS
     ====================================================================== */
  function bookings() {
    const S = H.load(); const T = H.today(); const q = uiState.bookingSearch.toLowerCase(); const f = uiState.bookingFilter;
    let list = [...S.bookings].sort((a, b) => a.checkIn < b.checkIn ? 1 : -1);
    const filters = {
      all: () => true, upcoming: b => b.status === 'confirmed' && b.checkIn > T, today: b => b.status === 'confirmed' && b.checkIn === T,
      inhouse: b => b.status === 'checked_in', completed: b => b.status === 'checked_out', cancelled: b => b.status === 'cancelled',
      verify: b => H.paymentOf(b).status === 'verifying', unpaid: b => H.paymentOf(b).status === 'unpaid' && b.status === 'confirmed',
    };
    list = list.filter(filters[f]).filter(b => !q || [b.ref, b.guest.name, b.guest.phone, b.unit, H.type(b.typeId).name].join(' ').toLowerCase().includes(q));
    const revenue = list.filter(b => b.status !== 'cancelled').reduce((a, b) => a + b.total, 0);
    $('#view').innerHTML = `
      <div class="panel">
        <div class="panel-head">
          <div class="toolbar">
            <input id="bSearch" placeholder="Search guest, ref, unit…" value="${uiState.bookingSearch}">
            <select id="bFilter">${[['all', 'All bookings'], ['today', 'Arriving today'], ['upcoming', 'Upcoming'], ['inhouse', 'In-house'], ['verify', 'Payment to verify'], ['unpaid', 'Unpaid'], ['completed', 'Completed'], ['cancelled', 'Cancelled']].map(([k, l]) => `<option value="${k}" ${f === k ? 'selected' : ''}>${l}</option>`).join('')}</select>
            <span class="muted" style="font-size:.85rem">${list.length} booking${list.length === 1 ? '' : 's'} · ${H.peso(revenue)}</span>
          </div>
          <button class="btn btn-primary btn-sm" id="walkinBtn">+ Walk-in booking</button>
        </div>
        <div class="table-wrap"><table class="tbl bookings-tbl"><thead><tr><th>Ref</th><th>Guest</th><th>Accommodation</th><th>Stay</th><th class="num">Pax</th><th class="num">Total</th><th>Payment</th><th>Status</th><th>Actions</th></tr></thead><tbody>
        ${list.map(b => `<tr>
          <td class="mono nowrap">${b.ref}<br><span class="muted" style="font-family:var(--font-body);font-size:.75rem">${b.createdAt ? 'booked ' + H.fmtShort(b.createdAt) + ' · ' : ''}${b.source === 'website' ? 'Website' : 'Walk-in'}</span></td>
          <td><b>${b.guest.name}</b><br><span class="muted nowrap">${b.guest.phone}</span>${b.requests ? `<br><span class="muted" style="font-style:italic">“${b.requests}”</span>` : ''}</td>
          <td>${H.type(b.typeId).name}<br><span class="muted">Unit ${b.unit}</span></td>
          <td class="nowrap">${H.fmtShort(b.checkIn)} → ${H.fmtShort(b.checkOut)}<br><span class="muted">${nights(b)} night${nights(b) > 1 ? 's' : ''} · ${H.fmtDate(b.checkIn, { year: 'numeric' })}</span></td>
          <td class="num nowrap">${b.adults}${b.children ? ` + ${b.children}` : ''}</td><td class="num nowrap"><b>${H.peso(b.total)}</b></td>
          <td>${payPill(b)}${H.paymentOf(b).amount ? `<br><span class="muted nowrap">${H.peso(H.paymentOf(b).amount)} · ${(H.paymentOf(b).method || '').toUpperCase()}</span>` : ''}${H.paymentOf(b).status === 'verifying' ? `<br><button class="btn btn-primary btn-sm" style="margin-top:.3rem;padding:.3rem .6rem;font-size:.72rem" data-receipt="${b.ref}">Review receipt</button>` : ''}${H.paymentOf(b).status === 'unpaid' && b.status !== 'cancelled' && b.status !== 'checked_out' ? `<br><button class="btn btn-soft btn-sm" style="margin-top:.3rem;padding:.3rem .6rem;font-size:.72rem" data-markpaid="${b.ref}">Mark paid</button>` : ''}</td>
          <td>${pill(b.status)}</td>
          <td><div class="actions">
            ${b.status === 'confirmed' && b.checkIn <= T ? `<button class="btn btn-primary" data-checkin="${b.ref}">Check in</button>` : ''}
            ${b.status === 'checked_in' ? `<button class="btn btn-soft" data-checkout="${b.ref}">Check out</button>` : ''}
            ${b.status === 'confirmed' ? `<button class="btn btn-danger" data-cancel="${b.ref}">Cancel</button>` : ''}
            ${b.status === 'checked_out' || b.status === 'cancelled' ? '<span class="muted">—</span>' : ''}
          </div></td></tr>`).join('') || '<tr><td colspan="9"><div class="empty">No bookings match.</div></td></tr>'}
        </tbody></table></div>
      </div>`;
    $('#bSearch').addEventListener('input', e => { uiState.bookingSearch = e.target.value; bookings(); $('#bSearch').focus(); $('#bSearch').setSelectionRange(1e4, 1e4); });
    $('#bFilter').addEventListener('change', e => { uiState.bookingFilter = e.target.value; bookings(); });
    $('#walkinBtn').addEventListener('click', openWalkin);
    bindBookingActions();
  }

  /* walk-in modal */
  function openModal(id) { $(id).classList.add('open'); document.body.style.overflow = 'hidden'; }
  function closeModal(id) { $(id).classList.remove('open'); document.body.style.overflow = ''; }
  $$('.modal').forEach(m => m.addEventListener('click', e => { if (e.target.hasAttribute('data-close')) closeModal('#' + m.id); }));
  function openWalkin() {
    const T = H.today();
    $('#wType').innerHTML = H.ROOM_TYPES.map(t => `<option value="${t.id}">${t.name} — ${H.peso(t.rate)}/night (max ${t.max})</option>`).join('');
    $('#wIn').value = T; $('#wIn').min = T; $('#wOut').value = H.addDays(T, 1); $('#wOut').min = H.addDays(T, 1);
    $('#wName').value = ''; $('#wPhone').value = ''; $('#wAdults').value = 2; $('#wKids').value = 0;
    updateWalkinAvail(); openModal('#walkinModal');
  }
  function updateWalkinAvail() {
    const t = $('#wType').value, ci = $('#wIn').value, co = $('#wOut').value;
    if (!ci || !co || co <= ci) { $('#wAvail').textContent = 'Check-out must be after check-in.'; return; }
    const free = H.unitsFree(t, ci, co); const n = H.nightsBetween(ci, co); const pax = (+$('#wAdults').value || 0) + (+$('#wKids').value || 0);
    const p = H.calcTotal(t, n, pax);
    $('#wAvail').innerHTML = free.length ? `<span style="color:var(--leaf);font-weight:800">${free.length} unit${free.length > 1 ? 's' : ''} free</span> (${free.join(', ')}) · ${n} night${n > 1 ? 's' : ''} · Total <b>${H.peso(p.total)}</b>` : '<span style="color:var(--rose);font-weight:800">Fully booked for these dates.</span>';
  }
  ['wType', 'wIn', 'wOut', 'wAdults', 'wKids'].forEach(id => $('#' + id).addEventListener('change', updateWalkinAvail));
  $('#wIn').addEventListener('change', () => { if ($('#wOut').value <= $('#wIn').value) $('#wOut').value = H.addDays($('#wIn').value, 1); updateWalkinAvail(); });
  $('#walkinForm').addEventListener('submit', e => {
    e.preventDefault();
    try {
      const t = H.type($('#wType').value); const adults = +$('#wAdults').value, children = +$('#wKids').value;
      if (adults + children > t.max) return toast(`${t.name} fits a maximum of ${t.max} guests.`);
      const b = H.createBooking({ typeId: t.id, checkIn: $('#wIn').value, checkOut: $('#wOut').value, adults, children, guest: { name: $('#wName').value.trim(), phone: $('#wPhone').value.trim(), email: '' }, source: 'walk-in' });
      closeModal('#walkinModal'); toast(`Booking ${b.ref} saved — unit ${b.unit}.`); render();
    } catch (err) { toast(err.message); }
  });

  /* ======================================================================
     INVENTORY (owner)
     ====================================================================== */
  function inventory() {
    const S = H.load();
    const low = S.inventory.filter(i => i.qty <= i.reorder); const value = S.inventory.reduce((a, i) => a + i.qty * i.cost, 0);
    const pending = S.stockRequests.filter(r => r.status === 'pending').sort((a, b) => (b.createdAt > a.createdAt ? 1 : -1));
    const itemName = id => (S.inventory.find(i => i.id === id) || { item: '(removed item)' }).item;
    const reqType = r => r.type === 'add' ? '<span class="pill ok">Restock +' + r.qty + '</span>' : '<span class="pill low">Deduct −' + r.qty + '</span>';
    const reqStatus = r => r.status === 'pending' ? '<span class="pill pay-verifying">Pending</span>' : r.status === 'approved' ? '<span class="pill pay-paid">Approved</span>' : '<span class="pill pay-unpaid">Rejected</span>';
    const when = ts => ts ? H.fmtShort(ts.slice(0, 10)) + ', ' + new Date(ts).toLocaleTimeString('en-PH', { hour: 'numeric', minute: '2-digit' }) : '';
    const totalDeducted = S.inventory.reduce((a, i) => a + (i.adminDeducted || 0), 0);
    const stockRows = S.inventory.map(i => `<tr>
        <td><b>${i.item}</b><br><span class="muted">${i.unit} · ${H.peso(i.cost)} each</span></td>
        <td class="num"><b>${i.origin}</b><br><span class="muted nowrap" style="font-size:.72rem">set ${H.fmtShort(i.originAt)}</span></td>
        <td class="num">${i.adminDeducted ? `<b style="color:var(--rose)">− ${i.adminDeducted}</b><br><button class="linkish" data-dlog="${i.id}">view log</button>` : '<span class="muted">0</span>'}</td>
        <td class="num"><b style="font-size:1.05rem">${i.qty}</b></td>
        <td class="num">${i.reorder}</td>
        <td>${i.qty <= i.reorder ? pill('low', i.qty === 0 ? 'Out of stock' : 'Low — reorder') : pill('ok', 'In stock')}</td>
        <td class="num">${H.peso(i.qty * i.cost)}</td>
        <td>${isOwner
          ? `<div class="actions"><button class="btn btn-soft" data-adj="${i.id}" data-d="-1" title="Deduct 1">−1</button><button class="btn btn-soft" data-adj="${i.id}" data-d="1" title="Add 1">+1</button><button class="btn btn-primary" data-adjcustom="${i.id}" title="Add or deduct any quantity">Adjust…</button><button class="icon-btn" title="Remove item" data-rm="${i.id}">${I.trash}</button></div>`
          : `<div class="actions stack"><button class="btn btn-primary" data-req="${i.id}" data-type="add">Request restock</button><button class="btn btn-soft" data-req="${i.id}" data-type="deduct">Log usage (deduct)</button></div>`}</td>
      </tr>`).join('');
    const requestRows = list => list.map(r => `<tr>
        <td class="nowrap">${when(r.createdAt)}<br><span class="muted">${r.by}</span></td>
        <td><b>${itemName(r.itemId)}</b></td>
        <td>${reqType(r)}</td>
        <td style="max-width:320px">${r.reason || '<span class="muted">—</span>'}${r.note ? `<br><span class="muted" style="font-style:italic">Owner: “${r.note}”</span>` : ''}</td>
        <td>${reqStatus(r)}${r.decidedAt ? `<br><span class="muted" style="font-size:.72rem">${when(r.decidedAt)} · ${r.decidedBy}</span>` : ''}</td>
        ${isOwner ? `<td>${r.status === 'pending' ? `<div class="actions"><button class="btn btn-primary" data-approve="${r.id}">Approve</button><button class="btn btn-danger" data-reject="${r.id}">Reject</button></div>` : '<span class="muted">—</span>'}</td>` : ''}
      </tr>`).join('');
    const byNewest = (a, b) => (b.createdAt > a.createdAt ? 1 : b.createdAt < a.createdAt ? -1 : 0);
    const history = S.stockRequests.filter(r => r.status !== 'pending').sort(byNewest);
    const myReqs = [...S.stockRequests].sort((a, b) => (a.status === 'pending') === (b.status === 'pending') ? byNewest(a, b) : (a.status === 'pending' ? -1 : 1)); // admins share one request queue in this demo
    $('#view').innerHTML = `
      <div class="kpis">
        <div class="kpi" style="--c:var(--royal)"><small>Stock items</small><b>${S.inventory.length}</b><span>Tracked supplies</span></div>
        <div class="kpi" style="--c:var(--rose)"><small>Low stock</small><b>${low.length}</b><span>${low.length ? low.map(i => i.item).slice(0, 3).join(', ') + (low.length > 3 ? '…' : '') : 'All good'}</span></div>
        ${isOwner ? `<div class="kpi" style="--c:var(--leaf)"><small>Stock value</small><b>${H.peso(value)}</b><span>At unit cost</span></div>` : `<div class="kpi" style="--c:var(--leaf)"><small>My deductions (approved)</small><b>${totalDeducted}</b><span>Units taken since owner's last count</span></div>`}
        <div class="kpi" style="--c:var(--amber)"><small>${isOwner ? 'Requests to approve' : 'My pending requests'}</small><b>${pending.length}</b><span>${pending.length ? pending.length + ' awaiting the owner' : 'Nothing pending'}</span></div>
      </div>

      ${isOwner ? `
      <div class="panel" id="reqPanel">
        <div class="panel-head"><h3>Requests from admin</h3><p>Approve to apply the change to stock. Restocks reset the item's origin; deductions count against it.</p></div>
        ${pending.length ? `<div class="table-wrap"><table class="tbl"><thead><tr><th>Requested</th><th>Item</th><th>Request</th><th>Reason</th><th>Status</th><th>Decision</th></tr></thead><tbody>${requestRows(pending)}</tbody></table></div>` : '<div class="empty">No pending requests — the admin\'s queue is clear.</div>'}
      </div>` : `
      <div class="panel">
        <div class="panel-head"><h3>How stock changes work for admin</h3></div>
        <ul class="howto">
          <li><b>Request restock</b> — asks the owner to add stock (e.g. a delivery you need). Stock changes only when approved.</li>
          <li><b>Log usage</b> — asks the owner to deduct what you used or issued. A reason is required; approved deductions show in the <b>Admin deductions</b> column next to the owner's <b>Origin stock</b>.</li>
        </ul>
      </div>`}

      <div class="panel">
        <div class="panel-head"><h3>Stock levels</h3><p><b>Origin stock</b> = level last set by the owner · <b>Admin deductions</b> = approved deductions since then · <b>Current</b> = Origin − Admin deductions.</p></div>
        <div class="table-wrap"><table class="tbl inv-tbl"><thead><tr><th>Item</th><th class="num">Origin stock</th><th class="num">Admin deductions</th><th class="num">Current</th><th class="num">Reorder at</th><th>Status</th><th class="num">Value</th><th>${isOwner ? 'Adjust (owner)' : 'Request'}</th></tr></thead><tbody>${stockRows}</tbody>
        <tfoot><tr><td>Totals</td><td class="num">${S.inventory.reduce((a, i) => a + i.origin, 0)}</td><td class="num" style="color:var(--rose)">− ${totalDeducted}</td><td class="num">${S.inventory.reduce((a, i) => a + i.qty, 0)}</td><td></td><td></td><td class="num">${H.peso(value)}</td><td></td></tr></tfoot></table></div>
      </div>

      <div class="panel">
        <div class="panel-head"><h3>${isOwner ? 'Deductions made by admin' : 'My approved deductions'}</h3><span class="pill low">${S.stockLog.filter(l => l.role === 'admin' && l.delta < 0).length} entries</span></div>
        ${S.stockLog.filter(l => l.role === 'admin' && l.delta < 0).length ? `<div class="table-wrap"><table class="tbl"><thead><tr><th>When</th><th>Item</th><th class="num">Deducted</th><th>Reason</th><th>Approved by</th></tr></thead><tbody>
          ${S.stockLog.filter(l => l.role === 'admin' && l.delta < 0).slice(0, 12).map(l => `<tr><td class="nowrap">${when(l.at)}<br><span class="muted">${l.by}</span></td><td><b>${itemName(l.itemId)}</b></td><td class="num" style="color:var(--rose)"><b>${l.delta}</b></td><td>${l.reason || '—'}</td><td>${l.approvedBy || '—'}</td></tr>`).join('')}
        </tbody></table></div>` : '<div class="empty">No admin deductions yet.</div>'}
      </div>

      <div class="panel">
        <div class="panel-head"><h3>${isOwner ? 'Request history' : 'My requests'}</h3><span class="pill pay-verifying">${pending.length} pending</span></div>
        ${(isOwner ? history : myReqs).length ? `<div class="table-wrap"><table class="tbl"><thead><tr><th>Requested</th><th>Item</th><th>Request</th><th>Reason</th><th>Status</th>${isOwner ? '<th></th>' : ''}</tr></thead><tbody>${requestRows((isOwner ? history : myReqs).slice(0, 15))}</tbody></table></div>` : '<div class="empty">No requests yet.</div>'}
      </div>

      ${isOwner ? `<div class="panel"><div class="panel-head"><h3>Add an item</h3></div>
        <form id="invForm" class="inline-form">
          <div class="field"><label>Item</label><input id="iName" required placeholder="e.g. Mosquito coils"></div>
          <div class="field"><label>Quantity</label><input id="iQty" type="number" min="0" value="0" required></div>
          <div class="field"><label>Unit</label><input id="iUnit" required placeholder="pcs"></div>
          <div class="field"><label>Reorder at</label><input id="iRe" type="number" min="0" value="5" required></div>
          <div class="field"><label>Unit cost (₱)</label><input id="iCost" type="number" min="0" value="0" required></div>
          <button class="btn btn-primary" type="submit">Add item</button>
        </form>
      </div>` : ''}`;

    // ----- owner actions -----
    $$('[data-adj]').forEach(b => b.addEventListener('click', () => { H.adjustStock(b.dataset.adj, +b.dataset.d, { by: session.name }); render(); }));
    $$('[data-adjcustom]').forEach(b => b.addEventListener('click', () => {
      const it = S.inventory.find(i => i.id === b.dataset.adjcustom);
      const v = prompt(`${it.item}: enter a positive number to add or a negative number to deduct (current: ${it.qty} ${it.unit})`, '');
      if (v === null || !v.trim()) return; const n = Math.round(+v); if (!n) { toast('Please enter a non-zero number.'); return; }
      const reason = prompt('Reason (optional):', n > 0 ? 'Delivery received' : 'Owner adjustment') || '';
      H.adjustStock(it.id, n, { by: session.name, reason }); toast(`${it.item}: ${n > 0 ? '+' : ''}${n} applied. Origin stock reset to ${H.load().inventory.find(i => i.id === it.id).qty}.`); render();
    }));
    $$('[data-rm]').forEach(b => b.addEventListener('click', () => { if (confirm('Remove this item?')) { H.removeItem(b.dataset.rm); render(); } }));
    $$('[data-approve]').forEach(b => b.addEventListener('click', () => { const r = H.decideRequest(b.dataset.approve, 'approved', { by: session.name }); toast(`Approved: ${r.type === 'add' ? '+' : '−'}${r.qty} ${itemName(r.itemId)}.`); render(); }));
    $$('[data-reject]').forEach(b => b.addEventListener('click', () => { const note = prompt('Reason for rejecting (shown to the admin):', ''); if (note === null) return; const r = H.decideRequest(b.dataset.reject, 'rejected', { by: session.name, note }); toast(`Rejected request for ${itemName(r.itemId)}.`); render(); }));
    const f = $('#invForm'); if (f) f.addEventListener('submit', e => { e.preventDefault(); H.addItem({ item: $('#iName').value.trim(), qty: +$('#iQty').value, unit: $('#iUnit').value.trim(), reorder: +$('#iRe').value, cost: +$('#iCost').value }, { by: session.name }); toast('Item added.'); render(); });
    // ----- both roles: itemised deduction log per item -----
    $$('[data-dlog]').forEach(b => b.addEventListener('click', () => openDeductionLog(b.dataset.dlog)));
    // ----- admin: request modal -----
    $$('[data-req]').forEach(b => b.addEventListener('click', () => openStockRequest(b.dataset.req, b.dataset.type)));
  }

  function openDeductionLog(itemId) {
    const it = H.load().inventory.find(i => i.id === itemId); const rows = H.adminDeductionsFor(itemId);
    $('#stockLogTitle').textContent = `Admin deductions — ${it.item}`;
    $('#stockLogBody').innerHTML = `
      <div class="sum-row"><span class="muted">Origin stock (set by owner ${H.fmtShort(it.originAt)})</span><b>${it.origin} ${it.unit}</b></div>
      <div class="sum-row"><span class="muted">Admin deductions since then</span><b style="color:var(--rose)">− ${it.adminDeducted}</b></div>
      <div class="sum-row" style="border-bottom:0"><span class="muted">Current stock</span><b>${it.qty} ${it.unit}</b></div>
      ${rows.length ? `<div class="table-wrap" style="margin-top:.8rem"><table class="tbl"><thead><tr><th>When</th><th class="num">Qty</th><th>Reason</th><th>Approved by</th></tr></thead><tbody>
        ${rows.map(l => `<tr><td class="nowrap">${H.fmtShort(l.at.slice(0, 10))}<br><span class="muted">${l.by}</span></td><td class="num" style="color:var(--rose)"><b>${l.delta}</b></td><td>${l.reason || '—'}</td><td>${l.approvedBy || '—'}</td></tr>`).join('')}
      </tbody></table></div>` : '<div class="empty">No itemised entries.</div>'}`;
    openModal('#stockLogModal');
  }

  function openStockRequest(itemId, type) {
    const S = H.load(); const it = S.inventory.find(i => i.id === itemId);
    $('#srItem').innerHTML = S.inventory.map(i => `<option value="${i.id}" ${i.id === itemId ? 'selected' : ''}>${i.item} (${i.qty} ${i.unit})</option>`).join('');
    $('#srType').value = type === 'add' ? 'add' : 'deduct';
    $('#srQty').value = type === 'add' ? Math.max(1, it.reorder * 2 - it.qty) : 1; $('#srReason').value = '';
    const sync = () => { const cur = S.inventory.find(i => i.id === $('#srItem').value); const add = $('#srType').value === 'add';
      $('#srHint').textContent = add ? `Current ${cur.qty} ${cur.unit} · reorder at ${cur.reorder}. The owner will add stock when approved.` : `Current ${cur.qty} ${cur.unit}. You can log at most ${cur.qty}. Deducted only once the owner approves.`;
      $('#srQty').max = add ? 9999 : cur.qty; $('#srSubmit').textContent = add ? 'Send restock request' : 'Send usage log for approval'; };
    $('#srItem').onchange = sync; $('#srType').onchange = sync; sync();
    openModal('#stockRequestModal');
    $('#stockRequestForm').onsubmit = e => {
      e.preventDefault();
      const reason = $('#srReason').value.trim(); if (reason.length < 4) { toast('Please give a short reason.'); $('#srReason').focus(); return; }
      const r = H.requestStock({ itemId: $('#srItem').value, type: $('#srType').value, qty: +$('#srQty').value, reason, by: session.name });
      closeModal('#stockRequestModal'); toast(`Request sent to the owner: ${r.type === 'add' ? '+' : '−'}${r.qty} ${H.load().inventory.find(i => i.id === r.itemId).item}.`); render();
    };
  }

  /* ======================================================================
     MONTHLY SALES (owner)
     ====================================================================== */
  function sales() {
    const s = H.monthlySales(); const cur = s[s.length - 1], prev = s[s.length - 2];
    const best = s.reduce((a, b) => b.amount > a.amount ? b : a, s[0]); const total = s.reduce((a, b) => a + b.amount, 0);
    const ch = pct(cur.amount - prev.amount, prev.amount);
    $('#view').innerHTML = `
      <div class="kpis">
        <div class="kpi" style="--c:var(--royal)"><small>${H.monthLabel(cur.month)} · month to date</small><b>${H.peso(cur.amount)}</b><span>${cur.bookings} bookings · ${cur.nights} room-nights</span></div>
        <div class="kpi" style="--c:var(--leaf)"><small>Last month</small><b>${H.peso(prev.amount)}</b><span class="trend ${ch >= 0 ? 'up' : 'down'}">${ch >= 0 ? '▲' : '▼'} ${Math.abs(ch)}% vs. this month so far</span></div>
        <div class="kpi" style="--c:var(--amber)"><small>Best month</small><b>${H.peso(best.amount)}</b><span>${H.monthLabel(best.month)}</span></div>
        <div class="kpi" style="--c:var(--sky)"><small>12-month total</small><b>${H.peso(total)}</b><span>Avg ${H.peso(total / 12)} / month</span></div>
      </div>
      <div class="panel"><div class="panel-head"><h3>Sales per month</h3><div class="legend"><span><i style="background:var(--royal)"></i>Room sales</span></div></div>
        ${barChart({ labels: s.map(x => H.MONTHS[+x.month.slice(5) - 1]), series: [{ name: 'Sales', values: s.map(x => x.amount), color: '#14532d' }], highlight: s.length - 1 })}
      </div>
      <div class="panel"><div class="panel-head"><h3>Monthly breakdown</h3></div>
        <div class="table-wrap"><table class="tbl"><thead><tr><th>Month</th><th class="num">Bookings</th><th class="num">Room-nights</th><th class="num">Avg / night</th><th class="num">Sales</th><th class="num">Change</th></tr></thead><tbody>
        ${[...s].reverse().map((x, i, arr) => { const p = arr[i + 1]; const c = p ? pct(x.amount - p.amount, p.amount) : null; return `<tr><td><b>${H.monthLabel(x.month)}</b>${i === 0 ? ' <span class="muted">(to date)</span>' : ''}</td><td class="num">${x.bookings}</td><td class="num">${x.nights}</td><td class="num">${H.peso(x.nights ? x.amount / x.nights : 0)}</td><td class="num"><b>${H.peso(x.amount)}</b></td><td class="num">${c === null ? '—' : `<span class="trend ${c >= 0 ? 'up' : 'down'}">${c >= 0 ? '▲' : '▼'} ${Math.abs(c)}%</span>`}</td></tr>`; }).join('')}
        </tbody><tfoot><tr><td>Total (12 months)</td><td class="num">${s.reduce((a, b) => a + b.bookings, 0)}</td><td class="num">${s.reduce((a, b) => a + b.nights, 0)}</td><td class="num"></td><td class="num">${H.peso(total)}</td><td></td></tr></tfoot></table></div>
      </div>`;
  }

  /* ======================================================================
     REVENUE & PROFIT (owner)
     ====================================================================== */
  function finance() {
    const s = H.monthlySales(); const em = H.expensesByMonth();
    const rows = s.map(x => ({ month: x.month, revenue: x.amount, expenses: em[x.month] || 0, profit: x.amount - (em[x.month] || 0) }));
    const cur = rows[rows.length - 1]; const ytd = rows.filter(r => r.month.startsWith(String(new Date().getFullYear())));
    const sum = k => ytd.reduce((a, r) => a + r[k], 0);
    $('#view').innerHTML = `
      <div class="kpis">
        <div class="kpi" style="--c:var(--royal)"><small>Revenue · ${H.monthLabel(cur.month)}</small><b>${H.peso(cur.revenue)}</b><span>Month to date</span></div>
        <div class="kpi" style="--c:var(--rose)"><small>Expenses · ${H.monthLabel(cur.month)}</small><b>${H.peso(cur.expenses)}</b><span>${pct(cur.expenses, cur.revenue)}% of revenue</span></div>
        <div class="kpi" style="--c:${cur.profit >= 0 ? 'var(--leaf)' : 'var(--rose)'}"><small>Net profit · ${H.monthLabel(cur.month)}</small><b>${H.peso(cur.profit)}</b><span>${pct(cur.profit, cur.revenue)}% margin</span></div>
        <div class="kpi" style="--c:var(--amber)"><small>Year to date ${new Date().getFullYear()}</small><b>${H.peso(sum('profit'))}</b><span>Revenue ${H.peso(sum('revenue'))} · Expenses ${H.peso(sum('expenses'))}</span></div>
      </div>
      <div class="panel"><div class="panel-head"><h3>Revenue vs. expenses</h3><div class="legend"><span><i style="background:#14532d"></i>Revenue</span><span><i style="background:#e57373"></i>Expenses</span><span><i style="background:#d99a06"></i>Net profit</span></div></div>
        ${barChart({ labels: rows.map(r => H.MONTHS[+r.month.slice(5) - 1]), series: [{ name: 'Revenue', values: rows.map(r => r.revenue), color: '#14532d' }, { name: 'Expenses', values: rows.map(r => r.expenses), color: '#e57373' }], line: { name: 'Net profit', values: rows.map(r => r.profit), color: '#d99a06' }, highlight: rows.length - 1, height: 300 })}
      </div>
      <div class="panel"><div class="panel-head"><h3>Profit & loss by month</h3></div>
        <div class="table-wrap"><table class="tbl"><thead><tr><th>Month</th><th class="num">Revenue</th><th class="num">Expenses</th><th class="num">Net profit</th><th class="num">Margin</th><th style="width:30%">Profit share</th></tr></thead><tbody>
        ${[...rows].reverse().map((r, i) => `<tr><td><b>${H.monthLabel(r.month)}</b>${i === 0 ? ' <span class="muted">(to date)</span>' : ''}</td><td class="num">${H.peso(r.revenue)}</td><td class="num" style="color:var(--rose)">${H.peso(r.expenses)}</td><td class="num"><b style="color:${r.profit >= 0 ? 'var(--royal)' : 'var(--rose)'}">${H.peso(r.profit)}</b></td><td class="num">${pct(r.profit, r.revenue)}%</td><td><div class="bar" style="height:8px;background:var(--light-2);border-radius:4px;overflow:hidden"><i style="display:block;height:100%;width:${Math.max(0, pct(r.profit, r.revenue))}%;background:var(--leaf);border-radius:4px"></i></div></td></tr>`).join('')}
        </tbody><tfoot><tr><td>12-month total</td><td class="num">${H.peso(rows.reduce((a, r) => a + r.revenue, 0))}</td><td class="num">${H.peso(rows.reduce((a, r) => a + r.expenses, 0))}</td><td class="num">${H.peso(rows.reduce((a, r) => a + r.profit, 0))}</td><td class="num">${pct(rows.reduce((a, r) => a + r.profit, 0), rows.reduce((a, r) => a + r.revenue, 0))}%</td><td></td></tr></tfoot></table></div>
      </div>`;
  }

  /* ======================================================================
     EXPENSES (owner)
     ====================================================================== */
  function expenses() {
    const S = H.load(); const mk = uiState.expMonth; const T = H.today();
    const list = S.expenses.filter(e => e.date.startsWith(mk)).sort((a, b) => a.date < b.date ? 1 : -1);
    const total = list.reduce((a, e) => a + e.amount, 0);
    const byCat = H.EXPENSE_CATEGORIES.map(c => ({ label: c, value: list.filter(e => e.category === c).reduce((a, e) => a + e.amount, 0), color: CAT_COLORS[c] })).filter(c => c.value > 0).sort((a, b) => b.value - a.value);
    const sales = H.monthlySales().find(x => x.month === mk);
    $('#view').innerHTML = `
      <div class="kpis">
        <div class="kpi" style="--c:var(--rose)"><small>Total expenses · ${H.monthLabel(mk)}</small><b>${H.peso(total)}</b><span>${list.length} entries</span></div>
        <div class="kpi" style="--c:var(--amber)"><small>Biggest category</small><b>${byCat[0] ? byCat[0].label : '—'}</b><span>${byCat[0] ? H.peso(byCat[0].value) + ' · ' + pct(byCat[0].value, total) + '%' : ''}</span></div>
        <div class="kpi" style="--c:var(--royal)"><small>Sales that month</small><b>${sales ? H.peso(sales.amount) : '—'}</b><span>${sales ? 'Expense ratio ' + pct(total, sales.amount) + '%' : ''}</span></div>
        <div class="kpi" style="--c:var(--leaf)"><small>Net after expenses</small><b>${sales ? H.peso(sales.amount - total) : '—'}</b><span>Revenue − expenses</span></div>
      </div>
      <div class="two-col">
        <div class="panel"><div class="panel-head"><h3>By category</h3><select id="expMonth" class="chip" style="padding:.4rem .8rem">${monthOptions(mk)}</select></div>
          ${byCat.length ? `<div class="donut-wrap">${donut(byCat)}<div class="donut-legend">${byCat.map(c => `<div><i style="background:${c.color}"></i>${c.label}<span class="muted" style="margin-left:.4rem">${pct(c.value, total)}%</span><b>${H.peso(c.value)}</b></div>`).join('')}</div></div>` : '<div class="empty">No expenses recorded for this month.</div>'}
        </div>
        <div class="panel"><div class="panel-head"><h3>Record an expense</h3></div>
          <form id="expForm" style="display:grid;gap:.7rem">
            <div class="form-grid">
              <div class="field"><label>Date</label><input type="date" id="eDate" value="${T}" max="${T}" required></div>
              <div class="field"><label>Category</label><select id="eCat">${H.EXPENSE_CATEGORIES.map(c => `<option>${c}</option>`).join('')}</select></div>
              <div class="field full"><label>Description</label><input id="eDesc" required placeholder="e.g. LPG refill × 2"></div>
              <div class="field full"><label>Amount (₱)</label><input id="eAmt" type="number" min="1" step="1" required placeholder="0"></div>
            </div>
            <button class="btn btn-primary" type="submit">Save expense</button>
          </form>
        </div>
      </div>
      <div class="panel"><div class="panel-head"><h3>Entries · ${H.monthLabel(mk)}</h3></div>
        <div class="table-wrap"><table class="tbl"><thead><tr><th>Date</th><th>Category</th><th>Description</th><th class="num">Amount</th><th></th></tr></thead><tbody>
        ${list.map(e => `<tr><td>${H.fmtDate(e.date)}</td><td><span class="pill" style="background:${CAT_COLORS[e.category]}22;color:${CAT_COLORS[e.category]}">${e.category}</span></td><td>${e.desc}</td><td class="num"><b>${H.peso(e.amount)}</b></td><td><button class="icon-btn" title="Delete" data-del="${e.id}">${I.trash}</button></td></tr>`).join('') || '<tr><td colspan="5"><div class="empty">Nothing recorded yet.</div></td></tr>'}
        </tbody><tfoot><tr><td colspan="3">Total</td><td class="num">${H.peso(total)}</td><td></td></tr></tfoot></table></div>
      </div>`;
    $('#expMonth').addEventListener('change', e => { uiState.expMonth = e.target.value; expenses(); });
    $('#expForm').addEventListener('submit', e => { e.preventDefault(); H.addExpense({ date: $('#eDate').value, category: $('#eCat').value, desc: $('#eDesc').value.trim(), amount: +$('#eAmt').value }); uiState.expMonth = $('#eDate').value.slice(0, 7); toast('Expense recorded.'); expenses(); });
    $$('[data-del]').forEach(b => b.addEventListener('click', () => { if (confirm('Delete this expense?')) { H.removeExpense(b.dataset.del); expenses(); } }));
  }

  /* ======================================================================
     EMPLOYEES & SALARY (owner)
     ====================================================================== */
  function employees() {
    const mk = uiState.empMonth; const [y, m] = mk.split('-').map(Number); const dim = new Date(y, m, 0).getDate(); const T = H.today();
    const att = H.attendanceFor(mk); const pay = H.payroll(mk);
    const totals = pay.reduce((a, p) => ({ salary: a.salary + p.salary, ded: a.ded + p.deduction, net: a.net + p.net, present: a.present + p.present, absent: a.absent + p.absent }), { salary: 0, ded: 0, net: 0, present: 0, absent: 0 });
    const DOW = ['S', 'M', 'T', 'W', 'T', 'F', 'S'];
    $('#view').innerHTML = `
      <div class="panel-head" style="margin-bottom:1rem"><div class="chips"><select id="empMonth" class="chip" style="padding:.5rem .9rem">${monthOptions(mk)}</select><span class="muted" style="font-size:.85rem;align-self:center">Daily rate = monthly salary ÷ ${H.WORKING_DAYS} working days. Absences are deducted at the daily rate.</span></div></div>
      <div class="staff-grid">
        ${pay.map(p => `<div class="staff-card">
          <div class="staff-top"><div class="avatar" style="background:${p.color}">${p.name[0]}</div><div><b>${p.name}</b><small>${p.position}</small><br><small>Monthly salary <b style="display:inline;font-size:.9rem">${H.peso(p.salary)}</b></small></div></div>
          <div class="staff-stats"><div><b style="color:#1f7a33">${p.present}</b><small>Days at work</small></div><div><b style="color:var(--rose)">${p.absent}</b><small>Days absent</small></div><div><b>${p.rest}</b><small>Rest days</small></div></div>
          <div class="kpi" style="--c:${p.color};margin-top:.8rem;padding:.7rem .9rem .8rem"><small>Attendance rate</small><div class="bar" style="margin-top:.4rem"><i style="width:${pct(p.present, p.present + p.absent)}%"></i></div><span>${pct(p.present, p.present + p.absent)}% of scheduled days</span></div>
          <div class="staff-pay"><div><small class="muted">Net pay · ${H.monthLabel(mk)}</small><br><b>${H.peso(p.net)}</b></div><div style="text-align:right;font-size:.8rem" class="muted">Deductions<br><b style="color:var(--rose);font-size:.95rem">− ${H.peso(p.deduction)}</b></div></div>
        </div>`).join('')}
      </div>
      <div class="panel"><div class="panel-head"><h3>Attendance · ${H.monthLabel(mk)}</h3><div class="legend"><span><i style="background:#cfeed3"></i>P — Present</span><span><i style="background:var(--rose-bg)"></i>A — Absent</span><span><i style="background:#e8ebe9"></i>R — Rest day</span><span><i style="background:var(--light)"></i>— Not logged</span><span class="muted">Click a day to cycle P → A → R → blank</span></div></div>
        <div class="table-wrap"><div class="att-grid" style="--days:${dim}">
          <div></div>${Array.from({ length: dim }, (_, i) => { const d = new Date(y, m - 1, i + 1); return `<div class="hd ${d.getDay() % 6 === 0 ? 'we' : ''}">${i + 1}<br><span style="font-weight:600">${DOW[d.getDay()]}</span></div>`; }).join('')}
          ${H.STAFF.map(s => `<div class="lbl">${s.name}</div>` + Array.from({ length: dim }, (_, i) => { const d = i + 1; const ds = `${mk}-${H.pad(d)}`; const v = att[s.id][d] || ''; const fut = ds > T; return `<div class="att-cell ${v} ${fut ? 'future' : ''} ${ds === T ? 'today' : ''}" data-staff="${s.id}" data-day="${d}" ${fut ? '' : 'title="Click to change"'}>${v}</div>`; }).join('')).join('')}
        </div></div>
      </div>
      <div class="panel"><div class="panel-head"><h3>Payroll summary · ${H.monthLabel(mk)}</h3></div>
        <div class="table-wrap"><table class="tbl"><thead><tr><th>Employee</th><th>Position</th><th class="num">Monthly salary</th><th class="num">Daily rate</th><th class="num">Days at work</th><th class="num">Days absent</th><th class="num">Deductions</th><th class="num">Net pay</th></tr></thead><tbody>
        ${pay.map(p => `<tr><td><b>${p.name}</b></td><td class="muted">${p.position}</td><td class="num">${H.peso(p.salary)}</td><td class="num">${H.peso(p.daily)}</td><td class="num" style="color:#1f7a33"><b>${p.present}</b></td><td class="num" style="color:var(--rose)"><b>${p.absent}</b></td><td class="num" style="color:var(--rose)">− ${H.peso(p.deduction)}</td><td class="num"><b>${H.peso(p.net)}</b></td></tr>`).join('')}
        </tbody><tfoot><tr><td colspan="2">Total payroll</td><td class="num">${H.peso(totals.salary)}</td><td></td><td class="num">${totals.present}</td><td class="num">${totals.absent}</td><td class="num">− ${H.peso(totals.ded)}</td><td class="num">${H.peso(totals.net)}</td></tr></tfoot></table></div>
      </div>`;
    $('#empMonth').addEventListener('change', e => { uiState.empMonth = e.target.value; employees(); });
    $$('.att-cell:not(.future)').forEach(c => c.addEventListener('click', () => { const cur = att[c.dataset.staff][c.dataset.day] || ''; const next = { '': 'P', P: 'A', A: 'R', R: '' }[cur]; H.setAttendance(mk, c.dataset.staff, c.dataset.day, next); employees(); }));
  }

  render();
})();
