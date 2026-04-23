// ═══════════════════════════════════════════════
//  BrowserMind v1.0.0 — Config Page Logic
// ═══════════════════════════════════════════════

// ─── TRANSLATIONS FOR CONFIG PAGE ──────────────
const I18N_CONFIG = {
  fr: {
    selectProviderType: 'Sélectionnez un type de provider.',
    apiKeyRequired: 'La clé API est requise.',
    baseUrlRequired: "L'URL de base est requise pour un provider custom.",
    providerAdded: 'Provider ajouté avec succès.',
    testSuccess: '✅ Connexion réussie',
    testFailed: '❌ Échec',
    noMemoryEntries: 'Aucune entrée en mémoire persistante.',
    noHistorySaved: 'Aucun historique sauvegardé.',
    backToChat: 'Retour au chat',
    unsavedChanges: 'Non sauvegardé',
    saved: 'Sauvegardé',
    addProvider: 'Ajouter un provider',
    providersConfigured: 'provider(s) configuré(s)',
    memoryExported: 'Mémoire exportée',
    memoryCleared: 'Mémoire effacée',
    historyCleared: 'Historique effacé',
    configTitle: 'BrowserMind — Configuration',
    tabProviders: '🔌 Providers', tabGeneral: '⚙ Général', tabMemory: '💾 Mémoire', tabHistory: '📚 Historique',
    newProviderTitle: '➕ Nouveau provider', providerTypeLabel: 'Type de provider', selectPlaceholder: '— Sélectionner —',
    baseUrlLabel: 'URL de base', displayNameLabel: 'Nom affiché (optionnel)', apiKeyLabel: 'Clé API',
    addProviderBtn: '✅ Ajouter ce provider', cancelBtn: 'Annuler',
    noProviderConfigured: 'Aucun provider configuré.', clickToAddProvider: 'Cliquez "Ajouter un provider" pour commencer.',
    agentBehavior: "Comportement de l'agent", maxIterationsLabel: 'Max itérations par requête',
    maxIterationsHint: 'Nombre maximum de tours avant d\'arrêter. Plus élevé = tâches plus complexes.',
    maxTokensLabel: 'Max tokens de contexte (garde-fou)',
    maxTokensHint: 'Réduire si erreur "rate limit input tokens". ~4 chars = 1 token.',
    maxTabSessionsLabel: 'Nombre max d\'onglets',
    maxTabSessionsHint: 'Limite du nombre d\'onglets dans l\'extension. Les plus anciens sont fermés automatiquement.',
    memoryContext: 'Mémoire & contexte', enableMemory: 'Activer la mémoire persistante entre sessions',
    saveHistory: 'Sauvegarder l\'historique des conversations', retentionLabel: 'Durée de conservation de l\'historique',
    retention7d: '7 jours', retention30d: '30 jours', retention90d: '90 jours', retention1y: '1 an', retentionForever: 'Indéfiniment',
    uiSection: 'Interface', uiLangLabel: "Langue de l'interface", agentLangLabel: "Langue de l'agent",
    thinkingCollapsedLabel: 'Réflexion rétractée par défaut',
    highlightClicksLabel: 'Surbrillance des éléments cliqués',
    debugModeLabel: 'Mode debug (bouton de signalement de bug)',
    bestPracticesLabel: 'Aide au modèle (best practices)',
    bestPracticesHint: 'Ajoute des instructions détaillées pour guider les modèles moins puissants. Auto = détecté selon le modèle.',
    bestPracticesAuto: 'Auto (selon le modèle)', bestPracticesAlways: 'Toujours activé', bestPracticesNever: 'Jamais',
    searchMemory: '🔍 Rechercher...', exportBtn: '⬇ Exporter', clearAllBtn: '🗑 Tout effacer',
    memoryKeyPh: 'Clé...', memoryValPh: 'Valeur...', memoryAddBtn: '+ Ajouter',
    searchHistory: '🔍 Rechercher dans l\'historique...',
    saveBtn: '💾 Sauvegarder',
    ollamaHint: 'Ex: http://localhost:11434/v1 pour Ollama',
    apiKeyPlaceholder: 'Votre clé API...',
    deleteConfirm: 'Supprimer ce provider ?',
    thinkingDefault: 'Réflexion rétractée par défaut',
    active: '✓ Actif', activate: '▶ Activer', useProvider: 'Utiliser ce provider',
    deleteProvider: 'Supprimer ce provider', testConnection: 'Tester la connexion', testBtn: '🔌 Test',
    defaultModel: 'Modèle par défaut', clickRefresh: '— Cliquer "↻ Actualiser" —',
    refreshModels: 'Récupérer les modèles disponibles', refreshBtn: '↻ Actualiser',
    apiKeyMissing: '⚠ Clé API manquante', noResults: 'Aucun résultat.',
    historyHint: 'Les conversations apparaîtront ici après votre première session.',
    deleteTitle: 'Supprimer', providerCountLabel: 'provider(s) configuré(s)',
    markUnsaved: 'Modifications non sauvegardées', changesSaved: '✅ Sauvegardé',
    systemPromptLabel: 'Prompt système personnalisé',
    systemPromptHint: 'Instructions ajoutées au prompt système de l\'agent. Laissez vide pour utiliser le comportement par défaut.',
    systemPromptPlaceholder: "Ex: Tu es un utilisateur qui cherche des offres d'emploi en France, navigue calmement, évite les actions automatiques...",
    tabModes: '🎯 Modes',
    tabTools: '🔧 Outils',
    nativeModes: 'Modes natifs',
    customModes: 'Mes modes personnalisés',
    addModeBtn: '+ Créer un mode',
    noCustomModes: 'Aucun mode personnalisé.',
    modeIconLabel: 'Icône',
    modeIdLabel: 'Identifiant (snake_case)',
    modeLabelLabel: 'Nom affiché',
    modeDescLabel: 'Description courte',
    modePromptLabel: 'Prompt système',
    modeToolsLabel: 'Outils autorisés',
    modeToolsAll: 'Tous les outils (*)',
    modeUrlsLabel: 'URL patterns (optionnel)',
    modeUrlsHint: 'Domaines séparés par virgules. Auto-détection.',
    newModeTitle: 'Nouveau mode',
    editModeTitle: 'Modifier le mode',
    modeIdExists: 'Cet identifiant est déjà utilisé par un mode natif.',
    modeIdDuplicate: 'Un mode avec cet identifiant existe déjà.',
    modeRequiredFields: 'L\'identifiant et le nom affiché sont requis.',
    modeIdFormat: 'L\'identifiant doit être en snake_case.',
    modeDeleteConfirm: 'Supprimer ce mode ?',
    remoteToolsTitle: '📡 Outils distants',
    remoteToolsUrlLabel: 'URL du registre distant',
    remoteToolsLoadBtn: '↻ Charger',
    remoteToolsUrlHint: 'Fichier JSON public contenant un tableau d\'outils.',
    remoteToolsLoading: '⏳ Chargement…',
    remoteToolsUrlRequired: '⚠️ Entrez une URL valide.',
    remoteToolsError: '❌ Erreur :',
    customToolsTitle: '🛠️ Mes outils personnalisés',
    addToolBtn: '+ Ajouter un outil',
    noCustomTools: 'Aucun outil personnalisé.',
    nativeToolsTitle: '📋 Outils natifs (référence)',
    nativeToolsHint: 'Ces outils sont intégrés et ne peuvent pas être modifiés.',
    toolNameLabel: 'Identifiant (snake_case unique)',
    toolIconLabel: 'Icône (emoji)',
    toolDisplayLabel: 'Nom affiché',
    toolDescLabel: 'Description (vue par le LLM)',
    toolSchemaLabel: 'Paramètres (JSON Schema)',
    toolSchemaHint: 'Schéma JSON des paramètres d\'entrée.',
    toolSchemaExample: 'Voir un exemple',
    toolExecutorLabel: 'Exécuteur',
    toolExecutorNone: 'Aucun (outil déclaratif)',
    toolExecutorInject: 'inject — Script JS injecté dans la page',
    toolInjectLabel: 'Script JS (function body)',
    toolInjectHint: '⚠️ Le script est injecté dans la page active.',
    newToolTitle: 'Nouvel outil',
    editToolTitle: 'Modifier l\'outil',
    toolRequiredFields: 'Identifiant, description et paramètres sont requis.',
    toolIdFormat: 'L\'identifiant doit être en snake_case.',
    toolIdDuplicate: 'Un outil avec cet identifiant existe déjà.',
    toolSchemaInvalid: 'JSON Schema invalide :',
    toolDeleteConfirm: 'Supprimer cet outil ?',
    badgeNative: 'natif',
    badgeRemote: 'distant',
    badgeCustom: 'custom',
    autoDetectMode: 'Détection automatique du mode selon l\'URL visitée',
    aboutTitle: 'À propos', aboutWebsite: '🌐 mapiTools', aboutSupport: '☕ Soutenir',
    modeLibre: 'Libre', modeVoyage: 'Voyage', modeRecherche: 'Recherche',
    modeAnalyse: 'Analyse', modeExtraction: 'Extraction', modeAdministratif: 'Administratif',
    modeShopping: 'Shopping', modeVeille: 'Veille', modeCuisine: 'Cuisine',
    modeImmobilier: 'Immobilier', modeEmploi: 'Emploi', modeEducation: 'Éducation',
  },
  en: {
    selectProviderType: 'Select a provider type.',
    apiKeyRequired: 'API key is required.',
    baseUrlRequired: 'Base URL is required for a custom provider.',
    providerAdded: 'Provider added successfully.',
    testSuccess: '✅ Connection successful',
    testFailed: '❌ Failed',
    noMemoryEntries: 'No persistent memory entries.',
    noHistorySaved: 'No saved history.',
    backToChat: 'Back to chat',
    unsavedChanges: 'Unsaved',
    saved: 'Saved',
    addProvider: 'Add provider',
    providersConfigured: 'provider(s) configured',
    memoryExported: 'Memory exported',
    memoryCleared: 'Memory cleared',
    historyCleared: 'History cleared',
    configTitle: 'BrowserMind — Configuration',
    tabProviders: '🔌 Providers', tabGeneral: '⚙ General', tabMemory: '💾 Memory', tabHistory: '📚 History',
    newProviderTitle: '➕ New provider', providerTypeLabel: 'Provider type', selectPlaceholder: '— Select —',
    baseUrlLabel: 'Base URL', displayNameLabel: 'Display name (optional)', apiKeyLabel: 'API key',
    addProviderBtn: '✅ Add this provider', cancelBtn: 'Cancel',
    noProviderConfigured: 'No provider configured.', clickToAddProvider: 'Click "Add provider" to get started.',
    agentBehavior: 'Agent behavior', maxIterationsLabel: 'Max iterations per request',
    maxIterationsHint: 'Maximum rounds before stopping. Higher = more complex tasks.',
    maxTokensLabel: 'Max context tokens (safeguard)',
    maxTokensHint: 'Reduce if "rate limit input tokens" error. ~4 chars = 1 token.',
    maxTabSessionsLabel: 'Max tab sessions',
    maxTabSessionsHint: 'Limit of tab sessions in the extension. Oldest are closed automatically.',
    memoryContext: 'Memory & context', enableMemory: 'Enable persistent memory across sessions',
    saveHistory: 'Save conversation history', retentionLabel: 'History retention period',
    retention7d: '7 days', retention30d: '30 days', retention90d: '90 days', retention1y: '1 year', retentionForever: 'Indefinitely',
    uiSection: 'Interface', uiLangLabel: 'Interface language', agentLangLabel: 'Agent language',
    thinkingCollapsedLabel: 'Thinking collapsed by default',
    highlightClicksLabel: 'Highlight clicked elements',
    debugModeLabel: 'Debug mode (bug report button)',
    bestPracticesLabel: 'Model help (best practices)',
    bestPracticesHint: 'Adds detailed instructions to guide less powerful models. Auto = detected based on model.',
    bestPracticesAuto: 'Auto (based on model)', bestPracticesAlways: 'Always enabled', bestPracticesNever: 'Never',
    searchMemory: '🔍 Search...', exportBtn: '⬇ Export', clearAllBtn: '🗑 Clear all',
    memoryKeyPh: 'Key...', memoryValPh: 'Value...', memoryAddBtn: '+ Add',
    searchHistory: '🔍 Search history...',
    saveBtn: '💾 Save',
    ollamaHint: 'Ex: http://localhost:11434/v1 for Ollama',
    apiKeyPlaceholder: 'Your API key...',
    deleteConfirm: 'Delete this provider?',
    thinkingDefault: 'Thinking collapsed by default',
    active: '✓ Active', activate: '▶ Activate', useProvider: 'Use this provider',
    deleteProvider: 'Delete this provider', testConnection: 'Test connection', testBtn: '🔌 Test',
    defaultModel: 'Default model', clickRefresh: '— Click "↻ Refresh" —',
    refreshModels: 'Fetch available models', refreshBtn: '↻ Refresh',
    apiKeyMissing: '⚠ Missing API key', noResults: 'No results.',
    historyHint: 'Conversations will appear here after your first session.',
    deleteTitle: 'Delete', providerCountLabel: 'provider(s) configured',
    markUnsaved: 'Unsaved changes', changesSaved: '✅ Saved',
    systemPromptLabel: 'Custom system prompt',
    systemPromptHint: 'Instructions added to the agent\'s system prompt. Leave empty to use default behavior.',
    systemPromptPlaceholder: "Ex: You are a user looking for job offers in France, browse calmly, avoid automated actions...",
    modeLibre: 'Free',
    modeVoyage: 'Travel',
    modeRecherche: 'Research',
    modeAnalyse: 'Analysis',
    modeExtraction: 'Extraction',
    modeAdministratif: 'Admin',
    modeShopping: 'Shopping',
    modeVeille: 'Monitoring',
    modeCuisine: 'Cooking',
    modeImmobilier: 'Real Estate',
    modeEmploi: 'Jobs',
    modeEducation: 'Education',
    tabModes: '🎯 Modes',
    tabTools: '🔧 Tools',
    nativeModes: 'Built-in modes',
    customModes: 'My custom modes',
    addModeBtn: '+ Create a mode',
    noCustomModes: 'No custom modes.',
    modeIconLabel: 'Icon',
    modeIdLabel: 'Identifier (snake_case)',
    modeLabelLabel: 'Display name',
    modeDescLabel: 'Short description',
    modePromptLabel: 'System prompt',
    modeToolsLabel: 'Allowed tools',
    modeToolsAll: 'All tools (*)',
    modeUrlsLabel: 'URL patterns (optional)',
    modeUrlsHint: 'Comma-separated domains. Auto-detection.',
    newModeTitle: 'New mode',
    editModeTitle: 'Edit mode',
    modeIdExists: 'This identifier is already used by a built-in mode.',
    modeIdDuplicate: 'A mode with this identifier already exists.',
    modeRequiredFields: 'Identifier and display name are required.',
    modeIdFormat: 'Identifier must be snake_case.',
    modeDeleteConfirm: 'Delete this mode?',
    remoteToolsTitle: '📡 Remote tools',
    remoteToolsUrlLabel: 'Remote registry URL',
    remoteToolsLoadBtn: '↻ Load',
    remoteToolsUrlHint: 'Public JSON file containing a tools array.',
    remoteToolsLoading: '⏳ Loading…',
    remoteToolsUrlRequired: '⚠️ Enter a valid URL.',
    remoteToolsError: '❌ Error:',
    customToolsTitle: '🛠️ My custom tools',
    addToolBtn: '+ Add a tool',
    noCustomTools: 'No custom tools.',
    nativeToolsTitle: '📋 Built-in tools (reference)',
    nativeToolsHint: 'These tools are built-in and cannot be modified.',
    toolNameLabel: 'Identifier (unique snake_case)',
    toolIconLabel: 'Icon (emoji)',
    toolDisplayLabel: 'Display name',
    toolDescLabel: 'Description (seen by LLM)',
    toolSchemaLabel: 'Parameters (JSON Schema)',
    toolSchemaHint: 'JSON schema of input parameters.',
    toolSchemaExample: 'See an example',
    toolExecutorLabel: 'Executor',
    toolExecutorNone: 'None (declarative tool)',
    toolExecutorInject: 'inject — JS script injected into page',
    toolInjectLabel: 'JS script (function body)',
    toolInjectHint: '⚠️ Script is injected into the active page.',
    newToolTitle: 'New tool',
    editToolTitle: 'Edit tool',
    toolRequiredFields: 'Identifier, description and parameters are required.',
    toolIdFormat: 'Identifier must be snake_case.',
    toolIdDuplicate: 'A tool with this identifier already exists.',
    toolSchemaInvalid: 'Invalid JSON Schema:',
    toolDeleteConfirm: 'Delete this tool?',
    badgeNative: 'native',
    badgeRemote: 'remote',
    badgeCustom: 'custom',
    autoDetectMode: 'Automatically detect mode based on visited URL',
    aboutTitle: 'About', aboutWebsite: '🌐 Website', aboutSupport: '☕ Support',
  },
  es: {
    selectProviderType: 'Seleccione un tipo de provider.',
    apiKeyRequired: 'Se requiere clave API.',
    baseUrlRequired: 'La URL base es requerida para un provider custom.',
    providerAdded: 'Provider añadido correctamente.',
    testSuccess: '✅ Conexión exitosa',
    testFailed: '❌ Error',
    noMemoryEntries: 'Sin entradas de memoria persistente.',
    noHistorySaved: 'Sin historial guardado.',
    backToChat: 'Volver al chat',
    unsavedChanges: 'Sin guardar',
    saved: 'Guardado',
    addProvider: 'Añadir provider',
    providersConfigured: 'provider(s) configurado(s)',
    memoryExported: 'Memoria exportada',
    memoryCleared: 'Memoria borrada',
    historyCleared: 'Historial borrado',
    configTitle: 'BrowserMind — Configuración',
    tabProviders: '🔌 Providers', tabGeneral: '⚙ General', tabMemory: '💾 Memoria', tabHistory: '📚 Historial',
    newProviderTitle: '➕ Nuevo provider', providerTypeLabel: 'Tipo de provider', selectPlaceholder: '— Seleccionar —',
    baseUrlLabel: 'URL base', displayNameLabel: 'Nombre mostrado (opcional)', apiKeyLabel: 'Clave API',
    addProviderBtn: '✅ Añadir este provider', cancelBtn: 'Cancelar',
    noProviderConfigured: 'Ningún provider configurado.', clickToAddProvider: 'Clic en "Añadir provider" para empezar.',
    agentBehavior: 'Comportamiento del agente', maxIterationsLabel: 'Max iteraciones por solicitud',
    maxIterationsHint: 'Número máximo de rondas antes de parar. Mayor = tareas más complejas.',
    maxTokensLabel: 'Max tokens de contexto (salvaguarda)',
    maxTokensHint: 'Reducir si error "rate limit input tokens". ~4 chars = 1 token.',
    maxTabSessionsLabel: 'Sesiones máx. de pestañas',
    maxTabSessionsHint: 'Límite de pestañas en la extensión. Las más antiguas se cierran automáticamente.',
    memoryContext: 'Memoria & contexto', enableMemory: 'Activar memoria persistente entre sesiones',
    saveHistory: 'Guardar historial de conversaciones', retentionLabel: 'Período de retención del historial',
    retention7d: '7 días', retention30d: '30 días', retention90d: '90 días', retention1y: '1 año', retentionForever: 'Indefinidamente',
    uiSection: 'Interfaz', uiLangLabel: 'Idioma de la interfaz', agentLangLabel: 'Idioma del agente',
    thinkingCollapsedLabel: 'Reflexión colapsada por defecto',
    highlightClicksLabel: 'Resaltado de elementos clicados',
    debugModeLabel: 'Modo debug (botón de reporte de bugs)',
    bestPracticesLabel: 'Ayuda al modelo (best practices)',
    bestPracticesHint: 'Añade instrucciones detalladas para guiar modelos menos potentes. Auto = detectado según el modelo.',
    bestPracticesAuto: 'Auto (según el modelo)', bestPracticesAlways: 'Siempre activado', bestPracticesNever: 'Nunca',
    searchMemory: '🔍 Buscar...', exportBtn: '⬇ Exportar', clearAllBtn: '🗑 Borrar todo',
    memoryKeyPh: 'Clave...', memoryValPh: 'Valor...', memoryAddBtn: '+ Añadir',
    searchHistory: '🔍 Buscar en historial...',
    saveBtn: '💾 Guardar',
    ollamaHint: 'Ej: http://localhost:11434/v1 para Ollama',
    apiKeyPlaceholder: 'Su clave API...',
    deleteConfirm: '¿Eliminar este provider?',
    thinkingDefault: 'Reflexión colapsada por defecto',
    active: '✓ Activo', activate: '▶ Activar', useProvider: 'Usar este provider',
    deleteProvider: 'Eliminar este provider', testConnection: 'Probar conexión', testBtn: '🔌 Test',
    defaultModel: 'Modelo por defecto', clickRefresh: '— Clic "↻ Actualizar" —',
    refreshModels: 'Obtener modelos disponibles', refreshBtn: '↻ Actualizar',
    apiKeyMissing: '⚠ Falta clave API', noResults: 'Sin resultados.',
    historyHint: 'Las conversaciones aparecerán aquí después de su primera sesión.',
    deleteTitle: 'Eliminar', providerCountLabel: 'provider(s) configurado(s)',
    markUnsaved: 'Cambios sin guardar', changesSaved: '✅ Guardado',
    systemPromptLabel: 'Prompt de sistema personalizado',
    systemPromptHint: 'Instrucciones añadidas al prompt del agente. Dejar vacío para usar el comportamiento por defecto.',
    systemPromptPlaceholder: "Ex: Eres un usuario buscando ofertas de trabajo en Francia, navega tranquilamente...",
    tabModes: '🎯 Modos',
    tabTools: '🔧 Herramientas',
    nativeModes: 'Modos nativos',
    customModes: 'Mis modos personalizados',
    addModeBtn: '+ Crear un modo',
    noCustomModes: 'Sin modos personalizados.',
    modeIconLabel: 'Icono',
    modeIdLabel: 'Identificador (snake_case)',
    modeLabelLabel: 'Nombre mostrado',
    modeDescLabel: 'Descripción breve',
    modePromptLabel: 'Prompt del sistema',
    modeToolsLabel: 'Herramientas permitidas',
    modeToolsAll: 'Todas las herramientas (*)',
    modeUrlsLabel: 'URL patterns (opcional)',
    modeUrlsHint: 'Dominios separados por coma. Detección automática.',
    newModeTitle: 'Nuevo modo',
    editModeTitle: 'Editar modo',
    modeIdExists: 'Este identificador ya lo usa un modo nativo.',
    modeIdDuplicate: 'Ya existe un modo con este identificador.',
    modeRequiredFields: 'El identificador y el nombre son obligatorios.',
    modeIdFormat: 'El identificador debe estar en snake_case.',
    modeDeleteConfirm: '¿Eliminar este modo?',
    remoteToolsTitle: '📡 Herramientas remotas',
    remoteToolsUrlLabel: 'URL del registro remoto',
    remoteToolsLoadBtn: '↻ Cargar',
    remoteToolsUrlHint: 'Archivo JSON público con array de herramientas.',
    remoteToolsLoading: '⏳ Cargando…',
    remoteToolsUrlRequired: '⚠️ Introduce una URL válida.',
    remoteToolsError: '❌ Error:',
    customToolsTitle: '🛠️ Mis herramientas',
    addToolBtn: '+ Añadir herramienta',
    noCustomTools: 'Sin herramientas personalizadas.',
    nativeToolsTitle: '📋 Herramientas nativas (referencia)',
    nativeToolsHint: 'Estas herramientas son integradas y no se pueden modificar.',
    toolNameLabel: 'Identificador (snake_case único)',
    toolIconLabel: 'Icono (emoji)',
    toolDisplayLabel: 'Nombre mostrado',
    toolDescLabel: 'Descripción (vista por el LLM)',
    toolSchemaLabel: 'Parámetros (JSON Schema)',
    toolSchemaHint: 'Esquema JSON de parámetros.',
    toolSchemaExample: 'Ver un ejemplo',
    toolExecutorLabel: 'Ejecutor',
    toolExecutorNone: 'Ninguno (herramienta declarativa)',
    toolExecutorInject: 'inject — Script JS inyectado en la página',
    toolInjectLabel: 'Script JS (cuerpo de función)',
    toolInjectHint: '⚠️ El script se inyecta en la página activa.',
    newToolTitle: 'Nueva herramienta',
    editToolTitle: 'Editar herramienta',
    toolRequiredFields: 'Identificador, descripción y parámetros son obligatorios.',
    toolIdFormat: 'El identificador debe estar en snake_case.',
    toolIdDuplicate: 'Ya existe una herramienta con este identificador.',
    toolSchemaInvalid: 'JSON Schema inválido:',
    toolDeleteConfirm: '¿Eliminar esta herramienta?',
    badgeNative: 'nativo',
    badgeRemote: 'remoto',
    badgeCustom: 'custom',
    autoDetectMode: 'Detectar modo automáticamente según la URL visitada',
    aboutTitle: 'Acerca de', aboutWebsite: '🌐 mapiTools', aboutSupport: '☕ Apoyar',
    modeLibre: 'Libre', modeVoyage: 'Viaje', modeRecherche: 'Búsqueda',
    modeAnalyse: 'Análisis', modeExtraction: 'Extracción', modeAdministrativo: 'Administrativo',
    modeShopping: 'Compras', modeVeille: 'Vigilancia', modeCuisine: 'Cocina',
    modeImmobilier: 'Inmobiliario', modeEmploi: 'Empleo', modeEducation: 'Educación',
  },
  it: {
    selectProviderType: 'Seleziona un tipo di provider.',
    apiKeyRequired: 'La chiave API è richiesta.',
    baseUrlRequired: "L'URL base è richiesta per un provider custom.",
    providerAdded: 'Provider aggiunto con successo.',
    testSuccess: '✅ Connessione riuscita',
    testFailed: '❌ Errore',
    noMemoryEntries: 'Nessuna voce di memoria persistente.',
    noHistorySaved: 'Nessuno storico salvato.',
    backToChat: 'Torna alla chat',
    unsavedChanges: 'Non salvato',
    saved: 'Salvato',
    addProvider: 'Aggiungi provider',
    providersConfigured: 'provider(s) configurato(i)',
    memoryExported: 'Memoria esportata',
    memoryCleared: 'Memoria cancellata',
    historyCleared: 'Cronologia cancellata',
    configTitle: 'BrowserMind — Configurazione',
    tabProviders: '🔌 Providers', tabGeneral: '⚙ Generale', tabMemory: '💾 Memoria', tabHistory: '📚 Cronologia',
    newProviderTitle: '➕ Nuovo provider', providerTypeLabel: 'Tipo di provider', selectPlaceholder: '— Seleziona —',
    baseUrlLabel: 'URL base', displayNameLabel: 'Nome visualizzato (opzionale)', apiKeyLabel: 'Chiave API',
    addProviderBtn: '✅ Aggiungi questo provider', cancelBtn: 'Annulla',
    noProviderConfigured: 'Nessun provider configurato.', clickToAddProvider: 'Clicca "Aggiungi provider" per iniziare.',
    agentBehavior: "Comportamento dell'agente", maxIterationsLabel: 'Max iterazioni per richiesta',
    maxIterationsHint: 'Numero massimo di round prima di fermarsi. Più alto = task più complessi.',
    maxTokensLabel: 'Max token di contesto (salvaguardia)',
    maxTokensHint: 'Ridurre se errore "rate limit input tokens". ~4 caratteri = 1 token.',
    maxTabSessionsLabel: 'Sessioni schede max',
    maxTabSessionsHint: 'Limite di schede nell\'estensione. Le più vecchie vengono chiuse automaticamente.',
    memoryContext: 'Memoria & contesto', enableMemory: 'Attiva memoria persistente tra sessioni',
    saveHistory: "Salva cronologia conversazioni", retentionLabel: 'Periodo di conservazione cronologia',
    retention7d: '7 giorni', retention30d: '30 giorni', retention90d: '90 giorni', retention1y: '1 anno', retentionForever: 'Indefinitamente',
    uiSection: 'Interfaccia', uiLangLabel: "Lingua dell'interfaccia", agentLangLabel: "Lingua dell'agente",
    thinkingCollapsedLabel: 'Riflessione collassata di default',
    highlightClicksLabel: 'Evidenziazione elementi cliccati',
    debugModeLabel: 'Modalità debug (pulsante segnalazione bug)',
    bestPracticesLabel: 'Aiuto al modello (best practices)',
    bestPracticesHint: 'Aggiunge istruzioni dettagliate per guidare modelli meno potenti. Auto = rilevato in base al modello.',
    bestPracticesAuto: 'Auto (in base al modello)', bestPracticesAlways: 'Sempre attivato', bestPracticesNever: 'Mai',
    searchMemory: '🔍 Cerca...', exportBtn: '⬇ Esporta', clearAllBtn: '🗑 Cancella tutto',
    memoryKeyPh: 'Chiave...', memoryValPh: 'Valore...', memoryAddBtn: '+ Aggiungi',
    searchHistory: '🔍 Cerca nella cronologia...',
    saveBtn: '💾 Salva',
    ollamaHint: 'Es: http://localhost:11434/v1 per Ollama',
    apiKeyPlaceholder: 'La tua chiave API...',
    deleteConfirm: 'Eliminare questo provider?',
    thinkingDefault: 'Riflessione collassata di default',
    active: '✓ Attivo', activate: '▶ Attiva', useProvider: 'Usa questo provider',
    deleteProvider: 'Elimina questo provider', testConnection: 'Testa connessione', testBtn: '🔌 Test',
    defaultModel: 'Modello predefinito', clickRefresh: '— Clicca "↻ Aggiorna" —',
    refreshModels: 'Ottieni modelli disponibili', refreshBtn: '↻ Aggiorna',
    apiKeyMissing: '⚠ Chiave API mancante', noResults: 'Nessun risultato.',
    historyHint: 'Le conversazioni appariranno qui dopo la prima sessione.',
    deleteTitle: 'Elimina', providerCountLabel: 'provider(s) configurato(i)',
    markUnsaved: 'Modifiche non salvate', changesSaved: '✅ Salvato',
    systemPromptLabel: 'Prompt di sistema personalizzato',
    systemPromptHint: 'Istruzioni aggiunte al prompt dell\'agente. Lascia vuoto per usare il comportamento predefinito.',
    systemPromptPlaceholder: "Ex: Sei un utente che cerca offerte di lavoro in Francia, naviga con calma...",
    tabModes: '🎯 Modalità',
    tabTools: '🔧 Strumenti',
    nativeModes: 'Modalità native',
    customModes: 'Le mie modalità',
    addModeBtn: '+ Crea modalità',
    noCustomModes: 'Nessuna modalità personalizzata.',
    modeIconLabel: 'Icona',
    modeIdLabel: 'Identificatore (snake_case)',
    modeLabelLabel: 'Nome visualizzato',
    modeDescLabel: 'Breve descrizione',
    modePromptLabel: 'Prompt di sistema',
    modeToolsLabel: 'Strumenti consentiti',
    modeToolsAll: 'Tutti gli strumenti (*)',
    modeUrlsLabel: 'URL patterns (opzionale)',
    modeUrlsHint: 'Domini separati da virgola. Rilevamento automatico.',
    newModeTitle: 'Nuova modalità',
    editModeTitle: 'Modifica modalità',
    modeIdExists: 'Questo identificatore è già usato da una modalità nativa.',
    modeIdDuplicate: 'Esiste già una modalità con questo identificatore.',
    modeRequiredFields: 'Identificatore e nome sono obbligatori.',
    modeIdFormat: 'L\'identificatore deve essere snake_case.',
    modeDeleteConfirm: 'Eliminare questa modalità?',
    remoteToolsTitle: '📡 Strumenti remoti',
    remoteToolsUrlLabel: 'URL del registro remoto',
    remoteToolsLoadBtn: '↻ Carica',
    remoteToolsUrlHint: 'File JSON pubblico con array di strumenti.',
    remoteToolsLoading: '⏳ Caricamento…',
    remoteToolsUrlRequired: '⚠️ Inserisci un URL valido.',
    remoteToolsError: '❌ Errore:',
    customToolsTitle: '🛠️ I miei strumenti',
    addToolBtn: '+ Aggiungi strumento',
    noCustomTools: 'Nessuno strumento personalizzato.',
    nativeToolsTitle: '📋 Strumenti nativi (riferimento)',
    nativeToolsHint: 'Questi strumenti sono integrati e non modificabili.',
    toolNameLabel: 'Identificatore (snake_case univoco)',
    toolIconLabel: 'Icona (emoji)',
    toolDisplayLabel: 'Nome visualizzato',
    toolDescLabel: 'Descrizione (vista dal LLM)',
    toolSchemaLabel: 'Parametri (JSON Schema)',
    toolSchemaHint: 'Schema JSON dei parametri.',
    toolSchemaExample: 'Vedi un esempio',
    toolExecutorLabel: 'Esecutore',
    toolExecutorNone: 'Nessuno (strumento dichiarativo)',
    toolExecutorInject: 'inject — Script JS iniettato nella pagina',
    toolInjectLabel: 'Script JS (corpo della funzione)',
    toolInjectHint: '⚠️ Lo script viene iniettato nella pagina attiva.',
    newToolTitle: 'Nuovo strumento',
    editToolTitle: 'Modifica strumento',
    toolRequiredFields: 'Identificatore, descrizione e parametri sono obbligatori.',
    toolIdFormat: 'L\'identificatore deve essere snake_case.',
    toolIdDuplicate: 'Esiste già uno strumento con questo identificatore.',
    toolSchemaInvalid: 'JSON Schema non valido:',
    toolDeleteConfirm: 'Eliminare questo strumento?',
    badgeNative: 'nativo',
    badgeRemote: 'remoto',
    badgeCustom: 'custom',
    autoDetectMode: 'Rileva automaticamente la modalità in base all\'URL visitato',
    aboutTitle: 'Informazioni', aboutWebsite: '🌐 mapiTools', aboutSupport: '☕ Sostieni il progetto',
    modeLibre: 'Libero', modeVoyage: 'Viaggio', modeRecherche: 'Ricerca',
    modeAnalyse: 'Analisi', modeExtraction: 'Estrazione', modeAdministrativo: 'Amministrativo',
    modeShopping: 'Shopping', modeVeille: 'Sorveglianza', modeCuisine: 'Cucina',
    modeImmobilier: 'Immobiliare', modeEmploi: 'Lavoro', modeEducation: 'Istruzione',
  },
  de: {
    selectProviderType: 'Wählen Sie einen Provider-Typ.',
    apiKeyRequired: 'API-Schlüssel ist erforderlich.',
    baseUrlRequired: 'Basis-URL ist für einen benutzerdefinierten Provider erforderlich.',
    providerAdded: 'Provider erfolgreich hinzugefügt.',
    testSuccess: '✅ Verbindung erfolgreich',
    testFailed: '❌ Fehlgeschlagen',
    noMemoryEntries: 'Keine persistenten Speichereinträge.',
    noHistorySaved: 'Kein gespeicherter Verlauf.',
    backToChat: 'Zurück zum Chat',
    unsavedChanges: 'Nicht gespeichert',
    saved: 'Gespeichert',
    addProvider: 'Provider hinzufügen',
    providersConfigured: 'Provider konfiguriert',
    memoryExported: 'Speicher exportiert',
    memoryCleared: 'Speicher gelöscht',
    historyCleared: 'Verlauf gelöscht',
    configTitle: 'BrowserMind — Konfiguration',
    tabProviders: '🔌 Providers', tabGeneral: '⚙ Allgemein', tabMemory: '💾 Speicher', tabHistory: '📚 Verlauf',
    newProviderTitle: '➕ Neuer Provider', providerTypeLabel: 'Provider-Typ', selectPlaceholder: '— Auswählen —',
    baseUrlLabel: 'Basis-URL', displayNameLabel: 'Anzeigename (optional)', apiKeyLabel: 'API-Schlüssel',
    addProviderBtn: '✅ Provider hinzufügen', cancelBtn: 'Abbrechen',
    noProviderConfigured: 'Kein Provider konfiguriert.', clickToAddProvider: 'Klicken Sie "Provider hinzufügen" um zu beginnen.',
    agentBehavior: 'Agentenverhalten', maxIterationsLabel: 'Max Iterationen pro Anfrage',
    maxIterationsHint: 'Maximale Runden vor Stopp. Höher = komplexere Aufgaben.',
    maxTokensLabel: 'Max Kontext-Tokens (Sicherheitslimit)',
    maxTokensHint: 'Reduzieren bei "rate limit input tokens" Fehler. ~4 Zeichen = 1 Token.',
    maxTabSessionsLabel: 'Max Tabsitzungen',
    maxTabSessionsHint: 'Limit der Tab-Sitzungen in der Erweiterung. Älteste werden automatisch geschlossen.',
    memoryContext: 'Speicher & Kontext', enableMemory: 'Persistenter Speicher zwischen Sitzungen aktivieren',
    saveHistory: 'Konversationsverlauf speichern', retentionLabel: 'Aufbewahrungsdauer des Verlaufs',
    retention7d: '7 Tage', retention30d: '30 Tage', retention90d: '90 Tage', retention1y: '1 Jahr', retentionForever: 'Unbegrenzt',
    uiSection: 'Oberfläche', uiLangLabel: 'Sprache der Oberfläche', agentLangLabel: 'Sprache des Agents',
    thinkingCollapsedLabel: 'Denken standardmäßig eingeklappt',
    highlightClicksLabel: 'Angeklickte Elemente hervorheben',
    debugModeLabel: 'Debug-Modus (Bug-Meldung Taste)',
    bestPracticesLabel: 'Modellhilfe (Best Practices)',
    bestPracticesHint: 'Fügt detaillierte Anweisungen hinzu, um leistungsschwächere Modelle zu unterstützen. Auto = basierend auf Modell erkannt.',
    bestPracticesAuto: 'Auto (basierend auf Modell)', bestPracticesAlways: 'Immer aktiviert', bestPracticesNever: 'Nie',
    searchMemory: '🔍 Suchen...', exportBtn: '⬇ Exportieren', clearAllBtn: '🗑 Alles löschen',
    memoryKeyPh: 'Schlüssel...', memoryValPh: 'Wert...', memoryAddBtn: '+ Hinzufügen',
    searchHistory: '🔍 Verlauf durchsuchen...',
    saveBtn: '💾 Speichern',
    ollamaHint: 'Z.B.: http://localhost:11434/v1 für Ollama',
    apiKeyPlaceholder: 'Ihr API-Schlüssel...',
    deleteConfirm: 'Diesen Provider löschen?',
    thinkingDefault: 'Denken standardmäßig eingeklappt',
    active: '✓ Aktiv', activate: '▶ Aktivieren', useProvider: 'Diesen Provider verwenden',
    deleteProvider: 'Diesen Provider löschen', testConnection: 'Verbindung testen', testBtn: '🔌 Test',
    defaultModel: 'Standardmodell', clickRefresh: '— "↻ Aktualisieren" klicken —',
    refreshModels: 'Verfügbare Modelle abrufen', refreshBtn: '↻ Aktualisieren',
    apiKeyMissing: '⚠ API-Schlüssel fehlt', noResults: 'Keine Ergebnisse.',
    historyHint: 'Konversationen werden nach der ersten Sitzung hier angezeigt.',
    deleteTitle: 'Löschen', providerCountLabel: 'Provider konfiguriert',
    markUnsaved: 'Ungespeicherte Änderungen', changesSaved: '✅ Gespeichert',
    systemPromptLabel: 'Benutzerdefinierter System-Prompt',
    systemPromptHint: 'Anweisungen zum Agenten-Prompt hinzufügen. Leer lassen für Standardverhalten.',
    systemPromptPlaceholder: "Ex: Sie sind ein Benutzer, der nach Stellenangeboten in Frankreich sucht, surfen Sie ruhig...",
    tabModes: '🎯 Modi',
    tabTools: '🔧 Werkzeuge',
    nativeModes: 'Eingebaute Modi',
    customModes: 'Meine Modi',
    addModeBtn: '+ Modus erstellen',
    noCustomModes: 'Keine benutzerdefinierten Modi.',
    modeIconLabel: 'Symbol',
    modeIdLabel: 'Bezeichner (snake_case)',
    modeLabelLabel: 'Anzeigename',
    modeDescLabel: 'Kurzbeschreibung',
    modePromptLabel: 'System-Prompt',
    modeToolsLabel: 'Erlaubte Werkzeuge',
    modeToolsAll: 'Alle Werkzeuge (*)',
    modeUrlsLabel: 'URL-Muster (optional)',
    modeUrlsHint: 'Kommagetrennte Domains. Automatische Erkennung.',
    newModeTitle: 'Neuer Modus',
    editModeTitle: 'Modus bearbeiten',
    modeIdExists: 'Dieser Bezeichner wird bereits von einem eingebauten Modus verwendet.',
    modeIdDuplicate: 'Ein Modus mit diesem Bezeichner existiert bereits.',
    modeRequiredFields: 'Bezeichner und Anzeigename sind erforderlich.',
    modeIdFormat: 'Der Bezeichner muss snake_case sein.',
    modeDeleteConfirm: 'Diesen Modus löschen?',
    remoteToolsTitle: '📡 Externe Werkzeuge',
    remoteToolsUrlLabel: 'URL des externen Registers',
    remoteToolsLoadBtn: '↻ Laden',
    remoteToolsUrlHint: 'Öffentliche JSON-Datei mit Werkzeug-Array.',
    remoteToolsLoading: '⏳ Laden…',
    remoteToolsUrlRequired: '⚠️ Gültige URL eingeben.',
    remoteToolsError: '❌ Fehler:',
    customToolsTitle: '🛠️ Meine Werkzeuge',
    addToolBtn: '+ Werkzeug hinzufügen',
    noCustomTools: 'Keine benutzerdefinierten Werkzeuge.',
    nativeToolsTitle: '📋 Eingebaute Werkzeuge (Referenz)',
    nativeToolsHint: 'Diese Werkzeuge sind integriert und können nicht geändert werden.',
    toolNameLabel: 'Bezeichner (eindeutiges snake_case)',
    toolIconLabel: 'Symbol (Emoji)',
    toolDisplayLabel: 'Anzeigename',
    toolDescLabel: 'Beschreibung (vom LLM gesehen)',
    toolSchemaLabel: 'Parameter (JSON Schema)',
    toolSchemaHint: 'JSON-Schema der Eingabeparameter.',
    toolSchemaExample: 'Beispiel ansehen',
    toolExecutorLabel: 'Ausführer',
    toolExecutorNone: 'Keiner (deklaratives Werkzeug)',
    toolExecutorInject: 'inject — JS-Skript in Seite injiziert',
    toolInjectLabel: 'JS-Skript (Funktionskörper)',
    toolInjectHint: '⚠️ Skript wird in die aktive Seite injiziert.',
    newToolTitle: 'Neues Werkzeug',
    editToolTitle: 'Werkzeug bearbeiten',
    toolRequiredFields: 'Bezeichner, Beschreibung und Parameter sind erforderlich.',
    toolIdFormat: 'Der Bezeichner muss snake_case sein.',
    toolIdDuplicate: 'Ein Werkzeug mit diesem Bezeichner existiert bereits.',
    toolSchemaInvalid: 'Ungültiges JSON Schema:',
    toolDeleteConfirm: 'Dieses Werkzeug löschen?',
    badgeNative: 'nativ',
    badgeRemote: 'extern',
    badgeCustom: 'custom',
    autoDetectMode: 'Modus anhand der besuchten URL automatisch erkennen',
    aboutTitle: 'Über', aboutWebsite: '🌐 mapiTools', aboutSupport: '☕ Projekt unterstützen',
    modeLibre: 'Frei', modeVoyage: 'Reise', modeRecherche: 'Suche',
    modeAnalyse: 'Analyse', modeExtraction: 'Extraktion', modeAdministrativ: 'Verwaltung',
    modeShopping: 'Einkaufen', modeVeille: 'Überwachung', modeCuisine: 'Küche',
    modeImmobilier: 'Immobilien', modeEmploi: 'Arbeit', modeEducation: 'Bildung',
  },
  pt: {
    selectProviderType: 'Selecione um tipo de provider.',
    apiKeyRequired: 'A chave API é obrigatória.',
    baseUrlRequired: 'URL base é obrigatória para um provider custom.',
    providerAdded: 'Provider adicionado com sucesso.',
    testSuccess: '✅ Conexão bem-sucedida',
    testFailed: '❌ Falha',
    noMemoryEntries: 'Nenhuma entrada de memória persistente.',
    noHistorySaved: 'Nenhum histórico salvo.',
    backToChat: 'Voltar ao chat',
    unsavedChanges: 'Não salvo',
    saved: 'Salvo',
    addProvider: 'Adicionar provider',
    providersConfigured: 'provider(s) configurado(s)',
    memoryExported: 'Memória exportada',
    memoryCleared: 'Memória apagada',
    historyCleared: 'Histórico apagado',
    configTitle: 'BrowserMind — Configuração',
    tabProviders: '🔌 Providers', tabGeneral: '⚙ Geral', tabMemory: '💾 Memória', tabHistory: '📚 Histórico',
    newProviderTitle: '➕ Novo provider', providerTypeLabel: 'Tipo de provider', selectPlaceholder: '— Selecionar —',
    baseUrlLabel: 'URL base', displayNameLabel: 'Nome exibido (opcional)', apiKeyLabel: 'Chave API',
    addProviderBtn: '✅ Adicionar este provider', cancelBtn: 'Cancelar',
    noProviderConfigured: 'Nenhum provider configurado.', clickToAddProvider: 'Clique "Adicionar provider" para começar.',
    agentBehavior: 'Comportamento do agente', maxIterationsLabel: 'Max iterações por requisição',
    maxIterationsHint: 'Número máximo de rodadas antes de parar. Maior = tarefas mais complexas.',
    maxTokensLabel: 'Max tokens de contexto (salvaguarda)',
    maxTokensHint: 'Reduzir se erro "rate limit input tokens". ~4 chars = 1 token.',
    maxTabSessionsLabel: 'Sessões máx. de abas',
    maxTabSessionsHint: 'Limite de abas na extensão. As mais antigas são fechadas automaticamente.',
    memoryContext: 'Memória & contexto', enableMemory: 'Ativar memória persistente entre sessões',
    saveHistory: 'Salvar histórico de conversas', retentionLabel: 'Período de retenção do histórico',
    retention7d: '7 dias', retention30d: '30 dias', retention90d: '90 dias', retention1y: '1 ano', retentionForever: 'Indefinidamente',
    uiSection: 'Interface', uiLangLabel: 'Idioma da interface', agentLangLabel: 'Idioma do agente',
    thinkingCollapsedLabel: 'Reflexão recolhida por padrão',
    highlightClicksLabel: 'Destaque de elementos clicados',
    debugModeLabel: 'Modo debug (botão de relatório de bugs)',
    bestPracticesLabel: 'Ajuda ao modelo (best practices)',
    bestPracticesHint: 'Adiciona instruções detalhadas para guiar modelos menos potentes. Auto = detectado com base no modelo.',
    bestPracticesAuto: 'Auto (com base no modelo)', bestPracticesAlways: 'Sempre ativado', bestPracticesNever: 'Nunca',
    searchMemory: '🔍 Pesquisar...', exportBtn: '⬇ Exportar', clearAllBtn: '🗑 Apagar tudo',
    memoryKeyPh: 'Chave...', memoryValPh: 'Valor...', memoryAddBtn: '+ Adicionar',
    searchHistory: '🔍 Pesquisar no histórico...',
    saveBtn: '💾 Salvar',
    ollamaHint: 'Ex: http://localhost:11434/v1 para Ollama',
    apiKeyPlaceholder: 'Sua chave API...',
    deleteConfirm: 'Excluir este provider?',
    thinkingDefault: 'Reflexão recolhida por padrão',
    active: '✓ Ativo', activate: '▶ Ativar', useProvider: 'Usar este provider',
    deleteProvider: 'Excluir este provider', testConnection: 'Testar conexão', testBtn: '🔌 Test',
    defaultModel: 'Modelo padrão', clickRefresh: '— Clicar "↻ Atualizar" —',
    refreshModels: 'Buscar modelos disponíveis', refreshBtn: '↻ Atualizar',
    apiKeyMissing: '⚠ Chave API ausente', noResults: 'Sem resultados.',
    historyHint: 'As conversas aparecerão aqui após sua primeira sessão.',
    deleteTitle: 'Excluir', providerCountLabel: 'provider(s) configurado(s)',
    markUnsaved: 'Alterações não salvas', changesSaved: '✅ Salvo',
    systemPromptLabel: 'Prompt de sistema personalizado',
    systemPromptHint: 'Instruções adicionadas ao prompt do agente. Deixe vazio para usar o comportamento padrão.',
    systemPromptPlaceholder: "Ex: Você é um usuário que procura ofertas de emprego na França, navegue com calma...",
    tabModes: '🎯 Modos',
    tabTools: '🔧 Ferramentas',
    nativeModes: 'Modos nativos',
    customModes: 'Meus modos',
    addModeBtn: '+ Criar modo',
    noCustomModes: 'Nenhum modo personalizado.',
    modeIconLabel: 'Ícone',
    modeIdLabel: 'Identificador (snake_case)',
    modeLabelLabel: 'Nome exibido',
    modeDescLabel: 'Descrição curta',
    modePromptLabel: 'Prompt do sistema',
    modeToolsLabel: 'Ferramentas permitidas',
    modeToolsAll: 'Todas as ferramentas (*)',
    modeUrlsLabel: 'Padrões de URL (opcional)',
    modeUrlsHint: 'Domínios separados por vírgula. Detecção automática.',
    newModeTitle: 'Novo modo',
    editModeTitle: 'Editar modo',
    modeIdExists: 'Este identificador já é usado por um modo nativo.',
    modeIdDuplicate: 'Já existe um modo com este identificador.',
    modeRequiredFields: 'Identificador e nome são obrigatórios.',
    modeIdFormat: 'O identificador deve ser snake_case.',
    modeDeleteConfirm: 'Excluir este modo?',
    remoteToolsTitle: '📡 Ferramentas remotas',
    remoteToolsUrlLabel: 'URL do registro remoto',
    remoteToolsLoadBtn: '↻ Carregar',
    remoteToolsUrlHint: 'Arquivo JSON público com array de ferramentas.',
    remoteToolsLoading: '⏳ Carregando…',
    remoteToolsUrlRequired: '⚠️ Insira uma URL válida.',
    remoteToolsError: '❌ Erro:',
    customToolsTitle: '🛠️ Minhas ferramentas',
    addToolBtn: '+ Adicionar ferramenta',
    noCustomTools: 'Nenhuma ferramenta personalizada.',
    nativeToolsTitle: '📋 Ferramentas nativas (referência)',
    nativeToolsHint: 'Estas ferramentas são integradas e não podem ser modificadas.',
    toolNameLabel: 'Identificador (snake_case único)',
    toolIconLabel: 'Ícone (emoji)',
    toolDisplayLabel: 'Nome exibido',
    toolDescLabel: 'Descrição (vista pelo LLM)',
    toolSchemaLabel: 'Parâmetros (JSON Schema)',
    toolSchemaHint: 'Esquema JSON dos parâmetros.',
    toolSchemaExample: 'Ver exemplo',
    toolExecutorLabel: 'Executor',
    toolExecutorNone: 'Nenhum (ferramenta declarativa)',
    toolExecutorInject: 'inject — Script JS injetado na página',
    toolInjectLabel: 'Script JS (corpo da função)',
    toolInjectHint: '⚠️ O script é injetado na página ativa.',
    newToolTitle: 'Nova ferramenta',
    editToolTitle: 'Editar ferramenta',
    toolRequiredFields: 'Identificador, descrição e parâmetros são obrigatórios.',
    toolIdFormat: 'O identificador deve ser snake_case.',
    toolIdDuplicate: 'Já existe uma ferramenta com este identificador.',
    toolSchemaInvalid: 'JSON Schema inválido:',
    toolDeleteConfirm: 'Excluir esta ferramenta?',
    badgeNative: 'nativo',
    badgeRemote: 'remoto',
    badgeCustom: 'custom',
    autoDetectMode: 'Detectar modo automaticamente com base na URL visitada',
    aboutTitle: 'Sobre', aboutWebsite: '🌐 mapiTools', aboutSupport: '☕ Apoiar',
    modeLibre: 'Livre', modeVoyage: 'Viagem', modeRecherche: 'Busca',
    modeAnalyse: 'Análise', modeExtraction: 'Extração', modeAdministrativo: 'Administrativo',
    modeShopping: 'Compras', modeVeille: 'Vigilância', modeCuisine: 'Cozinha',
    modeImmobilier: 'Imobiliário', modeEmploi: 'Emprego', modeEducation: 'Educação',
  },
};

