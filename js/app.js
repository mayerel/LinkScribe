// Main application file
import { fetchAndParseArticle } from './articleParser.js';
import { generateImage, downloadImage } from './imageGenerator.js';
import { showNotification } from './utils.js';
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
    
    // Then set up event listeners and load preferences
    setupEventListeners();
    loadUserPreferences();
}

// Set up event listeners
function setupEventListeners() {
    // URL input validation
    if (articleUrlInput) {
        articleUrlInput.addEventListener('input', validateInputs);
    }
    
    // Tone selection
    if (toneOptions && toneOptions.length > 0) {
        toneOptions.forEach(option => {
            option.addEventListener('click', () => {
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
            if (isGenerating) {
                generateImageCheckbox.checked = !generateImageCheckbox.checked;
                return;
            }
            
            // Store preference
            localStorage.setItem('linkscribe-generate-image', generateImageCheckbox.checked);
        });
    }
    
    // API key input with debounce
    if (apiKeyInput) {
        let apiKeyTimeout;
        apiKeyInput.addEventListener('input', (e) => {
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
    
    // Generate button
    if (generateBtn) {
        generateBtn.addEventListener('click', async (e) => {
            e.preventDefault();
            try {
                await handleGenerate();
            } catch (err) {
                console.error('Error generating post:', err);
                showNotification(err.message || 'An error occurred while generating the post.');
            }
        });
    }
    
    // Copy buttons with enhanced feedback
    if (copyPostBtn) {
        copyPostBtn.addEventListener('click', () => {
            copyToClipboard(generatedPostTextarea.value, 'Post');
            showSuccessFeedback(copyPostBtn);
        });
    }
    
    if (copyHashtagsBtn) {
        copyHashtagsBtn.addEventListener('click', () => {
            const hashtagsText = currentHashtags.join(' ');
            copyToClipboard(hashtagsText, 'Hashtags');
            showSuccessFeedback(copyHashtagsBtn);
        });
    }
    
    if (copyAllBtn) {
        copyAllBtn.addEventListener('click', () => {
            const combined = `${generatedPostTextarea.value}\n\n${currentHashtags.join(' ')}`;
            copyToClipboard(combined, 'Post and hashtags');
            showSuccessFeedback(copyAllBtn);
        });
    }
    
    // Download image button with enhanced feedback
    if (downloadImageBtn) {
        downloadImageBtn.addEventListener('click', () => {
            if (generatedImageData) {
                downloadImage(generatedImageData, `linkedin-post-image-${Date.now()}.png`);
                showSuccessFeedback(downloadImageBtn, 'Downloaded!');
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

// Load user preferences from localStorage
function loadUserPreferences() {
    // Load saved tone preference
    const savedTone = localStorage.getItem('linkscribe-preferred-tone');
    if (savedTone && toneOptions && toneOptions.length > 0) {
        const toneElement = document.querySelector(`[data-tone="${savedTone}"]`);
        if (toneElement) {
            // Simulate click on the tone option
            const clickEvent = new MouseEvent('click', {
                view: window,
                bubbles: true,
                cancelable: true
            });
            toneElement.dispatchEvent(clickEvent);
        }
    }
    
    // Load generate image preference and set API key section visibility
    const generateImagePref = localStorage.getItem('linkscribe-generate-image');
    const apiKeySection = document.getElementById('api-key-section');
    
    if (generateImageCheckbox && apiKeySection) {
        if (generateImagePref === 'true') {
            generateImageCheckbox.checked = true;
            apiKeySection.classList.remove('hidden');
        } else {
            generateImageCheckbox.checked = false;
            apiKeySection.classList.add('hidden');
        }
    }
    
    // Load API key (if user has chosen to save it in this session)
    const apiKey = sessionStorage.getItem('linkscribe-api-key');
    if (apiKey && apiKeyInput) {
        apiKeyInput.value = apiKey;
    }
}

// Validate inputs to enable/disable generate button
function validateInputs() {
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
    
    // Show API key validation message if needed
    showApiKeyValidationMessage(!hasApiKey);
}

// Show/hide API key validation message
function showApiKeyValidationMessage(show) {
    if (!apiKeyInput) return;
    
    let validationMsg = document.getElementById('api-key-validation');
    
    if (show) {
        // Only show validation if we have a parent node to append to
        if (!validationMsg && apiKeyInput.parentNode) {
            validationMsg = document.createElement('p');
            validationMsg.id = 'api-key-validation';
            validationMsg.className = 'text-red-500 text-sm mt-1';
            validationMsg.textContent = 'OpenAI API key is required to generate your post';
            
            try {
                apiKeyInput.parentNode.appendChild(validationMsg);
                // Add error styling to the input
                apiKeyInput.classList.add('border-red-500');
            } catch (e) {
                console.error('Error appending validation message:', e);
            }
        }
    } else if (validationMsg) {
        try {
            validationMsg.remove();
        } catch (e) {
            console.error('Error removing validation message:', e);
        }
        // Remove error styling
        apiKeyInput.classList.remove('border-red-500');
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
        setLoadingState(true);
        
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
            } catch (error) {
                console.error('Error generating image:', error);
                showNotification('Failed to generate image. ' + error.message, 'error');
            } finally {
                showImageLoadingState(false);
                return;
            }
            
            generateImage(article, selectedTone, apiKey)
                .then(imageData => {
                    displayGeneratedImage(imageData);
                    // Update the download button in the sliding panel
                    const downloadBtn = document.getElementById('download-image-btn');
                    if (downloadBtn) {
                        downloadBtn.classList.remove('hidden');
                    }
                })
                .catch(error => {
                    console.error('Image generation error:', error);
                    // Don't fail the whole process if image generation fails
                    showError('Post generated, but image generation failed: ' + (error.message || 'Unknown error'));
                });
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
function displayResults(post, hashtags) {
    return new Promise((resolve) => {
        try {
            if (!post) {
                throw new Error('No post content was generated. Please try again.');
            }

            // Update the UI with the generated content
            if (generatedPostTextarea) {
                generatedPostTextarea.value = post;
            } else {
                console.warn('Generated post textarea not found');
            }
            
            // Update hashtags if provided
            currentHashtags = Array.isArray(hashtags) ? hashtags : [];
            
            // Show the results panel and update its content
            const resultsPanel = document.getElementById('results-panel');
            const generatedPost = document.getElementById('generated-post');
            const hashtagsContainer = document.getElementById('hashtags-container');
            
            if (resultsPanel && generatedPost) {
                // Update the content
                generatedPost.textContent = post;
                
                // Update hashtags if available
                if (hashtagsContainer && currentHashtags && currentHashtags.length > 0) {
                    hashtagsContainer.innerHTML = currentHashtags
                        .map(tag => `<span class="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-indigo-100 text-indigo-800">${tag}</span>`)
                        .join('');
                }
                
                // Show the panel
                resultsPanel.classList.add('active');
                resultsPanel.style.opacity = '1';
                resultsPanel.style.pointerEvents = 'auto';
                
                // Show the panel content
                const panelContent = resultsPanel.querySelector('div');
                if (panelContent) {
                    panelContent.style.transform = 'translateX(0)';
                }
            }
            
            // Handle image generation if enabled
            const shouldGenerateImage = generateImageCheckbox && generateImageCheckbox.checked;
            
            if (shouldGenerateImage) {
                if (typeof showImageLoadingState === 'function') {
                    showImageLoadingState(true);
                }
                
                // Generate image if we have the required parameters
                if (article && selectedTone && apiKey) {
                    generateImage(article, selectedTone, apiKey)
                        .then(() => {
                            if (typeof showImageLoadingState === 'function') {
                                showImageLoadingState(false);
                            }
                        })
                        .catch(error => {
                            console.error('Error generating image:', error);
                            if (typeof showImageLoadingState === 'function') {
                                showImageLoadingState(false);
                            }
                            // Show a non-blocking notification for image generation failure
                            if (typeof showNotification === 'function') {
                                showNotification('Image generation failed. Your post was still created successfully.', 'warning');
                            }
                        });
                } else {
                    console.warn('Missing required parameters for image generation');
                    if (typeof showImageLoadingState === 'function') {
                        showImageLoadingState(false);
                    }
                }
            } else if (imageSection) {
                // Hide the image section if image generation is not enabled
                imageSection.classList.add('hidden');
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
    
    // Show the image section if it was hidden
    imageSection.classList.remove('hidden');
    
    // Set the image source
    generatedImage.src = `data:image/png;base64,${base64Data}`;
    generatedImage.classList.remove('hidden');
    
    // Hide placeholder and show the image
    if (imagePlaceholder) {
        imagePlaceholder.classList.add('hidden');
    }
    
    // Hide loading state
    showImageLoadingState(false);
    
    // Show action buttons
    if (downloadImageBtn) {
        downloadImageBtn.classList.remove('hidden');
    }
    
    const openInNewTabBtn = document.getElementById('open-in-new-tab');
    if (openInNewTabBtn) {
        openInNewTabBtn.classList.remove('hidden');
    }
    
    // Scroll to the image section
    setTimeout(() => {
        imageSection.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
    }, 100);
}

// Show error message to the user
function showError(message) {
    console.error('Showing error to user:', message);
    
    // Hide loading state for image if applicable
    if (typeof showImageLoadingState === 'function') {
        showImageLoadingState(false);
    }
    
    // Show error message in the UI if error elements exist
    const errorMsgElement = document.getElementById('error-message');
    const errorSectionElement = document.getElementById('error-section');
    
    if (errorMsgElement && errorSectionElement) {
        // Set error message text
        errorMsgElement.textContent = message;
        
        // Make sure error section is visible
        errorSectionElement.classList.remove('hidden');
        errorSectionElement.style.display = 'block';
        errorSectionElement.style.opacity = '0';
        errorSectionElement.style.transform = 'translateY(-10px)';
        
        // Trigger reflow
        void errorSectionElement.offsetWidth;
        
        // Animate in
        errorSectionElement.style.opacity = '1';
        errorSectionElement.style.transform = 'translateY(0)';
        errorSectionElement.style.transition = `opacity ${ANIMATION_DURATION}ms ease-out, transform ${ANIMATION_DURATION}ms ease-out`;
        
        // Hide error after 8 seconds with animation
        setTimeout(() => {
            errorSectionElement.style.opacity = '0';
            errorSectionElement.style.transform = 'translateY(-10px)';
            
            setTimeout(() => {
                errorSectionElement.style.display = 'none';
            }, ANIMATION_DURATION);
        }, 8000);
    } else {
        // Fallback to notification if error section is not available
        console.warn('Error elements not found in DOM, using notification fallback');
        showNotification(`Error: ${message}`, 5000);
    }
    
    // Show placeholder if no image was generated
    if (!generatedImageData && imagePlaceholder) {
        imagePlaceholder.classList.remove('hidden');
    }
    
    // Hide any action buttons
    if (downloadImageBtn) {
        downloadImageBtn.classList.add('hidden');
    }
    
    const openInNewTabBtn = document.getElementById('open-in-new-tab');
    if (openInNewTabBtn) {
        openInNewTabBtn.classList.add('hidden');
    }
}

// Show/hide image loading state
function showImageLoadingState(isLoading) {
    if (isLoading) {
        // Show loading spinner
        if (imageLoading) {
            imageLoading.classList.remove('hidden');
        }
        
        // Hide placeholder and image
        if (imagePlaceholder) {
            imagePlaceholder.classList.add('hidden');
        }
        
        if (generatedImage) {
            generatedImage.classList.add('hidden');
        }
        
        // Hide action buttons
        if (downloadImageBtn) {
            downloadImageBtn.classList.add('hidden');
        }
        
        const openInNewTabBtn = document.getElementById('open-in-new-tab');
        if (openInNewTabBtn) {
            openInNewTabBtn.classList.add('hidden');
        }
    } else {
        // Hide loading spinner
        if (imageLoading) {
            imageLoading.classList.add('hidden');
        }
    }
}

// Set loading state
function setLoadingState(isLoading) {
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
    errorSection.classList.remove('hidden');
    errorMessage.textContent = message;
    errorSection.scrollIntoView({ behavior: 'smooth' });
}

// Copy content to clipboard
async function copyToClipboard(text, contentType) {
    try {
        await navigator.clipboard.writeText(text);
        showNotification(`${contentType} copied to clipboard!`);
    } catch (err) {
        showError('Failed to copy to clipboard. Please try manually selecting and copying the text.');
    }
}

// Reset the application
function resetApp() {
    // Hide results and error sections
    resultsSection.classList.add('hidden');
    errorSection.classList.add('hidden');
    
    // Clear URL input
    articleUrlInput.value = '';
    
    // Disable generate button
    generateBtn.disabled = true;
    
    // Reset image section
    generatedImage.classList.add('hidden');
    imageLoading.classList.add('hidden');
    downloadImageBtn.classList.add('hidden');
    imagePlaceholder.textContent = 'Your companion image will appear here';
    imagePlaceholder.classList.remove('text-red-500');
    imagePlaceholder.classList.remove('hidden');
    
    // Clear generated image data
    generatedImageData = null;
    
    // Focus on URL input
    articleUrlInput.focus();
}

// Initialize the app when the DOM is fully loaded
document.addEventListener('DOMContentLoaded', init);
