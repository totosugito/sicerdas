import { db } from "../../../db/db-pool.ts";
import { verifications } from "../../../db/schema/users/index.ts";
import { eq, desc } from "drizzle-orm";
import type { ServiceResponse } from "../../../types/response.ts";
import type { EmailOtpVerifyForgetPasswordRequest } from "../auth.schema.ts";

export interface EmailOtpVerifyForgetPasswordResult extends ServiceResponse {
  data?: {
    valid: boolean;
  };
}

export async function emailOtpVerifyForgetPasswordService(
  params: EmailOtpVerifyForgetPasswordRequest,
): Promise<EmailOtpVerifyForgetPasswordResult> {
  const { email, otp } = params;

  // Check if token exists in verifications table and is not expired
  const verificationResult = await db
    .select()
    .from(verifications)
    .where(eq(verifications.identifier, `forget-password-otp-${email}`))
    .orderBy(desc(verifications.updatedAt));

  if (verificationResult.length === 0) {
    return {
      success: false,
      statusCode: 404,
      errorKey: ($) => $.auth.invalidOTP,
    };
  }

  const verification = verificationResult[0];

  // Check if token matches
  if (!verification.value.startsWith(`${otp}:`)) {
    return {
      success: false,
      statusCode: 404,
      errorKey: ($) => $.auth.invalidOTP,
    };
  }

  // Check if token is expired
  const now = new Date();
  if (verification.expiresAt < now) {
    return {
      success: false,
      statusCode: 404,
      errorKey: ($) => $.auth.expiredOTP,
    };
  }

  return {
    success: true,
    data: {
      valid: true,
    },
  };
}
