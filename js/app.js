// Main application file
import { fetchAndParseArticle } from './articleParser.js';
import { generateImage, downloadImage } from './imageGenerator.js';
import { showNotification, escapeHtml } from './utils.js';
import { generatePostWithAI, generateHashtagsWithAI } from './apiService.js';

// Animation timings
const ANIMATION_DURATION = 300; // ms

// DOM Elements
let articleUrlInput, generateBtn, generateBtnText, generateBtnSpinner, loadingIndicator;
let resultsSection, errorSection, errorMessage, generatedPostTextarea, hashtagsContainer;
let copyPostBtn, copyHashtagsBtn, copyAllBtn, startOverBtn, toneOptions, apiKeyInput;
let generateImageCheckbox, imageSection, generatedImage, imageLoading, imagePlaceholder;
let downloadImageBtn, imageContainer;

// State
let selectedTone = null;
let currentHashtags = [];
let generatedImageData = null;
let isGenerating = false;

// Cache DOM elements
function cacheDOMElements() {
    articleUrlInput = document.getElementById('article-url');
    generateBtn = document.getElementById('generate-btn');
    generateBtnText = document.getElementById('generate-btn-text');
    generateBtnSpinner = document.getElementById('generate-btn-spinner');
    loadingIndicator = document.getElementById('loading-indicator');
    resultsSection = document.getElementById('results-section');
    errorSection = document.getElementById('error-section');
    errorMessage = document.getElementById('error-message');
    generatedPostTextarea = document.getElementById('generated-post');
    hashtagsContainer = document.getElementById('hashtags-container');
    copyPostBtn = document.getElementById('copy-post-btn');
    copyHashtagsBtn = document.getElementById('copy-hashtags-btn');
    copyAllBtn = document.getElementById('copy-all-btn');
    startOverBtn = document.getElementById('start-over-btn');
    toneOptions = document.querySelectorAll('.tone-option');
    apiKeyInput = document.getElementById('api-key');
    generateImageCheckbox = document.getElementById('generate-image');
    imageSection = document.getElementById('image-section');
    generatedImage = document.getElementById('generated-image');
    imageLoading = document.getElementById('image-loading');
    imagePlaceholder = document.getElementById('image-placeholder');
    downloadImageBtn = document.getElementById('download-image-btn');
    imageContainer = document.getElementById('image-container');
}

// Initialize the application
function init() {
    // Cache DOM elements first
    cacheDOMElements();
    
    // Set up event listeners
    setupEventListeners();
    
    // Initialize any UI components
    initUI();
    
    // Check for saved API key
    checkForSavedApiKey();
    
    // Make sure the results and image sections are visible
    if (resultsSection) {
        resultsSection.style.display = 'block';
    }
    
    // Ensure the image section is visible but with the correct initial state
    if (imageSection) {
        imageSection.style.display = 'block';
        
        // Show the placeholder if no image is loaded
        const hasImage = generatedImage && generatedImage.src && !generatedImage.src.endsWith('undefined');
        if (!hasImage && imagePlaceholder) {
            // Make sure the placeholder has the correct HTML structure
            if (!imagePlaceholder.querySelector('svg')) {
                imagePlaceholder.innerHTML = `
                    <svg class="mx-auto h-12 w-12 text-gray-300" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="1.5" d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                    </svg>
                    <p class="mt-2 text-sm text-gray-500">Enable \"Generate an image\" and click \"Generate Post\" to create an image</p>
                `;
            }
            imagePlaceholder.classList.remove('hidden');
        }
    }
    
    // Hide any existing error messages on load
    const errorSection = document.querySelector('.error-message');
    if (errorSection) {
        errorSection.style.display = 'none';
    }
}

// Initialize the application when the DOM is loaded
document.addEventListener('DOMContentLoaded', () => {
    try {
        init();
        
        // Remove any existing API key validation message
        const apiKeyValidation = document.getElementById('api-key-validation');
        if (apiKeyValidation) {
            apiKeyValidation.remove();
        }
        
        // Remove error class from API key input
        if (apiKeyInput) {
            apiKeyInput.classList.remove('border-red-500');
        }
        
        // Load any saved preferences
        loadUserPreferences();
        
        // Validate inputs without showing validation messages
        validateInputs(false);
    } catch (error) {
        console.error('Error during initialization:', error);
    }
});

