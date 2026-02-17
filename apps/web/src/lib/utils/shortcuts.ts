/**
 * Cross-platform keyboard shortcut utilities.
 * Abstracts Ctrl (Windows/Linux) vs Cmd (macOS) for modifier keys.
 */

/** Primary modifier: Ctrl on Windows/Linux, Meta (Cmd) on macOS */
export const MOD = typeof navigator !== "undefined" && /Mac|iPod|iPhone|iPad/.test(navigator.platform)
  ? "Meta"
  : "Control";

/** Check if the primary modifier (Ctrl/Cmd) is pressed */
export function isModPressed(e: { ctrlKey: boolean; metaKey: boolean }): boolean {
  return e.ctrlKey || e.metaKey;
}

/** Check if Shift is pressed */
export function isShiftPressed(e: { shiftKey: boolean }): boolean {
  return e.shiftKey;
}

/** Check if Alt/Option is pressed */
export function isAltPressed(e: { altKey: boolean }): boolean {
  return e.altKey;
}

/** Human-readable shortcut label (e.g. "Ctrl+A" or "⌘A" on Mac) */
export function shortcutLabel(keys: string): string {
  if (typeof navigator === "undefined") return keys;
  const isMac = /Mac|iPod|iPhone|iPad/.test(navigator.platform);
  return keys
    .replace(/\bCtrl\b/gi, isMac ? "⌘" : "Ctrl")
    .replace(/\bMeta\b/gi, isMac ? "⌘" : "Ctrl");
}

/** Normalize key for comparison (lowercase, handle special keys) */
export function normalizeKey(key: string): string {
  return key.toLowerCase();
}

export type ShortcutDef = {
  key: string;
  ctrl?: boolean;
  meta?: boolean;
  shift?: boolean;
  alt?: boolean;
};

/**
 * Check if a keyboard event matches a shortcut definition.
 * ctrl/meta are treated as "primary modifier" - either satisfies.
 */
export function matchesShortcut(e: KeyboardEvent, def: ShortcutDef): boolean {
  const keyMatch = normalizeKey(e.key) === normalizeKey(def.key);
  if (!keyMatch) return false;

  const modRequired = def.ctrl ?? def.meta ?? false;
  const modOk = modRequired ? isModPressed(e) : !isModPressed(e);
  const shiftOk = def.shift === undefined ? true : e.shiftKey === def.shift;
  const altOk = def.alt === undefined ? true : e.altKey === def.alt;

  return modOk && shiftOk && altOk;
}
