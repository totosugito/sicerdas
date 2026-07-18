import { db } from "../../../db/db-pool.ts";
import { users, usersProfile, accounts } from "../../../db/schema/user/index.ts";
import { eq } from "drizzle-orm";
import type { ServiceResponse } from "../../../types/response.ts";
import { getUserAvatarUrl } from "../../../utils/user/user-utils.ts";
import type { UserDetailsData } from "../user.schema.ts";

export interface GetUserDetailsResponse extends ServiceResponse {
  data?: UserDetailsData;
}

export async function getUserDetailsService(id: string): Promise<GetUserDetailsResponse> {
  const userWithAllData = await db
    .select({
      id: users.id,
      email: users.email,
      name: users.name,
      role: users.role,
      image: users.image,
      emailVerified: users.emailVerified,
      banned: users.banned,
      banReason: users.banReason,
      banExpires: users.banExpires,
      createdAt: users.createdAt,
      updatedAt: users.updatedAt,
      providerId: accounts.providerId,
      school: usersProfile.school,
      educationLevel: usersProfile.educationLevel,
      grade: usersProfile.grade,
      phone: usersProfile.phone,
      address: usersProfile.address,
      bio: usersProfile.bio,
      dateOfBirth: usersProfile.dateOfBirth,
      extra: usersProfile.extra,
    })
    .from(users)
    .leftJoin(accounts, eq(users.id, accounts.userId))
    .leftJoin(usersProfile, eq(users.id, usersProfile.id))
    .where(eq(users.id, id))
    .limit(1);

  const user = userWithAllData[0];

  if (!user) {
    return {
      success: false,
      statusCode: 404,
      errorKey: ($) => $.user.userNotFound,
    };
  }

  return {
    success: true,
    data: {
      ...user,
      role: user.role as any,
      image: getUserAvatarUrl(user.id, user.image),
      emailVerified: Boolean(user.emailVerified),
      banned: Boolean(user.banned),
      createdAt: user.createdAt.toISOString(),
      updatedAt: user.updatedAt.toISOString(),
      dateOfBirth: user.dateOfBirth ? user.dateOfBirth.toISOString().split("T")[0] : null,
      banExpires: user.banExpires ? user.banExpires.toISOString() : null,
      providerId: user.providerId || "",
      extra: (user.extra as Record<string, any>) || {},
    },
  };
}
