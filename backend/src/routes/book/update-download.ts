import type { FastifyPluginAsyncTypebox } from "@fastify/type-provider-typebox";
import { Type } from '@sinclair/typebox';
import { withErrorHandler } from "../../utils/withErrorHandler.ts";
import type { FastifyReply, FastifyRequest } from "fastify";
import { db } from "../../db/index.ts";
import { userEventHistory } from "../../db/schema/user-history-schema.ts";
import { books, bookEventStats, userBookInteractions } from "../../db/schema/book-schema.ts";
import { EnumContentType, EnumEventStatus } from "../../db/schema/enum-app.ts";
import { CONFIG } from "../../config/app-constant.ts";
import { and, eq, desc, sql } from "drizzle-orm";
import { fromNodeHeaders } from 'better-auth/node';
import { getAuthInstance } from "../../decorators/auth.decorator.ts";

const UpdateDownloadParams = Type.Object({
    id: Type.Optional(Type.String({ format: 'uuid', description: 'Reference ID (UUID) for history' })),
    bookId: Type.Optional(Type.Number({ description: 'Book ID (numeric) for history' })),
});

const updateDownloadRoute: FastifyPluginAsyncTypebox = async (app) => {
    app.route({
        url: '/update-download',
        method: 'POST',
        schema: {
            tags: ['V1/Book'],
            summary: 'Update book download count',
            body: UpdateDownloadParams,
            response: {
                200: Type.Object({
                    success: Type.Boolean(),
                    message: Type.String(),
                    data: Type.Optional(Type.Object({
                        downloadCount: Type.Number()
                    }))
                }),
                '4xx': Type.Object({
                    success: Type.Boolean({ default: false }),
                    message: Type.String()
                }),
                '5xx': Type.Object({
                    success: Type.Boolean({ default: false }),
                    message: Type.String()
                })
            },
        },
        handler: withErrorHandler(async function handler(
            req: FastifyRequest<{ Body: { id?: string, bookId?: number } }>,
            reply: FastifyReply
        ) {
            const { id, bookId } = req.body;

            try {
                // History Tracking Logic
                let referenceId = id;
                // If we only have bookId (numeric), find the UUID referenceId
                if (!referenceId && bookId) {
                    const book = await db.query.books.findFirst({
                        where: eq(books.bookId, bookId)
                    });
                    if (book) referenceId = book.id;
                }

                if (!referenceId) {
                    return reply.status(400).send({ success: false, message: "Book not found" });
                }

                const session = await getAuthInstance(app).api.getSession({
                    headers: fromNodeHeaders(req.headers),
                });
                const userId = session?.user?.id;
                const sessionId = (req as any).cookies?.sessionId;
                const ipAddress = req.ip;
                const userAgent = req.headers['user-agent'];

                // Check if window since last download has passed
                const lastEvent = await db.query.userEventHistory.findFirst({
                    where: and(
                        eq(userEventHistory.referenceId, referenceId),
                        eq(userEventHistory.action, EnumEventStatus.DOWNLOAD),
                        userId ? eq(userEventHistory.userId, userId) : (sessionId ? eq(userEventHistory.sessionId, sessionId) : eq(userEventHistory.ipAddress, ipAddress))
                    ),
                    orderBy: desc(userEventHistory.createdAt)
                });

                const now = new Date();
                if (!lastEvent || (now.getTime() - lastEvent.createdAt.getTime() > CONFIG.CONTENT_COUNTER_WINDOW_MS)) {
                    await db.insert(userEventHistory).values({
                        userId: userId || null,
                        referenceId: referenceId,
                        contentType: EnumContentType.BOOK,
                        action: EnumEventStatus.DOWNLOAD,
                        sessionId: sessionId || null,
                        ipAddress,
                        userAgent
                    });

                    // Update global book stats
                    await db.insert(bookEventStats)
                        .values({
                            bookId: referenceId,
                            downloadCount: 1
                        })
                        .onConflictDoUpdate({
                            target: bookEventStats.bookId,
                            set: {
                                downloadCount: sql`${bookEventStats.downloadCount} + 1`,
                                updatedAt: new Date()
                            }
                        });


                    // Update user interaction stats if logged in
                    if (userId) {
                        await db.insert(userBookInteractions)
                            .values({
                                userId,
                                bookId: referenceId,
                                downloadCount: 1,
                                liked: false,
                                disliked: false,
                                bookmarked: false,
                                rating: '0.00',
                                viewCount: 0
                            })
                            .onConflictDoUpdate({
                                target: [userBookInteractions.userId, userBookInteractions.bookId],
                                set: {
                                    downloadCount: sql`${userBookInteractions.downloadCount} + 1`,
                                    updatedAt: new Date()
                                }
                            });
                    }
                }

                // Get updated count
                const stats = await db.query.bookEventStats.findFirst({
                    where: eq(bookEventStats.bookId, referenceId)
                });
                const currentDownloadCount = stats?.downloadCount || 0;

                return reply.send({ success: true, message: "Download count updated", data: { downloadCount: currentDownloadCount } });
            } catch (error: any) {
                return reply.internalServerError(req.i18n.t('book.proxyPdf.error', { message: error.message }));
            }
        }),
    });
};

export default updateDownloadRoute;
