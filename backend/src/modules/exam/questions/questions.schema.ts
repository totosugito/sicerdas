import { Type, type Static } from "@sinclair/typebox";
import { BaseResponseSchema, PaginationMetaSchema } from "../../../types/response.ts";
import {
  EnumDifficultyLevel,
  EnumQuestionType,
  EnumScoringStrategy,
  EnumSolutionType,
} from "../../../db/schema/exam/enums.ts";

// --- Shared Field Definitions ---

const VariableFormulasType = Type.Object({
  variables: Type.Array(Type.Record(Type.String(), Type.Union([Type.String(), Type.Number()]))),
  solutions: Type.Optional(Type.Record(Type.String(), Type.String())),
});

const QuestionBaseFields = {
  id: Type.String({ format: "uuid" }),
  subjectId: Type.String({ format: "uuid" }),
  passageId: Type.Union([Type.String({ format: "uuid" }), Type.Null()]),
  content: Type.Array(Type.Record(Type.String(), Type.Unknown())),
  difficulty: Type.Enum(EnumDifficultyLevel),
  type: Type.Enum(EnumQuestionType),
  maxScore: Type.Integer(),
  scoringStrategy: Type.Enum(EnumScoringStrategy),
  requiredTier: Type.Union([Type.String(), Type.Null()]),
  educationGradeId: Type.Union([Type.Number(), Type.Null()]),
  isActive: Type.Boolean(),
  variableFormulas: Type.Union([VariableFormulasType, Type.Null()]),
  createdAt: Type.String({ format: "date-time" }),
  updatedAt: Type.String({ format: "date-time" }),
};

const QuestionBodyFields = {
  subjectId: Type.String({ format: "uuid" }),
  passageId: Type.Optional(Type.Union([Type.String({ format: "uuid" }), Type.Null()])),
  content: Type.Optional(Type.Array(Type.Record(Type.String(), Type.Unknown()))),
  reasonContent: Type.Optional(Type.Array(Type.Record(Type.String(), Type.Unknown()))),
  difficulty: Type.Optional(Type.Enum(EnumDifficultyLevel)),
  type: Type.Optional(Type.Enum(EnumQuestionType)),
  scoringStrategy: Type.Optional(Type.Enum(EnumScoringStrategy)),
  requiredTier: Type.Optional(Type.String()),
  educationGradeId: Type.Optional(Type.Union([Type.Number(), Type.Null()])),
  isActive: Type.Optional(Type.Boolean()),
  variableFormulas: Type.Optional(Type.Union([VariableFormulasType, Type.Null()])),
};

const FilterFields = {
  search: Type.Optional(Type.String()),
  subjectId: Type.Optional(Type.String({ format: "uuid" })),
  difficulty: Type.Optional(Type.Enum(EnumDifficultyLevel)),
  type: Type.Optional(Type.Enum(EnumQuestionType)),
  requiredTier: Type.Optional(Type.String()),
  educationGradeId: Type.Optional(Type.Number()),
  isActive: Type.Optional(Type.Boolean()),
  sortBy: Type.Optional(Type.String({ default: "updatedAt" })),
  sortOrder: Type.Optional(Type.String({ default: "desc" })),
  page: Type.Optional(Type.Number({ default: 1, minimum: 1 })),
  limit: Type.Optional(Type.Number({ default: 10, minimum: 1, maximum: 50 })),
};

const TagItem = Type.Object({
  id: Type.String({ format: "uuid" }),
  name: Type.String(),
});

const OptionItem = Type.Object({
  id: Type.String({ format: "uuid" }),
  content: Type.Array(Type.Record(Type.String(), Type.Unknown())),
  isCorrect: Type.Boolean(),
  score: Type.Integer(),
  order: Type.Number(),
});

const SolutionItem = Type.Object({
  id: Type.String({ format: "uuid" }),
  title: Type.String(),
  content: Type.Array(Type.Record(Type.String(), Type.Unknown())),
  solutionType: Type.Enum(EnumSolutionType),
  order: Type.Number(),
  requiredTier: Type.Union([Type.String(), Type.Null()]),
});

const PassageItem = Type.Object({
  title: Type.Union([Type.String(), Type.Null()]),
  content: Type.Array(Type.Record(Type.String(), Type.Unknown())),
});

// --- Response Data Items ---

export const QuestionResponseItem = Type.Object({
  ...QuestionBaseFields,
  subjectName: Type.Optional(Type.String()),
  reasonContent: Type.Optional(Type.Array(Type.Record(Type.String(), Type.Unknown()))),
});

