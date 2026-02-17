import { z } from "zod";

const baseObjectSchema = z.object({
  type: z.string(),
  x: z.number(),
  y: z.number(),
  width: z.number().positive(),
  height: z.number().positive(),
  rotation: z.number().default(0),
});

export const createObjectSchema = baseObjectSchema.extend({
  boardId: z.string().uuid(),
});

export const updateObjectSchema = baseObjectSchema.partial();

export const objectIdParamSchema = z.object({
  id: z.string().uuid(),
});

export type CreateObjectInput = z.infer<typeof createObjectSchema>;
export type UpdateObjectInput = z.infer<typeof updateObjectSchema>;
