// frontend/js/admin.js

function formatPhpCurrency(value) {
  return new Intl.NumberFormat('en-PH', {
    style: 'currency',
    currency: 'PHP'
  }).format(Number(value) || 0);
}

function initAdmin() { renderAdminView('dashboard'); }

function adminLogout() {
  clearSessionTimer();
  localStorage.removeItem('fitlifeAdminSession');
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
  else if (tab === 'billing')   content.innerHTML = renderBillingTab();
  else if (tab === 'logs')      content.innerHTML = renderLogsTab();
}

// ── Dashboard ──
function renderDashboard() {
  const now          = new Date();
  const activeCount  = members.filter(m => m.loggedIn).length;
  const totalMembers = members.length;
  const goldMembers = members.filter(m => m.plan.includes('Gold') && m.status === 'active').length;
  const silverMembers = members.filter(m => m.plan.includes('Silver') && m.status === 'active').length;
  const goldMonthlyRev = goldMembers * 1499;
  const silverMonthlyRev = silverMembers * 999;
  const monthlyRev  = goldMonthlyRev + silverMonthlyRev;
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
      <div class="stat-sub">Gold: ${formatPhpCurrency(goldMonthlyRev)}</div>
      <div class="stat-sub">Silver: ${formatPhpCurrency(silverMonthlyRev)}</div>
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
      <div class="stat-datetime">as of ${asOf}</div>
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
      <div class="stat-datetime">as of ${asOf}</div>
    </div>
  </div>`;
}

// ── Members Tab ──
let memberPlanFilter = 'all';
let memberStatusFilter = 'all';

function renderMembersTab() {
  const planOptions = ['all', ...new Set(members.map(m => m.plan))];
  // Force 'archived' into the status options to ensure the view is always available
  const statusOptions = ['all', 'active', 'expired', 'banned', 'archived'];
  
  const planOpts = planOptions.map(p =>
    `<option value="${p}" ${memberPlanFilter === p ? 'selected' : ''}>${p === 'all' ? 'All Plans' : p}</option>`
  ).join('');
  
  const statusOpts = statusOptions.map(s =>
    `<option value="${s}" ${memberStatusFilter === s ? 'selected' : ''}>${s === 'all' ? 'All Status' : s.charAt(0).toUpperCase() + s.slice(1)}</option>`
  ).join('');

  const filteredMembers = members.filter(m => {
    const planMatch = memberPlanFilter === 'all' || m.plan === memberPlanFilter;
    
    // LOGIC: If 'all' is selected, hide archived members to keep the list clean.
    // If 'archived' is specifically selected, show only them.
    let statusMatch = false;
    if (memberStatusFilter === 'all') {
      statusMatch = m.membership_status !== 'archived'; 
    } else {
      statusMatch = m.membership_status === memberStatusFilter;
    }
    
    return planMatch && statusMatch;
  });

  const rows = filteredMembers.map(m => {
    const planCell = m.plan.includes('Gold')
        ? `<span class="plan-badge-gold">${m.plan}</span>`
        : `<span class="plan-text-silver">${m.plan}</span>`;
    
    // Dynamic status pill colors
    const statusCell = `<span class="status-pill-${m.status}">${m.status}</span>`;
    
    let displayJoinDate = '--';
    const rawJoinDate = m.join_date || m.joinDate;
    if (rawJoinDate) {
        const jd = new Date(rawJoinDate);
        displayJoinDate = !isNaN(jd) ? `${jd.getMonth()+1}/${jd.getDate()}/${jd.getFullYear()}` : rawJoinDate;
    }
    
    // If the member is archived, we might want to show a 'Restore' icon instead of delete
    const actionButtons = m.status === 'archived' 
      ? `<button class="tbl-btn-edit" onclick="restoreMember('${m.id}')" title="Restore Member" style="color: var(--success);">
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
            <polyline points="23 4 23 10 17 10"></polyline>
            <path d="M20.49 15a9 9 0 1 1-2.12-9.36L23 10"></path>
          </svg>
         </button>`
      : `<button class="tbl-btn-edit" onclick="openEditMember('${m.id}')" title="Edit">
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
            <path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"/>
            <path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"/>
          </svg>
        </button>
        <button class="tbl-btn-edit" onclick="renewMembership('${m.id}')" title="Renew Membership" style="background: var(--g100); color: var(--g600); border-color: var(--g200);">
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
            <path d="M21 2v6h-6"/>
            <path d="M3 12a9 9 0 0 1 15-6.7L21 8"/>
            <path d="M3 22v-6h6"/>
            <path d="M21 12a9 9 0 0 1-15 6.7L3 16"/>
          </svg>
        </button>
        <button class="tbl-btn-del" onclick="deleteMember('${m.id}')" title="Delete">
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
            <polyline points="3 6 5 6 21 6"/>
            <path d="M19 6l-1 14a2 2 0 0 1-2 2H8a2 2 0 0 1-2-2L5 6"/>
            <path d="M10 11v6"/><path d="M14 11v6"/>
            <path d="M9 6V4a1 1 0 0 1 1-1h4a1 1 0 0 1 1 1v2"/>
          </svg>
        </button>`;
    
    return `
    <tr>
      <td>${m.memberId ?? m.id ?? '--'}</td>
      <td><strong>${m.name}</strong></td>
      <td>${m.contact}</td>
      <td>${planCell}</td>
      <td>${statusCell}</td>
      <td><span style="color: var(--s600); font-weight: 500;">${displayJoinDate}</span></td>
      <td>${m.expiry || m.end_date || '--'}</td>
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
        ${actionButtons}
      </td>
    </tr>`;
  }).join('');

  return `
  <div class="tab-header">
    <h2 class="tab-title">Member Database ${memberStatusFilter === 'archived' ? '<span style="color:var(--error)">(Archives)</span>' : ''}</h2>
    <div class="tab-header-right">
      <select class="form-input form-select" onchange="changeMemberPlanFilter(this.value)">
        ${planOpts}
      </select>
      <select class="form-input form-select" onchange="changeMemberStatusFilter(this.value)">
        ${statusOpts}
      </select>
      <button class="btn-primary" onclick="openRegisterMember()">
        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round">
          <line x1="12" y1="5" x2="12" y2="19"/>
          <line x1="5"  y1="12" x2="19" y2="12"/>
        </svg>
        Register New Member
      </button>
    </div>
  </div>
  <div class="table-wrap">
    <table class="data-table">
      <thead><tr>
        <th>ID</th><th>Name</th><th>Contact</th><th>Plan</th><th>Status</th>
        <th>Join Date</th><th>Expiry</th><th>Body Metrics</th><th>Actions</th>
      </tr></thead>
      <tbody>${rows}</tbody>
    </table>
  </div>`;
}

function changeMemberPlanFilter(val) {
  memberPlanFilter = val;
  renderAdminView('members');
}

function changeMemberStatusFilter(val) {
  memberStatusFilter = val;
  renderAdminView('members');
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
        <input id="m-phone" class="form-input" placeholder="e.g. 09171234567" inputmode="numeric" pattern="\\d{11}" maxlength="11"/>
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
  const fname = document.getElementById('m-fname').value.trim();
  const lname = document.getElementById('m-lname').value.trim();
  const phone = document.getElementById('m-phone').value.trim();
  const email = document.getElementById('m-email').value.trim();
  const rfid  = document.getElementById('m-rfid').value.trim();
  const plan  = document.getElementById('m-plan').value;

  // ── REGEX DEFINITIONS ──
  const nameRegex = /^[A-Za-z\s\-]+$/;          // Strictly letters, spaces, or hyphens
  const phoneRegex = /^09\d{9}$/;               // Starts with 09, followed by 9 digits (11 total)
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/; // Standard email format

  // ── VALIDATION PHASE ──
  if (!fname || !lname || !rfid) {
    showToast('First Name, Last Name, and RFID are required.', 'error'); return;
  }
  if (!nameRegex.test(fname) || !nameRegex.test(lname)) {
    showToast('Names must contain only letters (no numbers allowed).', 'error'); return;
  }
  if (!phoneRegex.test(phone)) {
    showToast('Phone must start with 09 and contain exactly 11 digits.', 'error'); return;
  }
  if (!emailRegex.test(email)) {
    showToast('Please enter a valid email address format.', 'error'); return;
  }
  // if (members.find(m => m.rfid.toUpperCase() === rfid.toUpperCase())) {
  //   showToast('RFID already exists in the system.', 'error'); return;
  // }
  // REPLACE IT WITH THIS BULLETPROOF VERSION:
if (members.find(m => String(m.rfid).toUpperCase() === String(rfid).toUpperCase())) {
    showToast('RFID already exists in the system.', 'error'); return;
}
  // ── PROCEED TO SAVE ──
  const startDate = document.getElementById('m-start').value || new Date().toISOString().split('T')[0];

  // Call backend API — MySQL handles AUTO_INCREMENT for member_id
  fetch('http://localhost/fitlife-gym/backend/api/add_member.php', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      rfid: rfid.toUpperCase(),
      first_name: fname,
      last_name: lname,
      phone: phone,
      email: email,
      plan: plan,
      join_date: startDate,
      membership_status: 'active'
    })
  })
  .then(res => res.json())
  .then(async result => {
    if (result.status === 'success') {
      showToast(result.message, 'success');
      await loadMembers();
      renderAdminView('members');
    } else {
      showToast(result.message || 'Registration failed.', 'error');
    }
  })
  .catch(e => {
    console.error(e);
    showToast('Server connection failed.', 'error');
  });

  closeModal();
}

// WITH GOLD PLAN LOCK
function openEditMember(id) {
  const numId = typeof id === 'string' ? parseInt(id, 10) : id;
  const m = members.find(x => x.id === numId || x.id === id);
  if (!m) return;

  // Check if the user is Gold
  const bookButtonHTML = m.plan.includes('Gold') 
    ? `<button class="btn-primary" style="background-color: var(--p600);" onclick="openBookClassModal('${id}')">📅 Book Class</button>`
    : `<button class="btn-primary" style="background-color: #94a3b8; cursor: not-allowed;" disabled title="Gold Plan Required">🔒 Upgrade to Gold</button>`;
  
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
        <input id="em-phone" class="form-input" value="${m.phone || ''}" inputmode="numeric" pattern="\\d{11}" maxlength="11"/>
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
    <div class="modal-section-label" style="display: flex; justify-content: space-between; align-items: center;">
      <span>Body Metrics</span>
      <button class="btn-secondary" style="font-size: 12px; padding: 4px 8px; border-color: #cbd5e1;" onclick="viewMetricsHistory('${id}')">
        📊 View History
      </button>
    </div>
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
    <div class="modal-actions" style="justify-content: space-between;">
      ${bookButtonHTML}
      <div>
        <button class="btn-secondary" onclick="closeModal()">Cancel</button>
        <button class="btn-primary"   onclick="saveEditMember('${id}')">Save Changes</button>
      </div>
    </div>`);
}