function tConfig(key) {
  const lang = state.uiLang || 'fr';
  return I18N_CONFIG[lang]?.[key] || I18N_CONFIG.fr[key] || key;
}

function updateI18nConfig() {
  const $ = id => document.getElementById(id);
  const qa = (sel, root) => (root || document).querySelector(sel);

  // Generic handler: translate all [data-i18n] elements automatically
  document.querySelectorAll('[data-i18n]').forEach(el => {
    const key = el.getAttribute('data-i18n');
    const val = tConfig(key);
    if (!val || val === key) return;
    if (el.tagName === 'INPUT' || el.tagName === 'TEXTAREA') {
      el.placeholder = val;
    } else if (el.tagName === 'OPTION') {
      el.textContent = val;
    } else {
      el.textContent = val;
    }
  });

  qa('.topbar-title').textContent = tConfig('configTitle');
  qa('.back-btn').textContent = '← ' + tConfig('backToChat');

  const tabs = document.querySelectorAll('.tab');
  if (tabs.length >= 4) {
    tabs[0].textContent = tConfig('tabProviders');
    tabs[1].textContent = tConfig('tabGeneral');
    tabs[2].textContent = tConfig('tabMemory');
    tabs[3].textContent = tConfig('tabHistory');
    if (tabs[4]) tabs[4].textContent = tConfig('tabModes');
    if (tabs[5]) tabs[5].textContent = tConfig('tabTools');
  }

  const addTitle = qa('.add-provider-title');
  if (addTitle) addTitle.textContent = tConfig('newProviderTitle');

  const typeSelect = $('new-provider-type');
  if (typeSelect && typeSelect.options.length > 0) {
    typeSelect.options[0].textContent = tConfig('selectPlaceholder');
  }

  const typeLabel = qa('#add-provider-form label.field-label');
  if (typeLabel) typeLabel.textContent = tConfig('providerTypeLabel');

  const urlField = $('new-provider-url-field');
  if (urlField) {
    const lbl = urlField.querySelector('label');
    if (lbl) lbl.textContent = tConfig('baseUrlLabel');
    const hint = urlField.querySelector('.field-hint');
    if (hint) hint.textContent = tConfig('ollamaHint');
  }

  const nameField = $('new-provider-name-field');
  if (nameField) {
    const lbl = nameField.querySelector('label');
    if (lbl) lbl.textContent = tConfig('displayNameLabel');
  }

  const keyField = $('new-provider-key');
  if (keyField) keyField.placeholder = tConfig('apiKeyPlaceholder');

  const addBtn = $('new-provider-add-btn');
  if (addBtn) addBtn.textContent = tConfig('addProviderBtn');
  const cancelBtn = $('new-provider-cancel-btn');
  if (cancelBtn) cancelBtn.textContent = tConfig('cancelBtn');
  const showAddBtn = $('show-add-provider-btn');
  if (showAddBtn) showAddBtn.textContent = '➕ ' + tConfig('addProvider');

  const emptyDiv = $('providers-empty');
  if (emptyDiv) {
    const divs = emptyDiv.querySelectorAll('div');
    if (divs[1]) divs[1].textContent = tConfig('noProviderConfigured');
    if (divs[2]) divs[2].textContent = tConfig('clickToAddProvider');
  }

  const sections = document.querySelectorAll('.settings-section-title');
  if (sections.length >= 3) {
    sections[0].textContent = tConfig('agentBehavior');
    sections[1].textContent = tConfig('memoryContext');
    sections[2].textContent = tConfig('uiSection');
  }

  const fieldLabels = document.querySelectorAll('#tab-general label.field-label');
  if (fieldLabels.length >= 1) fieldLabels[0].textContent = tConfig('maxIterationsLabel');
  if (fieldLabels.length >= 2) fieldLabels[1].textContent = tConfig('maxTokensLabel');
  if (fieldLabels.length >= 3) fieldLabels[2].textContent = tConfig('retentionLabel');
  if (fieldLabels.length >= 4) fieldLabels[3].textContent = tConfig('maxTabSessionsLabel');
  if (fieldLabels.length >= 5) fieldLabels[4].textContent = tConfig('uiLangLabel');
  if (fieldLabels.length >= 6) fieldLabels[5].textContent = tConfig('agentLangLabel');
  if (fieldLabels.length >= 7) fieldLabels[6].textContent = tConfig('bestPracticesLabel');
  if (fieldLabels.length >= 8) fieldLabels[7].textContent = tConfig('systemPromptLabel');

  const fieldHints = document.querySelectorAll('#tab-general .field-hint');
  if (fieldHints.length >= 1) fieldHints[0].textContent = tConfig('maxIterationsHint');
  if (fieldHints.length >= 2) fieldHints[1].textContent = tConfig('maxTokensHint');
  if (fieldHints.length >= 3) fieldHints[2].textContent = tConfig('maxTabSessionsHint');
  if (fieldHints.length >= 4) fieldHints[3].textContent = tConfig('bestPracticesHint');
  if (fieldHints.length >= 5) fieldHints[4].textContent = tConfig('systemPromptHint');

  const toggleLabels = document.querySelectorAll('#tab-general .toggle-wrap > span:last-child');
  if (toggleLabels.length >= 5) {
    toggleLabels[0].textContent = tConfig('enableMemory');
    toggleLabels[1].textContent = tConfig('saveHistory');
    toggleLabels[2].textContent = tConfig('thinkingCollapsedLabel');
    toggleLabels[3].textContent = tConfig('highlightClicksLabel');
    toggleLabels[4].textContent = tConfig('debugModeLabel');
  }

  const retention = $('history-retention');
  if (retention) {
    const opts = retention.options;
    if (opts.length >= 5) {
      opts[0].textContent = tConfig('retention7d');
      opts[1].textContent = tConfig('retention30d');
      opts[2].textContent = tConfig('retention90d');
      opts[3].textContent = tConfig('retention1y');
      opts[4].textContent = tConfig('retentionForever');
    }
  }

  const memSearch = $('mem-search');
  if (memSearch) memSearch.placeholder = tConfig('searchMemory');
  const memExport = $('mem-export-btn');
  if (memExport) memExport.textContent = tConfig('exportBtn');
  const memClear = $('mem-clear-btn');
  if (memClear) memClear.textContent = tConfig('clearAllBtn');
  const memKey = $('mem-new-key');
  if (memKey) memKey.placeholder = tConfig('memoryKeyPh');
  const memVal = $('mem-new-val');
  if (memVal) memVal.placeholder = tConfig('memoryValPh');
  const memAdd = $('mem-add-btn');
  if (memAdd) memAdd.textContent = tConfig('memoryAddBtn');

  const histSearch = $('hist-search');
  if (histSearch) histSearch.placeholder = tConfig('searchHistory');
  const histClear = $('hist-clear-btn');
  if (histClear) histClear.textContent = tConfig('clearAllBtn');

  const saveInfo = $('save-info');
  if (saveInfo) saveInfo.textContent = tConfig('unsavedChanges');
  const saveBtn = $('save-btn');
  if (saveBtn) saveBtn.textContent = tConfig('saveBtn');

  const systemPrompt = $('system-prompt');
  if (systemPrompt) systemPrompt.placeholder = tConfig('systemPromptPlaceholder');

  const bpSelect = $('best-practices');
  if (bpSelect) {
    const bpOpts = bpSelect.options;
    if (bpOpts.length >= 3) {
      bpOpts[0].textContent = tConfig('bestPracticesAuto');
      bpOpts[1].textContent = tConfig('bestPracticesAlways');
      bpOpts[2].textContent = tConfig('bestPracticesNever');
    }
  }

  const keyFieldLabel = $('new-provider-key')?.closest('.field')?.querySelector('.field-label');
  if (keyFieldLabel) keyFieldLabel.textContent = tConfig('apiKeyLabel');

  const aboutTitle = document.querySelector('.about-title');
  if (aboutTitle) aboutTitle.textContent = tConfig('aboutTitle');
  const aboutLinks = document.querySelectorAll('.about-links a');
  if (aboutLinks.length >= 2) {
    aboutLinks[0].textContent = tConfig('aboutWebsite');
    aboutLinks[1].textContent = tConfig('aboutSupport');
  }

  document.title = tConfig('configTitle');

  // ── Modes + Tools tabs ──
  // All static labels use data-i18n and are handled by the generic handler above.
  // Only wire dynamic/non-data-i18n elements below.
  const autoDetectSpan = document.querySelector('#tab-modes .toggle-wrap > span:last-child');
  if (autoDetectSpan && !autoDetectSpan.hasAttribute('data-i18n')) {
    autoDetectSpan.textContent = tConfig('autoDetectMode');
  }
}

