import type { FastifyPluginAsyncTypebox } from "@fastify/type-provider-typebox";
import { EnumUserRole } from "../../../db/schema/user/index.ts";
import { getAuthInstance } from "../../../decorators/auth.decorator.ts";
import type { FastifyReply, FastifyRequest } from "fastify";
import { createUserService, CreateUserBodySchema, UserResponseSchema } from "../../../modules/user/index.ts";
import { ErrorResponseSchema } from "../../../types/response.ts";

const createUser: FastifyPluginAsyncTypebox = async (app) => {
  app.route({
    url: "/create",
    method: "POST",
    schema: {
      tags: ["Users Management"],
      summary: "Create a new user (Admin only)",
      body: CreateUserBodySchema,
      response: {
        201: UserResponseSchema,
        "4xx": ErrorResponseSchema,
      },
    },
    handler: async function handler(
      req: FastifyRequest<{ Body: typeof CreateUserBodySchema.static }>,
      reply: FastifyReply,
    ): Promise<typeof UserResponseSchema.static> {
      const auth = getAuthInstance(app);

      // Explicit destructuring for Mass Assignment Protection
      const { name, email, role = EnumUserRole.USER, password } = req.body;

      // Get auth context for password hashing
      const context = await auth.$context;
      const hashedPassword = await context.password.hash(password);

      const result = await createUserService({
        name,
        email,
        role,
        hashedPassword,
      });

      if (!result.success || !result.data) {
        const message = req.t(result.errorKey!);
        if (result.statusCode === 404) {
          return reply.notFound(message);
        }
        return reply.badRequest(message);
      }

      return reply.status(201).send({
        success: true,
        message: req.t(($) => $.user.management.create.success),
        data: result.data,
      });
    },
  });
};

export default createUser;
