import { create } from "zustand";

export type ToolType = "select" | "text" | "rectangle" | "circle" | "line" | "connector" | "sticky" | "frame";

export interface ToolConfig {
  type: ToolType;
  label: string;
  shortcut: string;
}

export const TOOL_CONFIGS: ToolConfig[] = [
  { type: "select", label: "Select", shortcut: "V" },
  { type: "text", label: "Text", shortcut: "T" },
  { type: "rectangle", label: "Rectangle", shortcut: "R" },
  { type: "circle", label: "Circle", shortcut: "O" },
  { type: "line", label: "Line", shortcut: "L" },
  { type: "connector", label: "Connector", shortcut: "C" },
  { type: "sticky", label: "Sticky Note", shortcut: "S" },
  { type: "frame", label: "Frame", shortcut: "F" },
];

export const TOOL_BY_SHORTCUT: Record<string, ToolType> = Object.fromEntries(
  TOOL_CONFIGS.map((c) => [c.shortcut.toLowerCase(), c.type])
);

export interface ToolState {
  activeTool: ToolType;
}

export interface ToolActions {
  setActiveTool: (tool: ToolType) => void;
}

export const useToolStore = create<ToolState & ToolActions>()((set) => ({
  activeTool: "select",

  setActiveTool: (tool) => set({ activeTool: tool }),
}));
