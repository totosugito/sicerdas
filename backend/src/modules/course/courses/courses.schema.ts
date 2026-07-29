import { Type, type Static } from "@sinclair/typebox";
import { BaseResponseSchema, PaginationMetaSchema } from "../../../types/response.ts";
import { EnumPublishDateType } from "../../../db/schema/course/index.ts";
import { EnumContentStatus } from "../../../db/schema/enum/enum-app.ts";
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
});

export type CourseItem = Static<typeof CourseItemSchema>;

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
