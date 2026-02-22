// ============================================================
// FitLife Gym — Admin Portal
// All tabs: Dashboard, Members, Trainers, Classes,
//           Billing/Payments, Attendance Logs, Audit Logs
// ============================================================

// ── SVG icon helpers ──
const IC_EDIT = `<svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"/><path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"/></svg>`;
const IC_DEL  = `<svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><polyline points="3 6 5 6 21 6"/><path d="M19 6l-1 14a2 2 0 0 1-2 2H8a2 2 0 0 1-2-2L5 6"/><path d="M10 11v6"/><path d="M14 11v6"/><path d="M9 6V4a1 1 0 0 1 1-1h4a1 1 0 0 1 1 1v2"/></svg>`;
const IC_PLUS = `<svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><line x1="12" y1="5" x2="12" y2="19"/><line x1="5" y1="12" x2="19" y2="12"/></svg>`;
const IC_CHECK= `<svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><polyline points="20 6 9 17 4 12"/></svg>`;

// ── Tab router ──
function initAdmin() {
  updateAdminTopbar();
  renderAdminView('dashboard');
}

function updateAdminTopbar() {
  const nameEl = document.getElementById('admin-name-display');
  const roleEl = document.getElementById('admin-role-display');
  if (nameEl && currentAdmin) nameEl.textContent = currentAdmin.name || 'Administrator';
  if (roleEl && currentAdmin) roleEl.textContent = currentAdmin.role === 'super_admin' ? 'Super Admin' : 'Staff';
}

function adminLogout() {
  clearSessionTimer();
  currentAdmin = null;
  document.getElementById('admin-portal').classList.add('hidden');
  document.getElementById('login-screen').classList.remove('hidden');
  showToast('Logged out successfully.', 'info');
}

function switchTab(tab) {
  document.querySelectorAll('.tab-btn').forEach(b => b.classList.remove('active'));
  const activeBtn = document.querySelector(`[data-tab="${tab}"]`);
  if (activeBtn) activeBtn.classList.add('active');
  renderAdminView(tab);
  resetSessionTimer(adminLogout);
}

function renderAdminView(tab) {
  const content = document.getElementById('admin-content');
  switch (tab) {
    case 'dashboard':  content.innerHTML = renderDashboard();    break;
    case 'members':    content.innerHTML = renderMembersTab();   break;
    case 'trainers':   content.innerHTML = renderTrainersTab();  break;
    case 'classes':    content.innerHTML = renderClassesTab();   break;
    case 'billing':    content.innerHTML = renderBillingTab();   break;
    case 'logs':       content.innerHTML = renderLogsTab();      break;
    default:           content.innerHTML = renderDashboard();
  }
}

// ============================================================
// DASHBOARD
// ============================================================
function renderDashboard() {
  const now           = new Date();
  const activeCount   = members.filter(m => m.loggedIn).length;
  const totalMembers  = members.length;
  const activeTrainers= trainers.filter(t => t.loggedIn).length;
  // Monthly revenue: sum from payments table (backend provides)
  const monthlyRev    = payments.reduce((s, p) => s + (parseFloat(p.amount) || 0), 0);
  const asOf          = formatDateTime(now);

  // Charts show empty state when no data
  const chartsHTML = `
  <div class="charts-row">
    <div class="chart-card">
      <div class="chart-title">Peak Hours Analysis</div>
      <div class="chart-sub">Gym traffic throughout the day</div>
      <div class="empty-chart-state">
        <div class="empty-chart-icon">📊</div>
        <p>Attendance data will appear here</p>
        <span>Connects to MongoDB attendance_logs</span>
      </div>
    </div>
    <div class="chart-card">
      <div class="chart-title">Member Retention Rate</div>
      <div class="chart-sub">Monthly retention percentage</div>
      <div class="empty-chart-state">
        <div class="empty-chart-icon">📈</div>
        <p>Retention data will appear here</p>
        <span>Connects to membership table</span>
      </div>
    </div>
  </div>`;

  return `
  <div class="dashboard-stats">
    <div class="stat-card">
      <div class="stat-top"><span class="stat-label">Active Members</span><span class="stat-icon blue">⚡</span></div>
      <div class="stat-value">${activeCount}</div>
      <div class="stat-sub">Currently in gym</div>
      <div class="stat-datetime">as of ${asOf}</div>
    </div>
    <div class="stat-card">
      <div class="stat-top"><span class="stat-label">Total Members</span><span class="stat-icon indigo">👥</span></div>
      <div class="stat-value">${totalMembers}</div>
      <div class="stat-sub">Registered members</div>
      <div class="stat-datetime">as of ${asOf}</div>
    </div>
    <div class="stat-card">
      <div class="stat-top"><span class="stat-label">Monthly Revenue</span><span class="stat-icon green">$</span></div>
      <div class="stat-value">${formatCurrency(monthlyRev)}</div>
      <div class="stat-sub">From payments table</div>
      <div class="stat-datetime">as of ${asOf}</div>
    </div>
    <div class="stat-card">
      <div class="stat-top"><span class="stat-label">Active Trainers</span><span class="stat-icon orange">🏋</span></div>
      <div class="stat-value">${activeTrainers}</div>
      <div class="stat-sub">Clocked in today</div>
      <div class="stat-datetime">as of ${asOf}</div>
    </div>
  </div>
  ${chartsHTML}`;
}