function saveEditMember(id) {
  const numId = typeof id === 'string' ? parseInt(id, 10) : id;
  const m = members.find(x => x.id === numId || x.id === id);
  if (!m) return;

  const updatedPhone = document.getElementById('em-phone').value.trim();
  if (!/^\d{11}$/.test(updatedPhone)) {
    showToast('Phone Number must be exactly 11 digits.', 'error'); return;
  }
  
  const firstName = document.getElementById('em-fname').value.trim();
  const lastName  = document.getElementById('em-lname').value.trim();
  const email     = document.getElementById('em-email').value.trim();
  const plan      = document.getElementById('em-plan').value;
  const status    = document.getElementById('em-status').value;
  const height    = parseFloat(document.getElementById('em-height').value) || m.height;
  const weight    = parseFloat(document.getElementById('em-weight').value) || m.weight;

  // Persist to MySQL
  fetch('http://localhost/fitlife-gym/backend/api/update_member.php', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      member_id: numId || id,
      first_name: firstName,
      last_name: lastName,
      phone: updatedPhone,
      email: email,
      plan: plan,
      status: status
    })
  })
  .then(res => res.json())
  .then(async result => {
    if (result.status === 'success') {
      showToast('Member updated successfully!');
      await loadMembers();
      renderAdminView('members');
    } else {
      showToast(result.message || 'Update failed.', 'error');
    }
  })
  .catch(e => {
    console.error(e);
    showToast('Server connection failed.', 'error');
  });

  closeModal();
}

