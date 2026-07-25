import { db } from "../../../db/db-pool.ts";
import { users, verifications } from "../../../db/schema/users/index.ts";
import { eq, and, gte } from "drizzle-orm";
import type { ServiceResponse } from "../../../types/response.ts";
import type { EmailHasOtpRequest } from "../auth.schema.ts";

export interface EmailHasOtpResult extends ServiceResponse {
  hasOtp?: boolean;
}

export async function emailHasOtpService(
  params: EmailHasOtpRequest,
): Promise<EmailHasOtpResult> {
  const { email, identifier: identifierPrefix = "forget-password-otp-" } = params;

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

  // Check if user has pending verification in the verifications table
  const identifier = `${identifierPrefix}${email}`;

  const pendingVerifications = await db
    .select()
    .from(verifications)
    .where(
      and(
        eq(verifications.identifier, identifier),
        gte(verifications.expiresAt, new Date()),
      ),
    );

  const hasOtp = pendingVerifications.length > 0;

  return {
    success: true,
    hasOtp,
  };
}
