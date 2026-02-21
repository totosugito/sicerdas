import type { FastifyPluginAsyncTypebox } from "@fastify/type-provider-typebox";
import { Type } from '@fastify/type-provider-typebox';
import { withErrorHandler } from "../../utils/withErrorHandler.ts";
import { db } from '../../db/db-pool.ts';
import { users } from '../../db/schema/user/index.ts';
import { eq } from 'drizzle-orm';
import { getUserAvatarUrl } from '../../utils/app-utils.ts';

// Response schemas
const UserResponse = Type.Object({
  id: Type.String({ format: 'uuid' }),
  email: Type.String({ format: 'email' }),
  name: Type.Union([Type.String(), Type.Null()]),
  image: Type.Union([Type.String(), Type.Null()]),
  emailVerified: Type.Boolean(),
  role: Type.Union([Type.String(), Type.Null()]),
  createdAt: Type.String({ format: 'date-time' }),
  updatedAt: Type.String({ format: 'date-time' }),
});

const AuthResponse = Type.Object({
  success: Type.Boolean({ default: true }),
  user: Type.Omit(UserResponse, ['password']),
  token: Type.String(),
});

/**
 * Sign in with email and password
 * 
 * Expected form-data input parameters:
 * - email: string - User's email address
 * - password: string - User's password
 * 
 * @param {string} email - Required. User's email address
 * @param {string} password - Required. User's password
 */
const publicRoute: FastifyPluginAsyncTypebox = async (app) => {
  app.route({
    url: '/sign-in-email',
    method: 'POST',
    schema: {
      tags: ['Auth'],
      summary: 'Sign in with email and password',
      description: 'Authenticate user with email and password and return user data with access token. Expected form-data fields: email, password',
      consumes: ['multipart/form-data'],
      response: {
        200: AuthResponse,
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
      // Parse form data into a key-value object
      const formData = new Map<string, string>();
      if (typeof req.parts === 'function') {
        for await (const part of req.parts()) {
          if (part.type === 'field') {
            formData.set(part.fieldname, part.value as string);
          }
        }
      }
      const { email, password } = Object.fromEntries(formData);

      // Validate required fields using Fastify Sensible badRequest
      if (!email || !password) {
        return reply.badRequest(req.i18n.t('auth.emailAndPasswordRequired'));
      }

      // Use Fastify's built-in inject method
      const response = await app.inject({
        method: 'POST',
        url: '/api/auth/sign-in/email',
        payload: JSON.stringify({
          email: email,
          password: password
        }),
        headers: {
          'content-type': 'application/json',
          'accept-language': req.headers['accept-language'] || 'id',
          'user-agent': req.headers['user-agent'],
        }
      });

      const authData = response.json();

      if (!authData.user) {
        return reply.badRequest(req.i18n.t('auth.invalidCredentials'));
      }

      // Fetch the user with role from the database
      const userWithRole = await db.query.users.findFirst({
        where: eq(users.id, authData.user.id),
        columns: {
          id: true,
          email: true,
          name: true,
          image: true,
          emailVerified: true,
          role: true,
          createdAt: true,
          updatedAt: true
        }
      });

      if (!userWithRole) {
        return reply.notFound(req.i18n.t('auth.userNotFound'));
      }

      // Forward the response
      return reply
        .status(response.statusCode)
        .headers(response.headers)
        .send({
          ...authData,
          user: {
            ...authData.user,
            ...userWithRole,
            image: getUserAvatarUrl(userWithRole.image),
          }
        });
    }),
  });
};

export default publicRoute;