// ─── CATALOGUE DE TOUS LES TYPES DISPONIBLES ───
// Utilisé uniquement pour la création, pas affiché en liste
const PROVIDER_CATALOG = {
  anthropic:        { name: 'Anthropic (Claude)',        emoji: '🟣', type: 'anthropic', placeholder: 'sk-ant-api03-...', docsUrl: 'https://console.anthropic.com/settings/keys' },
  openai:           { name: 'OpenAI (GPT)',              emoji: '🤖', type: 'openai',    placeholder: 'sk-...',           docsUrl: 'https://platform.openai.com/api-keys' },
  xai:              { name: 'xAI (Grok)',                emoji: '⚡', type: 'openai',    placeholder: 'xai-...',          docsUrl: 'https://console.x.ai/' },
  mistral:          { name: 'Mistral AI',                emoji: '🌊', type: 'openai',    placeholder: 'Clé Mistral...',   docsUrl: 'https://console.mistral.ai/api-keys/' },
  deepseek:         { name: 'DeepSeek',                  emoji: '🔍', type: 'openai',    placeholder: 'sk-...',           docsUrl: 'https://platform.deepseek.com/api_keys' },
  gemini:           { name: 'Google Gemini',             emoji: '🔷', type: 'openai',    placeholder: 'AIza...',          docsUrl: 'https://aistudio.google.com/app/apikey' },
  cohere:           { name: 'Cohere',                    emoji: '🧩', type: 'openai',    placeholder: '...',              docsUrl: 'https://dashboard.cohere.com/api-keys' },
  openrouter:       { name: 'OpenRouter',                emoji: '🔀', type: 'openai',    placeholder: 'sk-or-...',        docsUrl: 'https://openrouter.ai/keys' },
  zai:              { name: 'Z.ai (GLM)',                emoji: '🌐', type: 'openai',    placeholder: 'Clé Z.ai...',      docsUrl: 'https://www.z.ai/' },
  custom_openai:    { name: 'Custom — compatible OpenAI',    emoji: '🔧', type: 'openai',    placeholder: 'Clé API...', docsUrl: '' },
  custom_anthropic: { name: 'Custom — compatible Anthropic', emoji: '🔧', type: 'anthropic', placeholder: 'Clé API...', docsUrl: '' },
};

