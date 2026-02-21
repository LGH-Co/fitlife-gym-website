import { members, trainers } from './data.js';

const rfidInput = document.getElementById('rfidInput');
const scanBtn = document.getElementById('scanBtn');
const userProfileCard = document.getElementById('userProfileCard');
const timeoutBadge = document.getElementById('timeoutBadge');

let countdownInterval;
let timeoutId;
let timeLeft = 60;

function handleScan() {
    const id = rfidInput.value.trim().toUpperCase();
    if (!id) return;

    const member = members.find(m => m.id === id || m.name.toUpperCase() === id);
    if (member) {
        renderMemberCard(member);
        startSessionTimer();
        return;
    }

    const trainer = trainers.find(t => t.id === id || t.name.toUpperCase() === id);
    if (trainer) {
        renderTrainerCard(trainer);
        startSessionTimer();
        return;
    }

    alert("Invalid RFID. Access Denied.");
    rfidInput.value = '';
}

rfidInput.addEventListener('keypress', (e) => { if (e.key === 'Enter') handleScan(); });
scanBtn.addEventListener('click', handleScan);

function startSessionTimer() {
    clearInterval(countdownInterval);
    clearTimeout(timeoutId);
    timeLeft = 60;
    
    timeoutBadge.style.display = 'block';
    timeoutBadge.className = 'timer-badge'; 
    timeoutBadge.innerText = `${timeLeft}s Remaining`;

    timeoutId = setTimeout(forceLogout, 60000);

    countdownInterval = setInterval(() => {
        timeLeft--;
        timeoutBadge.innerText = `${timeLeft}s Remaining`;
        if (timeLeft <= 10) timeoutBadge.classList.add('danger');
    }, 1000);
}

function forceLogout() {
    clearInterval(countdownInterval);
    alert("Session expired. You have been automatically logged out.");
    window.location.reload();
}

function getCurrentTimeStr() {
    return new Date().toLocaleTimeString('en-US');
}
function getCurrentDateStr() {
    return new Date().toLocaleDateString('en-US');
}

// Exactly matching your specific UI constraints for Trainers
function renderTrainerCard(trainer) {
    const sessionHTML = trainer.todaySession ? `
        <div class="nested-box blue-border">
            <strong>${trainer.todaySession.class}</strong> <span class="badge-sm badge-blue">#1</span><br>
            <span class="sub-text">🕒 ${trainer.todaySession.time}</span><br>
            <span class="sub-text">Client: ${trainer.todaySession.client}</span>
        </div>` : '<div class="nested-box blue-border">No sessions today</div>';

    userProfileCard.innerHTML = `
        <div class="profile-card">
            <div class="card-header trainer-bg">
                <div class="header-info">
                    <span style="font-size: 2rem;">🏋️‍♀️</span>
                    <div>
                        <h3 style="margin:0">${trainer.name}</h3>
                        <span style="font-size: 0.8rem; color: #64748b;">Trainer ID: ${trainer.id}</span>
                    </div>
                </div>
                <div class="status-badge">✓ Clocked In</div>
            </div>
            <div class="card-grid">
                <div class="grid-col">
                    <div class="info-box theme-purple">
                        <span class="label">Specialization</span>
                        <span class="value-lg">${trainer.specialization}</span>
                    </div>
                    <div class="info-box theme-green" style="background: #f0fdf4;">
                        <span class="label">Clock In Time</span>
                        <span class="value-lg">🕒 ${getCurrentTimeStr()}</span>
                        <div class="sub-text">${getCurrentDateStr()}</div>
                    </div>
                    <div class="info-box theme-blue">
                        <span class="label">Rate per Session</span>
                        <span class="value-lg">$${trainer.rate}</span>
                    </div>
                </div>
                <div class="grid-col">
                    <div class="info-box theme-yellow">
                        <span class="label" style="color: #333; font-weight: bold;">💓 Today's Sessions</span>
                        ${sessionHTML}
                    </div>
                    <div class="info-box theme-green">
                        <span style="font-weight: bold;">✅ On Duty</span>
                        <div class="sub-text" style="color: var(--green-600);">Ready for 1 session(s)</div>
                    </div>
                </div>
            </div>
            <div class="footer-text">! Scan again to log out</div>
        </div>
    `;
    rfidInput.value = '';
}

// Exactly matching your specific UI constraints for Members
function renderMemberCard(member) {
    const badgeType = member.plan === "Gold" ? "Premium" : "Standard";
    userProfileCard.innerHTML = `
        <div class="profile-card">
            <div class="card-header member-bg">
                <div class="header-info">
                    <span style="font-size: 2rem; color: var(--blue-600);">👤</span>
                    <div>
                        <h3 style="margin:0">${member.name}</h3>
                        <span style="font-size: 0.8rem; color: #64748b;">Member ID: ${member.id}</span>
                    </div>
                </div>
                <div class="status-badge">✓ Logged In</div>
            </div>
            <div class="card-grid">
                <div class="grid-col">
                    <div class="info-box theme-blue">
                        <div style="display:flex; justify-content: space-between; align-items: flex-start;">
                            <div>
                                <span class="label">Membership Type</span>
                                <span class="value-lg">${member.plan}</span>
                            </div>
                            <span class="badge-sm badge-gray">${badgeType}</span>
                        </div>
                    </div>
                    <div class="info-box theme-green" style="background: white;">
                        <span class="label">Membership Status</span>
                        <span class="value-lg">${member.status}</span>
                        <div class="sub-text">Expires: ${member.expiry}</div>
                    </div>
                    <div class="info-box theme-purple">
                        <span class="label">Current Weight</span>
                        <span class="value-lg">${member.weight}</span>
                        <div class="sub-text">BMI: ${member.bmi}</div>
                    </div>
                </div>
                <div class="grid-col">
                    <div class="info-box theme-yellow">
                        <span class="label" style="color: #333; font-weight: bold;">📅 Today's Sessions</span>
                        <div class="nested-box yellow-border">
                            <p style="color: #333; font-size: 0.9rem; margin-bottom: 0.5rem;">Personal training sessions available with</p>
                            <span class="badge-sm badge-yellow" style="padding: 0.4rem 1rem;">Gold Membership</span>
                        </div>
                    </div>
                    <div class="info-box theme-green">
                        <span style="font-weight: bold;">✅ Access Granted</span>
                        <div class="sub-text" style="color: var(--green-600);">Logged in at ${getCurrentTimeStr()}</div>
                    </div>
                </div>
            </div>
            <div class="footer-text">! Scan again to log out</div>
        </div>
    `;
    rfidInput.value = '';
}