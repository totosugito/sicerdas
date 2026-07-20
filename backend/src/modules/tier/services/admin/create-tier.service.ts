import { db } from "../../../../db/db-pool.ts";
import { appTier } from "../../../../db/schema/app/app-tier.ts";
import { eq, or, count } from "drizzle-orm";
import type { TierServiceResponse } from "./list-tier.service.ts";
import type { CreateTierParams } from "../../tier.schema.ts";

export async function createTierService(params: CreateTierParams): Promise<TierServiceResponse> {
  const { slug, name } = params;

  const existingTier = await db.query.appTier.findFirst({
    where: or(
      eq(appTier.slug, slug),
      eq(appTier.name, name)
    ),
  });

  if (existingTier) {
    return {
      success: false,
      statusCode: 400,
      errorKey: ($) => $.appTier.create.exists,
    };
  }

  let sortOrder = params.sortOrder;
  if (sortOrder === undefined || sortOrder === -1) {
    const [result] = await db.select({ count: count() }).from(appTier);
    sortOrder = result.count + 1;
  }

  const [newTier] = await db.insert(appTier).values({
    ...params,
    sortOrder,
    features: params.features || [],
    limits: params.limits || {},
  }).returning();

  return {
    success: true,
    data: {
      ...newTier,
      features: newTier.features || [],
      limits: newTier.limits || {},
      createdAt: newTier.createdAt.toISOString(),
      updatedAt: newTier.updatedAt.toISOString(),
    },
  };
}
