import { db } from "../../../../db/db-pool.ts";
import { accounts } from "../../../../db/schema/users/index.ts";
import { eq } from "drizzle-orm";
import type { ServiceResponse } from "../../../../types/response.ts";

export interface ResetPasswordParams {
  id: string;
  hashedPassword: string;
}

export async function resetPasswordService(params: ResetPasswordParams): Promise<ServiceResponse> {
  const { id, hashedPassword } = params;

  // Check if user exists
  const user = await db.query.users.findFirst({
    where: (fields) => eq(fields.id, id),
  });

  if (!user) {
    return {
      success: false,
      statusCode: 404,
      errorKey: ($) => $.user.userNotFound,
    };
  }

  // Check if account exists for the user
  const [userAccount] = await db
    .select()
    .from(accounts)
    .where(eq(accounts.userId, id))
    .limit(1);

  if (!userAccount) {
    return {
      success: false,
      statusCode: 404,
      errorKey: ($) => $.user.accountNotFound,
    };
  }

  // Update password in accounts table
  await db
    .update(accounts)
    .set({
      password: hashedPassword,
      updatedAt: new Date(),
    })
    .where(eq(accounts.userId, id));

  return { success: true };
}
