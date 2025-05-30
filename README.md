# LinkScribe

![LinkScribe](https://img.shields.io/badge/LinkScribe-1.1-blue)
[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](https://opensource.org/licenses/MIT)

## Transform Web Articles into Engaging LinkedIn Posts (with AI Images)

LinkScribe is a cutting-edge, client-side web application that empowers users to effortlessly transform web articles into engaging LinkedIn posts—tailored to specific tones, optimized with relevant hashtags, and enhanced with AI-generated companion images.

## ✨ Features

- **Article URL Processing**: Fetch and parse content from any web article
- **Tone Selection**: Choose from multiple post tones (Insightful, Witty, Provocative, Formal, Casual)
- **AI-Powered Content Generation**: Automatically generates engaging LinkedIn posts
- **Smart Hashtag Generation**: Suggests relevant hashtags based on article content
- **AI Image Generation**: Create custom images using OpenAI's DALL·E (requires API key)
- **Responsive Design**: Works seamlessly on desktop and mobile devices
- **Privacy-Focused**: All processing happens in your browser, no data is stored on our servers

## 🚀 Getting Started

### Prerequisites
- Modern web browser (Chrome, Firefox, Safari, or Edge)
- OpenAI API key (for image generation, optional)

### Local Development

1. Clone the repository:
   ```bash
   git clone https://github.com/yourusername/linkscribe.git
   cd linkscribe
   ```

2. Install dependencies:
   ```bash
   npm install
   ```

3. Start the development server:
   ```bash
   npm run dev
   ```

4. Open your browser and navigate to `http://localhost:3000`

## 🛠️ How to Use

1. **Enter Article URL**: Paste the URL of the article you want to transform
2. **Select Post Tone**: Choose the desired tone for your LinkedIn post
3. **Generate Image (Optional)**: Toggle to enable AI-generated image creation
4. **Click Generate**: Let LinkScribe work its magic
5. **Copy & Share**: Copy your generated post and download the image

## 🔒 Privacy & Security

- All processing happens client-side in your browser
- Your OpenAI API key is only used for the current session and never stored
- No article content, URLs, or generated posts are transmitted or stored externally
- No analytics or tracking is included

## 🌐 Browser Support

- Chrome 80+
- Firefox 75+
- Safari 13+
- Edge 80+

## 📝 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## 🤝 Contributing

Contributions are welcome! Please feel free to submit a Pull Request.

## 📧 Contact

For any questions or feedback, please open an issue on GitHub.

---

Built with ❤️ by Mayer Elharar | linkedin.com/in/mayer-elharar/

---

## 🛠️ Technical Details

### Technology Stack

- **Frontend**:
  - HTML5, CSS3, Vanilla JavaScript (ES6+)
  - [Tailwind CSS](https://tailwindcss.com/) for styling
  - [GSAP](https://greensock.com/gsap/) for smooth animations
  - [Intersection Observer API](https://developer.mozilla.org/en-US/docs/Web/API/Intersection_Observer_API) for scroll-based animations

- **AI & APIs**:
  - [OpenAI API](https://platform.openai.com/docs/api-reference) for image generation (DALL·E)
  - Custom CORS proxy implementation for fetching article content

### Project Structure

```
linkscribe/
├── css/                  # Stylesheets
├── js/                    # JavaScript modules
│   ├── app.js            # Main application logic
│   ├── articleParser.js  # Article parsing and content extraction
│   ├── imageGenerator.js # AI image generation
│   ├── apiService.js     # API communication
│   └── utils.js          # Utility functions
├── components/           # Reusable UI components
├── index.html            # Landing page
├── app.html              # Main application
├── server.js             # Development server
└── package.json          # Project dependencies
```

### CORS Considerations

LinkScribe uses multiple CORS proxy servers to fetch article content. While this works for most websites, some may still block these requests due to their security policies.

### Environment Variables

Create a `.env` file in the root directory with the following variables:

```env
PORT=3000
NODE_ENV=development
```

### Building for Production

1. Minify and bundle assets (if using a build tool)
2. Deploy the `dist` directory to your hosting provider
3. Configure your web server to serve `index.html` for all routes (for SPA routing)

## 🤔 Troubleshooting

### Common Issues

1. **CORS Errors**:
   - Try a different article URL
   - Use a browser extension like "CORS Unblock" for development

2. **Image Generation Fails**:
   - Verify your OpenAI API key is valid
   - Check your API usage limits
   - Ensure you have sufficient credits in your OpenAI account

3. **Article Parsing Issues**:
   - Some websites may use complex JavaScript rendering
   - Try with simpler, text-based articles first

## 📈 Future Enhancements

- [ ] User accounts for saving posts
- [ ] Browser extension for one-click generation
- [ ] More tone and style options
- [ ] Scheduled posting to LinkedIn
- [ ] Analytics dashboard for post performance

## 🙏 Acknowledgments

- [OpenAI](https://openai.com/) for their powerful API
- [Tailwind CSS](https://tailwindcss.com/) for utility-first CSS
- [GSAP](https://greensock.com/gsap/) for buttery smooth animations

## License
MIT License

---

## Credits
Created as a demonstration of advanced client-side web application capabilities with a focus on modern UI/UX principles.

---

## Feedback & Contributions
## 👥 Community & Support

- **GitHub Issues**: For bug reports and feature requests
- **Discord**: Join our community for discussions and support
- **Contributing**: See [CONTRIBUTING.md](CONTRIBUTING.md) for development guidelines

## 📚 Resources

- [API Documentation](docs/API.md)
- [Development Guide](docs/DEVELOPMENT.md)
- [Changelog](CHANGELOG.md)

## 📜 License

This project is open source and available under the [MIT License](LICENSE).

---

Built with ❤️ by Mayer Elharar | linkedin.com/in/mayer-elharar/