// Set up event listeners
function setupEventListeners() {
    // Track user interaction with the form
    const trackInteraction = () => {
        if (!hasUserInteracted) {
            hasUserInteracted = true;
            validateInputs();
        }
    };
    
    // URL input validation
    if (articleUrlInput) {
        articleUrlInput.addEventListener('input', () => {
            trackInteraction();
            validateInputs();
        });
    }
    
    // Tone selection
    if (toneOptions && toneOptions.length > 0) {
        toneOptions.forEach(option => {
            option.addEventListener('click', () => {
                trackInteraction();
                if (option.classList.contains('selected') || isGenerating) return;
                
                // Add visual feedback
                option.style.transform = 'scale(0.98)';
                setTimeout(() => {
                    option.style.transform = '';
                }, 100);
                
                // Remove selected class and styles from all options
                toneOptions.forEach(opt => {
                    if (opt) {
                        opt.classList.remove('selected', 'ring-2', 'ring-indigo-500', 'border-indigo-600');
                        opt.style.borderColor = '';
                    }
                });
                
                // Add selected class and styles to clicked option
                option.classList.add('selected', 'ring-2', 'ring-indigo-500', 'border-indigo-600');
                option.style.borderColor = '#4f46e5'; // indigo-600
                
                // Update selected tone
                selectedTone = option.dataset.tone;
                
                // Store preference
                localStorage.setItem('linkscribe-preferred-tone', selectedTone);
                
                // Validate to enable/disable generate button
                validateInputs();
            });
        });
    }
    
    // Generate image toggle
    if (generateImageCheckbox) {
        generateImageCheckbox.addEventListener('change', () => {
            trackInteraction();
            if (isGenerating) {
                generateImageCheckbox.checked = !generateImageCheckbox.checked;
                return;
            }
            
            // Store preference
            localStorage.setItem('linkscribe-generate-image', generateImageCheckbox.checked);
            
            // Validate to show/hide API key validation if needed
            validateInputs();
        });
    }
    
    // API key input with debounce
    if (apiKeyInput) {
        let apiKeyTimeout;
        apiKeyInput.addEventListener('input', (e) => {
            trackInteraction();
            clearTimeout(apiKeyTimeout);
            
            // Add loading state to the input
            apiKeyInput.classList.add('loading');
            
            // Debounce the input handling
            apiKeyTimeout = setTimeout(() => {
                const value = apiKeyInput.value.trim();
                
                // Store in session storage if value exists
                if (value) {
                    sessionStorage.setItem('linkscribe-api-key', value);
                } else {
                    sessionStorage.removeItem('linkscribe-api-key');
                }
                
                validateInputs();
                
                // Remove loading state
                setTimeout(() => {
                    apiKeyInput.classList.remove('loading');
                }, 300);
            }, 500);
        });
    }
    
    // Handle generate button click
    if (generateBtn) {
        generateBtn.addEventListener('click', async (e) => {
            e.preventDefault();
            try {
                // Force validation when generate is clicked
                hasUserInteracted = true;
                
                // First validate without showing messages
                validateInputs(false);
                
                // If form is valid, proceed
                if (!generateBtn.disabled) {
                    await handleGenerate();
                } else {
                    // If form is invalid, show validation messages
                    validateInputs(true);
                }
            } catch (err) {
                console.error('Error generating post:', err);
                showNotification(err.message || 'An error occurred while generating the post.');
            }
        });
    }
    
    // Copy buttons with enhanced feedback
    if (copyPostBtn) {
        copyPostBtn.addEventListener('click', () => {
            if (generatedPostTextarea && generatedPostTextarea.value) {
                copyToClipboard(generatedPostTextarea.value, 'Post');
                showSuccessFeedback(copyPostBtn);
            } else {
                showNotification('No post content available to copy', 'warning');
            }
        });
    }
    
    if (copyHashtagsBtn) {
        copyHashtagsBtn.addEventListener('click', () => {
            if (currentHashtags && currentHashtags.length > 0) {
                const hashtagsText = currentHashtags.join(' ');
                copyToClipboard(hashtagsText, 'Hashtags');
                showSuccessFeedback(copyHashtagsBtn);
            } else {
                showNotification('No hashtags available to copy', 'warning');
            }
        });
    }
    
    if (copyAllBtn) {
        copyAllBtn.addEventListener('click', () => {
            if (generatedPostTextarea && generatedPostTextarea.value) {
                const hashtagsText = currentHashtags && currentHashtags.length > 0 ? `\n\n${currentHashtags.join(' ')}` : '';
                const combined = `${generatedPostTextarea.value}${hashtagsText}`;
                copyToClipboard(combined, 'Post and hashtags');
                showSuccessFeedback(copyAllBtn);
            } else {
                showNotification('No content available to copy', 'warning');
            }
        });
    }
    
    // Download image button with enhanced feedback
    if (downloadImageBtn) {
        downloadImageBtn.addEventListener('click', () => {
            if (generatedImageData) {
                downloadImage(generatedImageData, `linkedin-post-image-${Date.now()}.png`);
                showSuccessFeedback(downloadImageBtn, 'Downloaded!');
            } else {
                showNotification('No image available to download', 'warning');
            }
        });
    }
    
    // Open in new tab button
    const openInNewTabBtn = document.getElementById('open-in-new-tab');
    if (openInNewTabBtn) {
        openInNewTabBtn.addEventListener('click', (e) => {
            const image = document.getElementById('generated-image');
            if (image && image.src) {
                window.open(image.src, '_blank');
            } else {
                e.preventDefault();
            }
        });
    }
    
    // Start over button
    startOverBtn.addEventListener('click', resetApp);
}

