import { describe, expect, it } from "vitest";
import {
  zoomAtPoint,
  zoomStepFactor,
  scaleToPercent,
} from "@/lib/konva/stage";
import { MIN_ZOOM, MAX_ZOOM } from "@/stores/canvasStore";

describe("stage utilities", () => {
  describe("zoomAtPoint", () => {
    it("zooms in when direction is 1", () => {
      const result = zoomAtPoint({
        pointer: { x: 100, y: 100 },
        stagePosition: { x: 0, y: 0 },
        currentScale: 1,
        direction: 1,
      });
      expect(result.scale).toBeGreaterThan(1);
      expect(result.position).toBeDefined();
    });

    it("zooms out when direction is -1", () => {
      const result = zoomAtPoint({
        pointer: { x: 100, y: 100 },
        stagePosition: { x: 0, y: 0 },
        currentScale: 1,
        direction: -1,
      });
      expect(result.scale).toBeLessThan(1);
    });

    it("clamps scale to MIN_ZOOM and MAX_ZOOM", () => {
      const zoomOut = zoomAtPoint({
        pointer: { x: 0, y: 0 },
        stagePosition: { x: 0, y: 0 },
        currentScale: MIN_ZOOM,
        direction: -1,
      });
      expect(zoomOut.scale).toBe(MIN_ZOOM);

      const zoomIn = zoomAtPoint({
        pointer: { x: 0, y: 0 },
        stagePosition: { x: 0, y: 0 },
        currentScale: MAX_ZOOM,
        direction: 1,
      });
      expect(zoomIn.scale).toBe(MAX_ZOOM);
    });
  });

  describe("zoomStepFactor", () => {
    it("returns > 1 for zoom in", () => {
      expect(zoomStepFactor(1)).toBeGreaterThan(1);
    });
    it("returns < 1 for zoom out", () => {
      expect(zoomStepFactor(-1)).toBeLessThan(1);
    });
  });

  describe("scaleToPercent", () => {
    it("converts scale to percentage", () => {
      expect(scaleToPercent(1)).toBe(100);
      expect(scaleToPercent(0.5)).toBe(50);
      expect(scaleToPercent(2)).toBe(200);
    });
  });
});
