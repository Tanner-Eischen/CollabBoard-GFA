import { describe, expect, it, beforeEach } from "vitest";
import {
  useCanvasStore,
  MIN_ZOOM,
  MAX_ZOOM,
  DEFAULT_ZOOM,
} from "@/stores/canvasStore";

describe("canvasStore", () => {
  beforeEach(() => {
    useCanvasStore.setState({
      position: { x: 0, y: 0 },
      scale: DEFAULT_ZOOM,
      gridVisible: true,
    });
  });

  it("has correct initial state", () => {
    const state = useCanvasStore.getState();
    expect(state.position).toEqual({ x: 0, y: 0 });
    expect(state.scale).toBe(DEFAULT_ZOOM);
    expect(state.gridVisible).toBe(true);
  });

  it("setPosition updates position", () => {
    useCanvasStore.getState().setPosition({ x: 100, y: 50 });
    expect(useCanvasStore.getState().position).toEqual({ x: 100, y: 50 });
  });

  it("setPosition accepts updater function", () => {
    useCanvasStore.getState().setPosition((prev) => ({
      x: prev.x + 10,
      y: prev.y + 20,
    }));
    expect(useCanvasStore.getState().position).toEqual({ x: 10, y: 20 });
  });

  it("setScale clamps to MIN_ZOOM and MAX_ZOOM", () => {
    useCanvasStore.getState().setScale(0.05);
    expect(useCanvasStore.getState().scale).toBe(MIN_ZOOM);

    useCanvasStore.getState().setScale(10);
    expect(useCanvasStore.getState().scale).toBe(MAX_ZOOM);
  });

  it("setScale accepts updater function", () => {
    useCanvasStore.getState().setScale((prev) => prev * 2);
    expect(useCanvasStore.getState().scale).toBe(2);
  });

  it("setGridVisible toggles grid", () => {
    useCanvasStore.getState().setGridVisible(false);
    expect(useCanvasStore.getState().gridVisible).toBe(false);
    useCanvasStore.getState().setGridVisible(true);
    expect(useCanvasStore.getState().gridVisible).toBe(true);
  });

  it("reset restores initial state", () => {
    useCanvasStore.getState().setPosition({ x: 999, y: 999 });
    useCanvasStore.getState().setScale(2);
    useCanvasStore.getState().setGridVisible(false);
    useCanvasStore.getState().reset();
    expect(useCanvasStore.getState().position).toEqual({ x: 0, y: 0 });
    expect(useCanvasStore.getState().scale).toBe(DEFAULT_ZOOM);
    expect(useCanvasStore.getState().gridVisible).toBe(true);
  });
});
