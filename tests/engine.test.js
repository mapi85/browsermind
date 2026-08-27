// Drives the real agent loop against a fake provider and a fake browser.
//
// The invariant these cover — every tool_use gets a matching tool_result —
// is the one that silently broke a whole session when it was violated: both
// wire formats answer 400 to a turn where an assistant tool call has no
// result, and the next request in that conversation fails the same way.
import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest';
import {
  initEngine, startTask, continueTask, stopTask, clearTask, getSession,
  respondNavConfirm, dropSession, retireSession, notifyTabNavigated, setSessionProvider,
} from '../src/background/engine.js';
import { LIMITS } from '../src/shared/settings.js';

let local;
let sessionStore;
let broadcasts;
let toolCalls;
let toolImpl;
let requests;
let responses;

const PROVIDER = {
  instanceId: 'a1',
  typeId: 'anthropic',
  name: 'Claude',
  key: 'sk-test',
  customUrl: '',
  models: [{ id: 'claude-sonnet-5' }],
  selectedModel: 'claude-sonnet-5',
};

function area(backing) {
  return {
    get: async (keys) => {
      const wanted = keys === null || keys === undefined
        ? Object.keys(backing)
        : (Array.isArray(keys) ? keys : [keys]);
      const out = {};
      for (const key of wanted) if (key in backing) out[key] = backing[key];
      return out;
    },
    set: async (items) => { Object.assign(backing, items); },
    remove: async (keys) => {
      for (const key of (Array.isArray(keys) ? keys : [keys])) delete backing[key];
    },
  };
}

/** A non-streaming JSON answer, which the loop handles as well as an SSE one. */
function reply(content) {
  return {
    ok: true,
    status: 200,
    headers: { get: () => 'application/json' },
    json: async () => ({ content }),
    text: async () => '',
  };
}

const textReply = (text) => reply([{ type: 'text', text }]);
const toolReply = (name, input, id = 'tool-1') =>
  reply([{ type: 'tool_use', id, name, input }]);

beforeEach(() => {
  local = { configuredProviders: [PROVIDER], currentProvider: 'a1', historyEnabled: false };
  sessionStore = {};
  broadcasts = [];
  toolCalls = [];
  requests = [];
  responses = [];
  toolImpl = async () => ({ success: true });

  globalThis.chrome = {
    storage: { local: area(local), session: area(sessionStore) },
  };

  vi.stubGlobal('fetch', async (url, init) => {
    requests.push({ url, body: JSON.parse(init.body) });
    const next = responses.shift();
    if (!next) throw new Error('no scripted response left');
    // A scripted entry may be a function, to model a slow provider. It gets
    // the request init so it can honour the abort signal.
    return typeof next === 'function' ? next(init) : next;
  });

  initEngine({
    executeTool: async (tool, input, tabId) => {
      toolCalls.push({ tool, input, tabId, atRequest: requests.length });
      return toolImpl(tool, input, tabId);
    },
    getTabUrl: () => 'https://example.com/start',
    acquireKeepAlive: async () => {},
    releaseKeepAlive: async () => {},
    // chrome.runtime.sendMessage structured-clones on the way out; cloning
    // here too keeps a captured broadcast a snapshot rather than a live
    // reference that later mutations would rewrite.
    broadcast: (message) => broadcasts.push(structuredClone(message)),
  });
});

/** Resolves once the session stops running. */
async function settled(tabId, timeoutMs = 2000) {
  const deadline = Date.now() + timeoutMs;
  for (;;) {
    const { session } = await getSession(tabId);
    if (session && !session.running) return session;
    if (Date.now() > deadline) throw new Error('task never finished');
    await new Promise(r => setTimeout(r, 5));
  }
}

const lastRequestMessages = () => requests.at(-1).body.messages;

// Tools the model asked for, as opposed to the page read done before it was
// ever consulted.
const agentCalls = () => toolCalls.filter(c => c.atRequest > 0);

