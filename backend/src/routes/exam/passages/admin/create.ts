import type { FastifyPluginAsyncTypebox } from "@fastify/type-provider-typebox";
import type { FastifyReply, FastifyRequest } from "fastify";
import { Type } from "@sinclair/typebox";
import { db } from "../../../../db/db-pool.ts";
import { examPassages } from "../../../../db/schema/exam/passages.ts";
import { examSubjects } from "../../../../db/schema/exam/subjects.ts";
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

const PassageResponseItem = Type.Object({
  id: Type.String({ format: "uuid" }),
  title: Type.Union([Type.String(), Type.Null()]),
  content: Type.Array(Type.Record(Type.String(), Type.Unknown())),
  isActive: Type.Boolean(),
  createdAt: Type.String({ format: "date-time" }),
  updatedAt: Type.String({ format: "date-time" }),
  subjectId: Type.String({ format: "uuid" }),
});

const CreatePassageResponse = Type.Object({
  success: Type.Boolean(),
  message: Type.String(),
  data: PassageResponseItem,
});

const createPassageRoute: FastifyPluginAsyncTypebox = async (app) => {
  app.route({
    url: "/create",
    method: "POST",
    schema: {
      tags: ["Admin Exam Passages"],
      consumes: ["multipart/form-data"],
      response: {
        201: CreatePassageResponse,
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

      const { title, content, isActive, subjectId } = body;

      if (!subjectId) {
        return reply.badRequest(t(($) => $.exam.subjects.detail.notFound));
      }

      // Ensure subject exists
      const existingSubject = await db.query.examSubjects.findFirst({
        where: eq(examSubjects.id, subjectId),
      });

      if (!existingSubject) {
        return reply.notFound(t(($) => $.exam.subjects.detail.notFound));
      }

      // Create the passage record first to get the ID
      const [newPassage] = await db
        .insert(examPassages)
        .values({
          title: title || null,
          content: content || [],
          isActive: isActive !== undefined ? isActive : true,
          subjectId,
          createdByUserId: userId,
        })
        .returning();

      // Process uploaded files if any
      let finalContent = content || [];

      if (files.length > 0) {
        const urlMap = await processBlockNoteFiles(
          env.server.uploadsPassageDir,
          newPassage.id,
          files,
          newPassage.createdAt,
        );

        // Replace blob URLs with final URLs in content
        finalContent = replaceBlockNoteUrls(finalContent, urlMap);

        // Update the passage with final content
        await db
          .update(examPassages)
          .set({
            content: finalContent,
          })
          .where(eq(examPassages.id, newPassage.id));
      }

      return reply.status(201).send({
        success: true,
        message: t(($) => $.exam.passages.create.success),
        data: {
          ...newPassage,
          content: resolveBlockNoteUrls(finalContent),
          createdAt: newPassage.createdAt.toISOString(),
          updatedAt: newPassage.updatedAt.toISOString(),
        },
      });
    }),
  });
};

export default createPassageRoute;
