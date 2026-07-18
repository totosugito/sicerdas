import { db } from "../../../db/db-pool.ts";
import {
  books,
  bookCategory,
  bookGroup,
  bookEventStats,
  bookInteractions,
} from "../../../db/schema/book/index.ts";
import { educationGrades } from "../../../db/schema/education/grades.ts";
import { appEventHistory } from "../../../db/schema/app/app-event-history.ts";
import { and, eq, sql, desc } from "drizzle-orm";
import { EnumContentType, EnumEventStatus } from "../../../db/schema/enum/enum-app.ts";
import { getBookCoverUrl, getBookPdfUrl, getBookSamplePagesUrl } from "../../../utils/book/book-utils.ts";
import config from "../../../config/env.config.ts";
import type { ServiceResponse } from "../../../types/index.ts";
import type { BookDetailData } from "../book.schema.ts";

export interface DetailBookResult extends ServiceResponse {
  data?: BookDetailData;
}

export async function detailBookService(
  bookId: number,
  userId: string | null,
  latestVersionId: number | undefined,
  ip: string | undefined,
  userAgent: string | undefined,
  sessionId: string | null,
): Promise<DetailBookResult> {
  const isLoggedIn = !!userId;

  let baseQuery;
  if (isLoggedIn) {
    baseQuery = db
      .select({
        id: books.id,
        bookId: books.bookId,
        title: books.title,
        description: books.description,
        author: books.author,
        publishedYear: books.publishedYear,
        totalPages: books.totalPages,
        size: books.size,
        status: books.status,
        rating: bookEventStats.rating,
        viewCount: bookEventStats.viewCount,
        downloadCount: bookEventStats.downloadCount,
        bookmarkCount: bookEventStats.bookmarkCount,
        ratingCount: bookEventStats.ratingCount,
        isNew: latestVersionId
          ? sql<boolean>`${books.versionId} = ${latestVersionId}`.as("isNew")
          : sql<boolean>`false`.as("isNew"),
        createdAt: books.createdAt,
        updatedAt: books.updatedAt,
        category: { id: bookCategory.id, name: bookCategory.name },
        group: { id: bookGroup.id, name: bookGroup.name, shortName: bookGroup.shortName },
        grade: { id: educationGrades.id, name: educationGrades.name, grade: educationGrades.grade },
        liked: bookInteractions.liked,
        disliked: bookInteractions.disliked,
        userRating: bookInteractions.rating,
        bookmarked: bookInteractions.bookmarked,
        userViewCount: bookInteractions.viewCount,
        userDownloadCount: bookInteractions.downloadCount,
      })
      .from(books)
      .leftJoin(bookGroup, eq(books.bookGroupId, bookGroup.id))
      .leftJoin(bookCategory, eq(bookGroup.categoryId, bookCategory.id))
      .leftJoin(educationGrades, eq(books.educationGradeId, educationGrades.id))
      .leftJoin(bookEventStats, eq(books.id, bookEventStats.bookId))
      .leftJoin(bookInteractions, and(eq(books.id, bookInteractions.bookId), eq(bookInteractions.userId, userId)))
      .where(eq(books.bookId, bookId));
  } else {
    baseQuery = db
      .select({
        id: books.id,
        bookId: books.bookId,
        title: books.title,
        description: books.description,
        author: books.author,
        publishedYear: books.publishedYear,
        totalPages: books.totalPages,
        size: books.size,
        status: books.status,
        rating: bookEventStats.rating,
        viewCount: bookEventStats.viewCount,
        downloadCount: bookEventStats.downloadCount,
        bookmarkCount: bookEventStats.bookmarkCount,
        ratingCount: bookEventStats.ratingCount,
        isNew: latestVersionId
          ? sql<boolean>`${books.versionId} = ${latestVersionId}`.as("isNew")
          : sql<boolean>`false`.as("isNew"),
        createdAt: books.createdAt,
        updatedAt: books.updatedAt,
        category: { id: bookCategory.id, name: bookCategory.name },
        group: { id: bookGroup.id, name: bookGroup.name, shortName: bookGroup.shortName },
        grade: { id: educationGrades.id, name: educationGrades.name, grade: educationGrades.grade },
        liked: sql<boolean | null>`NULL`.as("liked"),
        disliked: sql<boolean | null>`NULL`.as("disliked"),
        userRating: sql<string | null>`NULL`.as("userRating"),
        bookmarked: sql<boolean | null>`NULL`.as("bookmarked"),
        userViewCount: sql<number | null>`NULL`.as("userViewCount"),
        userDownloadCount: sql<number | null>`NULL`.as("userDownloadCount"),
      })
      .from(books)
      .leftJoin(bookGroup, eq(books.bookGroupId, bookGroup.id))
      .leftJoin(bookCategory, eq(bookGroup.categoryId, bookCategory.id))
      .leftJoin(educationGrades, eq(books.educationGradeId, educationGrades.id))
      .leftJoin(bookEventStats, eq(books.id, bookEventStats.bookId))
      .where(eq(books.bookId, bookId));
  }

  const result = await baseQuery;
  if (!result || result.length === 0) {
    return { success: false, statusCode: 404, errorKey: ($) => $.book.detail.notFound };
  }

  const book = result[0];

  const trackCondition = userId
    ? eq(appEventHistory.userId, userId)
    : sessionId
      ? eq(appEventHistory.sessionId, sessionId)
      : eq(appEventHistory.ipAddress, ip ?? null as any);

  const shouldTrack = async (targetUserId: string | null, targetSessionId: string | null) => {
    const lastEvent = await db.query.userEventHistory.findFirst({
      where: and(
        eq(appEventHistory.referenceId, book.id),
        eq(appEventHistory.action, EnumEventStatus.VIEW),
        trackCondition,
      ),
      orderBy: desc(appEventHistory.createdAt),
    });

    const now = new Date();
    if (!lastEvent || now.getTime() - lastEvent.createdAt.getTime() > config.limits.contentCounterWindowMs) {
      await db.insert(appEventHistory).values({
        userId: targetUserId,
        referenceId: book.id,
        contentType: EnumContentType.BOOK,
        action: EnumEventStatus.VIEW,
        sessionId: targetSessionId,
        ipAddress: ip || null,
        userAgent,
      });

      await db
        .insert(bookEventStats)
        .values({ bookId: book.id, viewCount: 1 })
        .onConflictDoUpdate({
          target: bookEventStats.bookId,
          set: { viewCount: sql`${bookEventStats.viewCount} + 1`, updatedAt: new Date() },
        });

      return true;
    }
    return false;
  };

  if (isLoggedIn) {
    const isNewView = await shouldTrack(userId, null);
    if (isNewView) {
      await db
        .insert(bookInteractions)
        .values({
          userId,
          bookId: book.id,
          viewCount: 1,
          liked: false,
          disliked: false,
          bookmarked: false,
          rating: "0.00",
          downloadCount: 0,
        })
        .onConflictDoUpdate({
          target: [bookInteractions.userId, bookInteractions.bookId],
          set: { viewCount: sql`${bookInteractions.viewCount} + 1`, updatedAt: new Date() },
        });
    }
  } else {
    await shouldTrack(null, sessionId);
  }

  const toNum = (v: any, fallback: number) => (v != null ? parseFloat(v.toString()) : fallback);

  const cover = getBookCoverUrl({ bookId: book.bookId }) as { xs: string; lg: string };
  const samples = getBookSamplePagesUrl({ bookId: book.bookId }) as { xs: string; lg: string };

  const data: BookDetailData = {
    id: book.id,
    bookId: book.bookId,
    title: book.title,
    description: book.description ?? undefined,
    author: book.author ?? undefined,
    publishedYear: book.publishedYear,
    totalPages: book.totalPages,
    size: book.size,
    status: book.status,
    rating: book.rating != null && parseFloat(book.rating.toString()) > 0 ? parseFloat(book.rating.toString()) : 5.0,
    viewCount: book.viewCount ?? 0,
    downloadCount: book.downloadCount ?? 0,
    bookmarkCount: book.bookmarkCount ?? 0,
    ratingCount: book.ratingCount ?? 0,
    cover,
    pdf: getBookPdfUrl({ bookId: book.bookId }),
    samples,
    category: book.category ? { id: book.category.id, name: book.category.name } : { id: 0, name: "" },
    group: book.group ? { id: book.group.id, name: book.group.name, shortName: book.group.shortName } : { id: 0, name: "", shortName: "" },
    grade: book.grade ? { id: book.grade.id, name: book.grade.name, grade: book.grade.grade } : { id: 0, name: "", grade: "" },
    isNew: !!book.isNew,
    createdAt: book.createdAt?.toISOString() ?? new Date().toISOString(),
    updatedAt: book.updatedAt?.toISOString() ?? new Date().toISOString(),
  };

  if (isLoggedIn && book.liked !== undefined) {
    data.userInteraction = {
      liked: book.liked ?? false,
      disliked: book.disliked ?? false,
      rating: toNum(book.userRating, 0),
      bookmarked: book.bookmarked ?? false,
      viewCount: book.userViewCount ?? 0,
      downloadCount: book.userDownloadCount ?? 0,
    };
  }

  return { success: true, data };
}