// ─── MODÈLES PRÉDÉFINIS ──────────────────────────
const PRESET_MODELS = {
  anthropic: [
    { id: 'claude-opus-4-5',    name: 'Claude Opus 4.5' },
    { id: 'claude-sonnet-4-5',  name: 'Claude Sonnet 4.5 ✦' },
    { id: 'claude-haiku-4-5',   name: 'Claude Haiku 4.5' },
  ],
  mistral: [
    { id: 'mistral-large-latest', name: 'Mistral Large' },
    { id: 'mistral-small-latest', name: 'Mistral Small' },
    { id: 'codestral-latest',     name: 'Codestral' },
    { id: 'open-mistral-nemo',    name: 'Mistral Nemo' },
  ],
  deepseek: [
    { id: 'deepseek-chat',     name: 'DeepSeek Chat (V3)' },
    { id: 'deepseek-reasoner', name: 'DeepSeek Reasoner (R1)' },
  ],
  gemini: [
    { id: 'gemini-2.0-flash',      name: 'Gemini 2.0 Flash' },
    { id: 'gemini-2.0-flash-lite', name: 'Gemini 2.0 Flash Lite' },
    { id: 'gemini-1.5-pro',        name: 'Gemini 1.5 Pro' },
  ],
  cohere: [
    { id: 'command-r-plus', name: 'Command R+' },
    { id: 'command-r',      name: 'Command R' },
  ],
};

