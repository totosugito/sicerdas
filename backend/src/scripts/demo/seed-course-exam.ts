import dotenv from "dotenv";
import { and, eq, inArray } from "drizzle-orm";
import { db, pool } from "../../db/db-pool.ts";
import {
  courseChapters,
  courseLectures,
  courseLectureTexts,
  courses,
  educationCategories,
  educationGrades,
  examPackageQuestions,
  examPackageSections,
  examPackages,
  examQuestionOptions,
  examQuestions,
  examSubjects,
  EnumContentStatus,
  EnumDifficultyLevel,
  EnumExamType,
  EnumLectureType,
  EnumQuestionType,
  EnumScoringStrategy,
  users,
} from "../../db/schema/index.ts";

dotenv.config({ path: process.env.NODE_ENV === "development" ? ".env.devel" : ".env" });

const DEMO_CATEGORY_KEY = "demo-course";
const DEMO_GRADE_CODE = "demo-grade";
const DEMO_COURSE_CODE = "DEMO-MATH-001";
const DEMO_PACKAGE_TITLE = "Demo Course Exam - Basic Mathematics";
const DEMO_SUBJECT_NAME = "Demo Mathematics";

const textBlock = (text: string) => [
  { type: "paragraph", content: [{ type: "text", text, styles: {} }] },
];

