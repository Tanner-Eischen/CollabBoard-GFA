import { describe, expect, it } from "vitest";
import {
  isModPressed,
  isShiftPressed,
  isAltPressed,
  normalizeKey,
  matchesShortcut,
  shortcutLabel,
} from "@/lib/utils/shortcuts";

function makeEvent(overrides: Partial<KeyboardEvent> = {}): KeyboardEvent {
  return {
    key: "a",
    ctrlKey: false,
    metaKey: false,
    shiftKey: false,
    altKey: false,
    preventDefault: () => {},
    ...overrides,
  } as KeyboardEvent;
}

describe("shortcuts", () => {
  describe("isModPressed", () => {
    it("returns true when ctrlKey is pressed", () => {
      expect(isModPressed(makeEvent({ ctrlKey: true }))).toBe(true);
    });
    it("returns true when metaKey is pressed", () => {
      expect(isModPressed(makeEvent({ metaKey: true }))).toBe(true);
    });
    it("returns false when neither modifier is pressed", () => {
      expect(isModPressed(makeEvent())).toBe(false);
    });
  });

  describe("isShiftPressed", () => {
    it("returns true when shiftKey is pressed", () => {
      expect(isShiftPressed(makeEvent({ shiftKey: true }))).toBe(true);
    });
    it("returns false when shiftKey is not pressed", () => {
      expect(isShiftPressed(makeEvent())).toBe(false);
    });
  });

  describe("isAltPressed", () => {
    it("returns true when altKey is pressed", () => {
      expect(isAltPressed(makeEvent({ altKey: true }))).toBe(true);
    });
  });

  describe("normalizeKey", () => {
    it("lowercases keys", () => {
      expect(normalizeKey("A")).toBe("a");
      expect(normalizeKey("V")).toBe("v");
    });
  });

  describe("matchesShortcut", () => {
    it("matches single key without modifier", () => {
      const e = makeEvent({ key: "v", ctrlKey: false, metaKey: false });
      expect(matchesShortcut(e, { key: "v" })).toBe(true);
      expect(matchesShortcut(e, { key: "V" })).toBe(true);
    });

    it("matches Ctrl+A", () => {
      const e = makeEvent({ key: "a", ctrlKey: true });
      expect(matchesShortcut(e, { key: "a", ctrl: true })).toBe(true);
    });

    it("matches Meta+A (Cmd on Mac)", () => {
      const e = makeEvent({ key: "a", metaKey: true });
      expect(matchesShortcut(e, { key: "a", ctrl: true })).toBe(true);
    });

    it("rejects when modifier required but not pressed", () => {
      const e = makeEvent({ key: "a", ctrlKey: false });
      expect(matchesShortcut(e, { key: "a", ctrl: true })).toBe(false);
    });

    it("rejects when modifier not wanted but pressed", () => {
      const e = makeEvent({ key: "v", ctrlKey: true });
      expect(matchesShortcut(e, { key: "v" })).toBe(false);
    });

    it("rejects wrong key", () => {
      const e = makeEvent({ key: "b", ctrlKey: true });
      expect(matchesShortcut(e, { key: "a", ctrl: true })).toBe(false);
    });

    it("respects shift key", () => {
      const e = makeEvent({ key: "a", ctrlKey: true, shiftKey: true });
      expect(matchesShortcut(e, { key: "a", ctrl: true, shift: true })).toBe(true);
      expect(matchesShortcut(e, { key: "a", ctrl: true, shift: false })).toBe(false);
    });
  });

  describe("shortcutLabel", () => {
    it("returns string (platform-dependent)", () => {
      const result = shortcutLabel("Ctrl+A");
      expect(typeof result).toBe("string");
      expect(result.length).toBeGreaterThan(0);
    });
  });
});
