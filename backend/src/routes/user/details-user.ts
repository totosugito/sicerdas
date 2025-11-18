import type { FastifyPluginAsyncTypebox } from "@fastify/type-provider-typebox";
import { Type } from '@fastify/type-provider-typebox';
import { withErrorHandler } from "../../utils/withErrorHandler.ts";
import { db } from "../../db/index.ts";
import { eq } from "drizzle-orm";
import { users, userProfile, accounts } from "../../db/schema/auth-schema.ts";
import {getUserAvatarUrl} from "../../utils/app-utils.ts";

const protectedRoute: FastifyPluginAsyncTypebox = async (app) => {
  app.route({
    url: '/details',
    method: 'GET',
    schema: {
      tags: ['User'],
      summary: 'Get current user details',
      description: 'Get the authenticated user\'s profile information',
      response: {
        200: Type.Object({
          success: Type.Literal(true),
          data: Type.Object({
            id: Type.String({ format: 'uuid' }),
            email: Type.String({ format: 'email' }),
            name: Type.Union([Type.String(), Type.Null()]),
            image: Type.Union([Type.String({ format: 'uri' }), Type.Null()]),
            emailVerified: Type.Boolean(),
            school: Type.Union([Type.String(), Type.Null()]),
            educationLevel: Type.Union([Type.String(), Type.Null()]),
            grade: Type.Union([Type.String(), Type.Null()]),
            phone: Type.Union([Type.String(), Type.Null()]),
            address: Type.Union([Type.String(), Type.Null()]),
            bio: Type.Union([Type.String(), Type.Null()]),
            dateOfBirth: Type.Union([Type.String(), Type.Null()]),
            createdAt: Type.String({ format: 'date-time' }),
            updatedAt: Type.String({ format: 'date-time' }),
            providerId: Type.String(),
            extra: Type.Object({}, { additionalProperties: true })
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
      // Get user ID from session (already verified by user.hook.ts)
      const userId = req.session.user.id;

      // Find the current user by ID with account and profile information joined
      const userWithAllData = await db.select({
        id: users.id,
        email: users.email,
        name: users.name,
        image: users.image,
        emailVerified: users.emailVerified,
        userCreatedAt: users.createdAt,
        userUpdatedAt: users.updatedAt,
        providerId: accounts.providerId,
        school: userProfile.school,
        educationLevel: userProfile.educationLevel,
        grade: userProfile.grade,
        phone: userProfile.phone,
        address: userProfile.address,
        bio: userProfile.bio,
        dateOfBirth: userProfile.dateOfBirth,
        extra: userProfile.extra // Add extra field
      })
      .from(users)
      .leftJoin(accounts, eq(users.id, accounts.userId))
      .leftJoin(userProfile, eq(users.id, userProfile.id))
      .where(eq(users.id, userId))
      .limit(1);

      // Extract user data (there should only be one result)
      const userResult = userWithAllData[0];
      
      if (!userResult) {
        return reply.notFound(req.i18n.t('userNotFound')); // Using i18n translation
      }

      return reply.status(200).send({
        success: true as const,
        data: {
          ...userResult,
          image: getUserAvatarUrl(userResult.image),
          emailVerified: Boolean(userResult.emailVerified),
          dateOfBirth: userResult.dateOfBirth ? userResult.dateOfBirth.toISOString().split('T')[0] : null,
          createdAt: userResult.userCreatedAt.toISOString(),
          updatedAt: userResult.userUpdatedAt.toISOString(),
          providerId: userResult.providerId || '',
          extra: userResult.extra || {}
        }
      });
    }, 422)
  });
};

export default protectedRoute;