function formatTime(date) {
  return date.toLocaleTimeString('en-US', {
    hour: 'numeric', minute: '2-digit', second: '2-digit', hour12: true
  });
}

function formatDate(date) {
  return date.toLocaleDateString('en-US', {
    month: 'numeric', day: 'numeric', year: 'numeric'
  });
}

function formatDateTime(date) {
  return `${formatDate(date)} ${formatTime(date)}`;
}

function isMembershipExpired(expiryStr) {
  return new Date(expiryStr) < new Date();
}

function showModal(html) {
  document.getElementById('modal-content').innerHTML = html;
  document.getElementById('modal-overlay').classList.remove('hidden');
}

function closeModal() {
  document.getElementById('modal-overlay').classList.add('hidden');
}

function showToast(message, type = 'success') {
  const toast = document.createElement('div');
  toast.className = `toast toast-${type}`;
  toast.textContent = message;
  document.body.appendChild(toast);
  setTimeout(() => toast.classList.add('show'), 10);
  setTimeout(() => {
    toast.classList.remove('show');
    setTimeout(() => toast.remove(), 300);
  }, 3000);
}

let sessionTimerInterval = null;
let sessionSecondsLeft   = 60;

function startSessionTimer(onExpire) {
  clearSessionTimer();
  sessionSecondsLeft = 60;
  updateTimerBadge();
  sessionTimerInterval = setInterval(() => {
    sessionSecondsLeft--;
    updateTimerBadge();
    if (sessionSecondsLeft <= 0) {
      clearSessionTimer();
      alert('Session expired. You will be redirected to the login screen.');
      onExpire();
    }
  }, 1000);
}

function resetSessionTimer(onExpire) {
  clearSessionTimer();
  startSessionTimer(onExpire);
}

function clearSessionTimer() {
  if (sessionTimerInterval) clearInterval(sessionTimerInterval);
  sessionTimerInterval = null;
  const badge = document.getElementById('session-timer-badge');
  if (badge) badge.style.display = 'none';
}

function updateTimerBadge() {
  const badge = document.getElementById('session-timer-badge');
  if (!badge) return;
  badge.style.display = 'flex';
  badge.textContent   = `${sessionSecondsLeft}s`;
  if (sessionSecondsLeft <= 10) {
    badge.classList.add('timer-red');
    badge.classList.remove('timer-gray');
  } else {
    badge.classList.add('timer-gray');
    badge.classList.remove('timer-red');
  }
}