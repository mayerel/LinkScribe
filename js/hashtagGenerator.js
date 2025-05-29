/**
 * Hashtag Generator Module
 * Responsible for generating relevant hashtags based on article content
 */

// Common general hashtags by category
const CATEGORY_HASHTAGS = {
    technology: ['tech', 'technology', 'innovation', 'digital', 'future'],
    business: ['business', 'entrepreneurship', 'leadership', 'management', 'strategy'],
    marketing: ['marketing', 'branding', 'digitalmarketing', 'socialmedia', 'content'],
    career: ['career', 'jobs', 'hiring', 'careeradvice', 'professionaldevelopment'],
    education: ['education', 'learning', 'training', 'skills', 'knowledge'],
    health: ['health', 'wellness', 'mentalhealth', 'healthcare', 'wellbeing'],
    finance: ['finance', 'investing', 'money', 'wealth', 'personalfinance'],
    productivity: ['productivity', 'efficiency', 'timemanagement', 'organization', 'goals'],
    general: ['trending', 'insights', 'thoughtleadership', 'professional', 'networking']
};

// Popular LinkedIn hashtags
const POPULAR_HASHTAGS = [
    'innovation', 'leadership', 'entrepreneurship', 'technology', 'management',
    'business', 'marketing', 'success', 'hr', 'education', 'productivity',
    'startup', 'careers', 'motivation', 'strategy', 'work', 'growth'
];

/**
 * Generates hashtags based on article content
 * @param {Object} articleData - The extracted article data
 * @returns {string[]} - Array of hashtags including the # symbol
 */
export function generateHashtags(articleData) {
    // Extract key information from the article
    const { title, mainContent, keyPoints, domain } = articleData;
    
    // Combine text for analysis
    const combinedText = `${title} ${mainContent}`.toLowerCase();
    
    // Identify categories
    const categories = identifyCategories(combinedText);
    
    // Generate domain-specific hashtag
    const domainHashtag = generateDomainHashtag(domain);
    
    // Extract keywords from title and content
    const keywordsFromTitle = extractKeywords(title, 3);
    const keywordsFromContent = extractKeywords(mainContent, 5);
    
    // Combine all potential hashtags
    const potentialHashtags = [
        ...getCategoryHashtags(categories),
        ...keywordsFromTitle,
        ...keywordsFromContent
    ];
    
    // Add domain hashtag if available
    if (domainHashtag) {
        potentialHashtags.push(domainHashtag);
    }
    
    // Add some popular hashtags
    potentialHashtags.push(...getRandomElements(POPULAR_HASHTAGS, 2));
    
    // Format, deduplicate, and select the best hashtags
    const finalHashtags = selectAndFormatHashtags(potentialHashtags);
    
    return finalHashtags;
}

/**
 * Identifies the most relevant categories based on text content
 * @param {string} text - The text to analyze
 * @returns {string[]} - Array of identified categories
 */
function identifyCategories(text) {
    const categories = [];
    const textLower = text.toLowerCase();
    
    // Check each category for relevant keywords
    const categoryKeywords = {
        technology: ['tech', 'technology', 'software', 'hardware', 'digital', 'app', 'innovation', 'ai', 'data', 'computer', 'code', 'programming', 'cyber', 'internet', 'online'],
        business: ['business', 'company', 'enterprise', 'corporate', 'startup', 'entrepreneurship', 'management', 'leadership', 'strategy', 'organization', 'team', 'office'],
        marketing: ['marketing', 'brand', 'advertis', 'promotion', 'campaign', 'social media', 'content', 'audience', 'customer', 'consumer', 'seo', 'digital marketing'],
        career: ['career', 'job', 'recruit', 'hiring', 'interview', 'resume', 'cv', 'skill', 'workplace', 'profession', 'work', 'employment', 'talent'],
        education: ['education', 'learn', 'teach', 'training', 'school', 'university', 'college', 'course', 'student', 'knowledge', 'skill'],
        health: ['health', 'medical', 'wellness', 'fitness', 'mental health', 'healthcare', 'doctor', 'patient', 'therapy', 'medicine', 'disease', 'treatment'],
        finance: ['finance', 'investment', 'money', 'banking', 'economy', 'stock', 'market', 'financial', 'wealth', 'budget', 'saving', 'fund'],
        productivity: ['productivity', 'efficient', 'time management', 'organization', 'goal', 'planning', 'habit', 'routine', 'focus', 'discipline']
    };
    
    // Score each category based on keyword matches
    const categoryScores = {};
    
    for (const [category, keywords] of Object.entries(categoryKeywords)) {
        categoryScores[category] = 0;
        
        for (const keyword of keywords) {
            // Use regex to find all occurrences (case insensitive)
            const regex = new RegExp(keyword, 'gi');
            const matches = textLower.match(regex);
            
            if (matches) {
                categoryScores[category] += matches.length;
            }
        }
    }
    
    // Sort categories by score and take the top 2
    const sortedCategories = Object.entries(categoryScores)
        .sort((a, b) => b[1] - a[1])
        .filter(([_, score]) => score > 0)
        .map(([category]) => category)
        .slice(0, 2);
    
    // Always include 'general' if we don't have enough categories
    if (sortedCategories.length < 2) {
        sortedCategories.push('general');
    }
    
    return sortedCategories;
}

