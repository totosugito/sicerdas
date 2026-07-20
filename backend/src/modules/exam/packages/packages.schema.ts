import { Type, type Static } from "@sinclair/typebox";
import { BaseResponseSchema, PaginationMetaSchema } from "../../../types/response.ts";
import { EnumExamType, EnumExamPackageUserStatus } from "../../../db/schema/exam/enums.ts";

// --- Shared Field Definitions ---

const PackageBaseFields = {
  id: Type.String({ format: "uuid" }),
  title: Type.String(),
  description: Type.Union([Type.String(), Type.Null()]),
  examType: Type.String(),
  durationMinutes: Type.Number(),
  thumbnail: Type.Union([Type.String(), Type.Null()]),
  requiredTier: Type.Union([Type.String(), Type.Null()]),
  isActive: Type.Boolean(),
  createdAt: Type.String({ format: "date-time" }),
  updatedAt: Type.String({ format: "date-time" }),
};

const PackageStatsFields = {
  activeSections: Type.Number(),
  activeQuestions: Type.Number(),
  rating: Type.Number(),
  viewCount: Type.Number(),
  likeCount: Type.Number(),
  bookmarkCount: Type.Number(),
};

const CategoryFields = {
  id: Type.String({ format: "uuid" }),
  name: Type.String(),
  key: Type.String(),
};

const GradeFields = {
  id: Type.Number(),
  name: Type.String(),
};

const UserInteractionFields = {
  liked: Type.Boolean(),
  disliked: Type.Boolean(),
  rating: Type.Number(),
  bookmarked: Type.Boolean(),
  status: Type.Enum(EnumExamPackageUserStatus),
  completedSectionsCount: Type.Number(),
};

// --- Filter Params Schema ---

const FilterParamsGradeStats = Type.Object({
  activeCount: Type.Number(),
  totalCount: Type.Number(),
});

const FilterParamsGrade = Type.Object({
  id: Type.Number(),
  name: Type.String(),
  stats: FilterParamsGradeStats,
});

const FilterParamsCategoryItem = Type.Object({
  id: Type.String({ format: "uuid" }),
  name: Type.String(),
  key: Type.String(),
  description: Type.Union([Type.String(), Type.Null()]),
  grades: Type.Array(FilterParamsGrade),
});

// --- Admin Schemas ---

const AdminPackageStatsFields = {
  totalSections: Type.Number(),
  activeSections: Type.Number(),
  totalQuestions: Type.Number(),
  activeQuestions: Type.Number(),
  viewCount: Type.Number(),
  likeCount: Type.Number(),
  bookmarkCount: Type.Number(),
  rating: Type.Number(),
};

const AdminPackageResponseItem = Type.Object({
  ...PackageBaseFields,
  category: Type.Object({
    id: Type.Union([Type.String({ format: "uuid" }), Type.Null()]),
    name: Type.Union([Type.String(), Type.Null()]),
    key: Type.Union([Type.String(), Type.Null()]),
  }),
  grade: Type.Object({
    id: Type.Union([Type.Number(), Type.Null()]),
    name: Type.Union([Type.String(), Type.Null()]),
  }),
  isNew: Type.Boolean(),
  versionId: Type.Union([Type.Number(), Type.Null()]),
  stats: Type.Object(AdminPackageStatsFields),
});

const AdminPackageDetailStatsFields = {
  ...AdminPackageStatsFields,
  ratingCount: Type.Number(),
};

const AdminPackageDetailItem = Type.Object({
  ...PackageBaseFields,
  category: Type.Object({
    id: Type.Union([Type.String({ format: "uuid" }), Type.Null()]),
    name: Type.Union([Type.String(), Type.Null()]),
    key: Type.Union([Type.String(), Type.Null()]),
  }),
  grade: Type.Object({
    id: Type.Union([Type.Number(), Type.Null()]),
    name: Type.Union([Type.String(), Type.Null()]),
  }),
  isNew: Type.Boolean(),
  versionId: Type.Union([Type.Number(), Type.Null()]),
  stats: Type.Object(AdminPackageDetailStatsFields),
});