describe('agent loop', () => {
  it('records the user turn and the assistant answer', async () => {
    responses = [textReply('Here is the summary.')];

    await startTask({ tabId: 1, prompt: 'Summarize', url: 'https://example.com', title: 'Example' });
    const session = await settled(1);

    expect(session.messages.map(m => m.role)).toEqual(['user', 'assistant']);
    expect(session.messages[1].text).toBe('Here is the summary.');
    expect(session.status.key).toBe('done');
  });

  it('tells the agent which tab it starts on', async () => {
    responses = [textReply('ok')];
    await startTask({ tabId: 2, prompt: 'Go', url: 'https://example.com/a', title: 'Doc' });
    await settled(2);

    expect(requests[0].body.messages[0].content)
      .toBe('[Current tab: Doc — https://example.com/a]\n\nGo');
  });

  // Every task used to open with the agent calling read_page and waiting a
  // whole round trip for the answer.
  it('hands the agent the page before the first request', async () => {
    responses = [textReply('It is a login form.')];
    toolImpl = async () => ({ title: 'Sign in', elements: '[0] <input email> "Email"' });

    await startTask({ tabId: 50, prompt: 'What is this page?', url: 'https://example.com', title: 'Sign in' });
    await settled(50);

    expect(toolCalls[0]).toMatchObject({ tool: 'read_page', atRequest: 0 });

    const opening = requests[0].body.messages[0].content;
    expect(opening).toContain('[0] <input email>');
    expect(opening).toContain('What is this page?');

    // One request, no tool call decided by the model: the question is answered
    // without a round trip spent asking for the page.
    expect(requests).toHaveLength(1);
    expect(agentCalls()).toHaveLength(0);
  });

  it('starts anyway when the page cannot be read', async () => {
    responses = [textReply('ok')];
    toolImpl = async () => { throw new Error('This page is protected by Chrome'); };

    await startTask({ tabId: 51, prompt: 'Go', url: 'chrome://extensions', title: 'Extensions' });
    const session = await settled(51);

    expect(requests).toHaveLength(1);
    expect(session.messages.some(m => m.role === 'error')).toBe(false);
  });

  it('runs a tool and feeds the result back', async () => {
    responses = [toolReply('read_page', {}), textReply('Done.')];
    toolImpl = async () => ({ title: 'Example', elements: '[0] <button> "Buy"' });

    await startTask({ tabId: 3, prompt: 'Read it', url: 'https://example.com', title: 'x' });
    await settled(3);

    expect(agentCalls()[0].tool).toBe('read_page');

    const results = lastRequestMessages().at(-1);
    expect(results.role).toBe('user');
    expect(results.content[0]).toMatchObject({ type: 'tool_result', tool_use_id: 'tool-1' });
    expect(results.content[0].content).toContain('Example');
  });

  it('answers a refused navigation with a tool_result instead of leaving it orphaned', async () => {
    responses = [toolReply('navigate', { url: 'https://elsewhere.test/page' }), textReply('Understood.')];

    // Refuse as soon as the engine asks.
    const answerNo = (message) => {
      const request = message.session?.messages?.find(m => m.role === 'navRequest');
      if (request) respondNavConfirm(request.requestId, false);
    };
    initEngine({ broadcast: (m) => { broadcasts.push(structuredClone(m)); answerNo(m); } });

    await startTask({ tabId: 4, prompt: 'Go elsewhere', url: 'https://example.com', title: 'x' });
    await settled(4);

    expect(agentCalls()).toHaveLength(0); // the navigation never ran

    const results = lastRequestMessages().at(-1);
    expect(results.content).toHaveLength(1);
    expect(results.content[0].tool_use_id).toBe('tool-1');
    expect(results.content[0].content).toContain('refused');
  });

  it('never leaves an assistant tool call unanswered in the history it sends', async () => {
    responses = [toolReply('read_page', {}), textReply('Done.')];

    await startTask({ tabId: 5, prompt: 'Read', url: 'https://example.com', title: 'x' });
    await settled(5);

    const messages = lastRequestMessages();
    const calls = new Set();
    const answers = new Set();

    for (const message of messages) {
      if (message.role === 'assistant' && Array.isArray(message.content)) {
        for (const block of message.content) if (block.type === 'tool_use') calls.add(block.id);
      }
      if (message.role === 'user' && Array.isArray(message.content)) {
        for (const block of message.content) if (block.type === 'tool_result') answers.add(block.tool_use_id);
      }
    }
    expect([...calls].every(id => answers.has(id))).toBe(true);
    expect(calls.size).toBeGreaterThan(0);
  });

  it('marks a tool failure without breaking the turn', async () => {
    responses = [toolReply('click', { element: 3 }), textReply('I could not click that.')];
    toolImpl = async () => { throw new Error('No element numbered 3'); };

    await startTask({ tabId: 6, prompt: 'Click', url: 'https://example.com', title: 'x' });
    const session = await settled(6);

    const card = session.messages.find(m => m.role === 'actions');
    expect(card.items[0].status).toBe('error');
    expect(lastRequestMessages().at(-1).content[0].content).toContain('No element numbered 3');
  });

  it('reports a rejected key as a typed error rather than a raw dump', async () => {
    responses = [{
      ok: false, status: 401,
      headers: { get: () => 'application/json' },
      text: async () => '{"error":{"message":"invalid x-api-key"}}',
    }];

    await startTask({ tabId: 7, prompt: 'Go', url: 'https://example.com', title: 'x' });
    const session = await settled(7);

    const error = session.messages.find(m => m.role === 'error');
    expect(error.key).toBe('badKey');
  });

  it('refuses to start without a configured provider', async () => {
    local.configuredProviders = [];
    local.currentProvider = '';

    const result = await startTask({ tabId: 8, prompt: 'Go', url: 'https://example.com', title: 'x' });
    expect(result.error).toBe('noProvider');
    expect(requests).toHaveLength(0);
  });

  it('refuses to start without a selected model', async () => {
    local.configuredProviders = [{ ...PROVIDER, selectedModel: '' }];

    const result = await startTask({ tabId: 9, prompt: 'Go', url: 'https://example.com', title: 'x' });
    expect(result.error).toBe('noModel');
  });

  it('pauses and offers to continue at the step limit', async () => {
    local.maxIterations = 2;
    responses = [toolReply('scroll', { direction: 'down' }, 't1'), toolReply('scroll', { direction: 'down' }, 't2')];

    await startTask({ tabId: 10, prompt: 'Keep scrolling', url: 'https://example.com', title: 'x' });
    const session = await settled(10);

    expect(session.awaitingContinue).toBe(true);
    expect(session.messages.at(-1)).toMatchObject({ role: 'notice', key: 'maxIterations', offerContinue: true });
  });

  it('retries once on an empty answer, then gives up', async () => {
    responses = [reply([]), reply([])];

    await startTask({ tabId: 11, prompt: 'Go', url: 'https://example.com', title: 'x' });
    const session = await settled(11);

    expect(requests).toHaveLength(2);
    expect(session.messages.at(-1)).toMatchObject({ role: 'error', key: 'emptyResponse' });
  });
});

