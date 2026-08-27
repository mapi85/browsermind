// ═══════════════════════════════════════════════
//  BrowserMind — Tool registry
//
//  One fixed set of native tools. There is no custom-tool builder and no
//  remote registry: a tool is code in background.js, reviewed and shipped
//  with the extension, never configuration fetched at runtime.
//
//  Everything in this file is read by the model, so it is written in
//  English — model-facing text is not localized (better tool-calling
//  accuracy, shorter prompts). User-facing labels live in the locale files.
// ═══════════════════════════════════════════════

// ─── ELEMENT ADDRESSING ─────────────────────────
// read_page hands the model a numbered list of the interactive elements on
// the page. Actions then address an element by that number instead of asking
// the model to invent a CSS selector it cannot verify.
const elementRef = {
  element: {
    type: 'number',
    description: 'Index of the element, as numbered by read_page. Preferred: it is exact.',
  },
  selector: {
    type: 'string',
    description: 'CSS selector. Only use when no index applies (e.g. an element you know by id).',
  },
};

export const NATIVE_TOOLS = [
  {
    name: 'read_page',
    icon: 'fileText', labelKey: 'toolReadPage',
    description:
      'Read the current page: title, URL, visible text, and a numbered list of every interactive '
      + 'element (links, buttons, inputs, selects). Call this before acting on a page you have not '
      + 'read yet, and again after the page changes. The numbers it returns are what click, '
      + 'type_text and fill_form expect.',
    input_schema: {
      type: 'object',
      properties: {
        include_text: {
          type: 'boolean',
          description: 'Include the page text. Default true. Set false when you only need the element list.',
        },
      },
    },
  },
  {
    name: 'click',
    icon: 'pointer', labelKey: 'toolClick',
    description: 'Click an element. Address it by the index read_page gave it.',
    input_schema: {
      type: 'object',
      properties: { ...elementRef },
    },
  },
  {
    name: 'type_text',
    icon: 'keyboard', labelKey: 'toolTypeText',
    description: 'Type text into an input, textarea or contenteditable field.',
    input_schema: {
      type: 'object',
      properties: {
        ...elementRef,
        text: { type: 'string', description: 'Text to type.' },
        clear_first: { type: 'boolean', description: 'Clear the field first. Default true.' },
        submit: { type: 'boolean', description: 'Press Enter afterwards. Default false.' },
      },
      required: ['text'],
    },
  },
  {
    name: 'fill_form',
    icon: 'edit', labelKey: 'toolFillForm',
    description: 'Fill several form fields in one call. Faster and more reliable than repeated type_text.',
    input_schema: {
      type: 'object',
      properties: {
        fields: {
          type: 'array',
          description: 'One entry per field.',
          items: {
            type: 'object',
            properties: {
              ...elementRef,
              value: { type: 'string', description: 'Value to set. For a checkbox use "true" or "false".' },
            },
            required: ['value'],
          },
        },
        submit: { type: 'boolean', description: 'Submit the form afterwards. Default false.' },
      },
      required: ['fields'],
    },
  },
  {
    name: 'scroll',
    icon: 'arrowsUpDown', labelKey: 'toolScroll',
    description: 'Scroll the page. Use it to reach content below the fold before reading it.',
    input_schema: {
      type: 'object',
      properties: {
        direction: { type: 'string', enum: ['up', 'down', 'top', 'bottom'] },
        amount: { type: 'number', description: 'Pixels, for up/down. Default one viewport.' },
      },
      required: ['direction'],
    },
  },
  {
    name: 'navigate',
    icon: 'globe', labelKey: 'toolNavigate',
    description:
      'Navigate the current tab to a URL. This leaves the page the user is on, so prefer new_tab '
      + 'when you only need to look something up. Cross-domain navigation asks the user first.',
    input_schema: {
      type: 'object',
      properties: { url: { type: 'string' } },
      required: ['url'],
    },
  },
  {
    name: 'new_tab',
    icon: 'externalLink', labelKey: 'toolNewTab',
    description:
      'Open a URL in another tab without leaving the current page. Use active:false to look '
      + 'something up in the background.',
    input_schema: {
      type: 'object',
      properties: {
        url: { type: 'string' },
        active: { type: 'boolean', description: 'Bring the tab to the front. Default false.' },
      },
      required: ['url'],
    },
  },
  {
    name: 'extract_data',
    icon: 'table', labelKey: 'toolExtractData',
    description: 'Extract structured data from the page: tables, lists, links or images.',
    input_schema: {
      type: 'object',
      properties: {
        data_type: { type: 'string', enum: ['table', 'list', 'links', 'images', 'text'] },
        selector: { type: 'string', description: 'Limit extraction to this container. Optional.' },
      },
      required: ['data_type'],
    },
  },
  {
    name: 'wait',
    icon: 'clock', labelKey: 'toolWait',
    description:
      'Wait for an element to appear, or for a fixed delay (10s max). Use after an action that loads content.',
    input_schema: {
      type: 'object',
      properties: {
        selector: { type: 'string', description: 'CSS selector to wait for.' },
        milliseconds: { type: 'number', description: 'Fixed delay instead, capped at 10000.' },
      },
    },
  },
  {
    name: 'take_screenshot',
    icon: 'camera', labelKey: 'toolScreenshot',
    description:
      'Capture the visible part of the page as an image and look at it. Use it when the layout '
      + 'matters, when text is rendered in a canvas or an image, or when reading the page was not '
      + 'enough. Only works while this tab is the one on screen; if the user has switched away, '
      + 'it fails and read_page is the alternative.',
    input_schema: {
      type: 'object',
      properties: {
        save: { type: 'boolean', description: 'Also download the capture as a PNG. Default false.' },
      },
    },
  },
  {
    name: 'generate_document',
    icon: 'fileDown', labelKey: 'toolGenerateDocument',
    description:
      'Create a file and download it. Always give a descriptive filename '
      + '(for example "linkedin-contacts.csv"), never "export".',
    input_schema: {
      type: 'object',
      properties: {
        format: { type: 'string', enum: ['csv', 'html', 'json', 'md', 'txt'] },
        content: { type: 'string', description: 'Full file contents. For CSV, first line = headers.' },
        filename: { type: 'string', description: 'Descriptive name, with extension. A timestamp is appended.' },
      },
      required: ['format', 'content', 'filename'],
    },
  },
  {
    name: 'download_file',
    icon: 'download', labelKey: 'toolDownloadFile',
    description: 'Download a file from a URL found on the page.',
    input_schema: {
      type: 'object',
      properties: { url: { type: 'string' }, filename: { type: 'string' } },
      required: ['url'],
    },
  },
  {
    name: 'web_search',
    icon: 'search', labelKey: 'toolWebSearch',
    description:
      'Search the web and get back result titles, URLs and snippets. Use it to find pages, then '
      + 'new_tab + read_page to actually read the ones that matter.',
    input_schema: {
      type: 'object',
      properties: {
        query: { type: 'string' },
        max_results: { type: 'number', description: 'Default 6, max 10.' },
      },
      required: ['query'],
    },
  },
  {
    name: 'api_call',
    icon: 'plugin', labelKey: 'toolApiCall',
    description:
      'Call a structured data API. "nominatim" geocodes an address or place name; "open_meteo" '
      + 'returns weather and forecasts for coordinates. Use these instead of browsing when you '
      + 'need exact values.',
    input_schema: {
      type: 'object',
      properties: {
        api: { type: 'string', enum: ['nominatim', 'open_meteo'] },
        endpoint: { type: 'string', description: 'Path, e.g. "/search" or "/forecast".' },
        params: { type: 'object', description: 'Query parameters.' },
      },
      required: ['api'],
    },
  },
];

/** Tool names that touch the page and must run one at a time. */
export const DOM_TOOLS = new Set([
  'read_page', 'click', 'type_text', 'fill_form', 'scroll', 'extract_data', 'take_screenshot',
]);

/** Tools whose result carries an image the model should see. */
export const VISION_TOOLS = new Set(['take_screenshot']);

// ─── REGISTRY ───────────────────────────────────
// Accessors rather than bare exports, so a per-user tool policy could be
// layered in later without touching every call site.

export function getAllTools() {
  return NATIVE_TOOLS;
}

export function getToolByName(name) {
  return NATIVE_TOOLS.find(t => t.name === name) || null;
}

export function isNativeTool(name) {
  return NATIVE_TOOLS.some(t => t.name === name);
}
