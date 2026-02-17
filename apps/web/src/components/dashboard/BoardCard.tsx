"use client";

import Link from "next/link";
import type { Board } from "@collabboard/shared";
import { Button } from "@/components/ui/Button";
import { useToast } from "@/components/ui/Toast";

export interface BoardCardProps {
  board: Board;
  onDelete: (board: Board) => void;
}

function getShareUrl(shareLink: string): string {
  if (typeof window === "undefined") return "";
  return `${window.location.origin}/share/${shareLink}`;
}

export function BoardCard({ board, onDelete }: BoardCardProps) {
  const { toast } = useToast();

  const handleCopyShareLink = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    const url = getShareUrl(board.shareLink);
    void navigator.clipboard.writeText(url).then(() => {
      toast("Share link copied to clipboard", "success");
    });
  };

  const handleDeleteClick = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    onDelete(board);
  };

  return (
    <div className="group flex flex-col rounded-lg border border-gray-200 bg-white p-4 shadow-sm transition-shadow hover:shadow-md">
      <Link
        href={`/board/${board.id}`}
        className="flex flex-1 flex-col gap-2 text-left"
      >
        <h3 className="font-medium text-gray-900">{board.name}</h3>
        <p className="text-xs text-gray-500">
          Updated {new Date(board.updatedAt).toLocaleDateString()}
        </p>
      </Link>
      <div className="mt-3 flex items-center gap-2 border-t border-gray-100 pt-3">
        <Button
          variant="ghost"
          className="text-xs"
          onClick={handleCopyShareLink}
          aria-label="Copy share link"
        >
          Copy link
        </Button>
        <Button
          variant="ghost"
          className="text-xs text-red-600 hover:bg-red-50 hover:text-red-700"
          onClick={handleDeleteClick}
          aria-label={`Delete ${board.name}`}
        >
          Delete
        </Button>
      </div>
    </div>
  );
}
