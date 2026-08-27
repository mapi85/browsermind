// ═══════════════════════════════════════════════
//  BrowserMind — Streaming response assembly
//
//  Both providers stream, in different shapes. This turns either stream into
//  the same Anthropic-style block list the agent loop already understands,
//  and reports text deltas so the panel can render as the answer arrives
//  instead of showing a frozen spinner for a minute.
//
//  Pure logic: no fetch, no chrome.*, no DOM.
// ═══════════════════════════════════════════════

export class StreamAssembler {
  constructor(isOAI) {
    this.isOAI = isOAI;
    this.blocks = [];       // sparse, indexed as the provider indexes them
    this.partials = new Map(); // index → accumulated JSON string for tool input
    this.stopReason = null;
    this.usage = null;
    this.refusal = null;
  }

  /** Feeds one parsed SSE payload. Returns {text, thinking} deltas, if any. */
  push(payload) {
    return this.isOAI ? this.#pushOpenAI(payload) : this.#pushAnthropic(payload);
  }

  #slot(index, seed) {
    if (!this.blocks[index]) this.blocks[index] = seed;
    return this.blocks[index];
  }

  #pushAnthropic(event) {
    switch (event?.type) {
      case 'content_block_start': {
        const cb = event.content_block || {};
        if (cb.type === 'tool_use') {
          this.blocks[event.index] = { type: 'tool_use', id: cb.id, name: cb.name, input: {} };
          this.partials.set(event.index, '');
        } else if (cb.type === 'thinking') {
          this.blocks[event.index] = { type: 'thinking', thinking: '' };
        } else {
          this.blocks[event.index] = { type: 'text', text: '' };
        }
        return {};
      }

      case 'content_block_delta': {
        const d = event.delta || {};
        if (d.type === 'text_delta') {
          this.#slot(event.index, { type: 'text', text: '' }).text += d.text;
          return { text: d.text };
        }
        if (d.type === 'thinking_delta') {
          this.#slot(event.index, { type: 'thinking', thinking: '' }).thinking += d.thinking;
          return { thinking: d.thinking };
        }
        if (d.type === 'input_json_delta') {
          this.partials.set(event.index, (this.partials.get(event.index) || '') + d.partial_json);
          return {};
        }
        return {};
      }

      case 'content_block_stop': {
        this.#finalizeToolInput(event.index);
        return {};
      }

      case 'message_delta': {
        if (event.delta?.stop_reason) this.stopReason = event.delta.stop_reason;
        if (event.usage) this.usage = { ...(this.usage || {}), ...event.usage };
        return {};
      }

      case 'message_start': {
        if (event.message?.usage) this.usage = event.message.usage;
        return {};
      }

      case 'error': {
        throw new Error(event.error?.message || 'Stream error');
      }

      default:
        return {};
    }
  }

  #pushOpenAI(chunk) {
    const choice = chunk?.choices?.[0];
    if (!choice) return {};

    const delta = choice.delta || {};
    const out = {};

    if (delta.refusal) this.refusal = (this.refusal || '') + delta.refusal;

    const reasoning = delta.reasoning_content ?? delta.reasoning;
    if (typeof reasoning === 'string' && reasoning) {
      // Reserve slot 0 for reasoning so it renders before the answer.
      const slot = this.#slot(0, { type: 'thinking', thinking: '' });
      if (slot.type === 'thinking') {
        slot.thinking += reasoning;
        out.thinking = reasoning;
      }
    }

    if (typeof delta.content === 'string' && delta.content) {
      const index = this.blocks.findIndex(b => b?.type === 'text');
      const slot = index >= 0 ? this.blocks[index] : this.#slot(this.blocks.length, { type: 'text', text: '' });
      slot.text += delta.content;
      out.text = delta.content;
    }

    for (const call of delta.tool_calls || []) {
      // OpenAI indexes tool calls separately from content; offset them so the
      // two numbering schemes cannot collide.
      const at = 100 + (call.index ?? 0);
      const slot = this.#slot(at, { type: 'tool_use', id: call.id, name: '', input: {} });
      if (call.id) slot.id = call.id;
      if (call.function?.name) slot.name += call.function.name;
      if (call.function?.arguments) {
        this.partials.set(at, (this.partials.get(at) || '') + call.function.arguments);
      }
    }

    if (choice.finish_reason) this.stopReason = choice.finish_reason;
    if (chunk.usage) this.usage = chunk.usage;
    return out;
  }

  #finalizeToolInput(index) {
    const block = this.blocks[index];
    if (!block || block.type !== 'tool_use') return;
    const raw = this.partials.get(index);
    if (raw === undefined) return;
    try {
      block.input = raw.trim() ? JSON.parse(raw) : {};
    } catch {
      // A truncated stream leaves invalid JSON. Empty input at least keeps the
      // block valid; the tool reports the missing argument and the model retries.
      block.input = {};
      block.malformedInput = raw.slice(0, 200);
    }
    this.partials.delete(index);
  }

  /** Finalizes every pending block and returns them in order. */
  finish() {
    for (const index of [...this.partials.keys()]) this.#finalizeToolInput(index);
    return this.blocks.filter(Boolean);
  }
}

/**
 * Reads an SSE body and yields parsed JSON payloads.
 * Tolerates multi-line data:, comment lines and the OpenAI [DONE] sentinel.
 */
export async function* readSSE(stream) {
  const decoder = new TextDecoder();
  const reader = stream.getReader();
  let buffer = '';

  try {
    for (;;) {
      const { done, value } = await reader.read();
      if (done) break;
      buffer += decoder.decode(value, { stream: true });

      let split;
      while ((split = buffer.indexOf('\n\n')) !== -1) {
        const rawEvent = buffer.slice(0, split);
        buffer = buffer.slice(split + 2);

        const data = rawEvent
          .split('\n')
          .filter(line => line.startsWith('data:'))
          .map(line => line.slice(5).trim())
          .join('');

        if (!data || data === '[DONE]') continue;
        try { yield JSON.parse(data); } catch { /* skip an unparseable frame */ }
      }
    }
  } finally {
    reader.releaseLock();
  }
}
