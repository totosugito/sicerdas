import type { FastifyPluginAsyncTypebox } from "@fastify/type-provider-typebox";
import type { FastifyReply, FastifyRequest } from "fastify";
import { Type } from "@sinclair/typebox";
import { appVersion } from "../../../db/schema/app/app-version.ts";
import { books } from "../../../db/schema/book/books.ts";
import { examPackages } from "../../../db/schema/exam/packages.ts";
import { examPackageSections } from "../../../db/schema/exam/package-sections.ts";
import { db } from "../../../db/db-pool.ts";
import { eq, sql } from "drizzle-orm";
import { withErrorHandler } from "../../../utils/withErrorHandler.ts";
import { getTypedI18n } from "../../../utils/i18n-typed.ts";
import { EnumContentStatus } from "../../../db/schema/enum/enum-app.ts";

const DeleteVersionParams = Type.Object({
  id: Type.Number(),
});

const DeleteVersionResponse = Type.Object({
  success: Type.Boolean(),
  message: Type.String(),
});

const deleteVersionRoute: FastifyPluginAsyncTypebox = async (app) => {
  app.route({
    url: "/delete/:id",
    method: "DELETE",
    schema: {
      tags: ["Version"],
      params: DeleteVersionParams,
      response: {
        200: DeleteVersionResponse,
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
      request: FastifyRequest<{ Params: typeof DeleteVersionParams.static }>,
      reply: FastifyReply,
    ): Promise<typeof DeleteVersionResponse.static> {
      const { t } = getTypedI18n(request);
      const { id } = request.params;

      const existingVersion = await db.query.appVersion.findFirst({
        where: eq(appVersion.id, id),
      });

      if (!existingVersion) {
        return reply.notFound(t(($) => $.version.notFound));
      }

      // Referential Integrity Checks
      const [bookCount] = await db
        .select({ count: sql<number>`count(*)` })
        .from(books)
        .where(eq(books.versionId, id));
      if (Number(bookCount.count) > 0) {
        return reply.badRequest(t(($) => $.version.delete.inUse));
      }

      const [packageCount] = await db
        .select({ count: sql<number>`count(*)` })
        .from(examPackages)
        .where(eq(examPackages.versionId, id));
      if (Number(packageCount.count) > 0) {
        return reply.badRequest(t(($) => $.version.delete.inUse));
      }

      const [sectionCount] = await db
        .select({ count: sql<number>`count(*)` })
        .from(examPackageSections)
        .where(eq(examPackageSections.versionId, id));
      if (Number(sectionCount.count) > 0) {
        return reply.badRequest(t(($) => $.version.delete.inUse));
      }

      await db.delete(appVersion).where(eq(appVersion.id, id));

      // Refresh cache if it was published
      if (existingVersion.status === EnumContentStatus.PUBLISHED) {
        await app.versionCache.refresh(existingVersion.dataType);
      }

      return reply.status(200).send({
        success: true,
        message: t(($) => $.version.delete.success),
      });
    }),
  });
};

export default deleteVersionRoute;
