// frontend/js/admin.js

function initAdmin() { renderAdminView('dashboard'); }

function adminLogout() {
  clearSessionTimer();
  document.getElementById('admin-portal').classList.add('hidden');
  document.getElementById('login-screen').classList.remove('hidden');
  showToast('Logged out successfully.', 'info');
}

function switchTab(tab) {
  document.querySelectorAll('.tab-btn').forEach(b => b.classList.remove('active'));
  document.querySelector(`[data-tab="${tab}"]`).classList.add('active');
  renderAdminView(tab);
}

function renderAdminView(tab) {
  const content = document.getElementById('admin-content');
  if      (tab === 'dashboard') content.innerHTML = renderDashboard();
  else if (tab === 'members')   content.innerHTML = renderMembersTab();
  else if (tab === 'trainers')  content.innerHTML = renderTrainersTab();
  else if (tab === 'classes')   content.innerHTML = renderClassesTab(); 
}

// ── Dashboard ──
function renderDashboard() {
  const now          = new Date();
  const activeCount  = members.filter(m => m.loggedIn).length;
  const totalMembers = members.length;
  const goldMembers = members.filter(m => m.plan === 'Gold' && m.status === 'active').length;
  const monthlyRev   = goldMembers * 1499;
  const activeTrains = trainers.filter(t => t.loggedIn).length;
  const asOf         = formatDateTime(now);

  const maxCount = Math.max(...peakHoursData.map(x => x.count));
  const peakBars = peakHoursData.map(d => `
    <div class="bar-wrap">
      <div class="bar" style="height:${(d.count/maxCount)*100}%"
           title="${d.count} members"></div>
      <div class="bar-label">${d.hour}</div>
    </div>`).join('');

  const points = retentionData.map((d, i) =>
    `${40 + i * 90},${140 - (d.rate / 100) * 120}`).join(' ');
  const dots = retentionData.map((d, i) => {
    const x = 40 + i * 90, y = 140 - (d.rate / 100) * 120;
    return `<circle cx="${x}" cy="${y}" r="4" fill="#6366f1"/>`;
  }).join('');
  const xLabels = retentionData.map((d, i) =>
    `<text x="${40 + i * 90}" y="158" text-anchor="middle"
           font-size="11" fill="#94a3b8">${d.month}</text>`).join('');
  const yLabels = [0, 25, 50, 75, 100].map(v => {
    const y = 140 - (v / 100) * 120;
    return `<text x="28" y="${y + 4}" text-anchor="end" font-size="11"
                  fill="#94a3b8">${v}</text>
            <line x1="35" y1="${y}" x2="550" y2="${y}"
                  stroke="#e2e8f0" stroke-width="1"/>`;
  }).join('');

  return `
  <div class="dashboard-stats">
    <div class="stat-card">
      <div class="stat-top">
        <span class="stat-label">Active Members</span>
        <span class="stat-icon blue">⚡</span>
      </div>
      <div class="stat-value">${activeCount}</div>
      <div class="stat-sub">Currently in gym</div>
      <div class="stat-datetime">as of ${asOf}</div>
    </div>
    <div class="stat-card">
      <div class="stat-top">
        <span class="stat-label">Total Members</span>
        <span class="stat-icon indigo">👥</span>
      </div>
      <div class="stat-value">${totalMembers}</div>
      <div class="stat-sub">Registered members</div>
      <div class="stat-datetime">as of ${asOf}</div>
    </div>
    <div class="stat-card">
      <div class="stat-top">
        <span class="stat-label">Monthly Revenue</span>
        <span class="stat-icon green">$</span>
      </div>
      <div class="stat-value">${formatPhpCurrency(monthlyRev)}</div>
      <div class="stat-sub">From Gold memberships</div>
      <div class="stat-datetime">as of ${asOf}</div>
    </div>
    <div class="stat-card">
      <div class="stat-top">
        <span class="stat-label">Active Trainers</span>
        <span class="stat-icon orange">📈</span>
      </div>
      <div class="stat-value">${activeTrains}</div>
      <div class="stat-sub">Available staff</div>
      <div class="stat-datetime">as of ${asOf}</div>
    </div>
  </div>
  <div class="charts-row">
    <div class="chart-card">
      <div class="chart-title">Peak Hours Analysis</div>
      <div class="chart-sub">Gym traffic throughout the day</div>
      <div class="bar-chart">${peakBars}</div>
    </div>
    <div class="chart-card">
      <div class="chart-title">Member Retention Rate</div>
      <div class="chart-sub">Monthly retention percentage</div>
      <div class="line-chart-wrap">
        <svg width="100%" height="175" viewBox="0 0 560 175">
          ${yLabels}
          <polyline points="${points}" fill="none"
                    stroke="#6366f1" stroke-width="2"/>
          ${dots}
          ${xLabels}
        </svg>
        <div class="chart-legend">→ retention</div>
      </div>
    </div>
  </div>`;
}

