import { db } from "../../../db/db-pool.ts";
import { books, bookEventStats, bookInteractions } from "../../../db/schema/book/index.ts";
import { and, eq, sql } from "drizzle-orm";
import type { ServiceResponse } from "../../../types/index.ts";

export interface RatingResult extends ServiceResponse {
  data?: { rating: number; ratingCount: number; userInteraction: { rating: number } };
}

export async function ratingService(
  userId: string,
  bookId: number,
  rating: number,
): Promise<RatingResult> {
  const bookList = await db.select({ id: books.id }).from(books).where(eq(books.bookId, bookId)).limit(1);
  if (bookList.length === 0) {
    return { success: false, statusCode: 404, errorKey: ($) => $.book.detail.notFound };
  }

  const bookUUID = bookList[0].id;
  const existingInteraction = await db.query.bookInteractions.findFirst({
    where: and(eq(bookInteractions.userId, userId), eq(bookInteractions.bookId, bookUUID)),
  });

  const oldRating = existingInteraction?.rating ? parseFloat(existingInteraction.rating.toString()) : 0;

  if (oldRating === rating) {
    const currentStats = await db.query.bookEventStats.findFirst({
      where: eq(bookEventStats.bookId, bookUUID),
      columns: { rating: true, ratingCount: true },
    });
    return {
      success: true,
      data: {
        rating: currentStats?.rating ? parseFloat(currentStats.rating.toString()) : 0,
        ratingCount: currentStats?.ratingCount ?? 0,
        userInteraction: { rating: oldRating },
      },
    };
  }

  await db
    .insert(bookInteractions)
    .values({ userId, bookId: bookUUID, rating: rating.toFixed(2), liked: false, disliked: false, bookmarked: false, viewCount: 0, downloadCount: 0 })
    .onConflictDoUpdate({
      target: [bookInteractions.userId, bookInteractions.bookId],
      set: { rating: rating.toFixed(2), updatedAt: new Date() },
    });

  const isFirstTime = oldRating === 0;
  const ratingDiff = rating - oldRating;

  await db
    .insert(bookEventStats)
    .values({ bookId: bookUUID, ratingSum: rating.toFixed(2), ratingCount: 1, rating: rating.toFixed(2) })
    .onConflictDoUpdate({
      target: bookEventStats.bookId,
      set: {
        ratingSum: sql`${bookEventStats.ratingSum} + ${ratingDiff}`,
        ratingCount: isFirstTime ? sql`${bookEventStats.ratingCount} + 1` : sql`${bookEventStats.ratingCount}`,
        updatedAt: new Date(),
      },
    });

  await db
    .update(bookEventStats)
    .set({ rating: sql`CASE WHEN ${bookEventStats.ratingCount} > 0 THEN ${bookEventStats.ratingSum} / ${bookEventStats.ratingCount} ELSE 0 END` })
    .where(eq(bookEventStats.bookId, bookUUID));

  const finalStats = await db.query.bookEventStats.findFirst({
    where: eq(bookEventStats.bookId, bookUUID),
    columns: { rating: true, ratingCount: true },
  });

  return {
    success: true,
    data: {
      rating: finalStats?.rating ? parseFloat(finalStats.rating.toString()) : 0,
      ratingCount: finalStats?.ratingCount ?? 0,
      userInteraction: { rating },
    },
  };
}
