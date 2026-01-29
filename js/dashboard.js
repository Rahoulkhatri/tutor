// Load user data from localStorage
function loadUserData() {
    const userName = localStorage.getItem('userName') || 'John Doe';
    const userRole = localStorage.getItem('userRole') || 'student';
    
    console.log('User:', userName, 'Role:', userRole);
}

// Apply filters (placeholder)
function applyFilters() {
    alert('Filters applied! This would filter tutors based on your selections.');
}

// View profile
function viewProfile() {
    alert('Opening tutor profile...');
}

// Send request
function sendRequest() {
    alert('Request sent! The tutor will review and respond shortly.');
}

// Initialize dashboard
document.addEventListener('DOMContentLoaded', () => {
    loadUserData();
});

console.log('Student dashboard loaded');
