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

| Service | Usage |
|---|---|
| **Google Gemini 2.0 Flash** | Core AI chat — election Q&A, explanations, civic guidance |
| **Google Fonts** | Inter + Outfit typefaces for premium typography |
| **Google AI Studio** | API key provisioning link within the app |

---

## 🛡️ Security & Best Practices

- **API Key Storage**: Keys stored in `sessionStorage` only (cleared on tab close, never in localStorage or cookies)
- **Input Sanitization**: All user input and AI output is HTML-sanitized before rendering
- **Rate Limiting**: Built-in retry logic with exponential backoff
- **Request Timeout**: 30-second timeout prevents hanging requests
- **Safety Settings**: Gemini safety filters configured at `BLOCK_MEDIUM_AND_ABOVE`
- **CSP-Ready**: No inline event handlers in JS; all listeners attached programmatically

---

## ♿ Accessibility

- Full **keyboard navigation** throughout
- **ARIA labels** on all interactive elements
- **Live regions** for dynamic content announcements
- **Skip to content** link for screen reader users
- **High contrast mode** toggle in footer
- **Larger text** toggle in footer
- Semantic HTML5 elements (`<nav>`, `<main>`, `<article>`, `<aside>`, `<footer>`)
- Color contrast ratios meeting WCAG AA standards

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
