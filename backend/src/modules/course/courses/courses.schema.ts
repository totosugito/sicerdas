import { Type, type Static } from "@sinclair/typebox";
import { BaseResponseSchema, PaginationMetaSchema } from "../../../types/response.ts";
import { EnumPublishDateType } from "../../../db/schema/course/index.ts";
import { EnumContentStatus } from "../../../db/schema/enum/enum-app.ts";
import { EnumLectureType } from "../../../db/schema/course/enums.ts";
import { ChapterItemSchema } from "../chapters/chapters.schema.ts";
import { LectureItemSchema } from "../lectures/lectures.schema.ts";

// --- Shared Response Field Definitions ---

export const CourseBaseFields = {
  id: Type.String({ format: "uuid" }),
  createdByUserId: Type.Union([Type.String({ format: "uuid" }), Type.Null()]),
  courseCode: Type.String(),
  courseName: Type.String(),
  courseDescription: Type.Union([Type.String(), Type.Null()]),
  whatYouWillLearn: Type.Union([Type.String(), Type.Null()]),
  price: Type.Number(),
  thumbnail: Type.Union([Type.String(), Type.Null()]),
  categoryId: Type.String({ format: "uuid" }),
  educationGradeId: Type.Union([Type.Number(), Type.Null()]),
  tags: Type.Union([Type.Array(Type.String()), Type.Null()]),
  instructions: Type.Union([Type.String(), Type.Null()]),
  status: Type.String(),
  publishDateType: Type.String(),
  publishDateStart: Type.Union([Type.String({ format: "date-time" }), Type.Null()]),
  publishDateEnd: Type.Union([Type.String({ format: "date-time" }), Type.Null()]),
  isPublic: Type.Boolean(),
  isSequential: Type.Boolean(),
  versionId: Type.Union([Type.Number(), Type.Null()]),
  extra: Type.Any(),
  createdAt: Type.String({ format: "date-time" }),
  updatedAt: Type.String({ format: "date-time" }),
};

export const CategoryFields = {
  id: Type.String({ format: "uuid" }),
  name: Type.String(),
  key: Type.String(),
};

export const GradeFields = {
  id: Type.Number(),
  name: Type.String(),
  grade: Type.String(),
};

export const CourseItemSchema = Type.Object({
  ...CourseBaseFields,
  category: Type.Union([Type.Object(CategoryFields), Type.Null()]),
  grade: Type.Union([Type.Object(GradeFields), Type.Null()]),
  totalChapters: Type.Optional(Type.Number()),
  totalLectures: Type.Optional(Type.Number()),
  enrolledCount: Type.Optional(Type.Number()),
  totalRatings: Type.Optional(Type.Number()),
  averageRating: Type.Optional(Type.Number()),
  progress: Type.Optional(
    Type.Union([
      Type.Object({
        enrollmentStatus: Type.String(),
        completedLectures: Type.Number(),
        progressPercentage: Type.Number(),
      }),
      Type.Null(),
    ])
  ),
});

export type CourseItem = Static<typeof CourseItemSchema>;

export const CourseUserDetailSchema = Type.Object({
  id: Type.String({ format: "uuid" }),
  courseCode: Type.String(),
  courseName: Type.String(),
  courseDescription: Type.Union([Type.String(), Type.Null()]),
  whatYouWillLearn: Type.Union([Type.String(), Type.Null()]),
  price: Type.Number(),
  thumbnail: Type.Union([Type.String(), Type.Null()]),
  category: Type.Union([Type.Object(CategoryFields), Type.Null()]),
  grade: Type.Union([Type.Object(GradeFields), Type.Null()]),
  totalChapters: Type.Number(),
  totalLectures: Type.Number(),
  enrolledCount: Type.Number(),
  totalRatings: Type.Number(),
  averageRating: Type.Number(),
  progress: Type.Union([
    Type.Object({
      enrollmentStatus: Type.String(),
      completedLectures: Type.Number(),
      progressPercentage: Type.Number(),
      rating: Type.Union([Type.Number(), Type.Null()]),
      bookmarked: Type.Boolean(),
    }),
    Type.Null(),
  ]),
});

export type CourseUserDetail = Static<typeof CourseUserDetailSchema>;

export const CourseUserDetailResponse = Type.Object({
  ...BaseResponseSchema.properties,
  data: CourseUserDetailSchema,
});

