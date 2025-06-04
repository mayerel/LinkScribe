/**
 * Post Generator Module
 * Responsible for generating LinkedIn posts based on article content and tone
 */

// Define tone personas
const tonePersonas = {
    insightful: {
        intros: [
            "Just read a thought-provoking article on",
            "This piece offers compelling insights on",
            "An interesting analysis about",
            "Key takeaways from this insightful read on",
            "This article presents a fascinating perspective on",
        ],
        transitions: [
            "What stood out to me was",
            "The most valuable insight is",
            "I found it particularly interesting that",
            "Worth noting that",
            "The research indicates that",
            "The implications of this are significant:"
        ],
        closings: [
            "This has important ramifications for our industry.",
            "How might this shape our approach moving forward?",
            "What are your thoughts on these findings?",
            "These insights could transform how we think about this topic.",
            "I'm curious how others are interpreting these developments."
        ],
        wordChoices: {
            positive: ["insightful", "compelling", "valuable", "thought-provoking", "significant", "essential", "strategic"],
            verbs: ["reveals", "demonstrates", "highlights", "indicates", "suggests", "establishes", "illustrates"]
        },
        useEmojis: false,
        usesQuestions: true,
        structureBias: "logical"
    },
    
    witty: {
        intros: [
            "Well, this article just blew my mind about",
            "Just when you thought you knew everything about",
            "In today's episode of 'Things I Didn't Know I Needed To Know':",
            "Plot twist in the world of",
            "I didn't have '[TOPIC]' on my bingo card today, but here we are!"
        ],
        transitions: [
            "The fun part? Apparently,",
            "Here's the kicker:",
            "Spoiler alert:",
            "Wait for it...",
            "And yes, before you ask:"
        ],
        closings: [
            "Who else is feeling slightly smarter after reading this? 🧠",
            "File this under 'surprisingly useful information'!",
            "And that's my daily dose of '[TOPIC]' knowledge. You're welcome! 😉",
            "Does anyone else find this as amusingly interesting as I do?",
            "Like and comment if you also didn't see that coming!"
        ],
        wordChoices: {
            positive: ["fascinating", "mind-blowing", "game-changing", "surprising", "clever", "brilliant"],
            verbs: ["shakes up", "transforms", "flips", "reimagines", "challenges"]
        },
        useEmojis: true,
        usesQuestions: true,
        structureBias: "conversational"
    },
    
    provocative: {
        intros: [
            "This article challenges everything we thought we knew about",
            "Controversial take on",
            "Here's why the conventional wisdom on [TOPIC] might be wrong:",
            "Time to rethink our assumptions about",
            "This might ruffle some feathers, but this article on [TOPIC] raises valid points:"
        ],
        transitions: [
            "Consider this perspective:",
            "The uncomfortable truth is",
            "What if we've been looking at this all wrong?",
            "This raises a critical question:",
            "Here's the perspective many are missing:"
        ],
        closings: [
            "Is it time we reconsider our approach to this?",
            "What side of this debate are you on?",
            "The status quo needs challenging. Agree or disagree?",
            "This could be a turning point in how we view [TOPIC]. Thoughts?",
            "Let's have an honest conversation about this in the comments."
        ],
        wordChoices: {
            positive: ["challenging", "bold", "unconventional", "radical", "daring", "critical"],
            verbs: ["confronts", "challenges", "questions", "disrupts", "overturns", "exposes"]
        },
        useEmojis: false,
        usesQuestions: true,
        structureBias: "challenging"
    },
    
    formal: {
        intros: [
            "I recently reviewed an informative article regarding",
            "The following article presents a comprehensive analysis of",
            "A recent publication provides valuable insights on",
            "An examination of [TOPIC] reveals important considerations:",
            "The attached reference material addresses significant developments in"
        ],
        transitions: [
            "The article details that",
            "According to the research,",
            "The findings indicate",
            "It is noteworthy that",
            "Of particular importance is"
        ],
        closings: [
            "This information may be valuable for professionals in the field.",
            "I recommend reviewing the complete article for additional context.",
            "Please consider these points in relation to current industry standards.",
            "This represents a significant development that warrants attention.",
            "I welcome professional perspectives on these findings."
        ],
        wordChoices: {
            positive: ["significant", "substantial", "noteworthy", "considerable", "valuable", "pertinent"],
            verbs: ["indicates", "demonstrates", "presents", "establishes", "validates", "confirms"]
        },
        useEmojis: false,
        usesQuestions: false,
        structureBias: "structured"
    },
    
    casual: {
        intros: [
            "Just came across this cool article about",
            "Hey connections! Check out what I learned about",
            "This is pretty interesting - an article on",
            "Been reading up on [TOPIC] and found this gem:",
            "So, here's something neat I discovered about"
        ],
        transitions: [
            "The cool thing is",
            "I really liked how",
            "What caught my attention was",
            "It's pretty amazing that",
            "The best part?"
        ],
        closings: [
            "What do you all think about this?",
            "Love to hear your thoughts on this!",
            "Has anyone else read about this lately?",
            "Anyone else find this as interesting as I do?",
            "Drop a comment if you've had similar experiences! 👇"
        ],
        wordChoices: {
            positive: ["awesome", "amazing", "great", "cool", "interesting", "fantastic"],
            verbs: ["shows", "talks about", "breaks down", "explains", "covers"]
        },
        useEmojis: true,
        usesQuestions: true,
        structureBias: "flowing"
    }
};

