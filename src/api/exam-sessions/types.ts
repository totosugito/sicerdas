export interface ExamSession {
    id: string;
    startTime: string;
    status: string;
    package: {
        title: string;
        durationMinutes: number;
    };
}

export interface ExamSessionAnswer {
    questionId: string;
    questionOrder: number;
    variationIndex: number;
    isDoubtful: boolean;
    selectedOptionId: string | null;
    textAnswer?: Record<string, unknown>[] | null;
    question: {
        content: Record<string, unknown>[];
        type: string;
        options: {
            id: string;
            content: Record<string, unknown>[];
        }[];
    };
}

export interface StartSessionResponse {
    success: boolean;
    message: string;
    data: {
        sessionId: string;
    };
}

export interface SessionDetailsResponse {
    success: boolean;
    message: string;
    data: {
        session: ExamSession;
        answers: ExamSessionAnswer[];
    };
}

export interface SaveAnswerRequest {
    sessionId: string;
    questionId: string;
    selectedOptionId?: string | null;
    textAnswer?: Record<string, unknown>[] | null;
    isDoubtful?: boolean;
}

export interface CommonResponse {
    success: boolean;
    message: string;
}
