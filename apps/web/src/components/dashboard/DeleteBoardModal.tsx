"use client";

import type { Board } from "@collabboard/shared";
import { Button } from "@/components/ui/Button";

export interface DeleteBoardModalProps {
  board: Board | null;
  onConfirm: (board: Board) => void | Promise<void>;
  onCancel: () => void;
  isDeleting?: boolean;
}

export function DeleteBoardModal({
  board,
  onConfirm,
  onCancel,
  isDeleting = false,
}: DeleteBoardModalProps) {
  if (!board) return null;

  const handleConfirm = () => {
    void onConfirm(board);
  };

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4"
      role="dialog"
      aria-modal="true"
      aria-labelledby="delete-board-title"
    >
      <div className="w-full max-w-md rounded-lg bg-white p-6 shadow-xl">
        <h2 id="delete-board-title" className="text-lg font-semibold text-gray-900">
          Delete board?
        </h2>
        <p className="mt-2 text-gray-600">
          &quot;{board.name}&quot; will be permanently deleted. This cannot be undone.
        </p>
        <div className="mt-6 flex justify-end gap-3">
          <Button variant="secondary" onClick={onCancel} disabled={isDeleting}>
            Cancel
          </Button>
          <Button
            variant="primary"
            onClick={handleConfirm}
            disabled={isDeleting}
            className="bg-red-600 hover:bg-red-700"
          >
            {isDeleting ? "Deleting…" : "Delete"}
          </Button>
        </div>
      </div>
    </div>
  );
}
