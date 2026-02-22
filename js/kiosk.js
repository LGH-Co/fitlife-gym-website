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

<<<<<<< HEAD:Frontend/js/kiosk.js
  const member = members.find(m => m.rfid.toUpperCase() === rfid || m.id.toUpperCase() === rfid);
  if (member) { toggleMemberStatus(member); renderMemberCard(member); input.value = ''; startSessionTimer(() => { document.getElementById('kiosk-screen').classList.add('hidden'); document.getElementById('login-screen').classList.remove('hidden'); document.getElementById('kiosk-result').innerHTML = ''; }); return; }

  const trainer = trainers.find(t => t.rfid.toUpperCase() === rfid || t.id.toUpperCase() === rfid);
  if (trainer) { toggleTrainerStatus(trainer); renderTrainerCard(trainer); input.value = ''; startSessionTimer(() => { document.getElementById('kiosk-screen').classList.add('hidden'); document.getElementById('login-screen').classList.remove('hidden'); document.getElementById('kiosk-result').innerHTML = ''; }); return; }
=======
  const member = members.find(m =>
    m.rfid.toUpperCase() === rfid || m.id.toUpperCase() === rfid);
  if (member) {
    toggleMemberStatus(member);
    renderMemberCard(member);
    input.value = '';
    return;
  }

  const trainer = trainers.find(t =>
    t.rfid.toUpperCase() === rfid || t.id.toUpperCase() === rfid);
  if (trainer) {
    toggleTrainerStatus(trainer);
    renderTrainerCard(trainer);
    input.value = '';
    return;
  }
>>>>>>> 563acea (Added body metrics and change the contents):js/kiosk.js

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

// ── SVG Icons ──
const SVG_USER = `<svg width="28" height="28" viewBox="0 0 24 24" fill="none"
  stroke="#3b82f6" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round">
  <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"/>
  <circle cx="12" cy="7" r="4"/>
</svg>`;

const SVG_DUMBBELL = `<svg width="28" height="28" viewBox="0 0 100 100" fill="none">
  <circle cx="20" cy="50" r="14" fill="#7c3aed" opacity="0.15" stroke="#7c3aed" stroke-width="5"/>
  <circle cx="80" cy="50" r="14" fill="#7c3aed" opacity="0.15" stroke="#7c3aed" stroke-width="5"/>
  <circle cx="20" cy="50" r="7"  fill="#7c3aed"/>
  <circle cx="80" cy="50" r="7"  fill="#7c3aed"/>
  <rect x="27" y="46" width="46" height="8" rx="4" fill="#7c3aed"/>
</svg>`;

const SVG_CALENDAR = `<svg width="13" height="13" viewBox="0 0 24 24" fill="none"
  stroke="#64748b" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
  <rect x="3" y="4" width="18" height="18" rx="2"/>
  <line x1="16" y1="2" x2="16" y2="6"/>
  <line x1="8"  y1="2" x2="8"  y2="6"/>
  <line x1="3"  y1="10" x2="21" y2="10"/>
</svg>`;

const SVG_PULSE = `<svg width="13" height="13" viewBox="0 0 24 24" fill="none"
  stroke="#64748b" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
  <polyline points="22 12 18 12 15 21 9 3 6 12 2 12"/>
</svg>`;

const SVG_CLOCK_GRAY = `<svg width="11" height="11" viewBox="0 0 24 24" fill="none"
  stroke="#64748b" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
  <circle cx="12" cy="12" r="10"/>
  <polyline points="12 6 12 12 16 14"/>
</svg>`;

const SVG_CLOCK_GREEN = `<svg width="15" height="15" viewBox="0 0 24 24" fill="none"
  stroke="#16a34a" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
  <circle cx="12" cy="12" r="10"/>
  <polyline points="12 6 12 12 16 14"/>
</svg>`;

const SVG_CHECK = `<svg width="13" height="13" viewBox="0 0 24 24" fill="none"
  stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round">
  <polyline points="20 6 9 17 4 12"/>
</svg>`;

const SVG_BOLT = `<svg width="10" height="10" viewBox="0 0 24 24" fill="#f59e0b">
  <polygon points="13 2 3 14 12 14 11 22 21 10 12 10 13 2"/>
</svg>`;

