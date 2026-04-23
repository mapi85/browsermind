// ═══════════════════════════════════════════════
//  BrowserMind 1.0.0 — Side Panel Logic
// ═══════════════════════════════════════════════

// ─── TRANSLATIONS ────────────────────────────────
const I18N = {
  fr: {
    placeholder: 'Que voulez-vous faire sur cette page ?',
    send: 'Envoyer ↗', stop: 'Stop', sendHint: '⏎ Envoyer · Shift+⏎ Nouvelle ligne',
    summarize: 'Résumer', linksCsv: 'Liens CSV', table: 'Tableau', report: 'Rapport HTML', screenshot: 'Screenshot',
    quickPromptSummarize: 'Résume le contenu de cette page',
    quickPromptLinks: 'Extrais tous les liens importants en CSV',
    quickPromptTable: 'Extrais les données sous forme de tableau HTML téléchargeable',
    quickPromptReport: 'Génère un rapport HTML de cette page',
    quickPromptScreenshot: 'Prends une capture d\'écran de la page',
    newChat: 'Nouveau chat', config: 'Configuration', reportBug: 'Signaler un bug',
    apiKeyMissing: 'Clé API manquante pour', clickToConfig: '. Cliquez sur ⚙ pour configurer.',
    themeLight: 'Thème clair/sombre', emptyStateDesc: 'Décrivez ce que vous souhaitez faire.<br>L\'agent naviguera pour vous.',
    bugPanelTitle: '🐛 Signaler un bug', bugDescLabel: 'Description', bugDescPlaceholder: 'Décrivez ce qui s\'est passé...',
    bugLogLabel: 'Log capturé', bugHint: '💡 Cliquez "Copier" puis collez dans Claude pour obtenir de l\'aide.',
    bugCopyBtn: '📋 Copier le rapport', bugCloseBtn: 'Fermer', backToChat: 'Retour au chat',
    noInternet: 'Pas de connexion internet. Vérifiez votre connexion.',
    errorColon: 'Erreur:', fieldNotFound: 'Champ non trouvé:', elementNotFound: 'Élément non trouvé:', notFound: 'Non trouvé',
    noModelSelected: 'Aucun modèle sélectionné', baseUrlNotConfigured: 'URL de base non configurée',
    thinkingThinking: 'En cours de réflexion', thinkingDone: 'Réflexion terminée',
    error: 'Erreur', action: 'Action', emptyState: 'Décrivez ce que vous souhaitez faire sur cette page.<br>L\'agent naviguera pour vous.',
    rateLimit: 'Rate limit. Retry dans', rateLimitWait: 'Rate limit — attente',
    emptyResponse: 'Le modèle ne répond pas avec des actions. Essayez un autre modèle ou provider.',
    refusal: 'Refus du modèle:', noAction: '(pas de réflexion à afficher)',
    actionsInProgress: '(actions en cours...)', done: 'Terminé', iteration: 'Itération',
    maxIterations: 'Limite de', iterationsReached: ' itérations atteinte.', maxIterationsContinue: 'Limite atteinte. Voulez-vous continuer ?', maxIterationsBtn: '▶ Continuer',
    toolLabel: { click:'Clic', type_text:'Saisie', scroll:'Défilement', navigate:'Navigation', get_page_content:'Lecture', fill_form:'Formulaire', extract_data:'Extraction', download_file:'Téléchargement', wait:'Attente', take_screenshot:'Capture', generate_document:'Export' },
    roleLabels: { user: 'Vous', assistant: 'Agent', action: 'Action', error: 'Erreur', system: 'Système', export: 'Export' },
    statusReady: 'Prêt', statusStopping: '⏹ Arrêt demandé…',
    configReloaded: '🔄 Configuration rechargée.',
    provider: 'Provider', model: 'Modèle',
    noKey: 'Clé API manquante pour', configure: '. Cliquez sur ⚙ pour configurer.',
    noModel: 'non configuré', noProvider: '— Configurer un provider (⚙) —',
    noModels: '— configurer les modèles —',
    statusThinking: '— Réflexion…', statusDone: '✅ Terminé', statusActions: '⚡ action(s)…',
    apiError: 'Erreur API:', statusRefusal: '❌ Refus du modèle', statusFailEmpty: '❌ Échec: pas de réponse',
    statusRetry: '🔄 Nouvelle tentative...',
    tab: 'Onglet', chatCleared: 'Chat effacé', noConnexion: 'Pas de connexion internet. Vérifiez votre connexion.',
    stepStatus: { pending: '⏳', success: '✅', error: '❌' },
    thinking: 'Réflexion', inProgress: 'En cours',
    navConfirmTitle: 'Navigation hors de la page',
    navConfirmHint: 'L\'agent souhaite quitter cette page. Autoriser ?',
    navConfirmAlways: 'Toujours autoriser (ne plus demander)',
    navConfirmOk: 'Autoriser',
    navConfirmCancel: 'Annuler',
    footerSupport: '☕ Soutenir',
    mode: 'Mode', modeLibre: 'Libre', modeVoyage: 'Voyage', modeRecherche: 'Recherche',
    modeAnalyse: 'Analyse', modeExtraction: 'Extraction', modeAdministratif: 'Administratif',
    modeShopping: 'Shopping', modeVeille: 'Veille', modeCuisine: 'Cuisine',
    modeImmobilier: 'Immobilier', modeEmploi: 'Emploi', modeEducation: 'Éducation',
    modeAutoDetected: 'Mode détecté automatiquement',
    qaSearchHotel: 'Hébergement', qaSearchFlight: 'Vol', qaSearchTrain: 'Train',
    qaItinerary: 'Itinéraire', qaTripPlan: 'Plan voyage', qaExportTrip: 'Export voyage',
    qaWebSearch: 'Recherche web', qaSummarizePage: 'Résumer', qaDeepen: 'Approfondir',
    qaMultiSynth: 'Synthèse', qaExportSearch: 'Export recherche',
    qaAnalyzePage: 'Analyser', qaCompare: 'Comparer', qaDataTable: 'Tableau',
    qaAnalysisReport: 'Rapport', qaExportJSON: 'Export JSON',
    qaExtractTable: 'Tableau→CSV', qaExtractList: 'Liste→CSV', qaExtractLinks: 'Liens→CSV',
    qaExtractJSON: 'JSON', qaExtractMD: 'Markdown',
    qaFillForm: 'Remplir', qaCheckFields: 'Vérifier', qaScreenshot: 'Capture',
    qaExportPDF: 'PDF', qaPrepareLetter: 'Courrier',
    qaComparePrice: 'Comparer prix', qaExtractReviews: 'Avis', qaBestValue: 'Qualité/prix',
    qaPriceHistory: 'Historique', qaShoppingList: 'Liste courses',
    qaSummarizeNews: 'Actualités', qaWatchTopic: 'Surveiller', qaVeuilleFolder: 'Classeur',
    qaExportVeille: 'Export veille', qaDeepSearch: 'Recherche profonde',
    qaSearchRecipe: 'Recette', qaShoppingListCuisine: 'Courses', qaConvertMeasures: 'Convertir',
    qaMealPlan: 'Plan repas', qaExportRecipe: 'Export recette',
    qaSearchProperty: 'Rechercher', qaCompareProperties: 'Comparer', qaEstimate: 'Estimer',
    qaTrackingSheet: 'Suivi', qaPropertyReport: 'Rapport',
    qaSearchJobs: 'Offres', qaExtractOffers: 'Extraire', qaPrepareApp: 'Candidature',
    qaFillApplication: 'Postuler', qaTrackingBoard: 'Suivi candidat',
    qaExplain: 'Expliquer', qaSummarizeCourse: 'Résumé cours', qaRevisionSheet: 'Fiche révision',
    qaDeepenLearning: 'Approfondir', qaGenerateQuiz: 'Quiz',
  },
  en: {
    placeholder: 'What do you want to do on this page?',
    send: 'Send ↗', stop: 'Stop', sendHint: '⏎ Send · Shift+⏎ New line',
    summarize: 'Summarize', linksCsv: 'Links CSV', table: 'Table', report: 'HTML Report', screenshot: 'Screenshot',
    quickPromptSummarize: 'Summarize the content of this page',
    quickPromptLinks: 'Extract all important links as CSV',
    quickPromptTable: 'Extract data as downloadable HTML table',
    quickPromptReport: 'Generate an HTML report of this page',
    quickPromptScreenshot: 'Take a screenshot of the page',
    newChat: 'New chat', config: 'Configuration', reportBug: 'Report a bug',
    apiKeyMissing: 'Missing API key for', clickToConfig: '. Click on ⚙ to configure.',
    themeLight: 'Light/dark theme', emptyStateDesc: 'Describe what you want to do on this page.<br>The agent will navigate for you.',
    bugPanelTitle: '🐛 Report a bug', bugDescLabel: 'Description', bugDescPlaceholder: 'Describe what happened...',
    bugLogLabel: 'Captured log', bugHint: '💡 Click "Copy" then paste in Claude for help.',
    bugCopyBtn: '📋 Copy report', bugCloseBtn: 'Close', backToChat: 'Back to chat',
    noInternet: 'No internet connection. Check your connection.',
    errorColon: 'Error:', fieldNotFound: 'Field not found:', elementNotFound: 'Element not found:', notFound: 'Not found',
    noModelSelected: 'No model selected', baseUrlNotConfigured: 'Base URL not configured',
    thinkingThinking: 'Thinking...', thinkingDone: 'Thought done',
    error: 'Error', action: 'Action', emptyState: 'Describe what you want to do on this page.<br>The agent will navigate for you.',
    rateLimit: 'Rate limit. Retrying in', rateLimitWait: 'Rate limit — wait',
    emptyResponse: 'Model is not responding with actions. Try another model or provider.',
    refusal: 'Model refusal:', noAction: '(no thinking to display)',
    actionsInProgress: '(actions in progress...)', done: 'Done', iteration: 'Iteration',
    maxIterations: 'Limit of', iterationsReached: ' iterations reached.', maxIterationsContinue: 'Limit reached. Continue?', maxIterationsBtn: '▶ Continue',
    toolLabel: { click:'Click', type_text:'Type', scroll:'Scroll', navigate:'Navigate', get_page_content:'Read', fill_form:'Form', extract_data:'Extract', download_file:'Download', wait:'Wait', take_screenshot:'Screenshot', generate_document:'Export' },
    roleLabels: { user: 'You', assistant: 'Agent', action: 'Action', error: 'Error', system: 'System', export: 'Export' },
    statusReady: 'Ready', statusStopping: '⏹ Stop requested…',
    configReloaded: '🔄 Configuration reloaded.',
    provider: 'Provider', model: 'Model',
    noKey: 'Missing API key for', configure: '. Click on ⚙ to configure.',
    noModel: 'not configured', noProvider: '— Configure a provider (⚙) —',
    noModels: '— configure models —',
    statusThinking: '— Thinking…', statusDone: '✅ Done', statusActions: '⚡ action(s)…',
    apiError: 'API Error:', statusRefusal: '❌ Model refusal', statusFailEmpty: '❌ Failed: no response',
    statusRetry: '🔄 Retrying...',
    tab: 'Tab', chatCleared: 'Chat cleared', noConnexion: 'No internet connection. Check your connection.',
    stepStatus: { pending: '⏳', success: '✅', error: '❌' },
    thinking: 'Thinking', inProgress: 'In progress',
    navConfirmTitle: 'Navigation away from page',
    navConfirmHint: 'The agent wants to leave this page. Allow it?',
    navConfirmAlways: 'Always allow (don\'t ask again)',
    navConfirmOk: 'Allow',
    navConfirmCancel: 'Cancel',
    footerSupport: '☕ Support',
    mode: 'Mode', modeLibre: 'Free', modeVoyage: 'Travel', modeRecherche: 'Research',
    modeAnalyse: 'Analysis', modeExtraction: 'Extraction', modeAdministratif: 'Admin',
    modeShopping: 'Shopping', modeVeille: 'Monitoring', modeCuisine: 'Cooking',
    modeImmobilier: 'Real Estate', modeEmploi: 'Jobs', modeEducation: 'Education',
    modeAutoDetected: 'Auto-detected mode',
    qaSearchHotel: 'Accommodation', qaSearchFlight: 'Flight', qaSearchTrain: 'Train',
    qaItinerary: 'Itinerary', qaTripPlan: 'Trip plan', qaExportTrip: 'Export trip',
    qaWebSearch: 'Web search', qaSummarizePage: 'Summarize', qaDeepen: 'Deepen',
    qaMultiSynth: 'Synthesis', qaExportSearch: 'Export search',
    qaAnalyzePage: 'Analyze', qaCompare: 'Compare', qaDataTable: 'Table',
    qaAnalysisReport: 'Report', qaExportJSON: 'Export JSON',
    qaExtractTable: 'Table→CSV', qaExtractList: 'List→CSV', qaExtractLinks: 'Links→CSV',
    qaExtractJSON: 'JSON', qaExtractMD: 'Markdown',
    qaFillForm: 'Fill form', qaCheckFields: 'Check fields', qaScreenshot: 'Screenshot',
    qaExportPDF: 'PDF', qaPrepareLetter: 'Letter',
    qaComparePrice: 'Compare prices', qaExtractReviews: 'Reviews', qaBestValue: 'Best value',
    qaPriceHistory: 'Price history', qaShoppingList: 'Shopping list',
    qaSummarizeNews: 'News', qaWatchTopic: 'Monitor', qaVeuilleFolder: 'Folder',
    qaExportVeille: 'Export monitoring', qaDeepSearch: 'Deep search',
    qaSearchRecipe: 'Recipe', qaShoppingListCuisine: 'Grocery list', qaConvertMeasures: 'Convert',
    qaMealPlan: 'Meal plan', qaExportRecipe: 'Export recipe',
    qaSearchProperty: 'Search', qaCompareProperties: 'Compare', qaEstimate: 'Estimate',
    qaTrackingSheet: 'Tracking sheet', qaPropertyReport: 'Report',
    qaSearchJobs: 'Job offers', qaExtractOffers: 'Extract', qaPrepareApp: 'Application',
    qaFillApplication: 'Apply', qaTrackingBoard: 'Tracking board',
    qaExplain: 'Explain', qaSummarizeCourse: 'Course summary', qaRevisionSheet: 'Revision sheet',
    qaDeepenLearning: 'Deepen', qaGenerateQuiz: 'Quiz',
  },
  es: {
    placeholder: '¿Qué quieres hacer en esta página?',
    send: 'Enviar ↗', stop: 'Parar', sendHint: '⏎ Enviar · Shift+⏎ Nueva línea',
    summarize: 'Resumir', linksCsv: 'Enlaces CSV', table: 'Tabla', report: 'Informe HTML', screenshot: 'Captura',
    quickPromptSummarize: 'Resume el contenido de esta página',
    quickPromptLinks: 'Extrae todos los enlaces importantes en CSV',
    quickPromptTable: 'Extrae los datos en forma de tabla HTML descargable',
    quickPromptReport: 'Genera un informe HTML de esta página',
    quickPromptScreenshot: 'Toma una captura de pantalla de la página',
    newChat: 'Nuevo chat', config: 'Configuración', reportBug: 'Reportar un bug',
    apiKeyMissing: 'Falta clave API para', clickToConfig: '. Clic en ⚙ para configurar.',
    themeLight: 'Tema claro/oscuro', emptyStateDesc: 'Describe lo que quieres hacer en esta página.<br>El agente navegará por ti.',
    bugPanelTitle: '🐛 Reportar un bug', bugDescLabel: 'Descripción', bugDescPlaceholder: 'Describe lo que pasó...',
    bugLogLabel: 'Log capturado', bugHint: '💡 Haz clic en "Copiar" luego pega en Claude para obtener ayuda.',
    bugCopyBtn: '📋 Copiar informe', bugCloseBtn: 'Cerrar', backToChat: 'Volver al chat',
    noInternet: 'Sin conexión a internet.',
    errorColon: 'Error:', fieldNotFound: 'Campo no encontrado:', elementNotFound: 'Elemento no encontrado:', notFound: 'No encontrado',
    thinkingThinking: 'Pensando...', thinkingDone: 'Pensamiento terminado',
    error: 'Error', action: 'Acción', emptyState: 'Describe lo que quieres hacer en esta página.<br>El agente navegará por ti.',
    rateLimit: 'Límite. Reintento en', rateLimitWait: 'Límite — espera',
    emptyResponse: 'El modelo no responde con acciones. Prueba otro modelo o proveedor.',
    refusal: 'Rechazo del modelo:', noAction: '(no hay reflexión)',
    actionsInProgress: '(acciones en progreso...)', done: 'Hecho', iteration: 'Iteración',
    maxIterations: 'Límite de', iterationsReached: ' iteraciones alcanzadas.', maxIterationsContinue: 'Límite alcanzado. ¿Continuar?', maxIterationsBtn: '▶ Continuar',
    toolLabel: { click:'Clic', type_text:'Escribir', scroll:'Desplazar', navigate:'Navegar', get_page_content:'Leer', fill_form:'Formulario', extract_data:'Extraer', download_file:'Descargar', wait:'Esperar', take_screenshot:'Captura', generate_document:'Exportar' },
    roleLabels: { user: 'Tú', assistant: 'Agente', action: 'Acción', error: 'Error', system: 'Sistema', export: 'Exportar' },
    statusReady: 'Listo', statusStopping: '⏹ Parada solicitada…',
    configReloaded: '🔄 Configuración recargada.',
    provider: 'Proveedor', model: 'Modelo',
    noKey: 'Falta clave API para', configure: '. Clic en ⚙ para configurar.',
    noModel: 'no configurado', noProvider: '— Configurar proveedor (⚙) —',
    noModels: '— configurar modelos —',
    statusThinking: '— Pensando…', statusDone: '✅ Hecho', statusActions: '⚡ acción(es)…',
    apiError: 'Error API:', statusRefusal: '❌ Rechazo del modelo', statusFailEmpty: '❌ Error: sin respuesta',
    statusRetry: '🔄 Reintentando...',
    noModelSelected: 'Ningún modelo seleccionado', baseUrlNotConfigured: 'URL base no configurada',
    tab: 'Pestaña', chatCleared: 'Chat borrado', noConnexion: 'Sin conexión a internet.',
    stepStatus: { pending: '⏳', success: '✅', error: '❌' },
    thinking: 'Pensando', inProgress: 'En progreso',
    navConfirmTitle: 'Navegación fuera de la página',
    navConfirmHint: 'El agente quiere abandonar esta página. ¿Permitir?',
    navConfirmAlways: 'Siempre permitir (no preguntar más)',
    navConfirmOk: 'Permitir',
    navConfirmCancel: 'Cancelar',
    footerSupport: '☕ Apoyar',
    mode: 'Modo', modeLibre: 'Libre', modeVoyage: 'Viaje', modeRecherche: 'Búsqueda',
    modeAnalyse: 'Análisis', modeExtraction: 'Extracción', modeAdministratif: 'Admin',
    modeShopping: 'Compras', modeVeille: 'Vigilancia', modeCuisine: 'Cocina',
    modeImmobilier: 'Inmobiliaria', modeEmploi: 'Empleo', modeEducation: 'Educación',
    modeAutoDetected: 'Modo detectado automáticamente',
    qaSearchHotel: 'Alojamiento', qaSearchFlight: 'Vuelo', qaSearchTrain: 'Tren',
    qaItinerary: 'Itinerario', qaTripPlan: 'Plan de viaje', qaExportTrip: 'Exportar viaje',
    qaWebSearch: 'Búsqueda web', qaSummarizePage: 'Resumir', qaDeepen: 'Profundizar',
    qaMultiSynth: 'Síntesis', qaExportSearch: 'Exportar búsqueda',
    qaAnalyzePage: 'Analizar', qaCompare: 'Comparar', qaDataTable: 'Tabla',
    qaAnalysisReport: 'Informe', qaExportJSON: 'Exportar JSON',
    qaExtractTable: 'Tabla→CSV', qaExtractList: 'Lista→CSV', qaExtractLinks: 'Links→CSV',
    qaExtractJSON: 'JSON', qaExtractMD: 'Markdown',
    qaFillForm: 'Rellenar', qaCheckFields: 'Verificar', qaScreenshot: 'Captura',
    qaExportPDF: 'PDF', qaPrepareLetter: 'Carta',
    qaComparePrice: 'Comparar precios', qaExtractReviews: 'Reseñas', qaBestValue: 'Calidad/precio',
    qaPriceHistory: 'Historial', qaShoppingList: 'Lista compras',
    qaSummarizeNews: 'Noticias', qaWatchTopic: 'Vigilar', qaVeuilleFolder: 'Carpeta',
    qaExportVeille: 'Exportar vigilancia', qaDeepSearch: 'Búsqueda profunda',
    qaSearchRecipe: 'Receta', qaShoppingListCuisine: 'Compras', qaConvertMeasures: 'Convertir',
    qaMealPlan: 'Plan comidas', qaExportRecipe: 'Exportar receta',
    qaSearchProperty: 'Buscar', qaCompareProperties: 'Comparar', qaEstimate: 'Estimar',
    qaTrackingSheet: 'Seguimiento', qaPropertyReport: 'Informe',
    qaSearchJobs: 'Ofertas', qaExtractOffers: 'Extraer', qaPrepareApp: 'Candidatura',
    qaFillApplication: 'Postular', qaTrackingBoard: 'Panel seguimiento',
    qaExplain: 'Explicar', qaSummarizeCourse: 'Resumen curso', qaRevisionSheet: 'Ficha revisión',
    qaDeepenLearning: 'Profundizar', qaGenerateQuiz: 'Quiz',
  },
  it: {
    placeholder: 'Cosa vuoi fare su questa pagina?',
    send: 'Invia ↗', stop: 'Stop', sendHint: '⏎ Invia · Shift+⏎ Nuova riga',
    summarize: 'Riassumi', linksCsv: 'Link CSV', table: 'Tabella', report: 'Rapporto HTML', screenshot: 'Screenshot',
    quickPromptSummarize: 'Riassumi il contenuto di questa pagina',
    quickPromptLinks: 'Estrai tutti i link importanti in CSV',
    quickPromptTable: 'Estrai i dati in forma di tabella HTML scaricabile',
    quickPromptReport: 'Genera un rapporto HTML di questa pagina',
    quickPromptScreenshot: 'Fai uno screenshot della pagina',
    newChat: 'Nuova chat', config: 'Configurazione', reportBug: 'Segnala un bug',
    apiKeyMissing: 'Manca chiave API per', clickToConfig: '. Clic su ⚙ per configurare.',
    themeLight: 'Tema chiaro/scuro', emptyStateDesc: 'Descrivi cosa vuoi fare su questa pagina.<br>L\'agente navigherà per te.',
    bugPanelTitle: '🐛 Segnala un bug', bugDescLabel: 'Descrizione', bugDescPlaceholder: 'Descrivi cosa è successo...',
    bugLogLabel: 'Log catturato', bugHint: '💡 Clicca "Copia" poi incolla in Claude per ottenere aiuto.',
    bugCopyBtn: '📋 Copia rapporto', bugCloseBtn: 'Chiudi', backToChat: 'Torna alla chat',
    noInternet: 'Nessuna connessione internet.',
    errorColon: 'Errore:', fieldNotFound: 'Campo non trovato:', elementNotFound: 'Elemento non trovato:', notFound: 'Non trovato',
    thinkingThinking: 'Pensando...', thinkingDone: 'Pensiero completato',
    error: 'Errore', action: 'Azione', emptyState: 'Descrivi cosa vuoi fare su questa pagina.<br>L\'agente navigherà per te.',
    rateLimit: 'Rate limit. Riprovo in', rateLimitWait: 'Rate limit — attesa',
    emptyResponse: 'Il modello non risponde con azioni. Prova un altro modello o provider.',
    refusal: 'Rifiuto del modello:', noAction: '(nessun pensiero da mostrare)',
    actionsInProgress: '(azioni in corso...)', done: 'Fatto', iteration: 'Iterazione',
    maxIterations: 'Limite di', iterationsReached: ' iterazioni raggiunto.', maxIterationsContinue: 'Limite raggiunto. Continuare?', maxIterationsBtn: '▶ Continua',
    toolLabel: { click:'Clic', type_text:'Scrivi', scroll:'Scorri', navigate:'Naviga', get_page_content:'Leggi', fill_form:'Modulo', extract_data:'Estrai', download_file:'Scarica', wait:'Aspetta', take_screenshot:'Screenshot', generate_document:'Esporta' },
    roleLabels: { user: 'Tu', assistant: 'Agente', action: 'Azione', error: 'Errore', system: 'Sistema', export: 'Esporta' },
    statusReady: 'Pronto', statusStopping: '⏹ Arresto richiesto…',
    configReloaded: '🔄 Configurazione ricaricata.',
    provider: 'Provider', model: 'Modello',
    noKey: 'Manca chiave API per', configure: '. Clic su ⚙ per configurare.',
    noModel: 'non configurato', noProvider: '— Configura provider (⚙) —',
    noModels: '— configura modelli —',
    statusThinking: '— Pensando…', statusDone: '✅ Fatto', statusActions: '⚡ azione(i)…',
    apiError: 'Errore API:', statusRefusal: '❌ Rifiuto del modello', statusFailEmpty: '❌ Errore: nessuna risposta',
    statusRetry: '🔄 Riprovando...',
    noModelSelected: 'Nessun modello selezionato', baseUrlNotConfigured: 'URL base non configurato',
    tab: 'Scheda', chatCleared: 'Chat cancellato', noConnexion: 'Nessuna connessione internet.',
    stepStatus: { pending: '⏳', success: '✅', error: '❌' },
    thinking: 'Pensando', inProgress: 'In corso',
    navConfirmTitle: 'Navigazione fuori dalla pagina',
    navConfirmHint: 'L\'agente vuole lasciare questa pagina. Consentire?',
    navConfirmAlways: 'Consenti sempre (non chiedere più)',
    navConfirmOk: 'Consenti',
    navConfirmCancel: 'Annulla',
    footerSupport: '☕ Sostieni',
    mode: 'Modalità', modeLibre: 'Libero', modeVoyage: 'Viaggio', modeRecherche: 'Ricerca',
    modeAnalyse: 'Analisi', modeExtraction: 'Estrazione', modeAdministratif: 'Amministrativo',
    modeShopping: 'Shopping', modeVeille: 'Monitoraggio', modeCuisine: 'Cucina',
    modeImmobilier: 'Immobiliare', modeEmploi: 'Lavoro', modeEducation: 'Educazione',
    modeAutoDetected: 'Modalità rilevata automaticamente',
    qaSearchHotel: 'Alloggio', qaSearchFlight: 'Volo', qaSearchTrain: 'Treno',
    qaItinerary: 'Itinerario', qaTripPlan: 'Piano viaggio', qaExportTrip: 'Esporta viaggio',
    qaWebSearch: 'Ricerca web', qaSummarizePage: 'Riassumi', qaDeepen: 'Approfondisci',
    qaMultiSynth: 'Sintesi', qaExportSearch: 'Esporta ricerca',
    qaAnalyzePage: 'Analizza', qaCompare: 'Confronta', qaDataTable: 'Tabella',
    qaAnalysisReport: 'Rapporto', qaExportJSON: 'Esporta JSON',
    qaExtractTable: 'Tabella→CSV', qaExtractList: 'Lista→CSV', qaExtractLinks: 'Link→CSV',
    qaExtractJSON: 'JSON', qaExtractMD: 'Markdown',
    qaFillForm: 'Compila', qaCheckFields: 'Verifica', qaScreenshot: 'Cattura',
    qaExportPDF: 'PDF', qaPrepareLetter: 'Lettera',
    qaComparePrice: 'Confronta prezzi', qaExtractReviews: 'Recensioni', qaBestValue: 'Qualità/prezzo',
    qaPriceHistory: 'Storico prezzi', qaShoppingList: 'Lista spesa',
    qaSummarizeNews: 'Notizie', qaWatchTopic: 'Monitora', qaVeuilleFolder: 'Cartella',
    qaExportVeille: 'Esporta monitoraggio', qaDeepSearch: 'Ricerca approfondita',
    qaSearchRecipe: 'Ricetta', qaShoppingListCuisine: 'Spesa', qaConvertMeasures: 'Converti',
    qaMealPlan: 'Piano pasti', qaExportRecipe: 'Esporta ricetta',
    qaSearchProperty: 'Cerca', qaCompareProperties: 'Confronta', qaEstimate: 'Stima',
    qaTrackingSheet: 'Foglio tracciamento', qaPropertyReport: 'Rapporto',
    qaSearchJobs: 'Offerte', qaExtractOffers: 'Estrai', qaPrepareApp: 'Candidatura',
    qaFillApplication: 'Candidati', qaTrackingBoard: 'Dashboard',
    qaExplain: 'Spiega', qaSummarizeCourse: 'Riassunto corso', qaRevisionSheet: 'Scheda revisione',
    qaDeepenLearning: 'Approfondisci', qaGenerateQuiz: 'Quiz',
  },
  de: {
    placeholder: 'Was möchten Sie auf dieser Seite tun?',
    send: 'Senden ↗', stop: 'Stopp', sendHint: '⏎ Senden · Shift+⏎ Neue Zeile',
    summarize: 'Zusammenfassen', linksCsv: 'Links CSV', table: 'Tabelle', report: 'HTML-Bericht', screenshot: 'Screenshot',
    quickPromptSummarize: 'Zusammenfassung des Seiteninhalts',
    quickPromptLinks: 'Alle wichtigen Links als CSV extrahieren',
    quickPromptTable: 'Daten als herunterladbare HTML-Tabelle extrahieren',
    quickPromptReport: 'HTML-Bericht dieser Seite erstellen',
    quickPromptScreenshot: 'Screenshot der Seite aufnehmen',
    newChat: 'Neuer Chat', config: 'Konfiguration', reportBug: 'Bug melden',
    apiKeyMissing: 'API-Schlüssel fehlt für', clickToConfig: '. Klicken Sie auf ⚙ zum Konfigurieren.',
    themeLight: 'Hell/Dunkel Modus', emptyStateDesc: 'Beschreiben Sie, was Sie auf dieser Seite tun möchten.<br>Der Agent navigiert für Sie.',
    bugPanelTitle: '🐛 Bug melden', bugDescLabel: 'Beschreibung', bugDescPlaceholder: 'Beschreiben Sie, was passiert ist...',
    bugLogLabel: 'Erfasstes Log', bugHint: '💡 Klicken Sie auf "Kopieren" und fügen Sie es in Claude ein, um Hilfe zu erhalten.',
    bugCopyBtn: '📋 Bericht kopieren', bugCloseBtn: 'Schließen', backToChat: 'Zurück zum Chat',
    noInternet: 'Keine Internetverbindung.',
    errorColon: 'Fehler:', fieldNotFound: 'Feld nicht gefunden:', elementNotFound: 'Element nicht gefunden:', notFound: 'Nicht gefunden',
    thinkingThinking: 'Denke...', thinkingDone: 'Nachdenken beendet',
    error: 'Fehler', action: 'Aktion', emptyState: 'Beschreiben Sie, was Sie auf dieser Seite tun möchten.<br>Der Agent navigiert für Sie.',
    rateLimit: 'Rate limit. Wiederhole in', rateLimitWait: 'Rate limit — warte',
    emptyResponse: 'Modell antwortet nicht mit Aktionen. Versuchen Sie ein anderes Modell oder Provider.',
    refusal: 'Modell Verweigerung:', noAction: '(kein Denken anzuzeigen)',
    actionsInProgress: '(Aktionen in Arbeit...)', done: 'Fertig', iteration: 'Iteration',
    maxIterations: 'Grenze von', iterationsReached: ' Iterationen erreicht.', maxIterationsContinue: 'Grenze erreicht. Fortfahren?', maxIterationsBtn: '▶ Fortfahren',
    toolLabel: { click:'Klick', type_text:'Eingeben', scroll:'Scrollen', navigate:'Navigieren', get_page_content:'Lesen', fill_form:'Formular', extract_data:'Extrahieren', download_file:'Herunterladen', wait:'Warten', take_screenshot:'Screenshot', generate_document:'Exportieren' },
    roleLabels: { user: 'Du', assistant: 'Agent', action: 'Aktion', error: 'Fehler', system: 'System', export: 'Export' },
    statusReady: 'Bereit', statusStopping: '⏹ Stopp angefordert…',
    configReloaded: '🔄 Konfiguration neu geladen.',
    provider: 'Provider', model: 'Modell',
    noKey: 'API-Schlüssel fehlt für', configure: '. Klicken Sie auf ⚙ zum Konfigurieren.',
    noModel: 'nicht konfiguriert', noProvider: '— Provider konfigurieren (⚙) —',
    noModels: '— Modelle konfigurieren —',
    statusThinking: '— Denke…', statusDone: '✅ Fertig', statusActions: '⚡ Aktion(en)…',
    apiError: 'API-Fehler:', statusRefusal: '❌ Modell Verweigerung', statusFailEmpty: '❌ Fehler: keine Antwort',
    statusRetry: '🔄 Wiederhole...',
    noModelSelected: 'Kein Modell ausgewählt', baseUrlNotConfigured: 'Basis-URL nicht konfiguriert',
    tab: 'Tab', chatCleared: 'Chat gelöscht', noConnexion: 'Keine Internetverbindung.',
    stepStatus: { pending: '⏳', success: '✅', error: '❌' },
    thinking: 'Denken', inProgress: 'In Bearbeitung',
    navConfirmTitle: 'Navigation von der Seite weg',
    navConfirmHint: 'Der Agent möchte diese Seite verlassen. Erlauben?',
    navConfirmAlways: 'Immer erlauben (nicht mehr fragen)',
    navConfirmOk: 'Erlauben',
    navConfirmCancel: 'Abbrechen',
    footerSupport: '☕ Unterstützen',
    mode: 'Modus', modeLibre: 'Frei', modeVoyage: 'Reise', modeRecherche: 'Suche',
    modeAnalyse: 'Analyse', modeExtraction: 'Extraktion', modeAdministratif: 'Verwaltung',
    modeShopping: 'Shopping', modeVeille: 'Überwachung', modeCuisine: 'Kochen',
    modeImmobilier: 'Immobilien', modeEmploi: 'Arbeit', modeEducation: 'Bildung',
    modeAutoDetected: 'Modus automatisch erkannt',
    qaSearchHotel: 'Unterkunft', qaSearchFlight: 'Flug', qaSearchTrain: 'Zug',
    qaItinerary: 'Reiseroute', qaTripPlan: 'Reiseplan', qaExportTrip: 'Reise exportieren',
    qaWebSearch: 'Websuche', qaSummarizePage: 'Zusammenfassen', qaDeepen: 'Vertiefen',
    qaMultiSynth: 'Synthese', qaExportSearch: 'Suche exportieren',
    qaAnalyzePage: 'Analysieren', qaCompare: 'Vergleichen', qaDataTable: 'Tabelle',
    qaAnalysisReport: 'Bericht', qaExportJSON: 'JSON exportieren',
    qaExtractTable: 'Tabelle→CSV', qaExtractList: 'Liste→CSV', qaExtractLinks: 'Links→CSV',
    qaExtractJSON: 'JSON', qaExtractMD: 'Markdown',
    qaFillForm: 'Formular ausfüllen', qaCheckFields: 'Felder prüfen', qaScreenshot: 'Screenshot',
    qaExportPDF: 'PDF', qaPrepareLetter: 'Brief',
    qaComparePrice: 'Preise vergleichen', qaExtractReviews: 'Bewertungen', qaBestValue: 'Preis/Leistung',
    qaPriceHistory: 'Preisverlauf', qaShoppingList: 'Einkaufsliste',
    qaSummarizeNews: 'Nachrichten', qaWatchTopic: 'Überwachen', qaVeuilleFolder: 'Ordner',
    qaExportVeille: 'Überwachung exportieren', qaDeepSearch: 'Tiefensuche',
    qaSearchRecipe: 'Rezept', qaShoppingListCuisine: 'Einkauf', qaConvertMeasures: 'Umrechnen',
    qaMealPlan: 'Mahlzeitenplan', qaExportRecipe: 'Rezept exportieren',
    qaSearchProperty: 'Suchen', qaCompareProperties: 'Vergleichen', qaEstimate: 'Schätzen',
    qaTrackingSheet: 'Verfolgung', qaPropertyReport: 'Bericht',
    qaSearchJobs: 'Stellenangebote', qaExtractOffers: 'Extrahieren', qaPrepareApp: 'Bewerbung',
    qaFillApplication: 'Bewerben', qaTrackingBoard: 'Verfolgungstafel',
    qaExplain: 'Erklären', qaSummarizeCourse: 'Kurs zusammenfassen', qaRevisionSheet: 'Lernzettel',
    qaDeepenLearning: 'Vertiefen', qaGenerateQuiz: 'Quiz',
  },
  pt: {
    placeholder: 'O que você quer fazer nesta página?',
    send: 'Enviar ↗', stop: 'Parar', sendHint: '⏎ Enviar · Shift+⏎ Nova linha',
    summarize: 'Resumir', linksCsv: 'Links CSV', table: 'Tabela', report: 'Relatório HTML', screenshot: 'Screenshot',
    quickPromptSummarize: 'Resuma o conteúdo desta página',
    quickPromptLinks: 'Extraia todos os links importantes em CSV',
    quickPromptTable: 'Extraia os dados em forma de tabela HTML baixável',
    quickPromptReport: 'Gere um relatório HTML desta página',
    quickPromptScreenshot: 'Tire uma captura de tela da página',
    newChat: 'Novo chat', config: 'Configuração', reportBug: 'Reportar um bug',
    apiKeyMissing: 'Chave API ausente para', clickToConfig: '. Clique em ⚙ para configurar.',
    themeLight: 'Tema claro/escuro', emptyStateDesc: 'Descreva o que você quer fazer nesta página.<br>O agente navegará por você.',
    bugPanelTitle: '🐛 Reportar um bug', bugDescLabel: 'Descrição', bugDescPlaceholder: 'Descreva o que aconteceu...',
    bugLogLabel: 'Log capturado', bugHint: '💡 Clique em "Copiar" e cole no Claude para obter ajuda.',
    bugCopyBtn: '📋 Copiar relatório', bugCloseBtn: 'Fechar', backToChat: 'Voltar ao chat',
    noInternet: 'Sem conexão com a internet.',
    errorColon: 'Erro:', fieldNotFound: 'Campo não encontrado:', elementNotFound: 'Elemento não encontrado:', notFound: 'Não encontrado',
    thinkingThinking: 'Pensando...', thinkingDone: 'Pensamento concluído',
    error: 'Erro', action: 'Ação', emptyState: 'Descreva o que você quer fazer nesta página.<br>O agente navegará por você.',
    rateLimit: 'Rate limit. Tentando em', rateLimitWait: 'Rate limit — esperando',
    emptyResponse: 'Modelo não responde com ações. Tente outro modelo ou provedor.',
    refusal: 'Recusa do modelo:', noAction: '(nenhum pensamento para exibir)',
    actionsInProgress: '(ações em progresso...)', done: 'Feito', iteration: 'Iteração',
    maxIterations: 'Limite de', iterationsReached: ' iterações atingidas.', maxIterationsContinue: 'Limite atingido. Continuar?', maxIterationsBtn: '▶ Continuar',
    toolLabel: { click:'Clic', type_text:'Digitar', scroll:'Rolar', navigate:'Navegar', get_page_content:'Ler', fill_form:'Formulário', extract_data:'Extrair', download_file:'Baixar', wait:'Aguardar', take_screenshot:'Screenshot', generate_document:'Exportar' },
    roleLabels: { user: 'Você', assistant: 'Agente', action: 'Ação', error: 'Erro', system: 'Sistema', export: 'Exportar' },
    statusReady: 'Pronto', statusStopping: '⏹ Parada solicitada…',
    configReloaded: '🔄 Configuração recarregada.',
    provider: 'Provedor', model: 'Modelo',
    noKey: 'Chave API ausente para', configure: '. Clique em ⚙ para configurar.',
    noModel: 'não configurado', noProvider: '— Configurar provedor (⚙) —',
    noModels: '— configurar modelos —',
    statusThinking: '— Pensando…', statusDone: '✅ Feito', statusActions: '⚡ ação(ões)…',
    apiError: 'Erro API:', statusRefusal: '❌ Recusa do modelo', statusFailEmpty: '❌ Erro: sem resposta',
    statusRetry: '🔄 Tentando novamente...',
    tab: 'Aba', chatCleared: 'Chat apagado', noConnexion: 'Sem conexão com a internet.',
    stepStatus: { pending: '⏳', success: '✅', error: '❌' },
    thinking: 'Pensando', inProgress: 'Em progresso',
    noModelSelected: 'Nenhum modelo selecionado', baseUrlNotConfigured: 'URL base não configurada',
    navConfirmTitle: 'Navegação para fora da página',
    navConfirmHint: 'O agente quer sair desta página. Permitir?',
    navConfirmAlways: 'Sempre permitir (não perguntar mais)',
    navConfirmOk: 'Permitir',
    navConfirmCancel: 'Cancelar',
    footerSupport: '☕ Apoiar',
    mode: 'Modo', modeLibre: 'Livre', modeVoyage: 'Viagem', modeRecherche: 'Pesquisa',
    modeAnalyse: 'Análise', modeExtraction: 'Extração', modeAdministratif: 'Administrativo',
    modeShopping: 'Compras', modeVeille: 'Monitoramento', modeCuisine: 'Culinária',
    modeImmobilier: 'Imobiliário', modeEmploi: 'Emprego', modeEducation: 'Educação',
    modeAutoDetected: 'Modo detectado automaticamente',
    qaSearchHotel: 'Acomodação', qaSearchFlight: 'Voo', qaSearchTrain: 'Trem',
    qaItinerary: 'Itinerário', qaTripPlan: 'Plano de viagem', qaExportTrip: 'Exportar viagem',
    qaWebSearch: 'Pesquisa web', qaSummarizePage: 'Resumir', qaDeepen: 'Aprofundar',
    qaMultiSynth: 'Síntese', qaExportSearch: 'Exportar pesquisa',
    qaAnalyzePage: 'Analisar', qaCompare: 'Comparar', qaDataTable: 'Tabela',
    qaAnalysisReport: 'Relatório', qaExportJSON: 'Exportar JSON',
    qaExtractTable: 'Tabela→CSV', qaExtractList: 'Lista→CSV', qaExtractLinks: 'Links→CSV',
    qaExtractJSON: 'JSON', qaExtractMD: 'Markdown',
    qaFillForm: 'Preencher', qaCheckFields: 'Verificar', qaScreenshot: 'Captura',
    qaExportPDF: 'PDF', qaPrepareLetter: 'Carta',
    qaComparePrice: 'Comparar preços', qaExtractReviews: 'Avaliações', qaBestValue: 'Custo/benefício',
    qaPriceHistory: 'Histórico', qaShoppingList: 'Lista de compras',
    qaSummarizeNews: 'Notícias', qaWatchTopic: 'Monitorar', qaVeuilleFolder: 'Pasta',
    qaExportVeille: 'Exportar monitoramento', qaDeepSearch: 'Pesquisa profunda',
    qaSearchRecipe: 'Receita', qaShoppingListCuisine: 'Compras', qaConvertMeasures: 'Converter',
    qaMealPlan: 'Plano de refeições', qaExportRecipe: 'Exportar receita',
    qaSearchProperty: 'Buscar', qaCompareProperties: 'Comparar', qaEstimate: 'Estimar',
    qaTrackingSheet: 'Planilha', qaPropertyReport: 'Relatório',
    qaSearchJobs: 'Vagas', qaExtractOffers: 'Extrair', qaPrepareApp: 'Candidatura',
    qaFillApplication: 'Candidatar', qaTrackingBoard: 'Painel de acompanhamento',
    qaExplain: 'Explicar', qaSummarizeCourse: 'Resumo do curso', qaRevisionSheet: 'Ficha de revisão',
    qaDeepenLearning: 'Aprofundar', qaGenerateQuiz: 'Quiz',
  },
};