const AdminSimplePackageItem = Type.Object({
  value: Type.String({ format: "uuid" }),
  label: Type.String(),
});

// --- Public Schemas ---

const PublicPackageResponseItem = Type.Object({
  ...PackageBaseFields,
  stats: Type.Object(PackageStatsFields),
  category: Type.Object(CategoryFields),
  grade: Type.Object(GradeFields),
  userInteraction: Type.Optional(Type.Object(UserInteractionFields)),
  isNew: Type.Boolean(),
});

const PublicPackageDetailStatsFields = {
  activeSections: Type.Number(),
  activeQuestions: Type.Number(),
  rating: Type.Number(),
  viewCount: Type.Number(),
  likeCount: Type.Number(),
  bookmarkCount: Type.Number(),
  ratingCount: Type.Number(),
};

const PublicPackageDetailItem = Type.Object({
  ...PackageBaseFields,
  stats: Type.Object(PublicPackageDetailStatsFields),
  category: Type.Object(CategoryFields),
  grade: Type.Object(GradeFields),
  userInteraction: Type.Optional(
    Type.Object({
      ...UserInteractionFields,
      viewCount: Type.Number(),
    }),
  ),
  isNew: Type.Boolean(),
});

// --- User Schemas ---

const BookmarkResponseData = Type.Object({
  bookmarked: Type.Boolean(),
  bookmarkCount: Type.Number(),
});

const RatingResponseData = Type.Object({
  rating: Type.Number(),
  ratingCount: Type.Number(),
  userInteraction: Type.Object({
    rating: Type.Number(),
  }),
});

const FavoritePackageItem = Type.Object({
  id: Type.String({ format: "uuid" }),
  title: Type.String(),
  category: Type.Object({
    name: Type.String(),
  }),
  thumbnail: Type.Union([Type.String(), Type.Null()]),
  stats: Type.Object({
    rating: Type.Number(),
    activeQuestions: Type.Number(),
    activeSections: Type.Number(),
  }),
  userInteraction: Type.Object({
    status: Type.Enum(EnumExamPackageUserStatus),
    completedSectionsCount: Type.Number(),
  }),
  bookmarkedAt: Type.String({ format: "date-time" }),
});

const ThumbnailResponseData = Type.Object({
  id: Type.String(),
  thumbnail: Type.Union([Type.String(), Type.Null()]),
});

// --- Request Bodies ---

export const PublicPackageListBody = Type.Object({
  categoryId: Type.Optional(Type.String({ format: "uuid" })),
  categoryKey: Type.Optional(Type.String({ description: "Search by category human-readable key" })),
  educationGradeIds: Type.Optional(Type.Array(Type.Number())),
  search: Type.Optional(Type.String({ description: "Search term for package title" })),
  sortBy: Type.Optional(
    Type.String({
      description: "Sort field: createdAt, title, rating, viewCount",
      default: "createdAt",
    }),
  ),
  sortOrder: Type.Optional(
    Type.String({ description: "Sort order: asc or desc", default: "desc" }),
  ),
  page: Type.Optional(Type.Number({ default: 1, minimum: 1 })),
  limit: Type.Optional(Type.Number({ default: 10, minimum: 1, maximum: 50 })),
});

export const AdminPackageListBody = Type.Object({
  search: Type.Optional(Type.String({ description: "Search term for package title" })),
  categoryId: Type.Optional(Type.String({ format: "uuid" })),
  categoryKey: Type.Optional(Type.String({ description: "Search by category human-readable key" })),
  examType: Type.Optional(Type.String()),
  isActive: Type.Optional(Type.Boolean()),
  educationGradeId: Type.Optional(Type.Number()),
  sortBy: Type.Optional(
    Type.String({
      description:
        "Sort field: createdAt, title, isActive, updatedAt, durationMinutes, categoryId, examType, educationGradeId",
      default: "updatedAt",
    }),
  ),
  sortOrder: Type.Optional(Type.String({ description: "Sort order: asc or desc", default: "desc" })),
  page: Type.Optional(Type.Number({ default: 1, minimum: 1 })),
  limit: Type.Optional(Type.Number({ default: 10, minimum: 1, maximum: 50 })),
});

