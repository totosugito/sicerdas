import type { FastifyPluginAsyncTypebox } from "@fastify/type-provider-typebox";
import type { FastifyReply, FastifyRequest } from "fastify";
import { Type } from "@sinclair/typebox";
import { db } from "../../../db/db-pool.ts";
import { examPackageSections, examPackages, examSessions } from "../../../db/schema/exam/index.ts";
import { EnumExamSessionStatus, EnumExamSessionMode } from "../../../db/schema/exam/enums.ts";
import { and, desc, eq, sql } from "drizzle-orm";
import { withErrorHandler } from "../../../utils/withErrorHandler.ts";
import { getTypedI18n } from "../../../utils/i18n-typed.ts";

import { fromNodeHeaders } from "better-auth/node";
import { getAuthInstance } from "../../../decorators/auth.decorator.ts";

const SectionListQuery = Type.Object({ packageId: Type.String({ format: "uuid" }) });

const SectionResponseItem = Type.Object({
  id: Type.String({ format: "uuid" }),
  title: Type.String(),
  groupName: Type.Union([Type.String(), Type.Null()]),
  description: Type.Union([Type.String(), Type.Null()]),
  durationMinutes: Type.Union([Type.Number(), Type.Null()]),
  totalQuestions: Type.Number(),
  activeQuestions: Type.Number(),
  order: Type.Number(),
  userStatus: Type.Union([Type.Enum(EnumExamSessionStatus), Type.Null()]),
  userMode: Type.Union([Type.Enum(EnumExamSessionMode), Type.Null()]),
  bestTryoutScore: Type.Union([Type.Number(), Type.Null()]),
});

const ListSectionsResponse = Type.Object({
  success: Type.Boolean(),
  message: Type.String(),
  data: Type.Array(SectionResponseItem),
});

const listSectionsRoute: FastifyPluginAsyncTypebox = async (app) => {
  app.post("/list", {
    schema: {
      tags: ["Exam Package Sections"],
      summary: "List sections for an exam package",
      description:
        "Returns a list of active sections for a specific exam package, including user progress and best scores if authenticated.",
      body: SectionListQuery,
      response: {
        200: ListSectionsResponse,
        "4xx": Type.Object({
          success: Type.Boolean({ default: false }),
          message: Type.String(),
        }),
        "5xx": Type.Object({
          success: Type.Boolean({ default: false }),
          message: Type.String(),
        }),
      },
    },
    handler: withErrorHandler(async function handler(
      req: FastifyRequest<{ Body: typeof SectionListQuery.static }>,
      reply: FastifyReply,
    ) {
      const { t } = getTypedI18n(req);
      const { packageId } = req.body;

      // Manually fetch session
      const session = await getAuthInstance(app).api.getSession({
        headers: fromNodeHeaders(req.headers),
      });
      const userId = session?.user?.id;

      const pkg = await db.query.examPackages.findFirst({
        where: and(eq(examPackages.id, packageId), eq(examPackages.isActive, true)),
        columns: { id: true },
      });

      if (!pkg) return reply.notFound(t(($) => $.exam.packages.detail.notFound));

      const sectionColumns = {
        id: examPackageSections.id,
        title: examPackageSections.title,
        groupName: examPackageSections.groupName,
        description: examPackageSections.description,
        durationMinutes: examPackageSections.durationMinutes,
        totalQuestions: examPackageSections.totalQuestions,
        activeQuestions: examPackageSections.activeQuestions,
        order: examPackageSections.order,
      };

      let sections;

      if (userId) {
        // 1. Latest session per section (DISTINCT ON is Postgres best practice)
        const latestSessions = db
          .selectDistinctOn([examSessions.sectionId], {
            sectionId: examSessions.sectionId,
            status: examSessions.status,
            mode: examSessions.mode,
          })
          .from(examSessions)
          .where(eq(examSessions.userId, userId))
          .orderBy(examSessions.sectionId, desc(examSessions.createdAt))
          .as("latest");

        // 2. Best tryout score per section
        const bestScores = db
          .select({
            sectionId: examSessions.sectionId,
            score: sql<number>`MAX(${examSessions.score})`.as("score"),
          })
          .from(examSessions)
          .where(
            and(eq(examSessions.userId, userId), eq(examSessions.mode, EnumExamSessionMode.TRYOUT)),
          )
          .groupBy(examSessions.sectionId)
          .as("best");

        // 3. Optimized query for Authenticated User
        sections = await db
          .select({
            ...sectionColumns,
            userStatus: latestSessions.status,
            userMode: latestSessions.mode,
            bestTryoutScore: bestScores.score,
          })
          .from(examPackageSections)
          .leftJoin(latestSessions, eq(latestSessions.sectionId, examPackageSections.id))
          .leftJoin(bestScores, eq(bestScores.sectionId, examPackageSections.id))
          .where(
            and(
              eq(examPackageSections.packageId, packageId),
              eq(examPackageSections.isActive, true),
            ),
          )
          .orderBy(examPackageSections.order);
      } else {
        // 3. Optimized query for Guest User (No Joins)
        sections = await db
          .select({
            ...sectionColumns,
            userStatus: sql<string | null>`NULL`,
            userMode: sql<string | null>`NULL`,
            bestTryoutScore: sql<number | null>`NULL`,
          })
          .from(examPackageSections)
          .where(
            and(
              eq(examPackageSections.packageId, packageId),
              eq(examPackageSections.isActive, true),
            ),
          )
          .orderBy(examPackageSections.order);
      }

      return reply.status(200).send({
        success: true,
        message: t(($) => $.exam.package_sections.list.success),
        data: sections,
      });
    }),
  });
};

export default listSectionsRoute;
