import { db } from "../../../db/db-pool.ts";
import { users, verifications } from "../../../db/schema/users/index.ts";
import { eq } from "drizzle-orm";
import type { ServiceResponse } from "../../../types/response.ts";
import type { EmailOtpResetPasswordRequest } from "../auth.schema.ts";

export async function emailOtpResetPasswordService(
  params: EmailOtpResetPasswordRequest,
): Promise<ServiceResponse> {
  const { email } = params;

  // Check if email exists in users table and get user ID
  const existingUser = await db
    .select({ id: users.id, email: users.email })
    .from(users)
    .where(eq(users.email, email));

  if (existingUser.length === 0) {
    return {
      success: false,
      statusCode: 404,
      errorKey: ($) => $.auth.userNotFound,
    };
  }

  return {
    success: true,
  };
}

export async function deleteOtpVerificationService(email: string): Promise<void> {
  const identifier = `forget-password-otp-${email}`;
  await db.delete(verifications).where(eq(verifications.identifier, identifier));
}
