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
import { EnumSolutionType } from "../../../../db/schema/exam/enums.ts";
import type { UploadedFile } from "../../../../types/file.ts";
import {
  processBlockNoteFiles,
  replaceBlockNoteUrls,
  resolveBlockNoteUrls,
} from "../../../../utils/blocknote-utils.ts";

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

const CreateQuestionSolutionResponse = Type.Object({
  success: Type.Boolean(),
  message: Type.String(),
  data: QuestionSolutionResponseItem,
});

const createQuestionSolutionRoute: FastifyPluginAsyncTypebox = async (app) => {
  app.route({
    url: "/create",
    method: "POST",
    schema: {
      tags: ["Admin Exam Question Solutions"],
      consumes: ["multipart/form-data"],
      response: {
        201: CreateQuestionSolutionResponse,
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

      const { questionId, title, content, solutionType, order, requiredTier } = body;

      if (!questionId) {
        return reply.badRequest(t(($) => $.exam.question_solutions.create.invalidQuestion));
      }

      // Verify that the parent question exists
      const existingQuestion = await db.query.examQuestions.findFirst({
        where: eq(examQuestions.id, questionId),
      });

      if (!existingQuestion) {
        return reply.badRequest(t(($) => $.exam.question_solutions.create.invalidQuestion));
      }

      // Create the solution record
      const [newSolution] = await db
        .insert(examQuestionSolutions)
        .values({
          questionId,
          title,
          content: content || [],
          solutionType,
          order: order !== undefined ? order : 0,
          requiredTier: requiredTier || "free",
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

        // Update the solution with final content
        await db
          .update(examQuestionSolutions)
          .set({
            content: finalContent,
          })
          .where(eq(examQuestionSolutions.id, newSolution.id));
      }

      return reply.status(201).send({
        success: true,
        message: t(($) => $.exam.question_solutions.create.success),
        data: {
          ...newSolution,
          content: resolveBlockNoteUrls(finalContent),
          createdAt: newSolution.createdAt.toISOString(),
          updatedAt: newSolution.updatedAt.toISOString(),
        },
      });
    }),
  });
};

export default createQuestionSolutionRoute;
