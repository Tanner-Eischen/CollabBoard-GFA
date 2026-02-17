import { create } from "zustand";

export const MIN_ZOOM = 0.1;
export const MAX_ZOOM = 4;
export const DEFAULT_ZOOM = 1;
export const ZOOM_STEP = 0.1;

export interface CanvasPosition {
  x: number;
  y: number;
}

export interface CanvasState {
  position: CanvasPosition;
  scale: number;
  gridVisible: boolean;
  viewportSize: { width: number; height: number };
}

export interface CanvasActions {
  setPosition: (position: CanvasPosition | ((prev: CanvasPosition) => CanvasPosition)) => void;
  setScale: (scale: number | ((prev: number) => number)) => void;
  setGridVisible: (visible: boolean) => void;
  setViewportSize: (size: { width: number; height: number }) => void;
  reset: () => void;
}

const clampScale = (scale: number) =>
  Math.max(MIN_ZOOM, Math.min(MAX_ZOOM, scale));

const initialState: CanvasState = {
  position: { x: 0, y: 0 },
  scale: DEFAULT_ZOOM,
  gridVisible: true,
  viewportSize: { width: 0, height: 0 },
};

export const useCanvasStore = create<CanvasState & CanvasActions>()((set) => ({
  ...initialState,

  setPosition: (position) =>
    set((state) => ({
      position:
        typeof position === "function" ? position(state.position) : position,
    })),

  setScale: (scale) =>
    set((state) => {
      const next =
        typeof scale === "function" ? scale(state.scale) : scale;
      return { scale: clampScale(next) };
    }),

  setGridVisible: (visible) => set({ gridVisible: visible }),

  setViewportSize: (size) => set({ viewportSize: size }),

  reset: () => set(initialState),
}));