// ─── STATE ────────────────────────────────────────
// configuredProviders: [{ instanceId, typeId, name, emoji, type, key, customUrl, models, selectedModel }]
// instanceId = unique id, permet plusieurs instances du même type (ex: 2x custom_openai)
let state = {
  configuredProviders:   [],   // liste des providers créés par l'utilisateur
  currentProvider:       '',   // instanceId du provider actif
  maxIterations:         15,
  maxInputTokens:        40000,
  memoryEnabled:         true,
  historyEnabled:        true,
  historyRetention:      30,
  uiLang:                'fr',
  agentLang:             'fr',
  thinkingCollapsed:     true,
  highlightClicks:       true,
  debugMode:             false,
  theme:                 'light',
  userSystemPrompt:      '',  // custom system prompt for the agent
  bestPractices:         'auto', // 'auto' | 'always' | 'never'
  maxTabSessions:        10, // limite du nombre d'onglets dans l'extension
  currentMode:           'libre',
  autoDetectMode:        true,
  enabledModes:          [], // sera rempli avec tous les modes par défaut
};

let memory = [];
let history = [];

// ─── INIT ──────────────────────────────────────
document.addEventListener('DOMContentLoaded', async () => {
  const logoEl = document.getElementById('logo-icon-config');
  if (logoEl) logoEl.innerHTML = ICO('brain', 18);
  await loadAll();
  updateI18nConfig();
  setupTabs();
  setupTheme();
  renderProviders();
  setupAddProviderForm();
  renderMemory();
  renderHistory();
  renderModes();
  setupSaveBar();
  applyFormValues();
  initToolsTab();
  initModesTab();

  // Language change listeners
  document.getElementById('ui-lang').addEventListener('change', (e) => {
    state.uiLang = e.target.value;
    updateI18nConfig();
    markUnsaved();
  });
  document.getElementById('agent-lang').addEventListener('change', (e) => {
    state.agentLang = e.target.value;
    markUnsaved();
  });

  document.getElementById('back-btn').addEventListener('click', () => window.close());
});

async function loadAll() {
  const keys = [
    'configuredProviders', 'currentProvider',
    'maxIterations', 'maxInputTokens', 'memoryEnabled', 'historyEnabled',
    'historyRetention', 'uiLang', 'agentLang', 'thinkingCollapsed', 'highlightClicks', 'debugMode', 'theme',
    'userSystemPrompt', 'bestPractices', 'maxTabSessions',
    'persistentMemory',
    // Legacy keys for migration
    'providerKeys', 'providerModels', 'providerSelectedModel', 'providerCustomUrl',
  ];
  const stored = await chrome.storage.local.get(keys);

  if (stored.configuredProviders && stored.configuredProviders.length > 0) {
    state.configuredProviders = stored.configuredProviders;
  } else if (stored.providerKeys && Object.keys(stored.providerKeys).length > 0) {
    state.configuredProviders = migrateFromV4(stored);
  }

  if (stored.currentProvider) state.currentProvider = stored.currentProvider;
  if (stored.maxIterations)   state.maxIterations   = stored.maxIterations;
  if (stored.maxInputTokens)  state.maxInputTokens  = stored.maxInputTokens;
  if (stored.memoryEnabled  !== undefined) state.memoryEnabled  = stored.memoryEnabled;
  if (stored.historyEnabled !== undefined) state.historyEnabled = stored.historyEnabled;
  if (stored.historyRetention) state.historyRetention = stored.historyRetention;
  if (stored.uiLang)          state.uiLang          = stored.uiLang;
  if (stored.agentLang)       state.agentLang       = stored.agentLang;
  if (stored.thinkingCollapsed !== undefined) state.thinkingCollapsed = stored.thinkingCollapsed;
  if (stored.highlightClicks !== undefined) state.highlightClicks = stored.highlightClicks;
  if (stored.debugMode !== undefined) state.debugMode = stored.debugMode;
  if (stored.theme)           state.theme           = stored.theme;
  if (stored.userSystemPrompt) state.userSystemPrompt = stored.userSystemPrompt;
  if (stored.bestPractices)    state.bestPractices    = stored.bestPractices;
  if (stored.maxTabSessions)  state.maxTabSessions  = stored.maxTabSessions;
  if (stored.currentMode)    state.currentMode    = stored.currentMode;
  if (stored.autoDetectMode !== undefined) state.autoDetectMode = stored.autoDetectMode;
  if (stored.enabledModes && stored.enabledModes.length > 0) {
    state.enabledModes = stored.enabledModes;
  } else if (typeof window.BrowserMindModes !== 'undefined') {
    state.enabledModes = Object.keys(window.BrowserMindModes);
  }

  memory = stored.persistentMemory || [];
  await loadHistory();
}

// Migrate v4 flat storage to new configuredProviders array
function migrateFromV4(stored) {
  const keys = stored.providerKeys || {};
  const models = stored.providerModels || {};
  const selected = stored.providerSelectedModel || {};
  const urls = stored.providerCustomUrl || {};
  const result = [];
  for (const [typeId, key] of Object.entries(keys)) {
    if (!key) continue;
    const catalog = PROVIDER_CATALOG[typeId];
    if (!catalog) continue;
    result.push({
      instanceId: typeId + '_' + Date.now(),
      typeId,
      name: catalog.name,
      emoji: catalog.emoji,
      type: catalog.type,
      key,
      customUrl: urls[typeId] || '',
      models: models[typeId] || PRESET_MODELS[typeId] || [],
      selectedModel: selected[typeId] || '',
    });
  }
  return result;
}

function applyFormValues() {
  document.getElementById('max-iterations').value  = state.maxIterations;
  document.getElementById('max-tokens').value       = state.maxInputTokens;
  document.getElementById('memory-enabled').checked = state.memoryEnabled;
  document.getElementById('history-enabled').checked= state.historyEnabled;
  document.getElementById('history-retention').value= state.historyRetention;
  document.getElementById('ui-lang').value          = state.uiLang || 'fr';
  document.getElementById('agent-lang').value       = state.agentLang || 'fr';
  document.getElementById('thinking-collapsed').checked = state.thinkingCollapsed;
  document.getElementById('highlight-clicks').checked = state.highlightClicks;
  document.getElementById('debug-mode').checked = state.debugMode;
  document.getElementById('theme-toggle').checked   = state.theme === 'dark';
  document.getElementById('system-prompt').value    = state.userSystemPrompt || '';
  document.getElementById('best-practices').value   = state.bestPractices || 'auto';
  document.getElementById('max-tab-sessions').value = state.maxTabSessions || 10;
}

