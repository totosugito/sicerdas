import { db } from "../../../db/db-pool.ts";
import { users, profiles } from "../../../db/schema/users/index.ts";
import { eq } from "drizzle-orm";
import { getUserAvatarUrl } from "../../../utils/user/user-utils.ts";
import type { ServiceResponse } from "../../../types/response.ts";
import type { SignInUserResult } from "../auth.schema.ts";

export interface SignInEmailResult extends ServiceResponse {
  data?: SignInUserResult;
}

export async function signInEmailService(userId: string): Promise<SignInEmailResult> {
  const userRecord = await db
    .select({
      id: users.id,
      email: users.email,
      name: users.name,
      image: users.image,
      emailVerified: users.emailVerified,
      role: users.role,
      createdAt: users.createdAt,
      updatedAt: users.updatedAt,
      tierId: profiles.tierId,
    })
    .from(users)
    .leftJoin(profiles, eq(users.id, profiles.id))
    .where(eq(users.id, userId))
    .limit(1);

  const userWithRole = userRecord.length > 0 ? userRecord[0] : null;

  if (!userWithRole) {
    return {
      success: false,
      statusCode: 404,
      errorKey: ($) => $.auth.userNotFound,
    };
  }

  const tierId = userWithRole.tierId || "free";
  const showAds = tierId === "free";

  return {
    success: true,
    data: {
      id: userWithRole.id,
      email: userWithRole.email,
      name: userWithRole.name,
      image: getUserAvatarUrl(userWithRole.id, userWithRole.image),
      emailVerified: userWithRole.emailVerified,
      role: userWithRole.role,
      showAds,
      tierId,
      createdAt: userWithRole.createdAt.toISOString(),
      updatedAt: userWithRole.updatedAt.toISOString(),
    },
  };
}
