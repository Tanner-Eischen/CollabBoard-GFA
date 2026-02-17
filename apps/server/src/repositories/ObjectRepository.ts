import { prisma } from "../lib/prisma.js";

export interface ObjectRecord {
  id: string;
  type: string;
  data: unknown;
  x: number;
  y: number;
  width: number | null;
  height: number | null;
  rotation: number;
  zIndex: number;
  boardId: string;
  createdAt: Date;
  updatedAt: Date;
}

export type CreateObjectData = {
  type: string;
  data?: unknown;
  x: number;
  y: number;
  width?: number | null;
  height?: number | null;
  rotation?: number;
  zIndex?: number;
  boardId: string;
};

export type UpdateObjectData = {
  type?: string;
  data?: unknown;
  x?: number;
  y?: number;
  width?: number | null;
  height?: number | null;
  rotation?: number;
  zIndex?: number;
};

export async function createObject(data: CreateObjectData): Promise<ObjectRecord> {
  const obj = await prisma.object.create({
    data: {
      type: data.type,
      data: (data.data ?? {}) as object,
      x: data.x,
      y: data.y,
      width: data.width ?? undefined,
      height: data.height ?? undefined,
      rotation: data.rotation ?? 0,
      zIndex: data.zIndex ?? 0,
      boardId: data.boardId,
    },
  });
  return toRecord(obj);
}

export async function findObjectById(id: string): Promise<ObjectRecord | null> {
  const obj = await prisma.object.findUnique({
    where: { id },
  });
  return obj ? toRecord(obj) : null;
}

export async function findObjectsByBoardId(
  boardId: string
): Promise<ObjectRecord[]> {
  const objs = await prisma.object.findMany({
    where: { boardId },
    orderBy: [{ zIndex: "asc" }, { createdAt: "asc" }],
  });
  return objs.map(toRecord);
}

export async function updateObject(
  id: string,
  data: UpdateObjectData
): Promise<ObjectRecord | null> {
  try {
    const obj = await prisma.object.update({
      where: { id },
      data: {
        ...(data.type !== undefined && { type: data.type }),
        ...(data.data !== undefined && { data: data.data as object }),
        ...(data.x !== undefined && { x: data.x }),
        ...(data.y !== undefined && { y: data.y }),
        ...(data.width !== undefined && { width: data.width }),
        ...(data.height !== undefined && { height: data.height }),
        ...(data.rotation !== undefined && { rotation: data.rotation }),
        ...(data.zIndex !== undefined && { zIndex: data.zIndex }),
      },
    });
    return toRecord(obj);
  } catch {
    return null;
  }
}

export async function deleteObject(id: string): Promise<boolean> {
  try {
    await prisma.object.delete({
      where: { id },
    });
    return true;
  } catch {
    return false;
  }
}

export async function createObjects(
  items: CreateObjectData[]
): Promise<ObjectRecord[]> {
  if (items.length === 0) return [];
  const created = await prisma.object.createManyAndReturn({
    data: items.map((d) => ({
      type: d.type,
      data: (d.data ?? {}) as object,
      x: d.x,
      y: d.y,
      width: d.width ?? undefined,
      height: d.height ?? undefined,
      rotation: d.rotation ?? 0,
      zIndex: d.zIndex ?? 0,
      boardId: d.boardId,
    })),
  });
  return created.map(toRecord);
}

export async function deleteObjects(ids: string[]): Promise<number> {
  if (ids.length === 0) return 0;
  const result = await prisma.object.deleteMany({
    where: { id: { in: ids } },
  });
  return result.count;
}

function toRecord(obj: {
  id: string;
  type: string;
  data: unknown;
  x: number;
  y: number;
  width: number | null;
  height: number | null;
  rotation: number;
  zIndex: number;
  boardId: string;
  createdAt: Date;
  updatedAt: Date;
}): ObjectRecord {
  return {
    id: obj.id,
    type: obj.type,
    data: obj.data,
    x: obj.x,
    y: obj.y,
    width: obj.width,
    height: obj.height,
    rotation: obj.rotation,
    zIndex: obj.zIndex,
    boardId: obj.boardId,
    createdAt: obj.createdAt,
    updatedAt: obj.updatedAt,
  };
}
