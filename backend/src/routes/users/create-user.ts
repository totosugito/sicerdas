import type { FastifyPluginAsyncTypebox } from "@fastify/type-provider-typebox";
import { Type } from "@sinclair/typebox";
import { db } from "../../db/db-pool.ts";
import { users, usersProfile, accounts, EnumUserRole } from "../../db/schema/user/index.ts";
import { withErrorHandler } from "../../utils/withErrorHandler.ts";
import { getTypedI18n } from "../../utils/i18n-typed.ts";
import { getAuthInstance } from "../../decorators/auth.decorator.ts";
import { eq } from "drizzle-orm";
import type { FastifyReply, FastifyRequest } from "fastify";

const CreateBody = Type.Object({
  name: Type.String({ description: "The full name of the user" }),
  email: Type.String({ format: "email", description: "Unique email address" }),
  role: Type.Optional(
    Type.Enum(EnumUserRole, { default: EnumUserRole.USER, description: "Role of the user" }),
  ),
  password: Type.String({ minLength: 6, description: "Initial password for the user" }),
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
      const auth = getAuthInstance(app);

      // Explicit destructuring for Mass Assignment Protection
      const { name, email, role = EnumUserRole.USER, password } = req.body;

      // Check if email already exists
      const existingUser = await db.query.users.findFirst({
        where: (fields) => eq(fields.email, email),
      });

      if (existingUser) {
        return reply.badRequest(t(($) => $.user.management.create.emailExists));
      }

      // Get auth context for password hashing
      const context = await auth.$context;
      const hashedPassword = await context.password.hash(password);

      // Start a transaction for atomicity
      const newUser = await db.transaction(async (tx) => {
        // 1. Create User
        const [insertedUser] = await tx
          .insert(users)
          .values({
            name,
            email,
            role,
            emailVerified: true, // Manual admin creation skips verification
            updatedAt: new Date(),
          })
          .returning();

        // 2. Create Profile
        await tx.insert(usersProfile).values({
          id: insertedUser.id,
          updatedAt: new Date(),
        });

        // 3. Create Account (for better-auth email/password login)
        await tx.insert(accounts).values({
          userId: insertedUser.id,
          accountId: insertedUser.id,
          providerId: "credential",
          password: hashedPassword,
          createdAt: new Date(),
          updatedAt: new Date(),
        } as any);

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
