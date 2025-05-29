/**
 * Utilities Module
 * Contains helper functions used across the application
 */

/**
 * Shows a toast notification to the user
 * @param {string} message - The message to display
 * @param {number} duration - Duration in milliseconds (default: 3000ms)
 */
/**
 * Shows a success feedback on a button
 * @param {HTMLElement} button - The button element to show feedback on
 * @param {string} [customText] - Optional custom success text to display
 * @param {number} [duration=2000] - Duration in milliseconds to show the feedback
 */
export function showSuccessFeedback(button, customText = '', duration = 2000) {
    if (!button) return;
    
    const originalHtml = button.innerHTML;
    const originalText = button.textContent.trim();
    const originalWidth = button.offsetWidth;
    
    // Set a minimum width to prevent button from resizing
    button.style.minWidth = `${originalWidth}px`;
    
    // Update button content with checkmark and optional custom text or 'Copied!'
    button.innerHTML = `
        <svg class="h-5 w-5 mr-1.5 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5 13l4 4L19 7" />
        </svg>
        ${customText || 'Copied!'}
    `;
    
    // Change button style to success
    button.classList.remove('bg-indigo-600', 'hover:bg-indigo-700');
    button.classList.add('bg-green-600', 'hover:bg-green-700', 'transition-colors', 'duration-200');
    
    // Revert back after duration
    setTimeout(() => {
        button.innerHTML = originalHtml;
        button.classList.remove('bg-green-600', 'hover:bg-green-700');
        button.classList.add('bg-indigo-600', 'hover:bg-indigo-700');
        button.style.minWidth = '';
    }, duration);
}

/**
 * Shows a toast notification to the user
 * @param {string} message - The message to display
 * @param {number} duration - Duration in milliseconds (default: 3000ms)
 */
export function showNotification(message, duration = 3000) {
    // Create notification element if it doesn't exist
    let notification = document.querySelector('.toast-notification');
    
    if (!notification) {
        notification = document.createElement('div');
        notification.className = 'toast-notification';
        document.body.appendChild(notification);
    }
    
    // Set notification message and show
    notification.textContent = message;
    notification.style.opacity = 0;
    notification.classList.add('fade-in');
    
    // Animate in
    setTimeout(() => {
        notification.style.opacity = 1;
    }, 10);
    
    // Hide after duration
    setTimeout(() => {
        notification.classList.remove('fade-in');
        notification.classList.add('fade-out');
        
        // Remove after animation completes
        setTimeout(() => {
            notification.style.opacity = 0;
            notification.classList.remove('fade-out');
        }, 300);
    }, duration);
}

/**
 * Truncates text to a specified length, preserving whole words
 * @param {string} text - The text to truncate
 * @param {number} maxLength - Maximum length
 * @returns {string} - Truncated text
 */
export function truncateText(text, maxLength) {
    if (!text || text.length <= maxLength) {
        return text;
    }
    
    // Find the last space within the maxLength
    const lastSpace = text.lastIndexOf(' ', maxLength);
    if (lastSpace === -1) {
        return text.substring(0, maxLength) + '...';
    }
    
    return text.substring(0, lastSpace) + '...';
}

/**
 * Creates a debounced function that delays invoking the provided function
 * @param {Function} func - The function to debounce
 * @param {number} wait - The delay in milliseconds
 * @returns {Function} - The debounced function
 */
export function debounce(func, wait) {
    let timeout;
    
    return function executedFunction(...args) {
        const later = () => {
            timeout = null;
            func(...args);
        };
        
        clearTimeout(timeout);
        timeout = setTimeout(later, wait);
    };
}

/**
 * Formats a URL to ensure it has a protocol
 * @param {string} url - The URL to format
 * @returns {string} - Formatted URL
 */
export function formatUrl(url) {
    url = url.trim();
    
    // Add https:// if no protocol is specified
    if (!url.startsWith('http://') && !url.startsWith('https://')) {
        url = 'https://' + url;
    }
    
    return url;
}

/**
 * Extracts the domain name from a URL
 * @param {string} url - The URL
 * @returns {string} - Domain name
 */
export function extractDomain(url) {
    try {
        const urlObj = new URL(url);
        return urlObj.hostname;
    } catch (e) {
        // If URL parsing fails, try a simple regex
        const match = url.match(/^(?:https?:\/\/)?(?:[^@\n]+@)?(?:www\.)?([^:\/\n]+)/im);
        return match ? match[1] : '';
    }
}

/**
 * Detects if a string is too similar to another
 * @param {string} str1 - First string
 * @param {string} str2 - Second string
 * @returns {boolean} - True if strings are too similar
 */
export function isTooSimilar(str1, str2) {
    // Simple implementation using Levenshtein distance
    const distance = levenshteinDistance(str1, str2);
    const maxLength = Math.max(str1.length, str2.length);
    
    // If more than 80% similar, consider too similar
    return (maxLength - distance) / maxLength > 0.8;
}

/**
 * Calculates Levenshtein distance between two strings
 * @param {string} a - First string
 * @param {string} b - Second string
 * @returns {number} - The Levenshtein distance
 */
function levenshteinDistance(a, b) {
    if (a.length === 0) return b.length;
    if (b.length === 0) return a.length;
    
    const matrix = [];
    
    // Initialize matrix
    for (let i = 0; i <= b.length; i++) {
        matrix[i] = [i];
    }
    
    for (let j = 0; j <= a.length; j++) {
        matrix[0][j] = j;
    }
    
    // Calculate distances
    for (let i = 1; i <= b.length; i++) {
        for (let j = 1; j <= a.length; j++) {
            if (b.charAt(i - 1) === a.charAt(j - 1)) {
                matrix[i][j] = matrix[i - 1][j - 1];
            } else {
                matrix[i][j] = Math.min(
                    matrix[i - 1][j - 1] + 1, // substitution
                    matrix[i][j - 1] + 1,     // insertion
                    matrix[i - 1][j] + 1      // deletion
                );
            }
        }
    }
    
    return matrix[b.length][a.length];
}
