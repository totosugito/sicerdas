import { db } from "../../../db/db-pool.ts";
import { appVersion } from "../../../db/schema/app/app-version.ts";
import { books } from "../../../db/schema/book/books.ts";
import { examPackages } from "../../../db/schema/exam/packages.ts";
import { examPackageSections } from "../../../db/schema/exam/package-sections.ts";
import { eq, sql } from "drizzle-orm";
import type { ServiceResponse } from "../../../types/index.ts";

export interface DeleteVersionResponse extends ServiceResponse {
  dataType?: string;
  status?: string;
}

export async function deleteVersionService(id: number): Promise<DeleteVersionResponse> {
  const existingVersion = await db.query.appVersion.findFirst({
    where: eq(appVersion.id, id),
  });

  if (!existingVersion) {
    return { success: false, statusCode: 404, errorKey: ($) => $.version.notFound };
  }

  // Referential Integrity Checks
  const [bookCount] = await db
    .select({ count: sql<number>`count(*)` })
    .from(books)
    .where(eq(books.versionId, id));
  if (Number(bookCount.count) > 0) {
    return { success: false, statusCode: 400, errorKey: ($) => $.version.delete.inUse };
  }

  const [packageCount] = await db
    .select({ count: sql<number>`count(*)` })
    .from(examPackages)
    .where(eq(examPackages.versionId, id));
  if (Number(packageCount.count) > 0) {
    return { success: false, statusCode: 400, errorKey: ($) => $.version.delete.inUse };
  }

  const [sectionCount] = await db
    .select({ count: sql<number>`count(*)` })
    .from(examPackageSections)
    .where(eq(examPackageSections.versionId, id));
  if (Number(sectionCount.count) > 0) {
    return { success: false, statusCode: 400, errorKey: ($) => $.version.delete.inUse };
  }

  await db.delete(appVersion).where(eq(appVersion.id, id));

  return {
    success: true,
    dataType: existingVersion.dataType,
    status: existingVersion.status,
  };
}
