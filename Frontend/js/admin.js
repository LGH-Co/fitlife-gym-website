import { members, trainers } from './data.js';

// Tab Navigation Logic
const tabs = document.querySelectorAll('.admin-nav button');
const sections = document.querySelectorAll('.view-section');

tabs.forEach(tab => {
    tab.addEventListener('click', () => {
        tabs.forEach(t => t.classList.remove('active'));
        sections.forEach(s => s.classList.remove('active'));
        
        tab.classList.add('active');
        document.getElementById(`${tab.dataset.tab}View`).classList.add('active');
    });
});

document.getElementById('logoutBtn').addEventListener('click', () => {
    window.location.href = 'index.html';
});

// Helper for "as of Datetime" constraint
function getAsOfDate() {
    return `<div class="metric-time">as of ${new Date().toLocaleString()}</div>`;
}

[cite_start]// Render Dashboard Metrics [cite: 52, 59, 60, 61, 62, 63, 64]
function renderDashboard() {
    const activeMembers = members.filter(m => m.status === 'Active').length;
    
    document.getElementById('metricsGrid').innerHTML = `
        <div class="metric-card">
            [cite_start]<div class="metric-label">Active Members [cite: 52]</div>
            [cite_start]<div class="metric-value">${activeMembers} [cite: 53]</div>
            ${getAsOfDate()}
        </div>
        <div class="metric-card">
            [cite_start]<div class="metric-label">Total Members [cite: 59]</div>
            [cite_start]<div class="metric-value">${members.length} [cite: 62]</div>
            ${getAsOfDate()}
        </div>
        <div class="metric-card">
            [cite_start]<div class="metric-label">Monthly Revenue [cite: 60]</div>
            [cite_start]<div class="metric-value">$200 [cite: 63]</div>
            ${getAsOfDate()}
        </div>
        <div class="metric-card">
            [cite_start]<div class="metric-label">Active Trainers [cite: 61]</div>
            [cite_start]<div class="metric-value">${trainers.length} [cite: 64]</div>
            ${getAsOfDate()}
        </div>
    `;
}

// Render Data Tables
function renderTables() {
    const memberTbody = document.getElementById('membersTableBody');
    memberTbody.innerHTML = members.map(m => `
        <tr>
            <td>${m.id}</td>
            <td><strong>${m.name}</strong></td>
            [cite_start]<td>${m.plan} [cite: 20, 26, 41]</td>
            [cite_start]<td><span style="color: ${m.status==='Active' ? 'green' : 'red'}">${m.status} [cite: 21, 27, 36]</span></td>
            [cite_start]<td>${m.expiry} [cite: 22, 28, 32]</td>
            [cite_start]<td>W: ${m.weight}, BMI: ${m.bmi} [cite: 23, 29, 33]</td>
            <td><button style="cursor:pointer">Edit</button></td>
        </tr>
    `).join('');

    const trainerTbody = document.getElementById('trainersTableBody');
    trainerTbody.innerHTML = trainers.map(t => `
        <tr>
            <td>${t.id}</td>
            [cite_start]<td><strong>${t.name}</strong> [cite: 69]</td>
            [cite_start]<td>${t.specialization} [cite: 69]</td>
            [cite_start]<td>$${t.rate} [cite: 69]</td>
            [cite_start]<td>${t.totalSessions} [cite: 69]</td>
            [cite_start]<td>$${t.earnings} [cite: 69]</td>
            <td><button style="cursor:pointer">Edit</button> <button style="cursor:pointer; color:red">Del</button></td>
        </tr>
    `).join('');
}

// Initialize Admin Portal
renderDashboard();
renderTables();