// ============================================================
// MEMBERS TAB
// Includes: Middle Name, Phone Number, Join Date (from members table)
// Plan fetched from membership_plan table
// Membership history tab inside edit modal
// ============================================================
function renderMembersTab() {
  const rows = members.length > 0 ? members.map(m => {
    const planCell   = m.plan_name
      ? (m.plan_name.toLowerCase().includes('premium') || m.plan_name.toLowerCase().includes('gold')
          ? `<span class="plan-badge-gold">${m.plan_name}</span>`
          : `<span class="plan-text-silver">${m.plan_name}</span>`)
      : `<span class="plan-text-silver">—</span>`;
    const statusCell = `<span class="status-pill-${m.status || 'active'}">${m.status || '—'}</span>`;
    return `
    <tr>
      <td><strong>${m.last_name || ''}, ${m.first_name || ''}</strong>${m.middle_name ? ` ${m.middle_name[0]}.` : ''}</td>
      <td><div>${m.email || '—'}</div><div class="tbl-sub">${m.phone || ''}</div></td>
      <td>${planCell}</td>
      <td>${statusCell}</td>
      <td>${formatDisplayDate(m.join_date)}</td>
      <td>${formatDisplayDate(m.expiry_date)}</td>
      <td>
        <div class="metrics-table-grid">
          <span class="mtg-item"><span class="mtg-label">H</span> ${m.height ?? '—'} cm</span>
          <span class="mtg-item"><span class="mtg-label">W</span> ${m.weight ?? '—'} kg</span>
          <span class="mtg-item"><span class="mtg-label">BMI</span> ${m.bmi ?? '—'}</span>
          <span class="mtg-item"><span class="mtg-label">Target</span> ${m.target_weight ?? '—'} kg</span>
        </div>
        <div class="metrics-as-of">as of ${formatDisplayDate(m.metrics_updated_at)}</div>
      </td>
      <td class="action-cell">
        <button class="tbl-btn-edit" onclick="openEditMember('${m.id}')" title="Edit">${IC_EDIT}</button>
        <button class="tbl-btn-del"  onclick="deleteMember('${m.id}')"   title="Delete">${IC_DEL}</button>
      </td>
    </tr>`;
  }).join('') : `<tr><td colspan="8" class="empty-table-row">No members yet. Data loads from the members table.</td></tr>`;

  return `
  <div class="tab-header">
    <h2 class="tab-title">Member Database</h2>
    <button class="btn-primary" onclick="openRegisterMember()">${IC_PLUS} Register New Member</button>
  </div>
  <div class="table-wrap">
    <table class="data-table">
      <thead><tr>
        <th>Name</th><th>Contact</th><th>Plan</th><th>Status</th>
        <th>Join Date</th><th>Expiry</th><th>Body Metrics</th><th>Actions</th>
      </tr></thead>
      <tbody>${rows}</tbody>
    </table>
  </div>`;
}

