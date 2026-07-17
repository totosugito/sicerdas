import { db } from "../../../db/db-pool.ts";
import { accounts } from "../../../db/schema/user/index.ts";
import { eq } from "drizzle-orm";
import type { ServiceResponse } from "../../../types/response.ts";

export interface ChangePasswordParams {
  userId: string;
  currentPassword: string;
  newPassword: string;
  verifyFn: (password: string, hash: string) => Promise<boolean>;
  hashFn: (password: string) => Promise<string>;
}

export async function changePasswordService(params: ChangePasswordParams): Promise<ServiceResponse> {
  const { userId, currentPassword, newPassword, verifyFn, hashFn } = params;

  if (currentPassword === newPassword) {
    return {
      success: false,
      statusCode: 400,
      errorKey: ($) => $.user.passwordsMustBeDifferent,
    };
  }

  // Get user's current password hash
  const [userAccount] = await db
    .select()
    .from(accounts)
    .where(eq(accounts.userId, userId))
    .limit(1);

  if (!userAccount) {
    return {
      success: false,
      statusCode: 404,
      errorKey: ($) => $.user.accountNotFound,
    };
  }

  if (!userAccount.password) {
    return {
      success: false,
      statusCode: 400,
      errorKey: ($) => $.user.accountHasNoPassword,
    };
  }

  // Verify current password
  const isPasswordValid = await verifyFn(currentPassword, userAccount.password);

  if (!isPasswordValid) {
    return {
      success: false,
      statusCode: 403,
      errorKey: ($) => $.user.currentPasswordIncorrect,
    };
  }

  // Hash new password
  const hashedPassword = await hashFn(newPassword);

  // Update password in database
  await db
    .update(accounts)
    .set({
      password: hashedPassword,
      updatedAt: new Date(),
    })
    .where(eq(accounts.userId, userId));

  return { success: true };
}