// ─── TABS ──────────────────────────────────────
function setupTabs() {
  document.querySelectorAll('.tab').forEach(tab => {
    tab.addEventListener('click', () => {
      document.querySelectorAll('.tab').forEach(t => t.classList.remove('active'));
      document.querySelectorAll('.tab-content').forEach(c => c.classList.remove('active'));
      tab.classList.add('active');
      document.getElementById('tab-' + tab.dataset.tab)?.classList.add('active');
    });
  });
}

// ─── THEME ──────────────────────────────────────
function setupTheme() {
  document.body.setAttribute('data-theme', state.theme);
  document.getElementById('theme-toggle').addEventListener('change', e => {
    state.theme = e.target.checked ? 'dark' : 'light';
    document.body.setAttribute('data-theme', state.theme);
    markUnsaved();
  });
}

// ─── ADD PROVIDER FORM ──────────────────────────
function setupAddProviderForm() {
  const showBtn   = document.getElementById('show-add-provider-btn');
  const form      = document.getElementById('add-provider-form');
  const cancelBtn = document.getElementById('new-provider-cancel-btn');
  const addBtn    = document.getElementById('new-provider-add-btn');
  const typeSelect= document.getElementById('new-provider-type');
  const urlField  = document.getElementById('new-provider-url-field');
  const nameField = document.getElementById('new-provider-name-field');
  const docsLink  = document.getElementById('new-provider-docs-link');
  const keyInput  = document.getElementById('new-provider-key');

  showBtn.addEventListener('click', () => {
    form.style.display = 'block';
    showBtn.style.display = 'none';
    typeSelect.value = '';
    document.getElementById('new-provider-key').value = '';
    document.getElementById('new-provider-url').value = '';
    document.getElementById('new-provider-name').value = '';
    urlField.style.display = 'none';
    nameField.style.display = 'none';
    docsLink.innerHTML = '';
    typeSelect.focus();
  });

  cancelBtn.addEventListener('click', () => {
    form.style.display = 'none';
    showBtn.style.display = '';
  });

  typeSelect.addEventListener('change', () => {
    const typeId = typeSelect.value;
    const catalog = PROVIDER_CATALOG[typeId];
    if (!catalog) { urlField.style.display = 'none'; nameField.style.display = 'none'; return; }

    // Show URL field for custom providers
    const isCustom = typeId.startsWith('custom_');
    urlField.style.display  = isCustom ? 'flex' : 'none';
    nameField.style.display = isCustom ? 'flex' : 'none';

    // Update URL hint based on provider type
    const hintEl = document.getElementById('provider-url-hint');
    if (hintEl) {
      if (typeId === 'custom_anthropic') {
        hintEl.innerHTML = 'URL complète jusqu\'au <code>/v1</code> — ex: <code>https://votre-proxy.com/v1</code>';
      } else {
        hintEl.innerHTML = 'URL complète jusqu\'au <code>/v1</code> — ex: <code>http://localhost:11434/v1</code> (Ollama), <code>http://localhost:1234/v1</code> (LM Studio)';
      }
    }

    keyInput.placeholder = catalog.placeholder;
    docsLink.innerHTML = catalog.docsUrl
      ? `<a href="${catalog.docsUrl}" target="_blank" style="color:var(--accent2)">🔗 Obtenir une clé API</a>`
      : '';
  });

  addBtn.addEventListener('click', addProvider);
}

async function addProvider() {
  const typeId   = document.getElementById('new-provider-type').value;
  const key      = document.getElementById('new-provider-key').value.trim();
  const customUrl= document.getElementById('new-provider-url').value.trim();
  const customName = document.getElementById('new-provider-name').value.trim();

  if (!typeId) { alert(tConfig('selectProviderType')); return; }
  if (!key)    { alert(tConfig('apiKeyRequired')); return; }

  const isCustom = typeId.startsWith('custom_');
  if (isCustom && !customUrl) { alert(tConfig('baseUrlRequired')); return; }

  const catalog = PROVIDER_CATALOG[typeId];
  const instanceId = typeId + '_' + Date.now();

  const provider = {
    instanceId,
    typeId,
    name:         customName || catalog.name,
    emoji:        catalog.emoji,
    type:         catalog.type,
    key,
    customUrl:    customUrl || '',
    models:       PRESET_MODELS[typeId] || [],
    selectedModel: (PRESET_MODELS[typeId]?.[0]?.id) || '',
  };

  state.configuredProviders.push(provider);

  // Auto-select if first one
  if (state.configuredProviders.length === 1) {
    state.currentProvider = instanceId;
  }

  // Hide form
  document.getElementById('add-provider-form').style.display = 'none';
  document.getElementById('show-add-provider-btn').style.display = '';

  renderProviders();
  markUnsaved();
  await saveAll();
}

// ─── PROVIDERS LIST ─────────────────────────────
function renderProviders() {
  const grid  = document.getElementById('provider-grid');
  const empty = document.getElementById('providers-empty');
  const count = document.getElementById('providers-count');

  const n = state.configuredProviders.length;
  count.textContent = `${n} ${tConfig('providerCountLabel')}`;

  // Remove existing cards (keep empty placeholder)
  grid.querySelectorAll('.provider-card').forEach(c => c.remove());

  if (n === 0) {
    if (empty) empty.style.display = '';
    return;
  }
  if (empty) empty.style.display = 'none';

  state.configuredProviders.forEach(p => {
    grid.appendChild(buildProviderCard(p));
  });
}

function buildProviderCard(provider) {
  const { instanceId, typeId, name, emoji, type, key, customUrl, models, selectedModel } = provider;
  const isCustom   = typeId.startsWith('custom_');
  const isActive   = instanceId === state.currentProvider;
  const catalog    = PROVIDER_CATALOG[typeId] || {};

  const card = document.createElement('div');
  card.className = `provider-card configured`;
  card.id = `pcard-${instanceId}`;

  card.innerHTML = `
    <div class="provider-card-header">
      <div class="provider-card-name">
        <span class="provider-emoji">${emoji}</span>
        <span>${escHtml(name)}</span>
        ${isActive ? `<span class="provider-status ok">${tConfig('active')}</span>` : ''}
      </div>
      <div style="display:flex;gap:6px;align-items:center">
        ${!isActive ? `<button class="fetch-btn" data-action="set-active" title="${tConfig('useProvider')}">${tConfig('activate')}</button>` : ''}
        <button class="provider-delete-btn" data-action="delete" title="${tConfig('deleteProvider')}">🗑</button>
      </div>
    </div>
    <div class="provider-card-body">
      ${isCustom ? `
        <div class="field">
          <label class="field-label">${tConfig('baseUrlLabel')}</label>
          <input class="input input-mono" data-field="url" value="${escHtml(customUrl)}" placeholder="https://..."/>
        </div>
      ` : ''}
      <div class="field">
        <label class="field-label">${tConfig('apiKeyLabel')}</label>
        <div class="provider-card-row" style="align-items:center">
          <div class="field" style="flex:1">
            <input type="password" class="input input-mono" data-field="key"
              placeholder="${catalog.placeholder || tConfig('apiKeyPlaceholder')}"
              value="${'•'.repeat(Math.min(key.length, 12))}"/>
          </div>
          <button class="fetch-btn" data-action="test" title="${tConfig('testConnection')}">${tConfig('testBtn')}</button>
        </div>
        <span class="test-result" data-test-result></span>
      </div>
      <div class="field">
        <label class="field-label">${tConfig('defaultModel')}</label>
        <div class="provider-card-row">
          <div class="model-select-wrap" style="flex:1">
            <select class="input select" data-field="model">
              ${models.length === 0
                ? `<option value="">${tConfig('clickRefresh')}</option>`
                : models.map(m => `<option value="${m.id}"${m.id === selectedModel ? ' selected' : ''}>${m.name || m.id}</option>`).join('')}
            </select>
            ${models.length > 0 ? `<span class="model-count">${models.length}</span>` : ''}
          </div>
          <button class="fetch-btn" data-action="fetch-models" title="${tConfig('refreshModels')}">${tConfig('refreshBtn')}</button>
        </div>
      </div>
    </div>
  `;

  // Events
  card.querySelector('[data-action="delete"]').addEventListener('click', () => deleteProvider(instanceId));
  card.querySelector('[data-action="test"]').addEventListener('click', () => testProvider(instanceId, card));
  card.querySelector('[data-action="fetch-models"]').addEventListener('click', () => fetchModels(instanceId, card));

  card.querySelector('[data-action="set-active"]')?.addEventListener('click', () => {
    state.currentProvider = instanceId;
    renderProviders();
    markUnsaved();
    saveAll();
  });

  card.querySelector('[data-field="key"]').addEventListener('focus', e => {
    if (e.target.value.startsWith('•')) e.target.value = '';
  });
  card.querySelector('[data-field="key"]').addEventListener('blur', e => {
    const val = e.target.value.trim();
    if (val && !val.startsWith('•')) {
      const p = state.configuredProviders.find(p => p.instanceId === instanceId);
      if (p) { p.key = val; markUnsaved(); }
    }
    if (!e.target.value) {
      const p = state.configuredProviders.find(p => p.instanceId === instanceId);
      e.target.value = '•'.repeat(Math.min((p?.key || '').length, 12));
    }
  });
  card.querySelector('[data-field="model"]').addEventListener('change', e => {
    const p = state.configuredProviders.find(p => p.instanceId === instanceId);
    if (p) { p.selectedModel = e.target.value; markUnsaved(); }
  });
  if (isCustom) {
    card.querySelector('[data-field="url"]')?.addEventListener('change', e => {
      const p = state.configuredProviders.find(p => p.instanceId === instanceId);
      if (p) { p.customUrl = e.target.value.trim(); markUnsaved(); }
    });
  }

  return card;
}

function deleteProvider(instanceId) {
  if (!confirm(tConfig('deleteConfirm'))) return;
  state.configuredProviders = state.configuredProviders.filter(p => p.instanceId !== instanceId);
  if (state.currentProvider === instanceId) {
    state.currentProvider = state.configuredProviders[0]?.instanceId || '';
  }
  renderProviders();
  markUnsaved();
  saveAll();
}

// ─── TEST & FETCH MODELS ────────────────────────
async function testProvider(instanceId, card) {
  const p = state.configuredProviders.find(p => p.instanceId === instanceId);
  if (!p) return;

  const resultEl = card.querySelector('[data-test-result]');
  const btn = card.querySelector('[data-action="test"]');
  const keyInput = card.querySelector('[data-field="key"]');
  const key = keyInput.value.startsWith('•') ? p.key : keyInput.value.trim();

  if (!key) { resultEl.textContent = '⚠ Clé API manquante'; resultEl.style.color = 'var(--warn)'; return; }

  btn.textContent = '⏳'; btn.classList.add('loading');
  resultEl.textContent = '';

  try {
    const resp = await sendToBg('FETCH_MODELS', { provider: p.typeId, apiKey: key, baseUrl: p.customUrl });
    if (resp.error) throw new Error(resp.error);
    resultEl.textContent = `✅ OK — ${resp.models.length} modèles`;
    resultEl.style.color = 'var(--success)';
    p.key = key;
    markUnsaved();
  } catch (e) {
    resultEl.textContent = `❌ ${e.message}`;
    resultEl.style.color = 'var(--error)';
  } finally {
    btn.textContent = '🔌 Test'; btn.classList.remove('loading');
  }
}

async function fetchModels(instanceId, card) {
  const p = state.configuredProviders.find(p => p.instanceId === instanceId);
  if (!p) return;

  const btn = card.querySelector('[data-action="fetch-models"]');
  const resultEl = card.querySelector('[data-test-result]');
  const keyInput = card.querySelector('[data-field="key"]');
  const key = keyInput.value.startsWith('•') ? p.key : keyInput.value.trim();

  btn.textContent = '⏳'; btn.classList.add('loading');

  try {
    const resp = await sendToBg('FETCH_MODELS', { provider: p.typeId, apiKey: key, baseUrl: p.customUrl });
    if (resp.error) throw new Error(resp.error);
    p.models = resp.models;
    if (!p.selectedModel && resp.models.length > 0) p.selectedModel = resp.models[0].id;

    const sel = card.querySelector('[data-field="model"]');
    sel.innerHTML = resp.models.map(m => `<option value="${m.id}"${m.id === p.selectedModel ? ' selected' : ''}>${m.name || m.id}</option>`).join('');

    let wrap = card.querySelector('.model-select-wrap');
    let cntEl = wrap.querySelector('.model-count');
    if (!cntEl) { cntEl = document.createElement('span'); cntEl.className = 'model-count'; wrap.appendChild(cntEl); }
    cntEl.textContent = resp.models.length;

    markUnsaved();
  } catch (e) {
    if (resultEl) { resultEl.textContent = `❌ ${e.message}`; resultEl.style.color = 'var(--error)'; }
  } finally {
    btn.textContent = '↻ Actualiser'; btn.classList.remove('loading');
  }
}

// ─── MEMORY ─────────────────────────────────────
function renderMemory(filter = '') {
  const list = document.getElementById('memory-list');
  const items = filter ? memory.filter(m => m.key.includes(filter) || m.value.includes(filter)) : memory;

  if (items.length === 0) {
    list.innerHTML = `<div class="memory-empty">${filter ? tConfig('noResults') : tConfig('noMemoryEntries')}</div>`;
    return;
  }

  list.innerHTML = items.map(m => `
    <div class="memory-item">
      <span class="memory-key">${escHtml(m.key)}</span>
      <span class="memory-val" title="${escHtml(m.value)}">${escHtml(m.value)}</span>
      <span class="memory-ts">${formatDate(m.timestamp)}</span>
      <button class="memory-del" data-key="${escHtml(m.key)}" title="Supprimer">✕</button>
    </div>
  `).join('');

  list.querySelectorAll('.memory-del').forEach(btn => {
    btn.addEventListener('click', async () => {
      const key = btn.dataset.key;
      memory = memory.filter(m => m.key !== key);
      await chrome.storage.local.set({ persistentMemory: memory });
      renderMemory(document.getElementById('mem-search').value);
    });
  });
}

