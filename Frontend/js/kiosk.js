// ============================================================
// RFID Kiosk Logic — pixel-accurate to PDF mockups
// ============================================================

function initKiosk() {
  const input   = document.getElementById('rfid-input');
  const scanBtn = document.getElementById('scan-btn');
  if (!input) return;
  scanBtn.addEventListener('click', handleRFIDScan);
  input.addEventListener('keydown', e => { if (e.key === 'Enter') handleRFIDScan(); });
}

function handleRFIDScan() {
  const input = document.getElementById('rfid-input');
  const rfid  = input.value.trim().toUpperCase();
  if (!rfid) return;

  const member = members.find(m => m.rfid.toUpperCase() === rfid || m.id.toUpperCase() === rfid);
  if (member) { toggleMemberStatus(member); renderMemberCard(member); input.value = ''; startSessionTimer(() => { document.getElementById('kiosk-screen').classList.add('hidden'); document.getElementById('login-screen').classList.remove('hidden'); document.getElementById('kiosk-result').innerHTML = ''; }); return; }

  const trainer = trainers.find(t => t.rfid.toUpperCase() === rfid || t.id.toUpperCase() === rfid);
  if (trainer) { toggleTrainerStatus(trainer); renderTrainerCard(trainer); input.value = ''; startSessionTimer(() => { document.getElementById('kiosk-screen').classList.add('hidden'); document.getElementById('login-screen').classList.remove('hidden'); document.getElementById('kiosk-result').innerHTML = ''; }); return; }

  document.getElementById('kiosk-result').innerHTML = `
    <div class="error-card">
      <div class="error-icon">⚠</div>
      <h3>RFID Not Recognized</h3>
      <p>No member or trainer found with ID: <strong>${rfid}</strong></p>
    </div>`;
  input.value = '';
}

function toggleMemberStatus(member) {
  const now = new Date();
  if (!member.loggedIn) { member.loggedIn = true;  member.loginTime = now; }
  else                  { member.loggedIn = false; member.loginTime = null; }
}

function toggleTrainerStatus(trainer) {
  const now = new Date();
  if (!trainer.loggedIn) { trainer.loggedIn = true;  trainer.clockInTime = now; }
  else                   { trainer.loggedIn = false; trainer.clockInTime = null; }
}

// SVG ICONS (reusable inline)
const SVG_USER    = `<svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="#3b82f6" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"><path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"/><circle cx="12" cy="7" r="4"/></svg>`;

// PDF trainer icon = the same dual-circle dumbbell/barbell as brand logo (purple)
const SVG_DUMBBELL = `<svg width="28" height="28" viewBox="0 0 100 100" fill="none" xmlns="http://www.w3.org/2000/svg">
  <circle cx="20" cy="50" r="14" fill="#7c3aed" opacity="0.15" stroke="#7c3aed" stroke-width="5"/>
  <circle cx="80" cy="50" r="14" fill="#7c3aed" opacity="0.15" stroke="#7c3aed" stroke-width="5"/>
  <circle cx="20" cy="50" r="7"  fill="#7c3aed"/>
  <circle cx="80" cy="50" r="7"  fill="#7c3aed"/>
  <rect x="27" y="46" width="46" height="8" rx="4" fill="#7c3aed"/>
</svg>`;

const SVG_CALENDAR = `<svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="#64748b" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><rect x="3" y="4" width="18" height="18" rx="2"/><line x1="16" y1="2" x2="16" y2="6"/><line x1="8" y1="2" x2="8" y2="6"/><line x1="3" y1="10" x2="21" y2="10"/></svg>`;

const SVG_PULSE    = `<svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="#64748b" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><polyline points="22 12 18 12 15 21 9 3 6 12 2 12"/></svg>`;

const SVG_CLOCK_GREEN = `<svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="#16a34a" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="12" r="10"/><polyline points="12 6 12 12 16 14"/></svg>`;

const SVG_CHECK    = `<svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><polyline points="20 6 9 17 4 12"/></svg>`;

const SVG_BOLT     = `<svg width="10" height="10" viewBox="0 0 24 24" fill="#f59e0b"><polygon points="13 2 3 14 12 14 11 22 21 10 12 10 13 2"/></svg>`;


