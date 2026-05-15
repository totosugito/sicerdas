import type { FastifyInstance } from "fastify";
import { Type } from "@sinclair/typebox";
import { appVersion } from "../../db/schema/app/app-version.ts";
import { books } from "../../db/schema/book/books.ts";
import { bookGroup } from "../../db/schema/book/group.ts";
import { bookCategory } from "../../db/schema/book/category.ts";
import { educationGrades } from "../../db/schema/education/grades.ts";
import { db } from "../../db/db-pool.ts";
import { and, gt, eq, asc } from "drizzle-orm";
import { withErrorHandler } from "../../utils/withErrorHandler.ts";
import { getTypedI18n } from "../../utils/i18n-typed.ts";
import { EnumContentStatus } from "../../db/schema/enum/enum-app.ts";
import { blocknoteToHtml, resolveBlockNoteUrls } from "../../utils/blocknote-utils.ts";

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

const BookItem = Type.Object({
  id: Type.String({ format: "uuid" }),
  bookId: Type.Number(),
  versionId: Type.Number(),
  title: Type.String(),
  description: Type.Optional(Type.String()),
  author: Type.Optional(Type.String()),
  publishedYear: Type.String(),
  totalPages: Type.Number(),
  size: Type.Number(),
  status: Type.String(),
  rating: Type.Optional(Type.Number()),
  viewCount: Type.Optional(Type.Number()),
  downloadCount: Type.Optional(Type.Number()),
  bookmarkCount: Type.Optional(Type.Number()),
  cover: Type.Object({
    xs: Type.String(),
    lg: Type.String(),
  }),
  category: Type.Object({
    id: Type.Number(),
    name: Type.String(),
  }),
  group: Type.Object({
    id: Type.Number(),
    name: Type.String(),
    shortName: Type.String(),
  }),
  grade: Type.Object({
    id: Type.Number(),
    name: Type.String(),
    grade: Type.String(),
  }),
});

const AppLatestResponse = Type.Object({
  success: Type.Boolean(),
  message: Type.String(),
  data: Type.Object({
    versions: Type.Array(VersionItem),
    books: Type.Array(BookItem),
  }),
});

export default async function appLatestRoute(fastify: FastifyInstance) {
  fastify.post("/app-latest", {
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
    handler: withErrorHandler(async (request, reply) => {
      const i18n = getTypedI18n(request);
      const { dbVersion: currentDbVersion } = request.body as any;

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

      let richBooks: any[] = [];

      // 3. Fetch all books with versionId > clientVersionId
      const versionBooks = await db
        .select({
          book: books,
          group: bookGroup,
          category: bookCategory,
          grade: educationGrades,
        })
        .from(books)
        .innerJoin(bookGroup, eq(books.bookGroupId, bookGroup.id))
        .innerJoin(bookCategory, eq(bookGroup.categoryId, bookCategory.id))
        .innerJoin(educationGrades, eq(books.educationGradeId, educationGrades.id))
        .where(
          gt(books.versionId, clientVersionId)
        );

      richBooks = versionBooks.map((item) => {
        const extra = (item.book.extra as any) || {};
        const cover = (extra.cover as any) || { xs: "", lg: "" };

        return {
          id: item.book.id,
          bookId: item.book.bookId,
          versionId: item.book.versionId,
          title: item.book.title,
          description: item.book.description,
          author: item.book.author,
          publishedYear: item.book.publishedYear,
          totalPages: item.book.totalPages,
          size: item.book.size,
          status: item.book.status,
          rating: extra.rating || 0,
          viewCount: extra.viewCount || 0,
          downloadCount: extra.downloadCount || 0,
          bookmarkCount: extra.bookmarkCount || 0,
          cover: {
            xs: cover.xs || "",
            lg: cover.lg || "",
          },
          category: {
            id: item.category.id,
            name: item.category.name,
          },
          group: {
            id: item.group.id,
            name: item.group.name,
            shortName: item.group.shortName,
          },
          grade: {
            id: item.grade.id,
            name: item.grade.name,
            grade: item.grade.grade,
          },
        };
      });

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
          versions: versionsWithHtml,
          books: richBooks,
        },
      };
    }),
  });
}