document.addEventListener('DOMContentLoaded', () => {
  // Favicon error fallback handler
  document.body.addEventListener('error', e => {
    if (e.target.matches('img[data-fallback="none"]')) {
      e.target.style.display = 'none';
    }
  }, true);

  document.getElementById('mem-search')?.addEventListener('input', e => renderMemory(e.target.value));
  document.getElementById('mem-add-btn')?.addEventListener('click', async () => {
    const k = document.getElementById('mem-new-key').value.trim();
    const v = document.getElementById('mem-new-val').value.trim();
    if (!k || !v) return;
    const idx = memory.findIndex(m => m.key.toLowerCase() === k.toLowerCase());
    const entry = { key: k, value: v, timestamp: Date.now() };
    if (idx >= 0) memory[idx] = entry; else memory.push(entry);
    await chrome.storage.local.set({ persistentMemory: memory });
    document.getElementById('mem-new-key').value = '';
    document.getElementById('mem-new-val').value = '';
    renderMemory();
  });
  document.getElementById('mem-clear-btn')?.addEventListener('click', async () => {
    if (confirm('Effacer toute la mémoire ?')) {
      memory = [];
      await chrome.storage.local.set({ persistentMemory: [] });
      renderMemory();
    }
  });
  document.getElementById('mem-export-btn')?.addEventListener('click', () => {
    const csv = 'clé,valeur,date\n' + memory.map(m =>
      `"${m.key.replace(/"/g, '""')}","${m.value.replace(/"/g, '""')}","${new Date(m.timestamp).toISOString()}"`
    ).join('\n');
    downloadText(csv, 'memory-export.csv', 'text/csv');
  });
});

// ─── HISTORY ────────────────────────────────────
async function loadHistory() {
  const { historyIndex } = await chrome.storage.local.get('historyIndex');
  const index = historyIndex || [];
  if (index.length === 0) { history = []; return; }
  const sessionKeys = index.map(id => `hist_${id}`);
  const sessions = await chrome.storage.local.get(sessionKeys);
  history = index.map(id => sessions[`hist_${id}`]).filter(Boolean).sort((a, b) => b.updatedAt - a.updatedAt);
}

function renderHistory(filter = '') {
  const list = document.getElementById('history-list');
  const items = filter
    ? history.filter(h => (h.title || '').toLowerCase().includes(filter.toLowerCase()) ||
                          (h.url || '').toLowerCase().includes(filter.toLowerCase()) ||
                          (h.summary || '').toLowerCase().includes(filter.toLowerCase()))
    : history;

  if (items.length === 0) {
    list.innerHTML = `<div class="history-empty">${filter ? tConfig('noResults') : tConfig('noHistorySaved') + '<br><small style="color:var(--text3)">' + tConfig('historyHint') + '</small>'}</div>`;
    return;
  }

  list.innerHTML = items.map(sess => `
    <div class="history-item" data-id="${sess.id}">
      <img class="history-favicon" src="https://www.google.com/s2/favicons?domain=${encodeURIComponent(sess.url || '')}&sz=16" data-fallback="none" />
      <div class="history-meta">
        <div class="history-title">${escHtml(sess.title || 'Sans titre')}</div>
        <div class="history-url">${escHtml(sess.url || '')}</div>
        <div class="history-summary">${escHtml(sess.summary || sess.firstMessage || '')}</div>
        <div class="history-footer">
          <span class="history-date">${formatDate(sess.updatedAt)}</span>
          <span class="history-provider">${sess.provider || '—'}</span>
          <span class="history-msg-count">${sess.messageCount || 0} msg</span>
        </div>
      </div>
      <button class="history-del" data-id="${sess.id}" title="Supprimer">✕</button>
    </div>
  `).join('');

  list.querySelectorAll('.history-del').forEach(btn => {
    btn.addEventListener('click', async e => {
      e.stopPropagation();
      await deleteHistorySession(btn.dataset.id);
      renderHistory(document.getElementById('hist-search').value);
    });
  });
}

async function deleteHistorySession(id) {
  history = history.filter(h => h.id !== id);
  const { historyIndex } = await chrome.storage.local.get('historyIndex');
  await chrome.storage.local.remove(`hist_${id}`);
  await chrome.storage.local.set({ historyIndex: (historyIndex || []).filter(i => i !== id) });
}

document.addEventListener('DOMContentLoaded', () => {
  document.getElementById('hist-search')?.addEventListener('input', e => renderHistory(e.target.value));
  document.getElementById('hist-clear-btn')?.addEventListener('click', async () => {
    if (confirm('Effacer tout l\'historique ?')) {
      const { historyIndex } = await chrome.storage.local.get('historyIndex');
      await chrome.storage.local.remove([...(historyIndex || []).map(id => `hist_${id}`), 'historyIndex']);
      history = [];
      renderHistory();
    }
  });
});

// ─── SAVE ────────────────────────────────────────
function setupSaveBar() {
  document.getElementById('save-btn').addEventListener('click', saveAll);
  setSaveInfo('💾');
}

async function saveAll() {
  state.maxIterations   = parseInt(document.getElementById('max-iterations').value) || 15;
  state.maxInputTokens  = parseInt(document.getElementById('max-tokens').value) || 40000;
  state.memoryEnabled   = document.getElementById('memory-enabled').checked;
  state.historyEnabled  = document.getElementById('history-enabled').checked;
  state.historyRetention= parseInt(document.getElementById('history-retention').value) || 30;
  state.uiLang          = document.getElementById('ui-lang').value;
  state.agentLang       = document.getElementById('agent-lang').value;
  state.thinkingCollapsed = document.getElementById('thinking-collapsed').checked;
  state.highlightClicks = document.getElementById('highlight-clicks').checked;
  state.debugMode = document.getElementById('debug-mode').checked;
  state.theme           = document.getElementById('theme-toggle').checked ? 'dark' : 'light';
  state.userSystemPrompt = document.getElementById('system-prompt').value || '';
  state.bestPractices    = document.getElementById('best-practices').value || 'auto';
  state.maxTabSessions  = parseInt(document.getElementById('max-tab-sessions').value) || 10;
  state.autoDetectMode  = document.getElementById('auto-detect-mode')?.checked ?? true;

  // Collect enabled modes from checkboxes
  const modeCheckboxes = document.querySelectorAll('.mode-toggle-checkbox');
  const enabledModes = [];
  modeCheckboxes.forEach(cb => {
    if (cb.checked) enabledModes.push(cb.value);
  });
  if (enabledModes.length === 0) {
    // Fallback to all modes if none selected
    if (typeof window.BrowserMindModes !== 'undefined') {
      enabledModes.push(...Object.keys(window.BrowserMindModes));
    }
  }
  state.enabledModes = enabledModes;

  // Build legacy-compatible storage for sidepanel.js to read
  const providerKeys = {};
  const providerModels = {};
  const providerSelectedModel = {};
  const providerCustomUrl = {};
  state.configuredProviders.forEach(p => {
    providerKeys[p.instanceId]          = p.key;
    providerModels[p.instanceId]        = p.models;
    providerSelectedModel[p.instanceId] = p.selectedModel;
    providerCustomUrl[p.instanceId]     = p.customUrl;
  });

  await chrome.storage.local.set({
    configuredProviders:   state.configuredProviders,
    currentProvider:       state.currentProvider,
    providerKeys,
    providerModels,
    providerSelectedModel,
    providerCustomUrl,
    maxIterations:         state.maxIterations,
    maxInputTokens:        state.maxInputTokens,
    memoryEnabled:         state.memoryEnabled,
    historyEnabled:        state.historyEnabled,
    historyRetention:      state.historyRetention,
    uiLang:               state.uiLang,
    agentLang:            state.agentLang,
    thinkingCollapsed:     state.thinkingCollapsed,
    highlightClicks:     state.highlightClicks,
    debugMode:            state.debugMode,
    theme:                 state.theme,
    userSystemPrompt:      state.userSystemPrompt,
    bestPractices:         state.bestPractices,
    maxTabSessions:        state.maxTabSessions,
    currentMode:           state.currentMode,
    autoDetectMode:        state.autoDetectMode,
    enabledModes:          state.enabledModes,
  });

  setSaveInfo(`${tConfig('changesSaved')} — ${new Date().toLocaleTimeString()}`);
  renderProviders();
  // Signal sidepanel to reload
  chrome.runtime.sendMessage({ type: 'SETTINGS_SAVED' }).catch(e => { console.warn('BrowserMind: settings saved notification failed', e.message); });
}

function markUnsaved() {
  setSaveInfo('⚠ ' + tConfig('markUnsaved'));
  document.getElementById('save-info').style.color = 'var(--warn)';
}
function setSaveInfo(text) {
  const el = document.getElementById('save-info');
  el.textContent = text;
  el.style.color = 'var(--text3)';
}

// ─── HELPERS ─────────────────────────────────────
async function sendToBg(type, data) {
  return new Promise((res, rej) => {
    chrome.runtime.sendMessage({ type, ...data }, resp => {
      if (chrome.runtime.lastError) rej(new Error(chrome.runtime.lastError.message));
      else res(resp);
    });
  });
}

function formatDate(ts) {
  if (!ts) return '';
  const d = new Date(ts), now = new Date(), diff = now - d;
  const localeMap = { fr: 'fr-FR', en: 'en-US', es: 'es-ES', it: 'it-IT', de: 'de-DE', pt: 'pt-BR' };
  const locale = localeMap[state.uiLang] || 'fr-FR';
  const rtf = new Intl.RelativeTimeFormat(locale, { numeric: 'auto' });
  if (diff < 60000) return rtf.format(-Math.floor(diff / 1000), 'second');
  if (diff < 3600000) return rtf.format(-Math.floor(diff / 60000), 'minute');
  if (diff < 86400000) return rtf.format(-Math.floor(diff / 3600000), 'hour');
  return d.toLocaleDateString(locale, { day: 'numeric', month: 'short' });
}

function downloadText(content, filename, mime) {
  const blob = new Blob([content], { type: mime });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a'); a.href = url; a.download = filename; a.click();
  setTimeout(() => URL.revokeObjectURL(url), 1000);
}

