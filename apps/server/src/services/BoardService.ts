import * as crypto from "node:crypto";
import type { BoardRecord, CreateResult } from "../repositories/BoardRepository.js";
import * as BoardRepo from "../repositories/BoardRepository.js";

const SHARE_LINK_LENGTH = 12;
const SHARE_LINK_CHARS =
  "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789";
const MAX_COLLISION_ATTEMPTS = 5;

function generateUrlSafeShareLink(): string {
  const bytes = crypto.randomBytes(SHARE_LINK_LENGTH);
  let result = "";
  for (let i = 0; i < SHARE_LINK_LENGTH; i++) {
    result += SHARE_LINK_CHARS[bytes[i]! % SHARE_LINK_CHARS.length];
  }
  return result;
}

export async function generateUniqueShareLink(): Promise<string> {
  for (let attempt = 0; attempt < MAX_COLLISION_ATTEMPTS; attempt++) {
    const shareLink = generateUrlSafeShareLink();
    const exists = await BoardRepo.existsByShareLink(shareLink);
    if (!exists) return shareLink;
  }
  throw new Error("Failed to generate unique share link after retries");
}

export async function createBoard(
  ownerId: string,
  name: string = "Untitled Board"
): Promise<CreateResult> {
  const shareLink = await generateUniqueShareLink();
  return BoardRepo.createBoard({ name, shareLink, ownerId });
}

export async function getBoardById(id: string): Promise<BoardRecord | null> {
  return BoardRepo.findBoardById(id);
}

export async function getBoardByShareLink(
  shareLink: string
): Promise<BoardRecord | null> {
  return BoardRepo.findBoardByShareLink(shareLink);
}

export async function listBoardsByOwner(
  ownerId: string
): Promise<BoardRecord[]> {
  return BoardRepo.findBoardsByOwnerId(ownerId);
}

export async function updateBoard(
  id: string,
  ownerId: string,
  data: { name?: string }
): Promise<BoardRecord | null> {
  const board = await BoardRepo.findBoardById(id);
  if (!board || board.ownerId !== ownerId) return null;
  return BoardRepo.updateBoard(id, data);
}

export async function deleteBoard(
  id: string,
  ownerId: string
): Promise<boolean> {
  const board = await BoardRepo.findBoardById(id);
  if (!board || board.ownerId !== ownerId) return false;
  return BoardRepo.deleteBoard(id);
}

export function isOwner(board: BoardRecord, userId: string): boolean {
  return board.ownerId === userId;
}