function openRegisterMember() {
  const planOpts = plans.length > 0
    ? plans.map(p => `<option value="${p.id}">${p.name} — ${p.duration_months} month(s) @ ${formatCurrency(p.price)}</option>`).join('')
    : `<option value="">— No plans loaded yet —</option>`;

  showModal(`
    <h3 class="modal-title">Register New Member</h3>
    <div class="form-row-2">
      <div class="form-group"><label>First Name</label><input id="m-fname" class="form-input" placeholder="First name"/></div>
      <div class="form-group"><label>Middle Name</label><input id="m-mname" class="form-input" placeholder="Middle name (optional)"/></div>
    </div>
    <div class="form-group"><label>Last Name</label><input id="m-lname" class="form-input" placeholder="Last name"/></div>
    <div class="form-row-2">
      <div class="form-group"><label>Email</label><input id="m-email" class="form-input" type="email" placeholder="email@example.com"/></div>
      <div class="form-group"><label>Phone Number</label><input id="m-phone" class="form-input" placeholder="+63 9XX XXX XXXX"/></div>
    </div>
    <div class="form-group"><label>RFID / Member ID</label><input id="m-rfid" class="form-input" placeholder="e.g. M007"/></div>
    <div class="form-row-2">
      <div class="form-group"><label>Membership Plan</label>
        <select id="m-plan" class="form-input">${planOpts}</select>
      </div>
      <div class="form-group"><label>Join Date</label><input id="m-join" class="form-input" type="date"/></div>
    </div>
    <div class="modal-section-label">Body Metrics</div>
    <div class="form-row-2">
      <div class="form-group"><label>Height (cm)</label><input id="m-height" class="form-input" type="number" placeholder="e.g. 170"/></div>
      <div class="form-group"><label>Weight (kg)</label><input id="m-weight" class="form-input" type="number" placeholder="e.g. 70"/></div>
    </div>
    <div class="form-row-2">
      <div class="form-group"><label>BMI</label><input id="m-bmi" class="form-input" type="number" step="0.1" placeholder="e.g. 22.5"/></div>
      <div class="form-group"><label>Target Weight (kg)</label><input id="m-target" class="form-input" type="number" placeholder="e.g. 65"/></div>
    </div>
    <div class="modal-section-label">Health Notes <span class="modal-section-hint">(stored in MongoDB health_logs)</span></div>
    <div class="form-group"><label>Medical Conditions / Clearance Notes</label>
      <textarea id="m-health" class="form-input form-textarea" placeholder="e.g. Asthma, cleared by physician on 1/1/2026…"></textarea>
    </div>
    <div class="modal-actions">
      <button class="btn-secondary" onclick="closeModal()">Cancel</button>
      <button class="btn-primary"   onclick="saveNewMember()">Register</button>
    </div>`);
}

function saveNewMember() {
  const fname  = document.getElementById('m-fname').value.trim();
  const lname  = document.getElementById('m-lname').value.trim();
  const email  = document.getElementById('m-email').value.trim();
  const rfid   = document.getElementById('m-rfid').value.trim();
  const planId = document.getElementById('m-plan').value;
  const join   = document.getElementById('m-join').value;

  if (!fname || !lname || !email || !rfid || !join) {
    showToast('Please fill all required fields.', 'error'); return;
  }

  const payload = {
    first_name:    fname,
    middle_name:   document.getElementById('m-mname').value.trim(),
    last_name:     lname,
    email,
    phone:         document.getElementById('m-phone').value.trim(),
    rfid:          rfid.toUpperCase(),
    plan_id:       planId,
    join_date:     join,
    height:        parseFloat(document.getElementById('m-height').value) || null,
    weight:        parseFloat(document.getElementById('m-weight').value) || null,
    bmi:           parseFloat(document.getElementById('m-bmi').value)    || null,
    target_weight: parseFloat(document.getElementById('m-target').value) || null,
    health_notes:  document.getElementById('m-health').value.trim()
  };

  // TODO: await apiPost('members', payload);
  console.log('POST /api/members', payload);
  closeModal();
  showToast(`${fname} ${lname} registered! Connect backend to persist.`, 'info');
}