describe('streaming', () => {
  /** A real SSE body, the shape Anthropic actually sends. */
  function sseReply(frames) {
    const bytes = new TextEncoder().encode(frames.map(f => `data: ${JSON.stringify(f)}\n\n`).join(''));
    let offset = 0;
    return {
      ok: true,
      status: 200,
      headers: { get: () => 'text/event-stream' },
      body: new ReadableStream({
        pull(controller) {
          if (offset >= bytes.length) { controller.close(); return; }
          controller.enqueue(bytes.slice(offset, offset + 16));
          offset += 16;
        },
      }),
    };
  }

  it('shows the answer as it arrives and finalizes it', async () => {
    responses = [sseReply([
      { type: 'content_block_start', index: 0, content_block: { type: 'text' } },
      { type: 'content_block_delta', index: 0, delta: { type: 'text_delta', text: 'Hello ' } },
      { type: 'content_block_delta', index: 0, delta: { type: 'text_delta', text: 'world' } },
      { type: 'content_block_stop', index: 0 },
      { type: 'message_delta', delta: { stop_reason: 'end_turn' } },
    ])];

    await startTask({ tabId: 30, prompt: 'Say hi', url: 'https://example.com', title: 'x' });
    const session = await settled(30);

    // The panel saw partial text before the response was complete.
    const partial = broadcasts
      .map(b => b.session?.messages?.find(m => m.role === 'assistant'))
      .filter(Boolean);
    expect(partial.some(m => m.streaming)).toBe(true);

    const answer = session.messages.find(m => m.role === 'assistant');
    expect(answer.text).toBe('Hello world');
    expect(answer.streaming).toBe(false);
  });

  it('assembles a streamed tool call and runs it', async () => {
    responses = [
      sseReply([
        { type: 'content_block_start', index: 0, content_block: { type: 'tool_use', id: 's1', name: 'scroll' } },
        { type: 'content_block_delta', index: 0, delta: { type: 'input_json_delta', partial_json: '{"direct' } },
        { type: 'content_block_delta', index: 0, delta: { type: 'input_json_delta', partial_json: 'ion":"down"}' } },
        { type: 'content_block_stop', index: 0 },
      ]),
      textReply('Scrolled.'),
    ];

    await startTask({ tabId: 31, prompt: 'Scroll', url: 'https://example.com', title: 'x' });
    await settled(31);

    expect(agentCalls()[0]).toMatchObject({ tool: 'scroll', input: { direction: 'down' } });
    expect(lastRequestMessages().at(-1).content[0].tool_use_id).toBe('s1');
  });

  it('keeps a memory tag out of what the user reads', async () => {
    local.memoryEnabled = true;
    responses = [sseReply([
      { type: 'content_block_start', index: 0, content_block: { type: 'text' } },
      { type: 'content_block_delta', index: 0, delta: { type: 'text_delta', text: 'Noted. [REMEMBER: city=Nantes]' } },
      { type: 'content_block_stop', index: 0 },
    ])];

    await startTask({ tabId: 32, prompt: 'I live in Nantes', url: 'https://example.com', title: 'x' });
    const session = await settled(32);

    expect(session.messages.find(m => m.role === 'assistant').text).toBe('Noted.');
    expect(local.persistentMemory).toEqual([
      { key: 'city', value: 'Nantes', timestamp: expect.any(Number) },
    ]);
  });
});

