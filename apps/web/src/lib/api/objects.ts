import type {
  CanvasObject,
  CreateObjectInput,
  UpdateObjectInput,
} from "@collabboard/shared";
import { apiClient } from "./client";

const BASE = "/api/objects";

export async function createObject(
  token: string,
  input: CreateObjectInput
): Promise<CanvasObject> {
  return apiClient<CanvasObject>(BASE, {
    method: "POST",
    body: JSON.stringify(input),
    token,
  });
}

export async function listObjects(
  token: string,
  boardId: string
): Promise<CanvasObject[]> {
  return apiClient<CanvasObject[]>(`${BASE}?boardId=${encodeURIComponent(boardId)}`, {
    token,
  });
}

export async function getObject(
  token: string,
  id: string
): Promise<CanvasObject> {
  return apiClient<CanvasObject>(`${BASE}/${id}`, { token });
}

export async function updateObject(
  token: string,
  id: string,
  input: UpdateObjectInput
): Promise<CanvasObject> {
  return apiClient<CanvasObject>(`${BASE}/${id}`, {
    method: "PATCH",
    body: JSON.stringify(input),
    token,
  });
}

export async function deleteObject(
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

export async function createObjectsBatch(
  token: string,
  objects: CreateObjectInput[]
): Promise<CanvasObject[]> {
  return apiClient<CanvasObject[]>(`${BASE}/batch`, {
    method: "POST",
    body: JSON.stringify({ objects }),
    token,
  });
}

export async function updateObjectsBatch(
  token: string,
  updates: Array<{ id: string; data: UpdateObjectInput }>
): Promise<Array<{ id: string; object?: CanvasObject }>> {
  return apiClient<Array<{ id: string; object?: CanvasObject }>>(
    `${BASE}/batch`,
    {
      method: "PATCH",
      body: JSON.stringify({ updates }),
      token,
    }
  );
}

export async function deleteObjectsBatch(
  token: string,
  ids: string[]
): Promise<{ deleted: number }> {
  return apiClient<{ deleted: number }>(`${BASE}/batch`, {
    method: "DELETE",
    body: JSON.stringify({ ids }),
    token,
  });
}