const LANG_OPTIONS = [
  { code: 'fr', name: 'Français' },
  { code: 'en', name: 'English' },
  { code: 'es', name: 'Español' },
  { code: 'it', name: 'Italiano' },
  { code: 'de', name: 'Deutsch' },
  { code: 'pt', name: 'Português' },
];

function t(key) {
  const lang = settings.uiLang || 'fr';
  return I18N[lang]?.[key] || I18N.fr[key] || key;
}

// ─── MODEL TIER & BEST PRACTICES ──────────────────
const BEST_PRACTICES = {
  light: `
BONNES PRATIQUES:
- Avant de cliquer ou saisir, utilise get_page_content pour comprendre la structure
- Utilise des sélecteurs CSS précis (id, [name=...], [data-testid=...]) plutôt que des sélecteurs vagues
- Pour les formulaires, utilise fill_form plutôt que plusieurs type_text individuels
- Pour exporter, utilise TOUJOURS generate_document avec un format explicite (csv/html/json)`,
  full: `
BONNES PRATIQUES:
- Avant de cliquer ou saisir, utilise get_page_content pour comprendre la structure
- Utilise des sélecteurs CSS précis (id, [name=...], [data-testid=...]) plutôt que des sélecteurs vagues
- Pour les formulaires, utilise fill_form plutôt que plusieurs type_text individuels
- Pour exporter, utilise TOUJOURS generate_document avec un format explicite (csv/html/json)
- CSV: la première ligne doit contenir les en-têtes de colonnes séparés par des virgules, chaque ligne suivante = 1 enregistrement. Pas d'espaces autour des virgules.
- HTML: structure minimale avec <table><thead><tr><th>... pour les tableaux
- Si un click échoue (élément non trouvé), utilise get_page_content puis réessaie avec un sélecteur plus précis
- Remplir un champ: utilise clear_first: true pour vider avant de saisir
- Ne devine JAMAIS un sélecteur — vérifie d'abord avec get_page_content
- Scrolle si l'élément pourrait être hors écran avant d'agir
- Procède étape par étape, une seule action à la fois`,
};

