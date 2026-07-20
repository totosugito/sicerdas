import { db } from "../../../../db/db-pool.ts";
import { appTier } from "../../../../db/schema/app/app-tier.ts";
import { usersProfile } from "../../../../db/schema/user/index.ts";
import { aiModels } from "../../../../db/schema/ai/index.ts";
import { eq, count } from "drizzle-orm";
import type { ServiceResponse } from "../../../../types/response.ts";

export interface DeleteTierResponse extends ServiceResponse {
  extraData?: {
    count: number;
  };
}

export async function deleteTierService(slug: string): Promise<DeleteTierResponse> {
  if (["free", "pro", "enterprise"].includes(slug)) {
    return {
      success: false,
      statusCode: 400,
      errorKey: ($) => $.appTier.delete.defaultData,
    };
  }

  const existingTier = await db.query.appTier.findFirst({
    where: eq(appTier.slug, slug),
  });

  if (!existingTier) {
    return {
      success: false,
      statusCode: 404,
      errorKey: ($) => $.appTier.delete.notFound,
    };
  }

  // Check if tier is being used by any user profiles
  const [userProfileCount] = await db
    .select({ count: count() })
    .from(usersProfile)
    .where(eq(usersProfile.tierId, slug));

  if (userProfileCount.count > 0) {
    return {
      success: false,
      statusCode: 400,
      errorKey: ($) => $.appTier.delete.usedByUsers,
      extraData: { count: userProfileCount.count },
    };
  }

  // Check if tier is being used by any AI models
  const [aiModelCount] = await db
    .select({ count: count() })
    .from(aiModels)
    .where(eq(aiModels.requiredTierId, slug));

  if (aiModelCount.count > 0) {
    return {
      success: false,
      statusCode: 400,
      errorKey: ($) => $.appTier.delete.usedByModels,
      extraData: { count: aiModelCount.count },
    };
  }

  await db.delete(appTier).where(eq(appTier.slug, slug));

  return {
    success: true,
  };
}
