import { db } from "../../../../../db/db-pool.ts";
import { courseLectureTexts } from "../../../../../db/schema/course/lecture-texts.ts";
import { educationCategories, educationGrades } from "../../../../../db/schema/education/index.ts";
import { ilike, sql, desc, asc, eq, and, or } from "drizzle-orm";
import { resolveBlockNoteUrls } from "../../../../../utils/blocknote/blocknote-utils.ts";
import type { ServiceResponse } from "../../../../../types/index.ts";
import type { LectureTextListQueryInput, LectureTextItem } from "../../lecture-texts.schema.ts";

export interface ListLectureTextResult extends ServiceResponse {
  data?: {
    items: LectureTextItem[];
    meta: {
      total: number;
      page: number;
      limit: number;
      totalPages: number;
    };
  };
}

export async function listLectureTextService(
  query: LectureTextListQueryInput,
): Promise<ListLectureTextResult> {
  const page = query.page ?? 1;
  const limit = query.limit ?? 20;
  const offset = (page - 1) * limit;
  const sortBy = query.sortBy ?? "createdAt";
  const sortOrder = query.sortOrder ?? "desc";

  const conditions = [];

  if (query.search) {
    const searchPattern = `%${query.search}%`;
    conditions.push(
      or(
        ilike(courseLectureTexts.title, searchPattern),
        ilike(educationCategories.name, searchPattern),
      ),
    );
  }

  if (query.categoryId) {
    conditions.push(eq(courseLectureTexts.categoryId, query.categoryId));
  }

  if (query.educationGradeId) {
    conditions.push(eq(courseLectureTexts.educationGradeId, query.educationGradeId));
  }

  if (query.status) {
    conditions.push(eq(courseLectureTexts.status, query.status as any));
  }

  const whereClause = conditions.length > 0 ? and(...conditions) : undefined;

  const [totalResult] = await db
    .select({ count: sql<number>`count(*)::int` })
    .from(courseLectureTexts)
    .leftJoin(educationCategories, eq(courseLectureTexts.categoryId, educationCategories.id))
    .where(whereClause);

  const total = Number(totalResult?.count ?? 0);
  const totalPages = Math.ceil(total / limit);

  let sortColumn;
  switch (sortBy) {
    case "title":
      sortColumn = courseLectureTexts.title;
      break;
    case "status":
      sortColumn = courseLectureTexts.status;
      break;
    case "updatedAt":
      sortColumn = courseLectureTexts.updatedAt;
      break;
    case "createdAt":
    default:
      sortColumn = courseLectureTexts.createdAt;
      break;
  }
  const orderDirection = sortOrder === "asc" ? asc(sortColumn) : desc(sortColumn);

  const rawItems = await db
    .select({
      lectureText: {
        id: courseLectureTexts.id,
        title: courseLectureTexts.title,
        content: courseLectureTexts.content,
        categoryId: courseLectureTexts.categoryId,
        educationGradeId: courseLectureTexts.educationGradeId,
        status: courseLectureTexts.status,
        createdByUserId: courseLectureTexts.createdByUserId,
        createdAt: courseLectureTexts.createdAt,
        updatedAt: courseLectureTexts.updatedAt,
      },
      category: {
        id: educationCategories.id,
        name: educationCategories.name,
        key: educationCategories.key,
      },
      grade: {
        id: educationGrades.id,
        name: educationGrades.name,
        grade: educationGrades.grade,
      },
    })
    .from(courseLectureTexts)
    .leftJoin(educationCategories, eq(courseLectureTexts.categoryId, educationCategories.id))
    .leftJoin(educationGrades, eq(courseLectureTexts.educationGradeId, educationGrades.id))
    .where(whereClause)
    .orderBy(orderDirection)
    .limit(limit)
    .offset(offset);

  return {
    success: true,
    data: {
      items: rawItems.map(({ lectureText, category, grade }) => ({
        ...lectureText,
        content: resolveBlockNoteUrls(lectureText.content),
        createdAt: lectureText.createdAt.toISOString(),
        updatedAt: lectureText.updatedAt.toISOString(),
        category: category?.id ? category : null,
        grade: grade?.id ? grade : null,
      })),
      meta: {
        total,
        page,
        limit,
        totalPages,
      },
    },
  };
}
