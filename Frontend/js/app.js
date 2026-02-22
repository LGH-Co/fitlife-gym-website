// ============================================================
// FitLife Gym — App Entry Point
// Authentication via login.php → admin_account table
// Roles: super_admin | staff
// ============================================================

document.addEventListener('DOMContentLoaded', () => {
  initKiosk();
  bindLoginForm();
  bindModalClose();
});

// ── Login ──
// Sends credentials to login.php which checks admin_account table.
// On success, PHP returns { success, id, name, role }.
function bindLoginForm() {
  const form = document.getElementById('admin-login-form');
  if (!form) return;

  form.addEventListener('submit', async (e) => {
    e.preventDefault();
    const username = document.getElementById('login-username').value.trim();
    const password = document.getElementById('login-password').value.trim();
    const errEl    = document.getElementById('login-error');
    const btn      = form.querySelector('button[type="submit"]');

    if (!username || !password) {
      errEl.textContent = 'Please enter your username and password.';
      errEl.style.display = 'block';
      return;
    }

    btn.disabled = true;
    btn.textContent = 'Logging in…';

    try {
      // ── TODO: replace with real PHP endpoint ──
      // const res = await fetch('/api/login.php', {
      //   method: 'POST',
      //   headers: { 'Content-Type': 'application/json' },
      //   body: JSON.stringify({ username, password })
      // });
      // const data = await res.json();

      // ── Placeholder: remove when backend is ready ──
      const data = { success: false, message: 'Backend not connected yet.' };

      if (data.success) {
        currentAdmin = { id: data.id, name: data.name, role: data.role };
        errEl.style.display = 'none';
        document.getElementById('login-screen').classList.add('hidden');
        document.getElementById('admin-portal').classList.remove('hidden');
        initAdmin();
        startSessionTimer(adminLogout);
        showToast(`Welcome, ${currentAdmin.name}!`);
      } else {
        errEl.textContent   = data.message || 'Incorrect username or password.';
        errEl.style.display = 'block';
        showToast('Login failed.', 'error');
      }
    } catch (err) {
      errEl.textContent   = 'Unable to connect to server. Please try again.';
      errEl.style.display = 'block';
    } finally {
      btn.disabled = false;
      btn.textContent = 'Login as Admin';
    }
  });
}

// ── Modal close on backdrop click ──
function bindModalClose() {
  const overlay = document.getElementById('modal-overlay');
  if (overlay) {
    overlay.addEventListener('click', e => {
      if (e.target === overlay) closeModal();
    });
  }
}

// ── Screen navigation ──
function showKiosk() {
  document.getElementById('login-screen').classList.add('hidden');
  document.getElementById('admin-portal').classList.add('hidden');
  document.getElementById('kiosk-screen').classList.remove('hidden');
  setTimeout(() => {
    const inp = document.getElementById('rfid-input');
    if (inp) inp.focus();
  }, 100);
  startSessionTimer(() => {
    document.getElementById('kiosk-screen').classList.add('hidden');
    document.getElementById('login-screen').classList.remove('hidden');
    document.getElementById('kiosk-result').innerHTML = '';
  });
}

function showLogin() {
  clearSessionTimer();
  document.getElementById('kiosk-screen').classList.add('hidden');
  document.getElementById('admin-portal').classList.add('hidden');
  document.getElementById('login-screen').classList.remove('hidden');
  document.getElementById('kiosk-result').innerHTML = '';
  currentAdmin = null;
}
