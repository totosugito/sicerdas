import type {
  CourseItem,
  AdminCreateCourseInput,
  AdminUpdateCourseInput,
  ThumbnailResponseDataT,
  CourseListQueryParams,
} from "backend/src/modules/course/courses/courses.schema.ts";
import type { BaseResponse, PaginationMeta } from "backend/src/types/index.ts";

export type {
  CourseItem,
  AdminCreateCourseInput,
  AdminUpdateCourseInput,
  ThumbnailResponseDataT,
  CourseListQueryParams,
  BaseResponse,
  PaginationMeta,
};

export interface CourseApiResponse<T = unknown> extends BaseResponse {
  data: T;
}

export type CourseDetailResponse = CourseApiResponse<CourseItem>;
export type CreateCourseResponse = CourseApiResponse<CourseItem>;
export type UpdateCourseResponse = CourseApiResponse<CourseItem>;
export type DeleteCourseResponse = BaseResponse;
export type ThumbnailResponse = CourseApiResponse<ThumbnailResponseDataT>;

export interface PaginatedCourseListResponse extends BaseResponse {
  data: {
    items: CourseItem[];
    meta: PaginationMeta;
  };
}

export type AdminCourseListParams = CourseListQueryParams;
export type PublicCourseListParams = CourseListQueryParams;

export interface UpdateCourseRequest extends AdminUpdateCourseInput {
  id: string;
}

export interface UploadCourseThumbnailRequest {
  id: string;
  file?: File;
  action?: "remove";
}

export type CourseFormValues = Omit<AdminCreateCourseInput, "educationGradeId" | "price" | "versionId"> & {
  educationGradeId: string | number;
  price?: number | string;
  versionId: string | number;
  thumbnail?: string | null;
  newThumbnailFile?: File | null;
};

export interface FilterParamsGrade {
  id: number;
  name: string;
  stats: {
    activeCount: number;
    totalCount: number;
  };
}

export interface FilterParamsCategoryData {
  id: string;
  name: string;
  key: string;
  description: string | null;
  grades: FilterParamsGrade[];
}

export interface CourseFilterParamsResponse extends BaseResponse {
  data: FilterParamsCategoryData[];
}


