import type { FastifyPluginAsyncTypebox } from '@fastify/type-provider-typebox';
import { withErrorHandler } from '../../utils/withErrorHandler.ts';
import { db } from '../../db/db-pool.ts';
import { users } from '../../db/schema/index.ts';
import { eq } from 'drizzle-orm';
import { join } from 'node:path';
import { writeFile, unlink } from 'node:fs/promises';
import { existsSync, mkdirSync } from 'node:fs';
import sharp from 'sharp';
import type { UploadedFile } from "../../types/file.ts";
import env from "../../config/env.config.ts";
import { createUniqueFileName } from "../../utils/my-utils.ts";
import { Type } from '@sinclair/typebox';
import type { FastifyReply } from "fastify";
import { getUserAvatarUrl } from "../../utils/app-utils.ts";

const uploadDir = join(process.cwd(), env.server.uploadsUserDir);

export const processChangeAvatar = async (req: any, reply: FastifyReply, userId: string, file: UploadedFile) => {
  const { buffer, filename: originalName, mimetype } = file;

  // Validate file type
  const allowedMimeTypes = ['image/jpeg', 'image/png', 'image/webp'];
  if (!allowedMimeTypes.includes(mimetype)) {
    return reply.status(400).send({
      success: false,
      message: req.i18n.t('user.invalidFileType')
    });
  }

  // Validate file size (2MB max)
  const maxSize = 2 * 1024 * 1024; // 5MB
  if (buffer.length > maxSize) {
    return reply.status(400).send({
      success: false,
      message: req.i18n.t('user.fileSizeTooLarge')
    });
  }

  // Generate a unique filename with cleaned name
  const fileName = createUniqueFileName(originalName, 'avatar', 'jpg');

  // Create user-specific directory
  const userDir = join(uploadDir, userId);
  if (!existsSync(userDir)) {
    mkdirSync(userDir, { recursive: true });
  }

  const filePath = join(userDir, fileName);
  const publicUrl = `/${userId}/${fileName}`;

  // Get current user to check for existing avatar
  const [currentUser] = await db
    .select({ image: users.image })
    .from(users)
    .where(eq(users.id, userId))
    .limit(1);

  // If user has an existing avatar, delete the old file
  if (currentUser?.image) {
    try {
      const oldFilePath = join(uploadDir, currentUser.image);
      if (existsSync(oldFilePath)) {
        await unlink(oldFilePath);
      }
    } catch (_error: unknown) {
      // Continue with the upload even if deletion fails
    }
  }

  // Process and save the image with sharp
  const processedImage = await sharp(buffer)
    .resize(400) // Set width to 400px, height will be calculated automatically to maintain aspect ratio
    .jpeg({ quality: 90, force: false }) // Convert to JPEG with 80% quality if not already
    .toBuffer();

  await writeFile(filePath, processedImage);

  // Update user's avatar in the database
  const [updatedUser] = await db
    .update(users)
    .set({
      image: publicUrl,
      updatedAt: new Date()
    })
    .where(eq(users.id, userId))
    .returning();

  return {
    success: true,
    message: req.i18n.t('user.avatarUpdatedSuccessfully'),
    data: {
      id: updatedUser.id,
      name: updatedUser.name,
      image: getUserAvatarUrl(updatedUser.image), // Return the public URL of the updatedUser.image
    }
  };
}

const protectedRoute: FastifyPluginAsyncTypebox = async (app) => {
  app.route({
    url: '/avatar',
    method: 'PATCH',
    schema: {
      tags: ['User'],
      summary: '',
      description: 'Upload and update the current user\'s avatar',
      consumes: ['multipart/form-data'],
      querystring: Type.Object({
        action: Type.Optional(Type.String())
      }),
      response: {
        200: Type.Object({
          success: Type.Boolean({ default: true }),
          message: Type.String(),
          data: Type.Object({
            id: Type.String(),
            name: Type.String(),
            image: Type.Union([Type.String(), Type.Null()])
          })
        }),
        // Updated to use proper HTTP status codes with Fastify Sensible
        '4xx': Type.Object({
          success: Type.Boolean({ default: false }),
          message: Type.String()
        }),
        '5xx': Type.Object({
          success: Type.Boolean({ default: false }),
          message: Type.String()
        })
      }
    },
    handler: withErrorHandler(async (req, reply) => {
      // User ID is available from the session (handled by user.hook.ts)
      const userId = req.session.user.id;

      // Type the query parameters
      const query = req.query as { action?: string };

      // Check if this is a remove avatar request
      const action = query.action;
      if (action === 'remove') {
        // Remove the user's avatar
        const [updatedUser] = await db
          .update(users)
          .set({
            image: null,
            updatedAt: new Date()
          })
          .where(eq(users.id, userId))
          .returning();

        return reply.status(200).send({
          success: true,
          message: req.i18n.t('user.avatarRemovedSuccessfully'),
          data: {
            id: updatedUser.id,
            name: updatedUser.name,
            image: null
          }
        });
      }

      // Get the uploaded file from the request
      const data = await req.file();

      if (!data) {
        return reply.badRequest(req.i18n.t('user.noFileUploaded'));
      }

      // Convert to our UploadedFile type
      const file: UploadedFile = {
        buffer: await data.toBuffer(),
        filename: data.filename,
        mimetype: data.mimetype
      };

      return processChangeAvatar(req, reply, userId, file);
    })
  });
};

export default protectedRoute;
