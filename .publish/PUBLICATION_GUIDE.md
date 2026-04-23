# Guide de publication — BrowserMind

## Prérequis

- Un compte **Google Developer** (payant $5 uniques)
- Accès : https://chrome.google.com/webstore/devconsole

---

## 1. Préparation de l'extension

### 1.1. Vérifier le manifest.json

```json
{
  "name": "BrowserMind — AI Navigator",
  "version": "1.0.0",
  "description": "Pilotez votre navigateur avec un assistant IA via un panneau latéral.",
  ...
}
```

**Recommandations :**
- Description courte (≤ 45 chars) : "Extension Chrome IA pour naviguer automatiquement"
- Description longue : 2-4 phrases expliquant les fonctionnalités

### 1.2. Assets requis pour le Store

| Asset | Taille | Usage |
|-------|--------|-------|
| Icône (128×128) | 128×128px | Chrome Web Store |
| Bannière promotionnelle | 440×280px | Optionnel mais recommandé |
| Screenshot #1 | 1280×800px | Required |
| Screenshot #2 | 1280×800px | Required |
| Vidéo (optionnel) | - | Optionnel |

**Note** : Les screenshots doivent montrer l'interface en action. Au minimum 2 screenshots.

### 1.3. Fichiers à exclure du ZIP

Créer un fichier `.zip` propre contenant uniquement :

```
├── manifest.json
├── sidepanel.html
├── config.html
├── icons/
│   ├── icon16.png
│   ├── icon48.png
│   └── icon128.png
└── src/
    ├── background.js
    ├── content.js
    ├── sidepanel.js
    ├── sidepanel.css
    ├── config.js
    ├── config.css
    ├── shared.css
    ├── icons.js
    └── lib/
        └── marked.min.js
```

**Exclure** : `_publish/`, `tools/`, `.kilo/`, `README.md`, fichiers temporaires

---

## 2. Soumission sur le Chrome Web Store

### 2.1. Créer une nouvelle extension

1. Se connecter au [Developer Dashboard](https://chrome.google.com/webstore/devconsole)
2. Cliquer **"New Item"**
3. Upload le fichier `.zip`

### 2.2. Remplir les métadonnées

| Champ | Contenu recommandé |
|-------|-----------------|
| **Nom** | "BrowserMind — AI Navigator" |
| **Description courte** | "Assistant IA pour naviguer automatiquement" |
| **Description longue** | See template ci-dessous |
| **Catégorie** | Productivity |
| **Langue** | English |

**Description longue (template)** :

```
BrowserMind is a Chrome extension that lets you control your browser with an AI assistant.

Key features:
• Multi-provider AI (Anthropic, OpenAI, xAI, Mistral, DeepSeek...)
• Autonomous navigation — the agent clicks, fills forms, and browses for you
• Persistent memory — remembers your preferences
• Multi-tab sessions — separate chat per browser tab
• Privacy-first — runs locally, no tracking

Perfect for: automating repetitive tasks, data extraction, research, form filling, and more.
```

### 2.3. Politique de confidentialité

Pour une extension comme BrowserMind qui accède à toutes les URLs (`<all_urls>`), la politique doit indiquer :

- Les données sont **locales** à l'extension (chrome.storage.local)
- Aucune donnée n'est envoyée vers des serveurs externes sauf vers les API AI configurées par l'utilisateur
- Les clés API sont stockées localement et jamais partagées

**Template** :

```
Privacy Policy

BrowserMind stores all data locally on your device using Chrome's local storage. 
AI API keys are stored locally and never transmitted to any server other than 
the provider you configure (Anthropic, OpenAI, etc.).

We do not collect, track, or share any personal browsing data.
```

### 2.4. Permissions justifications

| Permission | Justification |
|-----------|--------------|
| `activeTab` | Required to interact with the current page |
| `scripting` | Required to inject scripts for page interaction |
| `tabs` | Required to get tab metadata for context |
| `storage` | Required to store settings, providers, memory |
| `<all_urls>` | Required to read/write page content across all sites |
| `alarms` | Required to keep the service worker alive |
| `sidePanel` | Required to show the side panel |
| `clipboardWrite` | Optional, for copying bug reports |

---

## 3. Review et publication

### Délais
- **Initial submission** : 1-3 jours (parfois plus si permissions sensibles)
- **Updates** : quelques heures à 1 jour

### Raisons courantes de rejet

1. **Permissions excessives** — Justifier chaque permission
2. **Fonctionnalité insuffisante** — L'extension doit faire plus que simplement afficher du contenu
3. **Valeur insuffisante** — Doit résoudre un problème réel
4. **Marque** — Ne pas utiliser de marques déposées (Chrome, Google, etc.)

### Points d'attention

- Le reviewer va tester l'extension avec une vraie clé API
- Les fonctionnalités "IA" sont bien reçues si l'usage est clair
- Les permissions `<all_urls>` sont régulièrement demandées — bien expliquer pourquoi

---

## 4. Après publication

### URL du Store
```
https://chrome.google.com/webstore/detail/[ITEM_ID]
```

### Mettre à jour la page tools.mapi85.fr

Une fois publié, mettre à jour le lien "Installer sur Chrome" dans :
- `_publish/tools-website/index.html`

### Versioning

Pour une mise à jour :
1. Bump la version dans `manifest.json` (ex: 5.1.0 → 5.1.1)
2. Renouveler le ZIP
3. Upload via le Developer Dashboard
4. Notes de version dans le champ prévu

---

## Checklist finale

- [ ] Version bump dans manifest.json
- [ ] Description anglais prête
- [ ] Screenshots prêts (1280×800)
- [ ] Icône 128×128 prête
- [ ] ZIP propre (sans fichiers inutiles)
- [ ] Politique de confidentialité prête
- [ ] Justifications des permissions列表prêtes
- [ ] Compte Google Developer actif ($5 payé)
- [ ] Lien "Installer sur Chrome" mis à jour sur tools.mapi85.fr après publication