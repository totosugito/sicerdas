import { Type, type Static } from "@sinclair/typebox";
import { BaseResponseSchema, PaginationMetaSchema } from "../../../types/response.ts";

// --- User Request Schemas ---

export const UserCourseIdParams = Type.Object({
  courseId: Type.String({ format: "uuid" }),
});

export const UserCourseListQuery = Type.Object({
  page: Type.Optional(Type.Number({ minimum: 1, default: 1 })),
  limit: Type.Optional(Type.Number({ minimum: 1, maximum: 100, default: 10 })),
});

// --- Shared Field Definitions ---

export const StudentFields = {
  id: Type.String({ format: "uuid" }),
  fullName: Type.Union([Type.String(), Type.Null()]),
  email: Type.Union([Type.String(), Type.Null()]),
  avatarUrl: Type.Union([Type.String(), Type.Null()]),
};

export const EnrollmentItemSchema = Type.Object({
  id: Type.String({ format: "uuid" }),
  courseId: Type.String({ format: "uuid" }),
  userId: Type.String({ format: "uuid" }),
  status: Type.String(),
  enrolledAt: Type.String({ format: "date-time" }),
  completedAt: Type.Union([Type.String({ format: "date-time" }), Type.Null()]),
  student: Type.Optional(Type.Object(StudentFields)),
});

// --- Response Schemas ---

export const EnrollmentDetailResponse = Type.Intersect([
  BaseResponseSchema,
  Type.Object({
    data: EnrollmentItemSchema,
  }),
]);

export const UserCourseListResponse = Type.Intersect([
  BaseResponseSchema,
  Type.Object({
    data: Type.Array(
      Type.Object({
        enrollmentId: Type.String({ format: "uuid" }),
        status: Type.String(),
        enrolledAt: Type.String({ format: "date-time" }),
        completedAt: Type.Union([Type.String({ format: "date-time" }), Type.Null()]),
        course: Type.Object({
          id: Type.String({ format: "uuid" }),
          courseCode: Type.String(),
          courseName: Type.String(),
          courseDescription: Type.Union([Type.String(), Type.Null()]),
          thumbnail: Type.Union([Type.String(), Type.Null()]),
          price: Type.Number(),
        }),
      }),
    ),
    pagination: PaginationMetaSchema,
  }),
]);
export type UserCourseItem = Static<typeof UserCourseListResponse>['data'][number];

// --- Static Types ---

export type EnrollmentItem = Static<typeof EnrollmentItemSchema>;
export type UserCourseListQueryParams = Static<typeof UserCourseListQuery>;