/**
 * Generates a LinkedIn post based on article data and selected tone
 * @param {Object} articleData - The extracted article data
 * @param {string} tone - The selected tone for the post
 * @returns {string} - The generated LinkedIn post
 */
export function generatePost(articleData, tone) {
    // Get the appropriate persona for the selected tone
    const persona = tonePersonas[tone] || tonePersonas.insightful;
    
    // Prepare key components for the post
    const intro = selectIntro(persona, articleData);
    const body = generateBody(persona, articleData);
    const closing = selectClosing(persona, articleData);
    
    // Combine components to create the post
    let post = `${intro}\n\n${body}\n\n${closing}`;
    
    // Add article link
    post += `\n\n${articleData.url}`;
    
    // Limit post to LinkedIn's character limit (approx. 1300 characters)
    if (post.length > 1300) {
        post = post.substring(0, 1290) + '...';
    }
    
    return post;
}

/**
 * Selects an introduction for the post based on persona and article data
 * @param {Object} persona - The tone persona
 * @param {Object} articleData - The article data
 * @returns {string} - The introduction
 */
function selectIntro(persona, articleData) {
    // Randomly select an intro template
    const introTemplate = persona.intros[Math.floor(Math.random() * persona.intros.length)];
    
    // Replace [TOPIC] with article title/topic if present
    let intro = introTemplate.replace('[TOPIC]', extractTopic(articleData));
    
    // If the intro doesn't already contain the topic, append it
    if (!introTemplate.includes('[TOPIC]') && !intro.endsWith(':')) {
        intro += ` ${articleData.title}.`;
    } else if (intro.endsWith(':')) {
        intro += ` ${articleData.title}`;
    }
    
    // Add emoji if persona uses emojis
    if (persona.useEmojis) {
        intro += selectEmoji(articleData);
    }
    
    return intro;
}

/**
 * Generates the body of the post based on persona and article key points
 * @param {Object} persona - The tone persona
 * @param {Object} articleData - The article data
 * @returns {string} - The post body
 */
function generateBody(persona, articleData) {
    // Get key points from article
    const { keyPoints } = articleData;
    
    // If no key points, generate a generic summary
    if (!keyPoints || keyPoints.length === 0) {
        return `The article discusses ${extractTopic(articleData)} and provides valuable insights for those interested in this subject.`;
    }
    
    // Select 1-2 key points based on available content
    const numPoints = Math.min(keyPoints.length, 2);
    const selectedPoints = keyPoints.slice(0, numPoints);
    
    // Generate paragraph based on persona style
    let body = '';
    
    // Add transition phrase if provided by persona
    if (persona.transitions && persona.transitions.length > 0) {
        const transition = persona.transitions[Math.floor(Math.random() * persona.transitions.length)];
        body += transition + ' ';
    }
    
    // Add key points with the persona's style
    selectedPoints.forEach((point, index) => {
        // Rephrase the point slightly based on persona's word choices
        const rephrased = rephraseWithPersona(point, persona);
        
        // Add point to body
        body += rephrased;
        
        // Add spacing between points
        if (index < selectedPoints.length - 1) {
            body += '\n\n';
            
            // Add another transition for the second point
            if (persona.transitions && persona.transitions.length > 0) {
                const transition = persona.transitions[Math.floor(Math.random() * persona.transitions.length)];
                body += transition + ' ';
            }
        }
    });
    
    return body;
}

/**
 * Selects a closing for the post based on persona and article data
 * @param {Object} persona - The tone persona
 * @param {Object} articleData - The article data
 * @returns {string} - The closing
 */
