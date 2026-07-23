import { db } from "../../../../db/db-pool.ts";
import { users } from "../../../../db/schema/user/index.ts";
import { eq, inArray } from "drizzle-orm";
import env from "../../../../config/env.config.ts";
import { deleteStorageDirectory } from "../../../../platform/storage/storage.ts";
import type { ServiceResponse } from "../../../../types/response.ts";

export interface DeleteUserParams {
  id?: string;
  ids?: string[];
  logger?: any;
}

export async function deleteUserService(params: DeleteUserParams): Promise<ServiceResponse> {
  const { id, ids, logger } = params;

  if (id) {
    // Single delete
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

    try {
      await db.delete(users).where(eq(users.id, id));
      await deleteStorageDirectory(env.server.uploadsUserDir, id, user.createdAt, logger);
      return { success: true };
    } catch (error: any) {
      if (error && typeof error === "object" && "code" in error && error.code === "23503") {
        return {
          success: false,
          statusCode: 400,
          errorKey: ($) => $.user.management.delete.inUse,
        };
      }
      throw error;
    }
  } else if (ids && ids.length > 0) {
    // Bulk delete
    try {
      const targetUsers = await db
        .select({ id: users.id, createdAt: users.createdAt })
        .from(users)
        .where(inArray(users.id, ids));

      await db.delete(users).where(inArray(users.id, ids));

      for (const user of targetUsers) {
        await deleteStorageDirectory(env.server.uploadsUserDir, user.id, user.createdAt, logger);
      }

      return { success: true };
    } catch (error: any) {
      if (error && typeof error === "object" && "code" in error && error.code === "23503") {
        return {
          success: false,
          statusCode: 400,
          errorKey: ($) => $.user.management.delete.inUse,
        };
      }
      throw error;
    }
  }

  return {
    success: false,
    statusCode: 400,
    errorKey: ($) => $.user.management.missingUserId,
  };
}
