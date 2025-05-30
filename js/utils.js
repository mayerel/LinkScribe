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
    const isDisabled = button.disabled;
    
    // Store original classes to restore later
    const originalClasses = button.className;
    
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
    button.className = originalClasses
        .replace(/bg-\w+-\d+/g, '') // Remove any background color classes
        .replace(/hover:bg-\w+-\d+/g, '') // Remove any hover background color classes
        .replace(/text-\w+-\d+/g, '') // Remove any text color classes
        .replace(/\s+/g, ' ') // Normalize spaces
        .trim() + ' bg-green-600 hover:bg-green-700 text-white transition-colors duration-200';
    
    // Re-enable the button if it was disabled
    button.disabled = false;
    
    // Revert back after duration
    const revert = () => {
        button.innerHTML = originalHtml;
        button.className = originalClasses;
        button.style.minWidth = '';
        button.disabled = isDisabled;
    };
    
    // If the button is removed from the DOM before the timeout, clean up immediately
    const observer = new MutationObserver((mutations, obs) => {
        if (!document.body.contains(button)) {
            revert();
            obs.disconnect();
        }
    });
    
    observer.observe(document.body, { childList: true, subtree: true });
    
    setTimeout(() => {
        revert();
        observer.disconnect();
    }, duration);
}

/**
 * Shows a toast notification to the user
 * @param {string} message - The message to display
 * @param {string} [type='info'] - The type of notification ('info', 'success', 'warning', 'error')
 * @param {number} [duration=3000] - Duration in milliseconds to show the notification
 */
export function showNotification(message, type = 'info', duration = 3000) {
    // Create notification container if it doesn't exist
    let container = document.getElementById('notification-container');
    if (!container) {
        container = document.createElement('div');
        container.id = 'notification-container';
        container.className = 'fixed top-4 right-4 z-50 space-y-2 w-80 max-w-full';
        document.body.appendChild(container);
    }
    
    // Create notification element
    const notification = document.createElement('div');
    const notificationId = 'notification-' + Date.now();
    notification.id = notificationId;
    
    // Set base classes
    const baseClasses = 'relative p-4 pr-10 rounded-lg shadow-lg transform transition-all duration-300 ease-in-out';
    const typeClasses = {
        info: 'bg-blue-100 text-blue-800 border-l-4 border-blue-500',
        success: 'bg-green-100 text-green-800 border-l-4 border-green-500',
        warning: 'bg-yellow-100 text-yellow-800 border-l-4 border-yellow-500',
        error: 'bg-red-100 text-red-800 border-l-4 border-red-500'
    };
    
    notification.className = `${baseClasses} ${typeClasses[type] || typeClasses.info} opacity-0 translate-y-2`;
    
    // Add message
    notification.innerHTML = `
        <div class="flex items-start">
            <div class="flex-shrink-0">
                ${getNotificationIcon(type)}
            </div>
            <div class="ml-3 flex-1">
                <p class="text-sm font-medium">${escapeHtml(message)}</p>
            </div>
            <button type="button" class="ml-4 flex-shrink-0 text-gray-400 hover:text-gray-500 focus:outline-none" data-dismiss="notification">
                <span class="sr-only">Close</span>
                <svg class="h-5 w-5" fill="currentColor" viewBox="0 0 20 20">
                    <path fill-rule="evenodd" d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z" clip-rule="evenodd" />
                </svg>
            </button>
        </div>
    `;
    
    // Add to container
    container.appendChild(notification);
    
    // Trigger reflow to enable animation
    void notification.offsetWidth;
    
    // Animate in
    notification.classList.remove('opacity-0', 'translate-y-2');
    notification.classList.add('opacity-100', 'translate-y-0');
    
    // Set up close handler
    const closeButton = notification.querySelector('[data-dismiss="notification"]');
    if (closeButton) {
        closeButton.addEventListener('click', () => {
            removeNotification(notification);
        });
    }
    
    // Auto-remove after duration if specified
    if (duration > 0) {
        const timeoutId = setTimeout(() => {
            removeNotification(notification);
        }, duration);
        
        // Store timeout ID for potential cleanup
        notification.dataset.timeoutId = timeoutId;
    }
    
    return notification;
}

/**
 * Removes a notification with animation
 * @param {HTMLElement} notification - The notification element to remove
 */
function removeNotification(notification) {
    if (!notification || !notification.parentNode) return;
    
    // Clear any pending timeout
    if (notification.dataset.timeoutId) {
        clearTimeout(parseInt(notification.dataset.timeoutId, 10));
    }
    
    // Animate out
    notification.classList.remove('opacity-100', 'translate-y-0');
    notification.classList.add('opacity-0', 'translate-y-2');
    
    // Remove from DOM after animation
    setTimeout(() => {
        if (notification.parentNode) {
            notification.parentNode.removeChild(notification);
        }
    }, 300);
}

/**
 * Gets the appropriate icon for a notification type
 * @param {string} type - The notification type
 * @returns {string} - SVG icon HTML
 */
function getNotificationIcon(type) {
    const icons = {
        info: `
            <svg class="h-6 w-6 text-blue-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
        `,
        success: `
            <svg class="h-6 w-6 text-green-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5 13l4 4L19 7" />
            </svg>
        `,
        warning: `
            <svg class="h-6 w-6 text-yellow-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
            </svg>
        `,
        error: `
            <svg class="h-6 w-6 text-red-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12" />
            </svg>
        `
    };
    
    return icons[type] || icons.info;
}

/**
 * Escapes HTML special characters to prevent XSS
 * @param {string} html - The string to escape
 * @returns {string} - The escaped string
 */
export function escapeHtml(html) {
    const div = document.createElement('div');
    div.textContent = html;
    return div.innerHTML;
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
