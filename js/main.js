if (!window.HH || typeof window.HH.attachReceipt !== 'function') {
  // Stale cached store.js detected — force a fresh load once.
  if (!sessionStorage.getItem('hh_reloaded')) { sessionStorage.setItem('hh_reloaded', '1'); location.reload(true); }
} else { sessionStorage.removeItem('hh_reloaded'); }
/* ==========================================================================
   Heaven Haven Campsite — public website logic
   ========================================================================== */
(function () {
  const $ = (s, el = document) => el.querySelector(s);
  const $$ = (s, el = document) => [...el.querySelectorAll(s)];
  const H = window.HH;

  /* ---------- icons ---------- */
  const I = {
    lock: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><rect x="4" y="10" width="16" height="11" rx="2"/><path d="M8 10V7a4 4 0 0 1 8 0v3"/></svg>',
    mountain: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="m3 20 6-11 4 6 2-3 6 8z"/><path d="M14 4l3 4 3-3"/></svg>',
    fire: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M12 22c4 0 7-2.7 7-7 0-3-2-5-3-6.5-.5 1.5-1.5 2.5-2.5 3C13 8 13 4 9 2c.5 3-1 5-2.5 7S4 12.5 5 15c1 4 4 7 7 7z"/><path d="M12 22c-2 0-3-1.5-3-3.5S11 15 12 14c1 1 3 2.5 3 4.5S14 22 12 22z"/></svg>',
    tent: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M3 20 12 4l9 16z"/><path d="M12 20V11l-4 9"/><path d="M12 11l4 9"/></svg>',
    family: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><circle cx="9" cy="7" r="3"/><circle cx="17" cy="9" r="2.5"/><path d="M2 21v-2a5 5 0 0 1 5-5h4a5 5 0 0 1 5 5v2"/><path d="M17 14.5a4 4 0 0 1 5 4V21"/></svg>',
    car: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M5 16 6.5 9.5A2 2 0 0 1 8.4 8h7.2a2 2 0 0 1 1.9 1.5L19 16"/><rect x="3" y="16" width="18" height="4" rx="1"/><circle cx="7.5" cy="20" r="1.5"/><circle cx="16.5" cy="20" r="1.5"/></svg>',
    cabin: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M3 11 12 3l9 8"/><path d="M5 10v10h14V10"/><path d="M10 20v-6h4v6"/></svg>',
    deck: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="12" r="3"/><path d="M12 2v3M12 19v3M2 12h3M19 12h3M4.9 4.9l2.1 2.1M17 17l2.1 2.1M4.9 19.1 7 17M17 7l2.1-2.1"/></svg>',
    kitchen: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M4 3v18M4 3c-2 3-2 7 0 9M9 3v18M9 3c2 3 2 7 0 9"/><path d="M16 3c-2 0-3 3-3 6 0 2 1 3 3 3s3-1 3-3c0-3-1-6-3-6zM16 12v9"/></svg>',
    shower: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M4 20V8a4 4 0 0 1 8 0"/><path d="M8 8h10a2 2 0 0 1 2 2v0H8z"/><path d="M10 14v2M13 14v2M16 14v2M11.5 18v2M14.5 18v2"/></svg>',
    wifi: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M2 8.5a15 15 0 0 1 20 0"/><path d="M5.5 12a10 10 0 0 1 13 0"/><path d="M9 15.5a5 5 0 0 1 6 0"/><circle cx="12" cy="19" r="1"/></svg>',
    hammock: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M3 4v16M21 4v16"/><path d="M3 9c4 6 14 6 18 0"/><path d="M3 9c3 2 15 2 18 0"/></svg>',
    star: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="m12 3 2.7 5.6 6.1.9-4.4 4.3 1 6.1L12 17l-5.4 2.9 1-6.1L3.2 9.5l6.1-.9z"/></svg>',
    gear: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M6 21V8a6 6 0 0 1 12 0v13"/><path d="M6 12h12M4 21h16"/><path d="M9 4.5 12 2l3 2.5"/></svg>',
    coffee: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M4 9h12v6a5 5 0 0 1-5 5H9a5 5 0 0 1-5-5z"/><path d="M16 10h2a2.5 2.5 0 0 1 0 5h-2"/><path d="M8 2v3M12 2v3"/></svg>',
    paw: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><circle cx="6" cy="9" r="2"/><circle cx="18" cy="9" r="2"/><circle cx="9.5" cy="5" r="2"/><circle cx="14.5" cy="5" r="2"/><path d="M12 11c-3 0-6 3-6 6a3 3 0 0 0 3 3c1.5 0 2-1 3-1s1.5 1 3 1a3 3 0 0 0 3-3c0-3-3-6-6-6z"/></svg>',
    users: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round"><circle cx="9" cy="8" r="3.5"/><path d="M2.5 20a6.5 6.5 0 0 1 13 0"/><path d="M16 4.5a3.5 3.5 0 0 1 0 7"/><path d="M17.5 14a6.5 6.5 0 0 1 4 6"/></svg>',
    bed: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round"><path d="M3 18V8M3 12h18v6M3 16h18"/><path d="M6 12V9.5A1.5 1.5 0 0 1 7.5 8h3A1.5 1.5 0 0 1 12 9.5V12"/></svg>',
    check: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><path d="m5 12 5 5L20 7"/></svg>',
  };

  /* ---------- content ---------- */
  const WHY = [
    { id: 'private', icon: I.lock, title: 'Truly Private', img: 'assets/why/private.jpg', text: 'Only 24 units on 3 hectares. We never overbook, so the viewing deck, bonfire pits and trails are yours to share with just a handful of guests.' },
    { id: 'sunrise', icon: I.mountain, title: 'Sea-of-Clouds Sunrise', img: 'assets/why/sunrise.jpg', text: 'Wake up at 5:30, walk 40 steps to the deck, and watch the valley fill with clouds. Most mornings from November to May deliver.' },
    { id: 'glamping', icon: I.tent, title: 'Glamping Comfort', img: 'assets/why/glamping.jpg', text: 'Real beds, clean linens, hot showers and fairy-lit cabins — camping vibes without the sore back.' },
    { id: 'bonfire', icon: I.fire, title: 'Bonfire Nights', img: 'assets/why/bonfire.jpg', text: 'Every stay comes with a bonfire kit and firewood. Bring the marshmallows; we\'ll bring the stars.' },
    { id: 'family', icon: I.family, title: 'Family & Pet Friendly', img: 'assets/why/family.jpg', text: 'Wide grassy areas for kids, leashed pets welcome, and staff who genuinely love hosting families.' },
    { id: 'reach', icon: I.car, title: 'Easy to Reach', img: 'assets/why/reach.jpg', text: 'Roughly 2 hours from Metro Manila via Marcos Highway with a concrete road to the gate. Sedan-friendly, with free parking.' },
  ];
  const AMENITIES = [
    { id: 'cabins', title: 'A-frame cabins & kubos', sub: 'Nipa-roofed, fan-cooled', icon: I.cabin },
    { id: 'tents', title: 'Glamping tents', sub: 'Bell & safari tents on decks', icon: I.tent },
    { id: 'bonfire', title: 'Bonfire pits', sub: 'Firewood included nightly', icon: I.fire },
    { id: 'deck', title: 'Sunrise viewing deck', sub: 'Best seat above the clouds', icon: I.deck },
    { id: 'kitchen', title: 'Shared kitchen & grills', sub: 'Cookware, utensils, LPG', icon: I.kitchen },
    { id: 'showers', title: 'Hot showers & clean CRs', sub: 'Cleaned thrice daily', icon: I.shower },
    { id: 'wifi', title: 'Wi-Fi at the lounge', sub: 'Starlink — good enough to brag', icon: I.wifi },
    { id: 'hammocks', title: 'Hammocks & lounges', sub: 'Naps strongly encouraged', icon: I.hammock },
    { id: 'stars', title: 'Stargazing lawn', sub: 'Zero city lights', icon: I.star },
    { id: 'gear', title: 'Camping gear rental', sub: 'Tents, sleeping bags, lamps', icon: I.gear },
    { id: 'cafe', title: 'Sunrise café', sub: 'Barako coffee & silog breakfast', icon: I.coffee },
    { id: 'pets', title: 'Pet-friendly grounds', sub: 'Leashed furry friends welcome', icon: I.paw },
  ];
  const TESTIMONIALS = [
    { name: 'Andrea V.', from: 'Quezon City · A-Frame Cabin', stars: 5, photo: 'assets/testimonials/andrea.jpg', text: 'We booked one night and stayed two. The sea of clouds at sunrise was unreal, and the staff (hi May!) treated us like family. Cleanest campsite CRs I\'ve ever seen.' },
    { name: 'Paolo & Trish', from: 'Pasig · Glamping Bell Tent', stars: 5, photo: 'assets/testimonials/paolo-trish.jpg', text: 'Perfect anniversary getaway. Fairy lights, bonfire, real bed inside the tent — my wife said it felt like a movie. Mark even helped us set up a surprise picnic.' },
    { name: 'The Tan Family', from: 'Makati · Family Kubo', stars: 5, text: 'Kids ran around all day, roasted marshmallows all night, and slept like logs. Private grill was a huge plus. Already booked again for December.' },
    { name: 'Kalikasan Outdoor Club', from: 'Antipolo · Tent Pitches', stars: 5, text: 'Brought 14 members for a team-building weekend. Great space, super affordable pitches, and Vincent kept the bonfire going until 1 AM. Highly recommended for groups.' },
    { name: 'Bea A.', from: 'Taguig · Treehouse Loft', stars: 5, photo: 'assets/testimonials/bea.jpg', text: 'Solo trip to reset. The treehouse balcony above the fog, barako coffee in hand, zero notifications. Exactly what I needed. The road up is easy even in a sedan.' },
    { name: 'Miguel S.', from: 'Cavite · Safari Tent', stars: 4, photo: 'assets/testimonials/miguel.jpg', text: 'Beautiful place and very peaceful. Rained on our first night but the tent held up perfectly. Wish there were more food options, but the café breakfast was solid.' },
  ];

  /* ---------- render static sections ---------- */
  $('#whyGrid').innerHTML = WHY.map(w => `
    <div class="why-card reveal" data-why="${w.id}">
      <div class="why-track">
        <div class="why-media"><span class="why-tag">Click to read</span><img src="${w.img}" alt="${w.title}" loading="lazy"></div>
        <button type="button" class="why-copy" aria-expanded="false">
          <div class="why-copy-top"><span class="icon-badge">${w.icon}</span><h3>${w.title}</h3></div>
          <p>${w.text}</p>
          <small class="why-cue">Click again to close</small>
        </button>
      </div>
    </div>`).join('');
  function toggleWhy(card) {
    const open = card.classList.contains('open');
    $$('#whyGrid .why-card').forEach(c => {
      c.classList.remove('open');
      const b = c.querySelector('.why-copy');
      if (b) b.setAttribute('aria-expanded', 'false');
    });
    if (!open) {
      card.classList.add('open');
      card.querySelector('.why-copy').setAttribute('aria-expanded', 'true');
    }
  }
  $$('#whyGrid .why-copy').forEach(btn => btn.addEventListener('click', () => toggleWhy(btn.closest('.why-card'))));
  $$('#whyGrid .why-media').forEach(el => el.addEventListener('click', () => toggleWhy(el.closest('.why-card'))));
  $('#amenityGrid').innerHTML = AMENITIES.map(a => `<button type="button" class="amenity reveal" data-amenity="${a.id}" aria-expanded="false"><div class="icon-badge">${a.icon}</div><div><b>${a.title}</b><span>${a.sub}</span></div><span class="amenity-cue">Photos</span></button>`).join('');
  $('#testiGrid').innerHTML = TESTIMONIALS.map(t => {
    const face = t.photo
      ? `<img class="avatar-photo" src="${t.photo}" alt="${t.name}">`
      : t.name.replace(/^The\s+/i, '')[0];
    return `<div class="testi reveal"><div class="stars">${'★'.repeat(t.stars)}${'☆'.repeat(5 - t.stars)}</div><p>“${t.text}”</p><div class="testi-who"><div class="avatar${t.photo ? ' has-photo' : ''}">${face}</div><div><b>${t.name}</b><span>${t.from}</span></div></div></div>`;
  }).join('');
  $('#year').textContent = new Date().getFullYear();

  /* ---------- add a review ---------- */
  let reviewStars = 5;
  function paintStars(n) {
    reviewStars = n;
    $('#reviewStars').value = n;
    $$('#starPick button').forEach(b => b.classList.toggle('on', +b.dataset.star <= n));
  }
  function openReview() {
    $('#reviewForm').reset();
    $('#reviewForm').hidden = false;
    $('#reviewThanks').hidden = true;
    paintStars(5);
    openModal('#reviewModal');
    setTimeout(() => $('#reviewName').focus(), 50);
  }
  $('#addReviewBtn').addEventListener('click', openReview);
  $$('#starPick button').forEach(b => {
    b.addEventListener('click', () => paintStars(+b.dataset.star));
    b.addEventListener('mouseenter', () => $$('#starPick button').forEach(x => x.classList.toggle('on', +x.dataset.star <= +b.dataset.star)));
    b.addEventListener('mouseleave', () => paintStars(reviewStars));
  });
  $('#reviewForm').addEventListener('submit', e => {
    e.preventDefault();
    $('#reviewForm').hidden = true;
    $('#reviewThanks').hidden = false;
  });

  /* ---------- amenity collage popup (click to open, click again to close) ---------- */
  let openAmenity = null;
  function closeAmenityPop() {
    const pop = $('#amenityPop');
    if (!pop) return;
    pop.classList.remove('open');
    pop.setAttribute('aria-hidden', 'true');
    if (!$('.modal.open')) document.body.style.overflow = '';
    $$('.amenity.is-open').forEach(el => { el.classList.remove('is-open'); el.setAttribute('aria-expanded', 'false'); });
    openAmenity = null;
  }
  function openAmenityPop(id) {
    const a = AMENITIES.find(x => x.id === id);
    if (!a) return;
    if (openAmenity === id) { closeAmenityPop(); return; }
    openAmenity = id;
    $$('.amenity').forEach(el => {
      const on = el.dataset.amenity === id;
      el.classList.toggle('is-open', on);
      el.setAttribute('aria-expanded', on ? 'true' : 'false');
    });
    $('#amenityPopTitle').textContent = a.title;
    $('#amenityPopSub').textContent = a.sub;
    $('#amenityCollage').innerHTML = [1, 2, 3].map(n =>
      `<img src="assets/amenities/${id}-${n}.jpg" alt="${a.title} — photo ${n}" loading="eager">`
    ).join('');
    const pop = $('#amenityPop');
    pop.classList.add('open');
    pop.setAttribute('aria-hidden', 'false');
    document.body.style.overflow = 'hidden';
  }
  $$('#amenityGrid .amenity').forEach(el => {
    el.addEventListener('click', () => openAmenityPop(el.dataset.amenity));
  });
  $('#amenityPop').addEventListener('click', e => {
    if (e.target.closest('[data-amenity-close]')) closeAmenityPop();
  });

  /* ---------- room photo carousel popup ---------- */
  let roomPopId = null, carIdx = 0, carPhotos = [];
  function closeRoomPop() {
    const pop = $('#roomPop');
    if (!pop) return;
    pop.classList.remove('open');
    pop.setAttribute('aria-hidden', 'true');
    if (!$('.modal.open') && !($('#amenityPop') && $('#amenityPop').classList.contains('open'))) document.body.style.overflow = '';
    roomPopId = null;
  }
  function showCarSlide(i) {
    if (!carPhotos.length) return;
    carIdx = (i + carPhotos.length) % carPhotos.length;
    $$('#roomCarSlides img').forEach((img, n) => img.classList.toggle('on', n === carIdx));
    $$('#roomCarDots button').forEach((d, n) => d.classList.toggle('on', n === carIdx));
    $('#roomCarCount').textContent = `${carIdx + 1} / ${carPhotos.length}`;
  }
  function openRoomPop(id) {
    const r = H.type(id);
    if (!r) return;
    roomPopId = id;
    carPhotos = r.photos && r.photos.length ? r.photos : [r.img];
    carIdx = 0;
    $('#roomPopTitle').textContent = r.name;
    $('#roomPopRate').textContent = `${H.peso(r.rate)} / night`;
    $('#roomPopCap').innerHTML = `Capacity<br>${r.base} guests (max ${r.max})`;
    const T = H.today();
    const free = H.unitsFree(r.id, T, H.addDays(T, 1)).length;
    const noun = r.id === 'pitch' ? (free === 1 ? 'pitch' : 'pitches') : (free === 1 ? 'room' : 'rooms');
    const notice = $('#roomPopNotice');
    if (!free) {
      notice.textContent = 'Fully booked tonight';
      notice.className = 'room-notice none';
    } else {
      notice.textContent = `Only ${free} ${noun} available`;
      notice.className = 'room-notice' + (free > 3 ? ' ok' : '');
    }
    $('#roomPopIncl').innerHTML = (r.inclusions || r.incl).map(x => `<li>${x}</li>`).join('');
    $('#roomCarSlides').innerHTML = carPhotos.map((src, n) => `<img src="${src}" alt="${r.name} photo ${n + 1}" class="${n === 0 ? 'on' : ''}">`).join('');
    $('#roomCarDots').innerHTML = carPhotos.map((_, n) => `<button type="button" aria-label="Photo ${n + 1}" class="${n === 0 ? 'on' : ''}"></button>`).join('');
    $$('#roomCarDots button').forEach((d, n) => d.addEventListener('click', () => showCarSlide(n)));
    showCarSlide(0);
    const pop = $('#roomPop');
    pop.classList.add('open');
    pop.setAttribute('aria-hidden', 'false');
    document.body.style.overflow = 'hidden';
    pop.querySelector('.room-pop-panel').scrollTop = 0;
  }
  $('#roomCarPrev').addEventListener('click', () => showCarSlide(carIdx - 1));
  $('#roomCarNext').addEventListener('click', () => showCarSlide(carIdx + 1));
  $('#roomPop').addEventListener('click', e => { if (e.target.closest('[data-room-close]')) closeRoomPop(); });
  $('#roomPopBook').addEventListener('click', () => {
    const id = roomPopId;
    closeRoomPop();
    if (id) openBooking({ typeId: id });
  });
  (function () {
    const el = $('#roomCar');
    let x0 = 0;
    el.addEventListener('touchstart', e => { x0 = e.changedTouches[0].clientX; }, { passive: true });
    el.addEventListener('touchend', e => {
      const dx = e.changedTouches[0].clientX - x0;
      if (dx > 40) showCarSlide(carIdx - 1);
      if (dx < -40) showCarSlide(carIdx + 1);
    }, { passive: true });
  })();

  function renderRooms() {
    const T = H.today();
    $('#roomGrid').innerHTML = H.ROOM_TYPES.map(r => {
      const freeTonight = H.unitsFree(r.id, T, H.addDays(T, 1)).length;
      const nPhotos = (r.photos || [r.img]).length;
      return `<article class="room-card reveal" data-room="${r.id}" tabindex="0" aria-label="${r.name}">
        <div class="room-media" data-room-photos="${r.id}"><img src="${r.img}" alt="${r.name}" loading="lazy"><span class="room-badge">${r.badge}</span><span class="photo-cue">${nPhotos} photos</span><span class="room-rate">${H.peso(r.rate)} <small>/ night</small></span></div>
        <div class="room-body">
          <h3>${r.name}</h3>
          <div class="room-meta"><span>${I.users} ${r.base} pax (max ${r.max})</span><span>${I.bed} ${r.units.length} unit${r.units.length > 1 ? 's' : ''}</span></div>
          <p>${r.desc}</p>
          <div class="incl">${r.incl.map(x => `<span>${x}</span>`).join('')}</div>
          <div class="room-foot"><span class="avail-pill ${freeTonight ? '' : 'none'}">${freeTonight ? `● ${freeTonight} available tonight` : '● Fully booked tonight'}</span><button class="btn btn-primary btn-sm" data-book="${r.id}">Book Now</button></div>
        </div></article>`;
    }).join('');
    $$('.room-card').forEach(c => {
      c.addEventListener('click', e => {
        if (e.target.closest('[data-book]')) return;
        openRoomPop(c.dataset.room);
      });
      c.addEventListener('keydown', e => { if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); openRoomPop(c.dataset.room); } });
    });
    $$('[data-book]').forEach(b => b.addEventListener('click', e => { e.stopPropagation(); openBooking({ typeId: b.dataset.book }); }));
    observeReveals();
  }

  /* ---------- reveal on scroll ---------- */
  const io = new IntersectionObserver(es => es.forEach(e => { if (e.isIntersecting) { e.target.classList.add('in'); io.unobserve(e.target); } }), { threshold: .12 });
  function observeReveals() { $$('.reveal:not(.in)').forEach(el => io.observe(el)); }

  /* ---------- nav ---------- */
  $('#hamburger').addEventListener('click', () => $('#navLinks').classList.toggle('open'));
  $$('#navLinks a').forEach(a => a.addEventListener('click', () => $('#navLinks').classList.remove('open')));
  const sections = ['home', 'why', 'amenities', 'rooms', 'testimonials', 'faq', 'contact'].map(id => document.getElementById(id));
  const spy = new IntersectionObserver(es => es.forEach(e => { if (e.isIntersecting) { $$('#navLinks a').forEach(a => a.classList.toggle('active', a.getAttribute('href') === '#' + e.target.id)); } }), { rootMargin: '-40% 0px -55% 0px' });
  sections.forEach(s => spy.observe(s));

  /* ---------- toast ---------- */
  let toastTimer;
  function toast(msg) { const t = $('#toast'); t.textContent = msg; t.classList.add('show'); clearTimeout(toastTimer); toastTimer = setTimeout(() => t.classList.remove('show'), 3200); }

  $('#contactForm').addEventListener('submit', e => { e.preventDefault(); e.target.reset(); toast('Thanks! We\'ll get back to you within the day.'); });

  /* ---------- modals ---------- */
  function openModal(id) { const m = $(id); m.classList.add('open'); m.setAttribute('aria-hidden', 'false'); document.body.style.overflow = 'hidden'; }
  function closeModal(id) { const m = $(id); m.classList.remove('open'); m.setAttribute('aria-hidden', 'true'); document.body.style.overflow = ''; }
  $$('.modal').forEach(m => m.addEventListener('click', e => { if (e.target.hasAttribute('data-close')) closeModal('#' + m.id); }));
  document.addEventListener('keydown', e => {
    if ($('#roomPop') && $('#roomPop').classList.contains('open')) {
      if (e.key === 'Escape') { closeRoomPop(); return; }
      if (e.key === 'ArrowLeft') { showCarSlide(carIdx - 1); return; }
      if (e.key === 'ArrowRight') { showCarSlide(carIdx + 1); return; }
    }
    if (e.key !== 'Escape') return;
    if ($('#amenityPop') && $('#amenityPop').classList.contains('open')) { closeAmenityPop(); return; }
    $$('.modal.open').forEach(m => closeModal('#' + m.id));
  });

  /* ---------- quick availability bar ---------- */
  const T0 = H.today();
  $('#qCheckIn').min = T0; $('#qCheckOut').min = H.addDays(T0, 1);
  $('#qCheckIn').value = H.addDays(T0, 2); $('#qCheckOut').value = H.addDays(T0, 3);
  $('#qCheckIn').addEventListener('change', e => { const v = e.target.value; $('#qCheckOut').min = H.addDays(v, 1); if ($('#qCheckOut').value <= v) $('#qCheckOut').value = H.addDays(v, 1); });
  $('#availForm').addEventListener('submit', e => {
    e.preventDefault();
    const ci = $('#qCheckIn').value, co = $('#qCheckOut').value, pax = +$('#qPax').value;
    if (!ci || !co || co <= ci) return toast('Please choose a valid date range.');
    const fit = H.ROOM_TYPES.find(r => r.max >= pax && H.unitsFree(r.id, ci, co).length);
    openBooking({ typeId: fit ? fit.id : null, checkIn: ci, checkOut: co, adults: Math.min(pax, 6), children: 0 });
  });

  /* ======================================================================
     BOOKING MODAL
     ====================================================================== */
  const bk = { typeId: null, checkIn: null, checkOut: null, adults: 2, children: 0, view: null, selecting: 'in', guest: { name: '', phone: '', email: '', requests: '' } };

  function openBooking(opts = {}) {
    Object.assign(bk, { typeId: opts.typeId || null, checkIn: opts.checkIn || null, checkOut: opts.checkOut || null, adults: opts.adults || 2, children: opts.children || 0, selecting: opts.checkIn && opts.checkOut ? 'in' : (opts.checkIn ? 'out' : 'in') });
    const base = bk.checkIn ? H.parse(bk.checkIn) : new Date();
    bk.view = new Date(base.getFullYear(), base.getMonth(), 1);
    const t = bk.typeId && H.type(bk.typeId);
    if (t && bk.adults + bk.children > t.max) { bk.adults = Math.min(bk.adults, t.max); bk.children = Math.max(0, Math.min(bk.children, t.max - bk.adults)); }
    $('#bookingTitle').textContent = 'Book your stay';
    buildBooking();
    openModal('#bookingModal');
    $('#bookingModal .modal-panel').scrollTop = 0;
  }
  $$('[data-open-booking]').forEach(b => b.addEventListener('click', e => { e.preventDefault(); openBooking({}); }));

  function buildBooking() {
    $('#bookingBody').innerHTML = `
      <div class="booking-layout">
        <div>
          <div class="step"><div class="step-title"><span class="step-num">1</span><h4>Choose your accommodation</h4></div><div class="room-pick" id="roomPick"></div></div>
          <div class="step"><div class="step-title"><span class="step-num">2</span><h4>Select your dates</h4></div>
            <div class="date-fields">
              <div class="field"><label>Check-in</label><div id="fCheckIn">—</div></div>
              <div class="field"><label>Check-out</label><div id="fCheckOut">—</div></div>
            </div>
            <div class="cal-wrap" id="calWrap"></div>
          </div>
          <div class="step"><div class="step-title"><span class="step-num">3</span><h4>How many guests?</h4></div><div class="pax" id="paxWrap"></div><p class="hint" id="paxHint"></p></div>
          <div class="step"><div class="step-title"><span class="step-num">4</span><h4>Guest details</h4></div>
            <div class="form-grid">
              <div class="field"><label>Full name *</label><input id="gName" placeholder="Juan dela Cruz" value="${bk.guest.name}"></div>
              <div class="field"><label>Mobile number *</label><input id="gPhone" placeholder="09XX XXX XXXX" value="${bk.guest.phone}"></div>
              <div class="field full"><label>Email</label><input id="gEmail" type="email" placeholder="you@example.com" value="${bk.guest.email}"></div>
              <div class="field full"><label>Special requests</label><textarea id="gReq" rows="2" placeholder="Early check-in, birthday setup, pet coming along...">${bk.guest.requests}</textarea></div>
            </div>
          </div>
        </div>
        <aside class="summary" id="summary"></aside>
      </div>`;
    ['gName', 'gPhone', 'gEmail', 'gReq'].forEach(id => $('#' + id).addEventListener('input', () => { bk.guest = { name: $('#gName').value.trim(), phone: $('#gPhone').value.trim(), email: $('#gEmail').value.trim(), requests: $('#gReq').value.trim() }; renderSummary(); }));
    renderRoomPick(); renderCalendar(); renderPax(); renderSummary();
  }

  function renderRoomPick() {
    const hasDates = bk.checkIn && bk.checkOut;
    $('#roomPick').innerHTML = H.ROOM_TYPES.map(r => {
      const free = hasDates ? H.unitsFree(r.id, bk.checkIn, bk.checkOut).length : null;
      const un = hasDates && free === 0;
      return `<label class="pick ${bk.typeId === r.id ? 'selected' : ''} ${un ? 'unavail' : ''}" data-type="${r.id}">
        <img src="${r.img}" alt=""><div><b>${r.name}</b><small>${r.base} pax · max ${r.max} · ${r.units.length} unit${r.units.length > 1 ? 's' : ''}${hasDates ? (un ? ' · <span style="color:var(--rose);font-weight:800">Fully booked</span>' : ` · <span style="color:var(--leaf);font-weight:800">${free} left</span>`) : ''}</small></div>
        <div class="price">${H.peso(r.rate)}<small>per night</small></div></label>`;
    }).join('');
    $$('#roomPick .pick').forEach(p => p.addEventListener('click', () => {
      if (p.classList.contains('unavail')) return toast('That accommodation is fully booked for your dates.');
      bk.typeId = p.dataset.type; const t = H.type(bk.typeId);
      if (bk.adults + bk.children > t.max) { bk.adults = Math.min(bk.adults, t.max); bk.children = Math.max(0, Math.min(bk.children, t.max - bk.adults)); }
      if (bk.checkIn && bk.checkOut && !H.unitsFree(bk.typeId, bk.checkIn, bk.checkOut).length) { bk.checkIn = bk.checkOut = null; bk.selecting = 'in'; toast('Please pick new dates for this accommodation.'); }
      renderRoomPick(); renderCalendar(); renderPax(); renderSummary();
    }));
  }

  function renderCalendar() {
    const T = H.today();
    const wrap = $('#calWrap');
    const m1 = bk.view, m2 = new Date(m1.getFullYear(), m1.getMonth() + 1, 1);
    const minMonth = new Date(new Date().getFullYear(), new Date().getMonth(), 1);
    const month = d => {
      const y = d.getFullYear(), m = d.getMonth(); const first = new Date(y, m, 1).getDay(); const dim = new Date(y, m + 1, 0).getDate();
      let cells = '<div class="dow">Su</div><div class="dow">Mo</div><div class="dow">Tu</div><div class="dow">We</div><div class="dow">Th</div><div class="dow">Fr</div><div class="dow">Sa</div>';
      for (let i = 0; i < first; i++) cells += '<span class="day blank"></span>';
      for (let day = 1; day <= dim; day++) {
        const ds = `${y}-${H.pad(m + 1)}-${H.pad(day)}`;
        const cls = ['day']; let title = '';
        if (ds < T) cls.push('off');
        else if (bk.typeId && H.isNightFull(bk.typeId, ds) && !(bk.checkIn && ds === bk.checkIn)) { cls.push('booked'); title = 'Fully booked'; }
        if (ds === T) cls.push('today');
        if (bk.checkIn && ds === bk.checkIn) cls.push('start');
        if (bk.checkOut && ds === bk.checkOut) cls.push('end');
        if (bk.checkIn && bk.checkOut && ds > bk.checkIn && ds < bk.checkOut) cls.push('in-range');
        cells += `<button type="button" class="${cls.join(' ')}" data-date="${ds}" title="${title}">${day}</button>`;
      }
      return `<div class="cal-month"><h5>${H.MONTHS[m]} ${y}</h5><div class="cal-grid">${cells}</div></div>`;
    };
    wrap.innerHTML = `<div class="cal-nav"><button type="button" id="calPrev" ${m1 <= minMonth ? 'disabled style="opacity:.3"' : ''}>‹</button><span style="font-size:.85rem;color:var(--muted);font-weight:700">${bk.selecting === 'out' && bk.checkIn ? 'Now pick your check-out date' : 'Pick your check-in date'}</span><button type="button" id="calNext">›</button></div>
      <div class="cal-months">${month(m1)}${month(m2)}</div>
      <div class="cal-legend"><span><i style="background:var(--royal)"></i>Selected</span><span><i style="background:var(--light-2)"></i>Your stay</span><span><i style="background:repeating-linear-gradient(45deg,#fff,#fff 2px,#f5b5ad 2px,#f5b5ad 4px);border:1px solid #f0c3bd"></i>Fully booked${bk.typeId ? '' : ' (choose a room first)'}</span><span><i style="border:2px dashed var(--leaf-light);background:#fff"></i>Today</span></div>`;
    $('#calPrev').addEventListener('click', () => { bk.view = new Date(m1.getFullYear(), m1.getMonth() - 1, 1); renderCalendar(); });
    $('#calNext').addEventListener('click', () => { bk.view = new Date(m1.getFullYear(), m1.getMonth() + 1, 1); renderCalendar(); });
    $$('#calWrap .day[data-date]').forEach(b => b.addEventListener('click', () => pickDate(b.dataset.date, b.classList.contains('off'), b.classList.contains('booked'))));
    $('#fCheckIn').textContent = bk.checkIn ? H.fmtDate(bk.checkIn, { weekday: 'short', month: 'short', day: 'numeric' }) : '—';
    $('#fCheckOut').textContent = bk.checkOut ? H.fmtDate(bk.checkOut, { weekday: 'short', month: 'short', day: 'numeric' }) : '—';
  }

  function pickDate(ds, off, booked) {
    if (off) return toast('That date has already passed.');
    if (bk.selecting === 'in' || !bk.checkIn) {
      if (booked) return toast('That night is fully booked for this accommodation.');
      bk.checkIn = ds; bk.checkOut = null; bk.selecting = 'out';
    } else {
      if (ds <= bk.checkIn) { if (booked) return toast('That night is fully booked.'); bk.checkIn = ds; bk.checkOut = null; }
      else {
        if (bk.typeId) {
          for (let d = bk.checkIn; d < ds; d = H.addDays(d, 1)) if (H.isNightFull(bk.typeId, d)) { toast('Your range includes a fully booked night. Please choose different dates.'); bk.checkIn = booked ? bk.checkIn : ds; bk.checkOut = null; renderCalendar(); renderRoomPick(); renderSummary(); return; }
        }
        if (H.nightsBetween(bk.checkIn, ds) > 14) return toast('Maximum stay is 14 nights — message us for longer bookings.');
        bk.checkOut = ds; bk.selecting = 'in';
      }
    }
    renderCalendar(); renderRoomPick(); renderSummary();
  }

  function renderPax() {
    const t = bk.typeId ? H.type(bk.typeId) : null; const max = t ? t.max : 6; const total = bk.adults + bk.children;
    $('#paxWrap').innerHTML = `
      <div class="stepper"><div><b>Adults</b><small>Ages 13+</small></div><div class="stepper-ctl"><button type="button" data-p="adults" data-d="-1" ${bk.adults <= 1 ? 'disabled' : ''}>−</button><output>${bk.adults}</output><button type="button" data-p="adults" data-d="1" ${total >= max ? 'disabled' : ''}>+</button></div></div>
      <div class="stepper"><div><b>Children</b><small>Ages 3–12 · under 3 free</small></div><div class="stepper-ctl"><button type="button" data-p="children" data-d="-1" ${bk.children <= 0 ? 'disabled' : ''}>−</button><output>${bk.children}</output><button type="button" data-p="children" data-d="1" ${total >= max ? 'disabled' : ''}>+</button></div></div>`;
    $('#paxHint').innerHTML = t ? `${t.name}: rate covers <b>${t.base} guests</b>, up to <b>${t.max} max</b>. Extra guests are ${H.peso(H.EXTRA_PAX_FEE)} each per night.` : 'Select an accommodation to see its capacity.';
    $$('#paxWrap button').forEach(b => b.addEventListener('click', () => { bk[b.dataset.p] += +b.dataset.d; renderPax(); renderSummary(); }));
  }

  function renderSummary() {
    const t = bk.typeId ? H.type(bk.typeId) : null; const el = $('#summary');
    const nights = bk.checkIn && bk.checkOut ? H.nightsBetween(bk.checkIn, bk.checkOut) : 0;
    const ready = t && nights > 0 && bk.guest.name.length > 1 && bk.guest.phone.replace(/\D/g, '').length >= 10;
    const price = t && nights ? H.calcTotal(t.id, nights, bk.adults + bk.children) : null;
    el.innerHTML = `
      ${t ? `<img src="${t.img}" alt="">` : `<div style="aspect-ratio:16/9;border-radius:12px;background:var(--light-2);display:grid;place-items:center;color:var(--muted);font-weight:700;margin-bottom:.9rem">Select an accommodation</div>`}
      <h4>${t ? t.name : 'Your stay'}</h4>
      <div class="sub">${bk.checkIn && bk.checkOut ? `${H.fmtShort(bk.checkIn)} → ${H.fmtShort(bk.checkOut)} · ${nights} night${nights > 1 ? 's' : ''}` : 'Choose your dates on the calendar'} · ${bk.adults + bk.children} guest${bk.adults + bk.children > 1 ? 's' : ''}</div>
      ${price ? `
        <div class="sum-row"><span class="muted">${H.peso(t.rate)} × ${nights} night${nights > 1 ? 's' : ''}</span><span>${H.peso(price.room)}</span></div>
        ${price.extra ? `<div class="sum-row"><span class="muted">Extra guest${price.extra > 1 ? 's' : ''} (${price.extra}) × ${nights} night${nights > 1 ? 's' : ''}</span><span>${H.peso(price.extraFee)}</span></div>` : ''}
        <div class="sum-row"><span class="muted">Entrance, parking, hot showers, bonfire kit</span><span>Included</span></div>
        <div class="sum-row total"><span>Total</span><span>${H.peso(price.total)}</span></div>
        <div class="sum-row"><span class="muted">50% downpayment to secure</span><b style="color:var(--royal)">${H.peso(price.downpayment)}</b></div>` : `<div class="note-box">Your price breakdown will appear here once you've chosen a room and dates.</div>`}
      <div class="note-box">Free cancellation up to 7 days before check-in. Downpayment via GCash, Maya or BPI — details are sent after you confirm.</div>
      <button class="btn btn-primary btn-block btn-lg" id="confirmBtn" ${ready ? '' : 'disabled'}>Confirm Booking</button>
      ${!ready ? `<p class="hint" style="text-align:center">${!t ? 'Select an accommodation' : !nights ? 'Pick your check-in and check-out dates' : 'Enter your name and mobile number'} to continue.</p>` : ''}`;
    const btn = $('#confirmBtn'); if (btn) btn.addEventListener('click', confirmBooking);
  }

  function confirmBooking() {
    try {
      const b = H.createBooking({ typeId: bk.typeId, checkIn: bk.checkIn, checkOut: bk.checkOut, adults: bk.adults, children: bk.children, guest: { name: bk.guest.name, phone: bk.guest.phone, email: bk.guest.email }, requests: bk.guest.requests, source: 'website' });
      const t = H.type(b.typeId); const nights = H.nightsBetween(b.checkIn, b.checkOut); const price = H.calcTotal(b.typeId, nights, b.adults + b.children);
      $('#bookingTitle').textContent = 'Booking confirmed';
      $('#bookingBody').innerHTML = `<div class="confirm">
        <div class="check">${I.check}</div>
        <h3 style="margin-bottom:.2rem">See you at the campsite, ${b.guest.name.split(' ')[0]}!</h3>
        <p style="color:var(--muted)">Your reservation is on hold. Settle the downpayment within 24 hours to secure it.</p>
        <div class="ref">${b.ref}</div>
        <div class="confirm-details">
          <div class="sum-row"><span class="muted">Accommodation</span><b>${t.name} · Unit ${b.unit}</b></div>
          <div class="sum-row"><span class="muted">Check-in</span><b>${H.fmtDate(b.checkIn, { weekday: 'short', month: 'short', day: 'numeric', year: 'numeric' })} · 2 PM</b></div>
          <div class="sum-row"><span class="muted">Check-out</span><b>${H.fmtDate(b.checkOut, { weekday: 'short', month: 'short', day: 'numeric', year: 'numeric' })} · 11 AM</b></div>
          <div class="sum-row"><span class="muted">Guests</span><b>${b.adults} adult${b.adults > 1 ? 's' : ''}${b.children ? `, ${b.children} child${b.children > 1 ? 'ren' : ''}` : ''}</b></div>
          <div class="sum-row"><span class="muted">Nights</span><b>${nights}</b></div>
          <div class="sum-row total"><span>Total</span><span>${H.peso(price.total)}</span></div>
          <div class="sum-row"><span class="muted">Downpayment due (50%)</span><b style="color:var(--royal)">${H.peso(price.downpayment)}</b></div>
        </div>
        ${paymentSection(b, price.downpayment)}
        <button class="btn btn-primary btn-lg" data-close>Done</button>
      </div>`;
      bindPayment(b, price.downpayment);
      bk.guest = { name: '', phone: '', email: '', requests: '' };
      $('#bookingModal .modal-panel').scrollTop = 0;
      renderRooms();
      toast('Booking saved! Reference ' + b.ref);
    } catch (err) { toast(err.message); renderCalendar(); renderRoomPick(); renderSummary(); }
  }

  /* ---------- payment section (GCash QR + receipt upload) ---------- */
  const gcashLogo = '<i><svg viewBox="0 0 24 24" fill="none" stroke="#007dfe" stroke-width="3.2" stroke-linecap="round"><path d="M17.5 8.2A7 7 0 1 0 19 12"/><path d="M12 12h7"/></svg></i>';
  function paymentSection(b, due) {
    return `<div class="pay-section" id="paySection">
      <div class="pay-head">
        <div><h4>Secure your booking — pay the 50% downpayment</h4><p>Scan the GCash QR, then upload your receipt below. We verify within a few hours and text you a confirmation.</p></div>
        <div class="pay-due"><small>Amount due now</small><b>${H.peso(due)}</b></div>
      </div>
      <div class="pay-body">
        <div class="gcash-card">
          <div class="gcash-brand">${gcashLogo}GCash</div>
          <div class="gcash-qr"><img src="assets/gcash-qr.png" alt="GCash QR code for Heaven Haven Campsite"></div>
          <div class="gcash-meta"><b>${H.PAYMENT.gcashName}</b><span class="num">${H.PAYMENT.gcashNumber}</span><small>Scan to Pay · Transfer fees may apply</small></div>
          <span class="gcash-badge">Sample QR for demo</span>
        </div>
        <div>
          <ol class="pay-steps">
            <li><span>1</span><div>Open GCash → <b>QR</b> → scan the code, or <b>Send Money</b> to <b>${H.PAYMENT.gcashNumber}</b>.</div></li>
            <li><span>2</span><div>Enter <b>${H.peso(due)}</b> and put <b>${b.ref}</b> in the message.</div></li>
            <li><span>3</span><div>Screenshot the receipt and upload it here (or send it to ${H.PAYMENT.gcashNumber} / hello@heavenhavencampsite.ph).</div></li>
          </ol>
          <div class="pay-alt"><span>Also accepted: Maya ${H.PAYMENT.mayaNumber}</span><span>${H.PAYMENT.bank}</span></div>
          <div id="uploadWrap">
            <label class="upload-zone" id="uploadZone">
              <input type="file" id="receiptFile" accept="image/*,.pdf">
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M12 16V4M7 9l5-5 5 5"/><path d="M4 15v3a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2v-3"/></svg>
              <b>Upload your GCash receipt</b><small>Tap to choose a screenshot, or drag &amp; drop · JPG, PNG or PDF up to 8 MB</small>
            </label>
          </div>
          <div class="pay-fields">
            <div class="field"><label>GCash reference no. (optional)</label><input id="payRef" inputmode="numeric" maxlength="13" placeholder="13-digit ref no."></div>
            <div class="field"><label>Amount sent</label><input id="payAmt" type="number" min="1" value="${Math.round(due)}"></div>
          </div>
          <div class="pay-submit"><button class="btn btn-gcash btn-lg" id="paySubmit" disabled>Submit receipt</button><span class="hint" style="margin:0" id="payHint">Upload a receipt to enable this button.</span></div>
        </div>
      </div>
    </div>`;
  }

  function bindPayment(b, due) {
    let file = null, dataUrl = '';
    const zone = $('#uploadZone'), input = $('#receiptFile');
    const setFile = f => {
      if (!f) return;
      if (f.size > 8 * 1024 * 1024) return toast('That file is over 8 MB — please upload a smaller screenshot.');
      file = f;
      const done = url => {
        dataUrl = url;
        $('#uploadWrap').innerHTML = `<div class="upload-preview">${url && f.type.startsWith('image/') ? `<img src="${url}" alt="Receipt preview">` : `<div class="upload-pdf">PDF</div>`}<div><b>${f.name}</b><small>${(f.size / 1024).toFixed(0)} KB · ready to submit</small><br><button type="button" class="btn btn-soft btn-sm" id="changeFile">Change file</button></div></div>`;
        $('#changeFile').addEventListener('click', () => { $('#uploadWrap').innerHTML = zone.outerHTML; file = null; dataUrl = ''; $('#paySubmit').disabled = true; $('#payHint').textContent = 'Upload a receipt to enable this button.'; wire(); });
        $('#paySubmit').disabled = false; $('#payHint').textContent = 'Looks good — submit when ready.';
      };
      if (f.type.startsWith('image/')) shrinkImage(f, 900, 0.72).then(done).catch(() => done(''));
      else done('');
    };
    const wire = () => {
      const z = $('#uploadZone'), i = $('#receiptFile'); if (!z) return;
      i.addEventListener('change', () => setFile(i.files[0]));
      ['dragenter', 'dragover'].forEach(ev => z.addEventListener(ev, e => { e.preventDefault(); z.classList.add('drag'); }));
      ['dragleave', 'drop'].forEach(ev => z.addEventListener(ev, e => { e.preventDefault(); z.classList.remove('drag'); }));
      z.addEventListener('drop', e => setFile(e.dataTransfer.files[0]));
    };
    wire();
    $('#paySubmit').addEventListener('click', () => {
      if (!file) return;
      const gcashRef = $('#payRef').value.trim(); const amount = +$('#payAmt').value || due;
      H.attachReceipt(b.ref, { method: 'gcash', amount, gcashRef, receipt: dataUrl, receiptName: file.name });
      $('#paySection').innerHTML = `<div class="pay-head"><div><h4>Receipt received — thank you!</h4><p>We'll verify your ${H.peso(amount)} GCash payment and text ${b.guest.phone} once ${b.ref} is fully confirmed (usually within a few hours).</p></div><div class="pay-due"><small>Status</small><b style="font-size:1.1rem;color:#0068d6">For verification</b></div></div>
        <div style="padding:1.2rem 1.4rem"><div class="pay-done"><div class="ok">${I.check}</div><div><b>${file.name}</b><small>${gcashRef ? 'GCash ref ' + gcashRef + ' · ' : ''}Uploaded ${new Date().toLocaleString('en-PH', { month: 'short', day: 'numeric', hour: 'numeric', minute: '2-digit' })}</small></div></div></div>`;
      toast('Receipt submitted for verification.');
    });
  }

  function shrinkImage(file, max, quality) {
    return new Promise((resolve, reject) => {
      const img = new Image(); const url = URL.createObjectURL(file);
      img.onload = () => {
        const s = Math.min(1, max / Math.max(img.width, img.height));
        const c = document.createElement('canvas'); c.width = Math.round(img.width * s); c.height = Math.round(img.height * s);
        c.getContext('2d').drawImage(img, 0, 0, c.width, c.height); URL.revokeObjectURL(url);
        resolve(c.toDataURL('image/jpeg', quality));
      };
      img.onerror = reject; img.src = url;
    });
  }

  /* ======================================================================
     LOGIN
     ====================================================================== */
  const ACCOUNTS = { admin: { pass: 'admin123', role: 'admin', name: 'May (Admin)' }, owner: { pass: 'owner123', role: 'owner', name: 'Owner' } };
  function openLogin() { $('#loginError').style.display = 'none'; $('#loginForm').reset(); openModal('#loginModal'); setTimeout(() => $('#loginUser').focus(), 50); }
  $('#loginBtn').addEventListener('click', openLogin);
  $('#footLogin').addEventListener('click', e => { e.preventDefault(); openLogin(); });
  const MAP_EMBED = 'https://www.google.com/maps?q=14.2001406,120.762559+(Heaven+Haven+Campsite)&z=16&hl=en&output=embed';
  $('#openMapBtn').addEventListener('click', () => {
    const frame = $('#mapPopFrame');
    if (!frame.getAttribute('src')) frame.src = MAP_EMBED;
    openModal('#mapModal');
  });
  $('#loginForm').addEventListener('submit', e => {
    e.preventDefault();
    const u = $('#loginUser').value.trim().toLowerCase(), p = $('#loginPass').value;
    const acc = ACCOUNTS[u];
    if (!acc || acc.pass !== p) { $('#loginError').style.display = 'block'; return; }
    sessionStorage.setItem('hh_session', JSON.stringify({ user: u, role: acc.role, name: acc.name, at: Date.now() }));
    window.location.href = 'dashboard.html';
  });
  if (location.hash === '#login') { history.replaceState(null, '', location.pathname); openLogin(); }

  /* ---------- boot ---------- */
  renderRooms();
  observeReveals();
})();
