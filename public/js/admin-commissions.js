// Edit rate
function editRate(button) {
    alert('Edit commission rate for this area');
}

// Delete area
function deleteArea() {
    if (confirm('Are you sure you want to delete this area?')) {
        alert('Area deleted');
    }
}

// Add new area
function addNewArea() {
    alert('Add new area - Enter area name and commission rate');
}

// Approve refund
function approveRefund() {
    if (confirm('Approve this refund?')) {
        alert('Refund approved and processed');
    }
}

// Reject refund
function rejectRefund() {
    if (confirm('Reject this refund?')) {
        alert('Refund rejected');
    }
}

// View details
function viewDetails() {
    alert('Viewing detailed refund information and proof');
}

document.getElementById('commissions-logout')?.addEventListener('click', function (e) {
    e.preventDefault();
    fetch((window.API_BASE || '') + '/api/auth/logout/', { method: 'POST', credentials: 'include' })
        .then(function () { window.location.href = '/login.html'; })
        .catch(function () { window.location.href = '/login.html'; });
});

console.log('Admin commission management loaded');
