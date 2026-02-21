import type { FastifyPluginAsyncTypebox } from "@fastify/type-provider-typebox";
import { Type } from '@sinclair/typebox';
import { withErrorHandler } from "../../utils/withErrorHandler.ts";
import { db } from "../../db/db-pool.ts";
import { books, bookEventStats, bookInteractions } from "../../db/schema/book/index.ts";
import { and, eq, sql } from "drizzle-orm";
import type { FastifyReply, FastifyRequest } from "fastify";
import { fromNodeHeaders } from 'better-auth/node';
import { getAuthInstance } from "../../decorators/auth.decorator.ts";

const UpdateBookmarkRequest = Type.Object({
    bookId: Type.Number(),
    bookmarked: Type.Boolean(),
});

const UpdateBookmarkResponse = Type.Object({
    success: Type.Boolean(),
    message: Type.String(),
    data: Type.Object({
        bookmarked: Type.Boolean(),
        bookmarkCount: Type.Number(),
    }),
});

const protectedRoute: FastifyPluginAsyncTypebox = async (app) => {
    app.route({
        url: '/bookmark',
        method: 'POST',
        schema: {
            tags: ['V1/Book'],
            summary: 'Update book bookmark status',
            description: 'Set or unset a bookmark for a specific book',
            body: UpdateBookmarkRequest,
            response: {
                200: UpdateBookmarkResponse,
                '4xx': Type.Object({
                    success: Type.Boolean({ default: false }),
                    message: Type.String()
                }),
                '5xx': Type.Object({
                    success: Type.Boolean({ default: false }),
                    message: Type.String()
                }),
            },
        },
        handler: withErrorHandler(async function handler(
            req: FastifyRequest<{ Body: typeof UpdateBookmarkRequest.static }>,
            reply: FastifyReply
        ): Promise<typeof UpdateBookmarkResponse.static> {
            // Attempt to retrieve user ID (matching create-report.ts pattern)
            // Attempt to retrieve user ID (matching create-report.ts pattern)
            const session = await getAuthInstance(app).api.getSession({
                headers: fromNodeHeaders(req.headers),
            });
            const user = session?.user;

            // Check if user is logged in
            if (!user) {
                return reply.unauthorized(req.i18n.t('auth.unauthorized'));
            }

            const userId = user.id;
            const { bookId, bookmarked } = req.body;

            // Find the book UUID based on the integer bookId
            const bookList = await db
                .select({ id: books.id })
                .from(books)
                .where(eq(books.bookId, bookId))
                .limit(1);

            if (bookList.length === 0) {
                return reply.notFound(req.i18n.t('book.detail.notFound'));
            }

            const bookUUID = bookList[0].id;

            // Check existing interaction to determine if stats update is needed
            const existingInteraction = await db.query.bookInteractions.findFirst({
                where: and(
                    eq(bookInteractions.userId, userId),
                    eq(bookInteractions.bookId, bookUUID)
                )
            });

            const currentlyBookmarked = existingInteraction?.bookmarked ?? false;

            // If status hasn't changed, return current state
            if (currentlyBookmarked === bookmarked) {
                const currentStats = await db.query.bookEventStats.findFirst({
                    where: eq(bookEventStats.bookId, bookUUID),
                    columns: { bookmarkCount: true }
                });

                return reply.status(200).send({
                    success: true,
                    message: req.i18n.t('book.bookmark.noChange'),
                    data: {
                        bookmarked: currentlyBookmarked,
                        bookmarkCount: currentStats?.bookmarkCount ?? 0
                    }
                });
            }

            // Upsert User Interaction
            await db.insert(bookInteractions)
                .values({
                    userId,
                    bookId: bookUUID,
                    bookmarked: bookmarked,
                    // Default values for other fields if creating new record
                    liked: false,
                    disliked: false,
                    rating: '0.00',
                    viewCount: 0,
                    downloadCount: 0
                })
                .onConflictDoUpdate({
                    target: [bookInteractions.userId, bookInteractions.bookId],
                    set: {
                        bookmarked: bookmarked,
                        updatedAt: new Date()
                    }
                });

            // Update Global Stats (increment or decrement)
            const incrementValue = bookmarked ? 1 : -1;

            await db.insert(bookEventStats)
                .values({
                    bookId: bookUUID,
                    bookmarkCount: bookmarked ? 1 : 0
                })
                .onConflictDoUpdate({
                    target: bookEventStats.bookId,
                    set: {
                        bookmarkCount: sql`${bookEventStats.bookmarkCount} + ${incrementValue}`,
                        updatedAt: new Date()
                    }
                });

            // Fetch final stats
            const finalStats = await db.query.bookEventStats.findFirst({
                where: eq(bookEventStats.bookId, bookUUID),
                columns: { bookmarkCount: true }
            });

            return reply.status(200).send({
                success: true,
                message: req.i18n.t('book.bookmark.updated'),
                data: {
                    bookmarked,
                    bookmarkCount: finalStats?.bookmarkCount ?? 0
                }
            });
        }),
    });
};

export default protectedRoute;
