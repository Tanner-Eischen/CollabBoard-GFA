/**
 * Object templates for the Object Library.
 * Default dimensions and data match canvas object components.
 */

import type { CreateObjectInput } from "@collabboard/shared";

export interface ObjectTemplate {
  type: string;
  label: string;
  /** Preview icon: "rect" | "circle" | "text" | "sticky" | "line" | "arrow" | "image" */
  icon: string;
  /** Create input factory - boardId and x,y are set by useDragCreate */
  getDefaultInput: (boardId: string, x: number, y: number) => CreateObjectInput;
}

export const OBJECT_TEMPLATES: ObjectTemplate[] = [
  {
    type: "rectangle",
    label: "Rectangle",
    icon: "rect",
    getDefaultInput: (boardId, x, y) => ({
      boardId,
      type: "rectangle",
      x,
      y,
      width: 120,
      height: 80,
      data: { fill: "#3b82f6", stroke: "#1d4ed8" },
    }),
  },
  {
    type: "circle",
    label: "Circle",
    icon: "circle",
    getDefaultInput: (boardId, x, y) => ({
      boardId,
      type: "circle",
      x,
      y,
      width: 100,
      height: 100,
      data: { fill: "#22c55e", stroke: "#15803d" },
    }),
  },
  {
    type: "text",
    label: "Text",
    icon: "text",
    getDefaultInput: (boardId, x, y) => ({
      boardId,
      type: "text",
      x,
      y,
      width: 120,
      height: 40,
      data: { text: "Text", fontSize: 16, fill: "#1f2937" },
    }),
  },
  {
    type: "sticky",
    label: "Sticky Note",
    icon: "sticky",
    getDefaultInput: (boardId, x, y) => ({
      boardId,
      type: "sticky",
      x,
      y,
      width: 160,
      height: 120,
      data: { text: "Note", color: "#fef08a" },
    }),
  },
  {
    type: "line",
    label: "Line",
    icon: "line",
    getDefaultInput: (boardId, x, y) => ({
      boardId,
      type: "line",
      x,
      y,
      width: 100,
      height: null,
      data: { stroke: "#6b7280" },
    }),
  },
  {
    type: "arrow",
    label: "Arrow",
    icon: "arrow",
    getDefaultInput: (boardId, x, y) => ({
      boardId,
      type: "arrow",
      x,
      y,
      width: 100,
      height: null,
      data: { stroke: "#6b7280" },
    }),
  },
  {
    type: "image-placeholder",
    label: "Image",
    icon: "image",
    getDefaultInput: (boardId, x, y) => ({
      boardId,
      type: "image-placeholder",
      x,
      y,
      width: 120,
      height: 80,
      data: {},
    }),
  },
];
