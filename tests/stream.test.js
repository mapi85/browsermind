import { describe, it, expect } from 'vitest';
import { StreamAssembler, readSSE } from '../src/shared/stream.js';

// Builds a ReadableStream of SSE frames, split at arbitrary byte boundaries so
// the parser is exercised the way a real network delivers a response.
function sseStream(frames, chunkSize = 7) {
  const payload = frames.join('');
  const bytes = new TextEncoder().encode(payload);
  let offset = 0;

  return new ReadableStream({
    pull(controller) {
      if (offset >= bytes.length) { controller.close(); return; }
      controller.enqueue(bytes.slice(offset, offset + chunkSize));
      offset += chunkSize;
    },
  });
}

const frame = (obj) => `data: ${JSON.stringify(obj)}\n\n`;

describe('readSSE', () => {
  it('parses frames split across chunk boundaries', async () => {
    const stream = sseStream([frame({ n: 1 }), frame({ n: 2 }), frame({ n: 3 })], 3);
    const seen = [];
    for await (const payload of readSSE(stream)) seen.push(payload.n);
    expect(seen).toEqual([1, 2, 3]);
  });

  it('ignores the [DONE] sentinel and unparseable frames', async () => {
    const stream = sseStream(['data: [DONE]\n\n', 'data: {oops\n\n', frame({ n: 1 })]);
    const seen = [];
    for await (const payload of readSSE(stream)) seen.push(payload.n);
    expect(seen).toEqual([1]);
  });

  it('skips SSE comment and event lines', async () => {
    const stream = sseStream([': keep-alive\n\n', `event: ping\ndata: ${JSON.stringify({ n: 9 })}\n\n`]);
    const seen = [];
    for await (const payload of readSSE(stream)) seen.push(payload.n);
    expect(seen).toEqual([9]);
  });
});

describe('StreamAssembler — Anthropic', () => {
  it('assembles text and reports deltas', () => {
    const a = new StreamAssembler(false);
    a.push({ type: 'content_block_start', index: 0, content_block: { type: 'text' } });
    expect(a.push({ type: 'content_block_delta', index: 0, delta: { type: 'text_delta', text: 'Hel' } }))
      .toEqual({ text: 'Hel' });
    a.push({ type: 'content_block_delta', index: 0, delta: { type: 'text_delta', text: 'lo' } });
    a.push({ type: 'content_block_stop', index: 0 });

    expect(a.finish()).toEqual([{ type: 'text', text: 'Hello' }]);
  });

  it('assembles a tool call from partial JSON', () => {
    const a = new StreamAssembler(false);
    a.push({ type: 'content_block_start', index: 0, content_block: { type: 'tool_use', id: 't1', name: 'click' } });
    a.push({ type: 'content_block_delta', index: 0, delta: { type: 'input_json_delta', partial_json: '{"ele' } });
    a.push({ type: 'content_block_delta', index: 0, delta: { type: 'input_json_delta', partial_json: 'ment":4}' } });
    a.push({ type: 'content_block_stop', index: 0 });

    expect(a.finish()).toEqual([{ type: 'tool_use', id: 't1', name: 'click', input: { element: 4 } }]);
  });

  it('survives a truncated tool call instead of corrupting the turn', () => {
    const a = new StreamAssembler(false);
    a.push({ type: 'content_block_start', index: 0, content_block: { type: 'tool_use', id: 't1', name: 'click' } });
    a.push({ type: 'content_block_delta', index: 0, delta: { type: 'input_json_delta', partial_json: '{"elem' } });

    const [block] = a.finish();
    expect(block.input).toEqual({});
    expect(block.malformedInput).toBe('{"elem');
  });

  it('collects thinking deltas separately from the answer', () => {
    const a = new StreamAssembler(false);
    a.push({ type: 'content_block_start', index: 0, content_block: { type: 'thinking' } });
    expect(a.push({ type: 'content_block_delta', index: 0, delta: { type: 'thinking_delta', thinking: 'hmm' } }))
      .toEqual({ thinking: 'hmm' });
    a.push({ type: 'content_block_start', index: 1, content_block: { type: 'text' } });
    a.push({ type: 'content_block_delta', index: 1, delta: { type: 'text_delta', text: 'answer' } });

    expect(a.finish()).toEqual([
      { type: 'thinking', thinking: 'hmm' },
      { type: 'text', text: 'answer' },
    ]);
  });

  it('records the stop reason and usage', () => {
    const a = new StreamAssembler(false);
    a.push({ type: 'message_start', message: { usage: { input_tokens: 10 } } });
    a.push({ type: 'message_delta', delta: { stop_reason: 'tool_use' }, usage: { output_tokens: 5 } });
    expect(a.stopReason).toBe('tool_use');
    expect(a.usage).toEqual({ input_tokens: 10, output_tokens: 5 });
  });

  it('throws on an error frame', () => {
    const a = new StreamAssembler(false);
    expect(() => a.push({ type: 'error', error: { message: 'overloaded' } })).toThrow('overloaded');
  });
});

