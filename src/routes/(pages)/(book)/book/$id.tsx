import { createFileRoute } from '@tanstack/react-router'
import { useBookDetail } from '@/api/book/book-detail'
import { BookDetail } from '@/components/pages/book/book/BookDetail'
import { BookDetailError } from '@/components/pages/book/book/BookDetailError'
import { BookDetailSkeleton } from '@/components/pages/book/book/BookDetailSkeleton'

export const Route = createFileRoute('/(pages)/(book)/book/$id')({
  component: RouteComponent,
})

function RouteComponent() {
  const { id } = Route.useParams()
  const bookId = id.split('-')[0]
  const { data, isLoading, isError } = useBookDetail(bookId)

  if (isLoading) {
    return <BookDetailSkeleton />
  }

  if (isError || !data?.success) {
    return <BookDetailError message={data?.message} />
  }

  return (
    <div className="flex flex-col gap-6 w-full">
      <BookDetail book={data.data} />
    </div>
  )
}
