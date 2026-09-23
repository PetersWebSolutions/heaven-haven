# Heaven Haven Campsite — Website + Admin/Owner Dashboard

A complete static website for a private mountain campsite, with an online booking
pop-up and a role-based back office. No build step — plain HTML/CSS/JS.

## Run it

```bash
cd site
python3 serve.py 8000   # no-cache static server (or: python3 -m http.server 8000)
# open http://localhost:8000
```

(Any static host works: Netlify, GitHub Pages, cPanel, etc. Just upload this folder.)

### GitHub Pages

This repo is Pages-ready (`index.html` at the root, `.nojekyll` included). In the repo go to
**Settings → Pages → Build and deployment → Source: Deploy from a branch → `main` / `(root)`**.
The site will be published at <https://petersweb.github.io/heaven-haven/> within a minute or two.
Because the demo data lives in the browser's localStorage, every visitor gets their own sandbox copy.

## Logins (top-right "Login" button)

| Role  | Username | Password  | Sees                                                                 |
|-------|----------|-----------|----------------------------------------------------------------------|
| Admin | `admin`  | `admin123`| Overview, Room status board, Bookings                                |
| Owner | `owner`  | `owner123`| Everything Admin sees + Inventory, Monthly Sales, Revenue & Profit, Expenses, Employees & Salary |

## What's inside

```
site/
├─ index.html          Public website (hero, why us, amenities, rooms & rates, testimonials, contact)
├─ dashboard.html      Admin / Owner dashboard (role decided by login)
├─ css/styles.css      Shared design system — light green + royal green palette
├─ css/dashboard.css   Dashboard layout
├─ js/store.js         Data layer (rooms, units, bookings, finance, staff) saved in localStorage
├─ js/main.js          Website logic: booking pop-up (rooms, calendar, pax), login
├─ js/dashboard.js     Dashboard views, charts (pure SVG), actions
├─ assets/
│  ├─ hero.jpg         Photo 1 (hero)
│  ├─ logo*.png        Lettering extracted from the brand artwork, transparent background
│  │                   (logo = stacked, logo-wide = one line, logo-nav = compact; *-white = for dark backgrounds)
│  └─ rooms/*.jpg      Room photos
└─ tools/make_logo.py  Script that extracted the lettering from the photos
```

## How the booking flow works

1. Click any room card, "Book Now", or use the Check-availability bar.
2. Pick accommodation → pick check-in/check-out on the calendar (fully booked nights are
   striped and unselectable) → set adults/children (capped at the room's max) → enter guest
   details → Confirm.
3. A booking reference (e.g. `HH-2609-K7PD`) is issued and the reservation is stored.
   It immediately appears in the dashboard's Bookings list, and the unit's status updates.
4. The confirmation screen shows the **GCash payment section**: a scannable-looking QR
   (`assets/gcash-qr.png` — a sample; replace with the resort's real GCash QR), the GCash
   number, the exact downpayment (50%), and a **receipt upload** box (JPG/PNG/PDF ≤ 8 MB,
   drag & drop or tap). Optional GCash reference no. + amount fields. Submitting marks the
   booking **For verification**.

## Payment verification (dashboard)

* Payment states: **Unpaid → For verification → Paid**.
* Bookings → filter "Payment to verify" (or the "Payments to verify" panel on Overview /
  the "N to verify" badge on the sidebar).
* **Review receipt** opens the uploaded screenshot with the ref no. and amount;
  **Approve & mark paid** or **Reject — ask to resend** (clears the receipt, back to Unpaid).
* **Mark paid** on an unpaid booking records a cash/GCash payment directly (walk-ins).
* Uploaded images are downscaled (≤ 900 px JPEG) before being stored in localStorage.

## Inventory: owner vs admin

* **Admin** sees stock levels but can't change them directly. He files **requests**:
  *Request restock* (add) or *Log usage* (deduct), each with a quantity and a **required reason**.
  Requests stay *Pending* until the owner decides; the admin sees the outcome (and the owner's
  note if rejected) under "My requests".
* **Owner** adjusts stock directly (−1 / +1 / Adjust… / add or remove items) and approves or
  rejects the admin's requests (Inventory → "Requests from admin", badge in the sidebar and a
  panel on Overview).
* Columns: **Origin stock** = level after the owner's last direct action (or an approved
  restock) · **Admin deductions** = approved admin deductions since then ("view log" shows the
  itemised entries) · **Current** = Origin − Admin deductions. Approving a restock re-bases the
  origin and resets the counter; approving a deduction grows the counter.
* "Deductions made by admin" lists every approved deduction with date, qty, reason, approver.

## Room statuses (dashboard)

* **Available** – vacant & bookable
* **Not Available** – occupied by a guest or blocked (maintenance)
* **For Cleaning** – guest checked out, housekeeping pending
* **Ready** – cleaned & set up for an arriving guest

Check-in → Not Available · Check-out → For Cleaning · Mark cleaned → Available.

## Notes

* All data lives in the browser's localStorage (demo). "Reset demo data" in the dashboard
  restores the sample dataset. To go live you'd connect `js/store.js` to a backend
  (and a channel manager if you want Booking.com / Airbnb sync).
* Contact details, address, GCash/bank numbers, prices and staff salaries are placeholders —
  edit them in `index.html` and `js/store.js` (`ROOM_TYPES`, `STAFF`, `PAYMENT`).
* The GCash QR (`assets/gcash-qr.png`) and the seeded sample receipt
  (`assets/sample-receipt.jpg`) are made-up demo images — swap in the real QR from the
  GCash app (Profile → My QR) before going live.
