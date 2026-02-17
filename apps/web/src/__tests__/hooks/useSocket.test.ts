import { renderHook, act } from "@testing-library/react";
import { describe, expect, it, vi, beforeEach } from "vitest";
import { useSocket } from "@/hooks/useSocket";

const mockSocket = {
  on: vi.fn().mockReturnThis(),
  off: vi.fn().mockReturnThis(),
  disconnect: vi.fn(),
  connected: false,
};

vi.mock("next-auth/react", () => ({
  useSession: vi.fn(() => ({
    data: { apiToken: "test-token" },
    status: "authenticated",
  })),
}));

vi.mock("@/lib/socket/client", () => ({
  createSocketClient: vi.fn(() => mockSocket),
}));

describe("useSocket", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    mockSocket.connected = false;
  });

  it("returns socket and status", () => {
    const { result } = renderHook(() => useSocket());

    expect(result.current.socket).toBe(mockSocket);
    expect(["connected", "reconnecting", "offline"]).toContain(result.current.status);
  });

  it("sets status to connected when socket connects", () => {
    const { result } = renderHook(() => useSocket());

    const connectCall = vi.mocked(mockSocket.on).mock.calls.find(
      (c) => c[0] === "connect"
    );
    const onConnect = connectCall?.[1] as (() => void) | undefined;

    act(() => {
      onConnect?.();
    });

    expect(result.current.status).toBe("connected");
  });

  it("sets status to reconnecting after disconnect when was connected", () => {
    const { result } = renderHook(() => useSocket());

    const onConnect = vi.mocked(mockSocket.on).mock.calls.find(
      (c) => c[0] === "connect"
    )?.[1] as () => void;
    const onDisconnect = vi.mocked(mockSocket.on).mock.calls.find(
      (c) => c[0] === "disconnect"
    )?.[1] as () => void;

    act(() => {
      onConnect?.();
    });
    expect(result.current.status).toBe("connected");

    act(() => {
      onDisconnect?.();
    });
    expect(result.current.status).toBe("reconnecting");
  });
});
