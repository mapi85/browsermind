import { describe, it, expect } from 'vitest';
import {
  normalizeOAI, trimHistory, buildAssistantMessage, buildToolResult,
  appendToolResults, buildSystemPrompt, extractMemoryTags, getModelTier,
  toAnthropicTools, toOpenAITools,
} from '../src/shared/llm.js';

describe('normalizeOAI', () => {
  it('converts text content into a text block', () => {
    const blocks = normalizeOAI({ choices: [{ message: { content: 'salut' } }] });
    expect(blocks).toEqual([{ type: 'text', text: 'salut' }]);
  });

  it('converts tool_calls into tool_use blocks with parsed input', () => {
    const blocks = normalizeOAI({
      choices: [{
        message: {
          content: null,
          tool_calls: [{ id: 'call_1', function: { name: 'click', arguments: '{"selector":"#go"}' } }],
        },
      }],
    });
    expect(blocks).toEqual([{ type: 'tool_use', id: 'call_1', name: 'click', input: { selector: '#go' } }]);
  });

  it('tolerates malformed tool arguments', () => {
    const blocks = normalizeOAI({
      choices: [{ message: { tool_calls: [{ id: 'x', function: { name: 'wait', arguments: '{oops' } }] } }],
    });
    expect(blocks[0].input).toEqual({});
  });

  it('returns [] when there is no message', () => {
    expect(normalizeOAI({})).toEqual([]);
    expect(normalizeOAI(undefined)).toEqual([]);
  });
});

describe('trimHistory', () => {
  it('keeps everything under the budget', () => {
    const h = [{ role: 'user', content: 'a' }, { role: 'assistant', content: 'b' }];
    expect(trimHistory(h, 1000)).toHaveLength(2);
  });

  it('drops the oldest messages first when over budget', () => {
    const h = [
      { role: 'user', content: 'x'.repeat(400) },
      { role: 'assistant', content: 'y'.repeat(400) },
      { role: 'user', content: 'z'.repeat(40) },
    ];
    // 100 tokens ≈ 400 chars budget
    const trimmed = trimHistory(h, 100);
    expect(trimmed[trimmed.length - 1].content).toContain('z');
    expect(trimmed.length).toBeLessThan(3);
  });

  it('always keeps at least the latest message even if oversized', () => {
    const h = [{ role: 'user', content: 'x'.repeat(10000) }];
    expect(trimHistory(h, 10)).toHaveLength(1);
  });

  it('measures structured content via JSON size', () => {
    const h = [
      { role: 'user', content: [{ type: 'tool_result', content: 'r'.repeat(500) }] },
      { role: 'user', content: 'recent' },
    ];
    const trimmed = trimHistory(h, 50);
    expect(trimmed).toHaveLength(1);
    expect(trimmed[0].content).toBe('recent');
  });
});

describe('buildAssistantMessage', () => {
  const toolBlocks = [{ type: 'tool_use', id: 'tu_1', name: 'click', input: { selector: '#a' } }];
  const blocks = [{ type: 'text', text: 'ok' }, ...toolBlocks];

  it('OAI: carries tool_calls so result ids can match', () => {
    const msg = buildAssistantMessage(true, blocks, 'ok', toolBlocks);
    expect(msg.role).toBe('assistant');
    expect(msg.content).toBe('ok');
    expect(msg.tool_calls).toHaveLength(1);
    expect(msg.tool_calls[0]).toMatchObject({ id: 'tu_1', type: 'function' });
    expect(JSON.parse(msg.tool_calls[0].function.arguments)).toEqual({ selector: '#a' });
  });

  it('OAI: null content when no text', () => {
    const msg = buildAssistantMessage(true, toolBlocks, '', toolBlocks);
    expect(msg.content).toBeNull();
  });

  it('Anthropic: keeps the raw blocks', () => {
    const msg = buildAssistantMessage(false, blocks, 'ok', toolBlocks);
    expect(msg).toEqual({ role: 'assistant', content: blocks });
  });

  it('Anthropic: returns null when there are no blocks', () => {
    expect(buildAssistantMessage(false, [], '', [])).toBeNull();
  });
});