// RENEW MEMBERSHIP WITH PLAN SELECTION
function renewMembership(id) {
  const numId = typeof id === 'string' ? parseInt(id, 10) : id;
  const m = members.find(x => x.id === numId || x.id === id);
  const memberName = m ? m.name : `Member #${id}`;

  showModal(`
    <h3 class="modal-title">Renew Membership: ${memberName}</h3>
    <div class="form-group">
      <label>Select Membership Plan</label>
      <select id="renew-plan" class="form-input">
        <option value="1">Silver - 1 Month (₱999)</option>
        <option value="2">Silver - 3 Months (₱2,799)</option>
        <option value="3">Gold - 1 Month (₱1,499)</option>
        <option value="4">Gold - 12 Months (₱15,999)</option>
      </select>
    </div>
    <div class="modal-actions">
      <button class="btn-secondary" onclick="closeModal()">Cancel</button>
      <button class="btn-primary" onclick="confirmRenewMembership('${id}')">Renew Membership</button>
    </div>
  `);
}

async function confirmRenewMembership(id) {
  const planId = document.getElementById('renew-plan').value;
  
  try {
    const res = await fetch('http://localhost/fitlife-gym/backend/api/renew_membership.php', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ member_id: id, plan_id: parseInt(planId) })
    });
    const result = await res.json();
    
    if (result.status === 'success') {
      showToast(result.message, 'success');
      closeModal();
      await loadMembers();
      renderAdminView('members');
    } else {
      showToast(result.message, 'error');
    }
  } catch (e) { 
    console.error(e); 
    showToast('Server connection failed.', 'error'); 
  }
}

// SECURE SOFT DELETE FOR MEMBERS
async function deleteMember(id) {
  if (!confirm('Securely archive this member? Their financial and attendance records will remain intact.')) return;
  
  try {
    const res = await fetch('http://localhost/fitlife-gym/backend/api/delete_member.php', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ member_id: id })
    });
    const result = await res.json();
    
    if (result.status === 'success') {
      showToast(result.message, 'info');
      // Reload the live data from MySQL and instantly redraw the table
      await loadMembers();
      renderAdminView('members');
    } else {
      showToast(result.message, 'error');
    }
  } catch (e) { 
    console.error(e); 
    showToast('Server connection failed.', 'error'); 
  }
}

// ── Member Booking Integration ──
// RESTORE ARCHIVED MEMBER
async function restoreMember(id) {
  if (!confirm('Restore this member to active status?')) return;
  
  try {
    const res = await fetch('http://localhost/fitlife-gym/backend/api/restore_member.php', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ member_id: id })
    });
    const result = await res.json();
    
    if (result.status === 'success') {
      showToast(result.message, 'success');
      await loadMembers();
      renderAdminView('members');
    } else {
      showToast(result.message, 'error');
    }
  } catch (e) { 
    console.error(e); 
    showToast('Server connection failed.', 'error'); 
  }
}

function openBookClassModal(memberId) {
  const numId = typeof memberId === 'string' ? parseInt(memberId, 10) : memberId;
  const m = members.find(x => x.id === numId || x.id === memberId);
  if (!m) return;

  if (!classesData || classesData.length === 0) {
    showToast('No classes available in the schedule.', 'warning');
    return;
  }

  const classOpts = classesData.map(c => 
    `<option value="${c.id}">${c.name} (${c.startsAt} w/ ${c.trainer})</option>`
  ).join('');

  showModal(`
    <h3 class="modal-title">Book Class for ${m.name}</h3>
    <div class="form-group">
      <label>Select a Scheduled Class</label>
      <select id="book-class-select" class="form-input">
        ${classOpts}
      </select>
    </div>
    <div class="modal-actions" style="margin-top: 30px;">
      <button class="btn-secondary" onclick="openEditMember('${memberId}')">← Back to Profile</button>
      <button class="btn-primary" onclick="submitClassBooking('${memberId}')">Confirm Booking</button>
    </div>
  `);
}

async function submitClassBooking(memberId) {
  const classId = document.getElementById('book-class-select').value;
  if (!classId) return;

  try {
    const res = await fetch('http://localhost/fitlife-gym/backend/api/add_booking.php', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ member_id: memberId, class_id: classId })
    });
    const result = await res.json();

    if (result.status === 'success') {
      showToast(result.message, 'success');
      closeModal();
    } else {
      showToast(result.message, 'error');
    }
  } catch (e) {
    console.error(e);
    showToast('Server connection failed.', 'error');
  }
}

