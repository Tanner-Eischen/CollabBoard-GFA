import { describe, expect, it, beforeEach } from "vitest";
import { useSelectionStore } from "@/stores/selectionStore";

describe("selectionStore", () => {
  beforeEach(() => {
    useSelectionStore.getState().clear();
    useSelectionStore.getState().setBoardId(null);
  });

  it("select replaces selection", () => {
    const store = useSelectionStore.getState();
    store.select("a");
    expect(useSelectionStore.getState().selectedIds).toEqual(["a"]);
    store.select("b");
    expect(useSelectionStore.getState().selectedIds).toEqual(["b"]);
  });

  it("selectAdd adds to selection", () => {
    const store = useSelectionStore.getState();
    store.select("a");
    store.selectAdd("b");
    expect(useSelectionStore.getState().selectedIds).toEqual(["a", "b"]);
    store.selectAdd("a");
    expect(useSelectionStore.getState().selectedIds).toEqual(["a", "b"]);
  });

  it("selectRemove removes from selection", () => {
    const store = useSelectionStore.getState();
    store.select("a");
    store.selectMany(["b", "c"]);
    store.selectRemove("b");
    expect(useSelectionStore.getState().selectedIds).toEqual(["a", "c"]);
  });

  it("selectMany adds multiple", () => {
    const store = useSelectionStore.getState();
    store.select("a");
    store.selectMany(["b", "c"]);
    const ids = useSelectionStore.getState().selectedIds;
    expect(ids).toContain("a");
    expect(ids).toContain("b");
    expect(ids).toContain("c");
  });

  it("toggle adds when not selected", () => {
    const store = useSelectionStore.getState();
    store.select("a");
    store.toggle("b");
    const ids = useSelectionStore.getState().selectedIds;
    expect(ids).toContain("a");
    expect(ids).toContain("b");
  });

  it("toggle removes when selected", () => {
    const store = useSelectionStore.getState();
    store.select("a");
    store.toggle("a");
    expect(store.selectedIds).toEqual([]);
  });

  it("clear empties selection", () => {
    const store = useSelectionStore.getState();
    store.selectMany(["a", "b"]);
    store.clear();
    expect(store.selectedIds).toEqual([]);
  });

  it("isSelected returns correct value", () => {
    const store = useSelectionStore.getState();
    store.select("a");
    expect(store.isSelected("a")).toBe(true);
    expect(store.isSelected("b")).toBe(false);
  });
});
