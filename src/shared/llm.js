// ═══════════════════════════════════════════════
//  BrowserMind — Shared LLM logic (pure functions)
//  Wire-format conversion between the Anthropic
//  Messages API and OpenAI Chat Completions,
//  history management and prompt heuristics.
//  No DOM, no chrome.* — unit-testable and usable
//  from both the side panel and the service worker.
// ═══════════════════════════════════════════════

// ─── Model tier heuristic (drives best-practices injection) ───
export function getModelTier(modelId) {
  if (!modelId) return 'low';
  const m = modelId.toLowerCase();
  if (m.includes('opus') || m.includes('sonnet') || m.includes('fable') ||
      m.includes('4o') || m.includes('gpt-4-turbo') ||
      m.includes('gemini-2.5') || m.includes('grok-3')) return 'high';
  if (m.includes('haiku') || m.includes('4o-mini') || m.includes('mistral-large') || m.includes('command-r-plus')) return 'medium';
  return 'low';
}

export const BEST_PRACTICES = {
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

// ─── Tool definition converters ───
// Tools are stored in Anthropic shape ({name, description, input_schema}).
export function toAnthropicTools(tools) {
  return tools.map(t => ({ name: t.name, description: t.description, input_schema: t.input_schema }));
}

export function toOpenAITools(tools) {
  return toAnthropicTools(tools).map(t => ({
    type: 'function',
    function: { name: t.name, description: t.description, parameters: t.input_schema },
  }));
}

// ─── Response normalizer ───
// Converts an OpenAI chat completion into Anthropic-style content blocks
// ({type:'text'} / {type:'tool_use'}) so the agent loop has a single shape.
export function normalizeOAI(response) {
  const blocks = [];
  const msg = response?.choices?.[0]?.message;
  if (!msg) return blocks;
  if (msg.content) blocks.push({ type: 'text', text: msg.content });
  if (msg.tool_calls) {
    for (const tc of msg.tool_calls) {
      let input = {};
      try { input = JSON.parse(tc.function.arguments); } catch {}
      blocks.push({ type: 'tool_use', id: tc.id, name: tc.function.name, input });
    }
  }
  return blocks;
}

// ─── History message builders ───
// OpenAI: assistant message must carry tool_calls so that tool_call_id in
// the results matches; results are individual {role:'tool'} messages.
// Anthropic: assistant message carries the raw blocks; all tool_results are
// grouped into a single {role:'user'} message (pushing them individually 400s).
export function buildAssistantMessage(isOAI, blocks, textContent, toolBlocks) {
  if (isOAI) {
    const msg = { role: 'assistant', content: textContent || null };
    if (toolBlocks.length > 0) {
      msg.tool_calls = toolBlocks.map(tb => ({
        id: tb.id || ('tool_' + Date.now() + '_' + tb.name),
        type: 'function',
        function: { name: tb.name, arguments: JSON.stringify(tb.input) },
      }));
    }
    return msg;
  }
  return blocks.length > 0 ? { role: 'assistant', content: blocks } : null;
}

export function buildToolResult(isOAI, toolId, result) {
  return isOAI
    ? { role: 'tool', tool_call_id: toolId, content: JSON.stringify(result) }
    : { type: 'tool_result', tool_use_id: toolId, content: JSON.stringify(result) };
}

export function appendToolResults(history, isOAI, toolResults) {
  if (toolResults.length === 0) return;
  if (isOAI) {
    toolResults.forEach(tr => history.push(tr));
  } else {
    history.push({ role: 'user', content: toolResults });
  }
}

// ─── History trimmer ───
// Keeps the most recent messages within ~maxTokens (4 chars ≈ 1 token).
export function trimHistory(history, maxTokens) {
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

// ─── System prompt builder ───
export function buildSystemPrompt({ userSystemPrompt, modeExtra, pageContext, memory, agentLang, model, bestPractices }) {
  const memCtx = memory && memory.length > 0
    ? '\n\nMÉMOIRE:\n' + memory.map(m => `- ${m.key}: ${m.value}`).join('\n')
    : '';

  const langMap = { fr: 'français', en: 'English', de: 'Deutsch', es: 'Español', it: 'Italiano', pt: 'Português' };
  const lang = langMap[agentLang] || 'français';

  const userPrompt = userSystemPrompt ? userSystemPrompt + '\n\n' : '';
  const tier = getModelTier(model);
  const bpSetting = bestPractices || 'auto';
  let bp = '';
  if (bpSetting === 'always' || (bpSetting === 'auto' && tier !== 'high')) {
    bp = tier === 'low' ? BEST_PRACTICES.full : BEST_PRACTICES.light;
  }

  const extra = modeExtra ? '\n\n' + modeExtra : '';

  return userPrompt + `Tu es BrowserMind, un agent de navigation web intelligent.${extra}\n\nCONTEXTE PAGE: ${pageContext}${memCtx}\n\nDIRECTIVES:\n- Utilise les outils pour accomplir la tâche\n- Explique brièvement chaque étape\n- Si une action échoue, essaie une alternative\n- Pour exporter des données: utilise generate_document (formats: csv, html, json, md, txt)\n- Donne TOUJOURS un nom de fichier descriptif et explicite au paramètre "filename" (ex: "contacts-linkedin-2024.csv", "rapport-amazon-prix.html"), jamais "export" générique\n- Pour mémoriser: commence par [MÉMORISE: clé=valeur]\n- NAVIGATION: Évite de quitter la page courante sauf si c'est strictement nécessaire. Préfère web_search pour les informations externes, ou new_tab pour ouvrir un autre site sans quitter la page. N'utilise navigate (qui change la page courante) que si la tâche l'exige explicitement.\n- Réponds TOUJOURS en ${lang}${bp}`;
}

// ─── Memory extraction ───
// Returns [{key, value}] for every [MÉMORISE: clé=valeur] tag in the text.
export function extractMemoryTags(text) {
  const re = /\[MÉMORISE:\s*([^=\]]+)=([^\]]+)\]/gi;
  const found = [];
  let m;
  while ((m = re.exec(text)) !== null) found.push({ key: m[1].trim(), value: m[2].trim() });
  return found;
}
