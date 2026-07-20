import { db } from "../../../../db/db-pool.ts";
import { examQuestions } from "../../../../db/schema/exam/questions.ts";
import { examSubjects } from "../../../../db/schema/exam/subjects.ts";
import { examPassages } from "../../../../db/schema/exam/passages.ts";
import { examPackageQuestions } from "../../../../db/schema/exam/package-questions.ts";
import { eq } from "drizzle-orm";
import env from "../../../../config/env.config.ts";
import { EnumDifficultyLevel, EnumQuestionType, EnumScoringStrategy } from "../../../../db/schema/exam/enums.ts";
import type { UploadedFile } from "../../../../types/file.ts";
import {
  processBlockNoteFiles,
  replaceBlockNoteUrls,
  cleanupBlockNoteFiles,
  resolveBlockNoteUrls,
  stripBlockNoteUrls,
} from "../../../../utils/blocknote/blocknote-utils.ts";
import {
  syncSection,
  syncPackage,
  syncPassage,
  syncQuestionMaxScore,
} from "../../../../services/exam/index.ts";
import type { ServiceResponse } from "../../../../types/index.ts";
import type { UpdateQuestionParams, QuestionResponseItemT } from "../questions.schema.ts";

export interface UpdateQuestionResult extends ServiceResponse {
  data?: QuestionResponseItemT;
}

