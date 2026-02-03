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

        // 2. Fetch stats for each model
        // This could be optimized with a join, but for simplicity/clarity doing separate aggregation or per-model
        // A better approach is to aggregate all logs by modelId

        const statsQuery = await db.select({
            modelId: aiApiLogs.modelId,
            status: aiApiLogs.status,
            duration: aiApiLogs.duration,
        }).from(aiApiLogs);

        // Process stats in memory (simplified for now, ideally DB aggregation)
        const modelStats = new Map<string, { success: number, fail: number, totalDuration: number, totalSuccessDuration: number }>();

        for (const log of statsQuery) {
            if (!log.modelId) continue;

            const current = modelStats.get(log.modelId) || { success: 0, fail: 0, totalDuration: 0, totalSuccessDuration: 0 };

            if (log.status === 'success') {
                current.success++;
                current.totalSuccessDuration += log.duration;
            } else {
                current.fail++;
            }
            current.totalDuration += log.duration; // Total duration of all calls? Or just avg of success? usually avg response time

            modelStats.set(log.modelId, current);
        }

        const result = models.map(model => {
            const stats = modelStats.get(model.id) || { success: 0, fail: 0, totalDuration: 0, totalSuccessDuration: 0 };
            const totalCalls = stats.success + stats.fail;
            const successRate = totalCalls > 0 ? (stats.success / totalCalls) * 100 : 0;
            const avgDuration = stats.success > 0 ? stats.totalSuccessDuration / stats.success : 0;

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
        const { modelId, messages } = request.body;

        const startTime = Date.now();
        let duration = 0;

        try {
            // 1. Get model to find provider and api key
            const model = await db.query.aiModels.findFirst({
                where: eq(aiModels.id, modelId)
            });

            if (!model) {
                throw new Error('Model not found');
            }

            // 2. Mock AI call (since we don't have real providers setup yet)
            // In real implementation, switch(model.provider) ...

            await new Promise(resolve => setTimeout(resolve, 500 + Math.random() * 1000)); // Simulate delay

            const responseContent = `This is a simulated response from ${model.name}. You said: "${messages[messages.length - 1].content}"`;

            status = 'success';
            duration = Date.now() - startTime;


            // 3. Log statistics & Save Message
            await db.insert(aiApiLogs).values({
                modelId: model.id,
                provider: model.provider,
                status: 'success',
                duration: duration,
                tokens: responseContent.length / 4,
            });

            // Ideally we should create/get a session first, but simplifying for this task if no sessionId provided
            // Assuming a session exists or we create a temporary one? 
            // The user request didn't specify session management fully, but we need sessionId for aiChatMessages
            // For now, let's just log to aiApiLogs as requested originally, 
            // BUT user asked for 'aiChatMessages' info too.
            // So we must have a session.

            // Let's create a dummy session if one doesn't exist just to satisfy the constraint for this demo
            // In a real app, sessionId would be passed in headers or body

            // For the purpose of "fullstack chat app like chat gpt", we usually have a session.
            // I will create a new session for each request for simplicity unless we want to managing state.
            // But wait, the schema requires sessionId.

            // Let's add a quick fix to create a session if needed or just skip aiChatMessages if no session provided 
            // (though user explicitly asked for aiChatMessages status).

            // BETTER: Create a session for this chat interaction if not managing history in FE yet.
            // Or simply:

            // Generate a new session ID for this interaction for simplicity
            const sessionId = uuidv4();
            await db.insert(aiChatSessions).values({
                id: sessionId,
                title: `Chat with ${model.name} - ${new Date().toLocaleString()}`,
                userId: 'anonymous' // Placeholder for now
            });

            // Insert user message
            await db.insert(aiChatMessages).values({
                sessionId: sessionId,
                role: messages[messages.length - 1].role,
                content: messages[messages.length - 1].content,
                position: messages.length - 1, // Assuming last message is the user's current input
                modelId: model.id,
                isSuccess: true
            });

            // Insert assistant response
            await db.insert(aiChatMessages).values({
                sessionId: sessionId,
                role: 'assistant',
                content: responseContent,
                position: messages.length, // Position after the user's last message
                modelId: model.id,
                isSuccess: true
            });


            return {
                role: 'assistant' as const,
                content: responseContent
            };

        } catch (error: any) {
            duration = Date.now() - startTime;
            const errorMessage = error.message;

            // Log failure
            await db.insert(aiApiLogs).values({
                modelId: modelId,
                provider: 'unknown', // or fetch from model if available
                status: 'failed',
                duration: duration,
                errorMessage: errorMessage
            });

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
