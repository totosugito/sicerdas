import type { FastifyPluginAsyncTypebox } from "@fastify/type-provider-typebox";
import type { FastifyReply, FastifyRequest } from "fastify";
import { Type } from "@sinclair/typebox";
import { db } from "../../../../db/db-pool.ts";
import { examQuestionOptions } from "../../../../db/schema/exam/question-options.ts";
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

const UpdateQuestionOptionParams = Type.Object({
  id: Type.String({ format: "uuid" }),
});

const QuestionOptionResponseItem = Type.Object({
  id: Type.String({ format: "uuid" }),
  questionId: Type.String({ format: "uuid" }),
  content: Type.Array(Type.Record(Type.String(), Type.Unknown())),
  isCorrect: Type.Boolean(),
  score: Type.Integer(),
  order: Type.Number(),
});

const UpdateQuestionOptionResponse = Type.Object({
  success: Type.Boolean(),
  message: Type.String(),
  data: QuestionOptionResponseItem,
});

const updateQuestionOptionRoute: FastifyPluginAsyncTypebox = async (app) => {
  app.route({
    url: "/update/:id",
    method: "PUT",
    schema: {
      tags: ["Admin Exam Question Options"],
      consumes: ["multipart/form-data"],
      params: UpdateQuestionOptionParams,
      response: {
        200: UpdateQuestionOptionResponse,
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
      request: FastifyRequest<{
        Params: typeof UpdateQuestionOptionParams.static;
      }>,
      reply: FastifyReply,
    ) {
      const { t } = getTypedI18n(request);
      const { id } = request.params;

      // Ensure option exists
      const existingOption = await db.query.examQuestionOptions.findFirst({
        where: eq(examQuestionOptions.id, id),
      });

      if (!existingOption) {
        return reply.notFound(t(($) => $.exam.question_options.update.notFound));
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

      const { questionId, content, isCorrect, score, order } = body;

      // Verify new question exists if provided
      if (questionId !== undefined) {
        const existingQuestion = await db.query.examQuestions.findFirst({
          where: eq(examQuestions.id, questionId),
        });
        if (!existingQuestion) {
          return reply.badRequest(t(($) => $.exam.question_options.update.invalidQuestion));
        }
      }

      // Process uploaded files if any
      let finalContent = content ?? (existingOption.content as any[]);
      const targetQuestionId = questionId || existingOption.questionId;

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
      const updatePayload: any = {};

      if (questionId !== undefined) updatePayload.questionId = questionId;
      if (content !== undefined) updatePayload.content = finalContent;
      if (isCorrect !== undefined) updatePayload.isCorrect = isCorrect;
      if (score !== undefined) updatePayload.score = score;
      if (order !== undefined) updatePayload.order = order;

      const [updatedOption] = await db
        .update(examQuestionOptions)
        .set(updatePayload)
        .where(eq(examQuestionOptions.id, id))
        .returning();

      // Clean up orphaned files
      if (content !== undefined) {
        await cleanupBlockNoteFiles(
          existingOption.content as any[],
          finalContent,
          env.server.uploadsQuestionDir,
          ["image"],
          request.log,
        );
      }

      return reply.status(200).send({
        success: true,
        message: t(($) => $.exam.question_options.update.success),
        data: {
          ...updatedOption,
          content: resolveBlockNoteUrls(updatedOption.content as any[]),
        },
      });
    }),
  });
};

export default updateQuestionOptionRoute;