function openEditMember(id) {
  const m = members.find(x => x.id == id);
  const planOpts = plans.length > 0
    ? plans.map(p => `<option value="${p.id}" ${m && m.plan_id == p.id ? 'selected' : ''}>${p.name}</option>`).join('')
    : `<option value="">— No plans loaded —</option>`;
  const statusOpts = MEMBER_STATUSES.map(s =>
    `<option value="${s}" ${m && m.status === s ? 'selected' : ''}>${s.charAt(0).toUpperCase()+s.slice(1)}</option>`
  ).join('');

  showModal(`
    <h3 class="modal-title">Edit Member${m ? ': ' + m.first_name + ' ' + m.last_name : ''}</h3>

    <!-- Member Info -->
    <div class="modal-tabs">
      <button class="modal-tab-btn active" onclick="switchModalTab('info')">Info</button>
      <button class="modal-tab-btn" onclick="switchModalTab('metrics')">Body Metrics</button>
      <button class="modal-tab-btn" onclick="switchModalTab('history')">Membership History</button>
      <button class="modal-tab-btn" onclick="switchModalTab('health')">Health Notes</button>
    </div>

    <div id="mtab-info" class="modal-tab-panel">
      <div class="form-row-2">
        <div class="form-group"><label>First Name</label><input id="em-fname" class="form-input" value="${m?.first_name || ''}"/></div>
        <div class="form-group"><label>Middle Name</label><input id="em-mname" class="form-input" value="${m?.middle_name || ''}"/></div>
      </div>
      <div class="form-group"><label>Last Name</label><input id="em-lname" class="form-input" value="${m?.last_name || ''}"/></div>
      <div class="form-row-2">
        <div class="form-group"><label>Email</label><input id="em-email" class="form-input" value="${m?.email || ''}"/></div>
        <div class="form-group"><label>Phone</label><input id="em-phone" class="form-input" value="${m?.phone || ''}"/></div>
      </div>
      <div class="form-row-2">
        <div class="form-group"><label>Plan</label><select id="em-plan" class="form-input">${planOpts}</select></div>
        <div class="form-group"><label>Status</label><select id="em-status" class="form-input">${statusOpts}</select></div>
      </div>
      <div class="form-group"><label>Expiry Date</label><input id="em-expiry" class="form-input" type="date" value="${m?.expiry_date || ''}"/></div>
    </div>

    <div id="mtab-metrics" class="modal-tab-panel hidden">
      <div class="form-row-2">
        <div class="form-group"><label>Height (cm)</label><input id="em-height" class="form-input" type="number" value="${m?.height || ''}"/></div>
        <div class="form-group"><label>Weight (kg)</label><input id="em-weight" class="form-input" type="number" value="${m?.weight || ''}"/></div>
      </div>
      <div class="form-row-2">
        <div class="form-group"><label>BMI</label><input id="em-bmi" class="form-input" type="number" step="0.1" value="${m?.bmi || ''}"/></div>
        <div class="form-group"><label>Target Weight (kg)</label><input id="em-target" class="form-input" type="number" value="${m?.target_weight || ''}"/></div>
      </div>
      <div class="metrics-as-of" style="margin-top:8px;">Last updated: ${formatDisplayDate(m?.metrics_updated_at)}</div>
    </div>

    <div id="mtab-history" class="modal-tab-panel hidden">
      <div class="empty-state-small">
        <p>Membership history loads from the <code>membership</code> table.</p>
        <p>Shows start date, end date, plan, and status for each period.</p>
      </div>
    </div>

    <div id="mtab-health" class="modal-tab-panel hidden">
      <div class="form-group"><label>Medical Conditions / Clearance Notes</label>
        <textarea id="em-health" class="form-input form-textarea" placeholder="Loads from MongoDB health_logs collection…">${m?.health_notes || ''}</textarea>
      </div>
    </div>

    <div class="modal-actions">
      <button class="btn-secondary" onclick="closeModal()">Cancel</button>
      <button class="btn-primary"   onclick="saveEditMember('${id}')">Save Changes</button>
    </div>`);
}

function switchModalTab(tab) {
  document.querySelectorAll('.modal-tab-btn').forEach(b => b.classList.remove('active'));
  document.querySelectorAll('.modal-tab-panel').forEach(p => p.classList.add('hidden'));
  event.target.classList.add('active');
  document.getElementById(`mtab-${tab}`).classList.remove('hidden');
}

function saveEditMember(id) {
  const payload = {
    id,
    first_name:    document.getElementById('em-fname')?.value.trim(),
    middle_name:   document.getElementById('em-mname')?.value.trim(),
    last_name:     document.getElementById('em-lname')?.value.trim(),
    email:         document.getElementById('em-email')?.value.trim(),
    phone:         document.getElementById('em-phone')?.value.trim(),
    plan_id:       document.getElementById('em-plan')?.value,
    status:        document.getElementById('em-status')?.value,
    expiry_date:   document.getElementById('em-expiry')?.value,
    height:        parseFloat(document.getElementById('em-height')?.value) || null,
    weight:        parseFloat(document.getElementById('em-weight')?.value) || null,
    bmi:           parseFloat(document.getElementById('em-bmi')?.value)    || null,
    target_weight: parseFloat(document.getElementById('em-target')?.value) || null,
    health_notes:  document.getElementById('em-health')?.value.trim()
  };
  // TODO: await apiPut(`members/${id}`, payload);
  console.log('PUT /api/members/' + id, payload);
  closeModal();
  showToast('Member updated! Connect backend to persist.', 'info');
}

function deleteMember(id) {
  if (!confirm('Delete this member? This cannot be undone.')) return;
  // TODO: await apiDelete(`members/${id}`);
  console.log('DELETE /api/members/' + id);
  showToast('Member deleted (connect backend to persist).', 'info');
}

// ============================================================
// TRAINERS TAB
// Includes: Payout management panel
// ============================================================
let trainerEarningsFilter = 'all';

