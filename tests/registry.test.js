import { describe, it, expect } from 'vitest';
import { readFileSync } from 'node:fs';
import { NATIVE_TOOLS, DOM_TOOLS, VISION_TOOLS, getAllTools, getToolByName, isNativeTool } from '../src/shared/tools.js';

describe('tool registry', () => {
  it('exposes a fixed native set', () => {
    expect(getAllTools()).toBe(NATIVE_TOOLS);
    expect(NATIVE_TOOLS.length).toBeGreaterThan(10);
  });

  it('gives every tool a unique snake_case name', () => {
    const names = NATIVE_TOOLS.map(t => t.name);
    expect(new Set(names).size).toBe(names.length);
    for (const name of names) expect(name, name).toMatch(/^[a-z][a-z0-9_]*$/);
  });

  it('gives every tool a description, a schema, an icon and a label key', () => {
    for (const tool of NATIVE_TOOLS) {
      expect(tool.description.length, tool.name).toBeGreaterThan(20);
      expect(tool.input_schema.type, tool.name).toBe('object');
      expect(tool.input_schema.properties, tool.name).toBeTypeOf('object');
      expect(tool.icon, tool.name).toBeTruthy();
      expect(tool.labelKey, tool.name).toMatch(/^tool/);
    }
  });

  it('only requires parameters it also declares', () => {
    for (const tool of NATIVE_TOOLS) {
      for (const required of tool.input_schema.required || []) {
        expect(tool.input_schema.properties[required], `${tool.name}.${required}`).toBeDefined();
      }
    }
  });

  it('looks tools up by name', () => {
    expect(getToolByName('click').name).toBe('click');
    expect(getToolByName('nope')).toBeNull();
    expect(isNativeTool('read_page')).toBe(true);
    expect(isNativeTool('remote_thing')).toBe(false);
  });

  it('lets page actions address elements by index', () => {
    for (const name of ['click', 'type_text']) {
      expect(getToolByName(name).input_schema.properties.element.type).toBe('number');
    }
    const field = getToolByName('fill_form').input_schema.properties.fields.items;
    expect(field.properties.element.type).toBe('number');
  });

  it('classifies page tools so they run one at a time', () => {
    for (const name of ['read_page', 'click', 'type_text', 'fill_form', 'scroll']) {
      expect(DOM_TOOLS.has(name), name).toBe(true);
    }
    for (const name of ['web_search', 'api_call', 'new_tab', 'download_file']) {
      expect(DOM_TOOLS.has(name), name).toBe(false);
    }
  });

  it('marks the screenshot tool as producing an image', () => {
    expect(VISION_TOOLS.has('take_screenshot')).toBe(true);
  });

  it('exposes only the two structured-data APIs', () => {
    expect(getToolByName('api_call').input_schema.properties.api.enum)
      .toEqual(['nominatim', 'open_meteo']);
  });

  // Model-facing text stays in English on purpose: tool-calling accuracy is
  // better and the prompt is shorter. This guards against a translation
  // creeping back into the tool definitions.
  it('keeps every model-facing string free of accented characters', () => {
    for (const tool of NATIVE_TOOLS) {
      const text = JSON.stringify(tool.input_schema) + tool.description;
      expect(text, tool.name).not.toMatch(/[àâäéèêëîïôöùûüçñ]/i);
    }
  });

  it('no longer ships a custom or remote tool loader', () => {
    const source = readFileSync('src/shared/tools.js', 'utf8');
    for (const gone of ['loadRemoteTools', 'customTools', 'remoteToolsCache', 'executor']) {
      expect(source, gone).not.toContain(gone);
    }
  });
});