// ── Member Card ──
function renderMemberCard(member) {
  const container   = document.getElementById('kiosk-result');
  const isExpired   = isMembershipExpired(member.expiry);
  const statusLabel = member.loggedIn ? '✓ Logged In' : '✗ Logged Out';
  const statusClass = member.loggedIn ? 'badge-green' : 'badge-gray';

  let memberStatusText  = 'Active';
  let memberStatusColor = 'green';
  if (member.status === 'banned') {
    memberStatusText = 'Banned'; memberStatusColor = 'red';
  } else if (isExpired) {
    memberStatusText = 'Expired'; memberStatusColor = 'red';
  } else if (member.status !== 'active') {
    memberStatusText  = member.status.charAt(0).toUpperCase() + member.status.slice(1);
    memberStatusColor = 'red';
  }

  const planBadgeLabel = member.plan === 'Gold' ? 'Premium' : 'Standard';

  let sessionsHTML = '';
  if (member.plan === 'Gold' && member.sessions.length > 0) {
    sessionsHTML = member.sessions.map(s => `
      <div class="sess-card sess-card-gold">
        <div class="sess-row-top">
          <span class="sess-name">${s.program}</span>
          <span class="sess-badge-green">Scheduled</span>
        </div>
        <div class="sess-time">${SVG_CLOCK_GRAY} ${s.time}</div>
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

  const accessTitle = member.loggedIn ? 'Access Granted' : 'Access Denied';
  const accessSub   = member.loggedIn && member.loginTime
    ? `Logged in at ${formatTime(member.loginTime)}`
    : 'Not currently logged in';

  container.innerHTML = `
    <div class="portal-card">
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
      <div class="portal-body">
        <div class="portal-col">

          <!-- Membership Type -->
          <div class="pbox pbox-blue pbox-relative">
            <div class="pbox-label">Membership Type</div>
            <div class="pbox-value pbox-val-blue">${member.plan}</div>
            <span class="pbox-corner-badge">${planBadgeLabel}</span>
          </div>

          <!-- Membership Status -->
          <div class="pbox pbox-green">
            <div class="pbox-label">Membership Status</div>
            <div class="pbox-value pbox-val-${memberStatusColor}">${memberStatusText}</div>
            <div class="pbox-sub pbox-sub-dark">Expires: ${member.expiry}</div>
          </div>

          <!-- Body Metrics -->
          <div class="pbox pbox-purple">
            <div class="pbox-label">Body Metrics</div>
            <div class="metrics-grid">
              <div class="metric-item">
                <div class="metric-label">Height</div>
                <div class="metric-value pbox-val-purple">${member.height ?? '--'} cm</div>
              </div>
              <div class="metric-item">
                <div class="metric-label">Weight</div>
                <div class="metric-value pbox-val-purple">${member.weight} kg</div>
              </div>
              <div class="metric-item">
                <div class="metric-label">BMI</div>
                <div class="metric-value pbox-val-purple">${member.bmi}</div>
              </div>
              <div class="metric-item">
                <div class="metric-label">Target Weight</div>
                <div class="metric-value pbox-val-purple">${member.targetWeight ?? '--'} kg</div>
              </div>
            </div>
            <div class="metrics-as-of">as of ${member.metricsUpdatedAt ?? '--'}</div>
          </div>

        </div>
        <div class="portal-col">

          <!-- Today's Sessions -->
          <div class="pbox pbox-yellow pbox-sessions">
            <div class="pbox-header-row">
              ${SVG_CALENDAR}
              <span class="pbox-header-title">Today's Sessions</span>
            </div>
            <div class="pbox-sessions-body">${sessionsHTML}</div>
          </div>

          <!-- Access Granted -->
          <div class="pbox-green-solid">
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

// ── Trainer Card ──
function renderTrainerCard(trainer) {
  const container   = document.getElementById('kiosk-result');
  const statusLabel = trainer.loggedIn ? '✓ Clocked In' : '✗ Clocked Out';
  const statusClass = trainer.loggedIn ? 'badge-green' : 'badge-gray';
  const clockTime   = trainer.loggedIn && trainer.clockInTime
    ? formatTime(trainer.clockInTime) : '--:--:-- --';
  const clockDate   = trainer.loggedIn && trainer.clockInTime
    ? formatDate(trainer.clockInTime) : '';

  const sessionsHTML = trainer.sessions.length > 0
    ? trainer.sessions.map((s, i) => `
        <div class="sess-card sess-card-trainer">
          <div class="sess-row-top">
            <span class="sess-name">${s.program}</span>
            <span class="sess-badge-blue">#${i + 1}</span>
          </div>
          <div class="sess-time">${SVG_CLOCK_GRAY} ${s.time}</div>
          <div class="sess-client">Client: ${s.client}</div>
        </div>`).join('')
    : `<p class="sess-empty">No sessions today</p>`;

  container.innerHTML = `
    <div class="portal-card">
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
      <div class="portal-body">
        <div class="portal-col">

          <!-- Specialization -->
          <div class="pbox pbox-purple">
            <div class="pbox-label">Specialization</div>
            <div class="pbox-value pbox-val-purple">${trainer.specialization}</div>
          </div>

          <!-- Clock In Time -->
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

          <!-- Rate per Session -->
          <div class="pbox pbox-blue">
            <div class="pbox-label">Rate per Session</div>
            <div class="pbox-value pbox-val-blue">$${trainer.ratePerSession}</div>
          </div>

        </div>
        <div class="portal-col">

          <!-- Today's Sessions -->
          <div class="pbox pbox-yellow pbox-sessions">
            <div class="pbox-header-row">
              ${SVG_PULSE}
              <span class="pbox-header-title">Today's Sessions</span>
            </div>
            <div class="pbox-sessions-body">${sessionsHTML}</div>
          </div>

          <!-- On Duty -->
          <div class="pbox-green-solid">
            <div class="pbox-access-row">
              <span class="pbox-check-circle pbox-check-green">${SVG_CHECK}</span>
              <div>
                <div class="pbox-access-title">On Duty</div>
                <div class="pbox-access-sub">Ready for ${trainer.sessions.length} session(s)</div>
              </div>
            </div>
          </div>

        </div>
      </div>
    </div>
    <div class="kiosk-scan-hint">${SVG_BOLT} Scan again to log out</div>`;
}