function renderTrainersTab() {
  const monthOptions = ['all','2026-1','2026-2','2026-3','2026-4','2026-5','2026-6',
    '2026-7','2026-8','2026-9','2026-10','2026-11','2026-12'];
  const monthLabels  = { all:'All Time','2026-1':'Jan','2026-2':'Feb','2026-3':'Mar',
    '2026-4':'Apr','2026-5':'May','2026-6':'Jun','2026-7':'Jul','2026-8':'Aug',
    '2026-9':'Sep','2026-10':'Oct','2026-11':'Nov','2026-12':'Dec' };
  const opts = monthOptions.map(k =>
    `<option value="${k}" ${trainerEarningsFilter===k?'selected':''}>${monthLabels[k]}</option>`).join('');

  const rows = trainers.length > 0 ? trainers.map(t => {
    const sessions = t.total_sessions ?? '—';
    const earnings = t.earnings       != null ? formatCurrency(t.earnings) : '—';
    const pendingPayout = payouts.filter(p => p.trainer_id == t.id && p.status === 'pending').length;
    return `<tr>
      <td><strong>${t.name}</strong></td>
      <td>${t.specialization || '—'}</td>
      <td>${formatCurrency(t.rate_per_session)}</td>
      <td>${sessions}</td>
      <td class="earnings-green">${earnings} <span class="filter-label">(${monthLabels[trainerEarningsFilter]})</span></td>
      <td>${pendingPayout > 0 ? `<span class="badge-pending">${pendingPayout} pending</span>` : '<span class="badge-paid">Up to date</span>'}</td>
      <td class="action-cell">
        <button class="tbl-btn-edit" onclick="openEditTrainer('${t.id}')"   title="Edit">${IC_EDIT}</button>
        <button class="tbl-btn-del"  onclick="deleteTrainer('${t.id}')"     title="Delete">${IC_DEL}</button>
        <button class="tbl-btn-pay"  onclick="openPayoutModal('${t.id}')"  title="Payouts">💰</button>
      </td>
    </tr>`;
  }).join('') : `<tr><td colspan="7" class="empty-table-row">No trainers yet. Data loads from the trainers table.</td></tr>`;

  return `
  <div class="tab-header">
    <h2 class="tab-title">Trainer Database</h2>
    <div class="tab-header-right">
      <label class="filter-label-text">Filter Earnings:</label>
      <select class="form-select" onchange="changeEarningsFilter(this.value)">${opts}</select>
      <button class="btn-primary" onclick="openOnboardTrainer()">${IC_PLUS} Onboard New Trainer</button>
    </div>
  </div>
  <div class="table-wrap">
    <table class="data-table">
      <thead><tr>
        <th>Name</th><th>Specialization</th><th>Rate/Session</th>
        <th>Sessions</th><th>Earnings</th><th>Payout Status</th><th>Actions</th>
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
  const specOpts = WORKOUT_PROGRAMS.map(p => `<option value="${p}">${p}</option>`).join('');
  showModal(`
    <h3 class="modal-title">Onboard New Trainer</h3>
    <div class="form-group"><label>Full Name</label><input id="t-name" class="form-input" placeholder="Full name"/></div>
    <div class="form-group"><label>RFID / Trainer ID</label><input id="t-rfid" class="form-input" placeholder="e.g. T004"/></div>
    <div class="form-group"><label>Specialization</label>
      <select id="t-spec" class="form-input">${specOpts}</select>
    </div>
    <div class="form-group"><label>Rate per Session ($)</label><input id="t-rate" class="form-input" type="number" placeholder="e.g. 65"/></div>
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
  if (!name || !rfid || !rate) { showToast('Please fill all fields.', 'error'); return; }
  const payload = { name, rfid: rfid.toUpperCase(), specialization: spec, rate_per_session: rate };
  // TODO: await apiPost('trainers', payload);
  console.log('POST /api/trainers', payload);
  closeModal();
  showToast(`${name} onboarded! Connect backend to persist.`, 'info');
}

function openEditTrainer(id) {
  const t = trainers.find(x => x.id == id);
  const specOpts = WORKOUT_PROGRAMS.map(p =>
    `<option value="${p}" ${t?.specialization===p?'selected':''}>${p}</option>`).join('');
  showModal(`
    <h3 class="modal-title">Edit Trainer${t ? ': ' + t.name : ''}</h3>
    <div class="form-group"><label>Name</label><input id="et-name" class="form-input" value="${t?.name || ''}"/></div>
    <div class="form-group"><label>Specialization</label>
      <select id="et-spec" class="form-input">${specOpts}</select>
    </div>
    <div class="form-group"><label>Rate per Session ($)</label>
      <input id="et-rate" class="form-input" type="number" value="${t?.rate_per_session || ''}"/>
    </div>
    <div class="modal-actions">
      <button class="btn-secondary" onclick="closeModal()">Cancel</button>
      <button class="btn-primary"   onclick="saveEditTrainer('${id}')">Save Changes</button>
    </div>`);
}

function saveEditTrainer(id) {
  const payload = {
    name:           document.getElementById('et-name').value.trim(),
    specialization: document.getElementById('et-spec').value,
    rate_per_session: parseFloat(document.getElementById('et-rate').value) || 0
  };
  // TODO: await apiPut(`trainers/${id}`, payload);
  console.log('PUT /api/trainers/' + id, payload);
  closeModal();
  showToast('Trainer updated! Connect backend to persist.', 'info');
}