describe('slow and stalled providers', () => {
  // Timeouts are measured in minutes in production, which no test should wait
  // out. LIMITS is a plain object, so the same code path runs at test speed.
  const original = { ...LIMITS };
  afterEach(() => { Object.assign(LIMITS, original); });

  const frames = (list) => list.map(f => `data: ${JSON.stringify(f)}\n\n`);
  const helloFrames = frames([
    { type: 'content_block_start', index: 0, content_block: { type: 'text' } },
    { type: 'content_block_delta', index: 0, delta: { type: 'text_delta', text: 'a' } },
    { type: 'content_block_delta', index: 0, delta: { type: 'text_delta', text: 'b' } },
    { type: 'content_block_delta', index: 0, delta: { type: 'text_delta', text: 'c' } },
    { type: 'content_block_stop', index: 0 },
  ]);

  /** Emits each frame after `gapMs`, then hangs forever unless `end` is true. */
  const trickle = (list, gapMs, { end = true } = {}) => (init) => ({
    ok: true,
    status: 200,
    headers: { get: () => 'text/event-stream' },
    body: new ReadableStream({
      async pull(controller) {
        if (list.length === 0) {
          if (end) { controller.close(); return; }
          // Silence: only the abort signal ends this.
          await new Promise((_, reject) => {
            init.signal.addEventListener('abort', () =>
              reject(Object.assign(new Error('aborted'), { name: 'AbortError' })), { once: true });
          });
          return;
        }
        await new Promise(r => setTimeout(r, gapMs));
        controller.enqueue(new TextEncoder().encode(list.shift()));
      },
    }),
  });

  const late = (response, ms) => async () => {
    await new Promise(r => setTimeout(r, ms));
    return response;
  };

  it('tells the user a self-hosted model is loading rather than looking frozen', async () => {
    LIMITS.warmupHintMs = 40;
    local.configuredProviders = [{
      ...PROVIDER, typeId: 'custom_openai', customUrl: 'http://localhost:11434/v1',
      selectedModel: 'gemma:26b',
    }];
    responses = [late(textReply('ready'), 300)];

    await startTask({ tabId: 40, prompt: 'Hi', url: 'https://example.com', title: 'x' });
    await settled(40);

    const statuses = broadcasts.map(b => b.session?.status?.key);
    expect(statuses).toContain('loadingModel');
  });

  it('uses a neutral wait message for a hosted provider', async () => {
    LIMITS.warmupHintMs = 40;
    responses = [late(textReply('ready'), 300)];

    await startTask({ tabId: 41, prompt: 'Hi', url: 'https://example.com', title: 'x' });
    await settled(41);

    const statuses = broadcasts.map(b => b.session?.status?.key);
    expect(statuses).toContain('waitingModel');
    expect(statuses).not.toContain('loadingModel');
  });

  // The previous single deadline covered the whole request, so a slow model
  // streaming a long answer was cut off part way through.
  it('does not cut off a slow but active stream', async () => {
    LIMITS.stallTimeoutMs = 150;
    responses = [trickle([...helloFrames], 60)];

    await startTask({ tabId: 42, prompt: 'Write', url: 'https://example.com', title: 'x' });
    const session = await settled(42, 5000);

    // Five frames at 60ms is 300ms total — well past the stall budget.
    expect(session.messages.find(m => m.role === 'assistant')?.text).toBe('abc');
    expect(session.messages.some(m => m.role === 'error')).toBe(false);
  });

  it('gives up when a stream goes silent', async () => {
    LIMITS.stallTimeoutMs = 120;
    responses = [trickle(helloFrames.slice(0, 2), 10, { end: false })];

    await startTask({ tabId: 43, prompt: 'Write', url: 'https://example.com', title: 'x' });
    const session = await settled(43, 5000);

    const error = session.messages.find(m => m.role === 'error');
    expect(error.key).toBe('timeout');
    expect(error.params.seconds).toBe(Math.round(LIMITS.stallTimeoutMs / 1000));
  });

  it('gives up when nothing ever arrives', async () => {
    LIMITS.firstChunkTimeoutMs = 120;
    LIMITS.warmupHintMs = 40;
    responses = [trickle([], 10, { end: false })];

    await startTask({ tabId: 44, prompt: 'Write', url: 'https://example.com', title: 'x' });
    const session = await settled(44, 5000);

    expect(session.messages.find(m => m.role === 'error').key).toBe('timeout');
  });
});

