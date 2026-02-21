import { members, trainers } from './data.js';

// Tab Navigation
document.querySelectorAll('.nav-btn').forEach(btn => {
    btn.addEventListener('click', () => {
        document.querySelectorAll('.nav-btn, .view-section').forEach(el => el.classList.remove('active'));
        btn.classList.add('active');
        document.getElementById(`${btn.dataset.tab}View`).classList.add('active');
    });
});

function initAdmin() {
    const now = new Date().toLocaleString();
    
    // Metrics calculation 
    const activeCount = members.filter(m => m.status === 'active').length;
    const totalCount = members.length;
    const revenue = 200; // Hardcoded based on PDF [cite: 63]
    const trainerCount = trainers.length;

    document.getElementById('metricsGrid').innerHTML = `
        <div class="metric-card">
            <small>Active Members</small>
            <div class="m-val">${activeCount}</div>
            <small class="as-of">as of ${now}</small>
        </div>
        <div class="metric-card">
            <small>Total Members</small>
            <div class="m-val">${totalCount}</div>
            <small class="as-of">as of ${now}</small>
        </div>
        <div class="metric-card">
            <small>Monthly Revenue</small>
            <div class="m-val">$${revenue}</div>
            <small class="as-of">as of ${now}</small>
        </div>
        <div class="metric-card">
            <small>Active Trainers</small>
            <div class="m-val">${trainerCount}</div>
            <small class="as-of">as of ${now}</small>
        </div>
    `;

    renderTables();
}

function renderTables() {
    const mBody = document.getElementById('membersTableBody');
    mBody.innerHTML = members.map(m => `
        <tr>
            <td>${m.id}</td>
            <td><strong>${m.name}</strong><br><small>${m.email}</small></td>
            <td>${m.plan}</td>
            <td class="${m.status}">${m.status}</td>
            <td>${m.expiry}</td>
            <td>Weight: ${m.weight}<br>BMI: ${m.bmi}</td>
            <td><button class="action-btn">Edit</button></td>
        </tr>
    `).join('');

    const tBody = document.getElementById('trainersTableBody');
    tBody.innerHTML = trainers.map(t => `
        <tr>
            <td><strong>${t.name}</strong></td>
            <td>${t.specialization}</td>
            <td>$${t.rate}</td>
            <td>${t.totalSessions}</td>
            <td>$${t.earnings}</td>
            <td><button class="action-btn">Edit</button></td>
        </tr>
    `).join('');
}

initAdmin();