import type { FastifyPluginAsyncTypebox } from "@fastify/type-provider-typebox";
import { Type } from '@fastify/type-provider-typebox';
import { withErrorHandler } from "../../utils/withErrorHandler.ts";
import { db } from "../../db/index.ts";
import { users, userProfile } from "../../db/schema/auth-schema.ts";
import { eq } from "drizzle-orm";

// Response schemas
const UserResponse = Type.Object({
  id: Type.String({ format: 'uuid' }),
  email: Type.String({ format: 'email' }),
  name: Type.Union([Type.String(), Type.Null()]),
  emailVerified: Type.Boolean(),
  createdAt: Type.String({ format: 'date-time' }),
  updatedAt: Type.String({ format: 'date-time' })
});

const UpdateUserResponse = Type.Object({
  success: Type.Boolean({ default: true }),
  message: Type.String(),
  data: UserResponse
});

/**
 * Update user profile
 * 
 * Expected JSON body input parameters:
 * - name: string (optional) - User's display name
 * - school: string (optional) - User's school
 * - grade: string (optional) - User's grade
 * - phone: string (optional) - User's phone number
 * - address: string (optional) - User's address
 * - bio: string (optional) - User's biography
 * - dateOfBirth: string (optional) - User's date of birth (YYYY-MM-DD format)
 * 
 * @param {string} [name] - Optional. User's display name
 * @param {string} [school] - Optional. User's school
 * @param {string} [grade] - Optional. User's grade
 * @param {string} [phone] - Optional. User's phone number
 * @param {string} [address] - Optional. User's address
 * @param {string} [bio] - Optional. User's biography
 * @param {string} [dateOfBirth] - Optional. User's date of birth (YYYY-MM-DD format)
 */
const protectedRoute: FastifyPluginAsyncTypebox = async (app) => {
  app.route({
    url: '/update',
    method: 'PUT',
    schema: {
      tags: ['User'],
      summary: 'Update user profile',
      description: 'Update the current user\'s profile information. Expected JSON body fields: name, school, grade, phone, address, bio, dateOfBirth (all optional)',
      consumes: ['application/json'],
      body: Type.Object({
        name: Type.Optional(Type.String({ minLength: 1 })),
        school: Type.Optional(Type.String({ minLength: 0 })),
        grade: Type.Optional(Type.String({ minLength: 0 })),
        phone: Type.Optional(Type.String({ minLength: 0 })),
        address: Type.Optional(Type.String({ minLength: 0 })),
        bio: Type.Optional(Type.String({ minLength: 0 })),
        dateOfBirth: Type.Optional(Type.String({ pattern: '^\\d{4}-\\d{2}-\\d{2}$' })), // YYYY-MM-DD format
      }),
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
      const updateData = req.body as {
        name?: string;
        school?: string;
        grade?: string;
        phone?: string;
        address?: string;
        bio?: string;
        dateOfBirth?: string;
      };

      // Remove any restricted fields that might have been sent
      const restrictedFields = ['id', 'email', 'password', 'role', 'banned', 'banReason', 'image'];
      const safeUpdateData = Object.entries(updateData)
        .filter(([key]) => !restrictedFields.includes(key))
        .reduce((obj, [key, value]) => {
          // Handle dateOfBirth conversion if provided
          if (key === 'dateOfBirth' && typeof value === 'string' && value) {
            // Convert YYYY-MM-DD string to Date object
            obj[key] = new Date(value);
          } else {
            obj[key] = value;
          }
          return obj;
        }, {} as Record<string, unknown>);

      // If no valid updates are provided, return early
      if (Object.keys(safeUpdateData).length === 0) {
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
      const updatedUser = await db.query.users.findFirst({
        where: eq(users.id, userId),
        columns: {
          id: true,
          email: true,
          name: true,
          emailVerified: true,
          createdAt: true,
          updatedAt: true
        }
      });

      if (!updatedUser) {
        return reply.notFound(req.i18n.t('user.userNotFound'));
      }

      return reply.status(200).send({
        success: true,
        message: req.i18n.t('user.userUpdatedSuccessfully'),
        data: {
          ...updatedUser,
          // Ensure dates are properly serialized
          createdAt: updatedUser.createdAt.toISOString(),
          updatedAt: updatedUser.updatedAt.toISOString(),
          emailVerified: Boolean(updatedUser.emailVerified)
        }
      });
    })
  });
};

export default protectedRoute;