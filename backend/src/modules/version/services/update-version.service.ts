import { db } from "../../../db/db-pool.ts";
import { appVersion as tableAppVersion } from "../../../db/schema/app/app-version.ts";
import { eq } from "drizzle-orm";
import type { ServiceResponse } from "../../../types/index.ts";
import type { AppVersion, UpdateVersionBodyType } from "../version.schema.ts";

export interface UpdateVersionResponse extends ServiceResponse {
  data?: AppVersion;
}

export async function updateVersionService(id: number, params: UpdateVersionBodyType): Promise<UpdateVersionResponse> {
  const { appVersion: appVer, dbVersion: dbVer, status, name, note, extra } = params;

  const existingVersion = await db.query.appVersion.findFirst({
    where: eq(tableAppVersion.id, id),
  });

  if (!existingVersion) {
    return { success: false, statusCode: 404, errorKey: ($) => $.version.notFound };
  }

  const [updatedVersion] = await db
    .update(tableAppVersion)
    .set({
      appVersion: appVer !== undefined ? appVer : undefined,
      dbVersion: dbVer !== undefined ? dbVer : undefined,
      status: status !== undefined ? (status as any) : undefined,
      name: name !== undefined ? name : undefined,
      note: note !== undefined ? note : undefined,
      extra: extra !== undefined ? extra : undefined,
      updatedAt: new Date(),
    })
    .where(eq(tableAppVersion.id, id))
    .returning();

  return {
    success: true,
    data: {
      ...updatedVersion,
      dataType: updatedVersion.dataType as any,
      status: updatedVersion.status as any,
      name: updatedVersion.name || "",
      note: (updatedVersion.note as Record<string, unknown>[]) || [],
      extra: (updatedVersion.extra as Record<string, unknown>) || {},
      createdAt: updatedVersion.createdAt?.toISOString() ?? new Date().toISOString(),
      updatedAt: updatedVersion.updatedAt?.toISOString() ?? new Date().toISOString(),
    },
  };
}
