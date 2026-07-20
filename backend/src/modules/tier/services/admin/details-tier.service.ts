import { db } from "../../../../db/db-pool.ts";
import { appTier } from "../../../../db/schema/app/app-tier.ts";
import { eq } from "drizzle-orm";
import type { TierServiceResponse } from "./list-tier.service.ts";

export async function detailsTierService(slug: string): Promise<TierServiceResponse> {
  const tier = await db.query.appTier.findFirst({
    where: eq(appTier.slug, slug),
  });

  if (!tier) {
    return {
      success: false,
      statusCode: 404,
      errorKey: ($) => $.appTier.details.notFound,
    };
  }

  return {
    success: true,
    data: {
      ...tier,
      features: tier.features || [],
      limits: tier.limits || {},
      createdAt: tier.createdAt.toISOString(),
      updatedAt: tier.updatedAt.toISOString(),
    },
  };
}