/**
 * Gets hashtags for identified categories
 * @param {string[]} categories - The identified categories
 * @returns {string[]} - Array of category hashtags without the # symbol
 */
function getCategoryHashtags(categories) {
    const hashtags = [];
    
    categories.forEach(category => {
        if (CATEGORY_HASHTAGS[category]) {
            // Get 2 random hashtags from each identified category
            const selectedTags = getRandomElements(CATEGORY_HASHTAGS[category], 2);
            hashtags.push(...selectedTags);
        }
    });
    
    return hashtags;
}

/**
 * Extracts keywords from text that could make good hashtags
 * @param {string} text - The text to extract keywords from
 * @param {number} maxKeywords - Maximum number of keywords to extract
 * @returns {string[]} - Array of keywords without the # symbol
 */
function extractKeywords(text, maxKeywords) {
    if (!text) return [];
    
    // Remove common symbols and lowercase
    const cleanText = text.toLowerCase()
        .replace(/[^\w\s]/g, '')
        .replace(/\s+/g, ' ')
        .trim();
    
    // Split into words
    const words = cleanText.split(' ');
    
    // Filter out common words and short words
    const commonWords = [
        'the', 'a', 'an', 'and', 'or', 'but', 'in', 'on', 'at', 'to', 'for', 'with',
        'by', 'about', 'as', 'into', 'like', 'through', 'after', 'over', 'between',
        'out', 'against', 'during', 'without', 'before', 'under', 'around', 'among',
        'is', 'are', 'was', 'were', 'be', 'been', 'being', 'have', 'has', 'had',
        'do', 'does', 'did', 'can', 'could', 'will', 'would', 'should', 'might',
        'this', 'that', 'these', 'those', 'it', 'its', 'they', 'them', 'their',
        'he', 'him', 'his', 'she', 'her', 'we', 'us', 'our', 'you', 'your'
    ];
    
    const filteredWords = words.filter(word => 
        word.length > 3 && !commonWords.includes(word)
    );
    
    // Count word frequency
    const wordCounts = {};
    filteredWords.forEach(word => {
        wordCounts[word] = (wordCounts[word] || 0) + 1;
    });
    
    // Sort by frequency
    const sortedWords = Object.entries(wordCounts)
        .sort((a, b) => b[1] - a[1])
        .map(([word]) => word);
    
    // Return the top keywords with no duplicates
    return [...new Set(sortedWords)].slice(0, maxKeywords);
}

/**
 * Generates a hashtag from the article's domain name
 * @param {string} domain - The domain of the article URL
 * @returns {string|null} - A domain-based hashtag without the # symbol
 */
function generateDomainHashtag(domain) {
    if (!domain) return null;
    
    // Remove common subdomains and TLDs
    const parts = domain.split('.');
    let domainName = parts[0];
    
    // If the first part is a subdomain like 'www', use the second part
    if (domainName === 'www' && parts.length > 2) {
        domainName = parts[1];
    }
    
    // Remove common prefixes
    const prefixesToRemove = ['blog', 'news', 'articles', 'posts'];
    prefixesToRemove.forEach(prefix => {
        if (domainName.startsWith(prefix)) {
            domainName = domainName.substring(prefix.length);
        }
    });
    
    // Clean up remaining special characters
    domainName = domainName.replace(/[^\w]/g, '');
    
    // Only return if the domain name is meaningful
    return domainName.length > 2 ? domainName : null;
}

/**
 * Selects best hashtags and formats them
 * @param {string[]} hashtags - Array of potential hashtags
 * @returns {string[]} - Array of formatted hashtags with the # symbol
 */
function selectAndFormatHashtags(hashtags) {
    // Remove duplicates
    const uniqueHashtags = [...new Set(hashtags)];
    
    // Format hashtags: remove spaces, special characters, ensure proper casing
    const formattedHashtags = uniqueHashtags.map(tag => {
        // Skip if empty
        if (!tag) return null;
        
        // Convert to camelCase if multiple words are detected
        if (tag.includes(' ')) {
            return tag
                .split(' ')
                .map((word, index) => {
                    if (index === 0) {
                        return word.toLowerCase();
                    }
                    return word.charAt(0).toUpperCase() + word.slice(1).toLowerCase();
                })
                .join('');
        }
        
        // Otherwise just return the tag lowercase
        return tag.toLowerCase();
    }).filter(tag => tag); // Remove null/empty values
    
    // Select 3-5 hashtags
    const selectedTags = getRandomElements(formattedHashtags, Math.min(5, formattedHashtags.length));
    
    // Add # symbol
    return selectedTags.map(tag => `#${tag}`);
}

/**
 * Gets random elements from an array
 * @param {Array} array - The source array
 * @param {number} count - Number of elements to get
 * @returns {Array} - Array of random elements
 */
function getRandomElements(array, count) {
    // Shuffle array
    const shuffled = [...array].sort(() => 0.5 - Math.random());
    // Get first n elements
    return shuffled.slice(0, count);
}
