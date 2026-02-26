export const EnumExamType = {
    OFFICIAL: 'official',
    CUSTOM_PRACTICE: 'custom_practice',
} as const;

export const EnumDifficultyLevel = {
    EASY: 'easy',
    MEDIUM: 'medium',
    HARD: 'hard',
} as const;

export const EnumQuestionType = {
    MULTIPLE_CHOICE: 'multiple_choice',
    ESSAY: 'essay',
} as const;

export const EnumSolutionType = {
    GENERAL: 'general',
    FAST_METHOD: 'fast_method',
    VIDEO_LINK: 'video_link',
    TIPS: 'tips',
} as const;

export const EnumExamSessionStatus = {
    IN_PROGRESS: 'in_progress',
    COMPLETED: 'completed',
    ABANDONED: 'abandoned',
} as const;
