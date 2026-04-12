# 🧠 BrowserMind — AI-powered browser assistant

> Navigate, extract and automate the web in natural language — right from your Chrome side panel.

[![License: MIT](https://img.shields.io/badge/License-MIT-7c6cff.svg)](LICENSE)
[![Manifest V3](https://img.shields.io/badge/Manifest-V3-4fd1c5.svg)](manifest.json)
[![Version](https://img.shields.io/badge/Version-6.1-f6ad55.svg)](manifest.json)

---

## ✨ What it does

BrowserMind is a Chrome extension that puts an AI agent in your side panel. Tell it what you want in plain language — it navigates, clicks, fills forms, extracts data and generates files for you.

```
"Extract all prices from this page as CSV"
→ 📤 extract_data · table · csv
→ 💾 generate_document · prices-2024-04-13.csv  ✅
```

---

## 🚀 Install

→ **[Chrome Web Store](https://chromewebstore.google.com)** *(link to be updated after publication)*

Or load unpacked in developer mode:
1. Download this repo (or clone it)
2. Open `chrome://extensions`
3. Enable **Developer mode**
4. Click **Load unpacked** → select the repo folder

---

## 🎯 Features

| Feature | Details |
|---|---|
| **12 contextual modes** | Travel, Research, Shopping, Real Estate, Jobs, Education… |
| **14 native tools** | click, type, scroll, navigate, extract, screenshot, web_search… |
| **Multi-provider** | Anthropic, OpenAI, xAI, Mistral, DeepSeek, Gemini, Ollama, OpenRouter… |
| **Extensible tools** | Create custom tools or load a remote registry from any URL |
| **Custom modes** | Create your own modes with custom prompts and tool sets |
| **Multi-tab sessions** | Isolated conversations per tab, up to 10 simultaneous sessions |
| **Native exports** | CSV, HTML, JSON, Markdown, TXT with timestamped filenames |
| **6 languages** | FR, EN, ES, IT, DE, PT |

---

## 🔧 Custom tools

You can create your own tools and share them via a remote JSON registry.  
Full documentation: **[tools.mapi85.fr/browsermind](https://tools.mapi85.fr/browsermind)**

Minimal tool format:
```json
{
  "name": "extract_emails",
  "icon": "📧",
  "label": "Extract emails",
  "description": "Extracts all email addresses visible on the current page.",
  "input_schema": { "type": "object", "properties": {}, "required": [] },
  "executor": "inject",
  "injectScript": "const m=[...document.body.innerText.matchAll(/[\\w.-]+@[\\w.-]+\\.[a-z]{2,}/gi)].map(m=>m[0]); return {emails:[...new Set(m)]};"
}
```

---

## 🌐 Supported providers

| Provider | Type | Base URL needed |
|---|---|---|
| Anthropic (Claude) | Native | No |
| OpenAI (GPT) | Native | No |
| xAI (Grok) | Native | No |
| Mistral | Native | No |
| DeepSeek | Native | No |
| Google Gemini | Native | No |
| Cohere | Native | No |
| OpenRouter | Native | No |
| Z.ai / GLM | Native | No |
| **Ollama** | Custom OpenAI | `http://localhost:11434/v1` |
| **LM Studio** | Custom OpenAI | `http://localhost:1234/v1` |
| Any OpenAI-compatible | Custom OpenAI | Your endpoint `/v1` |
| Any Anthropic-compatible | Custom Anthropic | Your proxy `/v1` |

---

## 📁 Project structure

```
browsermind/
├── manifest.json          # Chrome extension manifest (MV3)
├── sidepanel.html         # Side panel UI entry point
├── config.html            # Settings page
├── src/
│   ├── sidepanel.js       # Side panel logic, agent loop, i18n
│   ├── background.js      # Service worker, tool executor
│   ├── modes.js           # Built-in mode definitions
│   ├── tools-registry.js  # Custom + remote tools system
│   ├── config.js          # Settings page logic
│   ├── icons.js           # SVG icon set
│   ├── sidepanel.css      # Side panel styles
│   ├── config.css         # Settings page styles
│   ├── shared.css         # Shared design tokens
│   ├── content.js         # Content script (page interaction)
│   └── lib/
│       └── marked.min.js  # Markdown renderer
└── icons/                 # Extension icons
```

---

## 🛠️ Development

No build step needed — this is vanilla JS/HTML/CSS.

```bash
git clone https://github.com/YOUR_USERNAME/browsermind.git
cd browsermind
# Load unpacked in chrome://extensions
```

To contribute:
1. Fork the repo
2. Create a branch: `git checkout -b feat/my-feature`
3. Commit: `git commit -m "feat: my feature"`
4. Push and open a PR

---

## ☕ Support

BrowserMind is free and open-source. If it saves you time, consider supporting the project:

→ **[tools.mapi85.fr/support](https://tools.mapi85.fr/support)**

Accepts card payments and crypto (XMR, BTC, ETH).

---

## 📜 License

MIT © [mapi85](https://tools.mapi85.fr)

---

*Made with ☕ and Claude*
