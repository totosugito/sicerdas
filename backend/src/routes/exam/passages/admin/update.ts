import type { FastifyPluginAsyncTypebox } from "@fastify/type-provider-typebox";
import type { FastifyReply, FastifyRequest } from "fastify";
import { Type } from "@sinclair/typebox";
import { db } from "../../../../db/db-pool.ts";
import { examPassages } from "../../../../db/schema/exam/passages.ts";
import { examQuestions } from "../../../../db/schema/exam/questions.ts";
import { examSubjects } from "../../../../db/schema/exam/subjects.ts";
import { and, eq } from "drizzle-orm";
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

const UpdatePassageParams = Type.Object({
  id: Type.String({ format: "uuid" }),
});

const PassageResponseItem = Type.Object({
  id: Type.String({ format: "uuid" }),
  title: Type.Union([Type.String(), Type.Null()]),
  content: Type.Array(Type.Record(Type.String(), Type.Unknown())),
  isActive: Type.Boolean(),
  createdAt: Type.String({ format: "date-time" }),
  updatedAt: Type.String({ format: "date-time" }),
  subjectId: Type.String({ format: "uuid" }),
});

const UpdatePassageResponse = Type.Object({
  success: Type.Boolean(),
  message: Type.String(),
  data: PassageResponseItem,
});

const updatePassageRoute: FastifyPluginAsyncTypebox = async (app) => {
  app.route({
    url: "/update/:id",
    method: "PUT",
    schema: {
      tags: ["Admin Exam Passages"],
      consumes: ["multipart/form-data"],
      params: UpdatePassageParams,
      response: {
        200: UpdatePassageResponse,
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
        Params: typeof UpdatePassageParams.static;
      }>,
      reply: FastifyReply,
    ) {
      const { t } = getTypedI18n(request);
      const { id } = request.params;

      // Ensure passage exists
      const existingPassage = await db.query.examPassages.findFirst({
        where: eq(examPassages.id, id),
      });

      if (!existingPassage) {
        return reply.notFound(t(($) => $.exam.passages.update.notFound));
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

      const { title, content, isActive, subjectId } = body;

      // Process uploaded files if any
      let finalContent = content ?? (existingPassage.content as any[]);

      if (files.length > 0) {
        const urlMap = await processBlockNoteFiles(
          env.server.uploadsPassageDir,
          id,
          files,
          existingPassage.createdAt,
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

      if (title !== undefined) updatePayload.title = title;
      if (content !== undefined) updatePayload.content = finalContent;

      if (isActive !== undefined) {
        // Block deactivation if any active question still references this passage
        if (isActive === false && existingPassage.isActive === true) {
          const activeQuestion = await db.query.examQuestions.findFirst({
            columns: { id: true },
            where: and(eq(examQuestions.passageId, id), eq(examQuestions.isActive, true)),
          });

          if (activeQuestion) {
            return reply.badRequest(t(($) => $.exam.passages.update.hasActiveQuestions));
          }
        }
        updatePayload.isActive = isActive;
      }

      if (subjectId !== undefined) {
        // Ensure subject exists
        const existingSubject = await db.query.examSubjects.findFirst({
          where: eq(examSubjects.id, subjectId),
        });

        if (!existingSubject) {
          return reply.notFound(t(($) => $.exam.subjects.detail.notFound));
        }

        updatePayload.subjectId = subjectId;
      }

      const [updatedPassage] = await db
        .update(examPassages)
        .set(updatePayload)
        .where(eq(examPassages.id, id))
        .returning();

      // Clean up orphaned files
      if (content !== undefined) {
        await cleanupBlockNoteFiles(
          existingPassage.content as any[],
          finalContent,
          env.server.uploadsPassageDir,
          ["image"],
          request.log,
        );
      }

      return reply.status(200).send({
        success: true,
        message: t(($) => $.exam.passages.update.success),
        data: {
          ...updatedPassage,
          content: resolveBlockNoteUrls(updatedPassage.content as any[]),
          createdAt: updatedPassage.createdAt.toISOString(),
          updatedAt: updatedPassage.updatedAt.toISOString(),
        },
      });
    }),
  });
};

export default updatePassageRoute;
