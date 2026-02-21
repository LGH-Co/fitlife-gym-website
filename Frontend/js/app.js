// ============================================================
// App Entry Point & Router
// ============================================================

document.addEventListener('DOMContentLoaded', () => {
  initKiosk();
  bindLoginForm();
  bindModalClose();
});

function bindLoginForm() {
  const form = document.getElementById('admin-login-form');
  if (form) {
    form.addEventListener('submit', (e) => {
      e.preventDefault();
      const username = document.getElementById('login-username').value.trim();
      const password = document.getElementById('login-password').value.trim();
      if (username === ADMIN_CREDENTIALS.username && password === ADMIN_CREDENTIALS.password) {
        document.getElementById('login-screen').classList.add('hidden');
        document.getElementById('admin-portal').classList.remove('hidden');
        initAdmin();
        startSessionTimer(adminLogout);
        showToast('Welcome, Administrator!');
      } else {
        showToast('Invalid credentials.', 'error');
        document.getElementById('login-error').textContent = 'Incorrect username or password.';
        document.getElementById('login-error').style.display = 'block';
      }
    });
  }
}

function bindModalClose() {
  const overlay = document.getElementById('modal-overlay');
  if (overlay) {
    overlay.addEventListener('click', (e) => {
      if (e.target === overlay) closeModal();
    });
  }
}

function goToKiosk() {
  // Login page button - not needed since kiosk is on the same page
  // but we show/hide logic is in index.html
}
