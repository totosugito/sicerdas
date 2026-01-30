import type { FastifyPluginAsyncTypebox } from "@fastify/type-provider-typebox";
import { Type } from '@sinclair/typebox';
import { withErrorHandler } from "../../utils/withErrorHandler.ts";
import axios from "axios";
import type { FastifyReply, FastifyRequest } from "fastify";

const ProxyParams = Type.Object({
    url: Type.String({ description: 'URL of the PDF to proxy' }),
    file: Type.Optional(Type.String({ description: 'Filename for the PDF' })),
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
            req: FastifyRequest<{ Querystring: { url: string; file?: string }; Params: { filename?: string } }>,
            reply: FastifyReply
        ) {
            const { url, file } = req.query;
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
                    validateStatus: () => true, // Allow 206 and other status codes
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

                return reply.send(response.data);
            } catch (error: any) {
                return reply.internalServerError(req.i18n.t('book.proxyPdf.error', { message: error.message }));
            }
        }),
    });
};


export default proxyRoute;
