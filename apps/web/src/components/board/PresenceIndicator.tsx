"use client";

import { usePresenceStore } from "@/stores/presenceStore";

/**
 * Displays list of users currently present on the board.
 */
export function PresenceIndicator() {
  const users = usePresenceStore((s) => s.users);

  if (users.length === 0) return null;

  return (
    <div className="flex flex-wrap items-center gap-2 rounded-lg border border-gray-200 bg-white/90 px-3 py-2 shadow-sm">
      <span className="text-xs font-medium text-gray-500">Present:</span>
      {users.map((u) => (
        <div
          key={u.userId}
          className="flex items-center gap-1.5 rounded-full bg-gray-100 px-2 py-0.5"
          title={u.displayName}
        >
          <span
            className="h-2 w-2 shrink-0 rounded-full"
            style={{ backgroundColor: u.color }}
          />
          <span className="max-w-[120px] truncate text-sm text-gray-700">
            {u.displayName}
          </span>
        </div>
      ))}
    </div>
  );
}
