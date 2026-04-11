import type { FastifyPluginAsyncTypebox } from "@fastify/type-provider-typebox";
import type { FastifyReply, FastifyRequest } from "fastify";
import { Type } from "@sinclair/typebox";
import { db } from "../../../../db/db-pool.ts";
import { examPackages } from "../../../../db/schema/exam/packages.ts";
import { examPackageSections } from "../../../../db/schema/exam/package-sections.ts";
import { educationCategories } from "../../../../db/schema/education/categories.ts";
import { educationGrades } from "../../../../db/schema/education/grades.ts";
import { desc, ilike, and, sql, eq, asc } from "drizzle-orm";
import { withErrorHandler } from "../../../../utils/withErrorHandler.ts";
import { fromNodeHeaders } from "better-auth/node";
import { getAuthInstance } from "../../../../decorators/auth.decorator.ts";
import { EnumUserRole } from "../../../../db/schema/index.ts";
import { getTypedI18n } from "../../../../utils/i18n-typed.ts";
import { EnumContentType } from "../../../../db/schema/enum/enum-app.ts";
import { getPackageThumbnailUrl } from "../../../../utils/exam-utils.ts";

const PackageListQuery = Type.Object({
  search: Type.Optional(Type.String({ description: "Search term for package title" })),
  categoryId: Type.Optional(Type.String({ format: "uuid" })),
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
  sortOrder: Type.Optional(
    Type.String({ description: "Sort order: asc or desc", default: "desc" }),
  ),
  page: Type.Optional(Type.Number({ default: 1, minimum: 1 })),
  limit: Type.Optional(Type.Number({ default: 10, minimum: 1, maximum: 50 })),
});

const PackageResponseItem = Type.Object({
  id: Type.String({ format: "uuid" }),
  categoryId: Type.String({ format: "uuid" }),
  title: Type.String(),
  examType: Type.String(),
  durationMinutes: Type.Number(),
  thumbnail: Type.Union([Type.String(), Type.Null()]),
  description: Type.Union([Type.String(), Type.Null()]),
  requiredTier: Type.Union([Type.String(), Type.Null()]),
  educationGradeId: Type.Union([Type.Number(), Type.Null()]),
  categoryName: Type.Union([Type.String(), Type.Null()]),
  educationGradeName: Type.Union([Type.String(), Type.Null()]),
  isActive: Type.Boolean(),
  isNew: Type.Boolean(),
  versionId: Type.Union([Type.Number(), Type.Null()]),
  totalSections: Type.Number(),
  createdAt: Type.String({ format: "date-time" }),
  updatedAt: Type.String({ format: "date-time" }),
});

const ListPackagesResponse = Type.Object({
  success: Type.Boolean(),
  message: Type.String(),
  data: Type.Object({
    items: Type.Array(PackageResponseItem),
    meta: Type.Object({
      total: Type.Number(),
      page: Type.Number(),
      limit: Type.Number(),
      totalPages: Type.Number(),
    }),
  }),
});

