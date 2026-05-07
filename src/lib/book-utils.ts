/**
 * Generates a URL-friendly slug from a book title and combines it with the book ID.
 * Used for navigating to book detail pages.
 * 
 * @param bookId - The unique ID of the book
 * @param title - The title of the book to slugify
 * @returns A string in the format "bookId-slug"
 */
export const getBookDetailId = (bookId: number | string, title: string): string => {
  if (!title) return String(bookId);
  
  const slug = title
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/(^-|-$)+/g, "");
    
  return `${bookId}-${slug}`;
};