// ── View Historical Health Metrics (MongoDB) ──
async function viewMetricsHistory(memberId) {
  try {
    const res = await fetch(`http://localhost/fitlife-gym/backend/api/get_member_metrics.php?member_id=${memberId}`);
    const result = await res.json();
    
    let rows = '<tr><td colspan="5" style="text-align:center; padding: 20px; color: #999;">No historical logs found in MongoDB.</td></tr>';
    
    if (result.status === 'success' && result.data.length > 0) {
      rows = result.data.map(m => `
        <tr>
          <td><strong style="color: var(--p600);">${m.date}</strong></td>
          <td><span style="font-weight: 600; color: #b45309;">${m.type}</span></td>
          <td>${m.meal}</td>
          <td><span class="status-pill-active">Level ${m.fatigue}</span></td>
          <td style="font-size: 12px; color: var(--s500); max-width: 200px;">${m.notes}</td>
        </tr>
      `).join('');
    }

    showModal(`
      <h3 class="modal-title">Health & Workout Logs: ${memberId}</h3>
      <div class="table-wrap" style="max-height: 350px; overflow-y: auto;">
        <table class="data-table">
          <thead>
            <tr>
              <th>Date</th>
              <th>Type</th>
              <th>Pre-Workout Meal</th>
              <th>Fatigue (1-10)</th>
              <th>Notes</th>
            </tr>
          </thead>
          <tbody>
            ${rows}
          </tbody>
        </table>
      </div>
      <div class="modal-actions" style="margin-top: 20px;">
        <button class="btn-primary" onclick="openEditMember('${memberId}')">← Back to Profile</button>
      </div>
    `);
  } catch (error) {
    console.error(error);
    showToast('Failed to connect to MongoDB Cloud.', 'error');
  }
}