// --- Admin Request Schemas ---

export const AdminCreateCourseBody = Type.Object({
  courseCode: Type.String({ minLength: 2, maxLength: 255 }),
  courseName: Type.String({ minLength: 2, maxLength: 255 }),
  categoryId: Type.String({ format: "uuid" }),
  educationGradeId: Type.Number(),
  courseDescription: Type.Optional(Type.String()),
  whatYouWillLearn: Type.Optional(Type.String()),
  price: Type.Optional(Type.Number({ minimum: 0, default: 0 })),
  tags: Type.Optional(Type.Array(Type.String())),
  instructions: Type.Optional(Type.String()),
  status: Type.Optional(Type.Enum(EnumContentStatus, { default: EnumContentStatus.DRAFT })),
  publishDateType: Type.Optional(Type.Enum(EnumPublishDateType, { default: EnumPublishDateType.NOW })),
  publishDateStart: Type.Optional(Type.String({ format: "date-time" })),
  publishDateEnd: Type.Optional(Type.String({ format: "date-time" })),
  isPublic: Type.Optional(Type.Boolean({ default: false })),
  isSequential: Type.Optional(Type.Boolean({ default: true })),
  versionId: Type.Number(),
});

export type AdminCreateCourseInput = Static<typeof AdminCreateCourseBody>;

export const AdminUpdateCourseBody = Type.Composite([
  Type.Partial(AdminCreateCourseBody),
  Type.Object({
    educationGradeId: Type.Optional(Type.Number()),
    courseDescription: Type.Optional(Type.String()),
    whatYouWillLearn: Type.Optional(Type.String()),
    price: Type.Optional(Type.Number({ minimum: 0, default: 0 })),
    thumbnail: Type.Optional(Type.String()),
    tags: Type.Optional(Type.Array(Type.String())),
    instructions: Type.Optional(Type.String()),
    status: Type.Optional(Type.Enum(EnumContentStatus, { default: EnumContentStatus.DRAFT })),
    publishDateType: Type.Optional(Type.Enum(EnumPublishDateType, { default: EnumPublishDateType.NOW })),
    publishDateStart: Type.Optional(Type.String({ format: "date-time" })),
    publishDateEnd: Type.Optional(Type.String({ format: "date-time" })),
    isPublic: Type.Optional(Type.Boolean({ default: false })),
    isSequential: Type.Optional(Type.Boolean({ default: true })),
  }),
]);
export type AdminUpdateCourseInput = Static<typeof AdminUpdateCourseBody>;

export const AdminUpdateCourseStatusBody = Type.Object({
  status: Type.Enum(EnumContentStatus),
});

export const CourseIdParams = Type.Object({
  id: Type.String({ format: "uuid" }),
});

export const ThumbnailQuery = Type.Object({
  action: Type.Optional(Type.String()),
});

export const ThumbnailResponseData = Type.Object({
  id: Type.String({ format: "uuid" }),
  thumbnail: Type.Union([Type.String(), Type.Null()]),
});

export type ThumbnailResponseDataT = Static<typeof ThumbnailResponseData>;

export const ThumbnailResponse = Type.Object({
  ...BaseResponseSchema.properties,
  data: ThumbnailResponseData,
});

// --- Query / List Schemas ---

export const CourseListQuery = Type.Object({
  page: Type.Optional(Type.Number({ default: 1, minimum: 1 })),
  limit: Type.Optional(Type.Number({ default: 10, minimum: 1, maximum: 100 })),
  search: Type.Optional(Type.String()),
  categoryId: Type.Optional(Type.String({ format: "uuid" })),
  categoryKey: Type.Optional(Type.String()),
  educationGradeId: Type.Optional(Type.Number()),
  educationGradeIds: Type.Optional(Type.Array(Type.Number())),
  status: Type.Optional(Type.Enum(EnumContentStatus)),
  sortBy: Type.Optional(Type.String({ default: "createdAt" })),
  sortOrder: Type.Optional(Type.String({ default: "desc" })),
  versionId: Type.Optional(Type.Number()),
});

export type CourseListQueryParams = Static<typeof CourseListQuery>;

export const CourseListResponse = Type.Object({
  ...BaseResponseSchema.properties,
  data: Type.Object({
    items: Type.Array(CourseItemSchema),
    meta: PaginationMetaSchema,
  }),
});

