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
  resolveBlockNoteUrls,
} from "../../../../utils/blocknote-utils.ts";

const QuestionOptionResponseItem = Type.Object({
  id: Type.String({ format: "uuid" }),
  questionId: Type.String({ format: "uuid" }),
  content: Type.Array(Type.Record(Type.String(), Type.Unknown())),
  isCorrect: Type.Boolean(),
  score: Type.Integer(),
  order: Type.Number(),
});

const CreateQuestionOptionResponse = Type.Object({
  success: Type.Boolean(),
  message: Type.String(),
  data: QuestionOptionResponseItem,
});

const createQuestionOptionRoute: FastifyPluginAsyncTypebox = async (app) => {
  app.route({
    url: "/create",
    method: "POST",
    schema: {
      tags: ["Admin Exam Question Options"],
      consumes: ["multipart/form-data"],
      response: {
        201: CreateQuestionOptionResponse,
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
    handler: withErrorHandler(async function handler(request: FastifyRequest, reply: FastifyReply) {
      const { t } = getTypedI18n(request);

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

      if (!questionId) {
        return reply.badRequest(t(($) => $.exam.question_options.create.invalidQuestion));
      }

      // Verify that the parent question exists
      const existingQuestion = await db.query.examQuestions.findFirst({
        where: eq(examQuestions.id, questionId),
      });

      if (!existingQuestion) {
        return reply.badRequest(t(($) => $.exam.question_options.create.invalidQuestion));
      }

      // Create the option first to get the ID
      const [newOption] = await db
        .insert(examQuestionOptions)
        .values({
          questionId,
          content: content || [],
          isCorrect: isCorrect !== undefined ? isCorrect : false,
          score: score !== undefined ? score : 0,
          order: order !== undefined ? order : 0,
        })
        .returning();

      // Process uploaded files if any
      let finalContent = content || [];

      if (files.length > 0) {
        const urlMap = await processBlockNoteFiles(
          env.server.uploadsQuestionDir,
          questionId,
          files,
          existingQuestion.createdAt, // Use parent question's createdAt for path consistency
        );

        // Replace blob URLs with final URLs in content
        finalContent = replaceBlockNoteUrls(finalContent, urlMap);

        // Update the option with final content
        await db
          .update(examQuestionOptions)
          .set({
            content: finalContent,
          })
          .where(eq(examQuestionOptions.id, newOption.id));
      }

      return reply.status(201).send({
        success: true,
        message: t(($) => $.exam.question_options.create.success),
        data: {
          ...newOption,
          content: resolveBlockNoteUrls(finalContent),
        },
      });
    }),
  });
};

export default createQuestionOptionRoute;
