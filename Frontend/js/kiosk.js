import { members, trainers } from './data.js';

const rfidInput = document.getElementById('rfidInput');
const scanBtn = document.getElementById('scanBtn');
const display = document.getElementById('userProfileCard');
const timerBadge = document.getElementById('timeoutBadge');

let timeLeft = 60;
let countdown;

function startTimer() {
    clearInterval(countdown);
    timeLeft = 60;
    timerBadge.style.display = 'block';
    countdown = setInterval(() => {
        timeLeft--;
        timerBadge.innerText = `${timeLeft}s Remaining`;
        if (timeLeft <= 10) timerBadge.classList.add('danger');
        if (timeLeft <= 0) location.reload();
    }, 1000);
}

scanBtn.onclick = () => {
    const val = rfidInput.value.trim().toUpperCase();
    const m = members.find(u => u.id === val || u.name.toUpperCase() === val);
    const t = trainers.find(u => u.id === val || u.name.toUpperCase() === val);

    if (m) renderMember(m);
    else if (t) renderTrainer(t);
    else alert("Access Denied");
    startTimer();
    rfidInput.value = '';
};

function renderMember(m) {
    display.innerHTML = `
        <div class="profile-card">
            <div class="card-header member-bg">
                <div><strong>${m.name}</strong><br><small>Member ID: ${m.id}</small></div>
                <div class="status-badge">✓ Logged In</div>
            </div>
            <div class="card-grid">
                <div class="grid-col">
                    <div class="info-box theme-blue">
                        <small>Membership Type</small>
                        <div class="value-lg">${m.plan}</div>
                        <span class="badge-premium">Premium</span>
                    </div>
                    <div class="info-box theme-green">
                        <small>Membership Status</small>
                        <div class="value-lg green-txt">${m.status.toUpperCase()}</div>
                        <small>Expires: ${m.expiry}</small>
                    </div>
                    <div class="info-box">
                        <small>Current Weight</small>
                        <div class="value-lg">${m.weight}</div>
                        <small>BMI: ${m.bmi}</small>
                    </div>
                </div>
                <div class="grid-col">
                    <div class="info-box theme-yellow">
                        <strong>📅 Today's Sessions</strong>
                        ${m.sessions.map(s => `
                            <div class="nested-box yellow-border">
                                <strong>${s.name}</strong> <span class="badge-sm badge-green">Scheduled</span><br>
                                <small>🕒 ${s.time}</small>
                            </div>
                        `).join('')}
                    </div>
                    <div class="info-box theme-green">
                        <strong>✅ Access Granted</strong><br>
                        <small>Logged in at ${new Date().toLocaleTimeString()}</small>
                    </div>
                </div>
            </div>
        </div>`;
}

function renderTrainer(t) {
    display.innerHTML = `
        <div class="profile-card">
            <div class="card-header trainer-bg">
                <div><strong>${t.name}</strong><br><small>Trainer ID: ${t.id}</small></div>
                <div class="status-badge">✓ Clocked In</div>
            </div>
            <div class="card-grid">
                <div class="grid-col">
                    <div class="info-box theme-purple">
                        <small>Specialization</small>
                        <div class="value-lg purple-txt">${t.specialization}</div>
                    </div>
                    <div class="info-box theme-green">
                        <small>Clock In Time</small>
                        <div class="value-lg green-txt">🕒 ${new Date().toLocaleTimeString()}</div>
                    </div>
                    <div class="info-box theme-blue">
                        <small>Rate per Session</small>
                        <div class="value-lg blue-txt">$${t.rate}</div>
                    </div>
                </div>
                <div class="grid-col">
                    <div class="info-box theme-yellow">
                        <strong>💓 Today's Sessions</strong>
                        <div class="nested-box blue-border">
                            <strong>${t.todaySession ? t.todaySession.class : 'No Session'}</strong><br>
                            <small>🕒 ${t.todaySession ? t.todaySession.time : '--'}</small><br>
                            <small>Client: ${t.todaySession ? t.todaySession.client : '--'}</small>
                        </div>
                    </div>
                    <div class="info-box theme-green">
                        <strong>✅ On Duty</strong><br>
                        <small>Ready for sessions</small>
                    </div>
                </div>
            </div>
        </div>`;
}