// ═══════════════════════════════════════════════
//  BrowserMind v1.0.0 — Modes Definitions
// ═══════════════════════════════════════════════
// 
// Chaque mode définit le comportement contextualisé de l'agent.
// Pour ajouter un nouveau mode : ajouter un objet dans BrowserMindModes + clés i18n dans sidepanel.js

window.BrowserMindModes = {
  libre: {
    id: 'libre',
    icon: '🧭',
    labelKey: 'modeLibre',
    description: 'Mode générique — navigation et actions libres',
    systemPromptExtra: '',
    tools: ['*'],
    quickActions: [
      { id: 'summarize', labelKey: 'summarize', icon: 'fileText', prompt: 'Résume le contenu de cette page' },
      { id: 'linksCsv', labelKey: 'linksCsv', icon: 'link', prompt: 'Extrais tous les liens importants en CSV' },
      { id: 'table', labelKey: 'table', icon: 'table', prompt: 'Extrais les données sous forme de tableau HTML téléchargeable' },
      { id: 'report', labelKey: 'report', icon: 'code', prompt: 'Génère un rapport HTML de cette page' },
      { id: 'screenshot', labelKey: 'screenshot', icon: 'camera', prompt: 'Prends une capture d\'écran de la page' }
    ],
    apis: [],
    urlPatterns: []
  },

  voyage: {
    id: 'voyage',
    icon: '✈️',
    labelKey: 'modeVoyage',
    description: 'Planification de voyages, hébergements, transports',
    systemPromptExtra: `Tu es un assistant de planification de voyage.
- Recherche et compare les hébergements (booking, airbnb)
- Compare les vols et trains (SNCF, Kayak, Skyscanner)
- Calcule les itinéraires et distances
- Extrait les informations utiles : prix, adresse, horaires
- Génère des tableaux comparatifs et des plans de voyage détaillés
- Exporte les informations en CSV ou HTML structuré`,
    tools: ['navigate', 'get_page_content', 'click', 'type_text', 'scroll', 'extract_data', 'generate_document', 'wait', 'take_screenshot', 'api_call', 'web_search', 'new_tab'],
    quickActions: [
      { id: 'searchHotel', labelKey: 'qaSearchHotel', icon: 'home', prompt: 'Recherche un hébergement sur Booking' },
      { id: 'searchFlight', labelKey: 'qaSearchFlight', icon: 'plane', prompt: 'Recherche un vol sur Kayak' },
      { id: 'searchTrain', labelKey: 'qaSearchTrain', icon: 'train', prompt: 'Recherche un train sur SNCF Connect' },
      { id: 'itinerary', labelKey: 'qaItinerary', icon: 'map', prompt: 'Calcule un itinéraire via Nominatim' },
      { id: 'tripPlan', labelKey: 'qaTripPlan', icon: 'calendar', prompt: 'Génère un plan de voyage HTML structuré' },
      { id: 'exportTrip', labelKey: 'qaExportTrip', icon: 'download', prompt: 'Exporte les infos voyage en CSV' }
    ],
    apis: ['nominatim', 'open_meteo'],
    urlPatterns: ['booking.com', 'airbnb.fr', 'sncf-connect.com', 'kayak.com', 'skyscanner.fr', 'tripadvisor.fr', 'google.com/maps', 'expedia.com', 'hotels.com', 'vol.com', 'trainline.eu']
  },

  recherche: {
    id: 'recherche',
    icon: '🔍',
    labelKey: 'modeRecherche',
    description: 'Recherche approfondie, synthèse multi-sources',
    systemPromptExtra: `Tu es un assistant de recherche.
- Effectue des recherches web pertinentes
- Résume le contenu de plusieurs pages
- Compare et synthétise les informations issues de sources multiples
- Vérifie les informations et identifie les sources fiables
- Génère des rapports de recherche structurés en Markdown ou HTML`,
    tools: ['navigate', 'get_page_content', 'scroll', 'extract_data', 'web_search', 'generate_document', 'new_tab'],
    quickActions: [
      { id: 'webSearch', labelKey: 'qaWebSearch', icon: 'search', prompt: 'Recherche sur le web' },
      { id: 'summarizePage', labelKey: 'qaSummarizePage', icon: 'fileText', prompt: 'Résume cette page' },
      { id: 'deepen', labelKey: 'qaDeepen', icon: 'layers', prompt: 'Approfondis le sujet avec d\'autres sources' },
      { id: 'multiSynth', labelKey: 'qaMultiSynth', icon: 'git-merge', prompt: 'Synthétise les informations de plusieurs pages' },
      { id: 'exportSearch', labelKey: 'qaExportSearch', icon: 'download', prompt: 'Exporte la recherche en Markdown' }
    ],
    apis: ['duckduckgo', 'wikidata'],
    urlPatterns: ['google.com/search', 'wikipedia.org', 'duckduckgo.com', 'bing.com', 'yahoo.com']
  },

  analyse: {
    id: 'analyse',
    icon: '📊',
    labelKey: 'modeAnalyse',
    description: 'Analyse de données, comparaison, tendances',
    systemPromptExtra: `Tu es un analyste de données.
- Analyse le contenu des pages web de manière structurée
- Extrait et compare les données (prix, statistiques, caractéristiques)
- Identifie les tendances et patterns
- Génère des tableaux comparatifs et des rapports d'analyse
- Structure les données en JSON ou CSV pour analyse ultérieure`,
    tools: ['get_page_content', 'extract_data', 'scroll', 'navigate', 'generate_document', 'take_screenshot', 'new_tab'],
    quickActions: [
      { id: 'analyzePage', labelKey: 'qaAnalyzePage', icon: 'bar-chart', prompt: 'Analyse les données de cette page' },
      { id: 'compare', labelKey: 'qaCompare', icon: 'columns', prompt: 'Compare cette page avec une autre' },
      { id: 'dataTable', labelKey: 'qaDataTable', icon: 'table', prompt: 'Extrais en tableau de données' },
      { id: 'analysisReport', labelKey: 'qaAnalysisReport', icon: 'file-text', prompt: 'Génère un rapport d\'analyse HTML' },
      { id: 'exportJSON', labelKey: 'qaExportJSON', icon: 'code', prompt: 'Exporte les données en JSON' }
    ],
    apis: [],
    urlPatterns: []
  },

  extraction: {
    id: 'extraction',
    icon: '📤',
    labelKey: 'modeExtraction',
    description: 'Extraction de données structurées, conversion de format',
    systemPromptExtra: `Tu es un spécialiste d'extraction de données.
- Extrais les données structurées depuis les pages web (tableaux, listes, liens)
- Convertis les données extraites dans le format demandé (CSV, JSON, XML, Markdown)
- Nettoie et valide les données extraites
- Optimise les extractions pour une utilisation en base de données
- Génère des fichiers prêts à l'emploi avec en-têtes appropriés`,
    tools: ['get_page_content', 'extract_data', 'scroll', 'navigate', 'generate_document'],
    quickActions: [
      { id: 'extractTable', labelKey: 'qaExtractTable', icon: 'table', prompt: 'Extrais le tableau en CSV' },
      { id: 'extractList', labelKey: 'qaExtractList', icon: 'list', prompt: 'Extrais la liste en CSV' },
      { id: 'extractLinks', labelKey: 'qaExtractLinks', icon: 'link', prompt: 'Extrais tous les liens en CSV' },
      { id: 'extractJSON', labelKey: 'qaExtractJSON', icon: 'code', prompt: 'Extrais les données en JSON' },
      { id: 'extractMD', labelKey: 'qaExtractMD', icon: 'file-text', prompt: 'Extrais en Markdown structuré' }
    ],
    apis: [],
    urlPatterns: []
  },

  administratif: {
    id: 'administratif',
    icon: '📋',
    labelKey: 'modeAdministratif',
    description: 'Formulaires, démarches administratives, documents',
    systemPromptExtra: `Tu es un assistant administratif.
- Analyse et remplit les formulaires en ligne automatiquement
- Identifie les champs obligatoires et vérifie leur complétion
- Prépare les documents officiels (PDF, HTML imprimable)
- Navigue sur les sites administratifs (impots.gouv, ameli, service-public)
- Prend des captures de justificatifs
- Génère des modèles de courriers ou de demandes`,
    tools: ['get_page_content', 'fill_form', 'click', 'type_text', 'scroll', 'navigate', 'wait', 'take_screenshot', 'generate_document'],
    quickActions: [
      { id: 'fillForm', labelKey: 'qaFillForm', icon: 'edit', prompt: 'Remplis automatiquement le formulaire' },
      { id: 'checkFields', labelKey: 'qaCheckFields', icon: 'check-circle', prompt: 'Vérifie les champs du formulaire' },
      { id: 'screenshot', labelKey: 'qaScreenshot', icon: 'camera', prompt: 'Capture un justificatif' },
      { id: 'exportPDF', labelKey: 'qaExportPDF', icon: 'file', prompt: 'Génère un document imprimable' },
      { id: 'prepareLetter', labelKey: 'qaPrepareLetter', icon: 'mail', prompt: 'Prépare un modèle de courrier' }
    ],
    apis: [],
    urlPatterns: ['impots.gouv.fr', 'ameli.fr', 'service-public.fr', 'franceconnect.gouv.fr', 'caf.fr', 'laposte.fr', 'pole-emploi.fr', 'mon-compte.urssaf.fr']
  },

  shopping: {
    id: 'shopping',
    icon: '🛒',
    labelKey: 'modeShopping',
    description: 'Comparaison de prix, avis, bons plans',
    systemPromptExtra: `Tu es un assistant shopping.
- Compare les prix entre plusieurs sites marchands
- Extrait et analyse les avis clients
- Identifie les meilleures offres qualité/prix
- Suit l'historique des prix si disponible
- Génère des tableaux comparatifs de produits
- Crée des listes de courses ou de souhaits`,
    tools: ['navigate', 'get_page_content', 'click', 'scroll', 'extract_data', 'generate_document', 'take_screenshot', 'web_search'],
    quickActions: [
      { id: 'comparePrice', labelKey: 'qaComparePrice', icon: 'dollar-sign', prompt: 'Compare les prix sur plusieurs sites' },
      { id: 'extractReviews', labelKey: 'qaExtractReviews', icon: 'message-square', prompt: 'Extrais les avis clients' },
      { id: 'bestValue', labelKey: 'qaBestValue', icon: 'award', prompt: 'Identifie le meilleur rapport qualité/prix' },
      { id: 'priceHistory', labelKey: 'qaPriceHistory', icon: 'trending-up', prompt: 'Suit l\'évolution des prix' },
      { id: 'shoppingList', labelKey: 'qaShoppingList', icon: 'shopping-cart', prompt: 'Génère une liste de courses' }
    ],
    apis: [],
    urlPatterns: ['amazon.fr', 'leboncoin.fr', 'cdiscount.com', 'fnac.com', 'rakuten.fr', 'aliexpress.com', 'ebay.fr', 'walmart.com', 'target.com', 'bestbuy.com']
  },

  veille: {
    id: 'veille',
    icon: '📰',
    labelKey: 'modeVeille',
    description: 'Surveillance d\'informations,actualités,alertes',
    systemPromptExtra: `Tu es un assistant de veille.
- Résume l'actualité et les dernières nouvelles
- Surveille un sujet spécifique et alertes sur les nouvelles publications
- Classe les informations par thème ou source
- Effectue des recherches approfondies sur des sujets précis
- Génère des rapports de veille thématiques
- Exporte les articles intéressante en CSV ou HTML`,
    tools: ['navigate', 'get_page_content', 'scroll', 'extract_data', 'generate_document', 'web_search', 'new_tab'],
    quickActions: [
      { id: 'summarizeNews', labelKey: 'qaSummarizeNews', icon: 'newspaper', prompt: 'Résume l\'actualité de cette page' },
      { id: 'watchTopic', labelKey: 'qaWatchTopic', icon: 'eye', prompt: 'Surveille ce sujet (mots-clés)' },
      { id: 'veuilleFolder', labelKey: 'qaVeuilleFolder', icon: 'folder', prompt: 'Génère un classeur de veille HTML' },
      { id: 'exportVeille', labelKey: 'qaExportVeille', icon: 'download', prompt: 'Exporte les articles en CSV' },
      { id: 'deepSearch', labelKey: 'qaDeepSearch', icon: 'search', prompt: 'Recherche approfondie multi-sources' }
    ],
    apis: ['duckduckgo'],
    urlPatterns: ['news.google.com', 'lemonde.fr', 'bbc.com', 'reddit.com', 'medium.com', 'twitter.com', 'linkedin.com', 'lefigaro.fr', '20minutes.fr', 'huffpost.com']
  },

  cuisine: {
    id: 'cuisine',
    icon: '🍳',
    labelKey: 'modeCuisine',
    description: 'Recettes, conversion, listes de courses',
    systemPromptExtra: `Tu es un assistant culinaire.
- Recherche des recettes sur les sites spécialisés
- Extrait les ingrédients et étapes de préparation
- Convertit les quantités (grammes, tasses, températures)
- Génère des listes de courses à partir de plusieurs recettes
- Crée des plans de repas hebdomadaires
- Compile les recettes en format Markdown structuré`,
    tools: ['navigate', 'get_page_content', 'scroll', 'extract_data', 'generate_document'],
    quickActions: [
      { id: 'searchRecipe', labelKey: 'qaSearchRecipe', icon: 'search', prompt: 'Cherche une recette sur Marmiton' },
      { id: 'shoppingList', labelKey: 'qaShoppingListCuisine', icon: 'shopping-cart', prompt: 'Génère une liste de courses' },
      { id: 'convertMeasures', labelKey: 'qaConvertMeasures', icon: 'calculator', prompt: 'Convertis les mesures' },
      { id: 'mealPlan', labelKey: 'qaMealPlan', icon: 'calendar', prompt: 'Crée un plan de repas hebdomadaire' },
      { id: 'exportRecipe', labelKey: 'qaExportRecipe', icon: 'file-text', prompt: 'Exporte la recette en Markdown' }
    ],
    apis: [],
    urlPatterns: ['marmiton.org', '750g.com', 'cuisineaz.com', 'allrecipes.com', 'recettes-jeff.com', 'cuisine.journaldesfemmes.com', 'ptitchef.com']
  },

  immobilier: {
    id: 'immobilier',
    icon: '🏠',
    labelKey: 'modeImmobilier',
    description: 'Recherche de biens, comparaison, estimation',
    systemPromptExtra: `Tu es un assistant immobilier.
- Recherche des biens sur les portails immobiliers
- Extrait les caractéristiques (prix, surface, pièces, localization)
- Compare les annonces entre elles
- Identifie les critères importants pour la sélection
- Génère un tableau de suivi des visites
- Crée des rapports de recherche immobilière`,
    tools: ['navigate', 'get_page_content', 'click', 'scroll', 'extract_data', 'generate_document', 'take_screenshot', 'api_call'],
    quickActions: [
      { id: 'searchProperty', labelKey: 'qaSearchProperty', icon: 'search', prompt: 'Recherche un bien immobilier' },
      { id: 'compareProperties', labelKey: 'qaCompareProperties', icon: 'columns', prompt: 'Compare les annonces' },
      { id: 'estimate', labelKey: 'qaEstimate', icon: 'calculator', prompt: 'Estime la valeur du bien' },
      { id: 'trackingSheet', labelKey: 'qaTrackingSheet', icon: 'list', prompt: 'Génère un tableau de suivi' },
      { id: 'propertyReport', labelKey: 'qaPropertyReport', icon: 'file-text', prompt: 'Génère un rapport de recherche' }
    ],
    apis: ['nominatim'],
    urlPatterns: ['seloger.com', 'leboncoin.fr/immobilier', 'bienici.com', 'pap.fr', 'immobilier.notaires.fr', 'logic-immo.com', 'century21.fr', 'orpi.com', 'laforet.com']
  },

  emploi: {
    id: 'emploi',
    icon: '💼',
    labelKey: 'modeEmploi',
    description: 'Recherche d\'emploi, candidatures, suivi',
    systemPromptExtra: `Tu es un assistant de recherche d'emploi.
- Recherche des offres d'emploi sur les plateformes spécialisées
- Extrait les informations clés des offres (entreprise,薪资, localisation)
- Prépare les CV et lettres de motivation
- Remplit les formulaires de candidature en ligne
- Suit l'avancement des candidatures
- Génère des tableaux de bord de suivi`,
    tools: ['navigate', 'get_page_content', 'click', 'type_text', 'fill_form', 'scroll', 'extract_data', 'generate_document', 'wait'],
    quickActions: [
      { id: 'searchJobs', labelKey: 'qaSearchJobs', icon: 'search', prompt: 'Recherche des offres d\'emploi' },
      { id: 'extractOffers', labelKey: 'qaExtractOffers', icon: 'list', prompt: 'Extrais les offres en CSV' },
      { id: 'prepareApp', labelKey: 'qaPrepareApp', icon: 'file-text', prompt: 'Prépare une candidature' },
      { id: 'fillApplication', labelKey: 'qaFillApplication', icon: 'edit', prompt: 'Remplis le formulaire de candidature' },
      { id: 'trackingBoard', labelKey: 'qaTrackingBoard', icon: 'kanban', prompt: 'Génère un tableau de suivi' }
    ],
    apis: [],
    urlPatterns: ['indeed.fr', 'linkedin.com/jobs', 'pole-emploi.fr', 'glassdoor.fr', 'welcometothejungle.com', 'monster.fr', 'jobteaser.com', 'cadremploi.fr', 'apec.fr']
  },

  education: {
    id: 'education',
    icon: '🎓',
    labelKey: 'modeEducation',
    description: 'Apprentissage, explications, révisions',
    systemPromptExtra: `Tu es un assistant pédagogique.
- Explique les concepts et notions de manière claire
- Résume les cours et documents de formation
- Crée des fiches de révision structurées
- Propose des exercices et quiz
- Recherche des ressources complémentaires
- Génère des supports de révision en Markdown`,
    tools: ['get_page_content', 'scroll', 'navigate', 'generate_document', 'web_search'],
    quickActions: [
      { id: 'explain', labelKey: 'qaExplain', icon: 'help-circle', prompt: 'Explique ce concept' },
      { id: 'summarizeCourse', labelKey: 'qaSummarizeCourse', icon: 'book', prompt: 'Résume ce cours' },
      { id: 'revisionSheet', labelKey: 'qaRevisionSheet', icon: 'clipboard', prompt: 'Crée une fiche de révision' },
      { id: 'deepenLearning', labelKey: 'qaDeepenLearning', icon: 'book-open', prompt: 'Approfondis le sujet' },
      { id: 'generateQuiz', labelKey: 'qaGenerateQuiz', icon: 'check-square', prompt: 'Génère un QCM de révision' }
    ],
    apis: ['wikidata'],
    urlPatterns: ['khan-academy.org', 'coursera.org', 'youtube.com', 'scholar.google.com', 'openclassrooms.com', 'fr.khanacademy.org', ' Udemy.com', 'edx.org', 'fun-mooc.fr']
  }
};

