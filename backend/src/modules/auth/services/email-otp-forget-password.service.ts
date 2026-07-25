import { db } from "../../../db/db-pool.ts";
import { users, verifications, accounts } from "../../../db/schema/users/index.ts";
import { eq, and, gte, count } from "drizzle-orm";
import config from "../../../config/env.config.ts";
import type { ServiceResponse } from "../../../types/response.ts";
import type { EmailOtpForgetPasswordRequest } from "../auth.schema.ts";


export interface EmailOtpForgetPasswordResult extends ServiceResponse {
  data?: {
    userId: string;
  };
}

export async function emailOtpForgetPasswordService(
  params: EmailOtpForgetPasswordRequest,
): Promise<EmailOtpForgetPasswordResult> {
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

  const userId = existingUser[0].id;

  // Check if the user's account has providerId "credential" or "email"
  const userAccounts = await db
    .select({ providerId: accounts.providerId })
    .from(accounts)
    .where(eq(accounts.userId, userId));

  // If no accounts found or if any account has providerId not "credential" and not "email", return 404
  const hasOtherProvider = userAccounts.some(
    (account) => account.providerId !== "credential" && account.providerId !== "email",
  );

  if (userAccounts.length === 0 || hasOtherProvider) {
    return {
      success: false,
      statusCode: 404,
      errorKey: ($) => $.auth.userNotFound,
    };
  }

  // Rate limiting: Check if user has made more than N requests in the last hour
  const ONE_HOUR_AGO = new Date(Date.now() - config.limits.passwordResetRateLimitWindowMs);

  const requestCountResult = await db
    .select({ count: count() })
    .from(verifications)
    .where(and(eq(verifications.value, userId), gte(verifications.createdAt, ONE_HOUR_AGO)));

  const requestCount = requestCountResult[0]?.count || 0;

  if (requestCount >= config.limits.passwordResetRateLimit) {
    return {
      success: false,
      statusCode: 400, // or 429 tooManyRequests
      errorKey: ($) => $.auth.passwordResetRateLimitExceeded,
    };
  }

  return {
    success: true,
    data: {
      userId,
    },
  };
}