export const SimpleQuestionResponseItem = Type.Object({
  id: QuestionBaseFields.id,
  subjectId: QuestionBaseFields.subjectId,
  subjectName: Type.Optional(Type.String()),
  content: QuestionBaseFields.content,
  difficulty: QuestionBaseFields.difficulty,
  type: QuestionBaseFields.type,
  requiredTier: QuestionBaseFields.requiredTier,
  educationGradeId: QuestionBaseFields.educationGradeId,
  createdAt: QuestionBaseFields.createdAt,
  updatedAt: QuestionBaseFields.updatedAt,
});

export const QuestionListItem = Type.Object({
  ...QuestionBaseFields,
  subjectName: Type.Optional(Type.String()),
  educationGradeName: Type.Optional(Type.String()),
  totalOptions: Type.Number(),
  tags: Type.Array(TagItem),
});

export const QuestionDetailData = Type.Object({
  ...QuestionBaseFields,
  subjectName: Type.String(),
  educationGradeName: Type.Optional(Type.Union([Type.String(), Type.Null()])),
  reasonContent: Type.Array(Type.Record(Type.String(), Type.Unknown())),
  options: Type.Array(OptionItem),
  solutions: Type.Array(SolutionItem),
  tags: Type.Array(TagItem),
  passage: Type.Union([PassageItem, Type.Null()]),
});

// --- Request Bodies ---

export const QuestionListBody = Type.Object({
  ...FilterFields,
  scoringStrategy: Type.Optional(Type.Enum(EnumScoringStrategy)),
});

export const QuestionListSimpleBody = Type.Object({
  ...FilterFields,
  excludePackageId: Type.Optional(Type.String({ format: "uuid" })),
});

export const CreateQuestionBody = Type.Object(QuestionBodyFields);

export const UpdateQuestionBody = Type.Partial(
  Type.Object({
    ...QuestionBodyFields,
    subjectId: Type.String({ format: "uuid" }),
    passageId: Type.Union([Type.String({ format: "uuid" }), Type.Null(), Type.String()]),
    content: Type.Array(Type.Record(Type.String(), Type.Unknown())),
    reasonContent: Type.Array(Type.Record(Type.String(), Type.Unknown())),
    difficulty: Type.Enum(EnumDifficultyLevel),
    type: Type.Enum(EnumQuestionType),
    scoringStrategy: Type.Enum(EnumScoringStrategy),
    requiredTier: Type.String(),
    educationGradeId: Type.Union([Type.Number(), Type.Null()]),
    isActive: Type.Boolean(),
    variableFormulas: Type.Union([VariableFormulasType, Type.Null()]),
  }),
);

export const QuestionParams = Type.Object({
  id: Type.String({ format: "uuid" }),
});

// --- Response Schemas ---

export const CreateQuestionResponse = Type.Intersect([
  BaseResponseSchema,
  Type.Object({ data: QuestionResponseItem }),
]);

export const ListQuestionsResponse = Type.Intersect([
  BaseResponseSchema,
  Type.Object({
    data: Type.Object({
      items: Type.Array(QuestionListItem),
      meta: PaginationMetaSchema,
    }),
  }),
]);

export const ListSimpleQuestionsResponse = Type.Intersect([
  BaseResponseSchema,
  Type.Object({
    data: Type.Object({
      items: Type.Array(SimpleQuestionResponseItem),
      meta: PaginationMetaSchema,
    }),
  }),
]);

export const GetQuestionResponse = Type.Intersect([
  BaseResponseSchema,
  Type.Object({ data: QuestionDetailData }),
]);

export const UpdateQuestionResponse = Type.Intersect([
  BaseResponseSchema,
  Type.Object({ data: QuestionResponseItem }),
]);

// --- Static Types ---

export type QuestionResponseItemT = Static<typeof QuestionResponseItem>;
export type SimpleQuestionResponseItemT = Static<typeof SimpleQuestionResponseItem>;
export type QuestionListItemT = Static<typeof QuestionListItem>;
export type QuestionDetailDataT = Static<typeof QuestionDetailData>;

export type QuestionListParams = Static<typeof QuestionListBody>;
export type QuestionListSimpleParams = Static<typeof QuestionListSimpleBody>;
export type CreateQuestionParams = Static<typeof CreateQuestionBody>;
export type UpdateQuestionParams = Static<typeof UpdateQuestionBody>;
