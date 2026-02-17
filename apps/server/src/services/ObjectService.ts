import type { ObjectRecord } from "../repositories/ObjectRepository.js";
import * as ObjectRepo from "../repositories/ObjectRepository.js";
import * as BoardService from "./BoardService.js";

export type CreateObjectInput = {
  boardId: string;
  type: string;
  data?: unknown;
  x: number;
  y: number;
  width?: number | null;
  height?: number | null;
  rotation?: number;
  zIndex?: number;
};

export type UpdateObjectInput = {
  type?: string;
  data?: unknown;
  x?: number;
  y?: number;
  width?: number | null;
  height?: number | null;
  rotation?: number;
  zIndex?: number;
};

export async function createObject(
  userId: string,
  input: CreateObjectInput
): Promise<ObjectRecord | null> {
  const board = await BoardService.getBoardById(input.boardId);
  if (!board || !BoardService.isOwner(board, userId)) return null;
  return ObjectRepo.createObject({
    type: input.type,
    data: input.data,
    x: input.x,
    y: input.y,
    width: input.width,
    height: input.height,
    rotation: input.rotation,
    zIndex: input.zIndex,
    boardId: input.boardId,
  });
}

export async function getObjectById(
  userId: string,
  id: string
): Promise<ObjectRecord | null> {
  const obj = await ObjectRepo.findObjectById(id);
  if (!obj) return null;
  const board = await BoardService.getBoardById(obj.boardId);
  if (!board || !BoardService.isOwner(board, userId)) return null;
  return obj;
}

export async function listObjectsByBoardId(
  userId: string,
  boardId: string
): Promise<ObjectRecord[]> {
  const board = await BoardService.getBoardById(boardId);
  if (!board || !BoardService.isOwner(board, userId)) return [];
  return ObjectRepo.findObjectsByBoardId(boardId);
}

export async function updateObject(
  userId: string,
  id: string,
  data: UpdateObjectInput
): Promise<ObjectRecord | null> {
  const obj = await ObjectRepo.findObjectById(id);
  if (!obj) return null;
  const board = await BoardService.getBoardById(obj.boardId);
  if (!board || !BoardService.isOwner(board, userId)) return null;
  return ObjectRepo.updateObject(id, data);
}

export async function deleteObject(
  userId: string,
  id: string
): Promise<boolean> {
  const obj = await ObjectRepo.findObjectById(id);
  if (!obj) return false;
  const board = await BoardService.getBoardById(obj.boardId);
  if (!board || !BoardService.isOwner(board, userId)) return false;
  return ObjectRepo.deleteObject(id);
}

export async function createObjectsBatch(
  userId: string,
  inputs: CreateObjectInput[]
): Promise<ObjectRecord[]> {
  if (inputs.length === 0) return [];
  const boardId = inputs[0]!.boardId;
  if (!inputs.every((i) => i.boardId === boardId)) return [];
  const board = await BoardService.getBoardById(boardId);
  if (!board || !BoardService.isOwner(board, userId)) return [];
  return ObjectRepo.createObjects(
    inputs.map((i) => ({
      type: i.type,
      data: i.data,
      x: i.x,
      y: i.y,
      width: i.width,
      height: i.height,
      rotation: i.rotation,
      zIndex: i.zIndex,
      boardId: i.boardId,
    }))
  );
}

export async function deleteObjectsBatch(
  userId: string,
  ids: string[]
): Promise<number> {
  if (ids.length === 0) return 0;
  const objs = await Promise.all(ids.map((id) => ObjectRepo.findObjectById(id)));
  const validIds: string[] = [];
  for (let i = 0; i < objs.length; i++) {
    const obj = objs[i];
    if (!obj) continue;
    const board = await BoardService.getBoardById(obj.boardId);
    if (board && BoardService.isOwner(board, userId)) {
      validIds.push(obj.id);
    }
  }
  if (validIds.length === 0) return 0;
  return ObjectRepo.deleteObjects(validIds);
}