// ── Trainers Tab ──
let trainerEarningsFilter = 'all';
let trainerStatusFilter = 'all';

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

  const trainerStatusOptions = ['all', 'active', 'archived'];
  const trainerStatusOpts = trainerStatusOptions.map(s =>
    `<option value="${s}" ${trainerStatusFilter === s ? 'selected' : ''}>${s === 'all' ? 'All Status' : s.charAt(0).toUpperCase() + s.slice(1)}</option>`
  ).join('');

  const filteredTrainers = trainers.filter(t => {
    if (trainerStatusFilter === 'all') return t.status !== 'archived';
    return t.status === trainerStatusFilter;
  });

  const rows = filteredTrainers.map(t => {
    const earnings = getTrainerEarnings(t, trainerEarningsFilter);
    const sessions = getFilteredSessions(t, trainerEarningsFilter);
    const label    = monthLabels[trainerEarningsFilter];

    const actionButtons = t.status === 'archived'
      ? `<button class="tbl-btn-edit" onclick="restoreTrainer('${t.id}')" title="Restore Trainer" style="color: var(--success);">
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
            <polyline points="23 4 23 10 17 10"></polyline>
            <path d="M20.49 15a9 9 0 1 1-2.12-9.36L23 10"></path>
          </svg>
         </button>`
      : `<button class="tbl-btn-edit" onclick="openEditTrainer('${t.id}')" title="Edit">
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
        </button>`;

    return `
    <tr>
      <td>${t.trainerId ?? t.id ?? '--'}</td>
      <td><strong>${t.name}</strong></td>
      <td>${t.specialization}</td>
      <td>${formatPhpCurrency(t.ratePerSession)}</td>
      <td>${sessions}</td>
      <td class="earnings-green">
        ${formatPhpCurrency(earnings)} <span class="filter-label">(${label})</span>
      </td>
      <td class="action-cell">
        ${actionButtons}
      </td>
    </tr>`;
  }).join('');

  return `
  <div class="tab-header">
    <h2 class="tab-title">Trainer Database ${trainerStatusFilter === 'archived' ? '<span style="color:var(--error)">(Archives)</span>' : ''}</h2>
    <div class="tab-header-right">
      <select class="form-input form-select" onchange="changeTrainerStatusFilter(this.value)">
        ${trainerStatusOpts}
      </select>
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
        <th>ID</th><th>Name</th><th>Specialization</th><th>Rate/Session</th>
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

function changeTrainerStatusFilter(val) {
  trainerStatusFilter = val;
  renderAdminView('trainers');
}

// RESTORE ARCHIVED TRAINER
async function restoreTrainer(id) {
  if (!confirm('Restore this trainer to active status?')) return;
  
  try {
    const res = await fetch('http://localhost/fitlife-gym/backend/api/restore_trainer.php', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ trainer_id: id })
    });
    const result = await res.json();
    
    if (result.status === 'success') {
      showToast(result.message, 'success');
      await loadTrainers();
      renderAdminView('trainers');
    } else {
      showToast(result.message, 'error');
    }
  } catch (e) { 
    console.error(e); 
    showToast('Server connection failed.', 'error'); 
  }
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
      <label>Phone Number</label>
      <input id="t-phone" class="form-input" placeholder="e.g. 09171234567" inputmode="numeric" pattern="\\d{11}" maxlength="11"/>
    </div>
    <div class="form-group">
      <label>Email Address</label>
      <input id="t-email" class="form-input" placeholder="trainer@example.com"/>
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

async function saveNewTrainer() {
  const name = document.getElementById('t-name').value.trim();
  const rfid = document.getElementById('t-rfid').value.trim();
  const phone = document.getElementById('t-phone').value.trim();
  const email = document.getElementById('t-email').value.trim();
  const spec = document.getElementById('t-spec').value;
  const rate = document.getElementById('t-rate').value.trim();

  // ── REGEX DEFINITIONS ──
  const nameRegex = /^[A-Za-z\s\-]+$/;
  const phoneRegex = /^09\d{9}$/;
  const rateRegex = /^\d+(\.\d{1,2})?$/; // Only positive numbers or decimals

  // ── VALIDATION PHASE ──
  if (!name || !rfid || !rate || !email) {
    showToast('Please fill all required fields.', 'error'); return;
  }
  if (!nameRegex.test(name)) {
    showToast('Trainer name must contain only letters.', 'error'); return;
  }
  if (!phoneRegex.test(phone)) {
    showToast('Phone must be 11 digits starting with 09.', 'error'); return;
  }
  if (!/^[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\.[A-Za-z]{2,}$/.test(email)) {
    showToast('Please provide a valid email address.', 'error'); return;
  }
  if (!rateRegex.test(rate)) {
    showToast('Rate per Session must be a valid number (e.g., 500 or 500.50).', 'error'); return;
  }
  if (trainers.find(t => t.rfid.toUpperCase() === rfid.toUpperCase())) {
    showToast('Trainer ID/RFID already exists.', 'error'); return;
  }

  try {
    const res = await fetch('http://localhost/fitlife-gym/backend/api/add_trainer.php', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        name,
        rfid,
        phone,
        email,
        specialization: spec,
        hire_date: new Date().toISOString().split('T')[0]
      })
    });

    const result = await res.json();

    if (result.status !== 'success') {
      showToast(result.message || 'Failed to onboard trainer.', 'error');
      return;
    }

    await loadTrainers();
    closeModal();
    renderAdminView('trainers');
    showToast(`${name} onboarded successfully!`);
  } catch (error) {
    console.error(error);
    showToast('Server connection failed.', 'error');
  }
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
      <label>Phone Number</label>
      <input id="et-phone" class="form-input" value="${t.phone || ''}" inputmode="numeric" pattern="\\d{11}" maxlength="11"/>
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
  const updatedPhone = document.getElementById('et-phone').value.trim();
  if (!/^\d{11}$/.test(updatedPhone)) {
    showToast('Phone Number must be exactly 11 digits.', 'error'); return;
  }
  const name           = document.getElementById('et-name').value.trim();
  const specialization = document.getElementById('et-spec').value;

  // Persist to MySQL
  fetch('http://localhost/fitlife-gym/backend/api/update_trainer.php', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      trainer_id: id,
      name: name,
      phone: updatedPhone,
      specialization: specialization
    })
  })
  .then(res => res.json())
  .then(async result => {
    if (result.status === 'success') {
      showToast('Trainer updated successfully!');
      await loadTrainers();
      renderAdminView('trainers');
    } else {
      showToast(result.message || 'Update failed.', 'error');
    }
  })
  .catch(e => {
    console.error(e);
    showToast('Server connection failed.', 'error');
  });

  closeModal();
}

// SECURE SOFT DELETE FOR TRAINERS
async function deleteTrainer(id) {
  if (!confirm('Securely archive this trainer? Their session and payout records will remain intact.')) return;
  
  try {
    const res = await fetch('http://localhost/fitlife-gym/backend/api/delete_trainer.php', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ trainer_id: id })
    });
    const result = await res.json();
    
    if (result.status === 'success') {
      showToast(result.message, 'info');
      // Reload the live data from MySQL and instantly redraw the table
      await loadTrainers();
      renderAdminView('trainers');
    } else {
      showToast(result.message, 'error');
    }
  } catch (e) { 
    console.error(e); 
    showToast('Server connection failed.', 'error'); 
  }
}

// ── Classes Tab ──
let classNameFilter = 'all';
let classInstructorFilter = 'all';
let classStatusFilter = 'all';

function renderClassesTab() {
  const classNameOptions = ['all', ...new Set(classesData.map(c => c.name))];
  const instructorOptions = ['all', ...new Set(classesData.map(c => c.trainer))];

  const classNameOpts = classNameOptions.map(name => `
    <option value="${name}" ${classNameFilter === name ? 'selected' : ''}>${name === 'all' ? 'All Class Names' : name}</option>
  `).join('');

  const instructorOpts = instructorOptions.map(instructor => `
    <option value="${instructor}" ${classInstructorFilter === instructor ? 'selected' : ''}>${instructor === 'all' ? 'All Instructors' : instructor}</option>
  `).join('');

  const classStatusOptions = ['all', 'active', 'archived'];
  const classStatusOpts = classStatusOptions.map(s =>
    `<option value="${s}" ${classStatusFilter === s ? 'selected' : ''}>${s === 'all' ? 'All Status' : s.charAt(0).toUpperCase() + s.slice(1)}</option>`
  ).join('');

  const filteredClasses = classesData.filter(c => {
    const nameMatch = classNameFilter === 'all' || c.name === classNameFilter;
    const instrMatch = classInstructorFilter === 'all' || c.trainer === classInstructorFilter;
    let statusMatch = false;
    if (classStatusFilter === 'all') {
      statusMatch = c.status !== 'archived';
    } else {
      statusMatch = c.status === classStatusFilter;
    }
    return nameMatch && instrMatch && statusMatch;
  });

  const rows = filteredClasses.map(c => {
    const actionButtons = c.status === 'archived'
      ? `<button class="tbl-btn-edit" onclick="restoreClass(${c.id})" title="Restore Class" style="color: var(--success);">
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
            <polyline points="23 4 23 10 17 10"></polyline>
            <path d="M20.49 15a9 9 0 1 1-2.12-9.36L23 10"></path>
          </svg>
         </button>`
      : `<button class="tbl-btn-edit" onclick="viewClassBookings(${c.id})" title="View Bookings">
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
            <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"/>
            <circle cx="9" cy="7" r="4"/>
            <path d="M23 21v-2a4 4 0 0 0-3-3.87"/>
            <path d="M16 3.13a4 4 0 0 1 0 7.75"/>
          </svg>
        </button>
        <button class="tbl-btn-del" onclick="deleteClass(${c.id})" title="Archive Class">
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
            <polyline points="3 6 5 6 21 6"/>
            <path d="M19 6l-1 14a2 2 0 0 1-2 2H8a2 2 0 0 1-2-2L5 6"/>
            <path d="M10 11v6"/><path d="M14 11v6"/>
            <path d="M9 6V4a1 1 0 0 1 1-1h4a1 1 0 0 1 1 1v2"/>
          </svg>
        </button>`;

    return `
    <tr>
      <td>${c.id ?? '--'}</td>
      <td><strong>${c.name}</strong></td>
      <td>${c.trainer}</td>
      <td>
        <span class="plan-badge-gold" style="background:var(--p50); color:var(--p600)">
          ${c.startsAt}
        </span>
      </td>
      <td>${c.duration} mins</td>
      <td>${c.location}</td>
      <td><span class="status-pill-active">${c.bookedCount} / ${c.capacity}</span></td>
      <td class="action-cell">
        ${actionButtons}
      </td>
    </tr>`;
  }).join('');

  return `
  <div class="tab-header">
    <h2 class="tab-title">Class Schedule ${classStatusFilter === 'archived' ? '<span style="color:var(--error)">(Archives)</span>' : ''}</h2>
    <div class="tab-header-right">
      <select class="form-input form-select" onchange="changeClassStatusFilter(this.value)">
        ${classStatusOpts}
      </select>
      <select class="form-input form-select" onchange="changeClassNameFilter(this.value)">
        ${classNameOpts}
      </select>
      <select class="form-input form-select" onchange="changeClassInstructorFilter(this.value)">
        ${instructorOpts}
      </select>
      <button class="btn-primary" onclick="openScheduleClass()">
        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round">
          <line x1="12" y1="5" x2="12" y2="19"/>
          <line x1="5"  y1="12" x2="19" y2="12"/>
        </svg>
        Schedule New Class
      </button>
    </div>
  </div>
  <div class="table-wrap">
    <table class="data-table">
      <thead><tr>
        <th>ID</th><th>Class Name</th><th>Instructor</th><th>Schedule</th>
        <th>Duration</th><th>Location</th><th>Booked/Capacity</th><th>Actions</th>
      </tr></thead>
      <tbody>${rows}</tbody>
    </table>
  </div>`;
}

function changeClassNameFilter(val) {
  classNameFilter = val;
  renderAdminView('classes');
}

function changeClassInstructorFilter(val) {
  classInstructorFilter = val;
  renderAdminView('classes');
}

function changeClassStatusFilter(val) {
  classStatusFilter = val;
  renderAdminView('classes');
}

// RESTORE ARCHIVED CLASS
async function restoreClass(classId) {
  if (!confirm('Restore this class to the active schedule?')) return;
  
  try {
    const res = await fetch('http://localhost/fitlife-gym/backend/api/restore_class.php', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ class_id: classId })
    });
    const result = await res.json();
    
    if (result.status === 'success') {
      showToast(result.message, 'success');
      await loadClasses();
      renderAdminView('classes');
    } else {
      showToast(result.message, 'error');
    }
  } catch (e) { 
    console.error(e); 
    showToast('Server connection failed.', 'error'); 
  }
}

// ── Class Management Modals ──

function openScheduleClass() {
  const trainerOpts = trainers.map(t => {
      const dbId = parseInt(t.trainerId ?? t.id);
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
  const datetimeRaw = document.getElementById('c-datetime').value; 
  const duration = parseInt(document.getElementById('c-duration').value);
  const capacity = parseInt(document.getElementById('c-capacity').value);

  if (!name || !datetimeRaw || !location) {
    showToast('Please fill out all required fields.', 'error'); return;
  }

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

// SECURE SOFT DELETE FOR CLASSES
async function deleteClass(classId) {
  if (!confirm('Archive this class? It will be hidden from the schedule but booking records will remain intact.')) return;
  
  try {
    const res = await fetch('http://localhost/fitlife-gym/backend/api/delete_class.php', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ class_id: classId })
    });
    const result = await res.json();
    
    if (result.status === 'success') {
      showToast(result.message, 'info');
      await loadClasses();
      renderAdminView('classes');
    } else {
      showToast(result.message, 'error');
    }
  } catch (e) { 
    console.error(e); 
    showToast('Server connection failed.', 'error'); 
  }
}

// WITH UNENROLL TRASH CAN
// ── View Class Bookings ──
async function viewClassBookings(classId) {
  try {
    const classInfo = classesData.find(c => (c.id) === classId);
    if (!classInfo) {
      showToast('Class not found.', 'error');
      return;
    }

    const response = await fetch(`http://localhost/fitlife-gym/backend/api/get_class_bookings.php?class_id=${classId}`);
    const result = await response.json();

    if (result.status !== 'success') {
      showToast(result.message || 'Failed to load bookings.', 'error');
      return;
    }

    const bookings = result.data || [];
    
    let bookingRows = '';
    if (bookings.length === 0) {
      bookingRows = '<tr><td colspan="6" style="text-align:center; padding:20px; color:#999;">No bookings yet</td></tr>';
    } else {
      bookingRows = bookings.map(b => {
        const statusColor = {
          'booked': 'var(--p600)',
          'attended': 'var(--success)',
          'cancelled': 'var(--error)',
          'no_show': 'var(--warning)'
        }[b.status] || 'var(--p600)';
        
        const bookedDate = new Date(b.booked_at).toLocaleString('en-US', {
          month: 'short', day: 'numeric', year: 'numeric', 
          hour: 'numeric', minute: '2-digit', hour12: true
        });
        
        // Hide cancelled bookings by default
        const hideStyle = b.status === 'cancelled' ? 'display: none;' : '';
        
        return `
          <tr style="${hideStyle}">
            <td style="white-space: nowrap;"><strong>${b.member_name}</strong></td>
            <td>${b.email || '--'}</td>
            <td style="white-space: nowrap;">${b.phone || '--'}</td>
            <td style="white-space: nowrap;">${bookedDate}</td>
            <td><span style="color:${statusColor}; font-weight:600;">${(b.status || 'booked').toUpperCase()}</span></td>
            <td style="text-align: center;">
              <button class="tbl-btn-del" onclick="cancelClassBooking(${b.booking_id}, ${classId})" title="Unenroll Member">
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                  <polyline points="3 6 5 6 21 6"/>
                  <path d="M19 6l-1 14a2 2 0 0 1-2 2H8a2 2 0 0 1-2-2L5 6"/>
                  <path d="M10 11v6"/><path d="M14 11v6"/>
                  <path d="M9 6V4a1 1 0 0 1 1-1h4a1 1 0 0 1 1 1v2"/>
                </svg>
              </button>
            </td>
          </tr>
        `;
      }).join('');
    }

    // 1. Added a <div style="min-width: 800px;"> wrapper to force the modal wide
    // 2. Added overflow-x: auto to the table wrapper just in case they are on a small laptop screen
    showModal(`
      <div style="min-width: 800px;"> 
        <div style="display: flex; justify-content: space-between; align-items: center;">
          <h3 class="modal-title">Class Bookings: ${classInfo.name}</h3>
          <label style="font-size: 12px; color: var(--s500);">
            <input type="checkbox" id="show-cancelled" onchange="toggleCancelledBookings(this.checked)"> Show Cancelled
          </label>
        </div>
        <div style="margin-bottom:15px; color:#666;">
          <strong>Instructor:</strong> ${classInfo.trainer} &nbsp;|&nbsp; 
          <strong>Schedule:</strong> ${classInfo.startsAt} &nbsp;|&nbsp; 
          <strong>Booked:</strong> ${bookings.length} / ${classInfo.capacity}
        </div>
        <div class="table-wrap" style="max-height:400px; overflow-y:auto; overflow-x:auto;">
          <table class="data-table" style="width: 100%; min-width: 750px;">
            <thead>
              <tr>
                <th>Member Name</th>
                <th>Email</th>
                <th>Phone</th>
                <th>Booked At</th>
                <th>Status</th>
                <th style="text-align: center;">Action</th>
              </tr>
            </thead>
            <tbody id="booking-table-body">
              ${bookingRows}
            </tbody>
          </table>
        </div>
        <div class="modal-actions" style="margin-top: 20px;">
          <button class="btn-secondary" onclick="closeModal()">Close</button>
        </div>
      </div>
    `);
  } catch (error) {
    console.error(error);
    showToast('Failed to load bookings.', 'error');
  }
}

