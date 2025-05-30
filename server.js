const express = require('express');
const cors = require('cors');
const fetch = require('node-fetch');
const { JSDOM } = require('jsdom');
const path = require('path');

const app = express();
const PORT = process.env.PORT || 3000;

// Middleware
app.use(cors());
app.use(express.json());
app.use(express.static('.'));

// API endpoint to fetch and parse articles
app.post('/api/fetch-article', async (req, res) => {
    try {
        const { url } = req.body;
        
        if (!url) {
            return res.status(400).json({ error: 'URL is required' });
        }

        // Fetch the article
        const response = await fetch(url, {
            headers: {
                'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36',
                'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,image/webp,*/*;q=0.8'
            }
        });

        if (!response.ok) {
            throw new Error(`HTTP error! status: ${response.status}`);
        }

        const html = await response.text();
        
        // Parse the HTML
        const dom = new JSDOM(html);
        const doc = dom.window.document;
        
        // Extract article content (you might need to adjust these selectors based on the website)
        const article = doc.querySelector('article') || 
                        doc.querySelector('.post-content') || 
                        doc.querySelector('.article-content') ||
                        doc.querySelector('main');
        
        if (!article) {
            throw new Error('Could not find article content');
        }
        
        // Clean up the content
        article.querySelectorAll('script, style, iframe, noscript, nav, footer, .ad, .sidebar, .related-posts').forEach(el => el.remove());
        
        // Return the cleaned HTML
        res.json({
            title: doc.title,
            content: article.innerHTML,
            text: article.textContent.trim()
        });
        
    } catch (error) {
        console.error('Error fetching article:', error);
        res.status(500).json({ 
            error: 'Failed to fetch the article',
            details: error.message
        });
    }
});

// Serve the main HTML file for all other routes
app.get('*', (req, res) => {
    res.sendFile(path.join(__dirname, 'app.html'));
});

// Start the server
app.listen(PORT, () => {
    console.log(`Server is running on http://localhost:${PORT}`);
});