export const CourseDetailResponse = Type.Object({
  ...BaseResponseSchema.properties,
  data: CourseItemSchema,
});

export const CourseStructureChapterSchema = Type.Intersect([
  ChapterItemSchema,
  Type.Object({
    lectures: Type.Array(LectureItemSchema),
  }),
]);

export const CourseStructureResponse = Type.Object({
  ...BaseResponseSchema.properties,
  data: Type.Array(CourseStructureChapterSchema),
});

export const PublicCourseStructureLectureSchema = Type.Object({
  id: Type.String({ format: "uuid" }),
  title: Type.Union([Type.String(), Type.Null()]),
  description: Type.Union([Type.String(), Type.Null()]),
  chapterId: Type.String({ format: "uuid" }),
  type: Type.Enum(EnumLectureType),
  position: Type.String(),
});

export const PublicCourseStructureChapterSchema = Type.Object({
  id: Type.String({ format: "uuid" }),
  chapterName: Type.Union([Type.String(), Type.Null()]),
  courseId: Type.String({ format: "uuid" }),
  position: Type.Union([Type.String(), Type.Null()]),
  lectures: Type.Array(PublicCourseStructureLectureSchema),
});

export const PublicCourseStructureResponse = Type.Object({
  ...BaseResponseSchema.properties,
  data: Type.Array(PublicCourseStructureChapterSchema),
});

export const FilterParamsGradeStatsSchema = Type.Object({
  activeCount: Type.Number(),
  totalCount: Type.Number(),
});

export const FilterParamsGradeSchema = Type.Object({
  id: Type.Number(),
  name: Type.String(),
  stats: FilterParamsGradeStatsSchema,
});

export const FilterParamsCategoryItemSchema = Type.Object({
  id: Type.String({ format: "uuid" }),
  name: Type.String(),
  key: Type.String(),
  description: Type.Union([Type.String(), Type.Null()]),
  grades: Type.Array(FilterParamsGradeSchema),
});

export const CourseFilterParamsResponse = Type.Object({
  ...BaseResponseSchema.properties,
  data: Type.Array(FilterParamsCategoryItemSchema),
});

// --- User Interaction Schemas ---

export const CourseInteractionIdParams = Type.Object({
  courseId: Type.String({ format: "uuid" }),
});
export type CourseInteractionIdParamsType = Static<typeof CourseInteractionIdParams>;

export const FavoritesQuerySchema = Type.Object({
  page: Type.Optional(Type.Number({ default: 1, minimum: 1 })),
  limit: Type.Optional(Type.Number({ default: 10, minimum: 1, maximum: 100 })),
});
export type FavoritesQuerySchemaType = Static<typeof FavoritesQuerySchema>;

export const RatingBody = Type.Object({
  rating: Type.Number({ minimum: 0, maximum: 5 }),
});
export type RatingBodyType = Static<typeof RatingBody>;

export const InteractionDataSchema = Type.Object({
  courseId: Type.String({ format: "uuid" }),
  userId: Type.String({ format: "uuid" }),
  rating: Type.Optional(Type.Union([Type.Number(), Type.Null()])),
  bookmarked: Type.Optional(Type.Boolean()),
  liked: Type.Optional(Type.Boolean()),
  disliked: Type.Optional(Type.Boolean()),
});

export const RatingResponse = Type.Object({
  ...BaseResponseSchema.properties,
  data: InteractionDataSchema,
});

export const BookmarkResponse = Type.Object({
  ...BaseResponseSchema.properties,
  data: InteractionDataSchema,
});

export const LikeResponse = Type.Object({
  ...BaseResponseSchema.properties,
  data: InteractionDataSchema,
});

export const FavoriteCourseItemSchema = Type.Object({
  id: Type.String({ format: "uuid" }),
  courseCode: Type.String(),
  courseName: Type.String(),
  courseDescription: Type.Union([Type.String(), Type.Null()]),
  thumbnail: Type.Union([Type.String(), Type.Null()]),
  price: Type.Number(),
  bookmarked: Type.Boolean(),
  liked: Type.Boolean(),
  rating: Type.Union([Type.Number(), Type.Null()]),
});

export const FavoritesResponse = Type.Object({
  ...BaseResponseSchema.properties,
  data: Type.Object({
    items: Type.Array(FavoriteCourseItemSchema),
    meta: PaginationMetaSchema,
  }),
});
