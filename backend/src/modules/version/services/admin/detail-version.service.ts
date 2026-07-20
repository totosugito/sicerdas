import { db } from "../../../../db/db-pool.ts";
import { appVersion } from "../../../../db/schema/app/app-version.ts";
import { eq } from "drizzle-orm";
import type { AppVersion } from "../../version.schema.ts";
import type { ServiceResponse } from "../../../../types/index.ts";

export interface DetailVersionResponse extends ServiceResponse {
  data?: AppVersion;
}

export async function detailVersionService(id: number): Promise<DetailVersionResponse> {
  const item = await db.query.appVersion.findFirst({
    where: eq(appVersion.id, id),
  });

  if (!item) {
    return { success: false, statusCode: 404, errorKey: ($) => $.version.notFound };
  }

  return {
    success: true,
    data: {
      ...item,
      dataType: item.dataType as any,
      status: item.status as any,
      name: item.name || "",
      note: (item.note as Record<string, unknown>[]) || [],
      extra: (item.extra as Record<string, unknown>) || {},
      createdAt: item.createdAt?.toISOString() ?? new Date().toISOString(),
      updatedAt: item.updatedAt?.toISOString() ?? new Date().toISOString(),
    },
  };
}
