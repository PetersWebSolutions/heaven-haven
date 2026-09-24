/* ==========================================================================
   Heaven Haven Campsite — shared data layer (localStorage backed)
   Used by both the public website and the admin / owner dashboard.
   ========================================================================== */
window.HH = (function () {
  const KEY = 'hh_campsite_state_v4';
  const EXTRA_PAX_FEE = 350;          // per extra guest per night
  const DOWNPAYMENT = 0.5;            // 50% to secure a booking

  const ROOM_TYPES = [
    { id: 'aframe', name: 'A-Frame Cabin', img: 'assets/rooms/aframe.jpg', base: 2, max: 3, rate: 3500, badge: 'Most loved',
      desc: 'Cozy nipa-roof cabin with a private porch facing the sunrise side of the valley.',
      incl: ['Queen bed', 'Electric fan & lights', 'Private porch', 'Bonfire kit'], units: ['A1', 'A2', 'A3', 'A4'],
      photos: ['assets/rooms/aframe.jpg', 'assets/rooms/aframe-2.jpg', 'assets/rooms/aframe-3.jpg', 'assets/rooms/aframe-4.jpg'],
      inclusions: ['Queen / double bed', 'Extra mattress on request', 'Mini fridge', 'Electric fan & lights', 'Private porch with chairs', 'Bonfire kit & firewood', 'Hot shower access', 'Wi-Fi at the lounge', 'Shared kitchen & grills', 'Free parking'] },
    { id: 'kubo', name: 'Family Kubo Cabin', img: 'assets/rooms/kubo.jpg', base: 4, max: 6, rate: 5800, badge: 'For families',
      desc: 'Spacious bamboo kubo with a wide veranda, hammock and its own grilling area.',
      incl: ['2 queen beds + futon', 'Veranda & hammock', 'Private grill', 'Mini fridge'], units: ['K1', 'K2'],
      photos: ['assets/rooms/kubo.jpg', 'assets/rooms/kubo-2.jpg', 'assets/rooms/kubo-3.jpg', 'assets/rooms/kubo-4.jpg'],
      inclusions: ['2 queen / double beds + futon', 'Mini fridge', 'Electric fan & lights', 'Wide veranda & hammock', 'Private grill (LPG / charcoal)', 'Bonfire kit & firewood', 'Hot shower access', 'Wi-Fi at the lounge', 'Shared kitchen access', 'Free parking'] },
    { id: 'bell', name: 'Glamping Bell Tent', img: 'assets/rooms/belltent.jpg', base: 2, max: 3, rate: 2800, badge: 'Couples pick',
      desc: 'Canvas bell tent on a wooden deck with a real bed, lanterns and a ridge-top view.',
      incl: ['Real bed & linens', 'Deck with chairs', 'Lanterns', 'Breakfast for 2'], units: ['T1', 'T2', 'T3', 'T4', 'T5', 'T6'],
      photos: ['assets/rooms/belltent.jpg', 'assets/rooms/bell-2.jpg', 'assets/rooms/bell-3.jpg', 'assets/rooms/bell-4.jpg'],
      inclusions: ['Double bed with linens', 'Wooden deck with chairs', 'Lanterns & fairy lights', 'Breakfast for 2', 'Electric fan', 'Hot shower access', 'Wi-Fi at the lounge', 'Bonfire kit & firewood', 'Shared kitchen & grills', 'Free parking'] },
    { id: 'safari', name: 'Safari Tent', img: 'assets/rooms/safari.jpg', base: 4, max: 5, rate: 3900, badge: 'Barkada favorite',
      desc: 'Roomy safari tent with a covered porch — glamping comfort for small groups.',
      incl: ['2 double beds', 'Covered porch', 'Power outlets', 'Bonfire kit'], units: ['S1', 'S2', 'S3'],
      photos: ['assets/rooms/safari.jpg', 'assets/rooms/safari-2.jpg', 'assets/rooms/safari-3.jpg', 'assets/rooms/safari-4.jpg'],
      inclusions: ['2 double beds', 'Covered porch with chairs', 'Power outlets', 'Mini fridge', 'Bonfire kit & firewood', 'Hot shower access', 'Wi-Fi at the lounge', 'Shared kitchen & grills', 'Electric fan & lanterns', 'Free parking'] },
    { id: 'tree', name: 'Treehouse Loft', img: 'assets/rooms/treehouse.jpg', base: 2, max: 2, rate: 4200, badge: 'Only one',
      desc: 'Our single treehouse loft tucked among the trees with a balcony above the clouds.',
      incl: ['Queen bed', 'Private balcony', 'Breakfast for 2', 'Late checkout'], units: ['L1'],
      photos: ['assets/rooms/treehouse.jpg', 'assets/rooms/tree-2.jpg', 'assets/rooms/tree-3.jpg', 'assets/rooms/tree-4.jpg'],
      inclusions: ['Queen / double bed', 'Private balcony above the clouds', 'Breakfast for 2', 'Late checkout (1 PM)', 'Electric fan & lights', 'Hot shower access', 'Wi-Fi at the lounge', 'Bonfire kit & firewood', 'Shared kitchen access', 'Free parking'] },
    { id: 'pitch', name: 'Tent Pitch (Bring Your Own Tent)', img: 'assets/rooms/pitch.jpg', base: 2, max: 4, rate: 900, badge: 'Budget',
      desc: 'A private grassy pitch with a stone fire pit, bamboo fence and valley view.',
      incl: ['Fire pit', 'Shared kitchen', 'Hot showers', 'Parking'], units: ['P1', 'P2', 'P3', 'P4', 'P5', 'P6', 'P7', 'P8'],
      photos: ['assets/rooms/pitch.jpg', 'assets/rooms/pitch-2.jpg', 'assets/rooms/pitch-3.jpg', 'assets/rooms/pitch-4.jpg'],
      inclusions: ['Private grassy pitch', 'Stone fire pit & firewood', 'Picnic table', 'Bamboo fence / valley view', 'Shared kitchen & grills', 'Hot showers & clean CRs', 'Wi-Fi at the lounge', 'Camping gear rental (extra)', 'Drinking water access', 'Free parking'] },
  ];

  const STAFF = [
    { id: 'mark', name: 'Mark', position: 'Caretaker & Maintenance', salary: 16000, restDay: 2, color: '#3f9a52' },
    { id: 'may', name: 'May', position: 'Front Desk & Housekeeping Lead', salary: 17500, restDay: 3, color: '#d99a06' },
    { id: 'vincent', name: 'Vincent', position: 'Grounds, Bonfire & Security', salary: 15000, restDay: 1, color: '#2b6cb0' },
  ];
  const WORKING_DAYS = 26;

  const EXPENSE_CATEGORIES = ['Salaries', 'Utilities', 'Supplies', 'Maintenance', 'Food & Beverage', 'Marketing', 'Transport', 'Misc'];

  /* ---------- date helpers ---------- */
  const pad = n => String(n).padStart(2, '0');
  const iso = d => `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}`;
  const parse = s => { const [y, m, d] = s.split('-').map(Number); return new Date(y, m - 1, d); };
  const addDays = (s, n) => { const d = parse(s); d.setDate(d.getDate() + n); return iso(d); };
  const today = () => iso(new Date());
  const nightsBetween = (a, b) => Math.round((parse(b) - parse(a)) / 86400000);
  const monthKey = d => `${d.getFullYear()}-${pad(d.getMonth() + 1)}`;
  const MONTHS = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
  const fmtDate = (s, opts) => parse(s).toLocaleDateString('en-PH', opts || { month: 'short', day: 'numeric', year: 'numeric' });
  const fmtShort = s => parse(s).toLocaleDateString('en-PH', { month: 'short', day: 'numeric' });
  const peso = n => '₱' + Math.round(n).toLocaleString('en-PH');
  const monthLabel = key => { const [y, m] = key.split('-').map(Number); return `${MONTHS[m - 1]} ${y}`; };

  /* deterministic pseudo random for seed data */
  function rng(seed) { let s = seed >>> 0; return () => { s = (s * 1664525 + 1013904223) >>> 0; return s / 4294967296; }; }

  /* ---------- seed ---------- */
  function seed() {
    const T = today();
    const rnd = rng(20260923);
    const units = [];
    ROOM_TYPES.forEach(t => t.units.forEach(code => units.push({ code, typeId: t.id, status: 'available', note: '' })));

    const guests = [
      ['Andrea Villanueva', '0917 555 0142', 'andrea.v@example.com'], ['Paolo Reyes', '0920 555 0198', 'paolo.reyes@example.com'],
      ['Kristine & Jomar Dela Cruz', '0918 555 0111', 'kdc@example.com'], ['Miguel Santos', '0915 555 0123', 'miguel.s@example.com'],
      ['The Tan Family', '0917 555 0177', 'tanfam@example.com'], ['Bea Alonzo', '0916 555 0134', 'bea.a@example.com'],
      ['Carlo Mendoza', '0919 555 0150', 'carlo.m@example.com'], ['Janine Lopez', '0922 555 0166', 'janine.l@example.com'],
      ['Rafael & Ana Garcia', '0917 555 0188', 'garcia.ra@example.com'], ['Team Kalikasan Outdoor Club', '0920 555 0101', 'kalikasan@example.com'],
      ['Ella Bautista', '0918 555 0129', 'ella.b@example.com'], ['Nathan Cruz', '0915 555 0190', 'nathan.c@example.com'],
      ['Sophia Lim', '0917 555 0155', 'sophia.lim@example.com'], ['Dexter & Friends', '0921 555 0144', 'dexter.f@example.com'],
    ];
    // [typeId, unit, checkInOffset, nights, adults, children, status]
    const plan = [
      ['aframe', 'A1', -2, 3, 2, 0, 'checked_in'],
      ['aframe', 'A2', 0, 2, 2, 1, 'confirmed'],        // arriving today  -> unit READY
      ['bell', 'T1', -1, 2, 2, 0, 'checked_in'],
      ['bell', 'T2', -3, 3, 2, 0, 'checked_out'],        // departed today -> FOR CLEANING
      ['kubo', 'K1', -1, 3, 4, 2, 'checked_in'],
      ['safari', 'S1', -4, 2, 4, 0, 'checked_out'],
      ['tree', 'L1', 1, 2, 2, 0, 'confirmed'],
      ['pitch', 'P1', -1, 2, 2, 0, 'checked_in'],
      ['pitch', 'P2', 0, 1, 3, 1, 'confirmed'],          // arriving today -> READY
      ['aframe', 'A3', 3, 2, 2, 0, 'confirmed'],
      ['bell', 'T3', 5, 2, 2, 0, 'confirmed'],
      ['kubo', 'K2', 9, 2, 5, 1, 'confirmed'],
      ['safari', 'S2', 12, 3, 4, 1, 'confirmed'],
      ['pitch', 'P3', 2, 1, 4, 0, 'confirmed'],
    ];
    const bookings = plan.map((p, i) => {
      const [typeId, unit, off, nights, adults, children, status] = p;
      const t = ROOM_TYPES.find(r => r.id === typeId);
      const checkIn = addDays(T, off), checkOut = addDays(checkIn, nights);
      const g = guests[i];
      return {
        ref: `HH-${checkIn.slice(2, 4)}${checkIn.slice(5, 7)}-${(1000 + i * 37 + 113).toString(36).toUpperCase().padStart(4, '0')}`,
        typeId, unit, guest: { name: g[0], phone: g[1], email: g[2] }, checkIn, checkOut, adults, children,
        total: calcTotal(typeId, nights, adults + children).total, status, source: i % 3 === 0 ? 'walk-in' : 'website',
        createdAt: addDays(checkIn, -Math.floor(rnd() * 20 + 2)), requests: i % 4 === 0 ? 'Early check-in if possible' : '',
        payment: null,
      };
    });
    // payment status: stays that started are paid; upcoming ones are a mix of paid / for verification / unpaid
    bookings.forEach((b, i) => {
      const half = Math.round(b.total * DOWNPAYMENT);
      if (b.status === 'checked_in' || b.status === 'checked_out') b.payment = { status: 'paid', method: i % 2 ? 'gcash' : 'cash', amount: b.total, paidAt: b.checkIn, gcashRef: i % 2 ? String(3010000000000 + i * 7919) : '' };
      else if (b.status === 'confirmed') {
        if (i % 3 === 1) b.payment = { status: 'paid', method: 'gcash', amount: half, paidAt: b.createdAt, gcashRef: String(3010000000000 + i * 7919) };
        else if (i % 3 === 2) b.payment = { status: 'verifying', method: 'gcash', amount: half, gcashRef: String(3010000000000 + i * 7919), uploadedAt: b.createdAt, receiptName: 'gcash-receipt.jpg', receipt: 'assets/sample-receipt.jpg' };
        else b.payment = { status: 'unpaid', method: '', amount: 0 };
      }
    });
    // unit statuses derived from bookings
    bookings.forEach(b => {
      const u = units.find(x => x.code === b.unit);
      if (b.status === 'checked_in') u.status = 'occupied';
      else if (b.status === 'checked_out' && b.checkOut === T) u.status = 'cleaning';
      else if (b.status === 'confirmed' && b.checkIn === T) u.status = 'ready';
    });
    // a couple of manual states
    units.find(u => u.code === 'S3').status = 'cleaning'; units.find(u => u.code === 'S3').note = 'Deep clean after group stay';
    units.find(u => u.code === 'T6').status = 'occupied'; units.find(u => u.code === 'T6').note = 'Blocked — canvas repair';
    units.find(u => u.code === 'A4').status = 'ready'; units.find(u => u.code === 'A4').note = 'Prepared for walk-ins';

    // monthly sales history (last 12 months) — dry season (Dec–May) is peak
    const now = new Date(); const sales = [];
    for (let i = 11; i >= 0; i--) {
      const d = new Date(now.getFullYear(), now.getMonth() - i, 1);
      const m = d.getMonth();
      const peak = [11, 0, 1, 2, 3, 4].includes(m) ? 1.35 : ([5, 6, 7, 8].includes(m) ? 0.8 : 1);
      const bookingsN = Math.round((38 + rnd() * 18) * peak);
      const nights = Math.round(bookingsN * (1.6 + rnd() * .5));
      let amount = Math.round(nights * (2900 + rnd() * 900) / 100) * 100;
      if (i === 0) { const frac = now.getDate() / 30; amount = Math.round(amount * frac / 100) * 100; }
      sales.push({ month: monthKey(d), bookings: i === 0 ? Math.round(bookingsN * now.getDate() / 30) : bookingsN, nights: i === 0 ? Math.round(nights * now.getDate() / 30) : nights, amount });
    }
    // monthly expense totals by category (history) + itemised entries for current & previous month
    const expenses = [];
    const catBase = { 'Salaries': 48500, 'Utilities': 14000, 'Supplies': 9000, 'Maintenance': 8000, 'Food & Beverage': 12000, 'Marketing': 4500, 'Transport': 3000, 'Misc': 2000 };
    for (let i = 11; i >= 2; i--) {
      const d = new Date(now.getFullYear(), now.getMonth() - i, 1); const mk = monthKey(d);
      EXPENSE_CATEGORIES.forEach((c, ci) => expenses.push({ id: `${mk}-${ci}`, date: `${mk}-${pad(5 + ci * 3)}`, category: c, desc: `${c} — ${MONTHS[d.getMonth()]}`, amount: Math.round(catBase[c] * (0.85 + rnd() * .3) / 50) * 50 }));
    }
    const prev = new Date(now.getFullYear(), now.getMonth() - 1, 1); const pk = monthKey(prev); const ck = monthKey(now);
    const items = [
      [pk, '05', 'Salaries', 'Staff salaries — 1st half', 24250], [pk, '20', 'Salaries', 'Staff salaries — 2nd half', 24250],
      [pk, '07', 'Utilities', 'Meralco electricity', 9800], [pk, '09', 'Utilities', 'Water delivery & pump fuel', 3600], [pk, '10', 'Utilities', 'Internet (Starlink)', 2700],
      [pk, '03', 'Supplies', 'Toiletries, linens & cleaning supplies', 6400], [pk, '12', 'Supplies', 'Firewood 60 bundles', 3000],
      [pk, '15', 'Maintenance', 'A-frame roof re-thatching (A3)', 7500], [pk, '16', 'Food & Beverage', 'Breakfast ingredients & café stock', 11200],
      [pk, '18', 'Marketing', 'Facebook & Instagram ads', 4000], [pk, '22', 'Transport', 'Supply runs (fuel)', 2800], [pk, '25', 'Misc', 'Permits & misc fees', 1500],
      [ck, '05', 'Salaries', 'Staff salaries — 1st half', 24250], [ck, '20', 'Salaries', 'Staff salaries — 2nd half', 24250],
      [ck, '06', 'Utilities', 'Meralco electricity', 10400], [ck, '08', 'Utilities', 'Water delivery & pump fuel', 3400], [ck, '10', 'Utilities', 'Internet (Starlink)', 2700],
      [ck, '02', 'Supplies', 'Toiletries, linens & cleaning supplies', 5900], [ck, '11', 'Supplies', 'Firewood 50 bundles + charcoal', 3200],
      [ck, '14', 'Maintenance', 'Bell tent canvas repair (T6)', 4200], [ck, '15', 'Food & Beverage', 'Breakfast ingredients & café stock', 9800],
      [ck, '17', 'Marketing', 'Facebook & Instagram ads', 3500], [ck, '19', 'Transport', 'Supply runs (fuel)', 2400],
    ];
    items.forEach((e, i) => { if (`${e[0]}-${e[1]}` <= T || e[0] === pk) expenses.push({ id: `x-${i}`, date: `${e[0]}-${e[1]}`, category: e[2], desc: e[3], amount: e[4] }); });

    const inventory = [
      { id: 'firewood', item: 'Firewood bundles', qty: 46, unit: 'bundles', reorder: 20, cost: 50 },
      { id: 'charcoal', item: 'Charcoal (sacks)', qty: 6, unit: 'sacks', reorder: 5, cost: 320 },
      { id: 'lpg', item: 'LPG tanks (11 kg)', qty: 3, unit: 'tanks', reorder: 4, cost: 950 },
      { id: 'water', item: 'Drinking water (5 gal)', qty: 18, unit: 'jugs', reorder: 10, cost: 35 },
      { id: 'linens', item: 'Bed linen sets', qty: 38, unit: 'sets', reorder: 30, cost: 850 },
      { id: 'towels', item: 'Bath towels', qty: 52, unit: 'pcs', reorder: 40, cost: 220 },
      { id: 'toiletry', item: 'Toiletry kits', qty: 24, unit: 'kits', reorder: 30, cost: 45 },
      { id: 'coffee', item: 'Coffee & breakfast packs', qty: 60, unit: 'packs', reorder: 40, cost: 60 },
      { id: 'marsh', item: "S'mores kits", qty: 14, unit: 'kits', reorder: 15, cost: 120 },
      { id: 'bulbs', item: 'Fairy-light bulbs (spare)', qty: 9, unit: 'pcs', reorder: 12, cost: 35 },
      { id: 'lantern', item: 'Rechargeable lanterns', qty: 20, unit: 'pcs', reorder: 12, cost: 650 },
      { id: 'cleaning', item: 'Cleaning solution (L)', qty: 11, unit: 'liters', reorder: 8, cost: 95 },
    ];
    // Origin stock = level last set by the owner; adminDeducted = approved admin deductions since then.
    const seededDeductions = { firewood: 14, water: 12, towels: 8, toiletry: 6, coffee: 20, marsh: 4, cleaning: 3 };
    const originAt = addDays(T, -9);
    inventory.forEach(it => { const d = seededDeductions[it.id] || 0; it.adminDeducted = d; it.origin = it.qty + d; it.originAt = originAt; it.originBy = 'Owner'; });
    const stockLog = [
      { id: 'sl1', itemId: 'firewood', delta: -8, by: 'May (Admin)', role: 'admin', reason: 'Bonfire night, 4 groups (Sep 14)', at: addDays(T, -8) + 'T19:20:00', approvedBy: 'Owner', requestId: 'sr-a1' },
      { id: 'sl2', itemId: 'water', delta: -12, by: 'May (Admin)', role: 'admin', reason: 'Weekend guests, 6 units occupied', at: addDays(T, -7) + 'T10:05:00', approvedBy: 'Owner', requestId: 'sr-a2' },
      { id: 'sl3', itemId: 'coffee', delta: -20, by: 'May (Admin)', role: 'admin', reason: 'Breakfast packs for Sep 13–15 stays', at: addDays(T, -7) + 'T10:06:00', approvedBy: 'Owner', requestId: 'sr-a3' },
      { id: 'sl4', itemId: 'towels', delta: -8, by: 'May (Admin)', role: 'admin', reason: 'Worn out / stained, removed from rotation', at: addDays(T, -5) + 'T15:40:00', approvedBy: 'Owner', requestId: 'sr-a4' },
      { id: 'sl5', itemId: 'toiletry', delta: -6, by: 'May (Admin)', role: 'admin', reason: 'Issued to A1, A2, K1 arrivals', at: addDays(T, -4) + 'T13:15:00', approvedBy: 'Owner', requestId: 'sr-a5' },
      { id: 'sl6', itemId: 'firewood', delta: -6, by: 'May (Admin)', role: 'admin', reason: 'Bonfire night (Sep 20)', at: addDays(T, -2) + 'T20:10:00', approvedBy: 'Owner', requestId: 'sr-a6' },
      { id: 'sl7', itemId: 'marsh', delta: -4, by: 'May (Admin)', role: 'admin', reason: "Sold at the campfire (S'mores add-on)", at: addDays(T, -2) + 'T20:12:00', approvedBy: 'Owner', requestId: 'sr-a7' },
      { id: 'sl8', itemId: 'cleaning', delta: -3, by: 'May (Admin)', role: 'admin', reason: 'Deep clean after check-outs', at: addDays(T, -1) + 'T11:30:00', approvedBy: 'Owner', requestId: 'sr-a8' },
    ];
    const mkReq = (id, itemId, type, qty, reason, status, daysAgo, note) => ({ id, itemId, type, qty, reason, status, by: 'May (Admin)', createdAt: addDays(T, -daysAgo) + 'T09:30:00', decidedAt: status === 'pending' ? '' : addDays(T, -daysAgo) + 'T12:00:00', decidedBy: status === 'pending' ? '' : 'Owner', note: note || '' });
    const stockRequests = [
      mkReq('sr-a1', 'firewood', 'deduct', 8, 'Bonfire night, 4 groups (Sep 14)', 'approved', 8),
      mkReq('sr-a2', 'water', 'deduct', 12, 'Weekend guests, 6 units occupied', 'approved', 7),
      mkReq('sr-a3', 'coffee', 'deduct', 20, 'Breakfast packs for Sep 13–15 stays', 'approved', 7),
      mkReq('sr-a4', 'towels', 'deduct', 8, 'Worn out / stained, removed from rotation', 'approved', 5),
      mkReq('sr-r1', 'lantern', 'add', 5, 'Spare lanterns for the treehouse & safari tents', 'rejected', 5, 'We still have 20 on hand — request again below 12.'),
      mkReq('sr-a5', 'toiletry', 'deduct', 6, 'Issued to A1, A2, K1 arrivals', 'approved', 4),
      mkReq('sr-a6', 'firewood', 'deduct', 6, 'Bonfire night (Sep 20)', 'approved', 2),
      mkReq('sr-a7', 'marsh', 'deduct', 4, "Sold at the campfire (S'mores add-on)", 'approved', 2),
      mkReq('sr-a8', 'cleaning', 'deduct', 3, 'Deep clean after check-outs', 'approved', 1),
      mkReq('sr-p1', 'lpg', 'add', 4, 'Only 3 tanks left and the weekend is fully booked (café + kubo kitchens).', 'pending', 1),
      mkReq('sr-p2', 'toiletry', 'add', 30, 'Below reorder level (24 vs 30). Supplier can deliver Friday.', 'pending', 0),
      mkReq('sr-p3', 'firewood', 'deduct', 5, 'Used for last night’s campfire (2 groups).', 'pending', 0),
      mkReq('sr-p4', 'bulbs', 'deduct', 2, 'Replaced 2 busted bulbs along the A-frame path.', 'pending', 0),
    ];

    // attendance for the current & previous month
    const attendance = {};
    const absencePlan = { mark: [4, 16], may: [], vincent: [2, 11, 19] };
    const prevAbsence = { mark: [9], may: [23], vincent: [6, 27] };
    [[pk, prevAbsence, true], [ck, absencePlan, false]].forEach(([mk, plan, full]) => {
      const [y, m] = mk.split('-').map(Number); const dim = new Date(y, m, 0).getDate();
      attendance[mk] = {};
      STAFF.forEach(s => {
        attendance[mk][s.id] = {};
        for (let d = 1; d <= dim; d++) {
          const date = `${mk}-${pad(d)}`;
          if (!full && date > T) break;
          const dow = new Date(y, m - 1, d).getDay();
          attendance[mk][s.id][d] = dow === s.restDay ? 'R' : (plan[s.id].includes(d) ? 'A' : 'P');
        }
      });
    });

    return { units, bookings, sales, expenses, inventory, stockRequests, stockLog, attendance, createdAt: new Date().toISOString() };
  }

  /* ---------- pricing ---------- */
  function calcTotal(typeId, nights, pax) {
    const t = ROOM_TYPES.find(r => r.id === typeId);
    const extra = Math.max(0, pax - t.base);
    const room = t.rate * nights, extraFee = extra * EXTRA_PAX_FEE * nights;
    return { room, extra, extraFee, total: room + extraFee, downpayment: (room + extraFee) * DOWNPAYMENT };
  }

  /* ---------- state ---------- */
  let state = null;
  function load() {
    if (state) return state;
    try { const raw = localStorage.getItem(KEY); if (raw) state = JSON.parse(raw); } catch (e) { /* ignore */ }
    if (!state) { state = seed(); save(); }
    migrate(state);
    return state;
  }
  function migrate(st) {
    let dirty = false;
    if (!Array.isArray(st.stockRequests)) { st.stockRequests = []; dirty = true; }
    if (!Array.isArray(st.stockLog)) { st.stockLog = []; dirty = true; }
    (st.inventory || []).forEach(it => { if (typeof it.origin !== 'number') { it.origin = it.qty; it.adminDeducted = 0; it.originAt = today(); it.originBy = 'Owner'; dirty = true; } });
    if (dirty) save();
  }
  function save() { localStorage.setItem(KEY, JSON.stringify(state)); }
  function reset() { localStorage.removeItem(KEY); state = null; return load(); }

  /* ---------- availability ---------- */
  const activeStatuses = ['confirmed', 'checked_in'];
  function overlaps(b, from, to) { return b.checkIn < to && b.checkOut > from; }
  function bookedUnits(typeId, from, to, ignoreRef) {
    return load().bookings.filter(b => b.typeId === typeId && activeStatuses.includes(b.status) && overlaps(b, from, to) && b.ref !== ignoreRef);
  }
  function unitsFree(typeId, from, to) {
    const t = ROOM_TYPES.find(r => r.id === typeId);
    const taken = new Set(bookedUnits(typeId, from, to).map(b => b.unit));
    // units blocked for maintenance today count as unavailable for stays that include today
    const T = today();
    load().units.filter(u => u.typeId === typeId && u.status === 'occupied' && from <= T && to > T).forEach(u => taken.add(u.code));
    return t.units.filter(c => !taken.has(c));
  }
  function isNightFull(typeId, date) { return unitsFree(typeId, date, addDays(date, 1)).length === 0; }

  /* ---------- bookings ---------- */
  function makeRef() {
    const d = new Date(); const chars = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789'; let s = '';
    for (let i = 0; i < 4; i++) s += chars[Math.floor(Math.random() * chars.length)];
    return `HH-${String(d.getFullYear()).slice(2)}${pad(d.getMonth() + 1)}-${s}`;
  }
  function createBooking({ typeId, checkIn, checkOut, adults, children, guest, requests, source }) {
    const free = unitsFree(typeId, checkIn, checkOut);
    if (!free.length) throw new Error('Sorry, this accommodation is fully booked for those dates.');
    const nights = nightsBetween(checkIn, checkOut);
    const price = calcTotal(typeId, nights, adults + children);
    const b = { ref: makeRef(), typeId, unit: free[0], checkIn, checkOut, adults, children, guest, requests: requests || '', total: price.total, status: 'confirmed', source: source || 'website', createdAt: today(), payment: { status: 'unpaid', method: '', amount: 0 } };
    load().bookings.unshift(b);
    if (checkIn === today()) setUnitStatus(free[0], 'ready');
    save();
    return b;
  }
  function updateBooking(ref, patch) { const b = load().bookings.find(x => x.ref === ref); Object.assign(b, patch); save(); return b; }
  function checkIn(ref) { const b = updateBooking(ref, { status: 'checked_in' }); setUnitStatus(b.unit, 'occupied'); return b; }
  function checkOut(ref) { const b = updateBooking(ref, { status: 'checked_out' }); setUnitStatus(b.unit, 'cleaning'); return b; }
  function cancel(ref) { const b = updateBooking(ref, { status: 'cancelled' }); const u = unit(b.unit); if (u.status === 'ready') setUnitStatus(b.unit, 'available'); return b; }

  /* ---------- payments ---------- */
  const PAYMENT = { gcashNumber: '0917 555 0100', gcashName: 'HE***N HAVEN CAMPSITE', mayaNumber: '0917 555 0100', bank: 'BPI · 1234-5678-90 · Heaven Haven Campsite' };
  function attachReceipt(ref, { method, amount, gcashRef, receipt, receiptName }) {
    const b = load().bookings.find(x => x.ref === ref);
    b.payment = { status: 'verifying', method, amount, gcashRef: gcashRef || '', receipt: receipt || '', receiptName: receiptName || '', uploadedAt: new Date().toISOString() };
    save(); return b;
  }
  function setPaymentStatus(ref, status, extra) {
    const b = load().bookings.find(x => x.ref === ref);
    b.payment = Object.assign({ status: 'unpaid', method: '', amount: 0 }, b.payment || {}, { status }, extra || {});
    if (status === 'paid' && !b.payment.paidAt) b.payment.paidAt = today();
    save(); return b;
  }
  function paymentOf(b) { return b.payment || { status: 'unpaid', method: '', amount: 0 }; }

  /* ---------- units ---------- */
  function unit(code) { return load().units.find(u => u.code === code); }
  function setUnitStatus(code, status, note) { const u = unit(code); u.status = status; if (note !== undefined) u.note = note; save(); return u; }
  function unitBooking(code) {
    const T = today();
    return load().bookings.find(b => b.unit === code && (b.status === 'checked_in' || (b.status === 'confirmed' && b.checkIn <= T && b.checkOut > T) || (b.status === 'confirmed' && b.checkIn === T)));
  }
  function nextBooking(code) { const T = today(); return load().bookings.filter(b => b.unit === code && b.status === 'confirmed' && b.checkIn >= T).sort((a, b) => a.checkIn < b.checkIn ? -1 : 1)[0]; }
  function statusCounts() {
    const c = { available: 0, occupied: 0, cleaning: 0, ready: 0 };
    load().units.forEach(u => c[u.status]++);
    return c;
  }

  /* ---------- finance ---------- */
  function monthlySales() {
    const s = load().sales.map(x => ({ ...x }));
    const ck = monthKey(new Date());
    // add live website bookings created this month that are not part of the seed
    const live = load().bookings.filter(b => b.createdAt && b.createdAt.slice(0, 7) === ck && b.status !== 'cancelled' && b.ref.length === 12 && b.source === 'website' && !b.seeded);
    const cur = s.find(x => x.month === ck);
    if (cur) { const extra = live.filter(b => new Date(b.createdAt) > new Date(load().createdAt)); cur.bookings += extra.length; cur.nights += extra.reduce((a, b) => a + nightsBetween(b.checkIn, b.checkOut), 0); cur.amount += extra.reduce((a, b) => a + b.total, 0); }
    return s;
  }
  function expensesByMonth() {
    const m = {};
    load().expenses.forEach(e => { const k = e.date.slice(0, 7); m[k] = (m[k] || 0) + e.amount; });
    return m;
  }
  function addExpense(e) { load().expenses.unshift({ id: 'x' + Date.now(), ...e }); save(); }
  function removeExpense(id) { const s = load(); s.expenses = s.expenses.filter(e => e.id !== id); save(); }

  /* ---------- inventory ----------
     Stock model: current qty = origin − adminDeducted.
     • origin        = level after the OWNER's last direct action (add/deduct or approved restock)
     • adminDeducted = total of approved ADMIN deduction requests since that origin was set
     Admins never change stock directly — they file requests (add / deduct) that the owner approves. */
  const stamp = () => new Date().toISOString().slice(0, 19);
  function logStock(entry) { const s = load(); s.stockLog.unshift({ id: 'sl' + Date.now() + Math.random().toString(36).slice(2, 6), at: stamp(), ...entry }); if (s.stockLog.length > 400) s.stockLog.length = 400; }
  // Owner-only direct adjustment → re-bases the origin.
  function adjustStock(id, delta, meta) {
    const it = load().inventory.find(i => i.id === id); if (!it) return null;
    const before = it.qty; it.qty = Math.max(0, it.qty + delta); const applied = it.qty - before;
    it.origin = it.qty; it.adminDeducted = 0; it.originAt = today(); it.originBy = (meta && meta.by) || 'Owner';
    logStock({ itemId: id, delta: applied, by: (meta && meta.by) || 'Owner', role: 'owner', reason: (meta && meta.reason) || (applied >= 0 ? 'Owner added stock' : 'Owner deducted stock'), rebase: true });
    save(); return it;
  }
  function addItem(it, meta) { const s = load(); const item = { id: 'i' + Date.now(), ...it, origin: it.qty, adminDeducted: 0, originAt: today(), originBy: (meta && meta.by) || 'Owner' }; s.inventory.push(item); logStock({ itemId: item.id, delta: it.qty, by: (meta && meta.by) || 'Owner', role: 'owner', reason: 'New item added', rebase: true }); save(); return item; }
  function removeItem(id) { const s = load(); s.inventory = s.inventory.filter(i => i.id !== id); save(); }
  // Admin requests
  function stockRequests(filter) { const list = load().stockRequests; return filter ? list.filter(filter) : list; }
  function requestStock({ itemId, type, qty, reason, by }) {
    const s = load(); const it = s.inventory.find(i => i.id === itemId); if (!it) throw new Error('Unknown item');
    qty = Math.max(1, Math.round(+qty || 0));
    const r = { id: 'sr' + Date.now(), itemId, type: type === 'add' ? 'add' : 'deduct', qty, reason: (reason || '').trim(), by: by || 'Admin', status: 'pending', createdAt: stamp(), decidedAt: '', decidedBy: '', note: '' };
    s.stockRequests.unshift(r); save(); return r;
  }
  function decideRequest(id, decision, meta) {
    const s = load(); const r = s.stockRequests.find(x => x.id === id); if (!r || r.status !== 'pending') return r;
    const by = (meta && meta.by) || 'Owner';
    r.status = decision === 'approved' ? 'approved' : 'rejected'; r.decidedAt = stamp(); r.decidedBy = by; r.note = (meta && meta.note) || '';
    if (r.status === 'approved') {
      const it = s.inventory.find(i => i.id === r.itemId);
      if (it) {
        if (r.type === 'add') {          // restock approved → owner-set level → new origin, counter resets
          it.qty += r.qty; it.origin = it.qty; it.adminDeducted = 0; it.originAt = today(); it.originBy = by;
          logStock({ itemId: it.id, delta: r.qty, by: r.by, role: 'admin', reason: r.reason, approvedBy: by, requestId: r.id, rebase: true });
        } else {                         // deduction approved → counts against the origin
          const applied = Math.min(r.qty, it.qty); it.qty -= applied; it.adminDeducted = (it.adminDeducted || 0) + applied; r.applied = applied;
          logStock({ itemId: it.id, delta: -applied, by: r.by, role: 'admin', reason: r.reason, approvedBy: by, requestId: r.id });
        }
      }
    }
    save(); return r;
  }
  function stockLog(filter) { const list = load().stockLog; return filter ? list.filter(filter) : list; }
  // Itemised admin deductions counted in the current "Admin deductions" column of an item
  function adminDeductionsFor(itemId) { const it = load().inventory.find(i => i.id === itemId); if (!it) return []; return load().stockLog.filter(l => l.itemId === itemId && l.role === 'admin' && l.delta < 0 && l.at.slice(0, 10) >= (it.originAt || '')); }

  /* ---------- attendance / payroll ---------- */
  function attendanceFor(mk) {
    const s = load(); if (!s.attendance[mk]) { s.attendance[mk] = {}; STAFF.forEach(x => s.attendance[mk][x.id] = {}); save(); }
    return s.attendance[mk];
  }
  function setAttendance(mk, staffId, day, val) { const a = attendanceFor(mk); if (val) a[staffId][day] = val; else delete a[staffId][day]; save(); }
  function payroll(mk) {
    const a = attendanceFor(mk);
    return STAFF.map(s => {
      const days = Object.values(a[s.id] || {});
      const present = days.filter(v => v === 'P').length, absent = days.filter(v => v === 'A').length, rest = days.filter(v => v === 'R').length;
      const daily = s.salary / WORKING_DAYS; const deduction = absent * daily;
      return { ...s, present, absent, rest, daily, deduction, net: s.salary - deduction };
    });
  }

  return {
    ROOM_TYPES, STAFF, EXPENSE_CATEGORIES, EXTRA_PAX_FEE, DOWNPAYMENT, WORKING_DAYS, MONTHS,
    load, save, reset, today, iso, parse, addDays, nightsBetween, monthKey, monthLabel, fmtDate, fmtShort, peso, pad,
    calcTotal, unitsFree, isNightFull, bookedUnits, createBooking, updateBooking, checkIn, checkOut, cancel,
    unit, setUnitStatus, unitBooking, nextBooking, statusCounts, monthlySales, expensesByMonth, addExpense, removeExpense,
    adjustStock, addItem, removeItem, stockRequests, requestStock, decideRequest, stockLog, adminDeductionsFor, attendanceFor, setAttendance, payroll,
    PAYMENT, attachReceipt, setPaymentStatus, paymentOf,
    type: id => ROOM_TYPES.find(r => r.id === id),
  };
})();
