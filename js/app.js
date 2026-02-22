document.addEventListener('DOMContentLoaded', () => {
  initKiosk();
  bindLoginForm();
  bindModalClose();
});

function bindLoginForm() {
  const form = document.getElementById('admin-login-form');
  if (!form) return;
  form.addEventListener('submit', e => {
    e.preventDefault();
    const username = document.getElementById('login-username').value.trim();
    const password = document.getElementById('login-password').value.trim();
    const errEl    = document.getElementById('login-error');

    if (username === ADMIN_CREDENTIALS.username &&
        password === ADMIN_CREDENTIALS.password) {
      errEl.style.display = 'none';
      document.getElementById('login-screen').classList.add('hidden');
      document.getElementById('admin-portal').classList.remove('hidden');
      initAdmin();
      startSessionTimer(adminLogout);
      showToast('Welcome, Administrator!');
    } else {
      errEl.textContent   = 'Incorrect username or password.';
      errEl.style.display = 'block';
      showToast('Invalid credentials.', 'error');
    }
  });
}

function bindModalClose() {
  const overlay = document.getElementById('modal-overlay');
  if (overlay) {
    overlay.addEventListener('click', e => {
      if (e.target === overlay) closeModal();
    });
  }
}