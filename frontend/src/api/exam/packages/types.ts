import type { BaseResponse, PaginationMeta } from "@/api/types";
import {
  EnumExamPackageUserStatus as UserStatusValues,
  EnumExamType as ExamTypeValues,
} from "@/api/exam/types";

export type EnumExamPackageUserStatus = (typeof UserStatusValues)[keyof typeof UserStatusValues];
export type EnumExamType = (typeof ExamTypeValues)[keyof typeof ExamTypeValues];

export type { BaseResponse, PaginationMeta };

export interface PackageCategoryRef {
  id: string;
  name: string;
  key: string;
}

export interface PackageGradeRef {
  id: number | null;
  name: string | null;
}

export interface PackageStatsInfo {
  viewCount: number;
  likeCount: number;
  bookmarkCount: number;
  ratingCount: number;
  rating: number;
  activeSections: number;
  activeQuestions: number;
  totalSections?: number;
  totalQuestions?: number;
}

export interface PackageUserInteraction {
  liked: boolean;
  disliked: boolean;
  rating: number;
  bookmarked: boolean;
  status: EnumExamPackageUserStatus;
  completedSectionsCount: number;
  viewCount: number;
}

export interface PublicPackageItem {
  id: string;
  title: string;
  description: string | null;
  examType: EnumExamType;
  durationMinutes: number;
  thumbnail: string | null;
  requiredTier: string;
  isActive: boolean;
  parentPackageId: string | null;
  isNew: boolean;
  createdAt: string;
  updatedAt: string;
  category: PackageCategoryRef;
  grade: PackageGradeRef;
  stats: PackageStatsInfo;
  userInteraction: PackageUserInteraction | null;
}

export type PublicPackageDetailData = PublicPackageItem;

export interface AdminPackageItem {
  id: string;
  categoryId: string;
  title: string;
  examType: EnumExamType;
  durationMinutes: number;
  description: string | null;
  requiredTier: string;
  educationGradeId: number | null;
  isActive: boolean;
  versionId: number | null;
  thumbnail: string | null;
  parentPackageId: string | null;
  totalSections: number;
  activeSections: number;
  totalQuestions: number;
  activeQuestions: number;
  isNew: boolean;
  createdAt: string;
  updatedAt: string;
  category: PackageCategoryRef;
  grade: PackageGradeRef;
  stats: PackageStatsInfo;
}

export type AdminPackageDetailData = AdminPackageItem;

export interface AdminSimplePackageItemT {
  value: string;
  label: string;
}

export interface AdminPackageListParams {
  search?: string;
  categoryId?: string;
  categoryKey?: string;
  examType?: string[];
  isActive?: boolean;
  educationGradeId?: number;
  sortBy?: string;
  sortOrder?: "asc" | "desc";
  page?: number;
  limit?: number;
}

export interface AdminPackageSimpleParams {
  search?: string;
  page?: number;
  limit?: number;
  examType?: string | string[];
  categoryId?: string;
  educationGradeId?: number;
  isActive?: boolean;
}

export interface CreatePackageParams {
  categoryId: string;
  title: string;
  examType?: EnumExamType;
  description?: string | null;
  requiredTier?: string;
  educationGradeId?: number | null;
  isActive?: boolean;
  versionId?: number | null;
}

export interface UpdatePackageParams extends Partial<CreatePackageParams> {}

export interface ClonePackageParams {
  sourcePackageId: string;
  title?: string;
  examType?: EnumExamType;
}

export interface ClonePackageResponse extends BaseResponse {
  data: {
    id: string;
    parentPackageId: string | null;
    title: string;
    examType: string;
    totalSections: number;
    totalQuestions: number;
  };
}

export interface ThumbnailResponseDataT {
  id: string;
  thumbnail: string | null;
}

export interface UpdateBookmarkParams {
  packageId: string;
  bookmarked: boolean;
}

export interface BookmarkResponseDataT {
  bookmarked: boolean;
  bookmarkCount: number;
}

export interface UpdateRatingParams {
  packageId: string;
  rating: number;
}

export interface RatingResponseDataT {
  rating: number;
  ratingCount: number;
  userInteraction: {
    rating: number;
  };
}

