# 🗳️ ElectIQ — Election Process Education Assistant

> **Built for PromptWars Virtual** — A program by Google for Developers (Build With AI)

ElectIQ is an AI-powered, interactive web application that helps users understand the election process, voting timelines, and civic participation in an accessible, engaging way — powered by **Google Gemini AI**.

---

## ✨ Features

| Feature | Description |
|---|---|
| 🤖 **Gemini AI Chat** | Ask any election question and receive clear, unbiased, structured answers |
| 📋 **8-Step Process Guide** | Interactive, filterable cards covering Pre-Election → Election Day → Post-Election |
| 📅 **Interactive Timeline** | Visual election calendar for General, Primary, and Local elections |
| 🧠 **Knowledge Quiz** | 8-question adaptive quiz with instant feedback and explanations |
| 🌍 **Multi-Language Support** | Instant translation to Hindi, Marathi, Bengali, Tamil, Telugu, and more using Google Translate |
| 📖 **Election Glossary** | 20+ searchable election terms with definitions |
| ♿ **Accessibility First** | WCAG-compliant with keyboard nav, ARIA labels, high-contrast mode, large text |

---

## 🚀 Getting Started

### 1. Run Locally

No build tools required! Simply serve the project via any static server:

```bash
# Using npx http-server (recommended)
npx http-server . -p 4200 -o

# Or using Python
python -m http.server 4200
```

Then open: **http://localhost:4200**

### 2. Get Your Gemini API Key

1. Visit [Google AI Studio](https://aistudio.google.com/app/apikey)
2. Sign in with your Google account
3. Create a new API key (free tier available)
4. Paste the key into the **AI Assistant → Settings** panel within the app

---

## 🏗️ Project Structure

```
Prompt-War/
├── index.html              # Main entry point (semantic HTML5, ARIA-complete)
├── css/
│   ├── styles.css          # Core design system, layout, components
│   ├── chat.css            # Chat interface styles
│   ├── timeline.css        # Timeline & quiz styles
│   └── animations.css      # Keyframes, reveal animations, particles
└── js/
    ├── data.js             # All static content (steps, timeline, quiz, glossary)
    ├── gemini.js           # Google Gemini API service (retry, timeout, safety)
    ├── chat.js             # Chat UI module (formatting, copy, export)
    ├── process.js          # Election process cards module
    ├── timeline.js         # Timeline visualization module
    ├── quiz.js             # Interactive quiz module
    ├── glossary.js         # Searchable glossary module
    └── app.js              # Main orchestrator (init, navbar, particles, a11y)
```

---

## 🔧 Google Services Used

- **Google Gemini API (`@google/generative-ai`)**: Powers the core AI chat, multimodal Ballot Analyzer (Gemini Vision), dynamic quiz generation (structured JSON), and personalized civic readiness reports.
- **Google Fonts**: Premium typography using Inter and Outfit.
- **Google AI Studio**: Platform utilized for provisioning access and managing limits.

---

## 🧪 Testing & Code Quality

- **Testing**: Automated test suite implemented using **Jest** (`tests/app.test.js`) to verify Gemini service initialization, retry logic, and HTML sanitization.
- **Code Quality**: Enforced via **ESLint** (`.eslintrc.json`) to maintain strict JavaScript standards and minimize unused variables.
- **Package Management**: Managed via standard `package.json` configurations.

---

## 🛡️ Security & Efficiency

- **Security**: Strict XSS prevention by sanitizing all AI Markdown output before DOM injection. API keys are strictly kept in transient `sessionStorage`. 
- **Efficiency**: Implemented Server-Sent Events (SSE) streaming for real-time AI responses, drastically reducing perceived latency. Built-in exponential backoff prevents 429 Rate Limit failures.

---

## ♿ Accessibility

- **ARIA Attributes**: Full `aria-label`, `aria-live`, and `aria-hidden` support.
- **Keyboard Navigation**: 100% accessible via `Tab` and `Enter`.
- **WCAG Compliant**: High contrast mode, dynamic text scaling, and semantic HTML5 sections.

---

## 🎨 Design System

- **Theme**: Dark mode with deep navy (`#080B1A`) background
- **Primary**: `#6C63FF` (indigo-violet)
- **Accent**: `#F59E0B` (amber) + `#10B981` (emerald)
- **Typography**: Outfit (display) + Inter (body)
- **Effects**: Glassmorphism, animated particles, intersection observer reveals, micro-animations

---

## 📋 Keyboard Shortcuts

| Shortcut | Action |
|---|---|
| `Ctrl + /` or `?` | Focus chat input |
| `Escape` | Close mobile menu |
| `Enter` | Send chat message |
| `Shift + Enter` | New line in chat |
| `Tab` | Navigate all interactive elements |

---

## 📄 License

Educational use only. Not affiliated with any government or political organization.

Built with ❤️ for **PromptWars Virtual** by Google for Developers.
