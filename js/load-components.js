// Load footer component
document.addEventListener('DOMContentLoaded', function() {
    // Load footer
    const footerPlaceholder = document.querySelector('footer[data-component="footer"]');
    if (footerPlaceholder) {
        fetch('../components/footer.html')
            .then(response => response.text())
            .then(html => {
                footerPlaceholder.outerHTML = html;
                // Update active link based on current page
                updateActiveLink();
            })
            .catch(error => console.error('Error loading footer:', error));
    }
});

// Update active link in footer
function updateActiveLink() {
    const currentPage = window.location.pathname.split('/').pop() || 'index.html';
    const links = document.querySelectorAll('footer a[href]');
    
    links.forEach(link => {
        const linkHref = link.getAttribute('href');
        if (linkHref === currentPage || 
            (currentPage === '' && linkHref === 'index.html') ||
            (currentPage === 'landing.html' && linkHref === 'index.html')) {
            link.classList.add('font-medium', 'text-indigo-600');
            link.classList.remove('text-gray-500');
        } else {
            link.classList.remove('font-medium', 'text-indigo-600');
            if (!link.classList.contains('text-indigo-600')) {
                link.classList.add('text-gray-500');
            }
        }
    });
}
