import { db } from "../../../db/db-pool.ts";
import { appVersion } from "../../../db/schema/app/app-version.ts";
import { and, desc, asc, sql, ilike, eq } from "drizzle-orm";
import type { PaginationMeta } from "../../../types/response.ts";
import type { AppVersion } from "../version.schema.ts";

export interface ListVersionParams {
  page?: number;
  limit?: number;
  search?: string;
  dataType?: string;
  status?: string;
  sortBy?: string;
  sortOrder?: string;
}

export interface ListVersionResponseData {
  items: AppVersion[];
  meta: PaginationMeta;
}

export async function listVersionService(params: ListVersionParams): Promise<ListVersionResponseData> {
  const {
    page = 1,
    limit = 10,
    search,
    dataType,
    status,
    sortBy = "createdAt",
    sortOrder = "desc",
  } = params;

  const offset = (page - 1) * limit;

  const conditions = [];
  if (search) {
    conditions.push(ilike(appVersion.name, `%${search}%`));
  }
  if (dataType) {
    conditions.push(eq(appVersion.dataType, dataType as any));
  }
  if (status) {
    conditions.push(eq(appVersion.status, status as any));
  }

  const baseQuery = db.select().from(appVersion);

  if (conditions.length > 0) {
    baseQuery.where(and(...conditions));
  }

  const order = sortOrder === "asc" ? asc : desc;
  let queryWithSort;

  switch (sortBy) {
    case "appVersion":
      queryWithSort = baseQuery.orderBy(order(appVersion.appVersion));
      break;
    case "dbVersion":
      queryWithSort = baseQuery.orderBy(order(appVersion.dbVersion));
      break;
    case "name":
      queryWithSort = baseQuery.orderBy(order(appVersion.name));
      break;
    case "status":
      queryWithSort = baseQuery.orderBy(order(appVersion.status));
      break;
    case "dataType":
      queryWithSort = baseQuery.orderBy(order(appVersion.dataType));
      break;
    case "updatedAt":
      queryWithSort = baseQuery.orderBy(order(appVersion.updatedAt));
      break;
    case "createdAt":
    default:
      queryWithSort = baseQuery.orderBy(order(appVersion.createdAt));
      break;
  }

  const countResult = await db
    .select({ count: sql<number>`count(*)` })
    .from(queryWithSort.as("subquery"));

  const total = Number(countResult[0]?.count || 0);

  const items = await queryWithSort.limit(limit).offset(offset);

  return {
    items: items.map((item) => ({
      ...item,
      dataType: item.dataType as any,
      status: item.status as any,
      name: item.name || "",
      note: (item.note as Record<string, unknown>[]) || [],
      extra: (item.extra as Record<string, unknown>) || {},
      createdAt: item.createdAt?.toISOString() ?? new Date().toISOString(),
      updatedAt: item.updatedAt?.toISOString() ?? new Date().toISOString(),
    })),
    meta: {
      total,
      page,
      limit,
      totalPages: Math.ceil(total / limit),
    },
  };
}
