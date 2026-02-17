"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/Button";
import { useToast } from "@/components/ui/Toast";

export interface NewBoardButtonProps {
  onCreateBoard: (name?: string) => Promise<{ id: string }>;
  disabled?: boolean;
}

export function NewBoardButton({
  onCreateBoard,
  disabled = false,
}: NewBoardButtonProps) {
  const [isCreating, setIsCreating] = useState(false);
  const { toast } = useToast();
  const router = useRouter();

  const handleCreate = async () => {
    if (isCreating || disabled) return;
    setIsCreating(true);
    try {
      const board = await onCreateBoard();
      toast("Board created", "success");
      router.push(`/board/${board.id}`);
    } catch (err) {
      toast(
        err instanceof Error ? err.message : "Failed to create board",
        "error"
      );
    } finally {
      setIsCreating(false);
    }
  };

  return (
    <Button
      onClick={handleCreate}
      disabled={disabled || isCreating}
      aria-label="Create new board"
    >
      {isCreating ? "Creating…" : "New board"}
    </Button>
  );
}