/**
 * Clears any previous session data and resets the form
 */
function clearPreviousSession() {
    // Clear stored data
    sessionStorage.removeItem('linkscribe-api-key');
    
    // Reset form fields
    if (articleUrlInput) articleUrlInput.value = '';
    if (apiKeyInput) apiKeyInput.value = '';
    if (generateImageCheckbox) generateImageCheckbox.checked = false;
    
    // Reset tone selection
    if (toneOptions && toneOptions.length > 0) {
        toneOptions.forEach(option => {
            option.classList.remove('selected', 'ring-2', 'ring-indigo-500', 'border-indigo-600');
            option.style.borderColor = '';
        });
    }
    
    // Reset results section
    if (resultsSection) {
        resultsSection.classList.add('hidden');
    }
    
    // Reset any error states
    if (errorSection) {
        errorSection.classList.add('hidden');
    }
    
    // Reset image section
    const imageElement = document.getElementById('generated-image');
    if (imageElement) {
        imageElement.src = '';
        imageElement.classList.add('hidden');
    }
    
    // Reset download button
    const downloadBtn = document.getElementById('download-image-btn');
    if (downloadBtn) {
        downloadBtn.classList.add('hidden');
    }
    
    // Reset loading states
    setLoadingState(false, '');
    if (typeof showImageLoadingState === 'function') {
        showImageLoadingState(false);
    }
}

/**
 * Loads user preferences (currently disabled to ensure fresh start each time)
 */
function loadUserPreferences() {
    // Clear any previous session data first
    clearPreviousSession();
    
    // Note: We're not loading any saved preferences to ensure a fresh start each time
    // If you want to load preferences in the future, uncomment and modify the code below:
    /*
    // Load tone preference
    const savedTone = localStorage.getItem('linkscribe-preferred-tone');
    if (savedTone) {
        const toneOption = document.querySelector(`.tone-option[data-tone="${savedTone}"]`);
        if (toneOption) {
            toneOption.click();
        }
    }
    
    // Load image generation preference
    const generateImagePref = localStorage.getItem('linkscribe-generate-image');
    if (generateImagePref !== null) {
        generateImageCheckbox.checked = generateImagePref === 'true';
        if (apiKeySection) {
            apiKeySection.classList.toggle('hidden', !generateImageCheckbox.checked);
        }
    }
    
    // Load API key (if user has chosen to save it in this session)
    const apiKey = sessionStorage.getItem('linkscribe-api-key');
    if (apiKey && apiKeyInput) {
        apiKeyInput.value = apiKey;
    }
    */
}

