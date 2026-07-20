import { db } from "../../../../db/db-pool.ts";
import { appVersion as tableAppVersion } from "../../../../db/schema/app/app-version.ts";
import { and, eq } from "drizzle-orm";
import { EnumContentStatus } from "../../../../db/schema/enum/enum-app.ts";
import type { ServiceResponse } from "../../../../types/index.ts";
import type { AppVersion, CreateVersionRequest } from "../../version.schema.ts";

export interface CreateVersionResponse extends ServiceResponse {
  data?: AppVersion;
}

export async function createVersionService(params: CreateVersionRequest): Promise<CreateVersionResponse> {
  const {
    appVersion: appVer,
    dbVersion: dbVer,
    dataType,
    status,
    name,
    note,
    extra,
  } = params;

  const existingVersion = await db.query.appVersion.findFirst({
    where: and(
      eq(tableAppVersion.appVersion, appVer),
      eq(tableAppVersion.dbVersion, dbVer),
      eq(tableAppVersion.dataType, dataType as any),
    ),
  });

  if (existingVersion) {
    return { success: false, statusCode: 400, errorKey: ($) => $.version.create.exists };
  }

  const [newVersion] = await db
    .insert(tableAppVersion)
    .values({
      appVersion: appVer,
      dbVersion: dbVer,
      dataType: dataType as any,
      status: (status as any) || EnumContentStatus.UNPUBLISHED,
      name,
      note: note || [],
      extra: extra || {},
    })
    .returning();

  return {
    success: true,
    data: {
      ...newVersion,
      dataType: newVersion.dataType as any,
      status: newVersion.status as any,
      name: newVersion.name || "",
      note: (newVersion.note as Record<string, unknown>[]) || [],
      extra: (newVersion.extra as Record<string, unknown>) || {},
      createdAt: newVersion.createdAt?.toISOString() ?? new Date().toISOString(),
      updatedAt: newVersion.updatedAt?.toISOString() ?? new Date().toISOString(),
    },
  };
}
