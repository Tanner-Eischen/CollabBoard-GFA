"use client";

import { useState } from "react";
import { useBoards } from "@/hooks/useBoards";
import { BoardList } from "./BoardList";
import { NewBoardButton } from "./NewBoardButton";
import { DeleteBoardModal } from "./DeleteBoardModal";
import { useToast } from "@/components/ui/Toast";
import type { Board } from "@collabboard/shared";

export interface DashboardContentProps {
  userEmail?: string | null;
  userName?: string | null;
}

export function DashboardContent({
  userEmail,
  userName,
}: DashboardContentProps) {
  const { state, createBoard, deleteBoard } = useBoards();
  const { toast } = useToast();
  const [boardToDelete, setBoardToDelete] = useState<Board | null>(null);
  const [isDeleting, setIsDeleting] = useState(false);

  const handleDeleteClick = (board: Board) => {
    setBoardToDelete(board);
  };

  const handleDeleteConfirm = async (board: Board) => {
    setIsDeleting(true);
    try {
      await deleteBoard(board.id);
      toast("Board deleted", "success");
      setBoardToDelete(null);
    } catch (err) {
      toast(
        err instanceof Error ? err.message : "Failed to delete board",
        "error"
      );
    } finally {
      setIsDeleting(false);
    }
  };

  const handleDeleteCancel = () => {
    setBoardToDelete(null);
  };

  const displayName = userName ?? userEmail ?? "User";

  return (
    <main className="min-h-screen bg-gray-50">
      <div className="mx-auto max-w-5xl px-4 py-8 sm:px-6 lg:px-8">
        <div className="mb-8 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <h1 className="text-2xl font-semibold text-gray-900">Dashboard</h1>
            <p className="mt-1 text-gray-600">Signed in as {displayName}</p>
          </div>
          <NewBoardButton
            onCreateBoard={createBoard}
            disabled={state.status === "loading"}
          />
        </div>

        <BoardList state={state} onDelete={handleDeleteClick} />
      </div>

      <DeleteBoardModal
        board={boardToDelete}
        onConfirm={handleDeleteConfirm}
        onCancel={handleDeleteCancel}
        isDeleting={isDeleting}
      />
    </main>
  );
}
