import type { FastifyPluginAsyncTypebox } from "@fastify/type-provider-typebox";
import { Type } from "@sinclair/typebox";
import { db } from "../../db/db-pool.ts";
import { users, usersProfile, EnumUserRole } from "../../db/schema/user/index.ts";
import { withErrorHandler } from "../../utils/withErrorHandler.ts";
import { getTypedI18n } from "../../utils/i18n-typed.ts";
import { eq } from "drizzle-orm";
import type { FastifyReply, FastifyRequest } from "fastify";

const CreateBody = Type.Object({
  name: Type.String({ description: "The full name of the user" }),
  email: Type.String({ format: "email", description: "Unique email address" }),
  role: Type.Optional(
    Type.Enum(EnumUserRole, { default: EnumUserRole.USER, description: "Role of the user" }),
  ),
  school: Type.Optional(Type.String({ description: "School name" })),
  grade: Type.Optional(Type.String({ description: "Grade level" })),
});

const CreateResponse = Type.Object({
  success: Type.Boolean({ default: true }),
  message: Type.String(),
  data: Type.Optional(Type.Any()),
});

const createUser: FastifyPluginAsyncTypebox = async (app) => {
  app.route({
    url: "/create",
    method: "POST",
    schema: {
      tags: ["Users Management"],
      summary: "Create a new user (Admin only)",
      body: CreateBody,
      response: {
        201: CreateResponse,
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
    handler: withErrorHandler(async function handler(
      req: FastifyRequest<{ Body: typeof CreateBody.static }>,
      reply: FastifyReply,
    ): Promise<typeof CreateResponse.static> {
      const { t } = getTypedI18n(req);

      // Explicit destructuring for Mass Assignment Protection
      const { name, email, role = EnumUserRole.USER, school, grade } = req.body;

      // Check if email already exists
      const existingUser = await db.query.users.findFirst({
        where: (fields) => eq(fields.email, email),
      });

      if (existingUser) {
        return reply.badRequest(t(($) => $.user.management.create.emailExists));
      }

      // Start a transaction for atomicity
      const newUser = await db.transaction(async (tx) => {
        const [insertedUser] = await tx
          .insert(users)
          .values({
            name,
            email,
            role,
            updatedAt: new Date(),
          })
          .returning();

        await tx.insert(usersProfile).values({
          id: insertedUser.id,
          school: school ?? null,
          grade: grade ?? null,
          updatedAt: new Date(),
        });

        return insertedUser;
      });

      return reply.status(201).send({
        success: true,
        message: t(($) => $.user.management.create.success),
        data: {
          id: newUser.id,
          name: newUser.name,
          email: newUser.email,
          role: newUser.role,
          createdAt: newUser.createdAt.toISOString(),
          updatedAt: newUser.updatedAt.toISOString(),
        },
      });
    }),
  });
};

export default createUser;
