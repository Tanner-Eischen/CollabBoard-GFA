import type { Board, CreateBoardInput, UpdateBoardInput } from "@collabboard/shared";
import { apiClient } from "./client";

const BASE = "/api/boards";

export async function createBoard(
  token: string,
  input?: CreateBoardInput
): Promise<Board> {
  return apiClient<Board>(BASE, {
    method: "POST",
    body: JSON.stringify(input ?? {}),
    token,
  });
}

export async function listBoards(token: string): Promise<Board[]> {
  return apiClient<Board[]>(BASE, { token });
}

export async function getBoard(token: string, id: string): Promise<Board> {
  return apiClient<Board>(`${BASE}/${id}`, { token });
}

export async function getBoardByShareLink(shareLink: string): Promise<Board> {
  return apiClient<Board>(`${BASE}/share/${encodeURIComponent(shareLink)}`);
}

export async function updateBoard(
  token: string,
  id: string,
  input: UpdateBoardInput
): Promise<Board> {
  return apiClient<Board>(`${BASE}/${id}`, {
    method: "PATCH",
    body: JSON.stringify(input),
    token,
  });
}

export async function deleteBoard(
  token: string,
  id: string
): Promise<void> {
  const API_URL = process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:3001";
  const response = await fetch(`${API_URL}${BASE}/${id}`, {
    method: "DELETE",
    headers: {
      Authorization: `Bearer ${token}`,
    },
  });
  if (!response.ok) {
    const body = (await response.json().catch(() => ({}))) as {
      message?: string;
      error?: string;
    };
    throw new Error(body.message ?? body.error ?? `HTTP ${response.status}`);
  }
}
