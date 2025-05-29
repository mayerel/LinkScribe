// Panel Functionality
document.addEventListener('DOMContentLoaded', function() {
    // Get references to elements that might not exist
    const inputPanel = document.getElementById('input-panel');
    const resultsPanel = document.getElementById('results-panel');
    const backToInputBtn = document.getElementById('back-to-input');
    const regeneratePostBtn = document.getElementById('regenerate-post');
    const generateBtn = document.getElementById('generate-btn');
    const generatedPostTextarea = document.getElementById('generated-post');
    const hashtagsContainer = document.getElementById('hashtags-container');
    const urlInput = document.getElementById('url-input');
    const toneOptions = document.querySelectorAll('.tone-option');
    const loadingSpinner = document.getElementById('loading-spinner');
    
    // If results panel doesn't exist, there's nothing to do here
    if (!resultsPanel) return;
    
    // Check if we're on mobile
    let isMobile = window.innerWidth < 768;
    let isPanelOpen = false;
    const ANIMATION_DURATION = 300; // Match this with CSS transition duration

    // Handle window resize
    function handleResize() {
        const wasMobile = isMobile;
        isMobile = window.innerWidth < 768;
        
        // If switching between mobile and desktop
        if (wasMobile !== isMobile) {
            // Force reflow and update display
            document.body.classList.toggle('mobile-view', isMobile);
            document.body.classList.toggle('desktop-view', !isMobile);
            
            // Reset animations
            if (isMobile) {
                slidingContainer.style.transition = 'none';
                slidingContainer.offsetHeight; // Force reflow
                slidingContainer.style.transition = '';
            }
        }
    }


    // Show results panel with overlay
    function showResultsPanel() {
        if (isPanelOpen) return;
        
        isPanelOpen = true;
        document.body.style.overflow = 'hidden';
        resultsPanel.classList.add('active');
        
        // Focus the generated post textarea for better UX
        if (generatedPostTextarea) {
            // Small delay to ensure the panel is visible before focusing
            setTimeout(() => {
                try {
                    generatedPostTextarea.focus();
                } catch (e) {
                    console.error('Error focusing textarea:', e);
                }
            }, 50);
        }
    }

    // Hide results panel
    function hideResultsPanel() {
        if (!isPanelOpen) return;
        
        isPanelOpen = false;
        document.body.style.overflow = '';
        resultsPanel.classList.remove('active');
    }
    
        // Handle escape key to close panel
    function handleKeyDown(e) {
        if (e.key === 'Escape' && isPanelOpen) {
            hideResultsPanel();
        }
    }

    // Event handler references for cleanup
    let backToInputHandler = null;
    let regeneratePostHandler = null;
    let resizeHandler = null;
    
    // Cleanup function to remove event listeners
    function cleanup() {
        if (backToInputBtn && backToInputHandler) {
            backToInputBtn.removeEventListener('click', backToInputHandler);
        }
        if (regeneratePostBtn && regeneratePostHandler) {
            regeneratePostBtn.removeEventListener('click', regeneratePostHandler);
        }
        if (resizeHandler) {
            window.removeEventListener('resize', resizeHandler);
        }
        // Remove any pending transition end listeners
        slidingContainer.removeEventListener('transitionend', handleTransitionEnd);
    }
    
    // Initialize
    function init() {
        // Create stable references to event handlers
        backToInputHandler = function(e) {
            e.preventDefault();
            e.stopPropagation();
            hideResultsPanel();
        };
        
        regeneratePostHandler = function(e) {
            e.preventDefault();
            e.stopPropagation();
            
            // Show loading state
            if (loadingSpinner) loadingSpinner.classList.remove('hidden');
            
            const icon = regeneratePostBtn?.querySelector('svg');
            if (icon) icon.classList.add('animate-spin');
            
            // Trigger the generate button click to regenerate the post
            if (generateBtn) {
                generateBtn.click();
            }
        };
        
        // Add event listeners
        window.addEventListener('keydown', handleKeyDown);
        
        // Back to input button click handler
        if (backToInputBtn) {
            backToInputBtn.addEventListener('click', backToInputHandler);
        }

        // Regenerate post button click handler
        if (regeneratePostBtn) {
            regeneratePostBtn.addEventListener('click', regeneratePostHandler);
        }
        
        // Close panel when clicking on overlay background
        resultsPanel.addEventListener('click', (e) => {
            if (e.target === resultsPanel) {
                hideResultsPanel();
            }
        });
        
        // Add initial classes
        document.body.classList.add(isMobile ? 'mobile-view' : 'desktop-view');
    }
    
    // Initialize the panel when the DOM is fully loaded
    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', init);
    } else {
        // DOM already loaded, initialize immediately
        init();
    }

    // Function to update the results panel with new content
    window.updateResultsPanel = function(post, hashtags) {
        if (generatedPostTextarea) {
            generatedPostTextarea.value = post;
        }
        
        if (hashtagsContainer) {
            hashtagsContainer.innerHTML = '';
            if (Array.isArray(hashtags)) {
                hashtags.forEach(tag => {
                    const span = document.createElement('span');
                    span.className = 'inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-indigo-100 text-indigo-800 mr-2 mb-2';
                    span.textContent = `#${tag}`;
                    hashtagsContainer.appendChild(span);
                });
            }
        }
        
        // Hide loading state and show results
        if (loadingSpinner) loadingSpinner.classList.add('hidden');
        if (regeneratePostBtn) {
            const icon = regeneratePostBtn.querySelector('svg');
            if (icon) icon.classList.remove('animate-spin');
        }
        
        // Show the results panel after updating content
        showResultsPanel();
    };

    // Function to handle image download button visibility
    window.toggleImageDownloadButton = function(show) {
        const downloadBtn = document.getElementById('download-image-btn');
        if (downloadBtn) {
            downloadBtn.classList.toggle('hidden', !show);
        }
    };
    
    // Function to reset the form
    window.resetForm = function() {
        if (urlInput) urlInput.value = '';
        if (toneOptions) {
            toneOptions.forEach(option => {
                option.classList.remove('ring-2', 'ring-indigo-500', 'border-indigo-500');
            });
        }
        if (generatedPostTextarea) generatedPostTextarea.value = '';
        if (hashtagsContainer) hashtagsContainer.innerHTML = '';
        showInputPanel();
    };
});

// Copy to clipboard function
function copyToClipboard(text, elementId = null) {
    navigator.clipboard.writeText(text).then(() => {
        if (elementId) {
            const element = document.getElementById(elementId);
            if (element) {
                const originalText = element.textContent;
                element.textContent = 'Copied!';
                setTimeout(() => {
                    element.textContent = originalText;
                }, 2000);
            }
        }
    }).catch(err => {
        console.error('Failed to copy text: ', err);
    });
}
