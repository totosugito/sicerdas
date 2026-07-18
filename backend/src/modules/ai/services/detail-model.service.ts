import { db } from "../../../db/db-pool.ts";
import { aiModels, aiApiLogs } from "../../../db/schema/ai/index.ts";
import { eq, getTableColumns, desc } from "drizzle-orm";
import type { ServiceResponse } from "../../../types/index.ts";
import type { ModelDetailData } from "../ai.schema.ts";

export interface DetailModelResult extends ServiceResponse {
  data?: ModelDetailData;
}

export async function detailModelService(
  id: string,
): Promise<DetailModelResult> {
  const { apiKey, ...safeColumns } = getTableColumns(aiModels);

  const [model] = await db
    .select(safeColumns)
    .from(aiModels)
    .where(eq(aiModels.id, id));

  if (!model) {
    return { success: false, statusCode: 404, errorKey: ($) => $.chatAi.model.detail.notFound };
  }

  const logs = await db
    .select({
      periodStart: aiApiLogs.periodStart,
      successCount: aiApiLogs.successCount,
      totalRequests: aiApiLogs.totalRequests,
      avgDuration: aiApiLogs.avgDuration,
    })
    .from(aiApiLogs)
    .where(eq(aiApiLogs.modelId, model.id))
    .orderBy(desc(aiApiLogs.periodStart))
    .limit(5);

  const stats = logs.map((log) => ({
    date: log.periodStart.toISOString(),
    successCount: log.successCount,
    totalRequests: log.totalRequests,
    avgDuration: log.avgDuration || 0,
  }));

  return {
    success: true,
    data: {
      ...model,
      description: model.description ?? undefined,
      maxTokens: model.maxTokens ?? undefined,
      requiredTierId: model.requiredTierId ?? undefined,
      acceptedImageExtensions: model.acceptedImageExtensions ?? undefined,
      acceptedFileExtensions: model.acceptedFileExtensions ?? undefined,
      maxFileSize: model.maxFileSize ?? undefined,
      tierCapabilities: model.tierCapabilities ?? undefined,
      createdAt: model.createdAt.toISOString(),
      updatedAt: model.updatedAt.toISOString(),
      stats,
    },
  };
}
