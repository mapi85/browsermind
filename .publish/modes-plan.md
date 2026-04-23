# BrowserMind — Modes Contextuels

## Version 1.0.0

Les modes contextuels transforment BrowserMind en assistant polyvalent qui s'adapte à votre usage.

---

## Modes disponibles

| Mode | Icone | Usage |
|------|-------|-------|
| 🧭 Libre | `libre` | Mode générique — navigation et actions libres |
| ✈️ Voyage | `voyage` | Planification de voyages, hébergements, transports |
| 🔍 Recherche | `recherche` | Recherche approfondie, synthèse multi-sources |
| 📊 Analyse | `analyse` | Analyse de données, comparaison, tendances |
| 📤 Extraction | `extraction` | Extraction de données structurées, conversion de format |
| 📋 Administratif | `administratif` | Formulaires, démarches administratives |
| 🛒 Shopping | `shopping` | Comparaison de prix, avis, bons plans |
| 📰 Veille | `veille` | Surveillance d'informations, actualités |
| 🍳 Cuisine | `cuisine` | Recettes, conversion de mesures, listes de courses |
| 🏠 Immobilier | `immobilier` | Recherche de biens, comparaison, estimation |
| 💼 Emploi | `emploi` | Recherche d'emploi, candidatures, suivi |
| 🎓 Éducation | `education` | Apprentissage, révisions, cours |

---

## Fonctionnalités

### Mode-bar
Une barre de sélection de mode affiche tous les modes disponibles. Cliquez sur un mode pour :
- Changer le prompt système
- Adapter les outils disponibles
- Modifier les quick actions

### Détection automatique
Le mode peut être détecté automatiquement selon l'URL visitée :
- **Voyage** : booking.com, airbnb.fr, sncf-connect.com, kayak.com...
- **Administratif** : impots.gouv.fr, ameli.fr, service-public.fr...
- **Emploi** : indeed.fr, linkedin.com, pole-emploi.fr...
- **Cuisine** : marmiton.org, 750g.com...
- **Immobilier** : seloger.com, leboncoin.fr/immobilier...
- Etc.

### Quick actions par mode
Chaque mode propose des actions rapides adaptées :
- **Voyage** : Rechercher hébergement, vol, train, plan de voyage
- **Extraction** : Extraire tableau, liste, liens en CSV/JSON
- **Analyse** : Analyser, comparer, générer rapport
- Etc.

### Nouveaux outils

| Outil | Description |
|-------|-------------|
| `api_call` | Appelle des APIs externes (Nominatim, Open-Meteo, DuckDuckGo, REST Countries, Wikidata) |
| `web_search` | Recherche web via DuckDuckGo |
| `new_tab` | Ouvre un nouvel onglet |

---

## Configuration

Dans la page de configuration (⚙), un nouvel onglet **🎯 Modes** permet de :
- Activer/désactiver chaque mode
- Activer la détection automatique par URL
- Voir la liste des modes avec leur description

---

## Pour les développeurs

### Ajouter un nouveau mode

1. Ajouter une entrée dans `src/modes.js` :
```js
monNouveauMode: {
  id: 'monNouveauMode',
  icon: '🎯',
  labelKey: 'modeMonNouveau',
  description: 'Description du mode',
  systemPromptExtra: 'Instructions spécifiques au mode...',
  tools: ['get_page_content', 'navigate', 'generate_document'],
  quickActions: [
    { id: 'action1', labelKey: 'qaAction1', icon: 'zap', prompt: 'Prompt de l\'action' }
  ],
  apis: [],
  urlPatterns: ['exemple.com'],
}
```

2. Ajouter les clés de traduction dans `src/sidepanel.js` (I18N) et `src/config.js` (I18N_CONFIG)

### API externes disponibles

- **nominatim** : Géocodage OpenStreetMap
- **open_meteo** : Données météo
- **duckduckgo** : Recherche web
- **rest_countries** : Informations sur les pays
- **wikidata** : Données structurées Wiki

---

## Notes

- Version de l'extension : 1.0.0
- Les modes sont complètement optionnels — le mode **Libre** conserve le comportement précédent
- La détection automatique peut être désactivée dans la configuration