function getModelTier(modelId) {
  if (!modelId) return 'low';
  const m = modelId.toLowerCase();
  if (m.includes('opus') || m.includes('sonnet') || m.includes('4o') || m.includes('gpt-4-turbo') || 
      m.includes('gemini-2.5') || m.includes('grok-3')) return 'high';
  if (m.includes('haiku') || m.includes('4o-mini') || m.includes('mistral-large') || m.includes('command-r-plus')) return 'medium';
  return 'low';
}

function updateI18n() {
  document.querySelectorAll('[data-i18n]').forEach(el => {
    const key = el.dataset.i18n;
    el.textContent = t(key);
  });
  
  // Update quick action buttons
  const qbtns = document.querySelectorAll('.qbtn');
  if (qbtns.length >= 5) {
    qbtns[0].innerHTML = `<span class="qbtn-icon">${ICO('fileText', 13)}</span> ${t('summarize')}`;
    qbtns[0].dataset.prompt = t('quickPromptSummarize');
    qbtns[1].innerHTML = `<span class="qbtn-icon">${ICO('link', 13)}</span> ${t('linksCsv')}`;
    qbtns[1].dataset.prompt = t('quickPromptLinks');
    qbtns[2].innerHTML = `<span class="qbtn-icon">${ICO('table', 13)}</span> ${t('table')}`;
    qbtns[2].dataset.prompt = t('quickPromptTable');
    qbtns[3].innerHTML = `<span class="qbtn-icon">${ICO('code', 13)}</span> ${t('report')}`;
    qbtns[3].dataset.prompt = t('quickPromptReport');
    qbtns[4].innerHTML = `<span class="qbtn-icon">${ICO('camera', 13)}</span> ${t('screenshot')}`;
    qbtns[4].dataset.prompt = t('quickPromptScreenshot');
  }
  
  // Update input placeholders and labels
  const input = document.getElementById('prompt-input');
  if (input) input.placeholder = t('placeholder');
  
  const hint = document.getElementById('input-hint');
  if (hint) hint.textContent = t('sendHint');
  
  const sendBtn = document.getElementById('send-btn');
  if (sendBtn) sendBtn.innerHTML = t('send') + ' ' + ICO('arrowUpRight', 14);
  
  const stopBtn = document.getElementById('stop-btn');
  if (stopBtn) stopBtn.innerHTML = ICO('stop', 14) + ' ' + t('stop');
  
  const emptyText = document.querySelector('.empty-text');
  if (emptyText) emptyText.innerHTML = t('emptyStateDesc');
  
  const providerLabel = document.querySelector('.provider-label');
  if (providerLabel) providerLabel.textContent = t('provider');
  
  // Update model select title
  const modelSel = document.getElementById('model-select');
  if (modelSel) modelSel.title = t('model');

  // Update header buttons titles
  const bugBtn = document.getElementById('bug-btn');
  if (bugBtn) bugBtn.title = t('reportBug');
  
  const clearBtn = document.getElementById('clear-btn');
  if (clearBtn) clearBtn.title = t('newChat');
  
  const configBtn = document.getElementById('config-btn');
  if (configBtn) configBtn.title = t('config');

  // Update theme toggle title
  const themeWrap = document.querySelector('.theme-wrap');
  if (themeWrap) themeWrap.title = t('themeLight');

  // Update bug panel
  const bugPanel = document.getElementById('bug-panel');
  if (bugPanel) {
    const bugTitle = bugPanel.querySelector('.bug-title');
    if (bugTitle) bugTitle.innerHTML = ICO('bug', 14) + ' ' + t('bugPanelTitle').replace(/^[^\s]+\s/, '');
    const bugDescLabel = bugPanel.querySelector('label.field-label');
    if (bugDescLabel) bugDescLabel.textContent = t('bugDescLabel');
    const bugDesc = document.getElementById('bug-desc');
    if (bugDesc) bugDesc.placeholder = t('bugDescPlaceholder');
    const bugLogLabel = bugPanel.querySelectorAll('label.field-label')[1];
    if (bugLogLabel) bugLogLabel.textContent = t('bugLogLabel');
    const bugHint = bugPanel.querySelector('.bug-hint');
    if (bugHint) bugHint.innerHTML = ICO('lightbulb', 13) + ' ' + t('bugHint').replace(/^[^\s]+\s/, '');
    const bugCopyBtn = document.getElementById('bug-copy-btn');
    if (bugCopyBtn) bugCopyBtn.innerHTML = ICO('copy', 14) + ' ' + t('bugCopyBtn').replace(/^[^\s]+\s/, '');
    const bugCloseBtn = document.getElementById('bug-close-btn');
    if (bugCloseBtn) bugCloseBtn.textContent = t('bugCloseBtn');
  }

  // Update API banner
  const apiBanner = document.getElementById('api-banner');
  if (apiBanner) {
    const bannerLabel = apiBanner.querySelector('.api-banner-label');
    if (bannerLabel) {
      const pName = document.getElementById('banner-provider')?.textContent || '';
      bannerLabel.innerHTML = `${ICO('search', 13)} ${t('apiKeyMissing')} ${pName} ${t('clickToConfig')}`;
    }
  }

  initIcons();
}

