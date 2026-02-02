import type { FastifyPluginAsyncTypebox } from "@fastify/type-provider-typebox";
import { Type } from '@sinclair/typebox';
import { withErrorHandler } from "../../utils/withErrorHandler.ts";
import { db } from "../../db/index.ts";
import { books, bookEventStats, userBookInteractions } from "../../db/schema/book-schema.ts";
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
                401: Type.Object({ success: Type.Boolean(), message: Type.String() }),
                404: Type.Object({ success: Type.Boolean(), message: Type.String() }),
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
                return reply.status(401).send({
                    success: false,
                    message: req.i18n.t('auth.unauthorized')
                });
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
                return reply.status(404).send({
                    success: false,
                    message: req.i18n.t('book.detail.notFound')
                });
            }

            const bookUUID = bookList[0].id;

            // Check existing interaction to determine if stats update is needed
            const existingInteraction = await db.query.userBookInteractions.findFirst({
                where: and(
                    eq(userBookInteractions.userId, userId),
                    eq(userBookInteractions.bookId, bookUUID)
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
            await db.insert(userBookInteractions)
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
                    target: [userBookInteractions.userId, userBookInteractions.bookId],
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
