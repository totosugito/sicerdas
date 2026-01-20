import { createFileRoute } from '@tanstack/react-router'
import { useBookDetail } from '@/api/book/book-detail'
import { BookDetail } from '@/components/pages/book/book/BookDetail'
import { BookDetailError } from '@/components/pages/book/book/BookDetailError'

export const Route = createFileRoute('/(pages)/(book)/book/$id')({
  component: RouteComponent,
})

function RouteComponent() {
  const { id } = Route.useParams()
  const bookId = id.split('-')[0]
  const { data, isLoading, isError } = useBookDetail(bookId)

  if (isLoading) {
    return <BookDetail book={{} as any} isLoading={true} />
  }

  if (isError || !data?.success) {
    return <BookDetailError message={data?.message} />
  }

  const bookData = data.data

  // Adapt new API response to match BookDetail component expectations
  // The component expects integer 'id' for cover/pdf generation, but API returns UUID as 'id'.
  // We map bookId (int) to id, and viewCount -> view
  const book = {
    ...bookData,
    id: bookData.bookId, // Component expects the integer ID
    uuid: bookData.id,   // Keep the UUID
    view: bookData.viewCount,
    favorite: bookData.userInteraction?.liked ?? false,
    favoriteTotal: 0, // Not available in new API yet
  }

  return (
    <div className="flex flex-col gap-6 w-full">
      <BookDetail book={book as any} />
    </div>
  )
}
