import type { FastifyPluginAsyncTypebox } from "@fastify/type-provider-typebox";
import type { FastifyReply, FastifyRequest } from "fastify";
import { Type } from "@sinclair/typebox";
import { db } from "../../../../db/db-pool.ts";
import { examQuestions } from "../../../../db/schema/exam/questions.ts";
import { eq } from "drizzle-orm";
import env from "../../../../config/env.config.ts";
import { withErrorHandler } from "../../../../utils/withErrorHandler.ts";
import { getTypedI18n } from "../../../../utils/i18n-typed.ts";
import { deleteStorageDirectory } from "../../../../utils/storage.ts";
import { syncSection, syncPassage, syncPackage } from "../../../../services/exam/index.ts";
import { examPackageQuestions } from "../../../../db/schema/exam/package-questions.ts";

const DeleteQuestionParams = Type.Object({
  id: Type.String({ format: "uuid" }),
});

const DeleteQuestionResponse = Type.Object({
  success: Type.Boolean(),
  message: Type.String(),
});

const deleteQuestionRoute: FastifyPluginAsyncTypebox = async (app) => {
  app.route({
    url: "/delete/:id",
    method: "DELETE",
    schema: {
      tags: ["Admin Exam Questions"],
      params: DeleteQuestionParams,
      response: {
        200: DeleteQuestionResponse,
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
      request: FastifyRequest<{ Params: typeof DeleteQuestionParams.static }>,
      reply: FastifyReply,
    ) {
      const { t } = getTypedI18n(request);
      const { id } = request.params;

      // Ensure question exists
      const existingQuestion = await db.query.examQuestions.findFirst({
        where: eq(examQuestions.id, id),
      });

      if (!existingQuestion) {
        return reply.notFound(t(($) => $.exam.questions.delete.notFound));
      }

      await db.transaction(async (tx) => {
        // Identify related sections before deleting
        const relatedSections = await tx
          .select({
            sectionId: examPackageQuestions.sectionId,
            packageId: examPackageQuestions.packageId,
          })
          .from(examPackageQuestions)
          .where(eq(examPackageQuestions.questionId, id));

        // Perform Hard Delete. The database schema has `onDelete: 'cascade'` for options
        // and solutions, so they will be automatically deleted by PostgreSQL.
        await tx.delete(examQuestions).where(eq(examQuestions.id, id));

        // Recalculate each affected section and package
        const uniquePackageIds = [...new Set(relatedSections.map((rs) => rs.packageId))];

        for (const rs of relatedSections) {
          await syncSection(rs.sectionId, tx);
        }

        for (const pkgId of uniquePackageIds) {
          await syncPackage(pkgId, tx);
        }

        // If a passage was associated, update its counters
        if (existingQuestion.passageId) {
          await syncPassage(existingQuestion.passageId, tx);
        }
      });

      // Clean up directory from disk
      await deleteStorageDirectory(
        env.server.uploadsQuestionDir,
        id,
        existingQuestion.createdAt,
        request.log,
      );

      return reply.status(200).send({
        success: true,
        message: t(($) => $.exam.questions.delete.success),
      });
    }),
  });
};

export default deleteQuestionRoute;