function deleteTrainer(id) {
  if (!confirm('Remove this trainer?')) return;
  // TODO: await apiDelete(`trainers/${id}`);
  console.log('DELETE /api/trainers/' + id);
  showToast('Trainer removed (connect backend to persist).', 'info');
}

function openPayoutModal(trainerId) {
  const t = trainers.find(x => x.id == trainerId);
  const trainerPayouts = payouts.filter(p => p.trainer_id == trainerId);
  const rows = trainerPayouts.length > 0 ? trainerPayouts.map(p => `
    <tr>
      <td>${formatDisplayDate(p.period)}</td>
      <td>${formatCurrency(p.amount)}</td>
      <td><span class="status-pill-${p.status === 'paid' ? 'active' : 'expired'}">${p.status}</span></td>
      <td>${p.status === 'pending'
        ? `<button class="btn-primary" style="padding:4px 10px;font-size:12px" onclick="approvePayout('${p.id}')">Approve</button>`
        : `<span class="text-muted">—</span>`}
      </td>
    </tr>`).join('')
    : `<tr><td colspan="4" class="empty-table-row">No payout records. Loads from trainer_payouts table.</td></tr>`;

  showModal(`
    <h3 class="modal-title">Payouts — ${t?.name || 'Trainer'}</h3>
    <div class="table-wrap" style="margin-bottom:14px;">
      <table class="data-table">
        <thead><tr><th>Period</th><th>Amount</th><th>Status</th><th>Action</th></tr></thead>
        <tbody>${rows}</tbody>
      </table>
    </div>
    <div class="modal-actions">
      <button class="btn-secondary" onclick="closeModal()">Close</button>
    </div>`);
}

function approvePayout(payoutId) {
  if (!confirm('Mark this payout as paid?')) return;
  // TODO: await apiPut(`trainer_payouts/${payoutId}`, { status: 'paid' });
  console.log('PUT /api/trainer_payouts/' + payoutId, { status: 'paid' });
  showToast('Payout approved! Connect backend to persist.', 'info');
  closeModal();
}

// ============================================================
// CLASSES & BOOKINGS TAB
// Connects to: classes table, service_type table, bookings table
// ============================================================
function renderClassesTab() {
  const rows = classes.length > 0 ? classes.map(c => `
    <tr>
      <td><strong>${c.name || '—'}</strong></td>
      <td>${c.service_type || '—'}</td>
      <td>${c.trainer_name || '—'}</td>
      <td>${c.schedule || '—'}</td>
      <td>${c.location || '—'}</td>
      <td>${c.capacity ?? '—'}</td>
      <td>${c.enrolled ?? '—'}</td>
      <td class="action-cell">
        <button class="tbl-btn-edit" onclick="openEditClass('${c.id}')"  title="Edit">${IC_EDIT}</button>
        <button class="tbl-btn-del"  onclick="deleteClass('${c.id}')"   title="Delete">${IC_DEL}</button>
      </td>
    </tr>`).join('')
    : `<tr><td colspan="8" class="empty-table-row">No classes yet. Data loads from the classes &amp; service_type tables.</td></tr>`;

  return `
  <div class="tab-header">
    <h2 class="tab-title">Classes &amp; Services</h2>
    <button class="btn-primary" onclick="openAddClass()">${IC_PLUS} Add New Class</button>
  </div>
  <div class="table-wrap" style="margin-bottom:20px;">
    <table class="data-table">
      <thead><tr>
        <th>Class Name</th><th>Type</th><th>Trainer</th>
        <th>Schedule</th><th>Location</th><th>Capacity</th><th>Enrolled</th><th>Actions</th>
      </tr></thead>
      <tbody>${rows}</tbody>
    </table>
  </div>

  <div class="tab-header" style="margin-top:8px;">
    <h2 class="tab-title" style="font-size:17px;">Bookings</h2>
    <button class="btn-primary" onclick="openAddBooking()">${IC_PLUS} Book Member into Class</button>
  </div>
  ${renderBookingsTable()}`;
}

function renderBookingsTable() {
  const rows = bookings.length > 0 ? bookings.map(b => `
    <tr>
      <td>${b.member_name || '—'}</td>
      <td>${b.class_name  || '—'}</td>
      <td>${formatDisplayDate(b.booked_date)}</td>
      <td><span class="status-pill-${b.status === 'confirmed' ? 'active' : 'expired'}">${b.status || '—'}</span></td>
      <td class="action-cell">
        <button class="tbl-btn-del" onclick="cancelBooking('${b.id}')" title="Cancel">${IC_DEL}</button>
      </td>
    </tr>`).join('')
    : `<tr><td colspan="5" class="empty-table-row">No bookings yet. Data loads from the bookings table.</td></tr>`;

  return `
  <div class="table-wrap">
    <table class="data-table">
      <thead><tr>
        <th>Member</th><th>Class</th><th>Booked Date</th><th>Status</th><th>Actions</th>
      </tr></thead>
      <tbody>${rows}</tbody>
    </table>
  </div>`;
}

