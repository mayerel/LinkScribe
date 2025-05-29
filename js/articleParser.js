/**
 * Article Parser Module
 * Responsible for fetching and extracting content from articles
 */

/**
 * Fetches and parses an article from a given URL using a CORS proxy
 * @param {string} url - The URL of the article to fetch
 * @returns {Promise<Object>} - The extracted article data
 */
export async function fetchAndParseArticle(url) {
    console.log('Fetching article from URL:', url);
    
    // Validate URL format
    if (!url || !url.startsWith('http')) {
        throw new Error('Please enter a valid URL starting with http:// or https://');
    }
    
    // Encode the URL for use in the proxy
    const encodedUrl = encodeURIComponent(url);
    // Using a free CORS proxy service
    const proxyUrl = `https://api.allorigins.win/get?url=${encodedUrl}`;
    
    try {
        console.log('Fetching via CORS proxy:', proxyUrl);
        
        const response = await fetch(proxyUrl, {
            method: 'GET',
            headers: {
                'Accept': 'application/json',
                'Content-Type': 'application/json'
            },
            cache: 'no-store'
        });
        
        console.log('Received response with status:', response.status, response.statusText);
        
        if (!response.ok) {
            const errorText = await response.text().catch(() => 'No response body');
            console.error('Error response:', errorText);
            throw new Error(`Failed to fetch article: ${response.status} ${response.statusText}`);
        }
        
        const data = await response.json();
        
        // The proxy wraps the response in a JSON object
        if (!data.contents) {
            console.error('Unexpected response format from proxy:', data);
            throw new Error('Failed to retrieve article content from the proxy service');
        }
        
        // Extract and return the article content
        return extractArticleContent(data.contents, url);
        
    } catch (error) {
        console.error('Error in fetchAndParseArticle:', error);
        
        // Provide a helpful error message
        if (error.message.includes('Failed to fetch')) {
            throw new Error(
                'Unable to fetch the article. This might be due to network issues or the website blocking our request.\n\n' +
                'Please try one of these solutions:\n' +
                '1. Try a different article URL\n' +
                '2. Check your internet connection\n' +
                '3. Try again later if the website might be temporarily unavailable'
            );
        }
        
        // Re-throw the original error with a more user-friendly message
        throw new Error(`Failed to process the article: ${error.message}`);
    }
}

/**
 * Extracts key content from the HTML of an article
 * @param {string} html - The HTML content of the article
 * @param {string} url - The URL of the article
 * @returns {Object} - Extracted article data
 */
function extractArticleContent(html, url) {
    // Create a DOM parser
    const parser = new DOMParser();
    const doc = parser.parseFromString(html, 'text/html');
    
    // Extract article information
    const title = extractTitle(doc);
    const author = extractAuthor(doc);
    const publishDate = extractPublishDate(doc);
    const mainContent = extractMainContent(doc);
    const keyPoints = extractKeyPoints(mainContent);
    
    return {
        url,
        title,
        author,
        publishDate,
        mainContent,
        keyPoints,
        domain: new URL(url).hostname
    };
}

/**
 * Extracts the title of the article
 * @param {Document} doc - The parsed HTML document
 * @returns {string} - The article title
 */
function extractTitle(doc) {
    // Try various selectors for article titles
    const possibleTitleElements = [
        doc.querySelector('h1'),
        doc.querySelector('meta[property="og:title"]'),
        doc.querySelector('meta[name="twitter:title"]'),
        doc.querySelector('title')
    ];

    for (const element of possibleTitleElements) {
        if (element) {
            if (element.tagName === 'META') {
                return element.getAttribute('content');
            } else {
                return element.textContent.trim();
            }
        }
    }
    
    return 'Untitled Article';
}

/**
 * Extracts the author of the article
 * @param {Document} doc - The parsed HTML document
 * @returns {string|null} - The article author or null if not found
 */
function extractAuthor(doc) {
    // Try various selectors for article authors
    const possibleAuthorElements = [
        doc.querySelector('[rel="author"]'),
        doc.querySelector('.author'),
        doc.querySelector('.byline'),
        doc.querySelector('meta[name="author"]'),
        doc.querySelector('meta[property="article:author"]')
    ];

    for (const element of possibleAuthorElements) {
        if (element) {
            if (element.tagName === 'META') {
                return element.getAttribute('content');
            } else {
                return element.textContent.trim();
            }
        }
    }
    
    return null;
}

