import type { BaseResponse, PaginationMeta } from "@/api/types";

export interface UserCourseItem {
  enrollmentId: string;
  status: string;
  enrolledAt: string;
  completedAt: string | null;
  course: {
    id: string;
    courseCode: string;
    courseName: string;
    courseDescription: string | null;
    thumbnail: string | null;
    price: number;
  };
}

export interface UserCourseListResponse extends BaseResponse {
  data: UserCourseItem[];
  pagination: PaginationMeta;
}
