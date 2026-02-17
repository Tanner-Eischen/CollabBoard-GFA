import { describe, expect, it, beforeEach } from "vitest";
import { render, screen } from "@testing-library/react";
import { PropertiesPanel } from "@/components/panels/PropertiesPanel";
import { useSelectionStore } from "@/stores/selectionStore";
import { useObjectStore } from "@/stores/objectStore";

function makeObject(overrides: Partial<{
  id: string;
  type: string;
  x: number;
  y: number;
  width: number | null;
  height: number | null;
}> = {}) {
  return {
    id: "obj-1",
    type: "rectangle",
    data: {},
    x: 10,
    y: 20,
    width: 100,
    height: 80,
    rotation: 0,
    zIndex: 0,
    boardId: "board-1",
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
    ...overrides,
  };
}

describe("PropertiesPanel", () => {
  beforeEach(() => {
    useSelectionStore.getState().clear();
    useObjectStore.getState().clear();
  });

  it("shows no-selection message when nothing selected", () => {
    render(<PropertiesPanel />);

    expect(screen.getByText("Select an object to edit its properties.")).toBeInTheDocument();
  });

  it("shows properties when single object selected", () => {
    useObjectStore.getState().setObjects([makeObject()]);
    useSelectionStore.getState().select("obj-1");

    render(<PropertiesPanel />);

    expect(screen.getByText("Properties")).toBeInTheDocument();
    expect(screen.getByPlaceholderText("X")).toBeInTheDocument();
    expect(screen.getByPlaceholderText("Y")).toBeInTheDocument();
  });

  it("shows multi-select count when multiple selected", () => {
    useObjectStore.getState().setObjects([
      makeObject({ id: "a" }),
      makeObject({ id: "b" }),
    ]);
    useSelectionStore.getState().selectMany(["a", "b"]);

    render(<PropertiesPanel />);

    expect(screen.getByText(/2 selected/)).toBeInTheDocument();
  });
});
