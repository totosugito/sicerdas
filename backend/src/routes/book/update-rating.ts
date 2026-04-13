import type { FastifyPluginAsyncTypebox } from "@fastify/type-provider-typebox";
import { Type } from "@sinclair/typebox";
import { withErrorHandler } from "../../utils/withErrorHandler.ts";
import { db } from "../../db/db-pool.ts";
import { books, bookEventStats, bookInteractions } from "../../db/schema/book/index.ts";
import { and, eq, sql } from "drizzle-orm";
import type { FastifyReply, FastifyRequest } from "fastify";
import { fromNodeHeaders } from "better-auth/node";
import { getAuthInstance } from "../../decorators/auth.decorator.ts";
import { getTypedI18n } from "../../utils/i18n-typed.ts";

const UpdateRatingRequest = Type.Object({
  bookId: Type.Number(),
  rating: Type.Number({ minimum: 1, maximum: 5 }),
});

const UpdateRatingResponse = Type.Object({
  success: Type.Boolean(),
  message: Type.String(),
  data: Type.Object({
    rating: Type.Number(), // mapped to avgRating
    ratingCount: Type.Number(),
    userInteraction: Type.Object({
      rating: Type.Number(), // user's choice
    }),
  }),
});

const protectedRoute: FastifyPluginAsyncTypebox = async (app) => {
  app.route({
    url: "/rating",
    method: "POST",
    schema: {
      tags: ["V1/Book"],
      summary: "Update book rating",
      description: "Set a rating for a specific book",
      body: UpdateRatingRequest,
      response: {
        200: UpdateRatingResponse,
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
    handler: withErrorHandler(async function handler(
      req: FastifyRequest<{ Body: typeof UpdateRatingRequest.static }>,
      reply: FastifyReply,
    ): Promise<typeof UpdateRatingResponse.static> {
      const { t } = getTypedI18n(req);
      const session = await getAuthInstance(app).api.getSession({
        headers: fromNodeHeaders(req.headers),
      });
      const user = session?.user;

      if (!user) {
        return reply.unauthorized(t(($) => $.auth.unauthorized));
      }

      const userId = user.id;
      const { bookId, rating } = req.body;

      // Find the book UUID based on the integer bookId
      const bookList = await db
        .select({ id: books.id })
        .from(books)
        .where(eq(books.bookId, bookId))
        .limit(1);

      if (bookList.length === 0) {
        return reply.notFound(t(($) => $.book.detail.notFound));
      }

      const bookUUID = bookList[0].id;

      // Check existing interaction to determine if stats update is needed
      const existingInteraction = await db.query.bookInteractions.findFirst({
        where: and(eq(bookInteractions.userId, userId), eq(bookInteractions.bookId, bookUUID)),
      });

      const oldRating = existingInteraction?.rating
        ? parseFloat(existingInteraction.rating.toString())
        : 0;

      // If rating hasn't changed, return current state
      if (oldRating === rating) {
        const currentStats = await db.query.bookEventStats.findFirst({
          where: eq(bookEventStats.bookId, bookUUID),
          columns: { rating: true, ratingCount: true },
        });

        return reply.status(200).send({
          success: true,
          message: t(($) => $.book.detail.success),
          data: {
            rating: currentStats?.rating ? parseFloat(currentStats.rating.toString()) : 0,
            ratingCount: currentStats?.ratingCount ?? 0,
            userInteraction: {
              rating: oldRating,
            },
          },
        });
      }

      // Upsert User Interaction
      await db
        .insert(bookInteractions)
        .values({
          userId,
          bookId: bookUUID,
          rating: rating.toFixed(2),
          liked: false,
          disliked: false,
          bookmarked: false,
          viewCount: 0,
          downloadCount: 0,
        })
        .onConflictDoUpdate({
          target: [bookInteractions.userId, bookInteractions.bookId],
          set: {
            rating: rating.toFixed(2),
            updatedAt: new Date(),
          },
        });

      // Update Global Stats
      // Adjust ratingSum and ratingCount
      const isFirstTime = oldRating === 0;
      const ratingDiff = rating - oldRating;

      // Step 1: Update or insert core counts/sums
      await db
        .insert(bookEventStats)
        .values({
          bookId: bookUUID,
          ratingSum: rating.toFixed(2),
          ratingCount: 1,
          rating: rating.toFixed(2),
        })
        .onConflictDoUpdate({
          target: bookEventStats.bookId,
          set: {
            ratingSum: sql`${bookEventStats.ratingSum} + ${ratingDiff}`,
            ratingCount: isFirstTime
              ? sql`${bookEventStats.ratingCount} + 1`
              : sql`${bookEventStats.ratingCount}`,
            updatedAt: new Date(),
          },
        });

      // Step 2: Recalculate average rating (average = Sum / Count)
      await db
        .update(bookEventStats)
        .set({
          rating: sql`CASE WHEN ${bookEventStats.ratingCount} > 0 THEN ${bookEventStats.ratingSum} / ${bookEventStats.ratingCount} ELSE 0 END`,
        })
        .where(eq(bookEventStats.bookId, bookUUID));

      // Fetch final stats
      const finalStats = await db.query.bookEventStats.findFirst({
        where: eq(bookEventStats.bookId, bookUUID),
        columns: { rating: true, ratingCount: true },
      });

      return reply.status(200).send({
        success: true,
        message: t(($) => $.book.detail.success),
        data: {
          rating: finalStats?.rating ? parseFloat(finalStats.rating.toString()) : 0,
          ratingCount: finalStats?.ratingCount ?? 0,
          userInteraction: {
            rating,
          },
        },
      });
    }),
  });
};

export default protectedRoute;