describe('model capabilities', () => {
  const toolNames = (index) => requests[index].body.tools.map(t => t.name);

  it('offers the screenshot tool only to a model that can read images', async () => {
    local.configuredProviders = [{ ...PROVIDER, vision: false }];
    responses = [textReply('ok')];

    await startTask({ tabId: 60, prompt: 'Go', url: 'https://example.com', title: 'x' });
    await settled(60);

    expect(toolNames(0)).not.toContain('take_screenshot');
    expect(toolNames(0)).toContain('read_page');
  });

  it('lets /novision withdraw it for one message', async () => {
    local.configuredProviders = [{ ...PROVIDER, vision: true }];
    responses = [textReply('ok')];

    await startTask({ tabId: 61, prompt: 'Read it /novision', url: 'https://example.com', title: 'x' });
    const session = await settled(61);

    expect(toolNames(0)).not.toContain('take_screenshot');
    // The directive steers the request and never reaches the model as text.
    expect(session.messages[0].text).toBe('Read it');
    expect(requests[0].body.messages[0].content).not.toContain('/novision');
  });

  it('asks for thinking in the shape the provider accepts', async () => {
    local.configuredProviders = [{ ...PROVIDER, thinking: true }];
    responses = [textReply('ok')];

    await startTask({ tabId: 62, prompt: 'Think hard', url: 'https://example.com', title: 'x' });
    await settled(62);

    expect(requests[0].body.thinking).toMatchObject({ type: 'enabled' });
    expect(requests[0].body.max_tokens).toBeGreaterThan(requests[0].body.thinking.budget_tokens);
  });

  it('sends nothing extra when thinking is off', async () => {
    responses = [textReply('ok')];
    await startTask({ tabId: 63, prompt: 'Go', url: 'https://example.com', title: 'x' });
    await settled(63);

    expect(requests[0].body.thinking).toBeUndefined();
    expect(requests[0].body.reasoning_effort).toBeUndefined();
  });

  // reasoning_effort exists only on reasoning models; gpt-4o answers 400.
  it('retries without the reasoning parameter when the provider rejects it', async () => {
    local.configuredProviders = [{
      ...PROVIDER, typeId: 'openai', selectedModel: 'gpt-4o', thinking: true,
    }];
    // An OpenAI-wire provider needs an OpenAI-shaped answer.
    const oaiReply = (text) => ({
      ok: true, status: 200,
      headers: { get: () => 'application/json' },
      json: async () => ({ choices: [{ message: { content: text } }] }),
      text: async () => '',
    });

    responses = [
      {
        ok: false, status: 400,
        headers: { get: () => 'application/json' },
        text: async () => '{"error":{"message":"Unrecognized request argument supplied: reasoning_effort"}}',
      },
      oaiReply('ok'),
    ];

    await startTask({ tabId: 64, prompt: 'Go', url: 'https://example.com', title: 'x' });
    const session = await settled(64);

    expect(requests).toHaveLength(2);
    expect(requests[0].body.reasoning_effort).toBe('medium');
    expect(requests[1].body.reasoning_effort).toBeUndefined();
    expect(session.messages.some(m => m.role === 'error')).toBe(false);
  });
});

