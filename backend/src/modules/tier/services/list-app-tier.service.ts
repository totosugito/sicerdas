import { db } from "../../../db/db-pool.ts";
import { appTier } from "../../../db/schema/app/app-tier.ts";
import { asc, eq } from "drizzle-orm";
import type { TierItem } from "./admin/list-tier.service.ts";

export async function listAppTierService(): Promise<TierItem[]> {
  const tiers = await db.query.appTier.findMany({
    where: eq(appTier.isActive, true),
    orderBy: [asc(appTier.sortOrder)],
  });

  return tiers.map((tier) => ({
    slug: tier.slug,
    name: tier.name,
    price: tier.price,
    currency: tier.currency,
    billingCycle: tier.billingCycle,
    features: tier.features || [],
    limits: tier.limits || {},
    isActive: tier.isActive,
    sortOrder: tier.sortOrder,
    isPopular: tier.isPopular,
    createdAt: tier.createdAt.toISOString(),
    updatedAt: tier.updatedAt.toISOString(),
  }));
}
