import type { FastifyPluginAsyncTypebox } from "@fastify/type-provider-typebox";
import { Type } from '@fastify/type-provider-typebox';
import { withErrorHandler } from "../../utils/withErrorHandler.ts";
import { db } from "../../db/index.ts";
import { users, userProfile } from "../../db/schema/auth-schema.ts";
import { eq } from "drizzle-orm";
import { processChangeAvatar } from "./avatar-user.ts";
import type { UploadedFile } from "../../types/file.ts";

// Response schemas
const UpdateUserResponse = Type.Object({
  success: Type.Boolean({ default: true }),
  message: Type.String(),
  data: Type.Object({
    id: Type.String({ format: 'uuid' }),
    email: Type.String({ format: 'email' }),
    name: Type.Union([Type.String(), Type.Null()]),
    image: Type.Union([Type.String({ format: 'uri' }), Type.Null()]),
    emailVerified: Type.Boolean(),
    school: Type.Union([Type.String(), Type.Null()]),
    grade: Type.Union([Type.String(), Type.Null()]),
    phone: Type.Union([Type.String(), Type.Null()]),
    address: Type.Union([Type.String(), Type.Null()]),
    bio: Type.Union([Type.String(), Type.Null()]),
    dateOfBirth: Type.Union([Type.String(), Type.Null()]),
    createdAt: Type.String({ format: 'date-time' }),
    updatedAt: Type.String({ format: 'date-time' })
  })
});

/**
 * Update user profile
 * 
 * Expected multipart/form-data input parameters:
 * - name: string (optional) - User's display name
 * - school: string (optional) - User's school
 * - grade: string (optional) - User's grade
 * - phone: string (optional) - User's phone number
 * - address: string (optional) - User's address
 * - bio: string (optional) - User's biography
 * - dateOfBirth: string (optional) - User's date of birth (YYYY-MM-DD format)
 * - image: file (optional) - User's avatar image
 * 
 * @param {string} [name] - Optional. User's display name
 * @param {string} [school] - Optional. User's school
 * @param {string} [grade] - Optional. User's grade
 * @param {string} [phone] - Optional. User's phone number
 * @param {string} [address] - Optional. User's address
 * @param {string} [bio] - Optional. User's biography
 * @param {string} [dateOfBirth] - Optional. User's date of birth (YYYY-MM-DD format)
 * @param {file} [image] - Optional. User's avatar image
 */