describe('one service per tab', () => {
  const MISTRAL = {
    instanceId: 'm1',
    typeId: 'mistral',
    name: 'Mistral',
    key: 'k-mistral',
    customUrl: '',
    models: [{ id: 'mistral-large-latest' }],
    selectedModel: 'mistral-large-latest',
  };

  const oaiReply = (text) => ({
    ok: true, status: 200,
    headers: { get: () => 'application/json' },
    json: async () => ({ choices: [{ message: { content: text } }] }),
    text: async () => '',
  });

  beforeEach(() => {
    local.configuredProviders = [PROVIDER, MISTRAL];
    local.currentProvider = 'a1';
  });

  it('lets two tabs talk to two different services', async () => {
    responses = [textReply('from Claude'), oaiReply('from Mistral')];

    await setSessionProvider(70, { instanceId: 'a1', model: 'claude-sonnet-5' });
    await setSessionProvider(71, { instanceId: 'm1', model: 'mistral-large-latest' });

    await startTask({ tabId: 70, prompt: 'A', url: 'https://a.test', title: 'A' });
    await settled(70);
    await startTask({ tabId: 71, prompt: 'B', url: 'https://b.test', title: 'B' });
    await settled(71);

    expect(requests[0].url).toContain('api.anthropic.com');
    expect(requests[0].body.model).toBe('claude-sonnet-5');
    expect(requests[1].url).toContain('api.mistral.ai');
    expect(requests[1].body.model).toBe('mistral-large-latest');
  });

  it('runs both tabs at the same time rather than queueing them', async () => {
    let inFlight = 0;
    let peak = 0;
    const slow = (response) => async () => {
      inFlight++;
      peak = Math.max(peak, inFlight);
      await new Promise(r => setTimeout(r, 200));
      inFlight--;
      return response;
    };
    responses = [slow(textReply('a')), slow(oaiReply('b'))];

    await setSessionProvider(72, { instanceId: 'a1', model: 'claude-sonnet-5' });
    await setSessionProvider(73, { instanceId: 'm1', model: 'mistral-large-latest' });

    // Deliberately not awaited in turn: this is the user starting one task,
    // switching tab, and starting another.
    await Promise.all([
      startTask({ tabId: 72, prompt: 'A', url: 'https://a.test', title: 'A' }),
      startTask({ tabId: 73, prompt: 'B', url: 'https://b.test', title: 'B' }),
    ]);
    await Promise.all([settled(72, 4000), settled(73, 4000)]);

    expect(peak).toBe(2);
  });

  it('keeps a running conversation on its own service when the default changes', async () => {
    responses = [textReply('first'), textReply('second')];

    await startTask({ tabId: 74, prompt: 'A', url: 'https://a.test', title: 'A' });
    await settled(74);

    // The user picks another service for a different tab.
    local.currentProvider = 'm1';

    await startTask({ tabId: 74, prompt: 'B', url: 'https://a.test', title: 'A' });
    await settled(74);

    expect(requests[1].url).toContain('api.anthropic.com');
  });

  it('resumes a paused task with the service it was built with', async () => {
    local.maxIterations = 1;
    responses = [toolReply('scroll', { direction: 'down' }, 't1'), textReply('done')];

    await startTask({ tabId: 75, prompt: 'Scroll', url: 'https://a.test', title: 'A' });
    expect((await settled(75)).awaitingContinue).toBe(true);

    local.currentProvider = 'm1'; // changed while the task was paused

    await continueTask(75);
    await settled(75);

    expect(requests[1].url).toContain('api.anthropic.com');
  });

  // Anthropic assistant turns are block arrays; OpenAI wants tool_calls.
  // Replaying one against the other is a guaranteed 400.
  it('starts over when the new service speaks a different protocol', async () => {
    responses = [textReply('first'), oaiReply('fresh start')];

    await startTask({ tabId: 76, prompt: 'A', url: 'https://a.test', title: 'A' });
    await settled(76);

    await setSessionProvider(76, { instanceId: 'm1', model: 'mistral-large-latest' });
    await startTask({ tabId: 76, prompt: 'B', url: 'https://a.test', title: 'A' });
    const session = await settled(76);

    expect(session.messages.some(m => m.key === 'providerChanged')).toBe(true);
    // Nothing from the previous exchange was replayed to the new service.
    // (OpenAI-wire requests carry the system prompt as a message of their own.)
    expect(requests[1].body.messages.filter(m => m.role !== 'system')).toHaveLength(1);
  });

  it('keeps the conversation when the new service speaks the same protocol', async () => {
    local.configuredProviders = [
      MISTRAL,
      { ...MISTRAL, instanceId: 'm2', name: 'DeepSeek', typeId: 'deepseek', selectedModel: 'deepseek-chat' },
    ];
    local.currentProvider = 'm1';
    responses = [oaiReply('first'), oaiReply('second')];

    await startTask({ tabId: 77, prompt: 'A', url: 'https://a.test', title: 'A' });
    await settled(77);

    await setSessionProvider(77, { instanceId: 'm2', model: 'deepseek-chat' });
    await startTask({ tabId: 77, prompt: 'B', url: 'https://a.test', title: 'A' });
    const session = await settled(77);

    expect(session.messages.some(m => m.key === 'providerChanged')).toBe(false);
    expect(requests[1].url).toContain('api.deepseek.com');
    expect(requests[1].body.messages.length).toBeGreaterThan(1);
  });

  it('refuses to switch service under a running task', async () => {
    responses = [async () => {
      await new Promise(r => setTimeout(r, 200));
      return textReply('done');
    }];

    await startTask({ tabId: 78, prompt: 'A', url: 'https://a.test', title: 'A' });
    expect((await setSessionProvider(78, { instanceId: 'm1', model: 'x' })).error).toBe('busy');
    await settled(78, 4000);
  });

  it('falls back to the default when the chosen service has been deleted', async () => {
    await setSessionProvider(79, { instanceId: 'gone', model: 'nope' });
    responses = [textReply('ok')];

    await startTask({ tabId: 79, prompt: 'A', url: 'https://a.test', title: 'A' });
    const session = await settled(79);

    expect(session.messages.some(m => m.role === 'error')).toBe(false);
    expect(requests[0].url).toContain('api.anthropic.com');
  });
});

