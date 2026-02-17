"use client";

import { useSession } from "next-auth/react";
import { useCallback, useEffect, useState } from "react";
import type { Board } from "@collabboard/shared";
import * as boardsApi from "@/lib/api/boards";

export type BoardsState =
  | { status: "loading" }
  | { status: "empty"; boards: [] }
  | { status: "success"; boards: Board[] }
  | { status: "error"; error: string };

export function useBoards() {
  const { data: session, status: sessionStatus } = useSession();
  const [state, setState] = useState<BoardsState>({ status: "loading" });

  const token = session?.apiToken ?? null;

  const refetch = useCallback(async () => {
    if (!token) {
      setState({ status: "loading" });
      return;
    }
    try {
      const boards = await boardsApi.listBoards(token);
      setState(
        boards.length === 0
          ? { status: "empty", boards: [] }
          : { status: "success", boards }
      );
    } catch (err) {
      setState({
        status: "error",
        error: err instanceof Error ? err.message : "Failed to load boards",
      });
    }
  }, [token]);

  useEffect(() => {
    if (sessionStatus === "loading") {
      setState({ status: "loading" });
      return;
    }
    if (!token) {
      setState({ status: "loading" });
      return;
    }
    refetch();
  }, [sessionStatus, token, refetch]);

  const createBoard = useCallback(
    async (name?: string) => {
      if (!token) throw new Error("Not authenticated");
      const board = await boardsApi.createBoard(token, { name });
      await refetch();
      return board;
    },
    [token, refetch]
  );

  const deleteBoard = useCallback(
    async (id: string) => {
      if (!token) throw new Error("Not authenticated");
      await boardsApi.deleteBoard(token, id);
      await refetch();
    },
    [token, refetch]
  );

  return {
    state,
    createBoard,
    deleteBoard,
    refetch,
  };
}