const protectedRoute: FastifyPluginAsyncTypebox = async (app) => {
  app.route({
    url: '/update',
    method: 'PUT',
    schema: {
      tags: ['User'],
      summary: 'Update user profile',
      description: 'Update the current user\'s profile information. Expected multipart/form-data fields: name, school, grade, phone, address, bio, dateOfBirth, image (all optional). Invalid dateOfBirth formats will be ignored.',
      consumes: ['multipart/form-data'],
      response: {
        200: UpdateUserResponse,
        // Updated to use proper HTTP status codes with Fastify Sensible
        '4xx': Type.Object({
          success: Type.Boolean({ default: false }),
          message: Type.String()
        }),
        '5xx': Type.Object({
          success: Type.Boolean({ default: false }),
          message: Type.String()
        })
      },
    },
    handler: withErrorHandler(async (req, reply) => {
      // Get user ID from session (verified by user.hook.ts)
      const userId = req.session.user.id;
      
      // Initialize variables for form data
      const updateData: {
        name?: string;
        school?: string;
        grade?: string;
        phone?: string;
        address?: string;
        bio?: string;
        dateOfBirth?: string;
      } = {};
      
      let imageFile: UploadedFile | null = null;
      
      // Parse multipart form data
      const parts = req.parts();
      for await (const part of parts) {
        if (part.type === 'field') {
          // Handle text fields
          updateData[part.fieldname as keyof typeof updateData] = part.value as string;
        } else if (part.type === 'file' && part.fieldname === 'image') {
          // Handle image file
          imageFile = {
            buffer: await part.toBuffer(),
            filename: part.filename,
            mimetype: part.mimetype
          };
        }
      }

      // Remove any restricted fields that might have been sent
      const restrictedFields = ['id', 'email', 'password', 'role', 'banned', 'banReason', 'image'];
      const safeUpdateData = Object.entries(updateData)
        .filter(([key]) => !restrictedFields.includes(key))
        .reduce((obj, [key, value]) => {
          // Handle dateOfBirth conversion if provided
          if (key === 'dateOfBirth') {
            // Validate date format (YYYY-MM-DD)
            const dateRegex = /^\d{4}-\d{2}-\d{2}$/;
            if (dateRegex.test(value)) {
              obj[key] = new Date(value as string);
            } else {
              obj[key] = null;
            }
          } else {
            obj[key] = value;
          }
          return obj;
        }, {} as Record<string, unknown>);

      // Process image upload if provided
      let avatarResult: any = null;
      if (imageFile) {
        // Process the avatar using the shared function
        avatarResult = await processChangeAvatar(req, reply, userId, imageFile);
        if (!avatarResult.success) {
          // If avatar processing failed, return the error
          return reply.status(400).send(avatarResult);
        }
      }

      // If no valid updates are provided and no image was uploaded, return early
      if (Object.keys(safeUpdateData).length === 0 && !imageFile) {
        return reply.badRequest(req.i18n.t('user.noValidUpdateData'));
      }

      // Separate user and profile data
      const userFields = ['name'];
      const profileFields = ['school', 'grade', 'phone', 'address', 'bio', 'dateOfBirth'];

      const userData: Record<string, unknown> = {};
      const profileData: Record<string, unknown> = {};

      Object.entries(safeUpdateData).forEach(([key, value]) => {
        if (userFields.includes(key)) {
          userData[key] = value;
        } else if (profileFields.includes(key)) {
          profileData[key] = value;
        }
      });

      // Update user table if there's user data to update
      if (Object.keys(userData).length > 0) {
        userData.updatedAt = new Date();
        const [updatedUserResult] = await db.update(users)
          .set(userData)
          .where(eq(users.id, userId))
          .returning();

        // Check if user was actually updated
        if (!updatedUserResult) {
          return reply.notFound(req.i18n.t('user.userNotFound'));
        }
      }

      // Update user profile table if there's profile data to update
      if (Object.keys(profileData).length > 0) {
        profileData.updatedAt = new Date();
        const [updatedProfileResult] = await db.insert(userProfile)
          .values({ id: userId, ...profileData })
          .onConflictDoUpdate({
            target: userProfile.id,
            set: profileData
          })
          .returning();

        // Check if profile was actually updated/inserted
        if (!updatedProfileResult) {
          return reply.notFound(req.i18n.t('user.userNotFound'));
        }
      }

      // Get the updated user
      let updatedUser = await db.query.users.findFirst({
        where: eq(users.id, userId),
        columns: {
          id: true,
          email: true,
          name: true,
          image: true,
          emailVerified: true,
          createdAt: true,
          updatedAt: true
        }
      });

      if (!updatedUser) {
        return reply.notFound(req.i18n.t('user.userNotFound'));
      }

      // If we processed an avatar, use the data from the avatar result
      if (avatarResult && avatarResult.data) {
        updatedUser = {
          ...updatedUser,
          ...avatarResult.data
        };
      }

      // Get user profile information
      let profile = await db.query.userProfile.findFirst({
        where: eq(userProfile.id, userId),
        columns: {
          school: true,
          grade: true,
          phone: true,
          address: true,
          bio: true,
          dateOfBirth: true
        }
      });

      // If no profile exists, create one
      if (!profile) {
        const now = new Date();
        await db.insert(userProfile).values({
          id: userId,
          school: "",
          grade: "",
          phone: "",
          address: "",
          bio: "",
          dateOfBirth: null,
          createdAt: now,
          updatedAt: now,
        }).onConflictDoNothing();

        // Fetch the newly created profile
        profile = await db.query.userProfile.findFirst({
          where: eq(userProfile.id, userId),
          columns: {
            school: true,
            grade: true,
            phone: true,
            address: true,
            bio: true,
            dateOfBirth: true
          }
        });
      }

      return reply.status(200).send({
        success: true,
        message: req.i18n.t('user.userUpdatedSuccessfully'),
        data: {
          ...updatedUser!,
          ...(profile || {}),
          image: updatedUser!.image,
          createdAt: updatedUser!.createdAt,
          updatedAt: updatedUser!.updatedAt,
          emailVerified: Boolean(updatedUser!.emailVerified),
          dateOfBirth: profile?.dateOfBirth
        }
      });
    })
  });
};

export default protectedRoute;