describe('context and gateway recovery', () => {
  const bulky = (n) => ({ elements: 'x'.repeat(n) });

  const overflow = () => ({
    ok: false, status: 400,
    headers: { get: () => 'application/json' },
    text: async () => JSON.stringify({
      error: { message: "This model's maximum context length is 200000 tokens. However, you requested 4096 output tokens and your prompt contains at least 195905 input tokens. Please reduce the length of the input prompt." },
    }),
  });

  it('trims and retries when the model says the prompt is too long', async () => {
    responses = [
      toolReply('read_page', {}, 't1'),
      overflow(),
      textReply('done'),
    ];
    toolImpl = async () => bulky(6000);

    await startTask({ tabId: 80, prompt: 'Go', url: 'https://a.test', title: 'A' });
    const session = await settled(80, 5000);

    expect(session.messages.some(m => m.key === 'contextTrimmed')).toBe(true);
    expect(session.messages.some(m => m.role === 'error')).toBe(false);

    // The retry sent strictly less than the request that was refused.
    const sizeOf = (r) => JSON.stringify(r.body.messages).length;
    expect(sizeOf(requests.at(-1))).toBeLessThan(sizeOf(requests[1]));
  });

  it('gives up with a clear error once the budget cannot shrink further', async () => {
    LIMITS.maxInputTokens = 8000;
    responses = [overflow(), overflow(), overflow(), overflow()];

    await startTask({ tabId: 81, prompt: 'Go', url: 'https://a.test', title: 'A' });
    const session = await settled(81, 5000);

    expect(session.messages.at(-1)).toMatchObject({ role: 'error', key: 'contextTooLong' });
    LIMITS.maxInputTokens = 40000;
  });

  // A gateway that answers a one-token probe but fails the real call is
  // usually one that cannot stream.
  it('retries without streaming when the gateway returns a server error', async () => {
    responses = [
      { ok: false, status: 500, headers: { get: () => 'application/json' }, text: async () => 'internal error' },
      textReply('ok'),
    ];

    await startTask({ tabId: 82, prompt: 'Go', url: 'https://a.test', title: 'A' });
    const session = await settled(82);

    expect(requests[0].body.stream).toBe(true);
    expect(requests[1].body.stream).toBe(false);
    expect(session.messages.some(m => m.role === 'error')).toBe(false);
  });

  it('keeps the provider’s own words on an error it cannot recover from', async () => {
    responses = [
      { ok: false, status: 500, headers: { get: () => 'application/json' }, text: async () => 'upstream exploded' },
      { ok: false, status: 500, headers: { get: () => 'application/json' }, text: async () => 'upstream exploded' },
    ];

    await startTask({ tabId: 83, prompt: 'Go', url: 'https://a.test', title: 'A' });
    const session = await settled(83);

    const error = session.messages.find(m => m.role === 'error');
    expect(error.key).toBe('providerDown');
    expect(error.params.detail).toContain('upstream exploded');
    expect(error.params.status).toBe(500);
  });

  it('drops stale page reads from the history it sends', async () => {
    responses = [
      toolReply('read_page', {}, 't1'),
      toolReply('read_page', {}, 't2'),
      textReply('done'),
    ];
    toolImpl = async () => bulky(4000);

    await startTask({ tabId: 84, prompt: 'Go', url: 'https://a.test', title: 'A' });
    await settled(84, 5000);

    const sent = JSON.stringify(requests.at(-1).body.messages);
    expect(sent).toContain('Earlier page read');
  });
});

describe('session lifecycle', () => {
  it('reports nothing for a tab that has never been used', async () => {
    expect((await getSession(999)).session).toBeNull();
  });

  it('persists a session so it survives the worker restarting', async () => {
    responses = [textReply('ok')];
    await startTask({ tabId: 12, prompt: 'Hi', url: 'https://example.com', title: 'x' });
    await settled(12);
    await new Promise(r => setTimeout(r, 400)); // the write is debounced

    expect(sessionStore.bm_session_12.messages.length).toBeGreaterThan(0);
  });

  it('clears a conversation without losing the tab', async () => {
    responses = [textReply('ok')];
    await startTask({ tabId: 13, prompt: 'Hi', url: 'https://example.com', title: 'x' });
    await settled(13);

    await clearTask(13);
    const { session } = await getSession(13);
    expect(session.messages).toEqual([]);
    expect(session.iterations).toBe(0);
  });

  it('discards a conversation for good on request', async () => {
    responses = [textReply('ok')];
    await startTask({ tabId: 14, prompt: 'Hi', url: 'https://example.com', title: 'x' });
    await settled(14);

    await dropSession(14);
    expect((await getSession(14)).session).toBeNull();
    expect(sessionStore.bm_session_14).toBeUndefined();
  });
});

