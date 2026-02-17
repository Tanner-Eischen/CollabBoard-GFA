import { z } from "zod";

const baseObjectSchema = z.object({
  type: z.string().min(1).max(64),
  x: z.number(),
  y: z.number(),
  width: z.number().nonnegative().nullable().optional(),
  height: z.number().nonnegative().nullable().optional(),
  rotation: z.number().default(0),
  zIndex: z.number().int().min(0).default(0),
  data: z.record(z.string(), z.unknown()).optional(),
});

export const createObjectSchema = baseObjectSchema.extend({
  boardId: z.string().uuid(),
});

export const updateObjectSchema = baseObjectSchema.partial();

export const objectIdParamSchema = z.object({
  id: z.string().uuid(),
});

export const boardIdQuerySchema = z.object({
  boardId: z.string().uuid(),
});

export const batchCreateObjectSchema = z.object({
  objects: z.array(createObjectSchema).min(1).max(100),
});

export const batchUpdateObjectSchema = z.object({
  updates: z
    .array(
      z.object({
        id: z.string().uuid(),
        data: updateObjectSchema,
      })
    )
    .min(1)
    .max(100),
});

export const batchDeleteObjectSchema = z.object({
  ids: z.array(z.string().uuid()).min(1).max(100),
});

export type CreateObjectInput = z.infer<typeof createObjectSchema>;
export type UpdateObjectInput = z.infer<typeof updateObjectSchema>;
export type BatchCreateObjectInput = z.infer<typeof batchCreateObjectSchema>;
export type BatchUpdateObjectInput = z.infer<typeof batchUpdateObjectSchema>;
export type BatchDeleteObjectInput = z.infer<typeof batchDeleteObjectSchema>;
