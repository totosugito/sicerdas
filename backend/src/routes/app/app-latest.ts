import type { FastifyInstance } from "fastify";
import { Type, type Static } from "@sinclair/typebox";
import { appVersion } from "../../db/schema/app/app-version.ts";
import { books } from "../../db/schema/book/books.ts";
import { bookGroup } from "../../db/schema/book/group.ts";
import { educationGrades } from "../../db/schema/education/index.ts";
import { bookCategory } from "../../db/schema/book/category.ts";
import { bookGroupStats } from "../../db/schema/book/group-stats.ts";
import { db } from "../../db/db-pool.ts";
import { and, gt, eq, asc, sql } from "drizzle-orm";
import { withErrorHandler } from "../../utils/withErrorHandler.ts";
import { getTypedI18n } from "../../utils/i18n-typed.ts";
import { EnumContentStatus } from "../../db/schema/enum/enum-app.ts";
import { blocknoteToHtml, resolveBlockNoteUrls } from "../../utils/blocknote-utils.ts";
import { usersProfile } from "../../db/schema/user/profiles.ts";
import envConfig from "../../config/env.config.ts";
import { getAuthInstance } from "../../decorators/auth.decorator.ts";
import { fromNodeHeaders } from "better-auth/node";

const AppLatestBody = Type.Object({
  dbVersion: Type.Number(),
});

const VersionItem = Type.Object({
  id: Type.Number(),
  appVersion: Type.Number(),
  dbVersion: Type.Number(),
  dataType: Type.String(),
  status: Type.String(),
  name: Type.String(),
  htmlNote: Type.String(),
  extra: Type.Record(Type.String(), Type.Unknown()),
});

const GradeItem = Type.Object({
  id: Type.Number(),
  grade: Type.String(),
  name: Type.String(),
  desc: Type.Union([Type.String(), Type.Null()]),
});

const CategoryItem = Type.Object({
  id: Type.Number(),
  name: Type.String(),
  key: Type.String(), // Mapping from 'code'
  description: Type.Union([Type.String(), Type.Null()]),
});

const GroupItem = Type.Object({
  id: Type.Number(),
  versionId: Type.Number(),
  categoryId: Type.Number(),
  name: Type.String(),
  shortName: Type.String(),
  desc: Type.Union([Type.String(), Type.Null()]),
  status: Type.String(),
  bookTotal: Type.Union([Type.Number(), Type.Null()]),
});

const SettingsItem = Type.Object({
  cloudUrl: Type.String(),
  showAds: Type.Boolean(),
  ads: Type.Object({
    adsDelayCounter: Type.Number(),
    adsDelayTimeInSec: Type.Number(),
    android: Type.Object({
      adsProvider: Type.String(),
      banner: Type.String(),
      rewards: Type.String(),
      interstitial: Type.String(),
      native: Type.String(),
    }),
    ios: Type.Object({
      adsProvider: Type.String(),
      banner: Type.String(),
      rewards: Type.String(),
      interstitial: Type.String(),
      native: Type.String(),
    }),
  }),
});

const BookItem = Type.Object({
  id: Type.String({ format: "uuid" }),
  bookId: Type.Number(),
  versionId: Type.Number(),
  title: Type.String(),
  description: Type.Union([Type.String(), Type.Null()]),
  author: Type.Union([Type.String(), Type.Null()]),
  publishedYear: Type.String(),
  totalPages: Type.Number(),
  size: Type.Number(),
  status: Type.String(),
  bookGroupId: Type.Number(),
  educationGradeId: Type.Number(),
});

const AppLatestResponse = Type.Object({
  success: Type.Boolean(),
  message: Type.String(),
  data: Type.Object({
    versions: Type.Array(VersionItem),
    books: Type.Array(BookItem),
    grades: Type.Array(GradeItem),
    categories: Type.Array(CategoryItem),
    groups: Type.Array(GroupItem),
    settings: SettingsItem,
  }),
});

export default async function appLatestRoute(app: FastifyInstance) {
  app.post("/app-latest", {
    schema: {
      body: AppLatestBody,
      response: {
        200: AppLatestResponse,
        "4xx": Type.Object({
          success: Type.Boolean({ default: false }),
          message: Type.String(),
        }),
        "5xx": Type.Object({
          success: Type.Boolean({ default: false }),
          message: Type.String(),
        }),
      },
    },
    handler: withErrorHandler(async (req, reply) => {
      const i18n = getTypedI18n(req);
      const { dbVersion: currentDbVersion } = req.body as any;
      const session = await getAuthInstance(app).api.getSession({
        headers: fromNodeHeaders(req.headers),
      });

      // Check if user is logged in
      const isLoggedIn = !!session?.user;
      const userId = isLoggedIn ? session?.user?.id : null;

      // Get user tier (default to "free" for guests or missing profiles)
      let userTier = "free";
      if (userId) {
        const p = await db
          .select({ tierId: usersProfile.tierId })
          .from(usersProfile)
          .where(eq(usersProfile.id, userId))
          .limit(1);

        // Only override if a profile exists and has a specific tierId
        if (p.length > 0 && p[0].tierId) {
          userTier = p[0].tierId;
        }
      }

      const showAds = userTier === "free";




      // 1. Get the internal appVersion.id for the client's current version
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

      // 2. Get ALL published versions newer than currentDbVersion
      const newVersions = await db
        .select()
        .from(appVersion)
        .where(
          and(
            eq(appVersion.status, EnumContentStatus.PUBLISHED),
            gt(appVersion.dbVersion, currentDbVersion)
          )
        )
        .orderBy(asc(appVersion.dbVersion));

      let bookItems: Static<typeof BookItem>[] = [];
      let allGrades: Static<typeof GradeItem>[] = [];
      let allCategories: Static<typeof CategoryItem>[] = [];
      let bookGroups: Static<typeof GroupItem>[] = [];

      if (newVersions.length > 0) {
        // 3. Fetch all raw books newer than client's version
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

        // 4. Fetch related metadata tables
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

      // 🚀 4. Convert blocknote JSON to HTML asynchronously
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
        })
      );

      return {
        success: true,
        message: i18n.t((l) => l.version.latestSuccess),
        data: {
          settings: {
            cloudUrl: envConfig.server.s3Storage.publicUrl,
            showAds: showAds,
            ads: {
              adsDelayCounter: envConfig.ads.delayCounter,
              adsDelayTimeInSec: envConfig.ads.delayTimeInSec,
              android: {
                adsProvider: envConfig.ads.android.provider,
                banner: envConfig.ads.android.bannerId,
                rewards: envConfig.ads.android.rewardedId,
                interstitial: envConfig.ads.android.interstitialId,
                native: envConfig.ads.android.nativeId,
              },
              ios: {
                adsProvider: envConfig.ads.ios.provider,
                banner: envConfig.ads.ios.bannerId,
                rewards: envConfig.ads.ios.rewardedId,
                interstitial: envConfig.ads.ios.interstitialId,
                native: envConfig.ads.ios.nativeId,
              },
            },
          },
          versions: versionsWithHtml,
          books: bookItems,
          grades: allGrades,
          categories: allCategories,
          groups: bookGroups,
        },
      };
    }),
  });
}
