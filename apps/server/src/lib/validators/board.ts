import { z } from "zod";

export const createBoardSchema = z.object({
  name: z.string().min(1).max(255).optional().default("Untitled Board"),
});

export const updateBoardSchema = z.object({
  name: z.string().min(1).max(255),
});

export const boardIdParamSchema = z.object({
  id: z.string().uuid(),
});

export const shareLinkParamSchema = z.object({
  shareLink: z.string().min(1).max(64).regex(/^[A-Za-z0-9_-]+$/),
});

export type CreateBoardInput = z.infer<typeof createBoardSchema>;
export type UpdateBoardInput = z.infer<typeof updateBoardSchema>;
