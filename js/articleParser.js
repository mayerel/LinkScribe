/**
 * Article Parser Module
 * Responsible for fetching and extracting content from articles
 */

/**
 * Fetches and parses an article from a given URL using a CORS proxy
 * @param {string} url - The URL of the article to fetch
 * @returns {Promise<Object>} - The extracted article data
 */
// List of CORS proxy servers to try
const PROXY_SERVERS = [
    'https://api.allorigins.win/get?url=',
    'https://cors-anywhere.herokuapp.com/',
    'https://api.codetabs.com/v1/proxy?quest=',
    'https://corsproxy.io/?',
    'https://thingproxy.freeboard.io/fetch/'
];

// Function to try fetching from multiple proxies
async function tryFetchWithProxies(url, proxies) {
    let lastError;
    
    for (const proxy of proxies) {
        try {
            const proxyUrl = `${proxy}${encodeURIComponent(url)}`;
            console.log(`Trying proxy: ${proxyUrl}`);
            
            const response = await fetch(proxyUrl, {
                headers: {
                    'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,image/webp,*/*;q=0.8',
                    'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36',
                    'X-Requested-With': 'XMLHttpRequest'
                }
            });
            
            if (!response.ok) {
                throw new Error(`Proxy error: ${response.status} ${response.statusText}`);
            }
            
            let data;
            if (proxy.includes('allorigins.win')) {
                data = await response.json();
                return data.contents || data;
            } else {
                return await response.text();
            }
            
        } catch (error) {
            console.error(`Proxy ${proxy} failed:`, error.message);
            lastError = error;
            continue;
        }
    }
    
    throw lastError || new Error('All proxy attempts failed');
}

export async function fetchAndParseArticle(url) {
    console.log(`Fetching article from URL: ${url}`);
    
    // Validate URL format
    if (!url || !url.startsWith('http')) {
        throw new Error('Please provide a valid URL starting with http:// or https://');
    }
    
    try {
        // Try direct fetch first
        let html;
        try {
            const response = await fetch(url, {
                headers: {
                    'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,image/webp,*/*;q=0.8',
                    'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36'
                }
            });
            
            if (!response.ok) {
                throw new Error(`HTTP error! status: ${response.status}`);
            }
            
            html = await response.text();
            
        } catch (directError) {
            console.log('Direct fetch failed, trying proxies...', directError.message);
            html = await tryFetchWithProxies(url, PROXY_SERVERS);
        }
        
        // Parse the HTML
        const parser = new DOMParser();
        const doc = parser.parseFromString(html, 'text/html');
        
        // Extract title
        const title = doc.querySelector('title')?.textContent || 'No title';
        
        // Try to find the main content
        const article = doc.querySelector('article') || 
                       doc.querySelector('main') || 
                       doc.querySelector('.post-content') ||
                       doc.querySelector('.article-content') ||
                       doc.body;
        
        // Clean up the content
        const unwantedSelectors = [
            'script', 'style', 'iframe', 'noscript', 'nav', 'footer', 'header', 
            'aside', '.ad', '.ads', '.advertisement', '.social-share', '.comments',
            '.related-posts', '.sidebar', '.newsletter', '.newsletter-form'
        ];
        
        unwantedSelectors.forEach(selector => {
            article.querySelectorAll(selector).forEach(el => el.remove());
        });
        
        // Return the document and text content
        return {
            document: article.ownerDocument,
            title: title,
            text: article.textContent.trim()
        };
        
    } catch (error) {
        console.error('Error in fetchAndParseArticle:', error);
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