// ══════════════════════════════════════════════════════════════
// MEMBER CARD  — matches PDF "MEMBER DASHBOARD" page exactly
// ══════════════════════════════════════════════════════════════
function renderMemberCard(member) {
  const container   = document.getElementById('kiosk-result');
  const isExpired   = isMembershipExpired(member.expiry);

  // Header status badge
  const statusLabel = member.loggedIn ? '✓ Logged In' : '✗ Logged Out';
  const statusClass = member.loggedIn ? 'badge-green' : 'badge-gray';

  // Membership Status (left col box 2)
  let memberStatusText  = 'Active';
  let memberStatusColor = 'green';
  if (member.status === 'banned')      { memberStatusText = 'Banned';  memberStatusColor = 'red'; }
  else if (isExpired)                  { memberStatusText = 'Expired'; memberStatusColor = 'red'; }
  else if (member.status !== 'active') { memberStatusText = member.status.charAt(0).toUpperCase() + member.status.slice(1); memberStatusColor = 'red'; }

  // Plan badge label  Gold→Premium  Silver→Standard  (corner badge inside box 1)
  const planBadgeLabel = member.plan === 'Gold' ? 'Premium' : 'Standard';

  // ── TODAY'S SESSIONS (right col box 1) ──
  // PDF Gold member (John Smith): shows named sessions with green "Scheduled" badge
  // PDF Silver member: shows "Personal training sessions available with [Gold Membership] pill"
  let sessionsHTML = '';
  if (member.plan === 'Gold' && member.sessions.length > 0) {
    sessionsHTML = member.sessions.map(s => `
      <div class="sess-card sess-card-gold">
        <div class="sess-row-top">
          <span class="sess-name">${s.program}</span>
          <span class="sess-badge-green">Scheduled</span>
        </div>
        <div class="sess-time">${SVG_CLOCK_GREEN.replace('stroke="#16a34a"','stroke="#64748b"').replace('width="15" height="15"','width="11" height="11"')} ${s.time}</div>
      </div>`).join('');
  } else if (member.plan === 'Silver') {
    sessionsHTML = `
      <div class="sess-upgrade-wrap">
        <p class="sess-upgrade-text">Personal training sessions available with</p>
        <span class="sess-gold-pill">Gold Membership</span>
      </div>`;
  } else {
    sessionsHTML = `<p class="sess-empty">No sessions scheduled today</p>`;
  }

  // ── ACCESS BOX (right col box 2) ──
  const accessTitle = member.loggedIn ? 'Access Granted' : 'Access Denied';
  const accessSub   = member.loggedIn && member.loginTime
    ? `Logged in at ${formatTime(member.loginTime)}`
    : 'Not currently logged in';

  container.innerHTML = `
    <div class="portal-card">

      <!-- ── HEADER ── -->
      <div class="portal-header">
        <div class="portal-header-left">
          <div class="portal-icon-circle">${SVG_USER}</div>
          <div>
            <div class="portal-name">${member.name}</div>
            <div class="portal-sub">Member ID: ${member.id}</div>
          </div>
        </div>
        <span class="hdr-badge ${statusClass}">${statusLabel}</span>
      </div>

      <!-- ── BODY GRID ── -->
      <div class="portal-body">

        <!-- LEFT COLUMN -->
        <div class="portal-col">

          <!-- Box 1: Membership Type  (blue, corner badge) -->
          <div class="pbox pbox-blue pbox-relative">
            <div class="pbox-label">Membership Type</div>
            <div class="pbox-value pbox-val-blue">${member.plan}</div>
            <span class="pbox-corner-badge">${planBadgeLabel}</span>
          </div>

          <!-- Box 2: Membership Status  (green border, no bg tint per PDF) -->
          <div class="pbox pbox-green">
            <div class="pbox-label">Membership Status</div>
            <div class="pbox-value pbox-val-${memberStatusColor}">${memberStatusText}</div>
            <div class="pbox-sub">Expires: ${member.expiry}</div>
          </div>

          <!-- Box 3: Current Weight  (purple border, no bg tint per PDF) -->
          <div class="pbox pbox-purple">
            <div class="pbox-label">Current Weight</div>
            <div class="pbox-value pbox-val-purple">${member.weight} kg</div>
            <div class="pbox-sub">BMI: ${member.bmi}</div>
          </div>

        </div>

        <!-- RIGHT COLUMN -->
        <div class="portal-col">

          <!-- Box 1: Today's Sessions  (yellow, inner nested white cards) -->
          <div class="pbox pbox-yellow pbox-sessions">
            <div class="pbox-header-row">${SVG_CALENDAR}<span class="pbox-header-title">Today's Sessions</span></div>
            <div class="pbox-sessions-body">${sessionsHTML}</div>
          </div>

          <!-- Box 2: Access Granted  (green bg) -->
          <div class="pbox pbox-green-solid">
            <div class="pbox-access-row">
              <span class="pbox-check-circle pbox-check-green">${SVG_CHECK}</span>
              <div>
                <div class="pbox-access-title">${accessTitle}</div>
                <div class="pbox-access-sub">${accessSub}</div>
              </div>
            </div>
          </div>

        </div>
      </div>
    </div>
    <div class="kiosk-scan-hint">${SVG_BOLT} Scan again to log out</div>`;
}


