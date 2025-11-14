import type { FastifyPluginAsyncTypebox } from "@fastify/type-provider-typebox";
import { Type } from '@fastify/type-provider-typebox';
import { withErrorHandler } from "../../utils/withErrorHandler.ts";
import { db } from "../../db/index.ts";
import { users, userProfile } from "../../db/schema/auth-schema.ts";
import { eq } from "drizzle-orm";
import { getUserAvatarUrl } from "../../utils/app-utils.ts";

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
      description: 'Update the current user\'s profile information. Expected JSON body fields: name, school, grade, phone, address, bio, dateOfBirth (all optional). Invalid dateOfBirth formats will be ignored.',
      consumes: ['application/json'],
      body: Type.Object({
        name: Type.Optional(Type.String({ minLength: 2 })),
        school: Type.Optional(Type.String({ minLength: 0 })),
        grade: Type.Optional(Type.String({ minLength: 0 })),
        phone: Type.Optional(Type.String({ minLength: 0 })),
        address: Type.Optional(Type.String({ minLength: 0 })),
        bio: Type.Optional(Type.String({ minLength: 0 })),
        dateOfBirth: Type.Optional(Type.String()), // Removed strict pattern validation to allow flexible handling
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

      // If no valid updates are provided, return early
      if (Object.keys(safeUpdateData).length === 0) {
        return reply.badRequest(req.i18n.t('user.noValidUpdateData'));
      }
      console.log('Updating user with data:', safeUpdateData);

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
          image: true,
          emailVerified: true,
          createdAt: true,
          updatedAt: true
        }
      });

      if (!updatedUser) {
        return reply.notFound(req.i18n.t('user.userNotFound'));
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
          ...updatedUser,
          ...(profile || {}),
          image: getUserAvatarUrl(updatedUser.image),
          createdAt: updatedUser.createdAt,
          updatedAt: updatedUser.updatedAt,
          emailVerified: Boolean(updatedUser.emailVerified),
          dateOfBirth: profile?.dateOfBirth
        }
      });
    })
  });
};

export default protectedRoute;