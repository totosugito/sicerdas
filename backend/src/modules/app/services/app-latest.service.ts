import { db } from "../../../db/db-pool.ts";
import { appVersion } from "../../../db/schema/app/app-version.ts";
import { books } from "../../../db/schema/book/books.ts";
import { bookGroup } from "../../../db/schema/book/group.ts";
import { educationGrades } from "../../../db/schema/education/index.ts";
import { bookCategory } from "../../../db/schema/book/category.ts";
import { bookGroupStats } from "../../../db/schema/book/group-stats.ts";
import { usersProfile } from "../../../db/schema/user/profiles.ts";
import { and, gt, eq, asc, sql } from "drizzle-orm";
import { EnumContentStatus } from "../../../db/schema/enum/enum-app.ts";
import { blocknoteToHtml, resolveBlockNoteUrls } from "../../../utils/blocknote/blocknote-utils.ts";
import { getAppSettings } from "../../../platform/settings/settings.ts";
import type { ServiceResponse } from "../../../types/index.ts";
import type {
  AppLatestVersion,
  AppLatestBook,
  AppLatestGrade,
  AppLatestCategory,
  AppLatestGroup,
  AppSettings,
} from "../app-latest.schema.ts";

export interface AppLatestResult extends ServiceResponse {
  data?: {
    versions: AppLatestVersion[];
    books: AppLatestBook[];
    grades: AppLatestGrade[];
    categories: AppLatestCategory[];
    groups: AppLatestGroup[];
    settings: AppSettings;
  };
}

export async function appLatestService(
  currentDbVersion: number,
  userId: string | null,
): Promise<AppLatestResult> {
  let userTier = "free";
  if (userId) {
    const p = await db
      .select({ tierId: usersProfile.tierId })
      .from(usersProfile)
      .where(eq(usersProfile.id, userId))
      .limit(1);

    if (p.length > 0 && p[0].tierId) {
      userTier = p[0].tierId;
    }
  }

  const showAds = userTier === "free";

  let clientVersionId = 0;
  if (currentDbVersion > 0) {
    const v = await db
      .select({ id: appVersion.id })
      .from(appVersion)
      .where(eq(appVersion.dbVersion, currentDbVersion))
      .limit(1);
    if (v.length > 0) {
      clientVersionId = v[0].id;
    }
  }

  const newVersions = await db
    .select()
    .from(appVersion)
    .where(
      and(
        eq(appVersion.status, EnumContentStatus.PUBLISHED),
        gt(appVersion.dbVersion, currentDbVersion),
      ),
    )
    .orderBy(asc(appVersion.dbVersion));

  let bookItems: AppLatestBook[] = [];
  let allGrades: AppLatestGrade[] = [];
  let allCategories: AppLatestCategory[] = [];
  let bookGroups: AppLatestGroup[] = [];

  if (newVersions.length > 0) {
    bookItems = await db
      .select({
        id: books.id,
        bookId: books.bookId,
        versionId: books.versionId,
        title: books.title,
        description: books.description,
        author: books.author,
        publishedYear: books.publishedYear,
        totalPages: books.totalPages,
        size: books.size,
        status: books.status,
        bookGroupId: books.bookGroupId,
        educationGradeId: books.educationGradeId,
      })
      .from(books)
      .where(gt(books.versionId, clientVersionId));

    allGrades = await db
      .select({
        id: educationGrades.id,
        grade: educationGrades.grade,
        name: educationGrades.name,
        desc: educationGrades.desc,
      })
      .from(educationGrades);

    allCategories = await db
      .select({
        id: bookCategory.id,
        name: bookCategory.name,
        key: bookCategory.code,
        description: bookCategory.desc,
      })
      .from(bookCategory);

    bookGroups = await db
      .select({
        id: bookGroup.id,
        versionId: bookGroup.versionId,
        categoryId: bookGroup.categoryId,
        name: bookGroup.name,
        shortName: bookGroup.shortName,
        desc: bookGroup.desc,
        status: bookGroup.status,
        bookTotal: sql<number>`coalesce(${bookGroupStats.bookTotal}, 0)`.mapWith(Number),
      })
      .from(bookGroup)
      .leftJoin(bookGroupStats, eq(bookGroupStats.bookGroupId, bookGroup.id))
      .where(gt(bookGroup.versionId, clientVersionId));
  }

  const versionsWithHtml = await Promise.all(
    newVersions.map(async (v) => {
      const resolvedNote = resolveBlockNoteUrls(v.note as any);
      return {
        id: v.id,
        appVersion: v.appVersion,
        dbVersion: v.dbVersion,
        dataType: v.dataType,
        status: v.status,
        name: v.name || "",
        htmlNote: await blocknoteToHtml(resolvedNote),
        extra: (v.extra as any) || {},
      };
    }),
  );

  return {
    success: true,
    data: {
      settings: getAppSettings(showAds) as AppSettings,
      versions: versionsWithHtml,
      books: bookItems,
      grades: allGrades,
      categories: allCategories,
      groups: bookGroups,
    },
  };
}
