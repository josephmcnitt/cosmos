/**
 * True when a keyboard event targets a text-entry surface (inputs, textareas,
 * selects, contenteditable) or the bug-catcher playtest panel — gameplay key
 * handlers must ignore these so typing notes never walks the avatar, rotates
 * puzzle rings, or opens panels.
 */
export function isTypingTarget(target: EventTarget | null): boolean {
  if (!(target instanceof Element)) return false;
  if (target.closest('#bug-catcher-panel')) return true;
  if (target instanceof HTMLInputElement || target instanceof HTMLTextAreaElement) return true;
  if (target instanceof HTMLSelectElement) return true;
  return (target as HTMLElement).isContentEditable;
}
