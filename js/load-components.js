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

// Load footer component
const loadFooter = () => {
    const footerPlaceholder = document.querySelector('footer[data-component="footer"]');
    if (footerPlaceholder) {
        fetch('./components/footer.html')
            .then(response => {
                if (!response.ok) {
                    throw new Error(`HTTP error! status: ${response.status}`);
                }
                return response.text();
            })
            .then(html => {
                footerPlaceholder.insertAdjacentHTML('afterbegin', html);
                updateActiveLink();
            })
            .catch(error => console.error('Error loading footer:', error));
    }
};

// Initialize when DOM is fully loaded
if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', loadFooter);
} else {
    loadFooter();
}

export { updateActiveLink };