function openAddClass() {
  const trainerOpts = trainers.length > 0
    ? trainers.map(t => `<option value="${t.id}">${t.name}</option>`).join('')
    : `<option value="">— No trainers loaded —</option>`;
  const typeOpts = WORKOUT_PROGRAMS.map(p => `<option value="${p}">${p}</option>`).join('');

  showModal(`
    <h3 class="modal-title">Add New Class</h3>
    <div class="form-group"><label>Class Name</label><input id="cl-name" class="form-input" placeholder="e.g. Morning Yoga at Studio A"/></div>
    <div class="form-row-2">
      <div class="form-group"><label>Service Type</label>
        <select id="cl-type" class="form-input">${typeOpts}</select>
      </div>
      <div class="form-group"><label>Trainer</label>
        <select id="cl-trainer" class="form-input">${trainerOpts}</select>
      </div>
    </div>
    <div class="form-row-2">
      <div class="form-group"><label>Schedule (Date &amp; Time)</label><input id="cl-schedule" class="form-input" type="datetime-local"/></div>
      <div class="form-group"><label>Location / Room</label><input id="cl-location" class="form-input" placeholder="e.g. Studio A"/></div>
    </div>
    <div class="form-group"><label>Capacity</label><input id="cl-capacity" class="form-input" type="number" placeholder="e.g. 20"/></div>
    <div class="modal-actions">
      <button class="btn-secondary" onclick="closeModal()">Cancel</button>
      <button class="btn-primary"   onclick="saveNewClass()">Add Class</button>
    </div>`);
}

function saveNewClass() {
  const payload = {
    name:       document.getElementById('cl-name').value.trim(),
    type:       document.getElementById('cl-type').value,
    trainer_id: document.getElementById('cl-trainer').value,
    schedule:   document.getElementById('cl-schedule').value,
    location:   document.getElementById('cl-location').value.trim(),
    capacity:   parseInt(document.getElementById('cl-capacity').value) || null
  };
  if (!payload.name || !payload.schedule) { showToast('Please fill required fields.', 'error'); return; }
  // TODO: await apiPost('classes', payload);
  console.log('POST /api/classes', payload);
  closeModal();
  showToast('Class added! Connect backend to persist.', 'info');
}

function openEditClass(id) {
  const c = classes.find(x => x.id == id);
  showModal(`
    <h3 class="modal-title">Edit Class${c ? ': ' + c.name : ''}</h3>
    <div class="form-group"><label>Class Name</label><input id="ecl-name" class="form-input" value="${c?.name || ''}"/></div>
    <div class="form-row-2">
      <div class="form-group"><label>Schedule</label><input id="ecl-schedule" class="form-input" type="datetime-local" value="${c?.schedule || ''}"/></div>
      <div class="form-group"><label>Location</label><input id="ecl-location" class="form-input" value="${c?.location || ''}"/></div>
    </div>
    <div class="form-group"><label>Capacity</label><input id="ecl-capacity" class="form-input" type="number" value="${c?.capacity || ''}"/></div>
    <div class="modal-actions">
      <button class="btn-secondary" onclick="closeModal()">Cancel</button>
      <button class="btn-primary"   onclick="saveEditClass('${id}')">Save Changes</button>
    </div>`);
}

function saveEditClass(id) {
  const payload = {
    name:     document.getElementById('ecl-name').value.trim(),
    schedule: document.getElementById('ecl-schedule').value,
    location: document.getElementById('ecl-location').value.trim(),
    capacity: parseInt(document.getElementById('ecl-capacity').value) || null
  };
  // TODO: await apiPut(`classes/${id}`, payload);
  console.log('PUT /api/classes/' + id, payload);
  closeModal();
  showToast('Class updated! Connect backend to persist.', 'info');
}

function deleteClass(id) {
  if (!confirm('Delete this class?')) return;
  // TODO: await apiDelete(`classes/${id}`);
  console.log('DELETE /api/classes/' + id);
  showToast('Class deleted (connect backend to persist).', 'info');
}

function openAddBooking() {
  const memberOpts = members.length > 0
    ? members.map(m => `<option value="${m.id}">${m.first_name} ${m.last_name}</option>`).join('')
    : `<option value="">— No members loaded —</option>`;
  const classOpts = classes.length > 0
    ? classes.map(c => `<option value="${c.id}">${c.name} — ${c.schedule || ''}</option>`).join('')
    : `<option value="">— No classes loaded —</option>`;

  showModal(`
    <h3 class="modal-title">Book Member into Class</h3>
    <div class="form-group"><label>Member</label>
      <select id="bk-member" class="form-input">${memberOpts}</select>
    </div>
    <div class="form-group"><label>Class</label>
      <select id="bk-class" class="form-input">${classOpts}</select>
    </div>
    <div class="modal-actions">
      <button class="btn-secondary" onclick="closeModal()">Cancel</button>
      <button class="btn-primary"   onclick="saveNewBooking()">Book</button>
    </div>`);
}