/**
 * Extracts the publish date of the article
 * @param {Document} doc - The parsed HTML document
 * @returns {string|null} - The article publish date or null if not found
 */
function extractPublishDate(doc) {
    // Try various selectors for publish dates
    const possibleDateElements = [
        doc.querySelector('time'),
        doc.querySelector('meta[property="article:published_time"]'),
        doc.querySelector('.published-date'),
        doc.querySelector('.date')
    ];

    for (const element of possibleDateElements) {
        if (element) {
            if (element.tagName === 'META') {
                return element.getAttribute('content');
            } else if (element.hasAttribute('datetime')) {
                return element.getAttribute('datetime');
            } else {
                return element.textContent.trim();
            }
        }
    }
    
    return null;
}

/**
 * Extracts the main content of the article
 * @param {Document} doc - The parsed HTML document
 * @returns {string} - The main content text
 */
function extractMainContent(doc) {
    // Common container selectors for article content
    const selectors = [
        'article',
        '[role="main"]',
        '.post-content',
        '.article-body',
        '.entry-content',
        '.content',
        'main'
    ];
    
    // Try to find a content container
    for (const selector of selectors) {
        const container = doc.querySelector(selector);
        if (container) {
            return cleanContent(container);
        }
    }
    
    // Fallback: try to extract paragraphs from the body if no container is found
    const allParagraphs = doc.querySelectorAll('p');
    if (allParagraphs.length > 0) {
        return Array.from(allParagraphs)
            .map(p => p.textContent.trim())
            .filter(text => text.length > 100)  // Only include substantial paragraphs
            .join('\n\n');
    }
    
    throw new Error('Could not extract meaningful content from the article.');
}

/**
 * Cleans and extracts text content from a container element
 * @param {Element} container - The container element
 * @returns {string} - The cleaned text content
 */
function cleanContent(container) {
    // Clone the container to avoid modifying the original
    const cleanContainer = container.cloneNode(true);
    
    // Remove irrelevant elements
    const elementsToRemove = [
        'nav',
        'header',
        'footer',
        '.nav',
        '.header',
        '.footer',
        '.sidebar',
        '.comments',
        '.social',
        '.related',
        '.advertisement',
        '.ads',
        'script',
        'style',
        'iframe'
    ];
    
    elementsToRemove.forEach(selector => {
        cleanContainer.querySelectorAll(selector).forEach(el => el.remove());
    });
    
    // Get all paragraphs and headings
    const contentElements = cleanContainer.querySelectorAll('p, h1, h2, h3, h4, h5, h6, li');
    
    // Extract and join the text content
    return Array.from(contentElements)
        .map(el => el.textContent.trim())
        .filter(text => text.length > 0)
        .join('\n\n');
}

/**
 * Extracts key points from the main content
 * @param {string} content - The main content text
 * @returns {string[]} - Array of key sentences from the content
 */
function extractKeyPoints(content) {
    // Split content into sentences
    const sentences = content
        .replace(/([.?!])\s*(?=[A-Z])/g, "$1|")
        .split("|")
        .map(s => s.trim())
        .filter(s => s.length > 30 && s.length < 200);  // Focus on reasonable length sentences
    
    // If we have too few sentences, return them all
    if (sentences.length <= 5) {
        return sentences;
    }
    
    // Simple scoring for sentences (can be improved with more sophisticated algorithms)
    const scoredSentences = sentences.map(sentence => {
        let score = 0;
        
        // Score based on length (prefer medium length sentences)
        const length = sentence.length;
        if (length > 60 && length < 150) {
            score += 3;
        }
        
        // Score based on whether it contains numbers (often indicates data/facts)
        if (/\d+/.test(sentence)) {
            score += 2;
        }
        
        // Score based on potential quote indicators
        if (sentence.includes('"') || sentence.includes('"') || sentence.includes('"')) {
            score += 2;
        }
        
        // Score based on indicator phrases
        const indicatorPhrases = [
            'key', 'important', 'significant', 'essential', 'crucial',
            'research shows', 'according to', 'study', 'found that',
            'conclude', 'conclusion', 'result', 'impact'
        ];
        
        for (const phrase of indicatorPhrases) {
            if (sentence.toLowerCase().includes(phrase)) {
                score += 1;
            }
        }
        
        return { sentence, score };
    });
    
    // Sort by score and take top sentences
    scoredSentences.sort((a, b) => b.score - a.score);
    const keyPoints = scoredSentences.slice(0, 5).map(item => item.sentence);
    
    return keyPoints;
}
