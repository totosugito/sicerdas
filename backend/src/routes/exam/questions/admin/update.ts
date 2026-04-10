import type { FastifyPluginAsyncTypebox } from "@fastify/type-provider-typebox";
import type { FastifyReply, FastifyRequest } from "fastify";
import { Type } from "@sinclair/typebox";
import { db } from "../../../../db/db-pool.ts";
import { examQuestions } from "../../../../db/schema/exam/questions.ts";
import { examSubjects } from "../../../../db/schema/exam/subjects.ts";
import { examPassages } from "../../../../db/schema/exam/passages.ts";
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

const VariableFormulasType = Type.Optional(
  Type.Object({
    variables: Type.Array(Type.Record(Type.String(), Type.Union([Type.String(), Type.Number()]))),
    solutions: Type.Optional(Type.Record(Type.String(), Type.String())),
  }),
);

const UpdateQuestionParams = Type.Object({
  id: Type.String({ format: "uuid" }),
});

const QuestionResponseItem = Type.Object({
  id: Type.String({ format: "uuid" }),
  subjectId: Type.String({ format: "uuid" }),
  passageId: Type.Union([Type.String({ format: "uuid" }), Type.Null()]),
  content: Type.Array(Type.Record(Type.String(), Type.Unknown())),
  reasonContent: Type.Optional(Type.Array(Type.Record(Type.String(), Type.Unknown()))),
  difficulty: Type.String(),
  type: Type.String(),
  maxScore: Type.Integer(),
  scoringStrategy: Type.String(),
  requiredTier: Type.Union([Type.String(), Type.Null()]),
  educationGradeId: Type.Union([Type.Number(), Type.Null()]),
  isActive: Type.Boolean(),
  variableFormulas: VariableFormulasType,
  createdAt: Type.String({ format: "date-time" }),
  updatedAt: Type.String({ format: "date-time" }),
});

const UpdateQuestionResponse = Type.Object({
  success: Type.Boolean(),
  message: Type.String(),
  data: QuestionResponseItem,
});

const updateQuestionRoute: FastifyPluginAsyncTypebox = async (app) => {
  app.route({
    url: "/update/:id",
    method: "PUT",
    schema: {
      tags: ["Admin Exam Questions"],
      consumes: ["multipart/form-data"],
      params: UpdateQuestionParams,
      response: {
        200: UpdateQuestionResponse,
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
        Params: typeof UpdateQuestionParams.static;
      }>,
      reply: FastifyReply,
    ) {
      const { t } = getTypedI18n(request);
      const { id } = request.params;

      // Ensure question exists
      const existingQuestion = await db.query.examQuestions.findFirst({
        where: eq(examQuestions.id, id),
      });

      if (!existingQuestion) {
        return reply.notFound(t(($) => $.exam.questions.update.notFound));
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

      const {
        subjectId,
        passageId,
        content,
        difficulty,
        type,
        maxScore,
        scoringStrategy,
        requiredTier,
        educationGradeId,
        isActive,
        variableFormulas,
        reasonContent,
      } = body;

      // Verify new subject exists if provided
      if (subjectId !== undefined) {
        const existingSubject = await db.query.examSubjects.findFirst({
          where: eq(examSubjects.id, subjectId),
        });
        if (!existingSubject) {
          return reply.badRequest(t(($) => $.exam.questions.update.invalidSubject));
        }
      }

      // Verify new passage exists if provided (and not explicitly nullified)
      if (passageId !== undefined && passageId !== null) {
        const existingPassage = await db.query.examPassages.findFirst({
          where: eq(examPassages.id, passageId),
        });
        if (!existingPassage) {
          return reply.badRequest(t(($) => $.exam.questions.update.invalidPassage));
        }
      }

      // Process uploaded files if any
      let finalContent = content ?? existingQuestion.content;
      let finalReasonContent = reasonContent ?? existingQuestion.reasonContent;

      if (files.length > 0) {
        const urlMap = await processBlockNoteFiles(
          env.server.uploadsQuestionDir,
          id,
          files,
          existingQuestion.createdAt,
        );

        // Replace blob URLs with final URLs
        if (content !== undefined) {
          finalContent = replaceBlockNoteUrls(content, urlMap);
        }
        if (reasonContent !== undefined) {
          finalReasonContent = replaceBlockNoteUrls(reasonContent, urlMap);
        }
      }

      // Build dynamic update payload
      const updatePayload: any = {
        updatedAt: new Date(),
      };

      if (subjectId !== undefined) updatePayload.subjectId = subjectId;
      if (passageId !== undefined) {
        updatePayload.passageId = passageId === "" || passageId === "null" ? null : passageId;
      }
      if (content !== undefined) updatePayload.content = finalContent;
      if (reasonContent !== undefined) updatePayload.reasonContent = finalReasonContent;
      if (difficulty !== undefined) updatePayload.difficulty = difficulty;
      if (type !== undefined) updatePayload.type = type;
      if (maxScore !== undefined) updatePayload.maxScore = maxScore;
      if (scoringStrategy !== undefined) updatePayload.scoringStrategy = scoringStrategy;
      if (requiredTier !== undefined) updatePayload.requiredTier = requiredTier;
      if (educationGradeId !== undefined) {
        updatePayload.educationGradeId =
          educationGradeId === null || educationGradeId === 0 || (educationGradeId as any) === ""
            ? null
            : Number(educationGradeId);
      }
      if (isActive !== undefined) updatePayload.isActive = isActive;
      if (variableFormulas !== undefined) updatePayload.variableFormulas = variableFormulas;

      const [updatedQuestion] = await db
        .update(examQuestions)
        .set(updatePayload)
        .where(eq(examQuestions.id, id))
        .returning();

      // Clean up orphaned files
      if (content !== undefined || reasonContent !== undefined) {
        await cleanupBlockNoteFiles(
          [...(existingQuestion.content || []), ...(existingQuestion.reasonContent || [])],
          [...(finalContent || []), ...(finalReasonContent || [])],
          env.server.uploadsQuestionDir,
          ["image"],
          request.log,
        );
      }

      return reply.status(200).send({
        success: true,
        message: t(($) => $.exam.questions.update.success),
        data: {
          ...updatedQuestion,
          content: resolveBlockNoteUrls(updatedQuestion.content as any[]),
          reasonContent: resolveBlockNoteUrls(updatedQuestion.reasonContent as any[]),
          createdAt: updatedQuestion.createdAt.toISOString(),
          updatedAt: updatedQuestion.updatedAt.toISOString(),
        },
      });
    }),
  });
};

export default updateQuestionRoute;
