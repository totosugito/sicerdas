import { db } from "../../../../db/db-pool.ts";
import { books, bookEventStats, bookInteractions } from "../../../../db/schema/book/index.ts";
import { and, eq, sql } from "drizzle-orm";
import type { ServiceResponse } from "../../../../types/index.ts";

export interface BookmarkResult extends ServiceResponse {
  data?: { bookmarked: boolean; bookmarkCount: number };
}

export async function bookmarkService(
  userId: string,
  bookId: number,
  bookmarked: boolean,
): Promise<BookmarkResult> {
  const bookList = await db.select({ id: books.id }).from(books).where(eq(books.bookId, bookId)).limit(1);
  if (bookList.length === 0) {
    return { success: false, statusCode: 404, errorKey: ($) => $.book.detail.notFound };
  }

  const bookUUID = bookList[0].id;
  const existingInteraction = await db.query.bookInteractions.findFirst({
    where: and(eq(bookInteractions.userId, userId), eq(bookInteractions.bookId, bookUUID)),
  });

  const currentlyBookmarked = existingInteraction?.bookmarked ?? false;
  if (currentlyBookmarked === bookmarked) {
    const currentStats = await db.query.bookEventStats.findFirst({
      where: eq(bookEventStats.bookId, bookUUID),
      columns: { bookmarkCount: true },
    });
    return { success: true, data: { bookmarked: currentlyBookmarked, bookmarkCount: currentStats?.bookmarkCount ?? 0 } };
  }

  await db
    .insert(bookInteractions)
    .values({ userId, bookId: bookUUID, bookmarked, liked: false, disliked: false, rating: "0.00", viewCount: 0, downloadCount: 0 })
    .onConflictDoUpdate({
      target: [bookInteractions.userId, bookInteractions.bookId],
      set: { bookmarked, updatedAt: new Date() },
    });

  const incrementValue = bookmarked ? 1 : -1;
  await db
    .insert(bookEventStats)
    .values({ bookId: bookUUID, bookmarkCount: bookmarked ? 1 : 0 })
    .onConflictDoUpdate({
      target: bookEventStats.bookId,
      set: { bookmarkCount: sql`${bookEventStats.bookmarkCount} + ${incrementValue}`, updatedAt: new Date() },
    });

  const finalStats = await db.query.bookEventStats.findFirst({
    where: eq(bookEventStats.bookId, bookUUID),
    columns: { bookmarkCount: true },
  });

  return { success: true, data: { bookmarked, bookmarkCount: finalStats?.bookmarkCount ?? 0 } };
}
