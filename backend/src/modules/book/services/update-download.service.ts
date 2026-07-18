import { db } from "../../../db/db-pool.ts";
import { books, bookEventStats, bookInteractions } from "../../../db/schema/book/index.ts";
import { appEventHistory } from "../../../db/schema/app/app-event-history.ts";
import { and, eq, desc, sql } from "drizzle-orm";
import { EnumContentType, EnumEventStatus } from "../../../db/schema/enum/enum-app.ts";
import config from "../../../config/env.config.ts";
import type { ServiceResponse } from "../../../types/index.ts";

export interface UpdateDownloadResult extends ServiceResponse {
  data?: { downloadCount: number };
}

export async function updateDownloadService(
  id: string | undefined,
  bookId: number | undefined,
  userId: string | undefined,
  sessionId: string | null,
  ip: string | undefined,
  userAgent: string | undefined,
): Promise<UpdateDownloadResult> {
  let referenceId = id;

  if (!referenceId && bookId) {
    const book = await db.query.books.findFirst({ where: eq(books.bookId, bookId) });
    if (book) referenceId = book.id;
  }

  if (!referenceId) {
    return { success: false, statusCode: 404, errorKey: ($) => $.book.detail.notFound };
  }

  const trackCondition = userId
    ? eq(appEventHistory.userId, userId)
    : sessionId
      ? eq(appEventHistory.sessionId, sessionId)
      : eq(appEventHistory.ipAddress, ip ?? null as any);

  const lastEvent = await db.query.userEventHistory.findFirst({
    where: and(
      eq(appEventHistory.referenceId, referenceId),
      eq(appEventHistory.action, EnumEventStatus.DOWNLOAD),
      trackCondition,
    ),
    orderBy: desc(appEventHistory.createdAt),
  });

  const now = new Date();
  if (!lastEvent || now.getTime() - lastEvent.createdAt.getTime() > config.limits.contentCounterWindowMs) {
    await db.insert(appEventHistory).values({
      userId: userId || null,
      referenceId,
      contentType: EnumContentType.BOOK,
      action: EnumEventStatus.DOWNLOAD,
      sessionId: sessionId || null,
      ipAddress: ip || null,
      userAgent,
    });

    await db
      .insert(bookEventStats)
      .values({ bookId: referenceId, downloadCount: 1 })
      .onConflictDoUpdate({
        target: bookEventStats.bookId,
        set: { downloadCount: sql`${bookEventStats.downloadCount} + 1`, updatedAt: new Date() },
      });

    if (userId) {
      await db
        .insert(bookInteractions)
        .values({
          userId,
          bookId: referenceId,
          downloadCount: 1,
          liked: false,
          disliked: false,
          bookmarked: false,
          rating: "0.00",
          viewCount: 0,
        })
        .onConflictDoUpdate({
          target: [bookInteractions.userId, bookInteractions.bookId],
          set: { downloadCount: sql`${bookInteractions.downloadCount} + 1`, updatedAt: new Date() },
        });
    }
  }

  const stats = await db.query.bookEventStats.findFirst({ where: eq(bookEventStats.bookId, referenceId) });

  return { success: true, data: { downloadCount: stats?.downloadCount || 0 } };
}
