/**
 * Image Generator Module
 * Integrates with OpenAI API to generate images based on article content
 */

/**
 * Generates an image based on the article content and selected tone
 * @param {Object} articleData - The extracted article data
 * @param {string} tone - The selected tone for the post
 * @param {string} apiKey - OpenAI API key
 * @returns {Promise<string>} - A promise that resolves to a base64-encoded image
 */
export async function generateImage(articleData, tone, apiKey) {
    // Prepare a prompt based on article content and tone
    const prompt = generateImagePrompt(articleData, tone);
    
    try {
        return await callOpenAIAPI(prompt, apiKey);
    } catch (error) {
        console.error('Error generating image:', error);
        throw error;
    }
}

/**
 * Calls the OpenAI API to generate an image
 * @param {string} prompt - The image generation prompt
 * @param {string} apiKey - OpenAI API key
 * @returns {Promise<string>} - A promise that resolves to a base64-encoded image
 */
async function callOpenAIAPI(prompt, apiKey) {
    const url = 'https://api.openai.com/v1/images/generations';
    
    console.log('Preparing to call OpenAI API...');
    console.log('Prompt length:', prompt.length);
    console.log('Prompt preview:', prompt.substring(0, 100) + (prompt.length > 100 ? '...' : ''));
    
    // Ensure the prompt isn't too long (DALL-E 3 has a 4000 character limit)
    const truncatedPrompt = prompt.substring(0, 4000);
    
    const headers = {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${apiKey}`,
        'OpenAI-Beta': 'assistants=v1'  // Some endpoints might need this header
    };
    
    const requestBody = {
        model: 'dall-e-3',
        prompt: truncatedPrompt,
        n: 1,
        size: '1024x1024',
        quality: 'standard',
        response_format: 'b64_json'
    };
    
    console.log('Sending request to:', url);
    console.log('Request headers:', JSON.stringify({
        'Content-Type': 'application/json',
        'Authorization': 'Bearer [REDACTED]',
        'OpenAI-Beta': 'assistants=v1'
    }, null, 2));
    
    console.log('Request body:', JSON.stringify({
        ...requestBody,
        prompt: requestBody.prompt.substring(0, 100) + '...' // Only show preview of prompt
    }, null, 2));
    
    try {
        console.log('Sending request to OpenAI API...');
        const startTime = Date.now();
        
        const response = await fetch(url, {
            method: 'POST',
            headers: headers,
            body: JSON.stringify(requestBody)
        });
        
        const responseTime = Date.now() - startTime;
        console.log(`Request completed in ${responseTime}ms`);
        console.log('Response status:', response.status, response.statusText);
        
        const responseText = await response.text();
        console.log('Raw response (first 500 chars):', responseText.substring(0, 500));
        
        let responseData;
        try {
            responseData = JSON.parse(responseText);
        } catch (e) {
            console.error('Failed to parse response as JSON. Response:', responseText);
            throw new Error('Invalid JSON response from OpenAI API');
        }
        
        if (!response.ok) {
            console.error('API Error Response:', responseData);
            const errorMessage = responseData.error?.message || 
                              responseData.error?.error?.message || 
                              'Failed to generate image';
            const errorType = responseData.error?.type || 'unknown_error';
            throw new Error(`OpenAI API Error (${errorType}): ${errorMessage} (Status: ${response.status})`);
        }
        
        if (!responseData.data || !Array.isArray(responseData.data) || responseData.data.length === 0) {
            console.error('Unexpected response format - missing data array:', responseData);
            throw new Error('No image data in API response');
        }
        
        const imageData = responseData.data[0];
        if (!imageData.b64_json) {
            console.error('Unexpected image data format:', imageData);
            throw new Error('Invalid image data format in API response');
        }
        
        console.log('Successfully received image data');
        return imageData.b64_json;
    } catch (error) {
        console.error('Error calling OpenAI API:', error);
        throw error;
    }
}

/**
 * Generates a prompt for image creation based on article content and tone
 * @param {Object} articleData - The extracted article data
 * @param {string} tone - The selected tone
 * @returns {string} - The generated prompt
 */
function generateImagePrompt(articleData, tone) {
    // Extract key information from the article
    const { title, keyPoints } = articleData;
    
    // Base prompt structure
    let prompt = `Create a professional LinkedIn post image related to "${title}". `;
    
    // Add key points if available
    if (keyPoints && keyPoints.length > 0) {
        const keyPoint = keyPoints[0]; // Use the first key point
        prompt += `The image should illustrate this key concept: "${keyPoint}". `;
    }
    
    // Add tone-specific guidance
    switch (tone) {
        case 'insightful':
            prompt += 'Style: Clean, thoughtful, intellectual visual with muted professional colors. Include subtle visual metaphors or data visualization elements. Perfect for thought leadership.';
            break;
        case 'witty':
            prompt += 'Style: Light-hearted, clever visual with bright colors and a touch of humor. Can include visual wordplay or unexpected elements while remaining professional.';
            break;
        case 'provocative':
            prompt += 'Style: Bold, striking visual with high contrast. Create something that challenges conventional thinking while remaining professional and LinkedIn-appropriate.';
            break;
        case 'formal':
            prompt += 'Style: Elegant, corporate visual with traditional business colors (blues, grays). Clean lines, professional imagery, possibly including subtle business iconography.';
            break;
        case 'casual':
            prompt += 'Style: Friendly, approachable visual with warm colors. Should feel conversational and relatable while maintaining professionalism.';
            break;
        default:
            prompt += 'Style: Professional, clean visual suitable for LinkedIn, with balanced composition and clear focal point.';
    }
    
    // Add general requirements for LinkedIn
    prompt += ' The image should be high-quality, visually appealing, and suitable for a professional context. No text overlay needed. Create it in a LinkedIn post aspect ratio.';
    
    return prompt;
}

/**
 * Downloads the generated image
 * @param {string} base64Data - The base64-encoded image data
 * @param {string} fileName - The file name for the downloaded image
 */
export function downloadImage(base64Data, fileName = 'linkedin-post-image.png') {
    const link = document.createElement('a');
    link.href = `data:image/png;base64,${base64Data}`;
    link.download = fileName;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
}