// ─── ICON INIT ──────────────────────────────────
function initIcons() {
  const set = (id, html) => { const el = document.getElementById(id); if (el) el.innerHTML = html; };
  set('logo-icon', ICO('brain', 18));
  set('theme-sun', ICO('sun', 13));
  set('theme-moon', ICO('moon', 13));
  set('empty-icon', ICO('globe', 36));
  set('bug-btn', ICO('bug', 15));
  set('clear-btn', ICO('trash', 15));
  set('config-btn', ICO('settings', 15));
  // collapse-btn icon is set by initHeaderCollapse() after DOMContentLoaded
  set('qa-summarize', ICO('fileText', 13));
  set('qa-links', ICO('link', 13));
  set('qa-table', ICO('table', 13));
  set('qa-report', ICO('code', 13));
  set('qa-screenshot', ICO('camera', 13));
  set('stop-btn', ICO('stop', 14) + ' ' + t('stop'));
  set('send-btn', t('send') + ' ' + ICO('arrowUpRight', 14));
  set('input-hint', t('sendHint'));
  set('bug-title', ICO('bug', 14) + ' ' + t('bugPanelTitle').replace(/^[^\s]+\s/, ''));
  set('bug-hint', ICO('lightbulb', 13) + ' ' + t('bugHint').replace(/^[^\s]+\s/, ''));
  set('bug-copy-btn', ICO('copy', 14) + ' ' + t('bugCopyBtn').replace(/^[^\s]+\s/, ''));
}

function renderMarkdown(text) {
  if (!text) return '';
  try {
    return marked.parse(text, { breaks: true, gfm: true });
  } catch {
    return escHtml(text).replace(/\n/g, '<br>');
  }
}

// ─── PROVIDER DEFINITIONS ───────────────────────
const PROVIDER_DEFS = {
  anthropic:        { name: 'Anthropic (Claude)', emoji: '🟣', type: 'anthropic' },
  openai:           { name: 'OpenAI (GPT)',        emoji: '🤖', type: 'openai'    },
  xai:              { name: 'xAI (Grok)',          emoji: '⚡', type: 'openai'    },
  mistral:          { name: 'Mistral AI',          emoji: '🌊', type: 'openai'    },
  deepseek:         { name: 'DeepSeek',            emoji: '🔍', type: 'openai'    },
  gemini:           { name: 'Google Gemini',       emoji: '🔷', type: 'openai'    },
  cohere:           { name: 'Cohere',              emoji: '🧩', type: 'openai'    },
  openrouter:       { name: 'OpenRouter',          emoji: '🔀', type: 'openai'    },
  zai:              { name: 'Z.ai (GLM)',           emoji: '🌐', type: 'openai'    },
  custom_openai:    { name: 'Custom (OAI compat)', emoji: '🔧', type: 'openai'    },
  custom_anthropic: { name: 'Custom (ANT compat)', emoji: '🔧', type: 'anthropic' },
};

const PROVIDER_URLS = {
  anthropic:  'https://api.anthropic.com/v1/messages',
  openai:     'https://api.openai.com/v1/chat/completions',
  xai:        'https://api.x.ai/v1/chat/completions',
  mistral:    'https://api.mistral.ai/v1/chat/completions',
  deepseek:   'https://api.deepseek.com/v1/chat/completions',
  gemini:     'https://generativelanguage.googleapis.com/v1beta/openai/chat/completions',
  cohere:     'https://api.cohere.com/v2/chat',
  openrouter: 'https://openrouter.ai/api/v1/chat/completions',
  zai:        'https://api.z.ai/api/paas/v4/chat/completions',
};

// ─── STATE ──────────────────────────────────────
let settings = {
  configuredProviders:    [],
  currentProvider:        '',
  providerKeys:           {},
  providerModels:         {},
  providerSelectedModel:  {},
  providerCustomUrl:      {},
  maxIterations:         15,
  maxInputTokens:        40000,
  memoryEnabled:          true,
  historyEnabled:         true,
  uiLang:                 'fr',
  agentLang:              'fr',
  thinkingCollapsed:      true,
  highlightClicks:       true,
  debugMode:              false,
  theme:                 'light',
  maxTabSessions:         10,
  userSystemPrompt:      '',
  bestPractices:         'auto',
  currentMode:           'libre',
  autoDetectMode:        true,
  enabledModes:          [],
};

// Per-tab chat sessions: { [tabId]: { messages, history, tabInfo, runningTaskId } }
let tabSessions = {};
let activeTabId = null;

let isRunning = false;
let stopRequested = false;
let globalAbortController = null;
// #8: Track which tabId the current running task belongs to
let runningTabId = null;
let errorLog = [];
let persistentMemory = [];

// ─── INIT ────────────────────────────────────────
document.addEventListener('DOMContentLoaded', async () => {
  await loadSettings();
  await loadMemory();
  initIcons();
  setupEventListeners();
  initHeaderCollapse();
  applyTheme(settings.theme);
  renderProviderSelect();
  // Init tool registry (custom + remote tools) before rendering modes
  if (window.ToolRegistry) await window.ToolRegistry.init();
  renderModeBar();
  renderQuickActions();
  updateI18n();

  const { tab } = await bg('GET_ACTIVE_TAB', {});
  if (tab) {
    activeTabId = tab.id;
    ensureTabSession(tab.id, tab.url, tab.title);
    renderTabBar();
    renderChat();
    if (settings.autoDetectMode) {
      const detected = detectModeFromUrl(tab.url);
      if (detected && detected !== settings.currentMode) {
        settings.currentMode = detected;
        chrome.storage.local.set({ currentMode: detected });
        renderModeBar();
        renderQuickActions();
      }
    }
  }
  updateApiBanner();
});

async function loadSettings() {
  const keys = [
    'configuredProviders', 'currentProvider',
    'providerKeys', 'providerModels', 'providerSelectedModel', 'providerCustomUrl',
    'maxIterations', 'maxInputTokens', 'memoryEnabled',
    'historyEnabled', 'uiLang', 'agentLang', 'thinkingCollapsed', 'highlightClicks', 'debugMode', 'theme',
    'maxTabSessions', 'persistentMemory', 'currentMode', 'autoDetectMode', 'enabledModes',
    'customModes', 'navAlwaysAllow'
  ];
  const s = await chrome.storage.local.get(keys);

  // New format: configuredProviders array
  if (s.configuredProviders && s.configuredProviders.length > 0) {
    settings.configuredProviders = s.configuredProviders;
    // Rebuild legacy maps from array for callAPI compatibility
    settings.providerKeys          = {};
    settings.providerModels        = {};
    settings.providerSelectedModel = {};
    settings.providerCustomUrl     = {};
    s.configuredProviders.forEach(p => {
      settings.providerKeys[p.instanceId]          = p.key;
      settings.providerModels[p.instanceId]        = p.models;
      settings.providerSelectedModel[p.instanceId] = p.selectedModel;
      settings.providerCustomUrl[p.instanceId]     = p.customUrl;
    });
  } else {
    // Fallback: old flat format
    if (s.providerKeys)          settings.providerKeys          = s.providerKeys;
    if (s.providerModels)        settings.providerModels        = s.providerModels;
    if (s.providerSelectedModel) settings.providerSelectedModel = s.providerSelectedModel;
    if (s.providerCustomUrl)     settings.providerCustomUrl     = s.providerCustomUrl;
    settings.configuredProviders = [];
  }

  if (s.currentProvider)               settings.currentProvider   = s.currentProvider;
  if (s.maxIterations)                 settings.maxIterations     = s.maxIterations;
  if (s.maxInputTokens)                settings.maxInputTokens    = s.maxInputTokens;
  if (s.memoryEnabled  !== undefined)  settings.memoryEnabled     = s.memoryEnabled;
  if (s.historyEnabled !== undefined)  settings.historyEnabled    = s.historyEnabled;
  if (s.uiLang)                        settings.uiLang           = s.uiLang;
  if (s.agentLang)                     settings.agentLang        = s.agentLang;
  if (s.thinkingCollapsed !== undefined) settings.thinkingCollapsed = s.thinkingCollapsed;
  if (s.highlightClicks !== undefined) settings.highlightClicks = s.highlightClicks;
  if (s.debugMode !== undefined) settings.debugMode = s.debugMode;
  if (s.theme)                         settings.theme             = s.theme;
  if (s.userSystemPrompt !== undefined) settings.userSystemPrompt  = s.userSystemPrompt || '';
  if (s.bestPractices !== undefined)      settings.bestPractices     = s.bestPractices || 'auto';
  if (s.maxTabSessions)                settings.maxTabSessions   = s.maxTabSessions;
  if (s.currentMode)                    settings.currentMode     = s.currentMode || 'libre';
  if (s.autoDetectMode !== undefined)   settings.autoDetectMode  = s.autoDetectMode;
  if (s.enabledModes && s.enabledModes.length > 0) {
    settings.enabledModes = s.enabledModes;
  } else if (typeof window.BrowserMindModes !== 'undefined') {
    settings.enabledModes = Object.keys(window.BrowserMindModes);
  }

  persistentMemory = s.persistentMemory || [];
  // Load custom modes into window for renderModeBar + callAPI
  window._customModes = s.customModes || {};
  if (s.navAlwaysAllow !== undefined) settings.navAlwaysAllow = s.navAlwaysAllow;
  updateDebugButtonVisibility();
}

