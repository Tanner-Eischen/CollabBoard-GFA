/**
 * Shared board types for CollabBoard.
 * Used by both frontend and backend.
 */

export interface Board {
  id: string;
  name: string;
  shareLink: string;
  ownerId: string;
  createdAt: string;
  updatedAt: string;
}

export interface CreateBoardInput {
  name?: string;
}

export interface UpdateBoardInput {
  name?: string;
}