// Track if user has interacted with the form
let hasUserInteracted = false;

// Validate inputs to enable/disable generate button
function validateInputs(forceShowValidation = false) {
    if (!articleUrlInput || !generateBtn) return;
    
    const url = articleUrlInput.value.trim();
    const isValidUrl = url.startsWith('http://') || url.startsWith('https://');
    
    // Check if API key is required and valid
    let hasApiKey = true; // Default to true if API key input doesn't exist
    if (apiKeyInput) {
        hasApiKey = apiKeyInput.value.trim().length > 0;
    }
    
    // All required fields for post generation
    const canGenerate = isValidUrl && selectedTone && hasApiKey;
    
    // Enable/disable generate button based on validation
    generateBtn.disabled = !canGenerate;
    
    // Only show API key validation if we have the API key input element and user has interacted with it or we're forcing validation
    if (apiKeyInput && (hasUserInteracted || forceShowValidation)) {
        showApiKeyValidationMessage(!hasApiKey, forceShowValidation);
    }
}

// Show/hide API key validation message
function showApiKeyValidationMessage(show, forceShowValidation = false) {
    // Don't show validation if we don't have the input or if we're not forcing it
    if (!apiKeyInput || (!hasUserInteracted && !forceShowValidation)) {
        return;
    }
    
    let validationMsg = document.getElementById('api-key-validation');
    
    if (show) {
        // Only show validation if we have a parent node to append to and we don't already have a message
        if (!validationMsg && apiKeyInput.parentNode) {
            try {
                validationMsg = document.createElement('p');
                validationMsg.id = 'api-key-validation';
                validationMsg.className = 'text-red-500 text-sm mt-1';
                validationMsg.textContent = 'OpenAI API key is required to generate your post';
                
                // Insert the message after the input
                apiKeyInput.insertAdjacentElement('afterend', validationMsg);
                
                // Add error styling to the input
                apiKeyInput.classList.add('border-red-500');
            } catch (e) {
                console.error('Error showing API key validation:', e);
            }
        }
    } else if (validationMsg) {
        // Remove the validation message
        try {
            validationMsg.remove();
        } catch (e) {
            console.error('Error removing validation message:', e);
        }
        
        // Remove error styling if the input exists
        if (apiKeyInput) {
            apiKeyInput.classList.remove('border-red-500');
        }
    }
}

