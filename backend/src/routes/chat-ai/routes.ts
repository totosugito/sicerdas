import type { FastifyPluginAsyncTypebox } from '@fastify/type-provider-typebox';
import { Type } from '@sinclair/typebox';
import { aiModels, aiApiLogs, aiChatMessages, aiChatSessions } from '../../db/schema/chat-ai-schema.ts';
import { db } from '../../db/index.ts';
import { eq } from 'drizzle-orm';
import { v4 as uuidv4 } from 'uuid';

export const AutoLoad: FastifyPluginAsyncTypebox = async (fastify) => {

    // GET /models - List available models with stats
    fastify.get('/models', {
        schema: {
            tags: ['Chat AI'],
            response: {
                200: Type.Array(Type.Object({
                    id: Type.String(),
                    name: Type.String(),
                    provider: Type.String(),
                    description: Type.Optional(Type.String()),
                    stats: Type.Object({
                        successRate: Type.Number(),
                        avgDuration: Type.Number(),
                        totalCalls: Type.Number(),
                    })
                }))
            }
        }
    }, async (request, reply) => {
        // 1. Fetch enabled models
        const models = await db.select().from(aiModels).where(eq(aiModels.isEnabled, true));

        // 2. Fetch aggregated stats from aiApiLogs
        const statsQuery = await db.select({
            modelId: aiApiLogs.modelId,
            successCount: aiApiLogs.successCount,
            failureCount: aiApiLogs.failureCount,
            totalRequests: aiApiLogs.totalRequests,
            avgDuration: aiApiLogs.avgDuration,
            totalTokens: aiApiLogs.totalTokens,
        }).from(aiApiLogs);

        // Aggregate stats per model (sum across all time periods)
        const modelStats = new Map<string, { success: number, fail: number, totalDuration: number, totalCalls: number }>();

        for (const log of statsQuery) {
            if (!log.modelId) continue;

            const current = modelStats.get(log.modelId) || { success: 0, fail: 0, totalDuration: 0, totalCalls: 0 };

            current.success += log.successCount || 0;
            current.fail += log.failureCount || 0;
            current.totalCalls += log.totalRequests || 0;
            // Weighted average: multiply avg by request count, then divide by total
            current.totalDuration += (log.avgDuration || 0) * (log.totalRequests || 0);

            modelStats.set(log.modelId, current);
        }

        const result = models.map(model => {
            const stats = modelStats.get(model.id) || { success: 0, fail: 0, totalDuration: 0, totalCalls: 0 };
            const totalCalls = stats.totalCalls;
            const successRate = totalCalls > 0 ? (stats.success / totalCalls) * 100 : 0;
            const avgDuration = totalCalls > 0 ? stats.totalDuration / totalCalls : 0;

            return {
                id: model.id,
                name: model.name,
                provider: model.provider,
                description: model.description || undefined,
                stats: {
                    successRate: Number(successRate.toFixed(2)),
                    avgDuration: Number(avgDuration.toFixed(2)), // in ms
                    totalCalls
                }
            };
        });

        return result;
    });

    // POST /chat - Chat completion
    fastify.post('/chat', {
        schema: {
            tags: ['Chat AI'],
            body: Type.Object({
                sessionId: Type.String({ format: 'uuid' }), // Frontend must provide sessionId
                modelId: Type.String(),
                messages: Type.Array(Type.Object({
                    role: Type.Union([Type.Literal('user'), Type.Literal('assistant'), Type.Literal('system')]),
                    content: Type.String()
                }))
            }),
            response: {
                200: Type.Object({
                    role: Type.Literal('assistant'),
                    content: Type.String()
                })
            }
        }
    }, async (request, reply) => {
        const { sessionId, modelId, messages } = request.body;

        const requestStartedAt = new Date();

        try {
            // 1. Verify session exists
            const session = await db.query.aiChatSessions.findFirst({
                where: eq(aiChatSessions.id, sessionId)
            });

            if (!session) {
                return reply.notFound('Session not found');
            }

            // 2. Get model
            const model = await db.query.aiModels.findFirst({
                where: eq(aiModels.id, modelId)
            });

            if (!model) {
                return reply.notFound('Model not found');
            }

            // 3. Call AI API (mocked for now)
            await new Promise(resolve => setTimeout(resolve, 500 + Math.random() * 1000));

            const responseContent = `This is a simulated response from ${model.name}. You said: "${messages[messages.length - 1].content}"`;
            const responseReceivedAt = new Date();

            // 4. Save user message (last message in array)
            const userMessage = messages[messages.length - 1];
            await db.insert(aiChatMessages).values({
                sessionId: sessionId,
                role: userMessage.role,
                content: userMessage.content,
                position: messages.length - 1,
                modelId: model.id,
                requestStartedAt: requestStartedAt,
                responseReceivedAt: responseReceivedAt,
                isSuccess: true,
                tokens: userMessage.content.length / 4, // Rough estimate
            });

            // 5. Save assistant response
            await db.insert(aiChatMessages).values({
                sessionId: sessionId,
                role: 'assistant',
                content: responseContent,
                position: messages.length,
                modelId: model.id,
                requestStartedAt: requestStartedAt,
                responseReceivedAt: responseReceivedAt,
                isSuccess: true,
                tokens: responseContent.length / 4,
            });

            return {
                role: 'assistant' as const,
                content: responseContent
            };

        } catch (error: any) {
            const responseReceivedAt = new Date();

            // Save failed message
            try {
                await db.insert(aiChatMessages).values({
                    sessionId: sessionId,
                    role: 'assistant',
                    content: `Error: ${error.message}`,
                    position: messages.length,
                    modelId: modelId,
                    requestStartedAt: requestStartedAt,
                    responseReceivedAt: responseReceivedAt,
                    isSuccess: false,
                });
            } catch (dbError) {
                // If we can't save the error, just log it
                console.error('Failed to save error message:', dbError);
            }

            throw error;
        }
    });
    // GET /stats - Aggregate stats (optional, if separate endpoint needed)
    fastify.get('/stats', {
        schema: {
            tags: ['Chat AI'],
            response: {
                200: Type.Array(Type.Object({
                    modelId: Type.String(),
                    successRate: Type.Number(),
                    avgDuration: Type.Number()
                }))
            }
        }
    }, async (request, reply) => {
        // Reuse logic from GET /models or perform aggregate query
        return [];
    });
};