// ── Members Tab ──
function renderMembersTab() {
  const rows = members.map(m => {
    const planCell   = m.plan === 'Gold'
      ? `<span class="plan-badge-gold">${m.plan}</span>`
      : `<span class="plan-text-silver">${m.plan}</span>`;
    const statusCell = `<span class="status-pill-${m.status}">${m.status}</span>`;
    
    return `
    <tr>
      <td><strong>${m.name}</strong></td>
      <td>${m.contact}</td>
      <td>${planCell}</td>
      <td>${statusCell}</td>
      <td>${m.expiry}</td>
      <td>
        <div class="metrics-table-grid">
          <span class="mtg-item"><span class="mtg-label">Height</span> ${m.height ?? '--'} cm</span>
          <span class="mtg-item"><span class="mtg-label">Weight</span> ${m.weight} kg</span>
          <span class="mtg-item"><span class="mtg-label">BMI</span> ${m.bmi}</span>
          <span class="mtg-item"><span class="mtg-label">Target</span> ${m.targetWeight ?? '--'} kg</span>
        </div>
        <div class="metrics-as-of">as of ${m.metricsUpdatedAt ?? '--'}</div>
      </td>
      <td class="action-cell">
        <button class="tbl-btn-edit" onclick="openEditMember('${m.id}')" title="Edit">
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
            <path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"/>
            <path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"/>
          </svg>
        </button>
        <button class="tbl-btn-del" onclick="deleteMember('${m.id}')" title="Delete">
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
            <polyline points="3 6 5 6 21 6"/>
            <path d="M19 6l-1 14a2 2 0 0 1-2 2H8a2 2 0 0 1-2-2L5 6"/>
            <path d="M10 11v6"/><path d="M14 11v6"/>
            <path d="M9 6V4a1 1 0 0 1 1-1h4a1 1 0 0 1 1 1v2"/>
          </svg>
        </button>
      </td>
    </tr>`;
  }).join('');

  return `
  <div class="tab-header">
    <h2 class="tab-title">Member Database</h2>
    <button class="btn-primary" onclick="openRegisterMember()">
      <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round">
        <line x1="12" y1="5" x2="12" y2="19"/>
        <line x1="5"  y1="12" x2="19" y2="12"/>
      </svg>
      Register New Member
    </button>
  </div>
  <div class="table-wrap">
    <table class="data-table">
      <thead><tr>
        <th>Name</th><th>Contact</th><th>Plan</th><th>Status</th>
        <th>Expiry</th><th>Body Metrics</th><th>Actions</th>
      </tr></thead>
      <tbody>${rows}</tbody>
    </table>
  </div>`;
}

// ── Modals (Updated for DB Schema) ──
function openRegisterMember() {
  showModal(`
    <h3 class="modal-title">Register New Member</h3>
    <div class="form-row-2">
      <div class="form-group">
        <label>First Name</label>
        <input id="m-fname" class="form-input" placeholder="e.g. Juan"/>
      </div>
      <div class="form-group">
        <label>Last Name</label>
        <input id="m-lname" class="form-input" placeholder="e.g. Dela Cruz"/>
      </div>
    </div>
    <div class="form-row-2">
      <div class="form-group">
        <label>Phone Number</label>
        <input id="m-phone" class="form-input" placeholder="e.g. 09171234567"/>
      </div>
      <div class="form-group">
        <label>Email Address</label>
        <input id="m-email" class="form-input" placeholder="email@example.com"/>
      </div>
    </div>
    <div class="form-row-2">
      <div class="form-group">
        <label>RFID / Member ID</label>
        <input id="m-rfid" class="form-input" placeholder="Scan or type ID"/>
      </div>
      <div class="form-group">
        <label>Membership Plan</label>
        <select id="m-plan" class="form-input">
          <option value="Silver">Silver</option>
          <option value="Gold">Gold</option>
        </select>
      </div>
    </div>
    <div class="modal-section-label">Body Metrics (Optional)</div>
    <div class="form-row-2">
      <div class="form-group">
        <label>Height (cm)</label>
        <input id="m-height" class="form-input" type="number" placeholder="170"/>
      </div>
      <div class="form-group">
        <label>Weight (kg)</label>
        <input id="m-weight" class="form-input" type="number" placeholder="70"/>
      </div>
    </div>
    <div class="form-row-2">
      <div class="form-group">
        <label>Target Weight (kg)</label>
        <input id="m-target" class="form-input" type="number" placeholder="65"/>
      </div>
      <div class="form-group">
        <label>Start Date</label>
        <input id="m-start" class="form-input" type="date" value="${new Date().toISOString().split('T')[0]}"/>
      </div>
    </div>
    <div class="modal-actions">
      <button class="btn-secondary" onclick="closeModal()">Cancel</button>
      <button class="btn-primary"   onclick="saveNewMember()">Register Member</button>
    </div>`);
}

