import { describe, expect, it, beforeEach } from "vitest";
import { usePresenceStore } from "@/stores/presenceStore";

describe("presenceStore", () => {
  beforeEach(() => {
    usePresenceStore.getState().reset();
  });

  it("setUsers replaces users list", () => {
    const store = usePresenceStore.getState();
    store.setUsers([
      { userId: "u1", displayName: "Alice", color: "#ff0000" },
      { userId: "u2", displayName: "Bob", color: "#00ff00" },
    ]);
    expect(usePresenceStore.getState().users).toHaveLength(2);
  });

  it("addUser adds user if not present", () => {
    const store = usePresenceStore.getState();
    store.addUser({ userId: "u1", displayName: "Alice", color: "#ff0000" });
    store.addUser({ userId: "u2", displayName: "Bob", color: "#00ff00" });
    expect(usePresenceStore.getState().users).toHaveLength(2);
  });

  it("addUser does not duplicate same userId", () => {
    const store = usePresenceStore.getState();
    store.addUser({ userId: "u1", displayName: "Alice", color: "#ff0000" });
    store.addUser({ userId: "u1", displayName: "Alice", color: "#ff0000" });
    expect(usePresenceStore.getState().users).toHaveLength(1);
  });

  it("removeUser removes user and their cursor", () => {
    const store = usePresenceStore.getState();
    store.addUser({ userId: "u1", displayName: "Alice", color: "#ff0000" });
    store.setCursor("u1", {
      userId: "u1",
      x: 10,
      y: 20,
      displayName: "Alice",
      color: "#ff0000",
    });
    store.removeUser("u1");
    expect(usePresenceStore.getState().users).toHaveLength(0);
    expect(usePresenceStore.getState().cursors.has("u1")).toBe(false);
  });

  it("setCursor and removeCursor update cursors map", () => {
    const store = usePresenceStore.getState();
    store.setCursor("u1", {
      userId: "u1",
      x: 5,
      y: 10,
      displayName: "Alice",
      color: "#ff0000",
    });
    expect(usePresenceStore.getState().cursors.get("u1")?.x).toBe(5);
    store.removeCursor("u1");
    expect(usePresenceStore.getState().cursors.has("u1")).toBe(false);
  });

  it("reset clears all state", () => {
    const store = usePresenceStore.getState();
    store.addUser({ userId: "u1", displayName: "Alice", color: "#ff0000" });
    store.setCursor("u1", {
      userId: "u1",
      x: 0,
      y: 0,
      displayName: "Alice",
      color: "#ff0000",
    });
    store.reset();
    expect(usePresenceStore.getState().users).toHaveLength(0);
    expect(usePresenceStore.getState().cursors.size).toBe(0);
  });
});
