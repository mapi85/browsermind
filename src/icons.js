const SVG = (path, size = 16) =>
  `<svg xmlns="http://www.w3.org/2000/svg" width="${size}" height="${size}" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">${path}</svg>`;

const ICONS = {
  brain: () => SVG('<path d="M12 5a3 3 0 1 0-5.997.125 4 4 0 0 0-2.526 5.77 4 4 0 0 0 .556 6.588A4 4 0 1 0 12 18Z"/><path d="M12 5a3 3 0 1 1 5.997.125 4 4 0 0 1 2.526 5.77 4 4 0 0 1-.556 6.588A4 4 0 1 1 12 18Z"/><path d="M15 13a4.5 4.5 0 0 1-3-4 4.5 4.5 0 0 1-3 4"/><path d="M17.599 6.5a3 3 0 0 0 .399-1.375"/><path d="M6.003 5.125A3 3 0 0 0 6.401 6.5"/><path d="M3.477 10.896a4 4 0 0 1 .585-.396"/><path d="M19.938 10.5a4 4 0 0 1 .585.396"/><path d="M6 18a4 4 0 0 1-1.967-.516"/><path d="M19.967 17.484A4 4 0 0 1 18 18"/>'),

  bmLogo: () => SVG('<polygon points="64,4 116,34 116,94 64,124 12,94 12,34" fill="#5b4ed8"/><path d="M40 64 C40 50 50 40 64 40 C78 40 88 50 88 64" stroke="#fff" stroke-width="4" fill="none" stroke-linecap="round"/><path d="M40 64 C40 78 50 88 64 88 C78 88 88 78 88 64" stroke="#fff" stroke-width="4" fill="none" stroke-linecap="round"/><line x1="64" y1="44" x2="64" y2="84" stroke="#fff" stroke-width="3" stroke-linecap="round"/><path d="M90 90 L104 104 M104 104 L90 104 M104 104 L104 90" stroke="#fff" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>'),

  sun: () => SVG('<circle cx="12" cy="12" r="4"/><path d="M12 2v2"/><path d="M12 20v2"/><path d="m4.93 4.93 1.41 1.41"/><path d="m17.66 17.66 1.41 1.41"/><path d="M2 12h2"/><path d="M20 12h2"/><path d="m6.34 17.66-1.41 1.41"/><path d="m19.07 4.93-1.41 1.41"/>'),

  moon: () => SVG('<path d="M12 3a6 6 0 0 0 9 9 9 9 0 1 1-9-9Z"/>'),

  bug: () => SVG('<path d="m8 2 1.88 1.88"/><path d="M14.12 3.88 16 2"/><path d="M9 7.13v-1a3.003 3.003 0 1 1 6 0v1"/><path d="M12 20c-3.3 0-6-2.7-6-6v-3a4 4 0 0 1 4-4h4a4 4 0 0 1 4 4v3c0 3.3-2.7 6-6 6"/><path d="M12 20v-9"/><path d="M6.53 9C4.6 8.8 3 7.1 3 5"/><path d="M6 13H2"/><path d="M3 21c0-2.1 1.7-3.9 3.8-4"/><path d="M20.97 5c0 2.1-1.6 3.8-3.5 4"/><path d="M22 13h-4"/><path d="M17.2 17c2.1.1 3.8 1.9 3.8 4"/>'),

  trash: () => SVG('<path d="M3 6h18"/><path d="M19 6v14c0 1-1 2-2 2H7c-1 0-2-1-2-2V6"/><path d="M8 6V4c0-1 1-2 2-2h4c1 0 2 1 2 2v2"/><line x1="10" x2="10" y1="11" y2="17"/><line x1="14" x2="14" y1="11" y2="17"/>'),

  settings: () => SVG('<path d="M12.22 2h-.44a2 2 0 0 0-2 2v.18a2 2 0 0 1-1 1.73l-.43.25a2 2 0 0 1-2 0l-.15-.08a2 2 0 0 0-2.73.73l-.22.38a2 2 0 0 0 .73 2.73l.15.1a2 2 0 0 1 1 1.72v.51a2 2 0 0 1-1 1.74l-.15.09a2 2 0 0 0-.73 2.73l.22.38a2 2 0 0 0 2.73.73l.15-.08a2 2 0 0 1 2 0l.43.25a2 2 0 0 1 1 1.73V20a2 2 0 0 0 2 2h.44a2 2 0 0 0 2-2v-.18a2 2 0 0 1 1-1.73l.43-.25a2 2 0 0 1 2 0l.15.08a2 2 0 0 0 2.73-.73l.22-.39a2 2 0 0 0-.73-2.73l-.15-.08a2 2 0 0 1-1-1.74v-.5a2 2 0 0 1 1-1.74l.15-.09a2 2 0 0 0 .73-2.73l-.22-.38a2 2 0 0 0-2.73-.73l-.15.08a2 2 0 0 1-2 0l-.43-.25a2 2 0 0 1-1-1.73V4a2 2 0 0 0-2-2z"/><circle cx="12" cy="12" r="3"/>'),

  send: () => SVG('<path d="M14.536 21.686a.5.5 0 0 0 .937-.024l6.5-19a.496.496 0 0 0-.635-.635l-19 6.5a.5.5 0 0 0-.024.937l7.93 3.18a2 2 0 0 1 1.112 1.11z"/><path d="m21.854 2.147-10.94 10.939"/>'),

  stop: () => SVG('<rect x="3" y="3" width="18" height="18" rx="2"/>'),

  user: () => SVG('<path d="M19 21v-2a4 4 0 0 0-4-4H9a4 4 0 0 0-4 4v2"/><circle cx="12" cy="7" r="4"/>'),

  agent: () => SVG('<path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z"/>'),

  zap: () => SVG('<path d="M4 14a1 1 0 0 1-.78-1.63l9.9-10.2a.5.5 0 0 1 .86.46l-1.92 6.02A1 1 0 0 0 13 10h7a1 1 0 0 1 .78 1.63l-9.9 10.2a.5.5 0 0 1-.86-.46l1.92-6.02A1 1 0 0 0 11 14z"/>'),

  alertTriangle: () => SVG('<path d="m21.73 18-8-14a2 2 0 0 0-3.48 0l-8 14A2 2 0 0 0 4 21h16a2 2 0 0 0 1.73-3"/><path d="M12 9v4"/><path d="M12 17h.01"/>'),

  messageCircle: () => SVG('<path d="M7.9 20A9 9 0 1 0 4 16.1L2 22Z"/>'),

  fileDown: () => SVG('<path d="M15 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V7Z"/><path d="M14 2v4a2 2 0 0 0 2 2h4"/><path d="M12 18v-6"/><path d="m9 15 3 3 3-3"/>'),

  pointer: () => SVG('<path d="m4 4 7.07 17 2.51-7.39L21 11.07z"/>'),

  keyboard: () => SVG('<path d="M10 8h.01"/><path d="M12 12h.01"/><path d="M14 8h.01"/><path d="M16 12h.01"/><path d="M18 8h.01"/><path d="M6 8h.01"/><path d="M8 12h.01"/><path d="M4 12h.01"/><path d="M4 16h.01"/><path d="M8 16h.01"/><path d="M12 16h.01"/><path d="M16 16h.01"/><path d="M20 16h.01"/><rect width="20" height="14" x="2" y="4" rx="2"/>'),

  arrowsUpDown: () => SVG('<path d="m7 15 5 5 5-5"/><path d="m7 9 5-5 5 5"/>'),

  externalLink: () => SVG('<path d="M15 3h6v6"/><path d="M10 14 21 3"/><path d="M18 13v6a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h6"/>'),

  fileText: () => SVG('<path d="M15 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V7Z"/><path d="M14 2v4a2 2 0 0 0 2 2h4"/><path d="M10 9H8"/><path d="M16 13H8"/><path d="M16 17H8"/>'),

  edit: () => SVG('<path d="M17 3a2.85 2.83 0 1 1 4 4L7.5 20.5 2 22l1.5-5.5Z"/><path d="m15 5 4 4"/>'),

  table: () => SVG('<path d="M12 3v18"/><rect width="18" height="18" x="3" y="3" rx="2"/><path d="M3 9h18"/><path d="M3 15h18"/>'),

  download: () => SVG('<path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/><path d="M7 10l5 5 5-5"/><path d="M12 15V3"/>'),

  clock: () => SVG('<circle cx="12" cy="12" r="10"/><polyline points="12 6 12 12 16 14"/>'),

  camera: () => SVG('<path d="M14.5 4h-5L7 7H4a2 2 0 0 0-2 2v9a2 2 0 0 0 2 2h16a2 2 0 0 0 2-2V9a2 2 0 0 0-2-2h-3l-2.5-3z"/><circle cx="12" cy="13" r="3"/>'),

  fileOutput: () => SVG('<path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8Z"/><path d="M14 2v6h6"/><path d="M10 14v4"/><path d="m8 16 2 2 2-2"/>'),

  link: () => SVG('<path d="M10 13a5 5 0 0 0 7.54.54l3-3a5 5 0 0 0-7.07-7.07l-1.72 1.71"/><path d="M14 11a5 5 0 0 0-7.54-.54l-3 3a5 5 0 0 0 7.07 7.07l1.71-1.71"/>'),

  code: () => SVG('<polyline points="16 18 22 12 16 6"/><polyline points="8 6 2 12 8 18"/>'),

  braces: () => SVG('<path d="M8 3H7a2 2 0 0 0-2 2v5a2 2 0 0 1-2 2 2 2 0 0 1 2 2v5c0 1.1.9 2 2 2h1"/><path d="M16 21h1a2 2 0 0 0 2-2v-5c0-1.1.9-2 2-2a2 2 0 0 1-2-2V5a2 2 0 0 0-2-2h-1"/>'),

  image: () => SVG('<rect width="18" height="18" x="3" y="3" rx="2" ry="2"/><circle cx="9" cy="9" r="2"/><path d="m21 15-3.086-3.086a2 2 0 0 0-2.828 0L6 21"/>'),

  file: () => SVG('<path d="M15 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V7Z"/><path d="M14 2v4a2 2 0 0 0 2 2h4"/>'),

  search: () => SVG('<circle cx="11" cy="11" r="8"/><path d="m21 21-4.3-4.3"/>'),

  plus: () => SVG('<path d="M5 12h14"/><path d="M12 5v14"/>'),

  x: () => SVG('<path d="M18 6 6 18"/><path d="m6 6 12 12"/>'),

  copy: () => SVG('<rect width="14" height="14" x="8" y="8" rx="2" ry="2"/><path d="M4 16c-1.1 0-2-.9-2-2V4c0-1.1.9-2 2-2h10c1.1 0 2 .9 2 2"/>'),

  save: () => SVG('<path d="M15.2 3a2 2 0 0 1 1.4.6l3.8 3.8a2 2 0 0 1 .6 1.4V19a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2z"/><path d="M17 21v-7a1 1 0 0 0-1-1H8a1 1 0 0 0-1 1v7"/><path d="M7 3v4a1 1 0 0 0 1 1h7"/>'),

  lightbulb: () => SVG('<path d="M15 14c.2-1 .7-1.7 1.5-2.5 1-.9 1.5-2.2 1.5-3.5A6 6 0 0 0 6 8c0 1 .2 2.2 1.5 3.5.7.7 1.3 1.5 1.5 2.5"/><path d="M9 18h6"/><path d="M10 22h4"/>'),

  check: () => SVG('<path d="M20 6 9 17l-5-5"/>'),

  chevronDown: () => SVG('<path d="m6 9 6 6 6-6"/>'),

  globe: () => SVG('<circle cx="12" cy="12" r="10"/><path d="M12 2a14.5 14.5 0 0 0 0 20 14.5 14.5 0 0 0 0-20"/><path d="M2 12h20"/>'),

  plugin: () => SVG('<path d="M12 2v6l3-3"/><path d="M12 2v6l-3-3"/><ellipse cx="12" cy="14.5" rx="5" ry="3.5"/><line x1="12" x2="12" y1="10" y2="18"/><path d="M2 18a2 2 0 0 0 2 2h16a2 2 0 0 0 2-2"/><path d="M2 18V8a2 2 0 0 1 2-2h16a2 2 0 0 1 2 2v10"/>'),

  sparkles: () => SVG('<path d="m12 3-1.912 5.813a2 2 0 0 1-1.275 1.275L3 12l5.813 1.912a2 2 0 0 1 1.275 1.275L12 21l1.912-5.813a2 2 0 0 1 1.275-1.275L21 12l-5.813-1.912a2 2 0 0 1-1.275-1.275L12 3Z"/><path d="M5 3v4"/><path d="M19 17v4"/><path d="M3 5h4"/><path d="M17 19h4"/>'),

  refreshCw: () => SVG('<path d="M3 12a9 9 0 0 1 9-9 9.75 9.75 0 0 1 6.74 2.74L21 8"/><path d="M21 3v5h-5"/><path d="M21 12a9 9 0 0 1-9 9 9.75 9.75 0 0 1-6.74-2.74L3 16"/><path d="M8 16H3v5"/>'),

  circleDot: (size = 10) => SVG(`<circle cx="12" cy="12" r="10"/><circle cx="12" cy="12" r="1"/>`, size),

  loader: (size = 16) => `<svg xmlns="http://www.w3.org/2000/svg" width="${size}" height="${size}" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="spin"><path d="M21 12a9 9 0 1 1-6.219-8.56"/></svg>`,

  arrowUpRight: () => SVG('<path d="M7 7h10v10"/><path d="M7 17 17 7"/>'),
};

