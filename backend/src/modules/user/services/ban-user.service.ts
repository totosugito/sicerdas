import { db } from "../../../db/db-pool.ts";
import { users } from "../../../db/schema/user/index.ts";
import { eq } from "drizzle-orm";
import type { ServiceResponse } from "../../../types/response.ts";

export interface BanUserParams {
  id: string;
  banned: boolean;
  banReason?: string;
  adminId?: string;
}

export async function banUserService(params: BanUserParams): Promise<ServiceResponse> {
  const { id, banned, banReason, adminId } = params;

  if (adminId === id) {
    return {
      success: false,
      statusCode: 400,
      errorKey: ($) => $.user.management.update.cannotBanSelf,
    };
  }

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

  await db
    .update(users)
    .set({
      banned,
      banReason: banned ? (banReason ?? null) : null,
      updatedAt: new Date(),
    })
    .where(eq(users.id, id));

  return { success: true };
}