function updateDebugButtonVisibility() {
  const bugBtn = document.getElementById('bug-btn');
  if (bugBtn) {
    bugBtn.style.display = settings.debugMode ? '' : 'none';
  }
}

async function loadMemory() {
  const s = await chrome.storage.local.get(['persistentMemory']);
  persistentMemory = s.persistentMemory || [];
}

// ─── THEME ──────────────────────────────────────
function applyTheme(t) {
  document.body.setAttribute('data-theme', t);
  settings.theme = t;
  // Sync toggle
  const tog = document.getElementById('theme-toggle');
  if (tog) tog.checked = (t === 'dark');
}

// ─── PROVIDER SELECT ────────────────────────────
function renderProviderSelect() {
  const sel = document.getElementById('provider-select');
  const providers = settings.configuredProviders || [];

  if (providers.length === 0) {
    sel.innerHTML = `<option value="">— Configurer un provider (⚙) —</option>`;
    renderModelSelect();
    return;
  }

  sel.innerHTML = providers.map(p =>
    `<option value="${p.instanceId}"${p.instanceId === settings.currentProvider ? ' selected' : ''}>${p.emoji} ${p.name}</option>`
  ).join('');

  // Auto-select first if current not found
  if (!providers.find(p => p.instanceId === settings.currentProvider)) {
    settings.currentProvider = providers[0].instanceId;
    sel.value = settings.currentProvider;
  }

  renderModelSelect();
  updateHeaderSummary();
}

function renderModelSelect() {
  const sel = document.getElementById('model-select');
  const models = settings.providerModels[settings.currentProvider] || [];
  const selected = settings.providerSelectedModel[settings.currentProvider] || '';
  sel.innerHTML = models.length === 0
    ? `<option value="">— configurer les modèles —</option>`
    : models.map(m => `<option value="${m.id}"${m.id === selected ? ' selected' : ''}>${m.name || m.id}</option>`).join('');
  if (selected) sel.value = selected;
}

// ─── MODE SELECTOR ────────────────────────────────
const MODE_CHIPS_MAX = 4;

function getAllModes() {
  const native = Object.values(window.BrowserMindModes || {});
  const custom = Object.values(window._customModes || {});
  return [...native, ...custom];
}

function renderModeBar() {
  const bar = document.getElementById('mode-chips');
  if (!bar) return;

  const allModes = getAllModes();
  const enabledModes = settings.enabledModes.length > 0
    ? settings.enabledModes
    : allModes.map(m => m.id);

  const filteredModes = allModes.filter(m => enabledModes.includes(m.id));
  const visibleModes  = filteredModes.slice(0, MODE_CHIPS_MAX);
  const overflowModes = filteredModes.slice(MODE_CHIPS_MAX);
  const activeInOverflow = overflowModes.some(m => m.id === settings.currentMode);

  bar.innerHTML = visibleModes.map(m => `
    <button class="mode-chip${m.id === settings.currentMode ? ' active' : ''}"
            data-mode="${m.id}" title="${m.description || ''}">
      <span class="mode-chip-icon">${m.icon}</span>
      <span class="mode-chip-label">${m.labelKey ? t(m.labelKey) : m.id}</span>
    </button>
  `).join('');

  if (overflowModes.length > 0) {
    const overflowBtn = document.createElement('button');
    overflowBtn.className = 'mode-chip mode-chip-overflow' + (activeInOverflow ? ' active' : '');
    overflowBtn.title = overflowModes.map(m => t(m.labelKey || m.id)).join(', ');

    const activeOM = overflowModes.find(m => m.id === settings.currentMode);
    overflowBtn.innerHTML = activeOM
      ? `<span class="mode-chip-icon">${activeOM.icon}</span><span class="mode-chip-label">${t(activeOM.labelKey || activeOM.id)}</span><span class="mode-chip-caret">▾</span>`
      : `<span class="mode-chip-label">+${overflowModes.length}</span><span class="mode-chip-caret">▾</span>`;

    const dropdown = document.createElement('div');
    dropdown.className = 'mode-overflow-dropdown';
    dropdown.innerHTML = overflowModes.map(m => `
      <button class="mode-overflow-item${m.id === settings.currentMode ? ' active' : ''}" data-mode="${m.id}">
        <span>${m.icon}</span> <span>${m.labelKey ? t(m.labelKey) : m.id}</span>
      </button>
    `).join('');

    const wrapper = document.createElement('div');
    wrapper.className = 'mode-overflow-wrap';
    wrapper.appendChild(overflowBtn);
    wrapper.appendChild(dropdown);
    bar.appendChild(wrapper);

    let dropOpen = false;
    const closeDropdown = () => { dropOpen = false; dropdown.classList.remove('open'); };
    overflowBtn.addEventListener('click', e => {
      e.stopPropagation();
      dropOpen = !dropOpen;
      if (dropOpen) {
        const rect = overflowBtn.getBoundingClientRect();
        dropdown.style.top  = rect.bottom + 4 + 'px';
        dropdown.style.left = rect.left + 'px';
      }
      dropdown.classList.toggle('open', dropOpen);
    });
    document.addEventListener('click', closeDropdown, { once: false });
    bar._closeOverflow = closeDropdown;

    dropdown.querySelectorAll('.mode-overflow-item').forEach(item => {
      item.addEventListener('click', e => {
        e.stopPropagation();
        closeDropdown();
        selectMode(item.dataset.mode);
      });
    });
  }

  bar.querySelectorAll('.mode-chip[data-mode]').forEach(chip => {
    chip.addEventListener('click', () => selectMode(chip.dataset.mode));
  });
}

function selectMode(newMode) {
  if (newMode === settings.currentMode) return;
  settings.currentMode = newMode;
  chrome.storage.local.set({ currentMode: settings.currentMode });
  renderModeBar();
  renderQuickActions();
  const mode = window.BrowserMindModes?.[newMode];
  addMsg('system', `${mode?.icon || ''} ${t(mode?.labelKey || newMode)}`);
}

function renderQuickActions() {
  const qa = document.getElementById('quick-actions');
  if (!qa) return;
  
  const mode = (window.BrowserMindModes?.[settings.currentMode]) || window.BrowserMindModes?.libre;
  if (!mode || !mode.quickActions) {
    qa.innerHTML = '';
    return;
  }
  
  qa.innerHTML = mode.quickActions.map(action => {
    const iconMap = {
      fileText: 'file-text', link: 'link', table: 'table', code: 'code', camera: 'camera',
      home: 'home', plane: 'plane', train: 'train', map: 'map', calendar: 'calendar', download: 'download',
      search: 'search', layers: 'layers', 'git-merge': 'git-merge', 'bar-chart': 'bar-chart', columns: 'columns',
      'file-text': 'file-text', list: 'list', edit: 'edit', 'check-circle': 'check-circle', file: 'file', mail: 'mail',
      'dollar-sign': 'dollar-sign', 'message-square': 'message-square', award: 'award', 'trending-up': 'trending-up',
      'shopping-cart': 'shopping-cart', newspaper: 'newspaper', eye: 'eye', folder: 'folder', 'book': 'book',
      'book-open': 'book-open', clipboard: 'clipboard', 'check-square': 'check-square', helpCircle: 'help-circle',
      calculator: 'calculator', search: 'search'
    };
    return `
      <button class="qbtn" data-prompt="${action.prompt}">
        <span class="qbtn-icon">${ICO(iconMap[action.icon] || 'zap', 13)}</span> ${t(action.labelKey)}
      </button>
    `;
  }).join('');
  
  qa.querySelectorAll('.qbtn').forEach(btn => {
    btn.addEventListener('click', () => {
      document.getElementById('prompt-input').value = btn.dataset.prompt;
      handleSend();
    });
  });
}

// #6: reload settings from storage (called after config page saves)
async function refreshFromStorage() {
  await loadSettings();
  applyTheme(settings.theme);
  renderProviderSelect();
  renderModeBar();
  renderQuickActions();
  updateI18n();
  updateApiBanner();
  addMsg('system', t('configReloaded'));
}

// ─── TAB MANAGEMENT ─────────────────────────────
function ensureTabSession(tabId, url, title) {
  if (!tabSessions[tabId]) {
    tabSessions[tabId] = {
      tabId, url: url || '', title: title || 'Onglet',
      history: [],
      messages: [],
      createdAt: Date.now(),
      runningTaskId: null
    };
  } else {
    if (url) tabSessions[tabId].url = url;
    if (title) tabSessions[tabId].title = title;
  }
  enforceTabLimit();
}

function enforceTabLimit() {
  const limit = settings.maxTabSessions || 10;
  const sessions = Object.values(tabSessions);
  if (sessions.length <= limit) return;

  const sortedSessions = sessions
    .filter(s => {
      const isActiveTab = s.tabId === activeTabId;
      const isRunning = s.runningTaskId != null;
      return !isActiveTab && !isRunning;
    })
    .sort((a, b) => a.createdAt - b.createdAt);

  const toRemove = sessions.length - limit;
  let removed = 0;
  for (const session of sortedSessions) {
    if (removed >= toRemove) break;
    delete tabSessions[session.tabId];
    removed++;
  }
}

function renderTabBar() {
  const bar = document.getElementById('tab-bar');
  const sessions = Object.values(tabSessions);
  if (sessions.length <= 1) { bar.style.display = 'none'; return; }
  bar.style.display = 'flex';

  const TAB_MAX = 4;
  const visibleSessions  = sessions.slice(0, TAB_MAX);
  const overflowSessions = sessions.slice(TAB_MAX);
  const activeInOverflow = overflowSessions.some(s => s.tabId === activeTabId);

  bar.innerHTML = visibleSessions.map(s => {
    const domain = getDomain(s.url);
    const isActive = s.tabId === activeTabId;
    const isLocked = s.runningTaskId != null;
    return `
      <div class="tab-chip${isActive ? ' active' : ''}" data-tabid="${s.tabId}">
        <img class="tab-favicon" src="https://www.google.com/s2/favicons?domain=${encodeURIComponent(domain)}&sz=16" data-fallback="none"/>
        <span>${truncate(s.title || domain || 'Onglet', 18)}</span>
        ${isLocked ? `<span title="Tâche en cours" style="font-size:11px">🔒</span>` : ''}
        <button class="tab-close" data-tabid="${s.tabId}" title="Fermer">✕</button>
      </div>
    `;
  }).join('');

  if (overflowSessions.length > 0) {
    const activeOS = overflowSessions.find(s => s.tabId === activeTabId);
    const overflowBtn = document.createElement('div');
    overflowBtn.className = 'tab-chip tab-overflow-btn' + (activeInOverflow ? ' active' : '');
    overflowBtn.innerHTML = activeOS
      ? `<span>${truncate(activeOS.title || 'Onglet', 15)}</span><span style="font-size:10px;margin-left:2px">▾</span>`
      : `<span>+${overflowSessions.length}</span><span style="font-size:10px;margin-left:2px">▾</span>`;

    const dropdown = document.createElement('div');
    dropdown.className = 'tab-overflow-dropdown';
    dropdown.innerHTML = overflowSessions.map(s => {
      const domain = getDomain(s.url);
      const isActive = s.tabId === activeTabId;
      const isLocked = s.runningTaskId != null;
      return `
        <div class="tab-overflow-item${isActive ? ' active' : ''}" data-tabid="${s.tabId}">
          <img class="tab-favicon" src="https://www.google.com/s2/favicons?domain=${encodeURIComponent(domain)}&sz=16" data-fallback="none"/>
          <span>${truncate(s.title || domain || 'Onglet', 22)}</span>
          ${isLocked ? `<span style="font-size:10px">🔒</span>` : ''}
          <button class="tab-close" data-tabid="${s.tabId}">✕</button>
        </div>
      `;
    }).join('');

    const wrapper = document.createElement('div');
    wrapper.className = 'tab-overflow-wrap';
    wrapper.appendChild(overflowBtn);
    wrapper.appendChild(dropdown);
    bar.appendChild(wrapper);

    let dropOpen = false;
    const closeDropdown = () => { dropOpen = false; dropdown.classList.remove('open'); };
    overflowBtn.addEventListener('click', e => {
      e.stopPropagation();
      dropOpen = !dropOpen;
      if (dropOpen) {
        const rect = overflowBtn.getBoundingClientRect();
        dropdown.style.top   = rect.bottom + 2 + 'px';
        dropdown.style.left  = Math.max(0, rect.right - 200) + 'px';
      }
      dropdown.classList.toggle('open', dropOpen);
    });
    document.addEventListener('click', closeDropdown);

    dropdown.querySelectorAll('.tab-overflow-item').forEach(item => {
      item.addEventListener('click', e => {
        if (e.target.classList.contains('tab-close')) return;
        closeDropdown();
        switchToTab(parseInt(item.dataset.tabid));
      });
    });
    dropdown.querySelectorAll('.tab-close').forEach(btn => {
      btn.addEventListener('click', e => {
        e.stopPropagation();
        closeDropdown();
        closeTab(parseInt(btn.dataset.tabid));
      });
    });
  }

  bar.querySelectorAll('.tab-chip[data-tabid]').forEach(chip => {
    chip.addEventListener('click', e => {
      if (e.target.classList.contains('tab-close')) return;
      switchToTab(parseInt(chip.dataset.tabid));
    });
  });
  bar.querySelectorAll('.tab-close[data-tabid]').forEach(btn => {
    btn.addEventListener('click', e => {
      e.stopPropagation();
      closeTab(parseInt(btn.dataset.tabid));
    });
  });
}