function saveNewBooking() {
  const payload = {
    member_id: document.getElementById('bk-member').value,
    class_id:  document.getElementById('bk-class').value
  };
  if (!payload.member_id || !payload.class_id) { showToast('Please select a member and class.', 'error'); return; }
  // TODO: await apiPost('bookings', payload);
  console.log('POST /api/bookings', payload);
  closeModal();
  showToast('Booking created! Connect backend to persist.', 'info');
}

function cancelBooking(id) {
  if (!confirm('Cancel this booking?')) return;
  // TODO: await apiDelete(`bookings/${id}`);
  console.log('DELETE /api/bookings/' + id);
  showToast('Booking cancelled (connect backend to persist).', 'info');
}

// ============================================================
// BILLING & PAYMENTS TAB
// Connects to: payments table (amount, method, reference_no)
//              trainer_payouts table
// ============================================================
function renderBillingTab() {
  const totalRevenue = payments.reduce((s, p) => s + (parseFloat(p.amount) || 0), 0);
  const paymentRows  = payments.length > 0 ? payments.map(p => `
    <tr>
      <td>${p.member_name || '—'}</td>
      <td>${formatCurrency(p.amount)}</td>
      <td><span class="method-badge method-${(p.method||'').toLowerCase()}">${p.method || '—'}</span></td>
      <td>${p.reference_no || '—'}</td>
      <td>${p.plan_name || '—'}</td>
      <td>${formatDisplayDate(p.payment_date)}</td>
    </tr>`).join('')
    : `<tr><td colspan="6" class="empty-table-row">No payment records. Loads from the payments table.</td></tr>`;

  return `
  <div class="tab-header">
    <h2 class="tab-title">Billing &amp; Payments</h2>
    <div class="billing-summary">
      <span class="billing-total-label">Total Revenue:</span>
      <span class="billing-total-value">${formatCurrency(totalRevenue)}</span>
    </div>
  </div>
  <div class="table-wrap">
    <table class="data-table">
      <thead><tr>
        <th>Member</th><th>Amount</th><th>Method</th>
        <th>Reference No.</th><th>Plan</th><th>Date</th>
      </tr></thead>
      <tbody>${paymentRows}</tbody>
    </table>
  </div>`;
}

// ============================================================
// LOGS TAB — Attendance Logs + Audit Logs (MongoDB)
// ============================================================
function renderLogsTab() {
  const attendanceRows = attendanceLogs.length > 0 ? attendanceLogs.map(l => `
    <tr>
      <td>${l.member_name || l.trainer_name || '—'}</td>
      <td><span class="badge-role-${l.role || 'member'}">${l.role || 'member'}</span></td>
      <td>${formatDisplayDate(l.clock_in)}</td>
      <td>${l.clock_out ? formatDisplayDate(l.clock_out) : '<span class="text-muted">Still in</span>'}</td>
    </tr>`).join('')
    : `<tr><td colspan="4" class="empty-table-row">No attendance records. Loads from MongoDB attendance_logs collection.</td></tr>`;

  const auditRows = auditLogs.length > 0 ? auditLogs.map(l => `
    <tr>
      <td>${l.admin_name || '—'}</td>
      <td>${l.action || '—'}</td>
      <td>${l.target || '—'}</td>
      <td>${formatDisplayDate(l.timestamp)}</td>
    </tr>`).join('')
    : `<tr><td colspan="4" class="empty-table-row">No audit records. Loads from MongoDB admin_audit_logs collection.</td></tr>`;

  return `
  <div class="tab-header" style="margin-bottom:14px;">
    <h2 class="tab-title">Attendance Logs</h2>
    <span class="tab-subtitle">Source: MongoDB — attendance_logs</span>
  </div>
  <div class="table-wrap" style="margin-bottom:24px;">
    <table class="data-table">
      <thead><tr><th>Person</th><th>Role</th><th>Clock In</th><th>Clock Out</th></tr></thead>
      <tbody>${attendanceRows}</tbody>
    </table>
  </div>

  <div class="tab-header" style="margin-bottom:14px;">
    <h2 class="tab-title">Audit Logs</h2>
    <span class="tab-subtitle">Source: MongoDB — admin_audit_logs</span>
  </div>
  <div class="table-wrap">
    <table class="data-table">
      <thead><tr><th>Admin</th><th>Action</th><th>Target</th><th>Timestamp</th></tr></thead>
      <tbody>${auditRows}</tbody>
    </table>
  </div>`;
}