// ── Cancel/Unenroll Class Booking ──
async function cancelClassBooking(bookingId, classId) {
  if (!confirm('Are you sure you want to unenroll this member? Their slot will be freed up.')) return;

  try {
    const res = await fetch('http://localhost/fitlife-gym/backend/api/cancel_booking.php', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ booking_id: bookingId })
    });
    const result = await res.json();

    if (result.status === 'success') {
      showToast(result.message, 'success');
      // Reload classes to instantly update the capacity counter in the background
      await loadClasses();
      renderAdminView('classes');
      // Re-trigger the modal so the deleted person instantly vanishes from the screen
      viewClassBookings(classId);
    } else {
      showToast(result.message, 'error');
    }
  } catch (error) {
    console.error(error);
    showToast('Server connection failed.', 'error');
  }
}

// ── Toggle Cancelled Bookings Visibility ──
function toggleCancelledBookings(show) {
  const rows = document.querySelectorAll('#booking-table-body tr');
  rows.forEach(row => {
    if (row.innerText.includes('CANCELLED')) {
      row.style.display = show ? 'table-row' : 'none';
    }
  });
}

// ── Financials & Billing Tab ──
function renderBillingTab() {
  // 1. Safety check: Initialize row variables
  let paymentRowsHtml = '<tr><td colspan="6" style="text-align:center; padding:20px; color:#999;">No payments recorded in database.</td></tr>';
  let payoutRowsHtml = '<tr><td colspan="6" style="text-align:center; padding:20px; color:#999;">No payouts recorded in database.</td></tr>';

  try {
    // 2. Build Payment Rows if data exists
    if (typeof paymentsData !== 'undefined' && paymentsData.length > 0) {
      paymentRowsHtml = paymentsData.map(p => `
        <tr>
          <td>${p.id || '--'}</td>
          <td><strong>${p.memberName || 'Unknown'}</strong></td>
          <td><span class="status-pill-active">${formatPhpCurrency(p.amount)}</span></td>
          <td>${p.date ? new Date(p.date).toLocaleDateString() : '--'}</td>
          <td><span style="font-size: 11px; font-weight: bold; color: var(--s500);">${(p.method || 'N/A').toUpperCase()}</span></td>
          <td style="font-family: monospace;">${p.reference || '--'}</td>
        </tr>
      `).join('');
    }

    // 3. Build Payout Rows if data exists
    if (typeof payoutsData !== 'undefined' && payoutsData.length > 0) {
      payoutRowsHtml = payoutsData.map(p => {
        const statusClass = p.status === 'paid' ? 'status-pill-active' : 'status-pill-banned';
        const displayStatus = (p.status || 'pending').toUpperCase();
        return `
        <tr>
          <td>${p.id || '--'}</td>
          <td><strong>${p.trainerName || 'Unknown'}</strong></td>
          <td><span class="plan-badge-gold" style="color: #b45309; background: #fef3c7;">${formatPhpCurrency(p.amount)}</span></td>
          <td>${p.date ? new Date(p.date).toLocaleDateString() : '--'}</td>
          <td><span class="${statusClass}">${displayStatus}</span></td>
          <td class="action-cell">
            ${p.status === 'pending'
              ? `<button class="btn-primary" style="padding: 4px 10px; font-size: 11px;" onclick="approvePayout(${p.id})">Approve</button>`
              : `<span style="color: var(--success); font-weight: bold; font-size: 11px;">✔ Paid</span>`}
          </td>
        </tr>`;
      }).join('');
    }
  } catch (err) {
    console.error("Error processing billing data:", err);
  }

  // 4. Return the Final HTML Structure
  return `
  <div class="tab-header">
    <h2 class="tab-title">Financial Ledger</h2>
    <div class="tab-header-right">
       <button class="btn-secondary" onclick="console.log('Export CSV clicked')" style="font-size: 12px;">
          📊 Export CSV
       </button>
    </div>
  </div>

  <div style="display: grid; grid-template-columns: 1.2fr 1fr; gap: 20px; align-items: start;">
      <div class="table-wrap">
        <div style="padding: 12px 20px; border-bottom: 1px solid var(--s200); background: #f8fafc; display: flex; justify-content: space-between;">
            <h3 style="margin: 0; font-size: 14px; color: var(--p600);">Incoming: Revenue</h3>
        </div>
        <table class="data-table">
          <thead><tr><th>ID</th><th>Member</th><th>Amount</th><th>Date</th><th>Method</th><th>Ref</th></tr></thead>
          <tbody>${paymentRowsHtml}</tbody>
        </table>
      </div>

      <div class="table-wrap">
        <div style="padding: 12px 20px; border-bottom: 1px solid var(--s200); background: #fdf4ff; display: flex; justify-content: space-between;">
            <h3 style="margin: 0; font-size: 14px; color: #c026d3;">Outgoing: Payouts</h3>
        </div>
        <table class="data-table">
          <thead><tr><th>ID</th><th>Trainer</th><th>Amount</th><th>Date</th><th>Status</th><th>Action</th></tr></thead>
          <tbody>${payoutRowsHtml}</tbody>
        </table>
      </div>
  </div>`;
}