export const AdminPackageSimpleBody = Type.Object({
  search: Type.Optional(Type.String()),
  page: Type.Optional(Type.Number({ default: 1, minimum: 1 })),
  limit: Type.Optional(Type.Number({ default: 1000, minimum: 1, maximum: 2000 })),
});

export const CreatePackageBody = Type.Object({
  categoryId: Type.String({ format: "uuid" }),
  title: Type.String({ minLength: 1, maxLength: 255 }),
  examType: Type.Enum(EnumExamType, { default: EnumExamType.OFFICIAL }),
  description: Type.Optional(Type.String()),
  requiredTier: Type.Optional(Type.String({ default: "free" })),
  educationGradeId: Type.Optional(Type.Number()),
  isActive: Type.Optional(Type.Boolean({ default: true })),
  versionId: Type.Number(),
});

export const UpdatePackageBody = Type.Object({
  categoryId: Type.Optional(Type.String({ format: "uuid" })),
  title: Type.Optional(Type.String({ minLength: 1, maxLength: 255 })),
  examType: Type.Optional(Type.Enum(EnumExamType)),
  description: Type.Optional(Type.String()),
  requiredTier: Type.Optional(Type.String()),
  educationGradeId: Type.Optional(Type.Number()),
  isActive: Type.Optional(Type.Boolean()),
  versionId: Type.Optional(Type.Number()),
});

export const PackageIdParams = Type.Object({
  id: Type.String({ format: "uuid" }),
});

export const UpdateBookmarkBody = Type.Object({
  packageId: Type.String({ format: "uuid" }),
  bookmarked: Type.Boolean(),
});

export const UpdateRatingBody = Type.Object({
  packageId: Type.String({ format: "uuid" }),
  rating: Type.Number({ minimum: 1, maximum: 5 }),
});

export const FavoritesQuery = Type.Object({
  page: Type.Optional(Type.Number({ minimum: 1, default: 1 })),
  pageSize: Type.Optional(Type.Number({ minimum: 1, maximum: 20, default: 5 })),
});

export const ThumbnailQuery = Type.Object({
  action: Type.Optional(Type.String()),
});

export const ListCustomQuery = Type.Object({
  page: Type.Optional(Type.Number({ minimum: 1, default: 1 })),
  pageSize: Type.Optional(Type.Number({ minimum: 1, maximum: 50, default: 10 })),
});

export const GenerateCustomBody = Type.Object({
  categoryId: Type.String({ format: "uuid" }),
  educationGradeId: Type.Number(),
  tagIds: Type.Array(Type.String({ format: "uuid" })),
  limit: Type.Optional(Type.Number({ default: 10, minimum: 1, maximum: 50 })),
  packageTitle: Type.Optional(Type.String({ minLength: 1, maxLength: 255 })),
  sectionTitle: Type.Optional(Type.String({ minLength: 1, maxLength: 255 })),
});

// --- Response Schemas ---

export const PublicPackageListResponse = Type.Intersect([
  BaseResponseSchema,
  Type.Object({
    data: Type.Object({
      items: Type.Array(PublicPackageResponseItem),
      meta: PaginationMetaSchema,
    }),
  }),
]);

export const PublicPackageDetailResponse = Type.Intersect([
  BaseResponseSchema,
  Type.Object({ data: PublicPackageDetailItem }),
]);

export const FilterParamsResponse = Type.Intersect([
  BaseResponseSchema,
  Type.Object({ data: Type.Array(FilterParamsCategoryItem) }),
]);

export const AdminPackageListResponse = Type.Intersect([
  BaseResponseSchema,
  Type.Object({
    data: Type.Object({
      items: Type.Array(AdminPackageResponseItem),
      meta: PaginationMetaSchema,
    }),
  }),
]);

