import { db } from "../../../db/db-pool.ts";
import { appTier } from "../../../db/schema/app/app-tier.ts";
import { eq, ne, and, or } from "drizzle-orm";
import type { TierServiceResponse } from "./list-tier.service.ts";
import type { UpdateTierParams } from "../tier.schema.ts";

export async function updateTierService(slug: string, params: UpdateTierParams): Promise<TierServiceResponse> {
  const existingTier = await db.query.appTier.findFirst({
    where: eq(appTier.slug, slug),
  });

  if (!existingTier) {
    return {
      success: false,
      statusCode: 404,
      errorKey: ($) => $.appTier.update.notFound,
    };
  }

  // Explicitly exclude slug from update data to ensure it cannot be changed
  const { slug: _, ...updateData } = params as any;

  // Ignore isActive updates for default tiers
  if (["free", "pro", "enterprise"].includes(slug)) {
    delete updateData.isActive;
  }

  const { name } = updateData;

  if (name) {
    const targetSlug = existingTier.slug;
    const targetName = name || existingTier.name;

    const duplicateCheck = await db.query.appTier.findFirst({
      where: and(
        ne(appTier.slug, slug),
        or(
          eq(appTier.slug, targetSlug),
          eq(appTier.name, targetName)
        )
      ),
    });

    if (duplicateCheck) {
      return {
        success: false,
        statusCode: 400,
        errorKey: ($) => $.appTier.create.exists,
      };
    }
  }

  const [updatedTier] = await db
    .update(appTier)
    .set({
      ...updateData,
      updatedAt: new Date(),
    })
    .where(eq(appTier.slug, slug))
    .returning();

  return {
    success: true,
    data: {
      ...updatedTier,
      features: updatedTier.features || [],
      limits: updatedTier.limits || {},
      createdAt: updatedTier.createdAt.toISOString(),
      updatedAt: updatedTier.updatedAt.toISOString(),
    },
  };
}