function escHtml(str) {
  if (!str) return '';
  return String(str).replace(/&/g,'&amp;').replace(/</g,'&lt;').replace(/>/g,'&gt;').replace(/"/g,'&quot;');
}

// ─── MODES RENDERING ───────────────────────────────
function renderModes() {
  renderNativeModesList();
  renderCustomModesList();
  // Set auto-detect checkbox
  const autoDetect = document.getElementById('auto-detect-mode');
  if (autoDetect) autoDetect.checked = state.autoDetectMode !== false;
}

function renderNativeModesList() {
  const container = document.getElementById('modes-list');
  if (!container) return;

  const modes = window.BrowserMindModes || {};
  const enabledModes = state.enabledModes && state.enabledModes.length > 0
    ? state.enabledModes
    : Object.keys(modes);

  container.innerHTML = Object.values(modes).map(mode => {
    const isEnabled  = enabledModes.includes(mode.id);
    const isActive   = state.currentMode === mode.id;
    const toolCount  = mode.tools?.includes('*') ? 'tous' : (mode.tools?.length || 0) + ' outil(s)';
    return `
      <div class="mode-card${isActive ? ' active' : ''}">
        <div class="mode-card-icon">${mode.icon}</div>
        <div class="mode-card-info">
          <div class="mode-card-name">${mode.labelKey ? tConfig('mode' + mode.labelKey.replace('mode','')) || mode.id : mode.id}</div>
          <div class="mode-card-desc">${mode.description || ''}</div>
          <div class="mode-card-meta">${toolCount}</div>
        </div>
        <div class="mode-card-toggle">
          <label class="toggle">
            <input type="checkbox" class="mode-toggle-checkbox" value="${mode.id}" ${isEnabled ? 'checked' : ''}>
            <span class="toggle-slider"></span>
          </label>
        </div>
      </div>
    `;
  }).join('');

  container.querySelectorAll('.mode-toggle-checkbox').forEach(cb => {
    cb.addEventListener('change', markUnsaved);
  });
}

// ═══════════════════════════════════════════════
//  CUSTOM MODES — Passe C
// ═══════════════════════════════════════════════

let _customModes = {};   // { modeId: modeObject }
let _editingModeId = null;

async function initModesTab() {
  const data = await new Promise(r => chrome.storage.local.get(['customModes'], r));
  _customModes = data.customModes || {};
  renderCustomModesList();

  document.getElementById('add-mode-btn')?.addEventListener('click', () => openModeModal(null));
  document.getElementById('mode-modal-cancel')?.addEventListener('click', closeModeModal);
  document.getElementById('mode-modal-save')?.addEventListener('click', saveModeFromModal);

  // "Tous les outils" checkbox toggles the grid
  document.getElementById('mode-tools-all')?.addEventListener('change', e => {
    document.getElementById('mode-tools-grid').style.opacity = e.target.checked ? '0.35' : '1';
    document.getElementById('mode-tools-grid').style.pointerEvents = e.target.checked ? 'none' : '';
  });
}

function renderCustomModesList() {
  const container = document.getElementById('custom-modes-list');
  if (!container) return;

  const modes = Object.values(_customModes);
  if (modes.length === 0) {
    container.innerHTML = `<div class="field-hint" style="padding:8px 0">${tConfig('noCustomModes')}</div>`;
    return;
  }

  container.innerHTML = modes.map(m => {
    const toolCount = m.tools?.includes('*') ? 'tous les outils' : `${m.tools?.length || 0} outil(s)`;
    const promptPreview = (m.systemPromptExtra || '').slice(0, 80).replace(/\n/g, ' ');
    return `
      <div class="mode-card mode-card-custom">
        <div class="mode-card-icon">${m.icon || '🧩'}</div>
        <div class="mode-card-info">
          <div class="mode-card-name">${escHtml(m.label || m.id)}</div>
          <code class="tool-card-id">${escHtml(m.id)}</code>
          <div class="mode-card-desc">${escHtml(m.description || '')}</div>
          ${promptPreview ? `<div class="mode-card-prompt-preview">"${escHtml(promptPreview)}${m.systemPromptExtra?.length > 80 ? '…' : ''}"</div>` : ''}
          <div class="mode-card-meta">${toolCount}</div>
        </div>
        <div class="mode-card-toggle">
          <label class="toggle">
            <input type="checkbox" class="mode-toggle-checkbox" value="${m.id}" checked>
            <span class="toggle-slider"></span>
          </label>
        </div>
        <div class="tool-card-actions" style="margin-left:4px">
          <button class="btn btn-ghost btn-xs" data-mode-edit="${m.id}">✏️</button>
          <button class="btn btn-danger btn-xs" data-mode-del="${m.id}">🗑</button>
        </div>
      </div>
    `;
  }).join('');

  container.querySelectorAll('[data-mode-edit]').forEach(btn => {
    btn.addEventListener('click', () => openModeModal(btn.dataset.modeEdit));
  });
  container.querySelectorAll('[data-mode-del]').forEach(btn => {
    btn.addEventListener('click', () => deleteCustomMode(btn.dataset.modeDel));
  });
  container.querySelectorAll('.mode-toggle-checkbox').forEach(cb => {
    cb.addEventListener('change', markUnsaved);
  });
}

function openModeModal(modeId) {
  _editingModeId = modeId;
  const modal = document.getElementById('mode-modal');
  const title = document.getElementById('mode-modal-title');
  if (!modal) return;

  // Populate tools grid
  const grid = document.getElementById('mode-tools-grid');
  const allTools = window.ToolRegistry?.getAll() || [];
  grid.innerHTML = allTools.map(t => `
    <label class="mode-tool-checkbox-label" title="${escHtml(t.description)}">
      <input type="checkbox" class="mode-tool-cb" value="${t.name}">
      <span>${t.icon || '🔧'} ${escHtml(t.label || t.name)}</span>
    </label>
  `).join('');

  if (modeId && _customModes[modeId]) {
    const m = _customModes[modeId];
    title.textContent = `✏️ ${tConfig('editModeTitle')} — ${m.label || m.id}`;
    document.getElementById('mode-icon').value   = m.icon || '🧩';
    document.getElementById('mode-id').value     = m.id;
    document.getElementById('mode-id').disabled  = true;
    document.getElementById('mode-label').value  = m.label || '';
    document.getElementById('mode-desc').value   = m.description || '';
    document.getElementById('mode-prompt').value = m.systemPromptExtra || '';
    document.getElementById('mode-urls').value   = (m.urlPatterns || []).join(', ');

    const isAll = m.tools?.includes('*');
    document.getElementById('mode-tools-all').checked = isAll;
    grid.style.opacity = isAll ? '0.35' : '1';
    grid.style.pointerEvents = isAll ? 'none' : '';
    grid.querySelectorAll('.mode-tool-cb').forEach(cb => {
      cb.checked = isAll || (m.tools || []).includes(cb.value);
    });
  } else {
    title.textContent = tConfig('newModeTitle');
    document.getElementById('mode-icon').value   = '🧩';
    document.getElementById('mode-id').value     = '';
    document.getElementById('mode-id').disabled  = false;
    document.getElementById('mode-label').value  = '';
    document.getElementById('mode-desc').value   = '';
    document.getElementById('mode-prompt').value = '';
    document.getElementById('mode-urls').value   = '';
    document.getElementById('mode-tools-all').checked = true;
    grid.style.opacity = '0.35';
    grid.style.pointerEvents = 'none';
    grid.querySelectorAll('.mode-tool-cb').forEach(cb => { cb.checked = false; });
  }

  modal.style.display = 'flex';
}

function closeModeModal() {
  const modal = document.getElementById('mode-modal');
  if (modal) modal.style.display = 'none';
}

function saveModeFromModal() {
  const id     = document.getElementById('mode-id').value.trim();
  const icon   = document.getElementById('mode-icon').value.trim() || '🧩';
  const label  = document.getElementById('mode-label').value.trim();
  const desc   = document.getElementById('mode-desc').value.trim();
  const prompt = document.getElementById('mode-prompt').value.trim();
  const urlsRaw= document.getElementById('mode-urls').value.trim();
  const isAll  = document.getElementById('mode-tools-all').checked;

  if (!id || !label) { alert(tConfig('modeRequiredFields')); return; }
  if (!/^[a-z0-9_]+$/.test(id)) { alert(tConfig('modeIdFormat')); return; }
  if (!_editingModeId && window.BrowserMindModes?.[id]) {
    alert(tConfig('modeIdExists')); return;
  }

  const tools = isAll ? ['*'] : Array.from(
    document.querySelectorAll('.mode-tool-cb:checked')
  ).map(cb => cb.value);

  const urlPatterns = urlsRaw ? urlsRaw.split(',').map(s => s.trim()).filter(Boolean) : [];

  const mode = {
    id, icon, label,
    labelKey: null,           // pas de clé i18n pour les modes custom
    description: desc,
    systemPromptExtra: prompt,
    tools,
    quickActions: [],
    apis: [],
    urlPatterns,
    isCustom: true,
  };

  _customModes[id] = mode;

  chrome.storage.local.set({ customModes: _customModes }, () => {
    // Merge into window._customModes for live use
    window._customModes = _customModes;
    // Reload registry modes
    if (window.ToolRegistry) window.ToolRegistry.saveCustomModes(_customModes);
    renderCustomModesList();
    closeModeModal();
    markUnsaved();
  });
}

function deleteCustomMode(modeId) {
  if (!confirm(tConfig('modeDeleteConfirm'))) return;
  delete _customModes[modeId];
  chrome.storage.local.set({ customModes: _customModes }, () => {
    window._customModes = _customModes;
    renderCustomModesList();
    markUnsaved();
  });
}

function tConfig(key) {
  return I18N_CONFIG[state.uiLang]?.[key] || I18N_CONFIG['fr']?.[key] || key;
}

// ═══════════════════════════════════════════════
//  ONGLET OUTILS — Passe B
// ═══════════════════════════════════════════════

let _customTools = [];   // outils user en mémoire
let _editingToolIdx = -1; // index de l'outil en cours d'édition (-1 = nouveau)

async function initToolsTab() {
  // Charger les outils custom depuis storage
  const data = await new Promise(r => chrome.storage.local.get(['customTools', 'remoteToolsUrl', 'remoteToolsCache', 'remoteToolsCachedAt'], r));
  _customTools = data.customTools || [];

  renderNativeToolsList();
  renderCustomToolsList();
  renderRemoteToolsList(data.remoteToolsCache || [], data.remoteToolsCachedAt);

  // Pré-remplir l'URL distante
  const urlInput = document.getElementById('remote-tools-url');
  if (urlInput && data.remoteToolsUrl) urlInput.value = data.remoteToolsUrl;

  // Bouton charger outils distants
  document.getElementById('remote-tools-load-btn')?.addEventListener('click', loadRemoteToolsFromUI);

  // Bouton ajouter outil
  document.getElementById('add-tool-btn')?.addEventListener('click', () => openToolModal(-1));

  // Modal
  document.getElementById('tool-modal-cancel')?.addEventListener('click', closeToolModal);
  document.getElementById('tool-modal-save')?.addEventListener('click', saveToolFromModal);
  document.getElementById('tool-schema-example')?.addEventListener('click', () => {
    document.getElementById('tool-schema').value = JSON.stringify({
      type: 'object',
      properties: {
        query: { type: 'string', description: 'Termes à rechercher' },
        limit: { type: 'number', description: 'Nombre de résultats max' }
      },
      required: ['query']
    }, null, 2);
  });
  document.getElementById('tool-executor')?.addEventListener('change', e => {
    const injectField = document.getElementById('tool-inject-field');
    if (injectField) injectField.style.display = e.target.value === 'inject' ? 'block' : 'none';
  });
}

// ── Affichage des outils natifs ──
function renderNativeToolsList() {
  const container = document.getElementById('native-tools-list');
  if (!container) return;
  const natives = window.ToolRegistry?.NATIVE_TOOLS || [];
  container.innerHTML = natives.map(t => `
    <div class="tool-card tool-card-native">
      <span class="tool-card-icon">${t.icon || '🔧'}</span>
      <div class="tool-card-info">
        <span class="tool-card-name">${escHtml(t.label || t.name)}</span>
        <span class="tool-card-desc">${escHtml(t.description)}</span>
      </div>
      <span class="tool-card-badge tool-badge-native">${tConfig('badgeNative')}</span>
    </div>
  `).join('');
}

// ── Affichage des outils custom ──
function renderCustomToolsList() {
  const container = document.getElementById('custom-tools-list');
  if (!container) return;
  if (_customTools.length === 0) {
    container.innerHTML = `<div class="field-hint" style="padding:8px 0">${tConfig('noCustomTools')}</div>`;
    return;
  }
  container.innerHTML = _customTools.map((t, i) => `
    <div class="tool-card">
      <span class="tool-card-icon">${t.icon || '🔧'}</span>
      <div class="tool-card-info">
        <span class="tool-card-name">${escHtml(t.label || t.name)}</span>
        <code class="tool-card-id">${escHtml(t.name)}</code>
        <span class="tool-card-desc">${escHtml(t.description)}</span>
      </div>
      <div class="tool-card-actions">
        <button class="btn btn-ghost btn-xs" data-tool-edit="${i}">✏️</button>
        <button class="btn btn-danger btn-xs" data-tool-del="${i}">🗑</button>
      </div>
    </div>
  `).join('');

  container.querySelectorAll('[data-tool-edit]').forEach(btn => {
    btn.addEventListener('click', () => openToolModal(parseInt(btn.dataset.toolEdit)));
  });
  container.querySelectorAll('[data-tool-del]').forEach(btn => {
    btn.addEventListener('click', () => deleteCustomTool(parseInt(btn.dataset.toolDel)));
  });
}

// ── Affichage des outils distants ──
function renderRemoteToolsList(tools, cachedAt) {
  const container = document.getElementById('remote-tools-list');
  const status    = document.getElementById('remote-tools-status');
  if (!container) return;

  if (tools.length === 0) {
    container.innerHTML = '';
    return;
  }
  if (status && cachedAt) {
    const d = new Date(cachedAt);
    status.textContent = `✅ ${tools.length} ${tConfig('remoteToolsTitle').replace(/[^\w\s]/g,'')} — ${d.toLocaleDateString()} ${d.toLocaleTimeString()}`;
  }
  container.innerHTML = tools.map(t => `
    <div class="tool-card tool-card-remote">
      <span class="tool-card-icon">${t.icon || '🌐'}</span>
      <div class="tool-card-info">
        <span class="tool-card-name">${escHtml(t.label || t.name)}</span>
        <code class="tool-card-id">${escHtml(t.name)}</code>
        <span class="tool-card-desc">${escHtml(t.description)}</span>
      </div>
      <span class="tool-card-badge tool-badge-remote">${tConfig('badgeRemote')}</span>
    </div>
  `).join('');
}

// ── Charger outils distants depuis l'UI ──
async function loadRemoteToolsFromUI() {
  const urlInput = document.getElementById('remote-tools-url');
  const status   = document.getElementById('remote-tools-status');
  const url = urlInput?.value?.trim();
  if (!url) { if (status) status.textContent = tConfig('remoteToolsUrlRequired'); return; }

  if (status) status.textContent = tConfig('remoteToolsLoading');

  const result = await new Promise(r =>
    chrome.runtime.sendMessage({ type: 'LOAD_REMOTE_TOOLS', url }, r)
  );

  if (result?.error) {
    if (status) status.textContent = `${tConfig('remoteToolsError')} ${result.error}`;
    return;
  }

  renderRemoteToolsList(result.tools, Date.now());
  markUnsaved();
}

// ── Modal outil ──
function openToolModal(idx) {
  _editingToolIdx = idx;
  const modal = document.getElementById('tool-modal');
  const title = document.getElementById('tool-modal-title');
  if (!modal) return;

  if (idx === -1) {
    // Nouveau
    title.textContent = tConfig('newToolTitle');
    document.getElementById('tool-name').value      = '';
    document.getElementById('tool-icon').value      = '🔧';
    document.getElementById('tool-label').value     = '';
    document.getElementById('tool-desc').value      = '';
    document.getElementById('tool-schema').value    = JSON.stringify({ type:'object', properties:{}, required:[] }, null, 2);
    document.getElementById('tool-executor').value  = '';
    document.getElementById('tool-inject-script').value = '';
    document.getElementById('tool-name').disabled   = false;
  } else {
    // Édition
    const t = _customTools[idx];
    title.textContent = `✏️ ${tConfig('editToolTitle')} — ${t.label || t.name}`;
    document.getElementById('tool-name').value      = t.name;
    document.getElementById('tool-icon').value      = t.icon || '🔧';
    document.getElementById('tool-label').value     = t.label || '';
    document.getElementById('tool-desc').value      = t.description || '';
    document.getElementById('tool-schema').value    = JSON.stringify(t.input_schema || {}, null, 2);
    document.getElementById('tool-executor').value  = t.executor || '';
    document.getElementById('tool-inject-script').value = t.injectScript || '';
    document.getElementById('tool-name').disabled   = true; // identifiant immuable
  }

  const injectField = document.getElementById('tool-inject-field');
  if (injectField) injectField.style.display = document.getElementById('tool-executor').value === 'inject' ? 'block' : 'none';

  modal.style.display = 'flex';
}

function closeToolModal() {
  const modal = document.getElementById('tool-modal');
  if (modal) modal.style.display = 'none';
}

function saveToolFromModal() {
  const name     = document.getElementById('tool-name').value.trim();
  const icon     = document.getElementById('tool-icon').value.trim() || '🔧';
  const label    = document.getElementById('tool-label').value.trim();
  const desc     = document.getElementById('tool-desc').value.trim();
  const schemaRaw= document.getElementById('tool-schema').value.trim();
  const executor = document.getElementById('tool-executor').value || null;
  const inject   = document.getElementById('tool-inject-script').value.trim();

  if (!name || !desc || !schemaRaw) {
    alert(tConfig('toolRequiredFields'));
    return;
  }
  if (!/^[a-z0-9_]+$/.test(name)) {
    alert(tConfig('toolIdFormat'));
    return;
  }

  let schema;
  try { schema = JSON.parse(schemaRaw); }
  catch(e) { alert(tConfig('toolSchemaInvalid') + ' ' + e.message); return; }

  const tool = {
    name, icon, label: label || name, description: desc,
    category: 'custom', source: 'user',
    input_schema: schema,
    executor: executor === 'inject' ? null : (executor || null),
    injectScript: executor === 'inject' ? inject : undefined,
  };

  if (_editingToolIdx === -1) {
    // Vérifier unicité
    if (_customTools.find(t => t.name === name)) {
      alert(tConfig('toolIdDuplicate'));
      return;
    }
    _customTools.push(tool);
  } else {
    _customTools[_editingToolIdx] = tool;
  }

  chrome.storage.local.set({ customTools: _customTools }, () => {
    renderCustomToolsList();
    closeToolModal();
    markUnsaved();
  });
}

function deleteCustomTool(idx) {
  if (!confirm(tConfig('toolDeleteConfirm'))) return;
  _customTools.splice(idx, 1);
  chrome.storage.local.set({ customTools: _customTools }, () => renderCustomToolsList());
  markUnsaved();
}
