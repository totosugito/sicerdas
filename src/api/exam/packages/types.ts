import type {
  UpdateBookmarkParams,
  BookmarkResponseDataT,
  UpdateRatingParams,
  RatingResponseDataT,
  FavoritesQueryParams,
  FavoritePackageItem,
  ListCustomQueryParams,
  CustomPackageItem,
  GenerateCustomParams,
  FilterParamsCategoryData,
  PublicPackageDetailData,
  PublicPackageItem,
  AdminPackageListParams,
  AdminPackageItem,
  AdminPackageDetailData,
  AdminSimplePackageItemT,
  AdminPackageSimpleParams,
  CreatePackageParams,
  UpdatePackageParams,
  ThumbnailResponseDataT,
} from "backend/src/modules/exam/packages/index.ts";
import type { BaseResponse, PaginationMeta } from "backend/src/types/index.ts";
import { EnumExamPackageUserStatus as UserStatusValues } from "backend/src/db/schema/exam/enums.ts";
import { EnumExamType as ExamTypeValues } from "backend/src/db/schema/exam/enums.ts";

export type EnumExamPackageUserStatus = (typeof UserStatusValues)[keyof typeof UserStatusValues];
export type EnumExamType = (typeof ExamTypeValues)[keyof typeof ExamTypeValues];

export type {
  UpdateBookmarkParams,
  BookmarkResponseDataT,
  UpdateRatingParams,
  RatingResponseDataT,
  FavoritesQueryParams,
  FavoritePackageItem,
  ListCustomQueryParams,
  CustomPackageItem,
  GenerateCustomParams,
  FilterParamsCategoryData,
  PublicPackageDetailData,
  PublicPackageItem,
  AdminPackageListParams,
  AdminPackageItem,
  AdminPackageDetailData,
  AdminSimplePackageItemT,
  AdminPackageSimpleParams,
  CreatePackageParams,
  UpdatePackageParams,
  ThumbnailResponseDataT,
  BaseResponse,
  PaginationMeta,
};

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

export interface ListCustomPackagesResponse extends BaseResponse {
  data: CustomPracticeItem[];
  pagination: PaginationMeta;
}

export interface BookmarkPackageRequest {
  packageId: string;
  bookmarked: boolean;
}

export interface RatePackageRequest {
  packageId: string;
  rating: number;
}

export interface ListCustomRequest {
  page?: number;
  pageSize?: number;
}

export interface GenerateCustomRequest {
  categoryId: string;
  educationGradeId: number;
  tagIds: string[];
  limit?: number;
  packageTitle?: string;
  sectionTitle?: string;
}
