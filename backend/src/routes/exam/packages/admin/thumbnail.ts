import type { FastifyPluginAsyncTypebox } from "@fastify/type-provider-typebox";
import type { FastifyReply, FastifyRequest } from "fastify";
import { Type } from "@sinclair/typebox";
import { eq } from "drizzle-orm";
import sharp from "sharp";
import { db } from "../../../../db/db-pool.ts";
import { examPackages } from "../../../../db/schema/exam/packages.ts";
import { withErrorHandler } from "../../../../utils/withErrorHandler.ts";
import { getTypedI18n } from "../../../../utils/i18n-typed.ts";
import { createUniqueFileName } from "../../../../utils/my-utils.ts";
import {
  getPackageThumbnailUrl,
  savePackageThumbnail,
  deletePackageThumbnail,
} from "../../../../utils/exam-utils.ts";
import type { UploadedFile } from "../../../../types/file.ts";

const ThumbnailParams = Type.Object({
  id: Type.String({ format: "uuid" }),
});

const ThumbnailQuery = Type.Object({
  action: Type.Optional(Type.String()),
});

const thumbnailRoute: FastifyPluginAsyncTypebox = async (app) => {
  app.route({
    url: "/thumbnail/:id",
    method: "PATCH",
    schema: {
      tags: ["Admin Exam Packages"],
      summary: "Upload or remove package thumbnail",
      description:
        "Uploads a thumbnail for an existing exam package. Supports multipart/form-data. Use ?action=remove to delete.",
      params: ThumbnailParams,
      querystring: ThumbnailQuery,
      consumes: ["multipart/form-data"],
      response: {
        200: Type.Object({
          success: Type.Boolean(),
          message: Type.String(),
          data: Type.Object({
            id: Type.String(),
            thumbnail: Type.Union([Type.String(), Type.Null()]),
          }),
        }),
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
        Params: typeof ThumbnailParams.static;
        Querystring: typeof ThumbnailQuery.static;
      }>,
      reply: FastifyReply,
    ) {
      const { t } = getTypedI18n(request);
      const { id } = request.params;
      const { action } = request.query;

      // Check if package exists
      const [existingPackage] = await db
        .select({
          id: examPackages.id,
          thumbnail: examPackages.thumbnail,
          createdAt: examPackages.createdAt,
        })
        .from(examPackages)
        .where(eq(examPackages.id, id))
        .limit(1);

      if (!existingPackage) {
        return reply.notFound(t(($) => $.exam.packages.delete.notFound));
      }

      // Handle REMOVE action
      if (action === "remove") {
        if (existingPackage.thumbnail) {
          await deletePackageThumbnail(existingPackage.thumbnail);
        }

        const [updated] = await db
          .update(examPackages)
          .set({ thumbnail: null, updatedAt: new Date() })
          .where(eq(examPackages.id, id))
          .returning();

        return {
          success: true,
          message: t(($) => $.exam.packages.thumbnail.removeSuccess),
          data: {
            id: updated.id,
            thumbnail: null,
          },
        };
      }

      // Handle UPLOAD action
      const data = await request.file();
      if (!data) {
        return reply.badRequest(t(($) => $.exam.packages.thumbnail.noFileUploaded));
      }

      const file: UploadedFile = {
        buffer: await data.toBuffer(),
        filename: data.filename,
        mimetype: data.mimetype,
      };

      // Validate file type
      const allowedMimeTypes = ["image/jpeg", "image/png", "image/webp"];
      if (!allowedMimeTypes.includes(file.mimetype)) {
        return reply.badRequest(t(($) => $.exam.packages.thumbnail.invalidFileType));
      }

      // Validate file size (5MB max for package thumbnails)
      const maxSize = 5 * 1024 * 1024;
      if (file.buffer.length > maxSize) {
        return reply.badRequest(t(($) => $.exam.packages.thumbnail.fileSizeTooLarge));
      }

      // If existing thumbnail, delete it first
      if (existingPackage.thumbnail) {
        try {
          await deletePackageThumbnail(existingPackage.thumbnail);
        } catch (err) {
          // Continue even if delete fails
        }
      }

      // Process image: Resize to 1200px width for Hero/Card balance
      const fileName = createUniqueFileName(file.filename, "pkg_thumb", "jpg");
      const processedBuffer = await sharp(file.buffer)
        .resize(600)
        .jpeg({ quality: 85, force: false })
        .toBuffer();

      const relativePath = await savePackageThumbnail(
        id,
        processedBuffer,
        fileName,
        "image/jpeg",
        existingPackage.createdAt,
      );

      // Update database
      const [updated] = await db
        .update(examPackages)
        .set({
          thumbnail: relativePath,
          updatedAt: new Date(),
        })
        .where(eq(examPackages.id, id))
        .returning();

      return {
        success: true,
        message: t(($) => $.exam.packages.thumbnail.uploadSuccess),
        data: {
          id: updated.id,
          thumbnail: getPackageThumbnailUrl(updated.thumbnail),
        },
      };
    }),
  });
};

export default thumbnailRoute;
