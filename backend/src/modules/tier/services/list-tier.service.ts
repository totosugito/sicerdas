import { db } from "../../../db/db-pool.ts";
import { appTier } from "../../../db/schema/app/app-tier.ts";
import { asc } from "drizzle-orm";
import type { ServiceResponse } from "../../../types/response.ts";

export interface TierServiceResponse<T = TierItem> extends ServiceResponse {
  data?: T;
}

export interface TierItem {
  slug: string;
  name: string;
  price: string;
  currency: string;
  billingCycle: string;
  features: string[];
  limits: Record<string, unknown>;
  isActive: boolean;
  sortOrder: number;
  isPopular: boolean;
  createdAt: string;
  updatedAt: string;
}

export async function listTierService(): Promise<TierItem[]> {
  const tiers = await db.query.appTier.findMany({
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
