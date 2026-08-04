import { Type, type Static } from "@sinclair/typebox";
import { BaseResponseSchema } from "../../../types/response.ts";

export const GlobalStatsDataSchema = Type.Object({
  userId: Type.String({ format: "uuid" }),
  totalCoursesEnrolled: Type.Number(),
  totalCoursesCompleted: Type.Number(),
  totalLecturesCompleted: Type.Number(),
  totalWatchTimeMinutes: Type.Number(),
  lastActiveAt: Type.Union([Type.String({ format: "date-time" }), Type.Null()]),
});

export const GlobalStatsResponse = Type.Object({
  ...BaseResponseSchema.properties,
  data: GlobalStatsDataSchema,
});

export const CategoryStatItemSchema = Type.Object({
  categoryId: Type.String({ format: "uuid" }),
  categoryName: Type.String(),
  coursesEnrolled: Type.Number(),
  coursesCompleted: Type.Number(),
});

export const CategoryStatsResponse = Type.Object({
  ...BaseResponseSchema.properties,
  data: Type.Array(CategoryStatItemSchema),
});

export type SchemaGlobalStatsData = Static<typeof GlobalStatsDataSchema>;
export type SchemaGlobalStatsResponse = Static<typeof GlobalStatsResponse>;
export type SchemaCategoryStatItem = Static<typeof CategoryStatItemSchema>;
export type SchemaCategoryStatsResponse = Static<typeof CategoryStatsResponse>;
