import type { FastifyPluginAsyncTypebox } from "@fastify/type-provider-typebox";
import { Type } from '@fastify/type-provider-typebox';
import { withErrorHandler } from "../../utils/withErrorHandler.ts";
import { db } from "../../db/db-pool.ts";
import { verifications } from "../../db/schema/user/index.ts";
import { eq } from "drizzle-orm";

/**
 * Check password reset token
 * 
 * Expected JSON body input parameters:
 * - token: string - Password reset token to validate
 * 
 * @param {string} token - Required. Password reset token to validate
 */
const publicRoute: FastifyPluginAsyncTypebox = async (app) => {
    app.route({
        url: '/check-token-reset',
        method: 'POST',
        schema: {
            tags: ['Auth'],
            summary: 'Check password reset token',
            description: 'Verify if a password reset token is valid and not expired. Expected JSON body fields: token',
            consumes: ['application/json'],
            body: Type.Object({
                token: Type.String()
            }),
            response: {
                200: Type.Object({
                    success: Type.Boolean({ default: true }),
                    message: Type.String(),
                    data: Type.Object({
                        valid: Type.Boolean()
                    })
                }),
                // Updated to use proper HTTP status codes with Fastify Sensible
                '4xx': Type.Object({
                    success: Type.Boolean({ default: false }),
                    message: Type.String()
                }),
                '5xx': Type.Object({
                    success: Type.Boolean({ default: false }),
                    message: Type.String()
                })
            }
        },
        handler: withErrorHandler(async (req, reply) => {
            const { token } = req.body as { token: string };

            // Validate required fields using Fastify Sensible badRequest
            if (!token) {
                return reply.badRequest(req.i18n.t('auth.tokenRequired'));
            }

            // Check if token exists in verifications table and is not expired
            const verificationResult = await db
                .select()
                .from(verifications)
                .where(eq(verifications.identifier, `reset-password:${token}`));

            if (verificationResult.length === 0) {
                return reply.notFound(req.i18n.t('auth.invalidToken'));
            }

            const verification = verificationResult[0];

            // Check if token is expired
            const now = new Date();
            const isExpired = verification.expiresAt < now;

            if (isExpired) {
                return reply.notFound(req.i18n.t('auth.expiredToken'));
            }

            return reply.status(200).send({
                success: true,
                message: req.i18n.t('auth.validToken'),
                data: {
                    valid: true
                }
            });
        }),
    });
};

export default publicRoute;