const ICO = (name, size) => ICONS[name] ? ICONS[name](size) : '';

const TOOL_ICONS = {
  click: 'pointer',
  type_text: 'keyboard',
  scroll: 'arrowsUpDown',
  navigate: 'externalLink',
  get_page_content: 'fileText',
  fill_form: 'edit',
  extract_data: 'table',
  download_file: 'download',
  wait: 'clock',
  take_screenshot: 'camera',
  generate_document: 'fileOutput',
};

const ROLE_ICONS = {
  user: 'user',
  assistant: 'sparkles',
  action: 'zap',
  error: 'alertTriangle',
  system: 'messageCircle',
  export: 'fileDown',
};

const EXPORT_ICONS = {
  csv: 'table',
  html: 'code',
  json: 'braces',
  md: 'fileText',
  txt: 'file',
  png: 'image',
};

const PROVIDER_ICONS = {
  anthropic: '🟣',
  openai: '🤖',
  xai: '⚡',
  mistral: '🌊',
  deepseek: '🔍',
  gemini: '🔷',
  cohere: '🧩',
  openrouter: '🔀',
  zai: '🌐',
  custom_openai: '🔧',
  custom_anthropic: '🔧',
};

function toolIconSvg(tool) {
  const name = TOOL_ICONS[tool] || 'zap';
  return ICO(name, 14);
}

function roleIconSvg(role) {
  const name = ROLE_ICONS[role] || 'messageCircle';
  return ICO(name, 13);
}

function exportIconSvg(format) {
  const name = EXPORT_ICONS[format] || 'fileDown';
  return ICO(name, 20);
}

function stepStatusIcon(status) {
  if (status === 'success' || status === '✅') return ICO('check', 13);
  if (status === 'error' || status === '❌') return ICO('alertTriangle', 13);
  return ICO('clock', 13);
}
