import type { FastifyPluginAsyncTypebox } from "@fastify/type-provider-typebox";
import { Type } from "@fastify/type-provider-typebox";
import { db } from "../../db/db-pool.ts";
import { users, profiles } from "../../db/schema/users/index.ts";
import { eq } from "drizzle-orm";
import { getUserAvatarUrl } from "../../utils/user/user-utils.ts";

// Response schemas
const UserResponse = Type.Object({
  id: Type.String({ format: "uuid" }),
  email: Type.String({ format: "email" }),
  name: Type.Union([Type.String(), Type.Null()]),
  image: Type.Union([Type.String(), Type.Null()]),
  emailVerified: Type.Boolean(),
  role: Type.Union([Type.String(), Type.Null()]),
  showAds: Type.Boolean(),
  tierId: Type.String(),
  createdAt: Type.String({ format: "date-time" }),
  updatedAt: Type.String({ format: "date-time" }),
});

const AuthResponse = Type.Object({
  success: Type.Boolean({ default: true }),
  user: Type.Omit(UserResponse, ["password"]),
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
    url: "/sign-in-email",
    method: "POST",
    schema: {
      tags: ["Auth"],
      summary: "Sign in with email and password",
      description:
        "Authenticate user with email and password and return user data with access token. Expected form-data fields: email, password",
      consumes: ["multipart/form-data"],
      response: {
        200: AuthResponse,
        // Updated to use proper HTTP status codes with Fastify Sensible
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
    handler: async (req, reply) => {
      // Parse form data into a key-value object
      const formData = new Map<string, string>();
      if (typeof req.parts === "function") {
        for await (const part of req.parts()) {
          if (part.type === "field") {
            formData.set(part.fieldname, part.value as string);
          }
        }
      }
      const { email, password } = Object.fromEntries(formData);

      // Validate required fields using Fastify Sensible badRequest
      if (!email || !password) {
        return reply.badRequest(req.t(($) => $.auth.emailAndPasswordRequired));
      }

      // Use Fastify's built-in inject method
      const response = await app.inject({
        method: "POST",
        url: "/api/auth/sign-in/email",
        payload: JSON.stringify({
          email: email,
          password: password,
        }),
        headers: {
          "content-type": "application/json",
          "accept-language": req.headers["accept-language"] || "id",
          "user-agent": req.headers["user-agent"],
        },
      });

      const authData = response.json();

      if (!authData.user) {
        return reply.badRequest(req.t(($) => $.auth.invalidCredentials));
      }

      // Fetch the user with role and tier from the database
      const userRecord = await db
        .select({
          id: users.id,
          email: users.email,
          name: users.name,
          image: users.image,
          emailVerified: users.emailVerified,
          role: users.role,
          createdAt: users.createdAt,
          updatedAt: users.updatedAt,
          tierId: profiles.tierId,
        })
        .from(users)
        .leftJoin(profiles, eq(users.id, profiles.id))
        .where(eq(users.id, authData.user.id))
        .limit(1);

      const userWithRole = userRecord.length > 0 ? userRecord[0] : null;

      if (!userWithRole) {
        return reply.notFound(req.t(($) => $.auth.userNotFound));
      }

      const tierId = userWithRole.tierId || "free";
      const showAds = tierId === "free";

      // Forward the response
      return reply
        .status(response.statusCode)
        .headers(response.headers)
        .send({
          ...authData,
          user: {
            ...authData.user,
            ...userWithRole,
            image: getUserAvatarUrl(userWithRole.id, userWithRole.image),
            showAds,
            tierId,
          },
        });
    },
  });
};

export default publicRoute;