async function seedDemoCourseExam() {
  await db.transaction(async (tx) => {
    const adminEmail = process.env.ADMIN_DEFAULT_EMAIL?.toLowerCase();
    const admin = adminEmail
      ? await tx.query.users.findFirst({ where: eq(users.email, adminEmail) })
      : undefined;
    const createdByUserId = admin?.id;

    const [category] = await tx
      .insert(educationCategories)
      .values({
        name: "Demo Courses",
        key: DEMO_CATEGORY_KEY,
        description: "Seed data for course and exam development.",
        createdByUserId,
      })
      .onConflictDoUpdate({
        target: educationCategories.key,
        set: { name: "Demo Courses", description: "Seed data for course and exam development.", createdByUserId },
      })
      .returning({ id: educationCategories.id });

    const [grade] = await tx
      .insert(educationGrades)
      .values({ grade: DEMO_GRADE_CODE, name: "Demo Grade", createdByUserId })
      .onConflictDoUpdate({
        target: educationGrades.grade,
        set: { name: "Demo Grade", createdByUserId },
      })
      .returning({ id: educationGrades.id });

    if (!category || !grade) throw new Error("Unable to create demo category or grade.");

    const oldCourse = await tx.query.courses.findFirst({
      where: eq(courses.courseCode, DEMO_COURSE_CODE),
      columns: { id: true },
    });
    if (oldCourse) await tx.delete(courses).where(eq(courses.id, oldCourse.id));

    const oldTexts = await tx
      .select({ id: courseLectureTexts.id })
      .from(courseLectureTexts)
      .where(eq(courseLectureTexts.title, "Demo Course - Introduction"));
    if (oldTexts.length > 0) {
      await tx.delete(courseLectureTexts).where(inArray(courseLectureTexts.id, oldTexts.map((text) => text.id)));
    }

    const oldPackage = await tx.query.examPackages.findFirst({
      where: eq(examPackages.title, DEMO_PACKAGE_TITLE),
      columns: { id: true },
    });
    if (oldPackage) {
      const oldQuestions = await tx
        .select({ questionId: examPackageQuestions.questionId })
        .from(examPackageQuestions)
        .where(eq(examPackageQuestions.packageId, oldPackage.id));
      const questionIds = oldQuestions.map((question) => question.questionId);
      await tx.delete(examPackageQuestions).where(eq(examPackageQuestions.packageId, oldPackage.id));
      if (questionIds.length > 0) {
        await tx.delete(examQuestionOptions).where(inArray(examQuestionOptions.questionId, questionIds));
        await tx.delete(examQuestions).where(inArray(examQuestions.id, questionIds));
      }
      await tx.delete(examPackageSections).where(eq(examPackageSections.packageId, oldPackage.id));
      await tx.delete(examPackages).where(eq(examPackages.id, oldPackage.id));
    }

    const [course] = await tx
      .insert(courses)
      .values({
        courseCode: DEMO_COURSE_CODE,
        courseName: "Demo Course: Basic Mathematics",
        courseDescription: "Demo course covering arithmetic, algebra, and problem solving.",
        whatYouWillLearn: "Build confidence with core mathematical concepts and practice exams.",
        price: 0,
        categoryId: category.id,
        educationGradeId: grade.id,
        tags: ["demo", "mathematics", "beginner"],
        instructions: "Complete lectures in order, then take the demo exam.",
        totalChapters: 3,
        activeChapters: 3,
        totalLectures: 6,
        activeLectures: 6,
        status: EnumContentStatus.PUBLISHED,
        isPublic: true,
        isSequential: true,
        createdByUserId,
      })
      .returning({ id: courses.id });

    if (!course) throw new Error("Unable to create demo course.");

    const [introText] = await tx
      .insert(courseLectureTexts)
      .values({
        title: "Demo Course - Introduction",
        content: textBlock("Welcome to the demo mathematics course. Start with the fundamentals."),
        categoryId: category.id,
        educationGradeId: grade.id,
        status: EnumContentStatus.PUBLISHED,
        createdByUserId,
      })
      .returning({ id: courseLectureTexts.id });

    const chapterDefinitions = [
      { name: "Chapter 1: Number Fundamentals", description: "Understand numbers and arithmetic operations." },
      { name: "Chapter 2: Introduction to Algebra", description: "Use variables and equations to model problems." },
      { name: "Chapter 3: Practice and Assessment", description: "Review concepts and verify learning progress." },
    ];

    const chapterRows = await tx
      .insert(courseChapters)
      .values(
        chapterDefinitions.map((chapter, index) => ({
          chapterName: chapter.name,
          courseId: course.id,
          createdByUserId,
          position: String(index + 1),
          extra: { description: chapter.description },
          totalLectures: 2,
          activeLectures: 2,
        })),
      )
      .returning({ id: courseChapters.id });

    await tx.insert(courseLectures).values([
      { title: "Welcome and Course Guide", description: "Course orientation and learning goals.", chapterId: chapterRows[0].id, createdByUserId, type: EnumLectureType.TEXT, referenceUrl: introText.id, position: "1.0000" },
      { title: "Addition and Subtraction", description: "Review basic arithmetic operations.", chapterId: chapterRows[0].id, createdByUserId, type: EnumLectureType.VIDEO, referenceUrl: "https://cdn.example.com/demo/addition-subtraction.mp4", position: "2.0000" },
      { title: "Variables and Expressions", description: "Learn how variables represent unknown values.", chapterId: chapterRows[1].id, createdByUserId, type: EnumLectureType.TEXT, referenceUrl: introText.id, position: "1.0000" },
      { title: "Solving Linear Equations", description: "Solve one-step and two-step equations.", chapterId: chapterRows[1].id, createdByUserId, type: EnumLectureType.PDF, referenceUrl: "https://cdn.example.com/demo/linear-equations.pdf", position: "2.0000" },
      { title: "Demo Mathematics Exam", description: "Complete this exam to finish the demo course.", chapterId: chapterRows[2].id, createdByUserId, type: EnumLectureType.EXAM, extra: { successThreshold: 70 }, position: "1.0000" },
      { title: "Final Review", description: "Review key ideas from every chapter.", chapterId: chapterRows[2].id, createdByUserId, type: EnumLectureType.TEXT, referenceUrl: introText.id, position: "2.0000" },
    ]);

    const existingSubject = await tx.query.examSubjects.findFirst({
      where: eq(examSubjects.name, DEMO_SUBJECT_NAME),
      columns: { id: true },
    });
    const [subject] = existingSubject
      ? [existingSubject]
      : await tx
        .insert(examSubjects)
        .values({ name: DEMO_SUBJECT_NAME, description: "Subject used by the demo course exam.", createdByUserId })
        .returning({ id: examSubjects.id });
    if (!subject) throw new Error("Unable to create demo exam subject.");

    const [examPackage] = await tx
      .insert(examPackages)
      .values({
        categoryId: category.id,
        title: DEMO_PACKAGE_TITLE,
        examType: EnumExamType.COURSE_EXAM,
        createdByUserId,
        durationMinutes: 20,
        description: "Demo assessment linked to the demo mathematics course.",
        requiredTier: "free",
        educationGradeId: grade.id,
        isActive: true,
        totalSections: 1,
        activeSections: 1,
        totalQuestions: 3,
        activeQuestions: 3,
      })
      .returning({ id: examPackages.id });
    if (!examPackage) throw new Error("Unable to create demo exam package.");

    const [section] = await tx
      .insert(examPackageSections)
      .values({
        packageId: examPackage.id,
        title: "Basic Mathematics Assessment",
        groupName: "Demo Course",
        description: "Three questions covering the demo course fundamentals.",
        durationMinutes: 20,
        order: 1,
        createdByUserId,
        totalQuestions: 3,
        activeQuestions: 3,
        maxScore: 3,
      })
      .returning({ id: examPackageSections.id });
    if (!section) throw new Error("Unable to create demo exam section.");

    const questionDefinitions = [
      { text: "What is 2 + 3?", answer: "5", distractors: ["4", "6", "7"] },
      { text: "Solve x + 4 = 9. What is x?", answer: "5", distractors: ["3", "4", "13"] },
      { text: "Which number is even?", answer: "8", distractors: ["5", "7", "9"] },
    ];
    const questionRows = await tx
      .insert(examQuestions)
      .values(
        questionDefinitions.map((question) => ({
          subjectId: subject.id,
          content: textBlock(question.text),
          difficulty: EnumDifficultyLevel.EASY,
          type: EnumQuestionType.MULTIPLE_CHOICE,
          maxScore: 1,
          scoringStrategy: EnumScoringStrategy.ALL_OR_NOTHING,
          requiredTier: "free",
          educationGradeId: grade.id,
          createdByUserId,
        })),
      )
      .returning({ id: examQuestions.id });

    for (const [index, question] of questionDefinitions.entries()) {
      const options = [question.answer, ...question.distractors];
      await tx.insert(examQuestionOptions).values(
        options.map((option, optionIndex) => ({
          questionId: questionRows[index].id,
          content: textBlock(option),
          isCorrect: option === question.answer,
          score: option === question.answer ? 1 : 0,
          order: optionIndex + 1,
        })),
      );
      await tx.insert(examPackageQuestions).values({
        packageId: examPackage.id,
        questionId: questionRows[index].id,
        sectionId: section.id,
        order: index + 1,
      });
    }

    await tx
      .update(courseLectures)
      .set({ referenceUrl: section.id })
      .where(and(eq(courseLectures.chapterId, chapterRows[2].id), eq(courseLectures.type, EnumLectureType.EXAM)));

    console.log(`Demo course created: ${DEMO_COURSE_CODE}`);
    console.log(`Demo exam created: ${DEMO_PACKAGE_TITLE}`);
  });
}

seedDemoCourseExam()
  .catch((error) => {
    console.error("Demo course/exam seed failed:", error);
    process.exitCode = 1;
  })
  .finally(async () => {
    await pool.end();
  });
