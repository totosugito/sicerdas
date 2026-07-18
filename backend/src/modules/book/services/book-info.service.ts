import { db } from "../../../db/db-pool.ts";
import { books } from "../../../db/schema/book/index.ts";
import { and, eq } from "drizzle-orm";
import { getBookPdfUrl } from "../../../utils/book/book-utils.ts";
import type { ServiceResponse } from "../../../types/index.ts";
import type { BookInfoData } from "../book.schema.ts";

export interface BookInfoResult extends ServiceResponse {
  data?: BookInfoData;
}

export async function bookInfoService(
  bookId: number,
  page: number,
): Promise<BookInfoResult> {
  const result = await db
    .select({
      id: books.id,
      bookId: books.bookId,
      title: books.title,
      description: books.description,
      author: books.author,
      publishedYear: books.publishedYear,
      totalPages: books.totalPages,
      size: books.size,
      status: books.status,
    })
    .from(books)
    .where(and(eq(books.bookId, bookId), eq(books.totalPages, page)))
    .limit(1);

  if (!result || result.length === 0) {
    return { success: false, statusCode: 404, errorKey: ($) => $.book.detail.notFound };
  }

  const book = result[0];

  return {
    success: true,
    data: {
      id: book.id,
      bookId: book.bookId,
      title: book.title,
      description: book.description || undefined,
      author: book.author || undefined,
      publishedYear: book.publishedYear,
      totalPages: book.totalPages,
      size: book.size,
      status: book.status,
      pdf: getBookPdfUrl({ bookId: book.bookId }),
    },
  };
}
