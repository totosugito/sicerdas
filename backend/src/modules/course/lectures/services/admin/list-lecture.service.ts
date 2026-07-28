import { db } from "../../../../../db/db-pool.ts";
import { courseLectures } from "../../../../../db/schema/course/lectures.ts";
import { eq, asc } from "drizzle-orm";
import type { ServiceResponse } from "../../../../../types/index.ts";
import type { LectureItem } from "../../lectures.schema.ts";

export interface ListLectureResult extends ServiceResponse {
  data?: LectureItem[];
}

export async function listLectureService(chapterId: string): Promise<ListLectureResult> {
  const lectures = await db
    .select()
    .from(courseLectures)
    .where(eq(courseLectures.chapterId, chapterId))
    .orderBy(asc(courseLectures.position));

  const data: LectureItem[] = lectures.map((lecture) => ({
    ...lecture,
    type: lecture.type as any,
    createdAt: lecture.createdAt.toISOString(),
    updatedAt: lecture.updatedAt.toISOString(),
  }));

  return {
    success: true,
    data,
  };
}
