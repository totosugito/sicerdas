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
import { UserCreateReport } from '@/components/pages/layout/UserCreateReport'
import { Dialog, DialogContent, DialogTitle } from '@/components/ui/dialog'
import { EnumContentType } from 'backend/src/db/schema/enum-app'
import { PDFViewer, ScrollStrategy } from '@embedpdf/react-pdf-viewer'
import { AppApi } from '@/constants/app-api'
import { showNotifError } from '@/lib/show-notif'



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
  const [showViewer, setShowViewer] = useState(false)
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
    setShowViewer(true)
  }

  const slug = book.title
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/(^-|-$)+/g, '');

  const handleDownload = async () => {
    try {
      // 1. Fetch via Proxy to avoid CORS and get raw data
      const proxyUrl = `${AppApi.book.proxyPdf}/${encodeURIComponent(`${book.bookId}-${slug}.pdf`)}?url=${encodeURIComponent(book.pdf)}&id=${book.id}`
      const response = await fetch(proxyUrl)
      if (!response.ok) throw new Error(t('book.detail.networkError'))

      // 2. Convert to Blob
      const blob = await response.blob()
      const url = window.URL.createObjectURL(blob)

      // 3. Trigger native download dialog
      const link = document.createElement('a')
      link.href = url
      link.download = `${book.bookId}-${slug}.pdf`
      document.body.appendChild(link)
      link.click()

      // 4. Cleanup memory
      document.body.removeChild(link)
      window.URL.revokeObjectURL(url)
    } catch (error) {
      showNotifError({ message: t('book.detail.downloadError') })
      window.open(book.pdf, '_blank') // Fallback
    }
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

      <UserCreateReport
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

      <Dialog open={showViewer} onOpenChange={setShowViewer}>
        <DialogContent aria-describedby={undefined}
          showCloseButton={false}
          className="!overflow-hidden max-w-[90vw] h-[90vh] sm:max-w-[85vw] sm:h-[85vh] w-full p-0 flex flex-col border-none sm:rounded-2xl shadow-2xl">
          <DialogTitle className="sr-only">PDF Viewer - {book.title}</DialogTitle>
          <div
            className="relative flex-1 min-h-0 bg-slate-100 dark:bg-slate-900 "
            onWheel={(e) => e.stopPropagation()}
            onTouchMove={(e) => e.stopPropagation()}
            onPointerDown={(e) => e.stopPropagation()}
          >
            <PDFViewer
              key={showViewer ? `visible-${book.bookId}` : 'hidden'}
              config={{
                src: `${AppApi.book.proxyPdf}/${encodeURIComponent(`${book.bookId}-${book.title}.pdf`)}?url=${encodeURIComponent(book.pdf)}&id=${book.id}`,
                disabledCategories: ['panel-comment', 'shapes', 'redaction', 'security'],
                scroll: {
                  defaultStrategy: ScrollStrategy.Vertical,
                  defaultPageGap: 16
                },
                theme: {
                  preference: (document.documentElement.classList.contains('dark') ? 'dark' : 'light') as 'dark' | 'light'
                }
              }}
              style={{ width: '100%', height: '100%', position: 'absolute', inset: 0, display: 'block' }}
            />
          </div>
        </DialogContent>
      </Dialog>
    </div>
  )
}