function switchToTab(tabId) {
  activeTabId = tabId;
  renderTabBar();
  renderChat();
  // #5: also tell Chrome to switch to that tab
  chrome.tabs.update(tabId, { active: true }).catch(e => { console.warn('BrowserMind: tab switch failed', e.message); });
  setStatus(`${t('tab')}: ${truncate(tabSessions[tabId]?.title || '', 30)}`, 'idle');
  enforceTabLimit();
  updateHeaderSummary();
}

function closeTab(tabId) {
  delete tabSessions[tabId];
  if (activeTabId === tabId) {
    const remaining = Object.keys(tabSessions);
    activeTabId = remaining.length > 0 ? parseInt(remaining[remaining.length - 1]) : null;
  }
  renderTabBar();
  renderChat();
}

// ─── CHAT RENDERING ─────────────────────────────
function renderChat() {
  const container = document.getElementById('messages');
  const session = activeTabId ? tabSessions[activeTabId] : null;

  if (!session || session.messages.length === 0) {
    container.innerHTML = `
      <div class="empty-state" id="empty-state">
        <div class="empty-icon">${ICO('globe', 36)}</div>
        <div class="empty-text">${t('emptyState')}</div>
      </div>`;
    return;
  }

  container.innerHTML = '';
  session.messages.forEach(msg => appendMessageElement(msg));
  container.scrollTop = container.scrollHeight;
}

// ─── MESSAGES ───────────────────────────────────
function appendMessageElement(msg) {
  const container = document.getElementById('messages');
  document.getElementById('empty-state')?.remove();

  const div = document.createElement('div');
  div.className = `msg ${msg.type}`;
  div.dataset.msgId = msg.id || '';

  const roleLabels = t('roleLabels');

  let bubbleHtml = '';

  if (msg.type === 'action' && msg.actions) {
    const stepsHtml = msg.actions.map(a => `
      <div class="action-step">
        <span class="step-icon">${toolIconSvg(a.tool)}</span>
        <span class="step-text">${formatActionText(a)}</span>
        <span class="step-status">${stepStatusIcon(a.status)}</span>
      </div>`).join('');
    bubbleHtml = `<div class="msg-bubble">${stepsHtml}</div>`;
  } else if (msg.type === 'thinking') {
    const isOpen = !settings.thinkingCollapsed;
    bubbleHtml = `
      <details class="thinking-block"${isOpen ? ' open' : ''}>
        <summary class="thinking-summary">
          ${msg.done
            ? `<span>${t('thinkingDone')}</span>`
            : `<span style="color:var(--accent2)">${t('thinkingThinking')}</span>
               <div class="thinking-dots"><span></span><span></span><span></span></div>`}
        </summary>
        <div class="thinking-body">${escHtml(msg.content || '…')}</div>
      </details>`;
    div.className = 'msg thinking-msg';
  } else if (msg.type === 'export') {
    const icon = exportIconSvg(msg.format);
    bubbleHtml = `
      <div class="msg-bubble">
        <div class="export-action">
          <span class="export-icon">${icon}</span>
          <div class="export-info">
            <div class="export-name">${escHtml(msg.filename || 'export')}</div>
            <div class="export-meta">${(msg.format || '').toUpperCase()} · ${t('done')}</div>
          </div>
        </div>
      </div>`;
  } else if (msg.type === 'assistant') {
    bubbleHtml = `<div class="msg-bubble markdown-body">${renderMarkdown(msg.content || '')}</div>`;
  } else {
    bubbleHtml = `<div class="msg-bubble">${escHtml(msg.content || '').replace(/\n/g, '<br>')}</div>`;
  }

  const roleIcon = roleIconSvg(msg.type);
  const roleText = roleLabels[msg.type] || roleLabels[msg.type.replace('-msg', '')] || msg.type;
  const roleHtml = `<span class="msg-role">${roleIcon} ${escHtml(roleText)}</span>`;

  if (msg.type !== 'thinking-msg') {
    div.innerHTML = roleHtml + bubbleHtml;
  } else {
    div.innerHTML = bubbleHtml;
  }

  container.appendChild(div);
  container.scrollTop = container.scrollHeight;
  return div;
}

function addMsg(type, content, extra = {}) {
  if (!activeTabId) return;
  const msg = { id: Date.now() + '_' + Math.random().toString(36).slice(2, 6), type, content, ...extra };
  tabSessions[activeTabId].messages.push(msg);
  appendMessageElement(msg);
  return msg;
}

function addMsgToTab(tabId, type, content, extra = {}) {
  if (!tabSessions[tabId]) return;
  const msg = { id: Date.now() + '_' + Math.random().toString(36).slice(2, 6), type, content, ...extra };
  tabSessions[tabId].messages.push(msg);
  // Only append to DOM if this tab is active
  if (tabId === activeTabId) appendMessageElement(msg);
  return msg;
}

function addThinking(tabId) {
  const msg = addMsgToTab(tabId, 'thinking', '', { done: false });
  return msg?.id;
}

function updateThinking(id, content, done = false) {
  // Update in all sessions
  for (const session of Object.values(tabSessions)) {
    const msg = session.messages.find(m => m.id === id);
    if (msg) { msg.content = content; msg.done = done; }
  }
  // Update DOM
  const el = document.querySelector(`[data-msg-id="${id}"] .thinking-body`);
  if (el) el.textContent = content;
  const summary = document.querySelector(`[data-msg-id="${id}"] .thinking-summary`);
  if (summary && done) {
    summary.innerHTML = `<span>${t('thinkingDone')}</span>`;
    summary.querySelector('.thinking-dots')?.remove();
  }
}

function removeThinking(id) {
  updateThinking(id, '(aucun contenu)', true);
}

// ─── EVENTS ─────────────────────────────────────
// ─── NAVIGATION CONFIRMATION ────────────────────
function showNavConfirm(targetUrl, tabId) {
  return new Promise(resolve => {
    // Remove any existing dialog
    document.getElementById('nav-confirm-overlay')?.remove();

    const overlay = document.createElement('div');
    overlay.id = 'nav-confirm-overlay';
    overlay.className = 'nav-confirm-overlay';

    let domain = targetUrl;
    try { domain = new URL(targetUrl.startsWith('http') ? targetUrl : 'https://'+targetUrl).hostname; } catch(e) {}

    overlay.innerHTML = `
      <div class="nav-confirm-box">
        <div class="nav-confirm-icon">🌐</div>
        <div class="nav-confirm-title">${t('navConfirmTitle')}</div>
        <div class="nav-confirm-url">${domain}</div>
        <div class="nav-confirm-hint">${t('navConfirmHint')}</div>
        <label class="nav-confirm-remember">
          <input type="checkbox" id="nav-always-allow"/>
          <span>${t('navConfirmAlways')}</span>
        </label>
        <div class="nav-confirm-btns">
          <button class="btn btn-ghost" id="nav-cancel-btn">${t('navConfirmCancel')}</button>
          <button class="btn btn-primary" id="nav-ok-btn">${t('navConfirmOk')}</button>
        </div>
      </div>
    `;

    document.body.appendChild(overlay);
    requestAnimationFrame(() => overlay.classList.add('visible'));

    const cleanup = (result) => {
      const always = document.getElementById('nav-always-allow')?.checked;
      if (always && result) chrome.storage.local.set({ navAlwaysAllow: true });
      overlay.classList.remove('visible');
      setTimeout(() => overlay.remove(), 200);
      resolve(result);
    };

    document.getElementById('nav-ok-btn').addEventListener('click',     () => cleanup(true));
    document.getElementById('nav-cancel-btn').addEventListener('click', () => cleanup(false));
    overlay.addEventListener('click', e => { if (e.target === overlay) cleanup(false); });
  });
}

function setupEventListeners() {
  document.getElementById('send-btn').addEventListener('click', handleSend);
  document.getElementById('stop-btn').addEventListener('click', () => {
    stopRequested = true;
    globalAbortController?.abort();
    setStatus(t('statusStopping'), 'thinking');
  });

  const ta = document.getElementById('prompt-input');
  ta.addEventListener('keydown', e => { if (e.key === 'Enter' && !e.shiftKey) { e.preventDefault(); handleSend(); } });
  ta.addEventListener('input', e => { e.target.style.height = 'auto'; e.target.style.height = Math.min(e.target.scrollHeight, 110) + 'px'; });

  document.querySelectorAll('.qbtn').forEach(btn => {
    btn.addEventListener('click', () => { ta.value = btn.dataset.prompt; handleSend(); });
  });

  document.getElementById('clear-btn').addEventListener('click', () => {
    if (!activeTabId) return;
    tabSessions[activeTabId].messages = [];
    tabSessions[activeTabId].history = [];
    renderChat();
    setStatus(t('chatCleared'), 'idle');
  });

  document.getElementById('config-btn').addEventListener('click', () => {
    chrome.tabs.create({ url: chrome.runtime.getURL('config.html') });
  });

  document.body.addEventListener('click', e => {
    if (e.target.matches('[data-action="open-config"]')) {
      e.preventDefault();
      chrome.tabs.create({ url: chrome.runtime.getURL('config.html') });
    }
  });

  // Favicon error fallback handler
  document.body.addEventListener('error', e => {
    if (e.target.matches('img[data-fallback="none"]')) {
      e.target.style.display = 'none';
    }
  }, true);

  // Provider select
  document.getElementById('provider-select').addEventListener('change', e => {
    settings.currentProvider = e.target.value;
    chrome.storage.local.set({ currentProvider: settings.currentProvider });
    renderModelSelect();
    updateApiBanner();
    const p = (settings.configuredProviders || []).find(p => p.instanceId === settings.currentProvider);
    if (p) addMsg('system', `${p.emoji} ${p.name} — ${t('model')}: ${getCurrentModel() || t('noModel')}`);
  });

  document.getElementById('model-select').addEventListener('change', e => {
    const newModel = e.target.value;
    settings.providerSelectedModel[settings.currentProvider] = newModel;
    
    // Also update in configuredProviders for persistence
    const p = settings.configuredProviders.find(p => p.instanceId === settings.currentProvider);
    if (p) p.selectedModel = newModel;
    
    chrome.storage.local.set({ 
      providerSelectedModel: settings.providerSelectedModel,
      configuredProviders: settings.configuredProviders
    });
  });

  // Theme toggle (in header)
  document.getElementById('theme-toggle')?.addEventListener('change', e => {
    applyTheme(e.target.checked ? 'dark' : 'light');
    chrome.storage.local.set({ theme: settings.theme });
  });

  // Bug reporter
  document.getElementById('bug-btn').addEventListener('click', openBugPanel);
  document.getElementById('bug-close-btn').addEventListener('click', () => document.getElementById('bug-panel').classList.remove('show'));
  document.getElementById('bug-copy-btn').addEventListener('click', copyBugReport);

  // #5 & #6: Listen for tab changes AND storage changes from config page
  chrome.runtime.onMessage.addListener(msg => {
    if (msg.type === 'TAB_CHANGED') {
      const prevId = activeTabId;
      activeTabId = msg.tabId;
      ensureTabSession(msg.tabId, msg.url, msg.title);
      renderTabBar();
      if (prevId !== msg.tabId) renderChat();
      updateApiBanner();
      if (settings.autoDetectMode && msg.url) {
        const detected = detectModeFromUrl(msg.url);
        if (detected && detected !== settings.currentMode) {
          settings.currentMode = detected;
          chrome.storage.local.set({ currentMode: detected });
          renderModeBar();
          renderQuickActions();
          const mode = window.BrowserMindModes?.[detected];
          addMsg('system', `${mode?.icon || ''} ${t(mode?.labelKey || detected)} — ${t('modeAutoDetected')}`);
        }
      }
    }
    if (msg.type === 'TAB_UPDATED' && msg.tabId === activeTabId) {
      ensureTabSession(msg.tabId, msg.url, msg.title);
      renderTabBar();
    }
    // #6: Config page signals that settings changed
    if (msg.type === 'SETTINGS_SAVED') {
      refreshFromStorage();
      updateDebugButtonVisibility();
    }
  });

  // #6: Also watch storage changes directly
  chrome.storage.onChanged.addListener((changes, area) => {
    if (area !== 'local') return;
    const relevant = ['providerKeys', 'providerModels', 'providerSelectedModel', 'theme', 'currentProvider'];
    if (relevant.some(k => k in changes)) {
      refreshFromStorage();
    }
  });
}

function updateApiBanner() {
  const banner = document.getElementById('api-banner');
  const bannerProvider = document.getElementById('banner-provider');

  if (!banner || !bannerProvider) return;

  const key = settings.providerKeys[settings.currentProvider];
  const p = (settings.configuredProviders || []).find(p => p.instanceId === settings.currentProvider);
  const hasProviders = (settings.configuredProviders || []).length > 0;
  banner.classList.toggle('show', !key && hasProviders || !hasProviders);
  bannerProvider.textContent = p?.name || 'un provider';
}

// ─── STATUS ─────────────────────────────────────
function setStatus(text, state = 'idle') {
  document.getElementById('status-text').textContent = text;
  const dot = document.getElementById('sdot');
  dot.className = 'sdot';
  if (state === 'active') dot.classList.add('active');
  if (state === 'thinking') dot.classList.add('thinking');
  updateHeaderSummary();
}

// ─── HEADER COLLAPSE ────────────────────────────
let headerCollapsed = false;

function initHeaderCollapse() {
  const stored = localStorage.getItem('bm-header-collapsed');
  headerCollapsed = stored === '1';
  applyHeaderCollapse(false);

  // Button inside the full bar (to collapse)
  const btnFull = document.getElementById('collapse-btn');
  if (btnFull) {
    btnFull.addEventListener('click', () => {
      headerCollapsed = true;
      localStorage.setItem('bm-header-collapsed', '1');
      applyHeaderCollapse(true);
    });
  }
  // Button in the summary bar (to expand)
  const btnSummary = document.getElementById('collapse-btn-summary');
  if (btnSummary) {
    btnSummary.addEventListener('click', () => {
      headerCollapsed = false;
      localStorage.setItem('bm-header-collapsed', '0');
      applyHeaderCollapse(true);
    });
  }
}