// Ctrl+W is one keystroke from Ctrl+S, and a reopened tab comes back with a
// new id — so a conversation can only be found again by the page it was about.
describe('closing a tab', () => {
  it('stops the task but keeps the conversation', async () => {
    responses = [textReply('answer')];
    await startTask({ tabId: 90, prompt: 'Hi', url: 'https://a.test/page', title: 'A' });
    await settled(90);

    expect((await retireSession(90)).kept).toBe(true);
    expect(sessionStore.bm_session_90).toBeUndefined();
    expect(sessionStore.bm_orphans).toHaveLength(1);
  });

  it('hands it back to a tab reopened on the same page', async () => {
    responses = [textReply('answer')];
    await startTask({ tabId: 91, prompt: 'Remember this', url: 'https://a.test/page', title: 'A' });
    await settled(91);
    await retireSession(91);

    // Ctrl+Shift+T: same URL, different tab id.
    const { session } = await getSession(92, 'https://a.test/page');

    expect(session.messages.some(m => m.text === 'Remember this')).toBe(true);
    expect(session.messages.some(m => m.key === 'resumed')).toBe(true);
    expect(session.running).toBe(false);
    expect(sessionStore.bm_orphans).toHaveLength(0);
  });

  it('carries the conversation itself over, not just the transcript', async () => {
    responses = [textReply('first'), textReply('second')];
    await startTask({ tabId: 93, prompt: 'A', url: 'https://a.test/page', title: 'A' });
    await settled(93);
    await retireSession(93);

    await getSession(94, 'https://a.test/page');
    await startTask({ tabId: 94, prompt: 'B', url: 'https://a.test/page', title: 'A' });
    await settled(94);

    // The model is asked to continue, not to start over.
    expect(requests[1].body.messages.length).toBeGreaterThan(1);
  });

  it('leaves a different page alone', async () => {
    responses = [textReply('answer')];
    await startTask({ tabId: 95, prompt: 'Hi', url: 'https://a.test/page', title: 'A' });
    await settled(95);
    await retireSession(95);

    expect((await getSession(96, 'https://b.test/other')).session).toBeNull();
    expect(sessionStore.bm_orphans).toHaveLength(1);
  });

  it('keeps nothing for a tab that was never used', async () => {
    expect((await retireSession(97)).kept).toBe(false);
    expect(sessionStore.bm_orphans ?? []).toHaveLength(0);
  });

  it('holds only the last few closed tabs', async () => {
    for (let tab = 100; tab < 110; tab++) {
      responses = [textReply('ok')];
      await startTask({ tabId: tab, prompt: 'Hi', url: `https://a.test/${tab}`, title: 'A' });
      await settled(tab);
      await retireSession(tab);
    }
    expect(sessionStore.bm_orphans.length).toBeLessThanOrEqual(5);

    // The most recent close is the one worth keeping.
    expect(sessionStore.bm_orphans.at(-1).url).toBe('https://a.test/109');
  });

  it('also files it in the permanent history', async () => {
    local.historyEnabled = true;
    responses = [textReply('ok')];
    await startTask({ tabId: 111, prompt: 'Archive me', url: 'https://a.test/page', title: 'A' });
    await settled(111);
    await retireSession(111);

    expect(local.historyIndex.length).toBeGreaterThan(0);
  });

  it('stops a task that was still running', async () => {
    responses = [async () => {
      await new Promise(r => setTimeout(r, 400));
      return textReply('too late');
    }];

    await startTask({ tabId: 112, prompt: 'Hi', url: 'https://a.test/page', title: 'A' });
    await retireSession(112);

    // The tab is gone; nothing is left running against it.
    expect((await getSession(112)).session).toBeNull();
  });

  it('has nothing to stop when no task is running', async () => {
    expect((await stopTask(998)).error).toBe('no_task');
  });
});

describe('tab navigation guard', () => {
  it('ignores navigation caused by the agent\'s own action', async () => {
    responses = [toolReply('click', { element: 1 }), textReply('Done.')];
    toolImpl = async (_tool, _input, tabId) => {
      // A click that navigates: the event lands while the tool is running.
      await notifyTabNavigated(tabId, 'https://example.com/next');
      return { success: true };
    };

    await startTask({ tabId: 20, prompt: 'Click', url: 'https://example.com', title: 'x' });
    const session = await settled(20);

    expect(session.messages.some(m => m.key === 'stoppedPageChanged')).toBe(false);
    expect(session.status.key).toBe('done');
  });

  it('stops when the user navigates the tab themselves', async () => {
    const slow = (response, ms) => async () => {
      await new Promise(r => setTimeout(r, ms));
      return response;
    };
    // The second call is slow, so the navigation lands while the loop is
    // waiting on the model: no tool running, grace window expired.
    responses = [
      toolReply('read_page', {}, 't1'),
      slow(toolReply('scroll', { direction: 'down' }, 't2'), 4000),
      textReply('never reached'),
    ];

    await startTask({ tabId: 21, prompt: 'Read', url: 'https://example.com', title: 'x' });

    await new Promise(r => setTimeout(r, 3300));
    await notifyTabNavigated(21, 'https://other.test/page');

    const session = await settled(21, 8000);
    expect(session.messages.some(m => m.key === 'pageChanged')).toBe(true);
    expect(session.messages.some(m => m.key === 'stoppedPageChanged')).toBe(true);
    // The third scripted answer was never requested.
    expect(responses).toHaveLength(1);
  }, 20000);

  it('updates a stored URL for an idle tab without raising anything', async () => {
    responses = [textReply('ok')];
    await startTask({ tabId: 22, prompt: 'Hi', url: 'https://example.com', title: 'x' });
    await settled(22);

    await notifyTabNavigated(22, 'https://example.com/other');
    const { session } = await getSession(22);
    expect(session.url).toBe('https://example.com/other');
    expect(session.messages.some(m => m.key === 'pageChanged')).toBe(false);
  });
});
