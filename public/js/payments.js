// Switch tabs
function switchTab(tabName) {
    // Hide all tabs
    document.querySelectorAll('.tab-content').forEach(tab => {
        tab.classList.remove('active');
    });
    
    // Remove active class from buttons
    document.querySelectorAll('.tab-btn').forEach(btn => {
        btn.classList.remove('active');
    });
    
    // Show selected tab
    document.getElementById(tabName).classList.add('active');
    
    // Add active class to clicked button
    event.target.classList.add('active');
}

// Withdraw funds
function withdrawFunds() {
    alert('Withdraw funds page - Connect your bank account or payment method');
}

// View commission details
function viewCommission() {
    alert('Viewing detailed commission breakdown for your area');
}

// Add payment method
function addPaymentMethod() {
    alert('Add payment method - Bank transfer, PayPal, etc.');
}

console.log('Payments page loaded');