function saveNewMember() {
  const fname  = document.getElementById('m-fname').value.trim();
  const lname  = document.getElementById('m-lname').value.trim();
  const phone  = document.getElementById('m-phone').value.trim();
  const email  = document.getElementById('m-email').value.trim();
  const rfid   = document.getElementById('m-rfid').value.trim();
  const plan   = document.getElementById('m-plan').value;
  
  if (!fname || !lname || !rfid) {
    showToast('First Name, Last Name, and RFID are required.', 'error'); return;
  }
  if (members.find(m => m.rfid.toUpperCase() === rfid.toUpperCase())) {
    showToast('RFID already exists in the system.', 'error'); return;
  }

  const d = new Date();
  d.setMonth(d.getMonth() + 1);
  const expiry = `${d.getMonth()+1}/${d.getDate()}/${d.getFullYear()}`;

  members.push({
    id: 'M' + Math.floor(Math.random() * 1000).toString().padStart(3, '0'),
    rfid: rfid.toUpperCase(), 
    firstName: fname, lastName: lname, 
    name: `${fname} ${lname}`,
    phone: phone, email: email,
    contact: `${email} | ${phone}`, 
    plan: plan, status: 'active', expiry: expiry,
    height: parseFloat(document.getElementById('m-height').value) || 0, 
    weight: parseFloat(document.getElementById('m-weight').value) || 0, 
    bmi: 0, 
    targetWeight: parseFloat(document.getElementById('m-target').value) || 0, 
    metricsUpdatedAt: new Date().toLocaleDateString(),
    loggedIn: false, loginTime: null, sessions: []
  });
  
  closeModal();
  renderAdminView('members');
  showToast(`${fname} registered successfully!`);
}

function openEditMember(id) {
  const m = members.find(x => x.id === id);
  if (!m) return;
  
  showModal(`
    <h3 class="modal-title">Edit Member: ${m.name}</h3>
    <div class="form-row-2">
      <div class="form-group">
        <label>First Name</label>
        <input id="em-fname" class="form-input" value="${m.firstName || ''}"/>
      </div>
      <div class="form-group">
        <label>Last Name</label>
        <input id="em-lname" class="form-input" value="${m.lastName || ''}"/>
      </div>
    </div>
    <div class="form-row-2">
      <div class="form-group">
        <label>Phone Number</label>
        <input id="em-phone" class="form-input" value="${m.phone || ''}"/>
      </div>
      <div class="form-group">
        <label>Email Address</label>
        <input id="em-email" class="form-input" value="${m.email || ''}"/>
      </div>
    </div>
    <div class="form-row-2">
      <div class="form-group">
        <label>Plan</label>
        <select id="em-plan" class="form-input">
          <option value="Silver" ${m.plan==='Silver'?'selected':''}>Silver</option>
          <option value="Gold" ${m.plan==='Gold'?'selected':''}>Gold</option>
        </select>
      </div>
      <div class="form-group">
        <label>Status</label>
        <select id="em-status" class="form-input">
          <option value="active"  ${m.status==='active' ?'selected':''}>Active</option>
          <option value="expired" ${m.status==='expired'?'selected':''}>Expired</option>
          <option value="banned"  ${m.status==='banned' ?'selected':''}>Banned</option>
        </select>
      </div>
    </div>
    <div class="modal-section-label">Body Metrics</div>
    <div class="form-row-2">
      <div class="form-group">
        <label>Height (cm)</label>
        <input id="em-height" class="form-input" type="number" value="${m.height ?? ''}"/>
      </div>
      <div class="form-group">
        <label>Weight (kg)</label>
        <input id="em-weight" class="form-input" type="number" value="${m.weight}"/>
      </div>
    </div>
    <div class="modal-actions">
      <button class="btn-secondary" onclick="closeModal()">Cancel</button>
      <button class="btn-primary"   onclick="saveEditMember('${id}')">Save Changes</button>
    </div>`);
}