export async function updateQuestionService(
  id: string,
  body: UpdateQuestionParams,
  files: UploadedFile[],
  existingContent: any[],
  existingReasonContent: any[],
  existingCreatedAt: Date,
  existingSubjectId: string,
  existingPassageId: string | null,
  existingIsActive: boolean,
  existingScoringStrategy: string,
  logger?: any,
): Promise<UpdateQuestionResult> {
  const {
    subjectId,
    passageId,
    content,
    reasonContent,
    difficulty,
    type,
    scoringStrategy,
    requiredTier,
    educationGradeId,
    isActive,
    variableFormulas,
  } = body;

  // Verify new subject exists if provided
  if (subjectId !== undefined) {
    const existingSubject = await db.query.examSubjects.findFirst({
      where: eq(examSubjects.id, subjectId),
    });
    if (!existingSubject) {
      return { success: false, statusCode: 400, errorKey: ($) => $.exam.questions.update.invalidSubject };
    }
  }

  // Verify new passage exists if provided (and not explicitly nullified)
  if (passageId !== undefined && passageId !== null) {
    const existingPassage = await db.query.examPassages.findFirst({
      where: eq(examPassages.id, passageId),
    });
    if (!existingPassage) {
      return { success: false, statusCode: 400, errorKey: ($) => $.exam.questions.update.invalidPassage };
    }
  }

  // Process uploaded files if any
  let finalContent = content ? stripBlockNoteUrls(content) : existingContent;
  let finalReasonContent = reasonContent
    ? stripBlockNoteUrls(reasonContent)
    : existingReasonContent;

  if (files.length > 0) {
    const urlMap = await processBlockNoteFiles(
      env.server.uploadsQuestionDir,
      id,
      files,
      existingCreatedAt,
    );

    // Replace blob URLs with final URLs
    if (content !== undefined) {
      finalContent = replaceBlockNoteUrls(content, urlMap);
    }
    if (reasonContent !== undefined) {
      finalReasonContent = replaceBlockNoteUrls(reasonContent, urlMap);
    }
  }

  // Build dynamic update payload
  const updatePayload: any = {
    updatedAt: new Date(),
  };

  if (subjectId !== undefined) updatePayload.subjectId = subjectId;
  if (passageId !== undefined) {
    updatePayload.passageId = passageId === "" || passageId === "null" ? null : passageId;
  }
  if (content !== undefined) updatePayload.content = finalContent;
  if (reasonContent !== undefined) updatePayload.reasonContent = finalReasonContent;
  if (difficulty !== undefined) updatePayload.difficulty = difficulty;
  if (type !== undefined) updatePayload.type = type;
  if (scoringStrategy !== undefined) updatePayload.scoringStrategy = scoringStrategy;
  if (requiredTier !== undefined) updatePayload.requiredTier = requiredTier;
  if (educationGradeId !== undefined) {
    updatePayload.educationGradeId =
      educationGradeId === null || educationGradeId === 0 || (educationGradeId as any) === ""
        ? null
        : Number(educationGradeId);
  }
  if (isActive !== undefined) updatePayload.isActive = isActive;

  if (variableFormulas !== undefined) {
    if (
      variableFormulas &&
      typeof variableFormulas === "object" &&
      Object.keys(variableFormulas).length > 0
    ) {
      // Normalize: ensure required 'variables' property exists
      updatePayload.variableFormulas = {
        variables: variableFormulas.variables || [],
        solutions: variableFormulas.solutions || {},
      };
    } else {
      // Treat empty objects or other falsy values as null
      updatePayload.variableFormulas = null;
    }
  }

  const [updatedQuestion] = await db.transaction(async (tx) => {
    const [result] = await tx
      .update(examQuestions)
      .set(updatePayload)
      .where(eq(examQuestions.id, id))
      .returning();

    const isStatusChanged = isActive !== undefined && isActive !== existingIsActive;
    const isPassageChanged =
      passageId !== undefined &&
      (updatePayload.passageId ?? null) !== existingPassageId;

    // 1. Handle Passage Change
    if (isPassageChanged) {
      if (existingPassageId) await syncPassage(existingPassageId, tx);
      if (updatePayload.passageId) await syncPassage(updatePayload.passageId, tx);
    }
    // 2. Handle only status change (if passage didn't change)
    else if (isStatusChanged && existingPassageId) {
      await syncPassage(existingPassageId, tx);
    }

    // If isActive status changed, update activeQuestions count in all related packages and sections
    if (isActive !== undefined && isActive !== existingIsActive) {
      const relatedAssignments = await tx
        .select({
          packageId: examPackageQuestions.packageId,
          sectionId: examPackageQuestions.sectionId,
        })
        .from(examPackageQuestions)
        .where(eq(examPackageQuestions.questionId, id));

      for (const assignment of relatedAssignments) {
        await syncPackage(assignment.packageId, tx);
        await syncSection(assignment.sectionId, tx);
      }
    }

    // 3. NEW: If scoringStrategy changed, sync question maxScore
    if (scoringStrategy !== undefined && scoringStrategy !== existingScoringStrategy) {
      await syncQuestionMaxScore(id, tx);
    }

    return [result];
  });

  // Clean up orphaned files
  if (content !== undefined || reasonContent !== undefined) {
    await cleanupBlockNoteFiles(
      [...(existingContent || []), ...(existingReasonContent || [])],
      [...(finalContent || []), ...(finalReasonContent || [])],
      env.server.uploadsQuestionDir,
      ["image"],
      logger,
    );
  }

  return {
    success: true,
    data: {
      id: updatedQuestion.id,
      subjectId: updatedQuestion.subjectId,
      passageId: updatedQuestion.passageId,
      content: resolveBlockNoteUrls(updatedQuestion.content as any[]),
      reasonContent: resolveBlockNoteUrls(updatedQuestion.reasonContent as any[]),
      difficulty: updatedQuestion.difficulty as (typeof EnumDifficultyLevel)[keyof typeof EnumDifficultyLevel],
      type: updatedQuestion.type as (typeof EnumQuestionType)[keyof typeof EnumQuestionType],
      maxScore: updatedQuestion.maxScore,
      scoringStrategy: updatedQuestion.scoringStrategy as (typeof EnumScoringStrategy)[keyof typeof EnumScoringStrategy],
      requiredTier: updatedQuestion.requiredTier,
      educationGradeId: updatedQuestion.educationGradeId,
      isActive: updatedQuestion.isActive,
      variableFormulas: updatedQuestion.variableFormulas as any,
      createdAt: updatedQuestion.createdAt.toISOString(),
      updatedAt: updatedQuestion.updatedAt.toISOString(),
    },
  };
}
