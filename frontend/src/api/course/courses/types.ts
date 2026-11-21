import type { BaseResponse, PaginationMeta } from "@/api/types";

export interface CourseCategoryRef {
  id: string;
  name: string;
  key: string;
}

export interface CourseGradeRef {
  id: number;
  name: string;
  grade: string;
}

export interface CourseItem {
  id: string;
  createdByUserId: string | null;
  courseCode: string;
  courseName: string;
  courseDescription: string | null;
  whatYouWillLearn: string | null;
  price: number;
  thumbnail: string | null;
  categoryId: string;
  educationGradeId: number | null;
  tags: string[] | null;
  instructions: string | null;
  status: string;
  publishDateType: string;
  publishDateStart: string | null;
  publishDateEnd: string | null;
  isPublic: boolean;
  isSequential: boolean;
  versionId: number | null;
  extra: any;
  createdAt: string;
  updatedAt: string;
  category: CourseCategoryRef | null;
  grade: CourseGradeRef | null;
  totalChapters?: number;
  totalLectures?: number;
  enrolledCount?: number;
  totalRatings?: number;
  averageRating?: number;
  progress?: {
    enrollmentStatus: string;
    completedLectures: number;
    progressPercentage: number;
  } | null;
}

export interface CourseUserDetail {
  id: string;
  courseCode: string;
  courseName: string;
  courseDescription: string | null;
  whatYouWillLearn: string | null;
  price: number;
  thumbnail: string | null;
  category: CourseCategoryRef | null;
  grade: CourseGradeRef | null;
  totalChapters: number;
  totalLectures: number;
  enrolledCount: number;
  totalRatings: number;
  averageRating: number;
  progress: {
    enrollmentStatus: string;
    completedLectures: number;
    progressPercentage: number;
    rating: number | null;
    bookmarked: boolean;
  } | null;
}

export interface AdminCreateCourseInput {
  courseCode: string;
  courseName: string;
  categoryId: string;
  educationGradeId: number;
  courseDescription?: string;
  whatYouWillLearn?: string;
  price?: number;
  tags?: string[];
  instructions?: string;
  status?: string;
  publishDateType?: string;
  publishDateStart?: string;
  publishDateEnd?: string;
  isPublic?: boolean;
  isSequential?: boolean;
  versionId: number;
}

export interface AdminUpdateCourseInput extends Partial<AdminCreateCourseInput> {
  thumbnail?: string;
}

export interface ThumbnailResponseDataT {
  id: string;
  thumbnail: string | null;
}

export interface CourseListQueryParams {
  page?: number;
  limit?: number;
  search?: string;
  categoryId?: string;
  categoryKey?: string;
  educationGradeId?: number;
  educationGradeIds?: number[];
  status?: string;
  sortBy?: string;
  sortOrder?: string;
  versionId?: number;
}

export interface InteractionData {
  courseId: string;
  userId: string;
  rating?: number | null;
  bookmarked?: boolean;
  liked?: boolean;
  disliked?: boolean;
}

export interface RatingResponseT extends BaseResponse {
  data: InteractionData;
}

export interface BookmarkResponseT extends BaseResponse {
  data: InteractionData;
}

export interface FavoriteCourseItem {
  id: string;
  courseCode: string;
  courseName: string;
  courseDescription: string | null;
  thumbnail: string | null;
  price: number;
  bookmarked: boolean;
  liked: boolean;
  rating: number | null;
}

export interface FavoritesResponseT extends BaseResponse {
  data: {
    items: FavoriteCourseItem[];
    meta: PaginationMeta;
  };
}

export type { BaseResponse, PaginationMeta };

export interface CourseApiResponse<T = unknown> extends BaseResponse {
  data: T;
}

export type CourseDetailResponse = CourseApiResponse<CourseItem>;
export type CourseUserDetailResponse = CourseApiResponse<CourseUserDetail>;
export type CreateCourseResponse = CourseApiResponse<CourseItem>;
export type UpdateCourseResponse = CourseApiResponse<CourseItem>;
export type DeleteCourseResponse = BaseResponse;
export type ThumbnailResponse = CourseApiResponse<ThumbnailResponseDataT>;
export type RatingResponse = RatingResponseT;
export type BookmarkResponse = BookmarkResponseT;

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

export type CourseFormValues = Omit<
  AdminCreateCourseInput,
  "educationGradeId" | "price" | "versionId"
> & {
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
