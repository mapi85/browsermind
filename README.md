# 🧠 BrowserMind

> Ask in plain language. An AI assistant reads the page you are on, fills it in, and acts on it — from your Chrome side panel.

[![License: MIT](https://img.shields.io/badge/License-MIT-5b4ed8.svg)](LICENSE)
[![Manifest V3](https://img.shields.io/badge/Manifest-V3-4fd1c5.svg)](manifest.json)
[![Version](https://img.shields.io/badge/Version-2.0.0-f6ad55.svg)](manifest.json)

---

## What it does

Open the side panel on any page and say what you want:

```
"Pull every price on this page into a CSV"
→ Reading the page
→ Extracting data · 42 items
→ Creating a file · prices_2026-08-27_14-30-02.csv
```

The assistant reads the page, clicks, types, fills forms, searches the web, looks at
screenshots, and hands you files. It works through your own account with an AI provider —
your key and your conversations stay on your computer.

---

## Install

Load unpacked while the Web Store listing is in review:

1. Download or clone this repository
2. Open `chrome://extensions`
3. Turn on **Developer mode**
4. **Load unpacked** → select the repository folder

Then open the panel, click ⚙, and follow the three-step setup.

Requires Chrome 116 or later.

---

## Setting it up

BrowserMind has no server and no account. It talks directly to the AI provider you choose,
using a key you supply.

1. **Pick a service** — Claude, ChatGPT, Gemini or Mistral are offered up front; DeepSeek,
   Grok, OpenRouter, GLM and any OpenAI- or Anthropic-compatible server are one click away.
2. **Paste your key** — it is verified against the provider immediately, so a wrong key or
   an empty account is reported before you rely on it.
3. **Choose a model** — a short recommended list, with every model your account can reach
   available underneath.

Running a local model works the same way: choose *OpenAI-compatible server* and give the
address up to `/v1` — for example `http://localhost:11434/v1` for Ollama, or
`http://localhost:1234/v1` for LM Studio.

---

## How the agent sees a page

`read_page` returns a numbered list of everything interactive on the page:

```
[0] <a> "Sign in"
[1] <input email> "Email address"
[2] <input password> "Password"
[3] <button> "Continue"
```

Actions then address an element by its number — `click {"element": 3}` — rather than
guessing at a CSS selector. Numbers are reissued after every action, so they always
describe the page as it is now.

### Tools

| | |
|---|---|
| **Read** | `read_page`, `extract_data`, `take_screenshot` (the model looks at the image) |
| **Act** | `click`, `type_text`, `fill_form`, `scroll`, `wait` |
| **Move** | `navigate`, `new_tab` |
| **Produce** | `generate_document` (CSV, HTML, JSON, Markdown, text), `download_file` |
| **Look up** | `web_search`, `api_call` (geocoding, weather) |

---

## What it will not do

- **Leaving the site you are on** asks first. A cross-domain `navigate` shows a
  confirmation; you can allow it permanently in settings.
- **Page text is data, not instructions.** The agent is told to report, not obey, anything
  in page content that tries to redirect it.
- **Credentials, payments and CAPTCHAs** stop the agent, which asks you to take over.
- **If you navigate the tab yourself** while a task is running, the task stops rather than
  continuing on a page the model has never seen.

---

## Privacy

- Your API key, your conversations and the assistant's memory live in `chrome.storage`
  on your machine. Nothing is sent anywhere else.
- Page content goes only to the AI provider you configured, and only for the tab you are
  working on.
- No analytics, no telemetry, no remote configuration, no remote code. Fonts are the
  system's; nothing is fetched from a CDN.

---

## Languages

Interface and assistant replies in **English, French, Spanish, Italian, German and
Portuguese**. The interface follows Chrome's language unless you pick another, and the
assistant's reply language is set separately.

Translations live in [`_locales/`](_locales/) — one `messages.json` per language, the same
files Chrome uses for the Web Store listing.

---

## Project layout

```
browsermind/
├── manifest.json           # MV3 manifest
├── sidepanel.html          # Side panel
├── config.html             # Settings
├── _locales/<lang>/        # All user-facing strings (6 languages)
├── src/
│   ├── background.js       # Service worker: tabs, injection, downloads, HTTP
│   ├── background/
│   │   └── engine.js       # Agent loop — runs in the worker, survives the panel closing
│   ├── panel/main.js       # Side panel view
│   ├── configpage/main.js  # Settings view
│   ├── content.js          # Action highlight overlay, injected on demand
│   └── shared/             # ES modules, no build step
│       ├── tools.js        # Tool definitions (English: the model reads these)
│       ├── llm.js          # Wire formats, history, prompts — pure, unit-tested
│       ├── stream.js       # SSE assembly for both providers
│       ├── providers.js    # Provider catalog, URL resolution, key verification
│       ├── settings.js     # Storage schema
│       ├── i18n.js         # Runtime translation
│       └── icons.js        # SVG set
└── tests/                  # Vitest suite
```

---

## Development

Vanilla JS, HTML and CSS with native ES modules. There is no build step: what is in the
repository is what Chrome loads.

```bash
git clone https://github.com/mapi85/browsermind.git
cd browsermind
npm install
npm test
```

The suite covers the shared core and, because nothing is compiled, also links every entry
point and checks the manifest — a renamed export or a missing file fails a test instead of
a browser reload.

Contributions: fork, branch, commit, open a PR.

---

## Support

BrowserMind is free and open source.

→ **[tools.mapi85.fr/support](https://tools.mapi85.fr/support)**

---

## License

MIT © [mapi85](https://tools.mapi85.fr)
