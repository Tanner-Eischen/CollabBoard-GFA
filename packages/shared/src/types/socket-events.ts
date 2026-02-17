/**
 * Shared socket event payload types for CollabBoard.
 * Canonical contract source - mirrors ARCHITECTURE.md.
 */

export interface UserPresence {
  userId: string;
  displayName: string;
  color: string;
  avatarUrl?: string | null;
}

export interface CursorPosition {
  x: number;
  y: number;
}

export interface CursorMovePayload {
  boardId: string;
  x: number;
  y: number;
}

export interface CursorUpdatePayload extends CursorPosition {
  userId: string;
  displayName: string;
  color: string;
}

export interface BoardJoinPayload {
  boardId: string;
  displayName?: string;
  color?: string;
}

export interface BoardLeavePayload {
  boardId: string;
}

export interface UserJoinedPayload {
  user: UserPresence;
}

export interface UserLeftPayload {
  userId: string;
}

export interface UsersListPayload {
  users: UserPresence[];
}

/** Object sync events - all include timestamp for ordering/conflict resolution */
export interface ObjectsListPayload {
  objects: Array<{
    id: string;
    type: string;
    data: Record<string, unknown>;
    x: number;
    y: number;
    width: number | null;
    height: number | null;
    rotation: number;
    zIndex: number;
    boardId: string;
    createdAt: string;
    updatedAt: string;
  }>;
  boardId: string;
  timestamp: string;
}

export interface ObjectCreatedPayload {
  object: {
    id: string;
    type: string;
    data: Record<string, unknown>;
    x: number;
    y: number;
    width: number | null;
    height: number | null;
    rotation: number;
    zIndex: number;
    boardId: string;
    createdAt: string;
    updatedAt: string;
  };
  boardId: string;
  timestamp: string;
}

export interface ObjectUpdatedPayload {
  object: {
    id: string;
    type: string;
    data: Record<string, unknown>;
    x: number;
    y: number;
    width: number | null;
    height: number | null;
    rotation: number;
    zIndex: number;
    boardId: string;
    createdAt: string;
    updatedAt: string;
  };
  boardId: string;
  timestamp: string;
}

export interface ObjectDeletedPayload {
  id: string;
  boardId: string;
  timestamp: string;
}
