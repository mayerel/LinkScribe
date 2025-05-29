# LinkScribe

![LinkScribe](https://img.shields.io/badge/LinkScribe-1.1-blue)

## Transform Web Articles into Engaging LinkedIn Posts (with AI Images)

LinkScribe is a cutting-edge, client-side web application that empowers users to effortlessly transform web articles into engaging LinkedIn posts—tailored to specific tones, optimized with relevant hashtags, and enhanced with AI-generated companion images.

## New in v1.1

- **Beautiful New Landing Page**: A modern, responsive landing page that explains LinkScribe's features and benefits
- **Enhanced UI/UX**: Completely redesigned interface with smooth animations and intuitive navigation
- **Mobile-First Design**: Fully responsive layout that works perfectly on all devices
- **Improved User Onboarding**: Clear step-by-step process for first-time users
- **Performance Optimizations**: Faster loading times and smoother interactions

---

## Features

- **URL Input & Article Fetching**: Securely fetches article content from a provided URL using client-side capabilities.
- **Tone Selection Engine**: Choose from multiple predefined tones—Insightful, Witty, Provocative, Formal, Casual—each powered by a unique persona algorithm.
- **Intelligent Content Summarization**: Client-side algorithms extract key sentences, concepts, and main arguments from the article.
- **Dynamic Post Generation**: Crafts a compelling LinkedIn post based on extracted information and selected tone, using advanced persona logic.
- **Smart Hashtag Generation**: Suggests 3-5 relevant hashtags based on the article's theme and content.
- **AI Image Generation (OpenAI Integration)**: Optionally generate a professional, tone-matched image for your post using the OpenAI API (DALL·E). Just provide your API key—your key is never stored.
- **One-Click Copy**: Easily copy the generated post, hashtags, or both, as well as download the AI-generated image.
- **Responsive Design**: Fully functional and aesthetically pleasing across desktop, tablet, and mobile devices.
- **Privacy-Focused**: All processing happens in your browser. No data is stored or transmitted to any server except (optionally) directly to OpenAI for image generation.

---

## How It Works

1. **Visit the Landing Page**: Learn about LinkScribe's features and benefits
2. **Click "Generate Post"**: Get started with the post generation tool
3. **Paste an Article URL**: Enter the link to any online article
4. **Select a Tone**: Choose how you want your LinkedIn post to sound
5. **(Optional) Enable Image Generation**: Check the box to create an AI-generated image
6. **Generate**: Click the button to create your LinkedIn post, hashtags, and image
7. **Copy & Download**: Copy your post, hashtags, and download the image for use on LinkedIn

---

## OpenAI Image Generation
- Uses OpenAI's DALL·E API for image creation.
- Image prompts are automatically engineered based on the article content and tone.
- API keys are only used for the current session and never stored.
- See [README_OpenAI_API.md](./README_OpenAI_API.md) for technical details and enhancement ideas.

---

## Browser Compatibility
- Chrome 80+
- Firefox 75+
- Safari 13+
- Edge 80+

## CORS Limitations
Due to browser security restrictions (CORS), LinkScribe may not be able to fetch content from all websites. Some websites specifically block their content from being accessed by external applications.

**Tips:**
- Try news sites and blogs that allow cross-origin requests.
- For broader compatibility, consider using a browser extension or proxy (future feature).

---

## Technology Stack
- HTML5
- CSS3 (Tailwind CSS)
- JavaScript (ES6+)
- OpenAI API (DALL·E) for optional image generation
- GSAP for smooth animations
- Intersection Observer for scroll-based animations
- Mobile-first responsive design

---

## Privacy & Security
- All processing (article parsing, post/hashtag/image generation) occurs in your browser.
- No article content, URLs, or generated posts are transmitted or stored externally.
- OpenAI API keys are never stored and are only used for the current session if image generation is enabled.
- No analytics or tracking is included.

---

## Advanced Concepts
- **Persona Engine**: Each tone is powered by a unique algorithm for varied, high-quality outputs.
- **Emergent Content Variation**: The interaction of different articles and tone personas produces a wide range of post outputs.
- **Prompt Engineering for Images**: Image prompts are dynamically crafted to reflect key article themes and selected tone.

---

## Local Development

To run LinkScribe locally:

1. Clone the repository
2. Open `landing.html` in your browser
3. No build process required - it's all client-side!

## License
MIT License

---

## Credits
Created as a demonstration of advanced client-side web application capabilities with a focus on modern UI/UX principles.

---

## Feedback & Contributions
Feedback, feature requests, and contributions are welcome! Open an issue or submit a pull request.