// Handle generate button click
async function handleGenerate() {
    if (!articleUrlInput || !generateBtn || !generateBtnText) {
        console.error('Required DOM elements not found');
        return;
    }
    
    const url = articleUrlInput.value.trim();
    const generateImg = generateImageCheckbox ? generateImageCheckbox.checked : false;
    const apiKey = apiKeyInput ? apiKeyInput.value.trim() : '';
    
    console.log('API Key:', apiKey ? '***' + apiKey.slice(-4) : 'Not provided');
    console.log('URL:', url);
    console.log('Selected Tone:', selectedTone);
    
    // Validate required fields
    if (!url) {
        showError('Please enter a valid URL');
        return;
    }
    
    if (!selectedTone) {
        showError('Please select a tone for your post');
        return;
    }
    
    if (!apiKey) {
        showError('OpenAI API key is required');
        return;
    }
    
    try {
        isGenerating = true;
        setLoadingState(true, 'Loading...');
        
        // Hide any previous error messages
        if (errorSection) {
            errorSection.style.display = 'none';
        }
        if (errorMessage) {
            errorMessage.textContent = '';
        }
        
        // Update button state
        generateBtn.disabled = true;
        if (generateBtnText) {
            generateBtnText.textContent = 'Generating...';
        }
        
        // Store API key in session storage for this session
        if (apiKey) {
            sessionStorage.setItem('linkscribe-api-key', apiKey);
        }
        
        console.log('Fetching article from URL:', url);
        
        // Fetch and parse the article
        const articleData = await fetchAndParseArticle(url);
        console.log('Article data:', articleData);
        
        if (!articleData || (!articleData.text && !articleData.description && !articleData.title)) {
            throw new Error('Could not extract any content from the provided URL. Please try a different URL.');
        }
        
        // Generate post using OpenAI API
        const post = await generatePostWithAI(
            articleData.text || articleData.description || articleData.title || '',
            selectedTone,
            apiKey
        );
        
        if (!post) {
            throw new Error('Failed to generate post. Please try again.');
        }
        
        // Generate hashtags using OpenAI API
        const hashtags = await generateHashtagsWithAI(post, apiKey);
        
        // Display results
        displayResults(post, hashtags || []);
        
        // Generate image if requested
        if (generateImg) {
            try {
                showImageLoadingState(true);
                const imageData = await generateImage(articleData, selectedTone, apiKey);
                displayGeneratedImage(imageData);
                
                // Enable the download button in the panel
                if (window.SlidingPanel) {
                    const downloadBtn = document.getElementById('download-image-btn');
                    if (downloadBtn) {
                        downloadBtn.disabled = false;
                        downloadBtn.classList.remove('opacity-50', 'cursor-not-allowed');
                        downloadBtn.classList.add('bg-indigo-600', 'hover:bg-indigo-700');
                    }
                }
            } catch (error) {
                console.error('Error generating image:', error);
                // Show a non-blocking notification for image generation failure
                showNotification('Post generated, but image generation failed: ' + (error.message || 'Unknown error'), 'warning');
            } finally {
                showImageLoadingState(false);
            }
        }
    } catch (error) {
        console.error('Error in post generation process:', error);
        
        // Check for specific error messages
        if (error.message && (error.message.includes('browser extension') || 
            error.message.includes('linkedin') || 
            error.message.includes('extension'))) {
            showError(
                'It looks like a browser extension is interfering with the request.\n\n' +
                'Please try one of these solutions:\n' +
                '1. Open this page in an incognito/private window (Ctrl+Shift+N)\n' +
                '2. Disable any LinkedIn or social media extensions\n' +
                '3. Try a different browser without these extensions'
            );
        } else {
            // Show the original error
            showError(error.message || 'Failed to generate post. Please try again.');
        }
    } finally {
        isGenerating = false;
        setLoadingState(false);
    }
}

// Display the generated results
function displayResults(post, hashtags = []) {
    return new Promise((resolve) => {
        try {
            if (!post) {
                throw new Error('No post content was generated. Please try again.');
            }
            
            // Ensure results section is visible
            if (resultsSection) {
                resultsSection.style.display = 'block';
            }
            
            // Update the post content and hashtags
            if (generatedPostTextarea) {
                generatedPostTextarea.value = post;
                generatedPostTextarea.disabled = false;
            }
            
            // Update hashtags
            if (hashtagsContainer) {
                hashtagsContainer.innerHTML = '';
                
                if (Array.isArray(hashtags) && hashtags.length > 0) {
                    hashtags.forEach(tag => {
                        const span = document.createElement('span');
                        span.className = 'inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-indigo-100 text-indigo-800 mr-2 mb-2';
                        span.textContent = tag;
                        hashtagsContainer.appendChild(span);
                    });
                    
                    if (copyHashtagsBtn) {
                        copyHashtagsBtn.disabled = false;
                        copyHashtagsBtn.classList.remove('opacity-50', 'cursor-not-allowed');
                    }
                } else {
                    const noTags = document.createElement('span');
                    noTags.className = 'text-gray-400 text-sm';
                    noTags.textContent = 'No hashtags generated';
                    hashtagsContainer.appendChild(noTags);
                    
                    if (copyHashtagsBtn) {
                        copyHashtagsBtn.disabled = true;
                        copyHashtagsBtn.classList.add('opacity-50', 'cursor-not-allowed');
                    }
                }
            }
            
            // Enable copy buttons
            if (copyPostBtn) copyPostBtn.disabled = false;
            if (copyAllBtn) copyAllBtn.disabled = false;
            
            // Scroll to results on mobile
            if (window.innerWidth < 768) {
                const resultsSection = document.querySelector('.results-section');
                if (resultsSection) {
                    resultsSection.scrollIntoView({ behavior: 'smooth' });
                }
            }
            
            
            // Update the UI state
            setLoadingState(false);
            isGenerating = false;
            
            // Show success notification if available
            if (typeof showNotification === 'function') {
                showNotification('Post generated successfully!', 'success');
            }
            
            resolve();
            
        } catch (error) {
            console.error('Error in displayResults:', error);
            setLoadingState(false);
            isGenerating = false;
            
            // Show error to user if possible
            if (typeof showError === 'function') {
                showError(error.message || 'An error occurred while displaying results.');
            }
            
            // Still resolve to prevent hanging
            resolve();
        }
    });
}

