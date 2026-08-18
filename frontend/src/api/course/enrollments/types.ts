import type { UserCourseItem } from "backend/src/modules/course/enrollments/enrollments.schema.ts";
import type { BaseResponse, PaginationMeta } from "backend/src/types/index.ts";

export type { UserCourseItem };
export interface UserCourseListResponse extends BaseResponse {
  data: UserCourseItem[];
  pagination: PaginationMeta;
}
