# 🤖 LLM-Book: AI Document Chat Application

<div align="center">
  
![Status](https://img.shields.io/badge/Status-Active-brightgreen)
![Version](https://img.shields.io/badge/Version-1.0.0-blue)
![License](https://img.shields.io/badge/License-MIT-yellow)

**An intelligent document chat application that allows users to upload PDFs and text content, then interact with their documents through an AI-powered chat interface.**

*Built with Next.js, LangChain, and OpenAI*

[🚀 Quick Start](#-quick-start) • [📖 Usage](#usage) • [🛠️ Tech Stack](#️-tech-stack) • [🤝 Contributing](#-contributing)

</div>

---

## ✨ Features

| Feature | Description |
|---------|-------------|
| 📄 **Multi-Format Support** | Upload PDF files and direct text input |
| 🔍 **Intelligent Indexing** | Automatic text extraction and vector embeddings |
| 💬 **AI Chat Interface** | Ask questions about your uploaded content |
| ⚡ **Fast Search** | Semantic search through documents using vector similarity |
| 🎨 **Modern UI** | Clean, responsive interface inspired by NotebookLM |
| ☁️ **Cloud Ready** | Deployable on Vercel with environment configuration |

## 🛠️ Tech Stack

### Frontend
- **Next.js 15.4.7** - React framework with App Router
- **React 19.1.0** - UI library
- **Lucide React** - Beautiful icons
- **Custom CSS** - Styling (TailwindCSS removed for deployment compatibility)

### Backend & AI
- **LangChain** - Document processing and AI orchestration
- **OpenAI API** - Embeddings (`text-embedding-3-large`) and Chat (`gpt-4o-mini`)
- **Qdrant** - Vector database for document storage
- **pdf-parse** - PDF text extraction

### Deployment
- **Vercel** - Hosting and serverless functions
- **Qdrant Cloud** - Hosted vector database

## 🚀 Quick Start

### Prerequisites

Node.js 18+
npm or yarn
OpenAI API key
Qdrant instance (local or cloud)


### Installation

1. **Clone the repository**
git clone https://github.com/your-username/llm-book.git
cd llm-book

2. **Install dependencies**
npm install --legacy-peer-deps

3. **Set up environment variables**
cp .env.example .env.local

Then add your keys:
OPENAI_API_KEY=your_openai_api_key_here

4. **Start Qdrant (if using locally)**
docker run -p 6333:6333 qdrant/qdrant

5. **Run the development server**
npm run dev

6. **Open your browser**

Navigate to `http://localhost:3000` 🎉

## 📖 Usage

### 1. Upload Content
- **📄 PDF Upload**: Click "Choose PDF File" to upload documents
- **📝 Text Input**: Paste text directly into the text area

### 2. Chat with Your Documents
- Once content is uploaded and indexed, use the chat interface
- Ask questions about your uploaded content
- Get AI-powered responses based on your documents

### 3. Example Queries
💭 "What are the main topics discussed in this document?"
📊 "Summarize the key findings"
🔍 "What does the document say about [specific topic]?"

## 📁 Project Structure

llm-book/
├── app/
│ ├── api/
│ │ ├── chat/route.js # Chat API endpoint
│ │ ├── indexing/route.js # Text indexing endpoint
│ │ └── upload-pdf/route.js # PDF upload endpoint
│ ├── globals.css # Global styles
│ ├── layout.js # Root layout
│ └── page.js # Main application page
├── .npmrc # npm configuration
├── vercel.json # Vercel deployment config
└── package.json # Dependencies


## 🔧 Development

### Local Development Tips
- Use `npm run dev -- --turbopack` for faster development builds
- Check browser console and Vercel function logs for debugging
- Test API endpoints individually using tools like Postman

### Environment Variables
| Variable | Description | Required |
|----------|-------------|----------|
| `OPENAI_API_KEY` | Your OpenAI API key | ✅ |
| `QDRANT_URL` | Qdrant instance URL | ✅ |
| `QDRANT_API_KEY` | Qdrant API key | ✅ |

## 🐛 Troubleshooting

<details>
<summary><strong>Dependency Conflicts</strong></summary>

**Problem**: npm install fails with peer dependency warnings

**Solution**: 
npm install --legacy-peer-deps  
</details>

<details>
<summary><strong>PDF Upload Fails</strong></summary>

**Possible causes**:
- Check file size (Vercel has limits)
- Verify PDF contains readable text
- Check Qdrant connection

**Solution**: Verify all environment variables are set correctly
</details>

<details>
<summary><strong>Chat Returns No Results</strong></summary>

**Checklist**:
- ✅ Ensure content is uploaded and indexed first
- ✅ Check Qdrant collection exists
- ✅ Verify OpenAI API key is valid
</details>

<details>
<summary><strong>Deployment Fails</strong></summary>

**Debugging steps**:
1. Check environment variables in Vercel dashboard
2. Verify Qdrant Cloud setup
3. Review build logs for specific errors
</details>

## 🚀 Deployment

Deploy to Vercel with one click:

[![Deploy with Vercel](https://vercel.com/button)](https://vercel.com/new/clone?repository-url=https://github.com/your-username/llm-book)

Or manually:
vercel --prod

## 🤝 Contributing

We welcome contributions! Here's how:

1. **Fork** the repository
2. **Create** a feature branch (`git checkout -b feature/amazing-feature`)
3. **Commit** your changes (`git commit -m 'Add amazing feature'`)
4. **Push** to the branch (`git push origin feature/amazing-feature`)
5. **Open** a Pull Request

### Development Guidelines
- Follow existing code style
- Add tests for new features
- Update documentation as needed
- Ensure all tests pass before submitting

## 📄 License

This project is licensed under the **MIT License** - see the [LICENSE](LICENSE) file for details.

## 🙏 Acknowledgments

- 🦜 [LangChain](https://langchain.com/) for document processing capabilities
- 🤖 [OpenAI](https://openai.com/) for powerful AI models
- 🔍 [Qdrant](https://qdrant.tech/) for vector database technology
- ⚛️ [Next.js](https://nextjs.org/) for the amazing React framework

## 📞 Support

Need help? We're here for you!

- 📋 [Check existing issues](https://github.com/Faisal-fz/llm-book/issues)
- 🆕 [Create a new issue](https://github.com/Faisal-fz/llm-book/issues/new)
- 💬 Include error messages and steps to reproduce

---

<div align="center">

**Built with ❤️ by [Faisal Faiz](https://github.com/Faisal-fz)**

⭐ Star this repo if you find it helpful!

</div>
