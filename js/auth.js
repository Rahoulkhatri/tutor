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

// Form submission
document.getElementById('loginForm')?.addEventListener('submit', (e) => {
    e.preventDefault();
    const email = document.getElementById('email').value;
    const password = document.getElementById('password').value;
    
    // Store in localStorage for demo
    localStorage.setItem('userEmail', email);
    localStorage.setItem('userRole', 'student');
    
    // Redirect to dashboard
    window.location.href = 'student-dashboard.html';
});

document.getElementById('signupForm')?.addEventListener('submit', (e) => {
    e.preventDefault();
    const fullname = document.getElementById('fullname').value;
    const email = document.getElementById('email').value;
    const role = document.querySelector('.role-btn.active').dataset.role;
    
    // Store in localStorage for demo
    localStorage.setItem('userName', fullname);
    localStorage.setItem('userEmail', email);
    localStorage.setItem('userRole', role);
    
    // Redirect to appropriate dashboard
    if (role === 'student') {
        window.location.href = 'student-dashboard.html';
    } else {
        window.location.href = 'teacher-dashboard.html';
    }
});

console.log('Authentication system initialized');
