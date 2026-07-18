import { db } from "../../../db/db-pool.ts";
import {
  books,
  bookCategory,
  bookGroup,
  bookEventStats,
  bookInteractions,
} from "../../../db/schema/book/index.ts";
import { educationGrades } from "../../../db/schema/education/grades.ts";
import { and, eq, sql, desc } from "drizzle-orm";
import { getBookCoverUrl } from "../../../utils/book/book-utils.ts";
import type { ServiceResponse } from "../../../types/index.ts";
import type { FavoriteBookData } from "../book.schema.ts";

export interface FavoritesResult extends ServiceResponse {
  data?: FavoriteBookData[];
  pagination?: { total: number; page: number; pageSize: number; totalPages: number };
}

export async function favoritesService(
  userId: string,
  page: number,
  pageSize: number,
): Promise<FavoritesResult> {
  const offset = (page - 1) * pageSize;
  const whereClause = and(eq(bookInteractions.userId, userId), eq(bookInteractions.bookmarked, true));

  const [countResult] = await db
    .select({ count: sql<number>`count(*)` })
    .from(bookInteractions)
    .innerJoin(books, eq(bookInteractions.bookId, books.id))
    .where(whereClause);

  const total = Number(countResult?.count || 0);

  const favorites = await db
    .select({
      id: books.id,
      bookId: books.bookId,
      title: books.title,
      author: books.author,
      categoryName: bookCategory.name,
      grade: { id: educationGrades.id, name: educationGrades.name, grade: educationGrades.grade },
      rating: bookEventStats.rating,
      bookmarkCount: bookEventStats.bookmarkCount,
      viewCount: bookEventStats.viewCount,
      downloadCount: bookEventStats.downloadCount,
      isDownloaded: sql<boolean>`${bookInteractions.downloadCount} > 0`,
      bookmarkedAt: bookInteractions.updatedAt,
    })
    .from(bookInteractions)
    .innerJoin(books, eq(bookInteractions.bookId, books.id))
    .innerJoin(bookGroup, eq(books.bookGroupId, bookGroup.id))
    .innerJoin(bookCategory, eq(bookGroup.categoryId, bookCategory.id))
    .innerJoin(educationGrades, eq(books.educationGradeId, educationGrades.id))
    .leftJoin(bookEventStats, eq(books.id, bookEventStats.bookId))
    .where(whereClause)
    .orderBy(desc(bookInteractions.updatedAt))
    .limit(pageSize)
    .offset(offset);

  return {
    success: true,
    data: favorites.map((item) => ({
      id: item.id,
      bookId: item.bookId,
      title: item.title,
      author: item.author ?? undefined,
      cover: getBookCoverUrl({ bookId: item.bookId }) as { xs: string; lg: string },
      category: { name: item.categoryName },
      grade: item.grade,
      stats: {
        rating: item.rating != null ? parseFloat(item.rating.toString()) : 0,
        bookmarkCount: item.bookmarkCount ?? 0,
        viewCount: item.viewCount ?? 0,
        downloadCount: item.downloadCount ?? 0,
        isDownloaded: !!item.isDownloaded,
      },
      bookmarkedAt: item.bookmarkedAt.toISOString(),
    })),
    pagination: { total, page, pageSize, totalPages: Math.ceil(total / pageSize) },
  };
}