function saveEditMember(id) {
  const m = members.find(x => x.id === id);
  if (!m) return;
  
  m.firstName = document.getElementById('em-fname').value.trim();
  m.lastName  = document.getElementById('em-lname').value.trim();
  m.name      = `${m.firstName} ${m.lastName}`;
  m.phone     = document.getElementById('em-phone').value.trim();
  m.email     = document.getElementById('em-email').value.trim();
  m.contact   = `${m.email} | ${m.phone}`;
  m.plan      = document.getElementById('em-plan').value;
  m.status    = document.getElementById('em-status').value;
  m.height    = parseFloat(document.getElementById('em-height').value) || m.height;
  m.weight    = parseFloat(document.getElementById('em-weight').value) || m.weight;
  m.metricsUpdatedAt = new Date().toLocaleDateString();
  
  closeModal();
  renderAdminView('members');
  showToast('Member updated successfully!');
}

function deleteMember(id) {
  if (!confirm('Delete this member? This cannot be undone.')) return;
  const idx = members.findIndex(x => x.id === id);
  if (idx !== -1) {
    const name = members[idx].name;
    members.splice(idx, 1);
    renderAdminView('members');
    showToast(`${name} removed.`, 'info');
  }
}

// ── Trainers Tab ──
let trainerEarningsFilter = 'all';

function formatPhpCurrency(value) {
  return new Intl.NumberFormat('en-PH', {
    style: 'currency',
    currency: 'PHP'
  }).format(Number(value) || 0);
}

function renderTrainersTab() {
  const monthOptions = [
    'all','2026-1','2026-2','2026-3','2026-4','2026-5','2026-6',
    '2026-7','2026-8','2026-9','2026-10','2026-11','2026-12'
  ];
  const monthLabels = {
    all:'All Time','2026-1':'Jan','2026-2':'Feb','2026-3':'Mar',
    '2026-4':'Apr','2026-5':'May','2026-6':'Jun','2026-7':'Jul',
    '2026-8':'Aug','2026-9':'Sep','2026-10':'Oct','2026-11':'Nov','2026-12':'Dec'
  };
  const opts = monthOptions.map(k =>
    `<option value="${k}" ${trainerEarningsFilter===k?'selected':''}>${monthLabels[k]}</option>`
  ).join('');

  const rows = trainers.map(t => {
    const earnings = getTrainerEarnings(t, trainerEarningsFilter);
    const sessions = getFilteredSessions(t, trainerEarningsFilter);
    const label    = monthLabels[trainerEarningsFilter];
    return `
    <tr>
      <td><strong>${t.name}</strong></td>
      <td>${t.specialization}</td>
      <td>${formatPhpCurrency(t.ratePerSession)}</td>
      <td>${sessions}</td>
      <td class="earnings-green">
        ${formatPhpCurrency(earnings)} <span class="filter-label">(${label})</span>
      </td>
      <td class="action-cell">
        <button class="tbl-btn-edit" onclick="openEditTrainer('${t.id}')" title="Edit">
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
            <path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"/>
            <path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"/>
          </svg>
        </button>
        <button class="tbl-btn-del" onclick="deleteTrainer('${t.id}')" title="Delete">
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
            <polyline points="3 6 5 6 21 6"/>
            <path d="M19 6l-1 14a2 2 0 0 1-2 2H8a2 2 0 0 1-2-2L5 6"/>
            <path d="M10 11v6"/><path d="M14 11v6"/>
            <path d="M9 6V4a1 1 0 0 1 1-1h4a1 1 0 0 1 1 1v2"/>
          </svg>
        </button>
      </td>
    </tr>`;
  }).join('');

  return `
  <div class="tab-header">
    <h2 class="tab-title">Trainer Database</h2>
    <div class="tab-header-right">
      <span class="filter-label-text">Filter Earnings:</span>
      <select class="form-input form-select"
              onchange="changeEarningsFilter(this.value)">${opts}</select>
      <button class="btn-primary" onclick="openOnboardTrainer()">
        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round">
          <line x1="12" y1="5" x2="12" y2="19"/>
          <line x1="5"  y1="12" x2="19" y2="12"/>
        </svg>
        Onboard New Trainer
      </button>
    </div>
  </div>
  <div class="table-wrap">
    <table class="data-table">
      <thead><tr>
        <th>Name</th><th>Specialization</th><th>Rate/Session</th>
        <th>Total Sessions</th><th>Earnings</th><th>Actions</th>
      </tr></thead>
      <tbody>${rows}</tbody>
    </table>
  </div>`;
}