const listPackagesRoute: FastifyPluginAsyncTypebox = async (app) => {
  app.route({
    url: "/list",
    method: "POST",
    schema: {
      tags: ["Exam Packages"],
      body: PackageListQuery,
      response: {
        200: ListPackagesResponse,
        "4xx": Type.Object({ success: Type.Boolean({ default: false }), message: Type.String() }),
        "5xx": Type.Object({ success: Type.Boolean({ default: false }), message: Type.String() }),
      },
    },
    handler: withErrorHandler(async function handler(
      request: FastifyRequest<{ Body: typeof PackageListQuery.static }>,
      reply: FastifyReply,
    ) {
      const { t } = getTypedI18n(request);
      // Determine user role from session
      const session = await getAuthInstance(app).api.getSession({
        headers: fromNodeHeaders(request.headers),
      });
      const user = session?.user;
      const isAdmin = user?.role === EnumUserRole.ADMIN;

      const {
        search,
        categoryId,
        examType,
        isActive,
        educationGradeId,
        sortOrder = "desc",
        page = 1,
        limit = 10,
      } = request.body;

      let { sortBy = "updatedAt" } = request.body;

      const offset = (page - 1) * limit;
      const conditions = [];

      const latestVersionId = (app as any).versionCache.get(EnumContentType.EXAM);

      if (!isAdmin) {
        // Client must only see active packages
        conditions.push(eq(examPackages.isActive, true));
        // Force sorting ignoring isActive for clients
        if (sortBy === "isActive") sortBy = "title";
      } else {
        // Admin can filter by active status
        if (isActive !== undefined) conditions.push(eq(examPackages.isActive, isActive));
      }

      if (categoryId) conditions.push(eq(examPackages.categoryId, categoryId));
      if (examType) conditions.push(eq(examPackages.examType, examType as any));
      if (educationGradeId) conditions.push(eq(examPackages.educationGradeId, educationGradeId));

      if (search && search.trim() !== "") {
        const searchTerm = `%${search.trim().toLowerCase()}%`;
        conditions.push(ilike(examPackages.title, searchTerm));
      }

      // Build Query
      let baseQuery = db
        .select({
          package: examPackages,
          categoryName: educationCategories.name,
          educationGradeName: educationGrades.name,
          totalSections: sql<number>`count(${examPackageSections.id})::int`,
          isNew: latestVersionId
            ? sql<boolean>`${examPackages.versionId} = ${latestVersionId}`.as("isNew")
            : sql<boolean>`false`.as("isNew"),
        })
        .from(examPackages)
        .leftJoin(educationCategories, eq(examPackages.categoryId, educationCategories.id))
        .leftJoin(educationGrades, eq(examPackages.educationGradeId, educationGrades.id))
        .leftJoin(examPackageSections, eq(examPackages.id, examPackageSections.packageId))
        .groupBy(examPackages.id, educationCategories.id, educationGrades.id);

      if (conditions.length > 0) {
        baseQuery = baseQuery.where(and(...conditions)) as any;
      }

      // Sorting
      const orderDir = sortOrder === "asc" ? "asc" : "desc";
      let queryWithSort;

      switch (sortBy) {
        case "isActive":
          queryWithSort =
            orderDir === "asc"
              ? baseQuery.orderBy(asc(examPackages.isActive))
              : baseQuery.orderBy(desc(examPackages.isActive));
          break;
        case "updatedAt":
          queryWithSort =
            orderDir === "asc"
              ? baseQuery.orderBy(asc(examPackages.updatedAt))
              : baseQuery.orderBy(desc(examPackages.updatedAt));
          break;
        case "durationMinutes":
          queryWithSort =
            orderDir === "asc"
              ? baseQuery.orderBy(asc(examPackages.durationMinutes))
              : baseQuery.orderBy(desc(examPackages.durationMinutes));
          break;
        case "categoryId":
          queryWithSort =
            orderDir === "asc"
              ? baseQuery.orderBy(asc(examPackages.categoryId))
              : baseQuery.orderBy(desc(examPackages.categoryId));
          break;
        case "examType":
          queryWithSort =
            orderDir === "asc"
              ? baseQuery.orderBy(asc(examPackages.examType))
              : baseQuery.orderBy(desc(examPackages.examType));
          break;
        case "educationGradeId":
          queryWithSort =
            orderDir === "asc"
              ? baseQuery.orderBy(asc(examPackages.educationGradeId))
              : baseQuery.orderBy(desc(examPackages.educationGradeId));
          break;
        case "createdAt":
          queryWithSort =
            orderDir === "asc"
              ? baseQuery.orderBy(asc(examPackages.createdAt))
              : baseQuery.orderBy(desc(examPackages.createdAt));
          break;
        case "versionId":
          queryWithSort =
            orderDir === "asc"
              ? baseQuery.orderBy(asc(examPackages.versionId))
              : baseQuery.orderBy(desc(examPackages.versionId));
          break;
        case "title":
        default:
          queryWithSort =
            orderDir === "asc"
              ? baseQuery.orderBy(asc(examPackages.title))
              : baseQuery.orderBy(desc(examPackages.title));
          break;
      }

      // Count
      const countResult = await db
        .select({ count: sql<number>`count(*)` })
        .from(queryWithSort.as("subquery"));

      const total = Number(countResult[0]?.count || 0);
      const totalPages = Math.ceil(total / limit);

      // Fetch
      const items = await queryWithSort.limit(limit).offset(offset);

      return reply.status(200).send({
        success: true,
        message: t(($) => $.exam.packages.list.success),
        data: {
          items: items.map((r) => {
            const p = r.package;
            return {
              ...p,
              thumbnail: getPackageThumbnailUrl(p.thumbnail),
              categoryName: r.categoryName,
              educationGradeName: r.educationGradeName,
              totalSections: Number(r.totalSections),
              isNew: !!r.isNew,
              createdAt: p.createdAt.toISOString(),
              updatedAt: p.updatedAt.toISOString(),
            };
          }),
          meta: {
            total,
            page,
            limit,
            totalPages,
          },
        },
      });
    }),
  });
};

export default listPackagesRoute;
