import type { FastifyPluginAsyncTypebox } from "@fastify/type-provider-typebox";
import { Type } from '@fastify/type-provider-typebox';
import { withErrorHandler } from "../../utils/withErrorHandler.ts";
import { db } from "../../db/index.ts";
import { eq } from "drizzle-orm";
import { users, userProfile } from "../../db/schema/index.ts";
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
            grade: Type.Union([Type.String(), Type.Null()]),
            phone: Type.Union([Type.String(), Type.Null()]),
            address: Type.Union([Type.String(), Type.Null()]),
            bio: Type.Union([Type.String(), Type.Null()]),
            dateOfBirth: Type.Union([Type.String(), Type.Null()]),
            createdAt: Type.String({ format: 'date-time' }),
            updatedAt: Type.String({ format: 'date-time' })
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

      // Find the current user by ID
      const user = await db.query.users.findFirst({
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

      // This should theoretically never happen since the user was just authenticated
      // but, we'll keep it as a safety check
      if (!user) {
        return reply.notFound(req.i18n.t('userNotFound')); // Using i18n translation
      }

      // Get user profile information
      const profile = await db.query.userProfile.findFirst({
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

      return reply.status(200).send({
        success: true as const,
        data: {
          ...user,
          ...(profile || {}),
          image: getUserAvatarUrl(user.image),
          createdAt: user.createdAt.toISOString(),
          updatedAt: user.updatedAt.toISOString(),
          emailVerified: Boolean(user.emailVerified),
          dateOfBirth: profile?.dateOfBirth ? profile.dateOfBirth.toISOString().split('T')[0] : null
        }
      });
    }, 422)
  });
};

export default protectedRoute;