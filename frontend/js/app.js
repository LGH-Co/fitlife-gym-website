document.addEventListener('DOMContentLoaded', () => {
  initKiosk();
  bindLoginForm();
  bindModalClose();
});

// frontend/js/app.js (Replace the existing bindLoginForm function)

function bindLoginForm() {
  const form = document.getElementById('admin-login-form');
  if (!form) return;
  
  form.addEventListener('submit', async (e) => {
    e.preventDefault();
    const username = document.getElementById('login-username').value.trim();
    const password = document.getElementById('login-password').value.trim();
    const errEl    = document.getElementById('login-error');
    const submitBtn = form.querySelector('button[type="submit"]');

    // UI Feedback while querying the database
    submitBtn.textContent = 'Authenticating...';
    submitBtn.disabled = true;

    try {
        // Send the payload to your new PHP endpoint
        const response = await fetch('http://localhost/fitlife-gym/backend/api/login.php', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ username, password })
        });

        const result = await response.json();

        if (result.status === 'success') {
            errEl.style.display = 'none';
            document.getElementById('login-screen').classList.add('hidden');
            document.getElementById('admin-portal').classList.remove('hidden');
            
            // Dynamically show their role from the database!
            showToast(`Welcome, ${result.data.username} (${result.data.role})!`);
            
            initAdmin();
        } else {
            errEl.textContent   = result.message || 'Incorrect username or password.';
            errEl.style.display = 'block';
            showToast('Invalid credentials.', 'error');
        }
    } catch (error) {
        errEl.textContent = 'Server connection failed. Is XAMPP running?';
        errEl.style.display = 'block';
        console.error("Login Error:", error);
    } finally {
        submitBtn.textContent = 'Login as Admin';
        submitBtn.disabled = false;
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