// Display the generated image
function displayGeneratedImage(base64Data) {
    if (!base64Data) return;
    
    generatedImageData = base64Data;
    
    // Make sure the image section is visible
    if (imageSection) {
        imageSection.style.display = 'block';
        
        // Update the image container styling
        const imageContainer = document.getElementById('image-container');
        if (imageContainer) {
            imageContainer.classList.remove('border-dashed');
            imageContainer.classList.add('border-solid', 'border-indigo-300');
        }
    }
    
    // Set the image source
    if (generatedImage) {
        generatedImage.src = `data:image/png;base64,${base64Data}`;
        generatedImage.classList.remove('hidden');
    }
    
    // Hide the placeholder
    const placeholder = document.getElementById('image-placeholder');
    if (placeholder) {
        placeholder.classList.add('hidden');
    }
    
    // Show the image actions
    const imageActions = document.getElementById('image-actions');
    if (imageActions) {
        imageActions.classList.remove('hidden');
    }
    
    // Hide loading state
    showImageLoadingState(false);
    
    // Enable the download button
    if (downloadImageBtn) {
        downloadImageBtn.disabled = false;
    }
}

// Show error message to the user
/**
 * Displays an error message to the user
 * @param {string|Error} message - The error message or Error object to display
 * @param {string} [title] - Optional title for the error
 * @param {number} [duration=10000] - Duration in milliseconds to show the error (default: 10s)
 */
function showError(message, title, duration = 10000) {
    // Handle Error objects
    const errorMessage = message instanceof Error ? message.message : message;
    const errorStack = message instanceof Error ? message.stack : null;
    
    // Log detailed error to console
    console.error('Application error:', message);
    if (errorStack) {
        console.error(errorStack);
    }
    
    // Hide loading state for image if applicable
    if (typeof showImageLoadingState === 'function') {
        showImageLoadingState(false);
    }
    
    // Show error notification
    const notificationMessage = title 
        ? `<strong>${escapeHtml(title)}</strong><br>${escapeHtml(errorMessage)}`
        : escapeHtml(errorMessage);
    
    showNotification(notificationMessage, 'error', duration);
    
    // Re-enable UI elements
    if (generateBtn) {
        generateBtn.disabled = false;
        generateBtn.textContent = 'Generate LinkedIn Post';
        generateBtn.classList.remove('opacity-50', 'cursor-not-allowed');
    }
    
    if (generateImageCheckbox) {
        generateImageCheckbox.disabled = false;
    }
    
    if (toneOptions && toneOptions.length > 0) {
        toneOptions.forEach(option => {
            if (option) option.style.pointerEvents = 'auto';
        });
    }
    
    // Hide loading state
    setLoadingState(false);
}