function applyHeaderCollapse(animate) {
  const full    = document.getElementById('header-full');
  const summary = document.getElementById('header-summary');
  const btnFull = document.getElementById('collapse-btn');
  const btnSum  = document.getElementById('collapse-btn-summary');
  if (!full || !summary) return;

  if (animate) {
    full.style.transition    = 'max-height 0.22s ease, opacity 0.18s ease';
    summary.style.transition = 'max-height 0.22s ease, opacity 0.18s ease';
  }

  // chevronDown = ▾ (collapse),  arrowsUpDown with up = ▴ (expand)
  if (headerCollapsed) {
    full.classList.add('collapsed');
    summary.classList.remove('hidden');
    if (btnFull) btnFull.innerHTML = ICO('chevronDown', 14);
    if (btnSum)  btnSum.innerHTML  = ICO('arrowsUpDown', 14);
  } else {
    full.classList.remove('collapsed');
    summary.classList.add('hidden');
    if (btnFull) btnFull.innerHTML = ICO('chevronDown', 14);
    if (btnSum)  btnSum.innerHTML  = ICO('arrowsUpDown', 14);
  }
  updateHeaderSummary();
}

function updateHeaderSummary() {
  // Provider name
  const provEl = document.getElementById('summary-provider');
  if (provEl) {
    const pInst = (settings.configuredProviders || []).find(p => p.instanceId === settings.currentProvider);
    provEl.textContent = pInst?.name || settings.currentProvider || '—';
  }
  // Mode
  const modeEl = document.getElementById('summary-mode');
  if (modeEl) {
    const mode = window.BrowserMindModes?.[settings.currentMode];
    modeEl.textContent = mode ? `${mode.icon} ${t(mode.labelKey || mode.id)}` : settings.currentMode || '—';
  }
  // Active tab title
  const tabEl = document.getElementById('summary-tab');
  if (tabEl) {
    const session = activeTabId ? tabSessions[activeTabId] : null;
    const domain = session ? getDomain(session.url) : null;
    tabEl.textContent = session ? truncate(session.title || domain || 'Onglet', 20) : '—';
  }
  // Status
  const statusEl = document.getElementById('summary-status');
  if (statusEl) {
    const txt = document.getElementById('status-text')?.textContent || '';
    statusEl.textContent = txt;
  }
}

// ─── SEND ───────────────────────────────────────
async function handleSend() {
  if (isRunning) return;

  if (!navigator.onLine) {
    addMsg('error', t('noConnexion'));
    return;
  }

  const key = settings.providerKeys[settings.currentProvider];
  const pInst = (settings.configuredProviders || []).find(p => p.instanceId === settings.currentProvider);
  if (!key && !pInst?.key) {
    const pName = pInst?.name || 'ce provider';
    addMsg('error', `${t('apiKeyMissing')} ${pName} ${t('clickToConfig')}`);
    return;
  }

  const ta = document.getElementById('prompt-input');
  const prompt = ta.value.trim();
  if (!prompt) return;
  ta.value = ''; ta.style.height = 'auto';

  // #8: Lock task to the current tab
  const taskTabId = activeTabId;
  runningTabId = taskTabId;
  tabSessions[taskTabId].runningTaskId = Date.now();

  addMsgToTab(taskTabId, 'user', prompt);
  tabSessions[taskTabId].history.push({ role: 'user', content: prompt });

  isRunning = true; stopRequested = false;
  globalAbortController = new AbortController();
  document.getElementById('send-btn').disabled = true;
  document.getElementById('stop-btn').classList.add('visible');
  renderTabBar();

  try {
    await runAgentLoop(taskTabId);
  } finally {
    isRunning = false; stopRequested = false; runningTabId = null;
    globalAbortController?.abort(); globalAbortController = null;
    document.getElementById('send-btn').disabled = false;
    document.getElementById('stop-btn').classList.remove('visible');
    setStatus(t('statusReady'), 'idle');
    renderTabBar();
    if (settings.historyEnabled) await saveToHistory(taskTabId);
  }
}

// ─── AGENT LOOP ─────────────────────────────────
// #8: taskTabId is locked for the entire loop, regardless of user tab-switching
async function runAgentLoop(taskTabId, startIterations = 0) {
  const session = tabSessions[taskTabId];
  let iterations = startIterations;
  let emptyResponseRetries = 0;
  const maxEmptyRetries = 2;
  const maxIterationsPerCycle = settings.maxIterations;

  while (iterations < startIterations + maxIterationsPerCycle && !stopRequested) {
    iterations++;
    const maxForThisCycle = startIterations + maxIterationsPerCycle;
    setStatus(`${t('iteration')} ${iterations}/${maxForThisCycle} ${t('statusThinking')}`, 'thinking');

    const pageContext = await bg('GET_PAGE_CONTEXT', { tabId: taskTabId });
    const thinkingId = addThinking(taskTabId);

    let response;
    try {
      response = await callAPI(pageContext.context, session.history);
    } catch (err) {
      // Log to internal error log (accessible via bug panel)
      logError('API_ERROR', err.message);
      if (err.stack) logError('API_STACK', err.stack.substring(0, 500));
      const thinkingEl = document.querySelector(`[data-msg-id="${thinkingId}"]`);
      if (thinkingEl) {
        const body = thinkingEl.querySelector('.thinking-body');
        if (body) body.textContent = `Erreur: ${err.message}`;
        const summary = thinkingEl.querySelector('.thinking-summary');
        if (summary) summary.innerHTML = `<span style="color:var(--error)">Erreur</span>`;
      }
      // Marquer la réflexion comme terminée
      const msg = tabSessions[taskTabId]?.messages.find(m => m.id === thinkingId);
      if (msg) { msg.done = true; msg.content = `${t('error')}: ${err.message}`; }
      
      if (err.isRateLimit) {
        const w = err.retryAfter || 60;
        addMsgToTab(taskTabId, 'error', `⏱ ${t('rateLimit')} ${w}s…`);
        setStatus(`${t('rateLimitWait')} ${w}s`, 'thinking');
        await sleep(w * 1000);
        if (!stopRequested) iterations--;
        continue;
      }
      addMsgToTab(taskTabId, 'error', `${t('apiError')} ${err.message}`);
      return;
    }

    const providerInstance = (settings.configuredProviders || []).find(p => p.instanceId === settings.currentProvider);
    const typeId = providerInstance?.typeId || settings.currentProvider;
    const isOAI = PROVIDER_DEFS[typeId]?.type === 'openai';
    const blocks = isOAI ? normalizeOAI(response) : (response.content || []);
    
    // Debug: log response structure
    // console.log('BrowserMind debug - response:', JSON.stringify(response).substring(0, 500));
    // console.log('BrowserMind debug - isOAI:', isOAI, 'blocks:', blocks.length);
    
    const textBlocks = blocks.filter(b => b.type === 'text');
    const toolBlocks = blocks.filter(b => b.type === 'tool_use');
    const textContent = textBlocks.map(b => b.text).join('\n').trim();

    // Log to internal errorLog (accessible via bug panel)
    logError('RESPONSE', `textBlocks=${textBlocks.length}, toolBlocks=${toolBlocks.length}, textContent=${textContent ? textContent.substring(0,200) : 'empty'}`);
    if (response && response.choices && response.choices[0]) {
      logError('RESPONSE_DETAIL', `message=${JSON.stringify(response.choices[0].message).substring(0,300)}`);
    }

    // Handle empty response - retry with hint
    if (textBlocks.length === 0 && toolBlocks.length === 0) {
      logError('EMPTY_RESPONSE', `Retry ${emptyResponseRetries + 1}/${maxEmptyRetries}`);
      const msg = response.choices?.[0]?.message;
      const refusal = msg?.refusal || msg?.provider_specific_fields?.refusal;
      const reasoning = msg?.reasoning || msg?.provider_specific_fields?.reasoning;
      
      if (refusal) {
        addMsgToTab(taskTabId, 'error', `${t('refusal')} ${refusal}`);
        logError('REFUSAL', refusal);
        setStatus(t('statusRefusal'), 'idle');
        return;
      }
      
      if (reasoning) {
        logError('REASONING', reasoning.substring(0, 200));
        addMsgToTab(taskTabId, 'thinking', `Raison: ${reasoning.substring(0, 200)}`);
      }
      
      emptyResponseRetries++;
      
      if (emptyResponseRetries >= maxEmptyRetries) {
        addMsgToTab(taskTabId, 'error', t('emptyResponse'));
        setStatus(t('statusFailEmpty'), 'idle');
        return;
      }
      
      // Add a hint to encourage the model to use tools
      const hintMsg = {
        fr: 'Continue. Utilise les outils disponibles pour accomplir la tâche.',
        en: 'Continue. Use the available tools to complete the task.',
        es: 'Continúa. Usa las herramientas disponibles para completar la tarea.',
        it: 'Continua. Usa gli strumenti disponibili per completare il compito.',
        de: 'Fortfahren. Verwenden Sie die verfügbaren Tools, um die Aufgabe zu erledigen.',
        pt: 'Continue. Use as ferramentas disponíveis para completar a tarefa.'
      };
      session.history.push({ role: 'user', content: hintMsg[settings.uiLang] || hintMsg.fr });
      setStatus(t('statusRetry'), 'thinking');
      continue;
    }

    // Reset retry counter on successful response
    emptyResponseRetries = 0;

    // Afficher la réflexion seulement si elle contient quelque chose de significatif
    const displayContent = textContent 
      ? textContent 
      : (toolBlocks.length > 0 ? t('actionsInProgress') : t('noAction'));
    updateThinking(thinkingId, displayContent, true);

    // ── FIX #1 : sauvegarder le message assistant avec tool_calls pour OAI ──────
    // Pour OAI : l'assistant message DOIT contenir tool_calls si des outils sont appelés.
    // Sans ça, les tool_call_id dans les résultats ne correspondent à rien → erreur 400.
    // Pour Anthropic : on sauvegarde les blocks complets (text + tool_use).
    if (isOAI) {
      const assistantMsg = { role: 'assistant', content: textContent || null };
      if (toolBlocks.length > 0) {
        assistantMsg.tool_calls = toolBlocks.map(tb => ({
          id: tb.id || ('tool_' + Date.now() + '_' + tb.name),
          type: 'function',
          function: { name: tb.name, arguments: JSON.stringify(tb.input) }
        }));
      }
      session.history.push(assistantMsg);
      if (textContent && settings.memoryEnabled) autoExtractMemory(textContent);
    } else {
      // Anthropic : toujours sauvegarder les blocks (texte + tool_use ensemble)
      if (blocks.length > 0) {
        session.history.push({ role: 'assistant', content: blocks });
        if (textContent && settings.memoryEnabled) autoExtractMemory(textContent);
      }
    }

    if (textContent) {
      addMsgToTab(taskTabId, 'assistant', textContent);
    }

    if (toolBlocks.length === 0) { setStatus(t('statusDone'), 'idle'); return; }

    setStatus(`⚡ ${toolBlocks.length} ${t('statusActions')}`, 'active');
    addMsgToTab(taskTabId, 'action', '', { actions: toolBlocks.map(tb => ({ tool: tb.name, input: tb.input, status: t('stepStatus').pending })) });

    // Exécuter les outils séquentiellement pour les outils DOM (plus sûr),
    // en parallèle uniquement pour les outils non-DOM (navigate, download, wait)
    const DOM_TOOLS = new Set(['click', 'type_text', 'scroll', 'fill_form', 'extract_data', 'get_page_content']);
    const domTools   = toolBlocks.filter(tb => DOM_TOOLS.has(tb.name));
    const asyncTools = toolBlocks.filter(tb => !DOM_TOOLS.has(tb.name));

    async function execTool(tool) {
      if (stopRequested) return { tool, toolResult: null, result: { error: 'Stopped' } };

      // ── Navigation guard ──────────────────────────────────────────
      // If the tool wants to navigate away and user hasn't set "always allow",
      // show a confirmation dialog (unless navAllowed is set in storage)
      if (tool.name === 'navigate' && tool.input?.url) {
        const stored = await new Promise(r => chrome.storage.local.get(['navAlwaysAllow'], r));
        if (!stored.navAlwaysAllow) {
          const currentUrl = tabSessions[taskTabId]?.url || '';
          const targetUrl  = tool.input.url;
          // Only ask if navigating to a different domain
          const currentDomain = currentUrl ? new URL(currentUrl).hostname : '';
          let targetDomain = '';
          try { targetDomain = new URL(targetUrl.startsWith('http') ? targetUrl : 'https://'+targetUrl).hostname; } catch(e) {}
          if (targetDomain && currentDomain && targetDomain !== currentDomain) {
            const confirmed = await showNavConfirm(targetUrl, taskTabId);
            if (!confirmed) {
              return { tool, toolResult: null, result: { error: 'Navigation annulée par l\'utilisateur.', cancelled: true } };
            }
          }
        }
      }
      // ─────────────────────────────────────────────────────────────

      // Garantir un id stable pour faire correspondre tool_call_id ↔ tool_result
      const toolId = tool.id || ('tool_' + Date.now() + '_' + tool.name);
      tool.id = toolId; // réinjecter pour que l'historique soit cohérent
      setStatus(`⚡ ${t('toolLabel')[tool.name]}…`, 'active');

      let result;
      let retries = 2;
      while (retries > 0) {
        try {
          result = await bg('EXECUTE_TOOL', { tool: tool.name, input: tool.input, tabId: taskTabId });
          result = result.result || result;
          break;
        } catch (e) {
          retries--;
          if (retries === 0) {
            result = { error: e.message };
            logError('TOOL_ERROR', e.message, { tool: tool.name });
          } else {
            await sleep(500);
          }
        }
      }

      if (tool.name === 'generate_document' && result.success) {
        addMsgToTab(taskTabId, 'export', '', { format: tool.input.format, filename: result.filename });
      }

      const toolResult = isOAI
        ? { role: 'tool', tool_call_id: toolId, content: JSON.stringify(result) }
        : { type: 'tool_result', tool_use_id: toolId, content: JSON.stringify(result) };

      return { tool, toolResult, result };
    }

    // DOM tools : séquentiels (évite les collisions d'interactions page)
    const domResults = [];
    for (const tool of domTools) {
      if (stopRequested) break;
      domResults.push(await execTool(tool));
    }
    // Outils non-DOM : parallèles (navigate, download, wait, screenshot…)
    const asyncResults = stopRequested ? [] : await Promise.all(asyncTools.map(execTool));

    // Reconstituer l'ordre original pour l'historique
    const toolResults = toolBlocks.map(tb =>
      domResults.find(r => r.tool === tb) || asyncResults.find(r => r.tool === tb)
    ).filter(Boolean);

    // ── FIX #2 : tool_results dans l'historique ──────────────────────────────
    // OAI : chaque résultat est un message { role:'tool', ... } individuel — OK
    // Anthropic : les tool_result DOIVENT être regroupés dans UN SEUL message user
    //   { role:'user', content: [ {type:'tool_result', ...}, ... ] }
    //   Pousser individuellement → erreur 400 à l'itération suivante.
    const validResults = toolResults.filter(r => r.toolResult);
    if (validResults.length > 0) {
      if (isOAI) {
        validResults.forEach(({ toolResult }) => session.history.push(toolResult));
      } else {
        // Anthropic : un seul message user contenant tous les tool_results
        session.history.push({
          role: 'user',
          content: validResults.map(r => r.toolResult)
        });
      }
    }
  }

  const maxForThisCycle = startIterations + maxIterationsPerCycle;
  if (iterations >= maxForThisCycle) {
    const msg = addMsgToTab(taskTabId, 'system', `⚠ ${t('maxIterations')} ${maxForThisCycle} ${t('iterationsReached')} ${t('maxIterationsContinue')}`);
    const msgEl = document.querySelector(`[data-msg-id="${msg.id}"]`);
    if (msgEl) {
      const btn = document.createElement('button');
      btn.className = 'btn btn-primary';
      btn.style.cssText = 'margin-top:8px;font-size:12px;padding:4px 12px;';
      btn.textContent = t('maxIterationsBtn');
      btn.onclick = () => { btn.remove(); runAgentLoop(taskTabId, iterations); };
      msgEl.appendChild(btn);
    }
  }
}

