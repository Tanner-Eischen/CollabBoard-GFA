import { describe, expect, it, beforeEach } from "vitest";
import { renderHook, act } from "@testing-library/react";
import { useSelection } from "@/hooks/useSelection";
import { useSelectionStore } from "@/stores/selectionStore";

describe("useSelection", () => {
  beforeEach(() => {
    useSelectionStore.getState().clear();
  });

  it("returns selection state and handlers", () => {
    const { result } = renderHook(() => useSelection());
    expect(result.current.selectedIds).toEqual([]);
    expect(typeof result.current.handleSelect).toBe("function");
    expect(typeof result.current.clear).toBe("function");
  });

  it("handleSelect with addToSelection=false replaces selection", () => {
    const { result } = renderHook(() => useSelection());
    act(() => {
      result.current.handleSelect("a", false);
    });
    expect(result.current.selectedIds).toEqual(["a"]);
    act(() => {
      result.current.handleSelect("b", false);
    });
    expect(result.current.selectedIds).toEqual(["b"]);
  });

  it("handleSelect with addToSelection=true adds to selection", () => {
    const { result } = renderHook(() => useSelection());
    act(() => {
      result.current.handleSelect("a", false);
    });
    act(() => {
      result.current.handleSelect("b", true);
    });
    expect(result.current.selectedIds).toContain("a");
    expect(result.current.selectedIds).toContain("b");
  });
});
