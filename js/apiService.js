/**
 * API Service Module
 * Handles all API calls to external services like OpenAI
 */

/**
 * Generates a LinkedIn post using OpenAI's API
 * @param {string} articleContent - The content of the article to summarize
 * @param {string} tone - The desired tone for the post
 * @param {string} apiKey - OpenAI API key
 * @returns {Promise<string>} - The generated post content
 */
export async function generatePostWithAI(articleContent, tone, apiKey) {
    console.log('generatePostWithAI called with tone:', tone, 'and API key:', apiKey ? '***' + apiKey.slice(-4) : 'Not provided');
    
    if (!apiKey) {
        console.error('No API key provided to generatePostWithAI');
        throw new Error('OpenAI API key is required');
    }
    
    if (!articleContent) {
        console.error('No article content provided to generatePostWithAI');
        throw new Error('Article content is required');
    }
    
    const url = 'https://api.openai.com/v1/chat/completions';
    
    // Prepare the prompt based on the selected tone
    const prompt = `Create a LinkedIn post in a ${tone} tone based on the following article. 
    Make it engaging, professional, and suitable for a business audience. 
    Include a hook at the beginning and a call-to-action at the end.\n\n` +
                 `Article content:\n${articleContent.substring(0, 12000)}`; // Limit content length
    
    console.log('Sending request to OpenAI API...');
    
    try {
        const response = await fetch(url, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${apiKey}`
            },
            body: JSON.stringify({
                model: 'gpt-3.5-turbo', // Changed from gpt-4 to gpt-3.5-turbo for broader compatibility
                messages: [
                    {
                        role: 'system',
                        content: 'You are a professional LinkedIn content creator. Create engaging, professional posts based on the provided article content.'
                    },
                    {
                        role: 'user',
                        content: prompt
                    }
                ],
                temperature: 0.7,
                max_tokens: 1000
            })
        });

        console.log('OpenAI API response status:', response.status);
        
        const responseData = await response.json();
        console.log('OpenAI API response data:', responseData);

        if (!response.ok) {
            const errorMessage = responseData.error?.message || 'Failed to generate post';
            console.error('OpenAI API error:', errorMessage);
            throw new Error(errorMessage);
        }

        const result = responseData.choices[0]?.message?.content || 'Failed to generate post';
        console.log('Successfully generated post');
        return result;
    } catch (error) {
        console.error('Error generating post with OpenAI:', error);
        throw new Error(`Error generating post: ${error.message}`);
    }
}

/**
 * Generates hashtags using OpenAI's API
 * @param {string} postContent - The post content to generate hashtags for
 * @param {string} apiKey - OpenAI API key
 * @returns {Promise<string[]>} - Array of generated hashtags
 */
export async function generateHashtagsWithAI(postContent, apiKey) {
    const url = 'https://api.openai.com/v1/chat/completions';
    
    try {
        const response = await fetch(url, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${apiKey}`
            },
            body: JSON.stringify({
                model: 'gpt-3.5-turbo',
                messages: [
                    {
                        role: 'system',
                        content: 'You are a social media expert. Generate 3-5 relevant hashtags for the given LinkedIn post. Return only the hashtags, separated by spaces.'
                    },
                    {
                        role: 'user',
                        content: `Generate 3-5 relevant hashtags for this LinkedIn post:\n\n${postContent}`
                    }
                ],
                temperature: 0.3,
                max_tokens: 100
            })
        });

        if (!response.ok) {
            const errorData = await response.json();
            console.error('Error generating hashtags:', errorData);
            return [];
        }

        const data = await response.json();
        const hashtagsText = data.choices[0]?.message?.content || '';
        
        // Extract hashtags from the response
        return hashtagsText
            .split(' ')
            .filter(tag => tag.startsWith('#'))
            .map(tag => tag.startsWith('#') ? tag : `#${tag}`)
            .slice(0, 5); // Limit to 5 hashtags max
    } catch (error) {
        console.error('Error generating hashtags with OpenAI:', error);
        return [];
    }
}
