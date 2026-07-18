import { db } from "../../../db/db-pool.ts";
import { aiApiLogs, aiModels } from "../../../db/schema/ai/index.ts";
import { eq, desc, asc, and, gte, lte, sql } from "drizzle-orm";
import type { ServiceResponse } from "../../../types/index.ts";
import type { StatsQueryParams, StatsLogData } from "../ai.schema.ts";

export interface ListModelStatsResult extends ServiceResponse {
  data?: StatsLogData[];
  meta?: { total: number; limit: number; offset: number };
}

export async function listModelStatsService(
  params: StatsQueryParams,
): Promise<ListModelStatsResult> {
  const {
    modelId,
    periodStart,
    periodEnd,
    limit = 100,
    offset = 0,
    sortBy = "periodStart",
    sortOrder = "desc",
  } = params;

  const conditions = [];
  if (modelId) conditions.push(eq(aiApiLogs.modelId, modelId));
  if (periodStart) conditions.push(gte(aiApiLogs.periodStart, new Date(periodStart)));
  if (periodEnd) conditions.push(lte(aiApiLogs.periodEnd, new Date(periodEnd)));

  const sortColumn =
    sortBy === "totalRequests"
      ? aiApiLogs.totalRequests
      : sortBy === "successCount"
        ? aiApiLogs.successCount
        : sortBy === "failureCount"
          ? aiApiLogs.failureCount
          : sortBy === "avgDuration"
            ? aiApiLogs.avgDuration
            : sortBy === "totalTokens"
              ? aiApiLogs.totalTokens
              : aiApiLogs.periodStart;

  const orderByClause = sortOrder === "asc" ? asc(sortColumn) : desc(sortColumn);

  const [totalResult] = await db
    .select({ count: sql<number>`count(*)` })
    .from(aiApiLogs)
    .where(and(...conditions));

  const total = Number(totalResult?.count || 0);

  const logs = await db
    .select({
      id: aiApiLogs.id,
      modelId: aiApiLogs.modelId,
      periodStart: aiApiLogs.periodStart,
      periodEnd: aiApiLogs.periodEnd,
      successCount: aiApiLogs.successCount,
      failureCount: aiApiLogs.failureCount,
      totalRequests: aiApiLogs.totalRequests,
      avgDuration: aiApiLogs.avgDuration,
      totalTokens: aiApiLogs.totalTokens,
      createdAt: aiApiLogs.createdAt,
      modelName: aiModels.name,
    })
    .from(aiApiLogs)
    .leftJoin(aiModels, eq(aiApiLogs.modelId, aiModels.id))
    .where(and(...conditions))
    .orderBy(orderByClause)
    .limit(limit)
    .offset(offset);

  const data = logs.map((log) => ({
    ...log,
    periodStart: log.periodStart.toISOString(),
    periodEnd: log.periodEnd.toISOString(),
    createdAt: log.createdAt.toISOString(),
    avgDuration: log.avgDuration || 0,
    totalTokens: log.totalTokens || 0,
    modelName: log.modelName || undefined,
  }));

  return {
    success: true,
    data,
    meta: { total, limit, offset },
  };
}