describe('buildToolResult / appendToolResults', () => {
  it('OAI shape uses role:tool + tool_call_id', () => {
    expect(buildToolResult(true, 'id1', { ok: true })).toEqual({
      role: 'tool', tool_call_id: 'id1', content: '{"ok":true}',
    });
  });

  it('Anthropic shape uses type:tool_result + tool_use_id', () => {
    expect(buildToolResult(false, 'id1', { ok: true })).toEqual({
      type: 'tool_result', tool_use_id: 'id1', content: '{"ok":true}',
    });
  });

  it('OAI results are appended individually', () => {
    const history = [];
    const r1 = buildToolResult(true, 'a', {});
    const r2 = buildToolResult(true, 'b', {});
    appendToolResults(history, true, [r1, r2]);
    expect(history).toEqual([r1, r2]);
  });

  it('Anthropic results are grouped into a single user message', () => {
    const history = [];
    const r1 = buildToolResult(false, 'a', {});
    const r2 = buildToolResult(false, 'b', {});
    appendToolResults(history, false, [r1, r2]);
    expect(history).toHaveLength(1);
    expect(history[0]).toEqual({ role: 'user', content: [r1, r2] });
  });

  it('does nothing for empty results', () => {
    const history = [];
    appendToolResults(history, false, []);
    expect(history).toHaveLength(0);
  });
});

describe('buildSystemPrompt', () => {
  const base = {
    userSystemPrompt: '', modeExtra: '', pageContext: 'CTX',
    memory: [], agentLang: 'fr', model: 'claude-opus-4-8', bestPractices: 'auto',
  };

  it('includes the page context and language directive', () => {
    const sys = buildSystemPrompt(base);
    expect(sys).toContain('CONTEXTE PAGE: CTX');
    expect(sys).toContain('français');
  });

  it('prefixes the user system prompt', () => {
    const sys = buildSystemPrompt({ ...base, userSystemPrompt: 'PERSONA' });
    expect(sys.startsWith('PERSONA\n\n')).toBe(true);
  });

  it('injects memory entries', () => {
    const sys = buildSystemPrompt({ ...base, memory: [{ key: 'ville', value: 'Paris' }] });
    expect(sys).toContain('- ville: Paris');
  });

  it('auto mode skips best practices for high-tier models, adds them for low-tier', () => {
    expect(buildSystemPrompt(base)).not.toContain('BONNES PRATIQUES');
    const low = buildSystemPrompt({ ...base, model: 'tinyllama' });
    expect(low).toContain('BONNES PRATIQUES');
  });

  it('always/never overrides the tier heuristic', () => {
    expect(buildSystemPrompt({ ...base, bestPractices: 'always' })).toContain('BONNES PRATIQUES');
    expect(buildSystemPrompt({ ...base, model: 'tinyllama', bestPractices: 'never' })).not.toContain('BONNES PRATIQUES');
  });
});

describe('extractMemoryTags', () => {
  it('extracts key/value pairs', () => {
    expect(extractMemoryTags('ok [MÉMORISE: ville=Paris] fin')).toEqual([{ key: 'ville', value: 'Paris' }]);
  });
  it('extracts multiple tags and trims', () => {
    const tags = extractMemoryTags('[MÉMORISE: a = 1 ][MÉMORISE: b=2]');
    expect(tags).toEqual([{ key: 'a', value: '1' }, { key: 'b', value: '2' }]);
  });
  it('returns [] when no tag present', () => {
    expect(extractMemoryTags('rien à voir')).toEqual([]);
  });
});

describe('getModelTier', () => {
  it.each([
    ['claude-opus-4-8', 'high'],
    ['claude-sonnet-4-6', 'high'],
    ['claude-fable-5', 'high'],
    ['gpt-4o', 'high'],
    ['claude-haiku-4-5', 'medium'],
    ['gpt-4o-mini', 'medium'],
    ['some-tiny-model', 'low'],
    [undefined, 'low'],
  ])('%s → %s', (model, tier) => {
    expect(getModelTier(model)).toBe(tier);
  });
});

describe('tool definition converters', () => {
  const tool = { name: 'click', description: 'd', input_schema: { type: 'object' }, icon: '👆', label: 'x' };

  it('toAnthropicTools strips UI fields', () => {
    expect(toAnthropicTools([tool])).toEqual([{ name: 'click', description: 'd', input_schema: { type: 'object' } }]);
  });

  it('toOpenAITools wraps in function format', () => {
    expect(toOpenAITools([tool])).toEqual([{
      type: 'function',
      function: { name: 'click', description: 'd', parameters: { type: 'object' } },
    }]);
  });
});
