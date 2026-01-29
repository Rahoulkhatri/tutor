// Navigation smooth scroll
document.querySelectorAll('a[href^="#"]').forEach(anchor => {
    anchor.addEventListener('click', function (e) {
        e.preventDefault();
        const target = document.querySelector(this.getAttribute('href'));
        if (target) {
            target.scrollIntoView({
                behavior: 'smooth'
            });
        }
    });
});

// Update price range
const priceFilter = document.getElementById('priceFilter');
if (priceFilter) {
    priceFilter.addEventListener('input', function() {
        document.getElementById('priceValue').textContent = `$10 - $${this.value}/hour`;
    });
}

console.log('TutorConnect landing page loaded successfully');
