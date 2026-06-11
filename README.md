# 🧠 BrowserMind — AI-powered browser assistant

> Navigate, extract and automate the web in natural language — right from your Chrome side panel.

[![License: MIT](https://img.shields.io/badge/License-MIT-7c6cff.svg)](LICENSE)
[![Manifest V3](https://img.shields.io/badge/Manifest-V3-4fd1c5.svg)](manifest.json)
[![Version](https://img.shields.io/badge/Version-1.0.0-f6ad55.svg)](manifest.json)

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
| **Multi-provider** | OpenAI, Anthropic, Google, and others — or custom endpoints |
| **Extensible tools** | Create custom tools or load a remote registry from any URL |
| **Custom modes** | Create your own modes with custom prompts and tool sets |
| **Multi-tab sessions** | Isolated conversations per tab, up to 10 simultaneous sessions |
| **Native exports** | CSV, HTML, JSON, Markdown, TXT with timestamped filenames |
| **6 languages** | FR, EN, ES, IT, DE, PT |

---

## 🔧 Custom tools

You can create your own tools and share them via a remote JSON registry.  
Full documentation: **[tools.mapi85.fr/browsermind](https://tools.mapi85.fr/browsermind)**

Minimal tool format (declarative — custom tools configure built-in executors, they never inject remote code):
```json
{
  "name": "weather_lookup",
  "icon": "🌤️",
  "label": "Weather lookup",
  "description": "Gets the current weather for given coordinates.",
  "input_schema": {
    "type": "object",
    "properties": {
      "latitude": { "type": "number" },
      "longitude": { "type": "number" }
    },
    "required": ["latitude", "longitude"]
  },
  "executor": "api_call_ext",
  "api": "open_meteo",
  "endpoint": "/forecast",
  "defaultParams": { "current_weather": true }
}
```

Available executors: `generate_document_ext`, `api_call_ext`, `web_search_ext` — all map to native, reviewed code paths.

---

## 🌐 Supported providers

BrowserMind works with major AI providers including OpenAI, Anthropic, Google, and others. You can use native integrations for popular services or configure custom endpoints for any OpenAI-compatible or Anthropic-compatible API (local servers, self-hosted instances, etc.).

---

## 📁 Project structure

```
browsermind/
├── manifest.json            # Chrome extension manifest (MV3)
├── sidepanel.html           # Side panel UI entry point
├── config.html              # Settings page
├── src/
│   ├── background.js        # Service worker: tool executor + message hub
│   ├── background/
│   │   └── engine.js        # Agent loop (runs in the SW — tasks survive panel close)
│   ├── panel/
│   │   └── main.js          # Side panel view (renders engine state)
│   ├── configpage/
│   │   └── main.js          # Settings page logic
│   ├── shared/              # Single-source modules (ESM, no build step)
│   │   ├── i18n.js          # All UI strings (6 languages)
│   │   ├── providers.js     # Provider catalog: endpoints, preset models
│   │   ├── llm.js           # Pure wire-format + prompt logic (unit-tested)
│   │   ├── modes.js         # Built-in mode definitions
│   │   ├── tools.js         # Native/custom/remote tool registry
│   │   ├── settings.js      # Storage schema + loader
│   │   └── icons.js         # SVG icon set
│   ├── content.js           # Highlight/toast helper (injected on demand)
│   ├── sidepanel.css        # Side panel styles
│   ├── config.css           # Settings page styles
│   ├── shared.css           # Shared design tokens
│   └── lib/marked.min.js    # Markdown renderer
├── tests/                   # Vitest suite for src/shared
└── icons/                   # Extension icons
```

---

## 🛠️ Development

No build step needed — this is vanilla JS/HTML/CSS (native ES modules).

```bash
git clone https://github.com/mapi85/browsermind.git
cd browsermind
# Load unpacked in chrome://extensions
```

Run the unit tests (shared core logic):

```bash
npm install
npm test
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
