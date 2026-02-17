import { renderHook, act } from "@testing-library/react";
import { describe, expect, it, beforeEach } from "vitest";
import { useZoom } from "@/hooks/useZoom";
import { useCanvasStore } from "@/stores/canvasStore";

describe("useZoom", () => {
  beforeEach(() => {
    useCanvasStore.setState({
      position: { x: 0, y: 0 },
      scale: 1,
      viewportSize: { width: 800, height: 600 },
    });
  });

  it("returns scale and zoomPercent", () => {
    const { result } = renderHook(() => useZoom());
    expect(result.current.scale).toBe(1);
    expect(result.current.zoomPercent).toBe(100);
  });

  it("zoomIn increases scale", () => {
    const { result } = renderHook(() => useZoom());
    act(() => {
      result.current.zoomIn();
    });
    expect(result.current.scale).toBeGreaterThan(1);
  });

  it("zoomOut decreases scale", () => {
    const { result } = renderHook(() => useZoom());
    act(() => {
      result.current.zoomOut();
    });
    expect(result.current.scale).toBeLessThan(1);
  });

  it("zoomToFit resets to 100%", () => {
    useCanvasStore.setState({ scale: 2, position: { x: 100, y: 100 } });
    const { result } = renderHook(() => useZoom());
    act(() => {
      result.current.zoomToFit();
    });
    expect(result.current.scale).toBe(1);
    expect(useCanvasStore.getState().position).toEqual({ x: 0, y: 0 });
  });
});
