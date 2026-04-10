import type { FastifyPluginAsyncTypebox } from "@fastify/type-provider-typebox";
import type { FastifyReply, FastifyRequest } from "fastify";
import { Type } from "@sinclair/typebox";
import { db } from "../../../../db/db-pool.ts";
import { examQuestionSolutions } from "../../../../db/schema/exam/question-solutions.ts";
import { examQuestions } from "../../../../db/schema/exam/questions.ts";
import { eq } from "drizzle-orm";
import env from "../../../../config/env.config.ts";
import { withErrorHandler } from "../../../../utils/withErrorHandler.ts";
import { getTypedI18n } from "../../../../utils/i18n-typed.ts";
import type { UploadedFile } from "../../../../types/file.ts";
import {
  processBlockNoteFiles,
  replaceBlockNoteUrls,
  cleanupBlockNoteFiles,
  resolveBlockNoteUrls,
} from "../../../../utils/blocknote-utils.ts";

const UpdateQuestionSolutionParams = Type.Object({
  id: Type.String({ format: "uuid" }),
});

const QuestionSolutionResponseItem = Type.Object({
  id: Type.String({ format: "uuid" }),
  questionId: Type.String({ format: "uuid" }),
  title: Type.String(),
  content: Type.Array(Type.Record(Type.String(), Type.Unknown())),
  solutionType: Type.String(),
  order: Type.Number(),
  requiredTier: Type.Union([Type.String(), Type.Null()]),
  createdAt: Type.String({ format: "date-time" }),
  updatedAt: Type.String({ format: "date-time" }),
});

const UpdateQuestionSolutionResponse = Type.Object({
  success: Type.Boolean(),
  message: Type.String(),
  data: QuestionSolutionResponseItem,
});

const updateQuestionSolutionRoute: FastifyPluginAsyncTypebox = async (app) => {
  app.route({
    url: "/update/:id",
    method: "PUT",
    schema: {
      tags: ["Admin Exam Question Solutions"],
      consumes: ["multipart/form-data"],
      params: UpdateQuestionSolutionParams,
      response: {
        200: UpdateQuestionSolutionResponse,
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
      request: FastifyRequest<{ Params: typeof UpdateQuestionSolutionParams.static }>,
      reply: FastifyReply,
    ) {
      const { t } = getTypedI18n(request);
      const { id } = request.params;

      // Ensure solution exists
      const existingSolution = await db.query.examQuestionSolutions.findFirst({
        where: eq(examQuestionSolutions.id, id),
      });

      if (!existingSolution) {
        return reply.notFound(t(($) => $.exam.question_solutions.update.notFound));
      }

      // Parse multipart data
      const parts = request.parts();
      let body: any = {};
      const files: UploadedFile[] = [];

      for await (const part of parts) {
        if (part.type === "file") {
          files.push({
            buffer: await part.toBuffer(),
            filename: part.filename,
            mimetype: part.mimetype,
          });
        } else {
          if (part.fieldname === "data") {
            try {
              body = JSON.parse(part.value as string);
            } catch (e) {
              return reply.badRequest("Invalid JSON data");
            }
          }
        }
      }

      const { questionId, title, content, solutionType, order, requiredTier } = body;

      // Verify new question exists if provided
      if (questionId !== undefined) {
        const existingQuestion = await db.query.examQuestions.findFirst({
          where: eq(examQuestions.id, questionId),
        });
        if (!existingQuestion) {
          return reply.badRequest(t(($) => $.exam.question_solutions.update.invalidQuestion));
        }
      }

      // Process uploaded files if any
      let finalContent = content ?? (existingSolution.content as any[]);
      const targetQuestionId = questionId || existingSolution.questionId;

      if (files.length > 0) {
        // Fetch the parent question to get createdAt for path consistency
        const parentQuestion = await db.query.examQuestions.findFirst({
          where: eq(examQuestions.id, targetQuestionId),
        });

        const urlMap = await processBlockNoteFiles(
          env.server.uploadsQuestionDir,
          targetQuestionId,
          files,
          parentQuestion?.createdAt,
        );

        // Replace blob URLs with final URLs
        if (content !== undefined) {
          finalContent = replaceBlockNoteUrls(content, urlMap);
        }
      }

      // Build dynamic update payload
      const updatePayload: any = {
        updatedAt: new Date(),
      };

      if (questionId !== undefined) updatePayload.questionId = questionId;
      if (title !== undefined) updatePayload.title = title;
      if (content !== undefined) updatePayload.content = finalContent;
      if (solutionType !== undefined) updatePayload.solutionType = solutionType;
      if (order !== undefined) updatePayload.order = order;
      if (requiredTier !== undefined) updatePayload.requiredTier = requiredTier;

      const [updatedSolution] = await db
        .update(examQuestionSolutions)
        .set(updatePayload)
        .where(eq(examQuestionSolutions.id, id))
        .returning();

      // Clean up orphaned files
      if (content !== undefined) {
        await cleanupBlockNoteFiles(
          existingSolution.content as any[],
          finalContent,
          env.server.uploadsQuestionDir,
          ["image"],
          request.log,
        );
      }

      return reply.status(200).send({
        success: true,
        message: t(($) => $.exam.question_solutions.update.success),
        data: {
          ...updatedSolution,
          content: resolveBlockNoteUrls(updatedSolution.content as any[]),
          createdAt: updatedSolution.createdAt.toISOString(),
          updatedAt: updatedSolution.updatedAt.toISOString(),
        },
      });
    }),
  });
};

export default updateQuestionSolutionRoute;
