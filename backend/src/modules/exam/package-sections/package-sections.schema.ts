import { Type, type Static } from "@sinclair/typebox";
import { BaseResponseSchema, PaginationMetaSchema } from "../../../types/response.ts";
import { EnumExamSessionStatus, EnumExamSessionMode } from "../../../db/schema/exam/enums.ts";

// --- Shared Field Definitions ---

const SectionCoreFields = {
  title: Type.String(),
  groupName: Type.Union([Type.String(), Type.Null()]),
  description: Type.Union([Type.String(), Type.Null()]),
  durationMinutes: Type.Union([Type.Number(), Type.Null()]),
  order: Type.Number(),
};

const SectionBaseFields = {
  ...SectionCoreFields,
  id: Type.String({ format: "uuid" }),
  packageId: Type.String({ format: "uuid" }),
  isActive: Type.Boolean(),
  versionId: Type.Union([Type.Number(), Type.Null()]),
  createdAt: Type.String({ format: "date-time" }),
  updatedAt: Type.String({ format: "date-time" }),
};

const SectionCreateFields = {
  ...SectionCoreFields,
  packageId: Type.String({ format: "uuid" }),
  title: Type.String({ minLength: 1, maxLength: 255 }),
  durationMinutes: Type.Optional(Type.Number({ minimum: 0 })),
  order: Type.Optional(Type.Number({ default: -1 })),
  isActive: Type.Optional(Type.Boolean({ default: true })),
  versionId: Type.Optional(Type.Number()),
};

// --- Public Schemas ---

const PublicSectionItem = Type.Object({
  ...SectionCoreFields,
  id: Type.String({ format: "uuid" }),
  totalQuestions: Type.Number(),
  activeQuestions: Type.Number(),
  userStatus: Type.Union([Type.Enum(EnumExamSessionStatus), Type.Null()]),
  userMode: Type.Union([Type.Enum(EnumExamSessionMode), Type.Null()]),
  bestTryoutScore: Type.Union([Type.Number(), Type.String(), Type.Null()]),
});

// --- Admin Schemas ---

const AdminSectionItem = Type.Object({
  ...SectionBaseFields,
  packageName: Type.Union([Type.String(), Type.Null()]),
  isNew: Type.Boolean(),
  totalQuestions: Type.Number(),
  activeQuestions: Type.Number(),
});

const AdminSectionDetailItem = Type.Object({
  ...SectionBaseFields,
  packageName: Type.String(),
  categoryId: Type.Union([Type.String({ format: "uuid" }), Type.Null()]),
  educationGradeId: Type.Union([Type.Number(), Type.Null()]),
  isNew: Type.Boolean(),
});

const AdminSimpleSectionItem = Type.Object({
  value: Type.String({ format: "uuid" }),
  label: Type.String(),
});

// --- Request Bodies ---

export const ListSectionBody = Type.Object({
  packageId: Type.String({ format: "uuid" }),
});

export const AdminSectionListBody = Type.Object({
  search: Type.Optional(Type.String({ description: "Search term for section title" })),
  packageId: Type.Optional(Type.String({ format: "uuid" })),
  isActive: Type.Optional(Type.Boolean()),
  sortBy: Type.Optional(
    Type.String({
      description:
        "Sort field: createdAt, title, groupName, isActive, updatedAt, durationMinutes, order, versionId",
      default: "updatedAt",
    }),
  ),
  sortOrder: Type.Optional(Type.String({ description: "Sort order: asc or desc", default: "desc" })),
  page: Type.Optional(Type.Number({ default: 1, minimum: 1 })),
  limit: Type.Optional(Type.Number({ default: 10, minimum: 1, maximum: 50 })),
});

export const AdminSectionSimpleBody = Type.Object({
  packageId: Type.Optional(Type.String({ format: "uuid" })),
  page: Type.Optional(Type.Number({ default: 1, minimum: 1 })),
  limit: Type.Optional(Type.Number({ default: 1000, minimum: 1, maximum: 2000 })),
});

export const SectionIdParams = Type.Object({
  id: Type.String({ format: "uuid" }),
});

export const CreateSectionBody = Type.Object(SectionCreateFields);

export const UpdateSectionBody = Type.Partial(Type.Object(SectionCreateFields));

// --- Response Schemas ---

export const ListSectionResponse = Type.Intersect([
  BaseResponseSchema,
  Type.Object({ data: Type.Array(PublicSectionItem) }),
]);

export const AdminSectionListResponse = Type.Intersect([
  BaseResponseSchema,
  Type.Object({
    data: Type.Object({
      package: Type.Object({
        packageId: Type.String(),
        packageName: Type.String(),
      }),
      items: Type.Array(AdminSectionItem),
      meta: PaginationMetaSchema,
    }),
  }),
]);

export const AdminSectionSimpleListResponse = Type.Intersect([
  BaseResponseSchema,
  Type.Object({
    data: Type.Object({
      items: Type.Array(AdminSimpleSectionItem),
      meta: PaginationMetaSchema,
    }),
  }),
]);

export const AdminSectionDetailResponse = Type.Intersect([
  BaseResponseSchema,
  Type.Object({ data: AdminSectionDetailItem }),
]);

export const CreateSectionResponse = Type.Intersect([
  BaseResponseSchema,
  Type.Object({ data: Type.Object({ id: Type.String({ format: "uuid" }) }) }),
]);

// --- Static Types ---

export type PublicSectionItemT = Static<typeof PublicSectionItem>;
export type AdminSectionItemT = Static<typeof AdminSectionItem>;
export type AdminSectionDetailData = Static<typeof AdminSectionDetailItem>;
export type AdminSimpleSectionItemT = Static<typeof AdminSimpleSectionItem>;

export type ListSectionParams = Static<typeof ListSectionBody>;
export type AdminSectionListParams = Static<typeof AdminSectionListBody>;
export type AdminSectionSimpleParams = Static<typeof AdminSectionSimpleBody>;
export type CreateSectionParams = Static<typeof CreateSectionBody>;
export type UpdateSectionParams = Static<typeof UpdateSectionBody>;
