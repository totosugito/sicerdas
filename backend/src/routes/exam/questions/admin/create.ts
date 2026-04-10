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
import {
  EnumDifficultyLevel,
  EnumQuestionType,
  EnumScoringStrategy,
} from "../../../../db/schema/exam/enums.ts";
import type { UploadedFile } from "../../../../types/file.ts";
import { processBlockNoteFiles, replaceBlockNoteUrls } from "../../../../utils/blocknote-utils.ts";

const VariableFormulasType = Type.Optional(
  Type.Object({
    variables: Type.Array(Type.Record(Type.String(), Type.Union([Type.String(), Type.Number()]))),
    solutions: Type.Optional(Type.Record(Type.String(), Type.String())),
  }),
);

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

const CreateQuestionResponse = Type.Object({
  success: Type.Boolean(),
  message: Type.String(),
  data: QuestionResponseItem,
});

const createQuestionRoute: FastifyPluginAsyncTypebox = async (app) => {
  app.route({
    url: "/create",
    method: "POST",
    schema: {
      tags: ["Admin Exam Questions"],
      consumes: ["multipart/form-data"],
      response: {
        201: CreateQuestionResponse,
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
      const userId = request.session.user.id;

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

      if (!subjectId) {
        return reply.badRequest(t(($) => $.exam.questions.create.invalidSubject));
      }

      // 1. Verify that the subject exists
      const existingSubject = await db.query.examSubjects.findFirst({
        where: eq(examSubjects.id, subjectId),
      });

      if (!existingSubject) {
        return reply.badRequest(t(($) => $.exam.questions.create.invalidSubject));
      }

      // 2. Verify passage exists (if provided)
      if (passageId) {
        const existingPassage = await db.query.examPassages.findFirst({
          where: eq(examPassages.id, passageId),
        });
        if (!existingPassage) {
          return reply.badRequest(t(($) => $.exam.questions.create.invalidPassage));
        }
      }

      // Create the question first to get the ID
      const [newQuestion] = await db
        .insert(examQuestions)
        .values({
          subjectId,
          passageId,
          content: content || [],
          reasonContent: reasonContent || [],
          difficulty: difficulty || EnumDifficultyLevel.MEDIUM,
          type: type || EnumQuestionType.MULTIPLE_CHOICE,
          maxScore: maxScore ?? 1,
          scoringStrategy: scoringStrategy ?? EnumScoringStrategy.ALL_OR_NOTHING,
          requiredTier: requiredTier !== undefined ? requiredTier : "free",
          educationGradeId:
            educationGradeId === null || educationGradeId === 0 || (educationGradeId as any) === ""
              ? null
              : Number(educationGradeId),
          isActive: isActive !== undefined ? isActive : true,
          variableFormulas,
          createdByUserId: userId,
        })
        .returning();

      // Process uploaded files if any
      let finalContent = content || [];
      let finalReasonContent = reasonContent || [];

      if (files.length > 0) {
        const urlMap = await processBlockNoteFiles(
          env.server.uploadsQuestionDir,
          newQuestion.id,
          files,
          newQuestion.createdAt,
        );

        // Replace blob URLs with final URLs in content
        finalContent = replaceBlockNoteUrls(finalContent, urlMap);
        finalReasonContent = replaceBlockNoteUrls(finalReasonContent, urlMap);

        // Update the question with final content
        await db
          .update(examQuestions)
          .set({
            content: finalContent,
            reasonContent: finalReasonContent,
          })
          .where(eq(examQuestions.id, newQuestion.id));
      }

      return reply.status(201).send({
        success: true,
        message: t(($) => $.exam.questions.create.success),
        data: {
          ...newQuestion,
          content: finalContent,
          reasonContent: finalReasonContent,
          createdAt: newQuestion.createdAt.toISOString(),
          updatedAt: newQuestion.updatedAt.toISOString(),
        },
      });
    }),
  });
};

export default createQuestionRoute;