function changeEarningsFilter(val) {
  trainerEarningsFilter = val;
  renderAdminView('trainers');
}

function openOnboardTrainer() {
  const specOpts = WORKOUT_PROGRAMS.map(p =>
    `<option value="${p}">${p}</option>`).join('');
  showModal(`
    <h3 class="modal-title">Onboard New Trainer</h3>
    <div class="form-group">
      <label>Name</label>
      <input id="t-name" class="form-input" placeholder="Full name"/>
    </div>
    <div class="form-group">
      <label>RFID / Trainer ID</label>
      <input id="t-rfid" class="form-input" placeholder="e.g. T004"/>
    </div>
    <div class="form-group">
      <label>Specialization</label>
      <select id="t-spec" class="form-input">${specOpts}</select>
    </div>
    <div class="form-group">
      <label>Rate per Session (₱)</label>
      <input id="t-rate" class="form-input" type="number" placeholder="e.g. 65"/>
    </div>
    <div class="modal-actions">
      <button class="btn-secondary" onclick="closeModal()">Cancel</button>
      <button class="btn-primary"   onclick="saveNewTrainer()">Onboard</button>
    </div>`);
}

function saveNewTrainer() {
  const name = document.getElementById('t-name').value.trim();
  const rfid = document.getElementById('t-rfid').value.trim();
  const spec = document.getElementById('t-spec').value;
  const rate = parseFloat(document.getElementById('t-rate').value);
  if (!name || !rfid || !rate) {
    showToast('Please fill all fields.', 'error'); return;
  }
  if (trainers.find(t => t.rfid.toUpperCase() === rfid.toUpperCase())) {
    showToast('Trainer ID already exists.', 'error'); return;
  }
  trainers.push({
    id: rfid.toUpperCase(), rfid: rfid.toUpperCase(),
    name, specialization: spec, ratePerSession: rate,
    loggedIn: false, clockInTime: null,
    sessions: [], totalSessions: 0, earningsByMonth: {}
  });
  closeModal();
  renderAdminView('trainers');
  showToast(`${name} onboarded!`);
}

function openEditTrainer(id) {
  const t = trainers.find(x => x.id === id);
  if (!t) return;
  const specOpts = WORKOUT_PROGRAMS.map(p =>
    `<option value="${p}" ${t.specialization===p?'selected':''}>${p}</option>`
  ).join('');
  showModal(`
    <h3 class="modal-title">Edit Trainer: ${t.name}</h3>
    <div class="form-group">
      <label>Name</label>
      <input id="et-name" class="form-input" value="${t.name}"/>
    </div>
    <div class="form-group">
      <label>Specialization</label>
      <select id="et-spec" class="form-input">${specOpts}</select>
    </div>
    <div class="form-group">
      <label>Rate per Session (₱)</label>
      <input id="et-rate" class="form-input" type="number" value="${t.ratePerSession}"/>
    </div>
    <div class="modal-actions">
      <button class="btn-secondary" onclick="closeModal()">Cancel</button>
      <button class="btn-primary"   onclick="saveEditTrainer('${id}')">Save Changes</button>
    </div>`);
}

function saveEditTrainer(id) {
  const t = trainers.find(x => x.id === id);
  if (!t) return;
  t.name           = document.getElementById('et-name').value.trim();
  t.specialization = document.getElementById('et-spec').value;
  t.ratePerSession = parseFloat(document.getElementById('et-rate').value) || t.ratePerSession;
  closeModal();
  renderAdminView('trainers');
  showToast('Trainer updated!');
}

