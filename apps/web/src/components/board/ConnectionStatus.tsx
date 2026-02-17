"use client";

import type { ConnectionStatus } from "@/hooks/useSocket";

interface ConnectionStatusProps {
  status: ConnectionStatus;
}

const statusConfig: Record<
  ConnectionStatus,
  { label: string; className: string; dotColor: string }
> = {
  connected: {
    label: "Connected",
    className: "text-green-700",
    dotColor: "bg-green-500",
  },
  reconnecting: {
    label: "Reconnecting…",
    className: "text-amber-700",
    dotColor: "bg-amber-500 animate-pulse",
  },
  offline: {
    label: "Offline",
    className: "text-red-700",
    dotColor: "bg-red-500",
  },
};

/**
 * Displays socket connection status (connected / reconnecting / offline).
 */
export function ConnectionStatus({ status }: ConnectionStatusProps) {
  const config = statusConfig[status];

  return (
    <div
      className={`flex items-center gap-2 rounded-lg border border-gray-200 bg-white/90 px-3 py-2 shadow-sm ${config.className}`}
      title={`Connection: ${config.label}`}
    >
      <span className={`h-2 w-2 shrink-0 rounded-full ${config.dotColor}`} />
      <span className="text-sm font-medium">{config.label}</span>
    </div>
  );
}
