import { createFileRoute, useRouter } from '@tanstack/react-router'
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
import { CreateContentReport } from '@/components/pages/layout/CreateContentReport'
import { Dialog, DialogContent, DialogTitle, DialogHeader, DialogDescription, DialogFooter } from '@/components/ui/dialog'
import { EnumContentType } from 'backend/src/db/schema/enum-app'
import { PDFViewer, ScrollStrategy } from '@embedpdf/react-pdf-viewer'
import { useUpdateBookmark } from '@/api/book/book-bookmark'
import { useUpdateDownload, UpdateDownloadResponse } from '@/api/book/update-download'
import { showNotifError, showNotifSuccess } from '@/lib/show-notif'
import { DialogModal } from '@/components/custom/components'

export const Route = createFileRoute('/(pages)/(book)/book/$id')({
  component: RouteComponent,
})

function RouteComponent() {
  const router = useRouter()
  const { id } = Route.useParams()
  const bookId = id.split('-')[0]
  const { data, isLoading, isError } = useBookDetail(bookId)
  const { mutate: updateBookmark } = useUpdateBookmark()
  const { mutate: updateDownload } = useUpdateDownload()
  const { t } = useTranslation()
  const { user } = useAuth()
  const [showReportDialog, setShowReportDialog] = useState(false)
  const [showLoginDialog, setShowLoginDialog] = useState(false)
  const [showViewer, setShowViewer] = useState(false)
  const [isFavorite, setIsFavorite] = useState(false)

  useEffect(() => {
    if (data?.data?.userInteraction?.bookmarked !== undefined) {
      setIsFavorite(data.data.userInteraction.bookmarked)
    }
  }, [data?.data?.userInteraction?.bookmarked])

  const book = data?.data

  if (isLoading) {
    return <BookDetailSkeleton />
  }

  if (isError || !data?.success || !book) {
    return <BookDetailError message={data?.message} />
  }

  const handleRead = () => {
    setShowViewer(true)

    updateDownload(
      { bookId: book.bookId },
      {
        onSuccess: (response) => {
          if (response.success && response.data) {
            book.downloadCount = response.data!.downloadCount
          }
        }
      }
    )
  }

  const slug = book.title
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/(^-|-$)+/g, '');

  const handleDownload = () => {
    const link = document.createElement('a')
    link.href = book.pdf
    link.target = '_blank'
    link.download = `${book.bookId}-${slug}.pdf`
    document.body.appendChild(link)
    link.click()
    document.body.removeChild(link)

    updateDownload(
      { bookId: book.bookId },
      {
        onSuccess: (response: UpdateDownloadResponse) => {
          if (response.success && response.data) {
            book.downloadCount = response.data!.downloadCount
          }
        }
      }
    )
  }

  const handleToggleFavorite = () => {
    if (!user) {
      setShowLoginDialog(true)
      return
    }

    const newFavoriteStatus = !isFavorite
    setIsFavorite(newFavoriteStatus)

    updateBookmark(
      {
        bookId: book.bookId,
        bookmarked: newFavoriteStatus,
      },
      {
        onSuccess: (response) => {
          if (!response.success) {
            setIsFavorite(!newFavoriteStatus) // Revert
            showNotifError({ title: null, message: response.message })
          } else {
            showNotifSuccess({ title: null, message: response.message })

            // Update the cache with new data
            if (book.userInteraction) {
              book.userInteraction.bookmarked = response.data.bookmarked
            }
            book.bookmarkCount = response.data.bookmarkCount
          }
        },
        onError: () => {
          setIsFavorite(!newFavoriteStatus) // Revert
          showNotifError({ title: null, message: t('common.error') })
        },
      }
    )
  }

  const handleReport = () => {
    setShowReportDialog(true)
  }

  const handleBack = () => {
    router.navigate({ to: AppRoute.book.books.url })
  }

  const handleLogin = () => {
    router.navigate({ to: AppRoute.auth.signIn.url })
  }

  return (
    <div className="flex flex-col gap-4 w-full">
      {/* Navigation */}
      <div className="mb-2">
        <Button
          variant="ghost"
          className="pl-0 hover:bg-transparent hover:text-primary transition-colors gap-2 text-slate-500 dark:text-slate-400"
          onClick={handleBack}
        >
          <ArrowLeft className="w-5 h-5" />
          <span className="text-base font-medium">{t('book.detail.backToBooks')}</span>
        </Button>
      </div>
      <BookDetail
        book={book}
        isFavorite={isFavorite}
        onRead={handleRead}
        onDownload={handleDownload}
        onToggleFavorite={handleToggleFavorite}
        onReport={handleReport}
      />

      <CreateContentReport
        isOpen={showReportDialog}
        onOpenChange={setShowReportDialog}
        data={{
          contentType: EnumContentType.BOOK,
          referenceId: String(book.id),
          title: book.title,
          name: user?.user?.name || "",
          email: user?.user?.email || "",
        }}
      />

      <DialogModal
        open={showLoginDialog}
        onOpenChange={setShowLoginDialog}
        modal={{
          title: t('book.detail.loginRequired'),
          desc: t('book.detail.loginRequiredDesc'),
          textConfirm: t('book.detail.login'),
          textCancel: t('book.detail.cancel'),
          onConfirmClick: handleLogin,
          onCancelClick: () => setShowLoginDialog(false),
          iconType: "info",
        }}
      />

      <Dialog open={showViewer} onOpenChange={setShowViewer}>
        <DialogContent aria-describedby={undefined}
          showCloseButton={false}
          className="!overflow-hidden max-w-[90vw] h-[90vh] sm:max-w-[85vw] sm:h-[85vh] w-full p-0 flex flex-col border-none sm:rounded-2xl shadow-2xl">
          <DialogTitle className="sr-only">{t('book.detail.pdfViewer')} - {book.title}</DialogTitle>
          <div
            className="relative flex-1 min-h-0 bg-slate-100 dark:bg-slate-900 "
            onWheel={(e) => e.stopPropagation()}
            onTouchMove={(e) => e.stopPropagation()}
            onPointerDown={(e) => e.stopPropagation()}
          >
            <PDFViewer
              key={showViewer ? `visible-${book.bookId}` : 'hidden'}
              config={{
                // src: `${AppApi.book.proxyPdf}/${encodeURIComponent(`${book.bookId}-${book.title}.pdf`)}?url=${encodeURIComponent(book.pdf)}&id=${book.id}`,
                src: book.pdf,
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