describe('StreamAssembler — OpenAI', () => {
  it('assembles streamed content', () => {
    const a = new StreamAssembler(true);
    a.push({ choices: [{ delta: { content: 'Hel' } }] });
    a.push({ choices: [{ delta: { content: 'lo' } }] });
    expect(a.finish()).toEqual([{ type: 'text', text: 'Hello' }]);
  });

  it('assembles a tool call spread over several chunks', () => {
    const a = new StreamAssembler(true);
    a.push({ choices: [{ delta: { tool_calls: [{ index: 0, id: 'c1', function: { name: 'cli', arguments: '{"e' } }] } }] });
    a.push({ choices: [{ delta: { tool_calls: [{ index: 0, function: { name: 'ck', arguments: 'lement":2}' } }] } }] });
    a.push({ choices: [{ delta: {}, finish_reason: 'tool_calls' }] });

    expect(a.finish()).toEqual([{ type: 'tool_use', id: 'c1', name: 'click', input: { element: 2 } }]);
    expect(a.stopReason).toBe('tool_calls');
  });

  it('keeps two parallel tool calls apart', () => {
    const a = new StreamAssembler(true);
    a.push({ choices: [{ delta: { tool_calls: [{ index: 0, id: 'c1', function: { name: 'click', arguments: '{}' } }] } }] });
    a.push({ choices: [{ delta: { tool_calls: [{ index: 1, id: 'c2', function: { name: 'scroll', arguments: '{}' } }] } }] });

    const blocks = a.finish();
    expect(blocks.map(b => b.name)).toEqual(['click', 'scroll']);
    expect(blocks.map(b => b.id)).toEqual(['c1', 'c2']);
  });

  it('does not let content and tool-call indexes collide', () => {
    const a = new StreamAssembler(true);
    a.push({ choices: [{ delta: { content: 'text' } }] });
    a.push({ choices: [{ delta: { tool_calls: [{ index: 0, id: 'c1', function: { name: 'click', arguments: '{}' } }] } }] });

    const blocks = a.finish();
    expect(blocks).toHaveLength(2);
    expect(blocks[0].type).toBe('text');
    expect(blocks[1].type).toBe('tool_use');
  });

  it('collects reasoning content as thinking', () => {
    const a = new StreamAssembler(true);
    expect(a.push({ choices: [{ delta: { reasoning_content: 'because' } }] })).toEqual({ thinking: 'because' });
    expect(a.finish()[0]).toEqual({ type: 'thinking', thinking: 'because' });
  });

  it('captures a streamed refusal', () => {
    const a = new StreamAssembler(true);
    a.push({ choices: [{ delta: { refusal: 'I cannot' } }] });
    expect(a.refusal).toBe('I cannot');
  });

  it('ignores a chunk with no choices', () => {
    const a = new StreamAssembler(true);
    expect(a.push({})).toEqual({});
    expect(a.finish()).toEqual([]);
  });
});