// ═══════════════════════════════════════════════
//  Helper functions
// ═══════════════════════════════════════════════

function getMode(modeId) {
  return BrowserMindModes[modeId] || BrowserMindModes.libre;
}

function getModeTools(modeId) {
  const mode = getMode(modeId);
  if (mode.tools.includes('*')) {
    return getAllTools();
  }
  return getAllTools().filter(t => mode.tools.includes(t.name));
}

function getAllTools() {
  return [
    { name: 'get_page_content', description: 'Obtient le contenu complet de la page', input_schema: { type: 'object', properties: {} } },
    { name: 'click', description: 'Clique sur un élément', input_schema: { type: 'object', properties: { selector: { type: 'string' }, selector_type: { type: 'string', enum: ['css','text','xpath'] } }, required: ['selector'] } },
    { name: 'type_text', description: 'Saisit du texte dans un champ', input_schema: { type: 'object', properties: { selector: { type: 'string' }, text: { type: 'string' }, clear_first: { type: 'boolean' } }, required: ['selector','text'] } },
    { name: 'scroll', description: 'Fait défiler la page', input_schema: { type: 'object', properties: { direction: { type: 'string', enum: ['up','down','top','bottom'] }, amount: { type: 'number' } }, required: ['direction'] } },
    { name: 'navigate', description: 'Navigue vers une URL', input_schema: { type: 'object', properties: { url: { type: 'string' } }, required: ['url'] } },
    { name: 'fill_form', description: 'Remplit plusieurs champs', input_schema: { type: 'object', properties: { fields: { type: 'array', items: { type: 'object', properties: { selector: { type: 'string' }, value: { type: 'string' }, field_type: { type: 'string' } } } }, submit: { type: 'boolean' } }, required: ['fields'] } },
    { name: 'extract_data', description: 'Extrait des données de la page', input_schema: { type: 'object', properties: { data_type: { type: 'string', enum: ['table','list','links','images','custom'] }, selector: { type: 'string' }, format: { type: 'string' } }, required: ['data_type'] } },
    { name: 'generate_document', description: 'Génère et télécharge un document', input_schema: { type: 'object', properties: { format: { type: 'string', enum: ['csv','html','json','md','txt'] }, content: { type: 'string' }, filename: { type: 'string' } }, required: ['format','content','filename'] } },
    { name: 'download_file', description: 'Télécharge un fichier depuis une URL', input_schema: { type: 'object', properties: { url: { type: 'string' }, filename: { type: 'string' } }, required: ['url'] } },
    { name: 'wait', description: 'Attend un élément ou un délai', input_schema: { type: 'object', properties: { selector: { type: 'string' }, milliseconds: { type: 'number' } } } },
    { name: 'take_screenshot', description: 'Capture d\'écran', input_schema: { type: 'object', properties: {} } },
    { name: 'api_call', description: 'Appelle une API externe (géocodage, météo, recherche)', input_schema: { type: 'object', properties: { api: { type: 'string', enum: ['nominatim','open_meteo','duckduckgo','rest_countries','wikidata'] }, endpoint: { type: 'string' }, params: { type: 'object' } }, required: ['api'] } },
    { name: 'web_search', description: 'Recherche sur le web via DuckDuckGo', input_schema: { type: 'object', properties: { query: { type: 'string' }, max_results: { type: 'number' } }, required: ['query'] } },
    { name: 'new_tab', description: 'Ouvre un nouvel onglet', input_schema: { type: 'object', properties: { url: { type: 'string' }, active: { type: 'boolean' } }, required: ['url'] } }
  ];
}

function detectModeFromUrl(url) {
  if (!url) return null;
  for (const [modeId, mode] of Object.entries(BrowserMindModes)) {
    if (mode.urlPatterns && mode.urlPatterns.length > 0) {
      for (const pattern of mode.urlPatterns) {
        if (url.includes(pattern)) {
          return modeId;
        }
      }
    }
  }
  return null;
}