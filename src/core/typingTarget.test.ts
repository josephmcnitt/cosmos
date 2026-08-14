/**
 * @vitest-environment happy-dom
 */
import { describe, expect, it } from 'vitest';
import { isTypingTarget } from './typingTarget';

describe('isTypingTarget', () => {
  it('blocks inputs, textareas, selects, and contenteditable', () => {
    document.body.innerHTML = `
      <input id="text" type="text" />
      <textarea id="notes"></textarea>
      <select id="pick"></select>
      <div id="editable" contenteditable="true"></div>
      <button id="plain">ok</button>
    `;
    expect(isTypingTarget(document.getElementById('text'))).toBe(true);
    expect(isTypingTarget(document.getElementById('notes'))).toBe(true);
    expect(isTypingTarget(document.getElementById('pick'))).toBe(true);
    expect(isTypingTarget(document.getElementById('plain'))).toBe(false);
    expect(isTypingTarget(document.body)).toBe(false);
    expect(isTypingTarget(null)).toBe(false);
  });

  it('blocks everything inside the bug-catcher playtest panel', () => {
    document.body.innerHTML = `
      <div id="bug-catcher-panel"><button id="panel-btn">Save note</button></div>
    `;
    expect(isTypingTarget(document.getElementById('panel-btn'))).toBe(true);
  });
});