// ══════════════════════════════════════════════════════════════
// TRAINER CARD  — matches PDF "TRAINER PORTAL" page exactly
// ══════════════════════════════════════════════════════════════
function renderTrainerCard(trainer) {
  const container   = document.getElementById('kiosk-result');
  const statusLabel = trainer.loggedIn ? '✓ Clocked In' : '✗ Clocked Out';
  const statusClass = trainer.loggedIn ? 'badge-green' : 'badge-gray';
  const clockTime   = trainer.loggedIn && trainer.clockInTime ? formatTime(trainer.clockInTime) : '--:--:-- --';
  const clockDate   = trainer.loggedIn && trainer.clockInTime ? formatDate(trainer.clockInTime) : '';

  // Sessions — white card, blue border, name + #N blue badge + clock time + "Client: X"
  const sessionsHTML = trainer.sessions.length > 0
    ? trainer.sessions.map((s, i) => `
        <div class="sess-card sess-card-trainer">
          <div class="sess-row-top">
            <span class="sess-name">${s.program}</span>
            <span class="sess-badge-blue">#${i + 1}</span>
          </div>
          <div class="sess-time">${SVG_CLOCK_GREEN.replace('stroke="#16a34a"','stroke="#64748b"').replace('width="15" height="15"','width="11" height="11"')} ${s.time}</div>
          <div class="sess-client">Client: ${s.client}</div>
        </div>`).join('')
    : `<p class="sess-empty">No sessions today</p>`;

  container.innerHTML = `
    <div class="portal-card">

      <!-- ── HEADER ── -->
      <div class="portal-header">
        <div class="portal-header-left">
          <div class="portal-icon-circle">${SVG_DUMBBELL}</div>
          <div>
            <div class="portal-name">${trainer.name}</div>
            <div class="portal-sub">Trainer ID: ${trainer.id}</div>
          </div>
        </div>
        <span class="hdr-badge ${statusClass}">${statusLabel}</span>
      </div>

      <!-- ── BODY GRID ── -->
      <div class="portal-body">

        <!-- LEFT COLUMN -->
        <div class="portal-col">

          <!-- Box 1: Specialization  (purple border, no bg tint per PDF) -->
          <div class="pbox pbox-purple">
            <div class="pbox-label">Specialization</div>
            <div class="pbox-value pbox-val-purple">${trainer.specialization}</div>
          </div>

          <!-- Box 2: Clock In Time  (green border, clock icon beside value) -->
          <div class="pbox pbox-green">
            <div class="pbox-label">Clock In Time</div>
            <div class="pbox-clock-row">
              ${SVG_CLOCK_GREEN}
              <div>
                <div class="pbox-value pbox-val-green">${clockTime}</div>
                <div class="pbox-sub pbox-sub-dark">${clockDate}</div>
              </div>
            </div>
          </div>

          <!-- Box 3: Rate per Session  (blue border + bg per PDF) -->
          <div class="pbox pbox-blue">
            <div class="pbox-label">Rate per Session</div>
            <div class="pbox-value pbox-val-blue">$${trainer.ratePerSession}</div>
          </div>

        </div>

        <!-- RIGHT COLUMN -->
        <div class="portal-col">

          <!-- Box 1: Today's Sessions  (yellow, heartbeat/pulse icon) -->
          <div class="pbox pbox-yellow pbox-sessions">
            <div class="pbox-header-row">${SVG_PULSE}<span class="pbox-header-title">Today's Sessions</span></div>
            <div class="pbox-sessions-body">${sessionsHTML}</div>
          </div>

          <!-- Box 2: On Duty  (green bg) -->
          <div class="pbox pbox-green-solid">
            <div class="pbox-access-row">
              <span class="pbox-check-circle pbox-check-green">${SVG_CHECK}</span>
              <div>
                <div class="pbox-access-title">On Duty</div>
                <div class="pbox-access-sub pbox-sub-green">Ready for ${trainer.sessions.length} session(s)</div>
              </div>
            </div>
          </div>

        </div>
      </div>
    </div>
    <div class="kiosk-scan-hint">${SVG_BOLT} Scan again to log out</div>`;
}
