import { prisma } from "../lib/prisma.js";

export interface BoardRecord {
  id: string;
  name: string;
  shareLink: string;
  ownerId: string;
  createdAt: Date;
  updatedAt: Date;
}

export type CreateResult = BoardRecord;

export async function createBoard(data: {
  name: string;
  shareLink: string;
  ownerId: string;
}): Promise<CreateResult> {
  const board = await prisma.board.create({
    data: {
      name: data.name,
      shareLink: data.shareLink,
      ownerId: data.ownerId,
    },
  });
  return {
    id: board.id,
    name: board.name,
    shareLink: board.shareLink,
    ownerId: board.ownerId,
    createdAt: board.createdAt,
    updatedAt: board.updatedAt,
  };
}

export async function findBoardById(id: string): Promise<BoardRecord | null> {
  const board = await prisma.board.findUnique({
    where: { id },
  });
  return board;
}

export async function findBoardByShareLink(
  shareLink: string
): Promise<BoardRecord | null> {
  const board = await prisma.board.findUnique({
    where: { shareLink },
  });
  return board;
}

export async function findBoardsByOwnerId(
  ownerId: string
): Promise<BoardRecord[]> {
  const boards = await prisma.board.findMany({
    where: { ownerId },
    orderBy: { updatedAt: "desc" },
  });
  return boards;
}

export async function updateBoard(
  id: string,
  data: { name?: string }
): Promise<BoardRecord | null> {
  const board = await prisma.board.update({
    where: { id },
    data,
  });
  return board;
}

export async function deleteBoard(id: string): Promise<boolean> {
  try {
    await prisma.board.delete({
      where: { id },
    });
    return true;
  } catch {
    return false;
  }
}

export async function existsByShareLink(shareLink: string): Promise<boolean> {
  const count = await prisma.board.count({
    where: { shareLink },
  });
  return count > 0;
}
