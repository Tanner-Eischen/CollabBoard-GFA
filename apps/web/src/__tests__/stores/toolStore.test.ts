import { describe, expect, it, beforeEach } from "vitest";
import {
  useToolStore,
  TOOL_CONFIGS,
  TOOL_BY_SHORTCUT,
  type ToolType,
} from "@/stores/toolStore";

describe("toolStore", () => {
  beforeEach(() => {
    useToolStore.setState({ activeTool: "select" });
  });

  it("has select as default tool", () => {
    expect(useToolStore.getState().activeTool).toBe("select");
  });

  it("setActiveTool updates tool", () => {
    const tools: ToolType[] = [
      "select",
      "text",
      "rectangle",
      "circle",
      "line",
      "connector",
      "sticky",
      "frame",
    ];
    for (const tool of tools) {
      useToolStore.getState().setActiveTool(tool);
      expect(useToolStore.getState().activeTool).toBe(tool);
    }
  });

  it("TOOL_CONFIGS includes all tools with labels and shortcuts", () => {
    expect(TOOL_CONFIGS).toHaveLength(8);
    const types = TOOL_CONFIGS.map((c) => c.type);
    expect(types).toContain("select");
    expect(types).toContain("text");
    expect(types).toContain("rectangle");
    expect(types).toContain("circle");
    expect(types).toContain("line");
    expect(types).toContain("connector");
    expect(types).toContain("sticky");
    expect(types).toContain("frame");
    TOOL_CONFIGS.forEach((c) => {
      expect(c.label).toBeTruthy();
      expect(c.shortcut).toBeTruthy();
    });
  });

  it("TOOL_BY_SHORTCUT maps lowercase keys to tools", () => {
    expect(TOOL_BY_SHORTCUT.v).toBe("select");
    expect(TOOL_BY_SHORTCUT.t).toBe("text");
    expect(TOOL_BY_SHORTCUT.r).toBe("rectangle");
    expect(TOOL_BY_SHORTCUT.o).toBe("circle");
    expect(TOOL_BY_SHORTCUT.l).toBe("line");
    expect(TOOL_BY_SHORTCUT.c).toBe("connector");
    expect(TOOL_BY_SHORTCUT.s).toBe("sticky");
    expect(TOOL_BY_SHORTCUT.f).toBe("frame");
  });
});