export const AdminPackageDetailResponse = Type.Intersect([
  BaseResponseSchema,
  Type.Object({ data: AdminPackageDetailItem }),
]);

export const AdminPackageSimpleListResponse = Type.Intersect([
  BaseResponseSchema,
  Type.Object({
    data: Type.Object({
      items: Type.Array(AdminSimplePackageItem),
      meta: PaginationMetaSchema,
    }),
  }),
]);

export const CreatePackageResponse = Type.Intersect([
  BaseResponseSchema,
  Type.Object({ data: Type.Object({ id: Type.String({ format: "uuid" }) }) }),
]);

export const BookmarkResponse = Type.Intersect([
  BaseResponseSchema,
  Type.Object({ data: BookmarkResponseData }),
]);

export const RatingResponse = Type.Intersect([
  BaseResponseSchema,
  Type.Object({ data: RatingResponseData }),
]);

export const FavoritePackagesResponse = Type.Intersect([
  BaseResponseSchema,
  Type.Object({
    data: Type.Array(FavoritePackageItem),
    pagination: PaginationMetaSchema,
  }),
]);

export const ThumbnailResponse = Type.Intersect([
  BaseResponseSchema,
  Type.Object({ data: ThumbnailResponseData }),
]);

const CustomPackageResponseItem = Type.Object({
  id: Type.String({ format: "uuid" }),
  title: Type.String(),
  thumbnail: Type.Union([Type.String(), Type.Null()]),
  durationMinutes: Type.Number(),
  stats: Type.Object({
    activeQuestions: Type.Number(),
    activeSections: Type.Number(),
  }),
  category: Type.Object({ name: Type.String() }),
  grade: Type.Object({ name: Type.String() }),
  userInteraction: Type.Object({
    status: Type.Enum(EnumExamPackageUserStatus),
    completedSectionsCount: Type.Number(),
  }),
  createdAt: Type.String({ format: "date-time" }),
});

export const ListCustomResponse = Type.Intersect([
  BaseResponseSchema,
  Type.Object({
    data: Type.Array(CustomPackageResponseItem),
    pagination: PaginationMetaSchema,
  }),
]);

export const GenerateCustomResponse = Type.Intersect([
  BaseResponseSchema,
  Type.Object({
    data: Type.Object({
      packageId: Type.String({ format: "uuid" }),
      sectionId: Type.String({ format: "uuid" }),
    }),
  }),
]);

// --- Static Types ---

export type PublicPackageItem = Static<typeof PublicPackageResponseItem>;
export type PublicPackageDetailData = Static<typeof PublicPackageDetailItem>;
export type AdminPackageItem = Static<typeof AdminPackageResponseItem>;
export type AdminPackageDetailData = Static<typeof AdminPackageDetailItem>;
export type AdminSimplePackageItemT = Static<typeof AdminSimplePackageItem>;
export type FilterParamsCategoryData = Static<typeof FilterParamsCategoryItem>;

export type PublicPackageListParams = Static<typeof PublicPackageListBody>;
export type AdminPackageListParams = Static<typeof AdminPackageListBody>;
export type AdminPackageSimpleParams = Static<typeof AdminPackageSimpleBody>;
export type CreatePackageParams = Static<typeof CreatePackageBody>;
export type UpdatePackageParams = Static<typeof UpdatePackageBody>;
export type UpdateBookmarkParams = Static<typeof UpdateBookmarkBody>;
export type UpdateRatingParams = Static<typeof UpdateRatingBody>;
export type FavoritesQueryParams = Static<typeof FavoritesQuery>;

export type BookmarkResponseDataT = Static<typeof BookmarkResponseData>;
export type RatingResponseDataT = Static<typeof RatingResponseData>;
export type ThumbnailResponseDataT = Static<typeof ThumbnailResponseData>;

export type ListCustomQueryParams = Static<typeof ListCustomQuery>;
export type GenerateCustomParams = Static<typeof GenerateCustomBody>;
export type CustomPackageItem = Static<typeof CustomPackageResponseItem>;
