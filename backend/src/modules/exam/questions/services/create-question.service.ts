import { db } from "../../../../db/db-pool.ts";
import { examQuestions } from "../../../../db/schema/exam/questions.ts";
import { examSubjects } from "../../../../db/schema/exam/subjects.ts";
import { examPassages } from "../../../../db/schema/exam/passages.ts";
import { eq } from "drizzle-orm";
import env from "../../../../config/env.config.ts";
import { EnumDifficultyLevel, EnumQuestionType, EnumScoringStrategy } from "../../../../db/schema/exam/enums.ts";
import type { UploadedFile } from "../../../../types/file.ts";
import {
  processBlockNoteFiles,
  replaceBlockNoteUrls,
  stripBlockNoteUrls,
} from "../../../../utils/blocknote/blocknote-utils.ts";
import { syncPassage } from "../../../../services/exam/index.ts";
import type { ServiceResponse } from "../../../../types/index.ts";
import type { CreateQuestionParams, QuestionResponseItemT } from "../questions.schema.ts";

export interface CreateQuestionResult extends ServiceResponse {
  data?: QuestionResponseItemT;
}

export async function createQuestionService(
  userId: string,
  body: CreateQuestionParams,
  files: UploadedFile[],
): Promise<CreateQuestionResult> {
  const {
    subjectId,
    passageId,
    content,
    difficulty,
    type,
    scoringStrategy,
    requiredTier,
    educationGradeId,
    isActive,
    variableFormulas,
    reasonContent,
  } = body;

  if (!subjectId) {
    return { success: false, statusCode: 400, errorKey: ($) => $.exam.questions.create.invalidSubject };
  }

  // 1. Verify that the subject exists
  const existingSubject = await db.query.examSubjects.findFirst({
    where: eq(examSubjects.id, subjectId),
  });

  if (!existingSubject) {
    return { success: false, statusCode: 400, errorKey: ($) => $.exam.questions.create.invalidSubject };
  }

  // 2. Verify passage exists (if provided)
  if (passageId) {
    const existingPassage = await db.query.examPassages.findFirst({
      where: eq(examPassages.id, passageId),
    });
    if (!existingPassage) {
      return { success: false, statusCode: 400, errorKey: ($) => $.exam.questions.create.invalidPassage };
    }
  }

  const [newQuestion] = await db.transaction(async (tx) => {
    const [question] = await tx
      .insert(examQuestions)
      .values({
        subjectId,
        passageId,
        content: content || [],
        reasonContent: reasonContent || [],
        difficulty: difficulty || EnumDifficultyLevel.MEDIUM,
        type: type || EnumQuestionType.MULTIPLE_CHOICE,
        scoringStrategy: scoringStrategy ?? EnumScoringStrategy.ALL_OR_NOTHING,
        requiredTier: requiredTier !== undefined ? requiredTier : "free",
        educationGradeId:
          educationGradeId === null ||
            educationGradeId === 0 ||
            (educationGradeId as any) === ""
            ? null
            : Number(educationGradeId),
        isActive: isActive !== undefined ? isActive : true,
        variableFormulas:
          variableFormulas &&
            typeof variableFormulas === "object" &&
            Object.keys(variableFormulas).length > 0
            ? {
              variables: variableFormulas.variables || [],
              solutions: variableFormulas.solutions || {},
            }
            : null,
        createdByUserId: userId,
      })
      .returning();

    // If associated with a passage, sync its counters
    if (passageId) {
      await syncPassage(passageId, tx);
    }

    return [question];
  });

  // Process uploaded files if any
  let finalContent = content ? stripBlockNoteUrls(content) : [];
  let finalReasonContent = reasonContent ? stripBlockNoteUrls(reasonContent) : [];

  if (files.length > 0) {
    const urlMap = await processBlockNoteFiles(
      env.server.uploadsQuestionDir,
      newQuestion.id,
      files,
      newQuestion.createdAt,
    );

    // Replace blob URLs with final URLs in content
    finalContent = replaceBlockNoteUrls(finalContent, urlMap);
    finalReasonContent = replaceBlockNoteUrls(finalReasonContent, urlMap);

    // Update the question with final content
    await db
      .update(examQuestions)
      .set({
        content: finalContent,
        reasonContent: finalReasonContent,
      })
      .where(eq(examQuestions.id, newQuestion.id));
  }

  return {
    success: true,
    data: {
      id: newQuestion.id,
      subjectId: newQuestion.subjectId,
      passageId: newQuestion.passageId,
      content: finalContent,
      reasonContent: finalReasonContent,
      difficulty: newQuestion.difficulty as (typeof EnumDifficultyLevel)[keyof typeof EnumDifficultyLevel],
      type: newQuestion.type as (typeof EnumQuestionType)[keyof typeof EnumQuestionType],
      maxScore: newQuestion.maxScore,
      scoringStrategy: newQuestion.scoringStrategy as (typeof EnumScoringStrategy)[keyof typeof EnumScoringStrategy],
      requiredTier: newQuestion.requiredTier,
      educationGradeId: newQuestion.educationGradeId,
      isActive: newQuestion.isActive,
      variableFormulas: newQuestion.variableFormulas as any,
      createdAt: newQuestion.createdAt.toISOString(),
      updatedAt: newQuestion.updatedAt.toISOString(),
    },
  };
}
