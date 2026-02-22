// ============================================================
// FitLife Gym Management System — Data Layer
// ============================================================
// All arrays below are EMPTY — backend team populates these
// via API calls (PHP endpoints / MySQL / MongoDB).
// ============================================================

// ── Runtime state (populated after API fetch) ──
let members  = [];   // from: GET /api/members
let trainers = [];   // from: GET /api/trainers
let plans    = [];   // from: GET /api/membership_plans
let classes  = [];   // from: GET /api/classes
let bookings = [];   // from: GET /api/bookings
let payments = [];   // from: GET /api/payments
let payouts  = [];   // from: GET /api/trainer_payouts
let attendanceLogs = []; // from: GET /api/attendance_logs (MongoDB)
let auditLogs      = []; // from: GET /api/audit_logs      (MongoDB)

// ── Current logged-in admin (set after login.php responds) ──
let currentAdmin = null; // { id, name, role: 'super_admin' | 'staff' }

// ── Lookup lists (can be fetched from service_type / enum tables) ──
const WORKOUT_PROGRAMS = [
  'Powerlifting', 'HIIT', 'Yoga', 'Zumba',
  'Mobility', 'Boxing', 'Swim Endurance', 'Strength Training'
];
const PAYMENT_METHODS  = ['GCash', 'Card', 'Cash'];
const MEMBER_STATUSES  = ['active', 'expired', 'banned'];
const PAYOUT_STATUSES  = ['pending', 'paid'];

// ============================================================
// API STUBS — replace stub bodies with real fetch() calls
// ============================================================
async function apiGet(endpoint) {
  // const res = await fetch(`/api/${endpoint}`);
  // if (!res.ok) throw new Error(res.statusText);
  // return res.json();
  return [];
}

async function apiPost(endpoint, body) {
  // const res = await fetch(`/api/${endpoint}`, {
  //   method: 'POST',
  //   headers: { 'Content-Type': 'application/json' },
  //   body: JSON.stringify(body)
  // });
  // return res.json();
  return { success: true };
}

async function apiPut(endpoint, body) {
  // const res = await fetch(`/api/${endpoint}`, {
  //   method: 'PUT',
  //   headers: { 'Content-Type': 'application/json' },
  //   body: JSON.stringify(body)
  // });
  // return res.json();
  return { success: true };
}

async function apiDelete(endpoint) {
  // const res = await fetch(`/api/${endpoint}`, { method: 'DELETE' });
  // return res.json();
  return { success: true };
}

// ── Helpers ──
function formatCurrency(amount) {
  if (amount === null || amount === undefined) return '—';
  return `$${parseFloat(amount).toFixed(2)}`;
}

function formatDisplayDate(dateStr) {
  if (!dateStr) return '—';
  const d = new Date(dateStr);
  return isNaN(d) ? dateStr : `${d.getMonth()+1}/${d.getDate()}/${d.getFullYear()}`;
}
