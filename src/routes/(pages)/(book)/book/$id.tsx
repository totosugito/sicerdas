import { createFileRoute, Link } from '@tanstack/react-router'
import { useBookDetail } from '@/api/book/book-detail'
import { BookDetail } from '@/components/pages/book/book/BookDetail'
import { BookDetailError } from '@/components/pages/book/book/BookDetailError'
import { BookDetailSkeleton } from '@/components/pages/book/book/BookDetailSkeleton'
import { Button } from '@/components/ui/button'
import { ArrowLeft } from 'lucide-react'
import { AppRoute } from '@/constants/app-route'
import { useTranslation } from 'react-i18next'
import { useState, useEffect } from 'react'
import { useAuth } from '@/hooks/use-auth'
import { CreateReport } from '@/components/pages/layout/CreateReport'
import { EnumContentType } from 'backend/src/db/schema/enum-app'

export const Route = createFileRoute('/(pages)/(book)/book/$id')({
  component: RouteComponent,
})

function RouteComponent() {
  const { id } = Route.useParams()
  const bookId = id.split('-')[0]
  const { data, isLoading, isError } = useBookDetail(bookId)
  const { t } = useTranslation()
  const { user } = useAuth()
  const [showReportDialog, setShowReportDialog] = useState(false)
  const [isFavorite, setIsFavorite] = useState(false)

  useEffect(() => {
    if (data?.data?.userInteraction?.liked) {
      setIsFavorite(true)
    }
  }, [data?.data?.userInteraction?.liked])

  const book = data?.data

  if (isLoading) {
    return <BookDetailSkeleton />
  }

  if (isError || !data?.success || !book) {
    return <BookDetailError message={data?.message} />
  }

  const handleRead = () => {
    window.open(book.pdf, '_blank')
  }

  const handleDownload = () => {
    const link = document.createElement('a')
    link.href = book.pdf
    link.download = `${book.bookId}-${book.title}.pdf`
    document.body.appendChild(link)
    link.click()
    document.body.removeChild(link)
  }

  const handleToggleFavorite = () => {
    setIsFavorite(!isFavorite)
    // TODO: Implement favorite toggle functionality with API
  }

  const handleReport = () => {
    setShowReportDialog(true)
  }

  return (
    <div className="flex flex-col gap-4 w-full">
      {/* Navigation */}
      <div className="mb-2">
        <Link to={AppRoute.book.books.url} className="inline-flex">
          <Button variant="ghost" className="pl-0 hover:bg-transparent hover:text-primary transition-colors gap-2 text-slate-500 dark:text-slate-400">
            <ArrowLeft className="w-5 h-5" />
            <span className="text-base font-medium">{t('book.detail.backToBooks')}</span>
          </Button>
        </Link>
      </div>
      <BookDetail
        book={book}
        isFavorite={isFavorite}
        onRead={handleRead}
        onDownload={handleDownload}
        onToggleFavorite={handleToggleFavorite}
        onReport={handleReport}
      />

      <CreateReport
        isOpen={showReportDialog}
        onOpenChange={setShowReportDialog}
        data={{
          contentType: EnumContentType.BOOK,
          referenceId: String(book.bookId),
          title: book.title,
          name: user?.user?.name || "",
          email: user?.user?.email || "",
        }}
      />
    </div>
  )
}