function selectClosing(persona, articleData) {
    // Randomly select a closing template
    const closingTemplate = persona.closings[Math.floor(Math.random() * persona.closings.length)];
    
    // Replace [TOPIC] with article topic if present
    const closing = closingTemplate.replace('[TOPIC]', extractTopic(articleData));
    
    return closing;
}

/**
 * Extracts the main topic from article data
 * @param {Object} articleData - The article data
 * @returns {string} - The main topic
 */
function extractTopic(articleData) {
    // Simple implementation - extract topic from title
    const title = articleData.title || '';
    
    // Remove common filler words
    const fillers = ['the', 'a', 'an', 'how', 'why', 'what', 'when', 'where', 'to', 'in', 'on', 'for', 'with', 'and', 'or', 'but'];
    const words = title.split(' ');
    
    // Filter out short words and filler words
    const significantWords = words.filter(word => 
        word.length > 3 && !fillers.includes(word.toLowerCase())
    );
    
    // If we have significant words, join the first few, otherwise use title
    if (significantWords.length > 0) {
        return significantWords.slice(0, 3).join(' ');
    }
    
    return title;
}

/**
 * Rephrases text using the persona's style
 * @param {string} text - The text to rephrase
 * @param {Object} persona - The tone persona
 * @returns {string} - Rephrased text
 */
function rephraseWithPersona(text, persona) {
    // This is a simplified implementation of rephrasing
    // In a more advanced version, this could use NLP techniques
    
    // For now, we'll just make minor adjustments based on persona style
    let result = text;
    
    // Replace some common verbs with persona's preferred verbs
    const commonVerbs = ['shows', 'says', 'states', 'explains', 'mentions'];
    
    commonVerbs.forEach(verb => {
        if (result.includes(` ${verb} `)) {
            const replacement = getRandomElement(persona.wordChoices.verbs);
            result = result.replace(` ${verb} `, ` ${replacement} `);
        }
    });
    
    // Add persona flair based on structureBias
    switch (persona.structureBias) {
        case 'logical':
            // For logical structure, ensure sentences are clear
            if (!result.endsWith('.')) {
                result += '.';
            }
            break;
        case 'conversational':
            // For conversational, maybe add a question
            if (persona.usesQuestions && Math.random() > 0.7) {
                result += ` Isn't that interesting?`;
            }
            break;
        case 'challenging':
            // For challenging, add a provocative question
            if (persona.usesQuestions && Math.random() > 0.7) {
                result += ` Does this challenge what you thought you knew?`;
            }
            break;
        case 'flowing':
            // For flowing, more casual tone
            if (Math.random() > 0.7) {
                result += ` Pretty cool, right?`;
            }
            break;
    }
    
    // Add emojis for personas that use them
    if (persona.useEmojis && Math.random() > 0.7) {
        result += ` ${selectEmoji({})}`;
    }
    
    return result;
}

/**
 * Selects a random element from an array
 * @param {Array} array - The array to select from
 * @returns {*} - A random element
 */
function getRandomElement(array) {
    return array[Math.floor(Math.random() * array.length)];
}

/**
 * Selects an appropriate emoji based on article content
 * @param {Object} articleData - The article data
 * @returns {string} - Selected emoji
 */
function selectEmoji(articleData) {
    // List of general-purpose emojis
    const generalEmojis = ['💡', '✨', '👍', '🔍', '📊', '📈', '🚀', '💼', '📱', '💻', '🌟'];
    
    // Topic-specific emojis - could be expanded to be more intelligent
    const topicEmojis = {
        'technology': ['💻', '📱', '🤖', '🔧', '⚙️'],
        'business': ['💼', '📊', '💰', '🏢', '📈'],
        'health': ['🏥', '❤️', '🧠', '💪', '🥗'],
        'science': ['🔬', '🧪', '🧫', '🔭', '🧬'],
        'environment': ['🌍', '🌱', '🌿', '♻️', '🌊'],
        'education': ['📚', '🎓', '✏️', '📝', '🧮'],
        'marketing': ['📣', '📱', '📊', '🎯', '💡']
    };
    
    // Simple topic detection
    const title = (articleData.title || '').toLowerCase();
    let selectedEmojis = generalEmojis;
    
    // Check if title contains any known topics
    for (const [topic, emojis] of Object.entries(topicEmojis)) {
        if (title.includes(topic)) {
            selectedEmojis = emojis;
            break;
        }
    }
    
    // Select random emoji from the chosen set
    return selectedEmojis[Math.floor(Math.random() * selectedEmojis.length)];
}
