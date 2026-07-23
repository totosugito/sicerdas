import { db } from "../../../../db/db-pool.ts";
import { users, profiles, accounts, EnumUserRole } from "../../../../db/schema/users/index.ts";
import { eq } from "drizzle-orm";
import type { ServiceResponse } from "../../../../types/response.ts";

export interface CreateUserParams {
  name: string;
  email: string;
  role?: typeof EnumUserRole[keyof typeof EnumUserRole];
  hashedPassword: string;
}

export interface CreateUserResponse extends ServiceResponse {
  data?: {
    id: string;
    name: string;
    email: string;
    role: string;
    createdAt: string;
    updatedAt: string;
  };
}

export async function createUserService(params: CreateUserParams): Promise<CreateUserResponse> {
  const { name, email, role = EnumUserRole.USER, hashedPassword } = params;

  // Check if email already exists
  const existingUser = await db.query.users.findFirst({
    where: (fields) => eq(fields.email, email),
  });

  if (existingUser) {
    return {
      success: false,
      statusCode: 400,
      errorKey: ($) => $.user.management.create.emailExists,
    };
  }

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
    await tx.insert(profiles).values({
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

  return {
    success: true,
    data: {
      id: newUser.id,
      name: newUser.name,
      email: newUser.email,
      role: newUser.role,
      createdAt: newUser.createdAt.toISOString(),
      updatedAt: newUser.updatedAt.toISOString(),
    },
  };
}
