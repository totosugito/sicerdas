import { Type, type Static } from "@sinclair/typebox";
import { BaseResponseSchema, PaginationMetaSchema } from "../../../types/response.ts";

export const CourseIdParams = Type.Object({
  courseId: Type.String({ format: "uuid" }),
});
export type CourseIdParamsType = Static<typeof CourseIdParams>;

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