export interface FavoritesQueryParams {
  page?: number;
  pageSize?: number;
}

export interface FavoritePackageItem {
  id: string;
  title: string;
  category: { name: string };
  thumbnail: string | null;
  stats: {
    rating: number;
    activeQuestions: number;
    activeSections: number;
  };
  userInteraction: {
    status: string;
    completedSectionsCount: number;
  };
  bookmarkedAt: string;
}

export interface ListCustomQueryParams {
  page?: number;
  pageSize?: number;
}

export interface CustomPackageItem {
  id: string;
  title: string;
  thumbnail: string | null;
  durationMinutes: number;
  stats: {
    activeQuestions: number;
    activeSections: number;
  };
  category: { name: string };
  grade: { name: string };
  userInteraction: {
    status: EnumExamPackageUserStatus;
    completedSectionsCount: number;
  };
  createdAt: string;
}

export interface GenerateCustomParams {
  categoryId: string;
  educationGradeId: number;
  tagIds: string[];
  limit?: number;
  packageTitle?: string;
  sectionTitle?: string;
}

export interface FilterParamsCategoryData {
  id: string;
  name: string;
  key: string;
  description?: string | null;
  grades: {
    id: number;
    name: string;
    stats: {
      activeCount: number;
      totalCount: number;
    };
  }[];
}

export type GenerateCustomRequest = GenerateCustomParams;
export type ListCustomRequest = ListCustomQueryParams;
export type BookmarkPackageRequest = UpdateBookmarkParams;
export type RatePackageRequest = UpdateRatingParams;
export interface PackageFormValues {
  categoryId: string;
  title: string;
  examType?: EnumExamType;
  description?: string | null;
  requiredTier?: string;
  educationGradeId?: number | string | null;
  isActive?: boolean;
  versionId?: number | string | null;
  durationMinutes?: number | string;
  thumbnail?: string | null;
  newThumbnailFile?: File | null;
}
export type ListCustomPackagesResponse = CustomPracticeListResponse;

export interface ExamPackageResponse<T = unknown> extends BaseResponse {
  data: T;
}

export type ExamPackage = AdminPackageItem;
export type PublicExamPackage = PublicPackageItem;

export type ExamPackageDetailResponse = ExamPackageResponse<AdminPackageDetailData>;
export type PublicDetailPackageResponse = ExamPackageResponse<PublicPackageDetailData>;
export type ExamFilterParamsResponse = ExamPackageResponse<FilterParamsCategoryData[]>;
export type BookmarkPackageResponse = ExamPackageResponse<BookmarkResponseDataT>;
export type RatePackageResponse = ExamPackageResponse<RatingResponseDataT>;
export type DetailPackageResponse = ExamPackageResponse<AdminPackageDetailData>;
export type CreatePackageResponse = ExamPackageResponse<{ id: string }>;
export type ThumbnailResponse = ExamPackageResponse<ThumbnailResponseDataT>;
export type GenerateCustomResponse = ExamPackageResponse<{ packageId: string; sectionId: string }>;

export interface PaginatedListResponse<T> extends BaseResponse {
  data: {
    items: T[];
    meta: PaginationMeta;
  };
}

export type ListPackagesResponse = PaginatedListResponse<AdminPackageItem>;
export type ListPackagesSimpleResponse = PaginatedListResponse<AdminSimplePackageItemT>;

export type UpdatePackageRequest = UpdatePackageParams & { id: string };

export interface FavoritePackage extends Omit<FavoritePackageItem, "userInteraction"> {
  userInteraction: {
    status: EnumExamPackageUserStatus;
    completedSectionsCount: number;
  };
}

export interface FavoritePackagesResponse extends BaseResponse {
  data: FavoritePackage[];
  pagination: PaginationMeta;
}

export interface CustomPracticeItem extends Omit<CustomPackageItem, "userInteraction"> {
  userInteraction: {
    status: EnumExamPackageUserStatus;
    completedSectionsCount: number;
  };
}

export interface CustomPracticeListResponse extends BaseResponse {
  data: CustomPracticeItem[];
  pagination: PaginationMeta;
}
