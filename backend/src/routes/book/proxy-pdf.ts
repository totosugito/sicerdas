import type { FastifyPluginAsyncTypebox } from "@fastify/type-provider-typebox";
import { Type } from '@sinclair/typebox';
import { withErrorHandler } from "../../utils/withErrorHandler.ts";
import axios from "axios";
import type { FastifyReply, FastifyRequest } from "fastify";
import { db } from "../../db/index.ts";
import { userEventHistory } from "../../db/schema/user-history-schema.ts";
import { books, bookEventStats, userBookInteractions } from "../../db/schema/book-schema.ts";
import { EnumContentType, EnumEventStatus } from "../../db/schema/enum-app.ts";
import { CONFIG } from "../../config/app-constant.ts";
import { and, eq, desc, sql } from "drizzle-orm";

const ProxyParams = Type.Object({
    url: Type.String({ description: 'URL of the PDF to proxy' }),
    file: Type.Optional(Type.String({ description: 'Filename for the PDF' })),
    id: Type.Optional(Type.String({ format: 'uuid', description: 'Reference ID (UUID) for history' })),
    bookId: Type.Optional(Type.Number({ description: 'Book ID (numeric) for history' })),
});

const ProxyPathParams = Type.Object({
    filename: Type.Optional(Type.String()),
});

const proxyRoute: FastifyPluginAsyncTypebox = async (app) => {
    app.route({
        url: '/proxy-pdf/:filename?',
        method: 'GET',
        schema: {
            tags: ['V1/Book'],
            summary: 'Proxy PDF content to bypass CORS',
            querystring: ProxyParams,
            params: ProxyPathParams,
            response: {
                200: Type.Any(),
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
            req: FastifyRequest<{ Querystring: { url: string; file?: string; id?: string, bookId?: number }; Params: { filename?: string } }>,
            reply: FastifyReply
        ) {
            const { url, file, id, bookId } = req.query;
            const { filename } = req.params;

            try {
                // Forward Range header if present
                const headers: Record<string, string> = {
                    'User-Agent': req.headers['user-agent'] || 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
                };

                if (req.headers.range) {
                    headers['Range'] = req.headers.range;
                }

                const response = await axios.get(url, {
                    responseType: 'stream',
                    headers,
                    validateStatus: () => true,
                });

                if (response.status >= 400) {
                    const message = req.i18n.t('book.proxyPdf.error', { message: `S3 returned ${response.status}` });
                    if (response.status === 403) return reply.forbidden(message);
                    if (response.status === 404) return reply.notFound(message);
                    return reply.badGateway(message);
                }

                const contentType = response.headers['content-type'] || 'application/pdf';
                const contentLength = response.headers['content-length'];
                const contentRange = response.headers['content-range'];
                const acceptRanges = response.headers['accept-ranges'];
                const fileName = filename || file || 'document.pdf';

                reply
                    .status(response.status)
                    .header('Content-Type', contentType)
                    .header('Content-Disposition', `inline; filename="${fileName}"`)
                    .header('Access-Control-Allow-Origin', '*');

                if (contentLength) reply.header('Content-Length', contentLength);
                if (contentRange) reply.header('Content-Range', contentRange);
                if (acceptRanges) reply.header('Accept-Ranges', acceptRanges);

                // History Tracking Logic
                let referenceId = id;
                if (!referenceId && bookId) {
                    const book = await db.query.books.findFirst({
                        where: eq(books.bookId, bookId)
                    });
                    if (book) referenceId = book.id;
                }

                if (referenceId) {
                    const userId = (req as any).session?.user?.id;
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
                }

                return reply.send(response.data);
            } catch (error: any) {
                return reply.internalServerError(req.i18n.t('book.proxyPdf.error', { message: error.message }));
            }
        }),
    });
};


export default proxyRoute;
