export type { UserProfile } from "./types/user.js";
export type {
  Board,
  CreateBoardInput,
  UpdateBoardInput,
} from "./types/board.js";
export type {
  CanvasObject,
  CreateObjectInput,
  UpdateObjectInput,
} from "./types/objects.js";
export type {
  UserPresence,
  CursorPosition,
  CursorMovePayload,
  CursorUpdatePayload,
  BoardJoinPayload,
  BoardLeavePayload,
  UserJoinedPayload,
  UserLeftPayload,
  UsersListPayload,
  ObjectsListPayload,
  ObjectCreatedPayload,
  ObjectUpdatedPayload,
  ObjectDeletedPayload,
} from "./types/socket-events.js";
