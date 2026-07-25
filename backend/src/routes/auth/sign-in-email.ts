import type { FastifyPluginAsyncTypebox } from "@fastify/type-provider-typebox";
import { Type } from "@fastify/type-provider-typebox";
import { signInEmailService } from "../../modules/auth/services/sign-in-email.service.ts";
import { AuthResponse } from "../../modules/auth/auth.schema.ts";

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

      // Fetch user with role and tier from the database using service
      const result = await signInEmailService(authData.user.id);

      if (!result.success || !result.data) {
        const message = req.t(result.errorKey!);
        if (result.statusCode === 404) {
          return reply.notFound(message);
        }
        return reply.badRequest(message);
      }

      // Forward the response
      return reply
        .status(response.statusCode)
        .headers(response.headers)
        .send({
          ...authData,
          user: {
            ...authData.user,
            ...result.data,
          },
        });
    },
  });
};

export default publicRoute;