function deleteTrainer(id) {
  if (!confirm('Remove this trainer?')) return;
  const idx = trainers.findIndex(x => x.id === id);
  if (idx !== -1) {
    const name = trainers[idx].name;
    trainers.splice(idx, 1);
    renderAdminView('trainers');
    showToast(`${name} removed.`, 'info');
  }
}
// ── Classes Tab ──
function renderClassesTab() {
  const rows = classesData.map(c => `
    <tr>
      <td><strong>${c.name}</strong></td>
      <td>${c.trainer}</td>
      <td>
        <span class="plan-badge-gold" style="background:var(--p50); color:var(--p600)">
          ${c.startsAt}
        </span>
      </td>
      <td>${c.duration} mins</td>
      <td>${c.location}</td>
      <td><span class="status-pill-active">0 / ${c.capacity}</span></td>
      <td class="action-cell">
        <button class="tbl-btn-del" onclick="alert('Delete feature coming soon!')" title="Delete">
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
            <polyline points="3 6 5 6 21 6"/>
            <path d="M19 6l-1 14a2 2 0 0 1-2 2H8a2 2 0 0 1-2-2L5 6"/>
            <path d="M10 11v6"/><path d="M14 11v6"/>
            <path d="M9 6V4a1 1 0 0 1 1-1h4a1 1 0 0 1 1 1v2"/>
          </svg>
        </button>
      </td>
    </tr>`).join('');

  return `
  <div class="tab-header">
    <h2 class="tab-title">Class Schedule</h2>
    <button class="btn-primary" onclick="openScheduleClass()">
      <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round">
        <line x1="12" y1="5" x2="12" y2="19"/>
        <line x1="5"  y1="12" x2="19" y2="12"/>
      </svg>
      Schedule New Class
    </button>
  </div>
  <div class="table-wrap">
    <table class="data-table">
      <thead><tr>
        <th>Class Name</th><th>Instructor</th><th>Schedule</th>
        <th>Duration</th><th>Location</th><th>Booked/Capacity</th><th>Actions</th>
      </tr></thead>
      <tbody>${rows}</tbody>
    </table>
  </div>`;
}
// ── Class Management Modals ──

function openScheduleClass() {
  // Dynamically generate the dropdown options using your live trainers array!
  const trainerOpts = trainers.map(t => {
      // Convert 'T001' back into the raw integer '1' for the MySQL database
      const dbId = parseInt(t.id.replace('T', ''));
      return `<option value="${dbId}">${t.name} (${t.specialization})</option>`;
  }).join('');
  
  showModal(`
    <h3 class="modal-title">Schedule New Class</h3>
    <div class="form-group">
      <label>Class Name</label>
      <input id="c-name" class="form-input" placeholder="e.g. Evening Zumba"/>
    </div>
    <div class="form-row-2">
      <div class="form-group">
        <label>Instructor</label>
        <select id="c-trainer" class="form-input">
          ${trainerOpts}
        </select>
      </div>
      <div class="form-group">
        <label>Location</label>
        <input id="c-location" class="form-input" placeholder="e.g. Studio A"/>
      </div>
    </div>
    <div class="form-row-2">
      <div class="form-group">
        <label>Date & Time</label>
        <input id="c-datetime" class="form-input" type="datetime-local"/>
      </div>
      <div class="form-group">
        <label>Duration (mins)</label>
        <input id="c-duration" class="form-input" type="number" value="60"/>
      </div>
    </div>
    <div class="form-group">
      <label>Capacity</label>
      <input id="c-capacity" class="form-input" type="number" value="20"/>
    </div>
    <div class="modal-actions">
      <button class="btn-secondary" onclick="closeModal()">Cancel</button>
      <button class="btn-primary" onclick="saveNewClass()">Schedule Class</button>
    </div>
  `);
}

async function saveNewClass() {
  const name = document.getElementById('c-name').value.trim();
  const trainerId = parseInt(document.getElementById('c-trainer').value);
  const location = document.getElementById('c-location').value.trim();
  const datetimeRaw = document.getElementById('c-datetime').value; // Format: YYYY-MM-DDTHH:MM
  const duration = parseInt(document.getElementById('c-duration').value);
  const capacity = parseInt(document.getElementById('c-capacity').value);

  if (!name || !datetimeRaw || !location) {
    showToast('Please fill out all required fields.', 'error'); return;
  }

  // Format the HTML datetime into MySQL's strict format (YYYY-MM-DD HH:MM:00)
  const mysqlDatetime = datetimeRaw.replace('T', ' ') + ':00';

  try {
    const response = await fetch('http://localhost/fitlife-gym/backend/api/add_class.php', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        class_name: name,
        trainer_id: trainerId,
        starts_at: mysqlDatetime,
        duration_minutes: duration,
        capacity: capacity,
        location: location
      })
    });

    const result = await response.json();
    
    if (result.status === 'success') {
      closeModal();
      showToast('Class scheduled successfully!');
      
      // Tell data.js to pull the fresh data from the DB, then re-draw the table!
      await loadClasses(); 
      renderAdminView('classes');
    } else {
      showToast(result.message, 'error');
    }
  } catch (error) {
    console.error(error);
    showToast('Server connection failed.', 'error');
  }
}