import { client } from "../../utils/axios-utils.ts";

export interface AiModel {
    id: string;
    name: string;
    provider: string;
    description?: string;
    stats: {
        successRate: number;
        avgDuration: number;
        totalCalls: number;
    };
}

export interface ChatMessage {
    role: 'user' | 'assistant' | 'system';
    content: string;
}

export interface ChatResponse {
    role: 'assistant';
    content: string;
}

export const getAiModels = async () => {
    const response = await client.get<AiModel[]>("/chat-ai/models");
    return response.data;
};

export const sendChatMessage = async (modelId: string, messages: ChatMessage[]) => {
    const response = await client.post<ChatResponse>("/chat-ai/chat", {
        modelId,
        messages,
    });
    return response.data;
};
