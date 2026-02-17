import type { Socket } from "socket.io";

export interface AuthenticatedSocket extends Socket {
  data: {
    userId?: string;
  };
}