// ── Cybersecurity System Logs Tab ──
function renderLogsTab() {
  let rows = '<tr><td colspan="5" style="text-align:center; padding:20px; color:#999;">No forensic logs found in MongoDB.</td></tr>';
  
  if (auditLogsData && auditLogsData.length > 0) {
    rows = auditLogsData.map(log => {
      // Dynamic color coding based on action severity
      let actionColor = 'var(--p600)';
      const actionText = log.action ? log.action.toLowerCase() : '';
      
      if (actionText.includes('delete') || actionText.includes('archive') || actionText.includes('remove')) {
          actionColor = 'var(--error)'; // Red
      } else if (actionText.includes('add') || actionText.includes('create') || actionText.includes('insert')) {
          actionColor = 'var(--success)'; // Green
      } else if (actionText.includes('edit') || actionText.includes('update')) {
          actionColor = '#b45309'; // Orange
      }

      // We replace underscores with spaces so "UPDATE_MEMBER_STATUS" becomes "UPDATE MEMBER STATUS"
      const formattedAction = log.action.replace(/_/g, ' ');

      return `
      <tr>
        <td style="font-family: monospace; font-size: 13px; color: var(--s500);">${log.timestamp}</td>
        <td><strong>${log.admin}</strong></td>
        <td><span style="color: ${actionColor}; font-weight: 600;">${formattedAction}</span></td>
        <td style="font-family: monospace; font-size: 13px; color: var(--p600);">${log.target}</td>
        <td style="font-size: 12px; color: var(--s500); max-width: 250px; overflow: hidden; text-overflow: ellipsis; white-space: nowrap;" title='${log.details}'>
          ${log.details}
        </td>
      </tr>`;
    }).join('');
  }

  return `
  <div class="tab-header">
    <h2 class="tab-title" style="color: var(--error);">Security & Audit Logs</h2>
    <button class="btn-secondary" onclick="alert('Access Denied: Only root admins can clear forensic data.')" style="border-color: var(--error); color: var(--error);">
      Clear Logs
    </button>
  </div>
  <div class="table-wrap">
    <div style="padding: 15px 20px; border-bottom: 1px solid var(--s200); background: #fef2f2; border-radius: 12px 12px 0 0;">
        <h3 style="margin: 0; font-size: 14px; color: var(--error);">Live MongoDB Security Feed</h3>
    </div>
    <table class="data-table">
      <thead><tr>
        <th>Timestamp</th><th>Actor ID</th><th>Action Taken</th><th>Target RFID</th><th>Details</th>
      </tr></thead>
      <tbody>${rows}</tbody>
    </table>
  </div>`;
}