import { db } from "../../../../../db/db-pool.ts";
import { courseLectures } from "../../../../../db/schema/course/lectures.ts";
import { eq } from "drizzle-orm";
import type { ServiceResponse } from "../../../../../types/index.ts";
import type { LectureItem } from "../../lectures.schema.ts";

export interface DetailLectureResult extends ServiceResponse {
  data?: LectureItem;
}

export async function detailLectureService(id: string): Promise<DetailLectureResult> {
  const [lecture] = await db
    .select()
    .from(courseLectures)
    .where(eq(courseLectures.id, id))
    .limit(1);

  if (!lecture) {
    return {
      success: false,
      statusCode: 404,
      errorKey: ($) => $.course.lectures.notFound,
    };
  }

  return {
    success: true,
    data: {
      ...lecture,
      type: lecture.type as any,
      createdAt: lecture.createdAt.toISOString(),
      updatedAt: lecture.updatedAt.toISOString(),
    },
  };
}
