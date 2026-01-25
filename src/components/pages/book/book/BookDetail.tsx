import { useState } from "react"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Separator } from "@/components/ui/separator"
import { Calendar, BookOpen, FileText, Heart, Star, Download, ArrowLeft, Flag } from "lucide-react"
import { getBookCover, getBookPdf, getBookPageList, getGrade } from "@/components/pages/book/types/books"
import { formatFileSize } from "@/lib/my-utils"
import { useTranslation } from "react-i18next"
import { SamplePages } from "./SamplePages"
import { BookDetailInfoCard } from "./BookDetailInfoCard"
import { Link } from "@tanstack/react-router"
import { cn } from "@/lib/utils"
import { AppRoute } from "@/constants/app-route"
import { BookDetil } from "@/api/book/book-detail"
import { CreateReport } from "@/components/pages/layout/CreateReport"
import { EnumContentType } from "backend/src/db/schema/enum-app"
import { useAuth } from "@/hooks/use-auth"
import { APP_CONFIG } from "@/constants/config"

interface BookDetailProps {
  book: BookDetil
}

export const BookDetail = ({ book }: BookDetailProps) => {
  const { t } = useTranslation()
  const [isFavorite, setIsFavorite] = useState(book.userInteraction?.liked || false)

  const handleRead = () => {
    const pdfUrl = getBookPdf(book.bookId)
    window.open(pdfUrl, '_blank')
  }

  const handleDownload = () => {
    const pdfUrl = getBookPdf(book.bookId)
    const link = document.createElement('a')
    link.href = pdfUrl
    link.download = `${book.bookId}-${book.title}.pdf`
    document.body.appendChild(link)
    link.click()
    document.body.removeChild(link)
  }

  const handleToggleFavorite = () => {
    setIsFavorite(!isFavorite)
    // TODO: Implement favorite toggle functionality with API
  }

  const { user } = useAuth();
  const [showReportDialog, setShowReportDialog] = useState(false);

  const handleReport = () => {
    setShowReportDialog(true);
  }

  const samplePages = getBookPageList(book.bookId, 4, APP_CONFIG.book.samplePages)

  return (
    <div className="w-full">
      {/* Navigation */}
      <div className="mb-2">
        <Link to={AppRoute.book.books.url} className="inline-flex">
          <Button variant="ghost" className="pl-0 hover:bg-transparent hover:text-primary transition-colors gap-2 text-slate-500 dark:text-slate-400">
            <ArrowLeft className="w-5 h-5" />
            <span className="text-base font-medium">{t('book.detail.backToBooks')}</span>
          </Button>
        </Link>
      </div>

      <div className="flex flex-col lg:flex-row gap-6 lg:gap-8">
        {/* Left Column - Cover */}
        <div className="flex-shrink-0 w-full lg:w-[400px]">
          <div className="">
            <div className="w-full relative group rounded-2xl shadow-2xl overflow-hidden bg-white dark:bg-slate-900 aspect-[2/3] max-h-[350px] lg:max-h-none border border-slate-200 dark:border-slate-800">
              <img
                src={getBookCover(book.bookId, "lg")}
                alt={`Cover of ${book.title}`}
                className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105"
              />
              <div className="absolute inset-0 ring-1 ring-inset ring-black/10 dark:ring-white/10 rounded-2xl" />
            </div>

            {/* Action Buttons */}
            <div className="flex flex-col gap-3 mt-6">
              <Button onClick={handleRead} className="w-full h-10">
                <BookOpen className="w-5 h-5 mr-2" />
                {t('book.detail.readOnline')}
              </Button>
              <div className="grid grid-cols-3 gap-3">
                <Button onClick={handleDownload} variant="outline" className="w-full h-10">
                  <Download className="w-5 h-5 mr-2" />
                  {t('book.detail.download')}
                </Button>
                <Button
                  onClick={handleToggleFavorite}
                  variant="outline"
                  className={cn(
                    "w-full h-10",
                    isFavorite ? "text-red-500 hover:text-red-600 dark:text-red-400 dark:hover:text-red-300" : "text-slate-600 dark:text-slate-400"
                  )}
                >
                  <Heart className={cn("w-5 h-5 mr-2", isFavorite && "fill-current")} />
                  {t('book.detail.favorites')}
                </Button>
                <Button onClick={handleReport} variant="outline" className="w-full h-10 border border-slate-200 dark:border-slate-800 hover:bg-red-50 dark:hover:bg-red-900/20 text-slate-600 dark:text-slate-400 hover:text-red-600 dark:hover:text-red-400">
                  <Flag className="w-5 h-5 mr-2" />
                  {t('book.detail.report')}
                </Button>
              </div>
            </div>
          </div>
        </div>

        {/* Right Column - Details */}
        <div className="flex-1 min-w-0">
          <div className="flex flex-col gap-6">
            {/* Header Info */}
            <div>
              <div className="flex flex-wrap gap-2 mb-4">
                <Badge variant="secondary" className="bg-blue-100 dark:bg-blue-900/30 text-blue-700 dark:text-blue-300 hover:bg-blue-200 border-transparent px-3 py-1">
                  {book.category.name}
                </Badge>
                <Badge variant="secondary" className="bg-violet-100 dark:bg-violet-900/30 text-violet-700 dark:text-violet-300 hover:bg-violet-200 border-transparent px-3 py-1">
                  {book.group.name}
                </Badge>

                <Badge variant="secondary" className="bg-emerald-100 dark:bg-emerald-900/30 text-emerald-700 dark:text-emerald-300 hover:bg-emerald-200 border-transparent px-3 py-1">
                  {book.grade.name}{getGrade(book.grade.grade, ' - ')}
                </Badge>
              </div>

              <h1 className="text-slate-900 dark:text-slate-100 text-3xl font-black leading-[1.1] mb-1">
                {book.title}
              </h1>

              <div className="flex items-center gap-4 text-slate-500 dark:text-slate-400 text-lg">
                <span className="font-medium text-slate-800 dark:text-slate-200">
                  {book.author}
                </span>
                {book.publishedYear && (
                  <>
                    <span className="w-1 h-1 rounded-full bg-slate-300 dark:bg-slate-600" />
                    <span>{book.publishedYear}</span>
                  </>
                )}
              </div>

              {/* Rating & Action Stats */}
              <div className="flex items-center gap-6 mt-4">
                <div className="flex items-center gap-1.5">
                  <Star className="w-6 h-6 text-amber-500 fill-amber-500" />
                  <span className="text-2xl font-bold text-slate-900 dark:text-white">
                    {book.rating || "0.0"}
                  </span>
                  <span className="text-slate-500 dark:text-slate-400 text-sm mt-1">/ 5.0</span>
                </div>
                <div className="w-px h-8 bg-slate-200 dark:bg-slate-800" />
                <div className="flex flex-col items-center">
                  <span className="font-bold text-slate-900 dark:text-white text-lg leading-none">
                    {book.viewCount?.toLocaleString() ?? 0}
                  </span>
                  <span className="text-xs text-slate-500 dark:text-slate-400 font-medium uppercase tracking-wider">
                    {t('book.detail.views')}
                  </span>
                </div>
                <div className="w-px h-8 bg-slate-200 dark:bg-slate-800" />
                <div className="flex flex-col items-center">
                  <span className="font-bold text-slate-900 dark:text-white text-lg leading-none">
                    0
                  </span>
                  <span className="text-xs text-slate-500 dark:text-slate-400 font-medium uppercase tracking-wider">
                    {t('book.detail.favorites')}
                  </span>
                </div>
              </div>
            </div>

            <Separator className="bg-slate-200 dark:bg-slate-800" />

            {/* Info Grid */}
            <div className="grid grid-cols-3 gap-4">
              <BookDetailInfoCard
                icon={BookOpen}
                label={t('book.detail.pages')}
                value={book.totalPages?.toString()}
              />
              <BookDetailInfoCard
                icon={FileText}
                label={t('book.detail.fileSize')}
                value={formatFileSize(book.size)}
              />
              <BookDetailInfoCard
                icon={Calendar}
                label={t('book.detail.addedOn')}
                value={new Date(book.createdAt).toLocaleDateString(undefined, { month: 'short', day: 'numeric', year: 'numeric' })}
              />
            </div>

            {/* Sample Pages */}
            <div className="">
              <SamplePages book={book} samplePages={samplePages} />
            </div>
          </div>
        </div>
      </div>

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