// ─── API CALL ────────────────────────────────────
async function callAPI(pageContext, history) {
  const instanceId = settings.currentProvider;
  // Lookup in configuredProviders for full info
  const providerInstance = (settings.configuredProviders || []).find(p => p.instanceId === instanceId);
  const typeId = providerInstance?.typeId || instanceId;
  const def = PROVIDER_DEFS[typeId] || { type: 'openai' };
  const isOAI = def?.type === 'openai';
  const apiKey = settings.providerKeys[instanceId] || providerInstance?.key;
  const model = getCurrentModel();
  const baseUrl = providerInstance?.customUrl || (typeId.startsWith('custom_')
    ? settings.providerCustomUrl[instanceId]
    : PROVIDER_URLS[typeId]);

  const pName = providerInstance?.name || def?.name || typeId;
  if (!apiKey)  throw new Error(`${t('apiKeyMissing')} ${pName}`);
  if (!model)   throw new Error(t('noModelSelected'));
  if (!baseUrl) throw new Error(t('baseUrlNotConfigured'));

  const memCtx = settings.memoryEnabled && persistentMemory.length > 0
    ? '\n\nMÉMOIRE:\n' + persistentMemory.map(m => `- ${m.key}: ${m.value}`).join('\n') : '';

  const langMap = { fr: 'français', en: 'English', de: 'Deutsch', es: 'Español' };
  const lang = langMap[settings.agentLang] || 'français';

  const userPrompt = settings.userSystemPrompt ? settings.userSystemPrompt + '\n\n' : '';
  const tier = getModelTier(model);
  const bpSetting = settings.bestPractices || 'auto';
  let bp = '';
  if (bpSetting === 'always' || (bpSetting === 'auto' && tier !== 'high')) {
    bp = tier === 'low' ? BEST_PRACTICES.full : BEST_PRACTICES.light;
  }
  
  const mode = (window.BrowserMindModes?.[settings.currentMode])
            || (window._customModes?.[settings.currentMode])
            || window.BrowserMindModes?.libre;
  const modeExtra = mode?.systemPromptExtra ? '\n\n' + mode.systemPromptExtra : '';
  
  const sys = userPrompt + `Tu es BrowserMind, un agent de navigation web intelligent.${modeExtra}\n\nCONTEXTE PAGE: ${pageContext}${memCtx}\n\nDIRECTIVES:\n- Utilise les outils pour accomplir la tâche\n- Explique brièvement chaque étape\n- Si une action échoue, essaie une alternative\n- Pour exporter des données: utilise generate_document (formats: csv, html, json, md, txt)\n- Donne TOUJOURS un nom de fichier descriptif et explicite au paramètre "filename" (ex: "contacts-linkedin-2024.csv", "rapport-amazon-prix.html"), jamais "export" générique\n- Pour mémoriser: commence par [MÉMORISE: clé=valeur]\n- NAVIGATION: Évite de quitter la page courante sauf si c\'est strictement nécessaire. Préfère web_search pour les informations externes, ou new_tab pour ouvrir un autre site sans quitter la page. N\'utilise navigate (qui change la page courante) que si la tâche l\'exige explicitement.\n- Réponds TOUJOURS en ${lang}${bp}`;

  const trimmed = trimHistory(history, settings.maxInputTokens);
  logError('REQUEST', `provider=${typeId}, model=${model}, url=${baseUrl}, messages=${trimmed.length}, mode=${settings.currentMode}`);

  let headers, body;

  if (isOAI) {
    headers = { 'Content-Type': 'application/json', 'Authorization': `Bearer ${apiKey}` };
    if (typeId === 'openrouter') { headers['HTTP-Referer'] = 'https://browsermind.ext'; headers['X-Title'] = 'BrowserMind'; }
    if (typeId === 'zai') headers['Content-Type'] = 'application/json; charset=utf-8';
    body = { model, max_tokens: 4096, messages: [{ role: 'system', content: sys }, ...trimmed], tools: oaiTools(settings.currentMode) };
    if (typeId === 'xai') body.tool_choice = 'auto';
  } else {
    headers = { 'Content-Type': 'application/json', 'x-api-key': apiKey, 'anthropic-version': '2023-06-01', 'anthropic-dangerous-direct-browser-access': 'true' };
    body = { model, max_tokens: 4096, system: sys, messages: trimmed, tools: antTools(settings.currentMode) };
  }

  const timeoutController = new AbortController();
  const timeoutId = setTimeout(() => timeoutController.abort(), 120000);
  let signal;
  if (globalAbortController && typeof AbortSignal.any === 'function') {
    signal = AbortSignal.any([globalAbortController.signal, timeoutController.signal]);
  } else if (globalAbortController) {
    const onAbort = () => timeoutController.abort();
    globalAbortController.signal.addEventListener('abort', onAbort, { once: true });
    signal = timeoutController.signal;
  } else {
    signal = timeoutController.signal;
  }

  let res;
  try {
    res = await fetch(baseUrl, { method: 'POST', headers, body: JSON.stringify(body), signal });
  } catch (e) {
    clearTimeout(timeoutId);
    if (e.name === 'AbortError') {
      if (stopRequested) throw new Error('Arrêté par l\'utilisateur');
      throw new Error('Délai d\'attente dépassé (120s) - Pas de réponse du serveur');
    }
    throw e;
  }
  clearTimeout(timeoutId);

  if (res.status === 429) {
    const retry = parseInt(res.headers.get('retry-after') || '60');
    const e = new Error('Rate limit'); e.isRateLimit = true; e.retryAfter = retry; throw e;
  }
  if (!res.ok) {
    const errText = await res.text();
    logError('HTTP_ERROR', `status=${res.status}, body=${errText.substring(0, 300)}`);
    let err = {};
    try { err = JSON.parse(errText); } catch (_) {}
    if (err.error?.type === 'rate_limit_error') {
      const e = new Error(err.error.message); e.isRateLimit = true; e.retryAfter = 60; throw e;
    }
    throw new Error(err.error?.message || `HTTP ${res.status}: ${errText.substring(0, 100)}`);
  }
  const responseData = await res.json();
  logError('API_RESPONSE', `status=${res.status}, keys=${Object.keys(responseData).join(',')}`);
  return responseData;
}

function getCurrentModel() {
  return settings.providerSelectedModel[settings.currentProvider] || '';
}

// ─── TOOL DEFINITIONS ───────────────────────────
function antTools(modeId) {
  // Use registry if available (Passe B), fallback to builtin list
  if (window.ToolRegistry) {
    const tools = window.ToolRegistry.getForMode(modeId);
    return tools.map(t => ({ name: t.name, description: t.description, input_schema: t.input_schema }));
  }
  // Fallback: native tools only (should not happen in normal flow)
  return window.ToolRegistry?.NATIVE_TOOLS?.map(t => ({
    name: t.name, description: t.description, input_schema: t.input_schema
  })) || [];
}

function oaiTools(modeId) {
  return antTools(modeId).map(t => ({ type: 'function', function: { name: t.name, description: t.description, parameters: t.input_schema } }));
}

// ─── RESPONSE NORMALIZER ────────────────────────
function normalizeOAI(response) {
  const blocks = [];
  const msg = response.choices?.[0]?.message;
  if (!msg) { logError('NORMALIZE', 'no message'); return blocks; }
  logError('NORMALIZE', `content=${!!msg.content}, tools=${!!msg.tool_calls}`);
  if (msg.content) blocks.push({ type: 'text', text: msg.content });
  if (msg.tool_calls) { for (const tc of msg.tool_calls) { let input = {}; try { input = JSON.parse(tc.function.arguments); } catch (e) {} blocks.push({ type: 'tool_use', id: tc.id, name: tc.function.name, input }); } }
  return blocks;
}

// ─── HISTORY ────────────────────────────────────
async function saveToHistory(tabId) {
  const session = tabSessions[tabId];
  if (!session || session.messages.length === 0) return;
  const userMessages = session.messages.filter(m => m.type === 'user');
  if (userMessages.length === 0) return;

  const id = `${tabId}_${session.createdAt}`;
  const entry = {
    id, tabId, url: session.url,
    title: session.title || getDomain(session.url),
    provider: settings.currentProvider,
    model: getCurrentModel(),
    firstMessage: userMessages[0]?.content?.substring(0, 100) || '',
    summary: userMessages.map(m => m.content).join(' ').substring(0, 200),
    messageCount: session.messages.length,
    messages: session.messages,
    apiHistory: session.history,
    createdAt: session.createdAt,
    updatedAt: Date.now(),
  };

  const { historyIndex } = await chrome.storage.local.get('historyIndex');
  const index = (historyIndex || []).filter(i => i !== id);
  index.unshift(id);
  await chrome.storage.local.set({ [`hist_${id}`]: entry, historyIndex: index.slice(0, 200) });
}

// ─── HISTORY TRIMMER ────────────────────────────
function trimHistory(history, maxTokens) {
  const maxChars = maxTokens * 4;
  let total = 0;
  const result = [];
  for (let i = history.length - 1; i >= 0; i--) {
    const content = typeof history[i].content === 'string' ? history[i].content : JSON.stringify(history[i].content);
    total += content.length;
    if (total > maxChars && result.length > 0) break;
    result.unshift(history[i]);
  }
  return result;
}

// ─── MEMORY ─────────────────────────────────────
function autoExtractMemory(text) {
  const re = /\[MÉMORISE:\s*([^=\]]+)=([^\]]+)\]/gi;
  let m;
  while ((m = re.exec(text)) !== null) saveMemory(m[1].trim(), m[2].trim());
}

async function saveMemory(key, value) {
  const idx = persistentMemory.findIndex(m => m.key.toLowerCase() === key.toLowerCase());
  const entry = { key, value, timestamp: Date.now() };
  if (idx >= 0) persistentMemory[idx] = entry; else persistentMemory.push(entry);
  await chrome.storage.local.set({ persistentMemory });
}

// ─── BUG REPORTER ────────────────────────────────
function logError(type, msg, ctx = {}) {
  errorLog.push({ type, msg, ctx, ts: new Date().toISOString(), provider: settings.currentProvider });
  if (errorLog.length > 50) errorLog.shift();
}

function openBugPanel() {
  const panel = document.getElementById('bug-panel');
  panel.classList.add('show');
  document.getElementById('bug-desc').value = '';
  document.getElementById('bug-log').textContent = buildBugLog();
}

function buildBugLog() {
  const session = activeTabId ? tabSessions[activeTabId] : null;
  return [
    `BrowserMind v5.1.0 — Bug Report`,
    `Date: ${new Date().toISOString()}`,
    `Provider: ${settings.currentProvider}`,
    `Model: ${getCurrentModel()}`,
    `Tab: ${session?.url || '—'}`,
    `Messages: ${session?.messages.length || 0}`,
    ``,
    `Errors (${errorLog.length}):`,
    ...errorLog.slice(-20).map(e => `[${e.ts}] ${e.type}: ${e.msg}${Object.keys(e.ctx).length ? ' | ' + JSON.stringify(e.ctx) : ''}`),
  ].join('\n');
}

async function copyBugReport() {
  const desc = document.getElementById('bug-desc').value.trim();
  const log = buildBugLog();
  const report = `## 🐛 Bug Report BrowserMind\n\n### Description\n${desc || '(non renseigné)'}\n\n### Log\n\`\`\`\n${log}\n\`\`\``;
  try {
    await navigator.clipboard.writeText(report);
    const btn = document.getElementById('bug-copy-btn');
    btn.textContent = '✅ Copié !';
    setTimeout(() => { btn.textContent = t('bugCopyBtn'); }, 2500);
  } catch (e) {
    window.prompt('Copiez ce rapport:', report);
  }
}

// ─── HELPERS ─────────────────────────────────────
async function bg(type, data) {
  return new Promise((res, rej) => {
    chrome.runtime.sendMessage({ type, ...data }, r => {
      if (chrome.runtime.lastError) rej(new Error(chrome.runtime.lastError.message));
      else res(r);
    });
  });
}

function toolIcon(t) {
  return { click:'👆', type_text:'⌨️', scroll:'📜', navigate:'🔗', get_page_content:'📄',
           fill_form:'📝', extract_data:'📊', download_file:'⬇️', wait:'⏳',
           take_screenshot:'📸', generate_document:'📁' }[t] || '⚡';
}

function toolLabel(toolName) {
  const labels = t('toolLabel');
  return labels[toolName] || toolName;
}

function formatActionText({ tool, input }) {
  if (tool === 'click') return `${t('toolLabel').click || 'Clic'}: <code>${escHtml(input.selector)}</code>`;
  if (tool === 'type_text') return `${t('toolLabel').type_text || 'Saisie'} "${escHtml((input.text||'').substring(0,30))}" → <code>${escHtml(input.selector)}</code>`;
  if (tool === 'navigate') return `→ ${escHtml((input.url||'').substring(0,50))}`;
  if (tool === 'fill_form') return `${t('toolLabel').fill_form || 'Remplissage'} ${input.fields?.length} champs`;
  if (tool === 'generate_document') return `${t('toolLabel').generate_document || 'Export'} ${(input.format||'').toUpperCase()}: <code>${escHtml(input.filename||'')}</code>`;
  if (tool === 'scroll') return `Scroll ${input.direction}`;
  return toolLabel(tool);
}

function getDomain(url) {
  try { return new URL(url || '').hostname; } catch { return url || ''; }
}
function truncate(str, n) { return str.length > n ? str.substring(0, n) + '…' : str; }
function sleep(ms) { return new Promise(r => setTimeout(r, ms)); }
function escHtml(s) {
  return String(s || '').replace(/&/g,'&amp;').replace(/</g,'&lt;').replace(/>/g,'&gt;').replace(/"/g,'&quot;');
}
