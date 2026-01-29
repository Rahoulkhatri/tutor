// Role selector for login (Student / Teacher / Admin)
document.querySelectorAll('.login-role-btn').forEach(btn => {
    btn.addEventListener('click', function() {
        document.querySelectorAll('.login-role-btn').forEach(b => {
            b.classList.remove('active');
            b.style.background = '#e2e8f0';
            b.style.color = '#475569';
        });
        this.classList.add('active');
        this.style.background = '#5b5bff';
        this.style.color = 'white';
    });
});

// Role selector for signup
const roleButtons = document.querySelectorAll('.role-btn');
roleButtons.forEach(btn => {
    btn.addEventListener('click', () => {
        roleButtons.forEach(b => b.classList.remove('active'));
        btn.classList.add('active');
        const role = btn.dataset.role;
        if (role === 'student') {
            document.getElementById('studentFields').style.display = 'block';
            document.getElementById('teacherFields').style.display = 'none';
        } else {
            document.getElementById('studentFields').style.display = 'none';
            document.getElementById('teacherFields').style.display = 'block';
        }
    });
});

// Show error message on login/signup form
function showAuthError(formEl, message) {
    let errEl = formEl.querySelector('.auth-error');
    if (!errEl) {
        errEl = document.createElement('p');
        errEl.className = 'auth-error';
        errEl.style.cssText = 'color: #b91c1c; font-size: 0.875rem; margin-bottom: 1rem;';
        formEl.insertBefore(errEl, formEl.firstChild);
    }
    errEl.textContent = message;
    errEl.style.display = 'block';
}

function clearAuthError(formEl) {
    const errEl = formEl?.querySelector('.auth-error');
    if (errEl) errEl.style.display = 'none';
}

// Login: call API and redirect by role
document.getElementById('loginForm')?.addEventListener('submit', async (e) => {
    e.preventDefault();
    const form = e.target;
    const email = document.getElementById('email').value.trim();
    const password = document.getElementById('password').value;
    const role = document.querySelector('.login-role-btn.active')?.dataset.role || 'student';

    clearAuthError(form);
    const submitBtn = form.querySelector('button[type="submit"]');
    if (submitBtn) {
        submitBtn.disabled = true;
        submitBtn.textContent = 'Signing in...';
    }

    try {
        const res = await fetch('/api/auth/login', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ email, password, role }),
        });
        const data = await res.json().catch(() => ({}));

        if (!res.ok) {
            showAuthError(form, data.error || 'Login failed. Try again.');
            if (submitBtn) {
                submitBtn.disabled = false;
                submitBtn.textContent = 'Sign In';
            }
            return;
        }

        if (data.redirectUrl) {
            window.location.href = data.redirectUrl;
        } else {
            if (role === 'admin') window.location.href = '/';
            else if (role === 'teacher') window.location.href = '/teacher-dashboard.html';
            else window.location.href = '/student-dashboard.html';
        }
    } catch (err) {
        showAuthError(form, 'Network error. Please try again.');
        if (submitBtn) {
            submitBtn.disabled = false;
            submitBtn.textContent = 'Sign In';
        }
    }
});

// Signup: call API and redirect
document.getElementById('signupForm')?.addEventListener('submit', async (e) => {
    e.preventDefault();
    const form = e.target;
    const fullname = document.getElementById('fullname').value.trim();
    const email = document.getElementById('email').value.trim();
    const password = document.getElementById('password').value;
    const role = document.querySelector('.role-btn.active')?.dataset.role || 'student';

    clearAuthError(form);
    const submitBtn = form.querySelector('button[type="submit"]');
    if (submitBtn) {
        submitBtn.disabled = true;
        submitBtn.textContent = 'Creating account...';
    }

    try {
        const res = await fetch('/api/auth/signup', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ email, password, name: fullname, role }),
        });
        const data = await res.json().catch(() => ({}));

        if (!res.ok) {
            showAuthError(form, data.error || 'Signup failed. Try again.');
            if (submitBtn) {
                submitBtn.disabled = false;
                submitBtn.textContent = 'Sign Up';
            }
            return;
        }

        if (data.redirectUrl) {
            window.location.href = data.redirectUrl;
        } else {
            if (role === 'teacher') window.location.href = '/teacher-dashboard.html';
            else window.location.href = '/student-dashboard.html';
        }
    } catch (err) {
        showAuthError(form, 'Network error. Please try again.');
        if (submitBtn) {
            submitBtn.disabled = false;
            submitBtn.textContent = 'Sign Up';
        }
    }
});

console.log('Authentication system initialized');
