// Price range slider
const priceFilter = document.getElementById('priceFilter');
if (priceFilter) {
    priceFilter.addEventListener('input', function() {
        document.getElementById('priceValue').textContent = `$10 - $${this.value}/hour`;
    });
}

function applyFilters() {
    const subject = document.getElementById('subjectFilter').value;
    const price = document.getElementById('priceFilter').value;
    const location = document.getElementById('locationFilter').value;
    const rating = document.getElementById('ratingFilter').value;
    
    console.log('Filters applied:', { subject, price, location, rating });
    alert('Filters applied! Results updated.');
}

function viewProfile() {
    alert('Opening detailed tutor profile with reviews and schedule...');
}

function sendRequest() {
    alert('Match request sent! You will be notified once the tutor responds.');
}

console.log('Tutor search page loaded');