// Show/hide image loading state
function showImageLoadingState(isLoading) {
    // Ensure the image section is visible
    if (imageSection) {
        imageSection.style.display = 'block';
    }
    
    if (isLoading) {
        // Show loading state in the main UI
        if (imageLoading) {
            imageLoading.classList.remove('hidden');
        }
        
        // Hide the image and show the loading state
        if (generatedImage) {
            generatedImage.classList.add('hidden');
        }
        
        // Hide the placeholder
        if (imagePlaceholder) {
            imagePlaceholder.classList.add('hidden');
        }
        
        // Hide image actions
        const imageActions = document.getElementById('image-actions');
        if (imageActions) {
            imageActions.classList.add('hidden');
        }
        
        // Disable the download button
        if (downloadImageBtn) {
            downloadImageBtn.disabled = true;
        }
        
        // Update the image container styling for loading state
        const imageContainer = document.getElementById('image-container');
        if (imageContainer) {
            imageContainer.classList.add('border-dashed');
            imageContainer.classList.remove('border-solid', 'border-indigo-300');
        }
    } else {
        // Hide loading state in the main UI
        if (imageLoading) {
            imageLoading.classList.add('hidden');
        }
        
        // Show the image if we have one, otherwise show the placeholder
        const hasImage = generatedImage && generatedImage.src && !generatedImage.src.endsWith('undefined');
        
        if (hasImage) {
            generatedImage.classList.remove('hidden');
            
            // Show the image actions
            const imageActions = document.getElementById('image-actions');
            if (imageActions) {
                imageActions.classList.remove('hidden');
            }
            
            // Update the image container styling
            const imageContainer = document.getElementById('image-container');
            if (imageContainer) {
                imageContainer.classList.remove('border-dashed');
                imageContainer.classList.add('border-solid', 'border-indigo-300');
            }
        } else if (imagePlaceholder) {
            imagePlaceholder.classList.remove('hidden');
        }
        
        // Re-enable the download button if we have an image
        if (downloadImageBtn) {
            downloadImageBtn.disabled = !hasImage;
        }
    }
}

// Set loading state
// @param {boolean} isLoading - Whether to show the loading state
// @param {string} [message=''] - Optional message to display in the error section
function setLoadingState(isLoading, message = '') {
    if (isLoading) {
        loadingIndicator.classList.remove('hidden');
        loadingIndicator.style.opacity = '0';
        loadingIndicator.style.transform = 'translateY(10px)';
        
        // Trigger reflow
        void loadingIndicator.offsetWidth;
        
        loadingIndicator.style.opacity = '1';
        loadingIndicator.style.transform = 'translateY(0)';
        
        // Disable all interactive elements
        document.querySelectorAll('input, button, .tone-option').forEach(el => {
            if (el !== generateBtn) {
                el.style.pointerEvents = 'none';
                el.style.opacity = '0.7';
            }
        });
        
    } else {
        loadingIndicator.style.opacity = '0';
        loadingIndicator.style.transform = 'translateY(-10px)';
        
        setTimeout(() => {
            loadingIndicator.classList.add('hidden');
            
            // Re-enable interactive elements
            document.querySelectorAll('input, button, .tone-option').forEach(el => {
                el.style.pointerEvents = '';
                el.style.opacity = '';
            });
            
            // Re-validate inputs
            validateInputs();
        }, ANIMATION_DURATION);
    }
    if (message) {
        errorSection.classList.remove('hidden');
        errorMessage.textContent = message;
        errorSection.scrollIntoView({ behavior: 'smooth' });
    }
}

// Copy content to clipboard
async function copyToClipboard(text, contentType) {
    try {
        await navigator.clipboard.writeText(text);
        showNotification(`${contentType} copied to clipboard!`, 'success');
        return true;
    } catch (err) {
        console.error('Failed to copy to clipboard:', err);
        showNotification(
            'Failed to copy to clipboard. Please try manually selecting and copying the text.',
            'error',
            5000
        );
        return false;
    }
}

// Reset the application
function resetApp() {
    // Reset form fields and UI state
    resetForm();
    
    // Hide results and error sections
    if (resultsSection) resultsSection.classList.add('hidden');
    if (errorSection) errorSection.classList.add('hidden');
    
    // Reset image section
    if (generatedImage) {
        generatedImage.classList.add('hidden');
        generatedImage.src = '';
    }
    if (imageLoading) imageLoading.classList.add('hidden');
    if (downloadImageBtn) downloadImageBtn.classList.add('hidden');
    if (imagePlaceholder) {
        // Reset to the original placeholder HTML
        imagePlaceholder.innerHTML = `
            <svg class="mx-auto h-12 w-12 text-gray-300" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="1.5" d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
            </svg>
            <p class="mt-2 text-sm text-gray-500">Enable "Generate an image" and click "Generate Post" to create an image</p>
        `;
        imagePlaceholder.classList.remove('text-red-500', 'hidden');
    }
    
    // Reset the panel state
    if (window.SlidingPanel) {
        window.SlidingPanel.hide();
    }
    
    // Clear generated image data
    generatedImageData = null;
    
    // Focus on URL input if available
    if (articleUrlInput) articleUrlInput.focus();
}

