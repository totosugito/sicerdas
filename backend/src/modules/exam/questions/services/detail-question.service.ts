import { db } from "../../../../db/db-pool.ts";
import { examQuestions } from "../../../../db/schema/exam/questions.ts";
import { examQuestionOptions } from "../../../../db/schema/exam/question-options.ts";
import { examQuestionSolutions } from "../../../../db/schema/exam/question-solutions.ts";
import { examQuestionTags } from "../../../../db/schema/exam/question-tags.ts";
import { examPassages } from "../../../../db/schema/exam/passages.ts";
import { examSubjects } from "../../../../db/schema/exam/subjects.ts";
import { educationGrades } from "../../../../db/schema/education/grades.ts";
import { educationTags } from "../../../../db/schema/education/tags.ts";
import { eq, asc } from "drizzle-orm";
import { EnumSolutionType, EnumDifficultyLevel, EnumQuestionType, EnumScoringStrategy } from "../../../../db/schema/exam/enums.ts";
import { resolveBlockNoteUrls } from "../../../../utils/blocknote/blocknote-utils.ts";
import type { ServiceResponse } from "../../../../types/index.ts";
import type { QuestionDetailDataT } from "../questions.schema.ts";

export interface DetailQuestionResult extends ServiceResponse {
  data?: QuestionDetailDataT;
}

export async function detailQuestionService(
  id: string,
): Promise<DetailQuestionResult> {
  // 1. Fetch the question with subject and grade names
  const [question] = await db
    .select({
      id: examQuestions.id,
      subjectId: examQuestions.subjectId,
      subjectName: examSubjects.name,
      passageId: examQuestions.passageId,
      content: examQuestions.content,
      difficulty: examQuestions.difficulty,
      type: examQuestions.type,
      maxScore: examQuestions.maxScore,
      scoringStrategy: examQuestions.scoringStrategy,
      requiredTier: examQuestions.requiredTier,
      educationGradeId: examQuestions.educationGradeId,
      educationGradeName: educationGrades.name,
      isActive: examQuestions.isActive,
      variableFormulas: examQuestions.variableFormulas,
      reasonContent: examQuestions.reasonContent,
      createdAt: examQuestions.createdAt,
      updatedAt: examQuestions.updatedAt,
    })
    .from(examQuestions)
    .innerJoin(examSubjects, eq(examQuestions.subjectId, examSubjects.id))
    .leftJoin(educationGrades, eq(examQuestions.educationGradeId, educationGrades.id))
    .where(eq(examQuestions.id, id))
    .limit(1);

  if (!question) {
    return { success: false, statusCode: 404, errorKey: ($) => $.exam.questions.update.notFound };
  }

  // 2. Fetch Options
  const options = await db
    .select({
      id: examQuestionOptions.id,
      content: examQuestionOptions.content,
      isCorrect: examQuestionOptions.isCorrect,
      score: examQuestionOptions.score,
      order: examQuestionOptions.order,
    })
    .from(examQuestionOptions)
    .where(eq(examQuestionOptions.questionId, id))
    .orderBy(asc(examQuestionOptions.order));

  // 3. Fetch Solutions
  const solutions = await db
    .select({
      id: examQuestionSolutions.id,
      title: examQuestionSolutions.title,
      content: examQuestionSolutions.content,
      solutionType: examQuestionSolutions.solutionType,
      order: examQuestionSolutions.order,
      requiredTier: examQuestionSolutions.requiredTier,
    })
    .from(examQuestionSolutions)
    .where(eq(examQuestionSolutions.questionId, id))
    .orderBy(asc(examQuestionSolutions.order));

  // 4. Fetch Tags
  const tags = await db
    .select({
      id: educationTags.id,
      name: educationTags.name,
    })
    .from(examQuestionTags)
    .innerJoin(educationTags, eq(examQuestionTags.tagId, educationTags.id))
    .where(eq(examQuestionTags.questionId, id));

  // 5. Fetch Passage
  let passage = null;
  if (question.passageId) {
    const fetchedPassage = await db.query.examPassages.findFirst({
      where: eq(examPassages.id, question.passageId),
    });
    if (fetchedPassage) {
      passage = {
        title: fetchedPassage.title,
        content: fetchedPassage.content,
      };
    }
  }

  return {
    success: true,
    data: {
      id: question.id,
      subjectId: question.subjectId,
      subjectName: question.subjectName,
      passageId: question.passageId,
      content: resolveBlockNoteUrls(question.content as any[]),
      reasonContent: resolveBlockNoteUrls(question.reasonContent as any[]),
      difficulty: question.difficulty as (typeof EnumDifficultyLevel)[keyof typeof EnumDifficultyLevel],
      type: question.type as (typeof EnumQuestionType)[keyof typeof EnumQuestionType],
      maxScore: question.maxScore,
      scoringStrategy: question.scoringStrategy as (typeof EnumScoringStrategy)[keyof typeof EnumScoringStrategy],
      requiredTier: question.requiredTier,
      educationGradeId: question.educationGradeId,
      educationGradeName: question.educationGradeName,
      isActive: question.isActive,
      variableFormulas:
        question.variableFormulas &&
          typeof question.variableFormulas === "object" &&
          Object.keys(question.variableFormulas).length > 0
          ? {
            variables: (question.variableFormulas as any).variables || [],
            solutions: (question.variableFormulas as any).solutions || {},
          }
          : null,
      createdAt: question.createdAt.toISOString(),
      updatedAt: question.updatedAt.toISOString(),
      options: options.map((opt) => ({
        ...opt,
        content: resolveBlockNoteUrls(opt.content as any[]),
      })),
      solutions: solutions.map((sol) => ({
        ...sol,
        solutionType: sol.solutionType as (typeof EnumSolutionType)[keyof typeof EnumSolutionType],
        content: resolveBlockNoteUrls(sol.content as any[]),
      })),
      tags,
      passage: passage
        ? {
          ...passage,
          content: resolveBlockNoteUrls(passage.content as any[]),
        }
        : null,
    },
  };
}
