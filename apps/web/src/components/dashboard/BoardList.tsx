"use client";

import type { BoardsState } from "@/hooks/useBoards";
import { BoardCard } from "./BoardCard";
import type { Board } from "@collabboard/shared";

export interface BoardListProps {
  state: BoardsState;
  onDelete: (board: Board) => void;
}

export function BoardList({ state, onDelete }: BoardListProps) {
  if (state.status === "loading") {
    return (
      <div className="flex justify-center py-12" role="status" aria-label="Loading boards">
        <div className="h-8 w-8 animate-spin rounded-full border-2 border-gray-300 border-t-blue-600" />
      </div>
    );
  }

  if (state.status === "error") {
    return (
      <div
        className="rounded-lg border border-red-200 bg-red-50 p-4 text-red-800"
        role="alert"
      >
        <p className="font-medium">Failed to load boards</p>
        <p className="mt-1 text-sm">{state.error}</p>
      </div>
    );
  }

  if (state.status === "empty") {
    return (
      <div className="rounded-lg border border-dashed border-gray-300 bg-gray-50 p-8 text-center text-gray-600">
        <p className="font-medium">No boards yet</p>
        <p className="mt-1 text-sm">Create your first board to get started.</p>
      </div>
    );
  }

  return (
    <ul className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3" role="list">
      {state.boards.map((board) => (
        <li key={board.id}>
          <BoardCard board={board} onDelete={onDelete} />
        </li>
      ))}
    </ul>
  );
}
