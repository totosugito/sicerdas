import { useState } from "react"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Separator } from "@/components/ui/separator"
import { Calendar, BookOpen, FileText, Eye, Heart, Star, Download, ArrowLeft, Flag } from "lucide-react"
import { Book, getBookCover, getBookPdf, getBookPageList, getGrade } from "@/components/pages/book/types/books"
import { formatFileSize } from "@/lib/my-utils"
import { useTranslation } from "react-i18next"
import { SamplePages } from "./SamplePages"
import { Link } from "@tanstack/react-router"
import { cn } from "@/lib/utils"
import { AppRoute } from "@/constants/app-route"

interface BookDetailProps {
  book: Book
  isLoading?: boolean
}

export const BookDetail = ({ book, isLoading = false }: BookDetailProps) => {
  const { t } = useTranslation()
  const [isFavorite, setIsFavorite] = useState(book.favorite || false)

  if (isLoading) {
    return (
      <div className="container mx-auto p-6 max-w-7xl animate-pulse space-y-8">
        <div className="h-10 bg-slate-200 dark:bg-slate-800 rounded w-32"></div>
        <div className="flex flex-col lg:flex-row gap-12">
          <div className="w-full lg:w-1/3 aspect-[2/3] bg-slate-200 dark:bg-slate-800 rounded-3xl"></div>
          <div className="flex-1 space-y-6">
            <div className="h-12 bg-slate-200 dark:bg-slate-800 rounded w-3/4"></div>
            <div className="h-6 bg-slate-200 dark:bg-slate-800 rounded w-1/2"></div>
            <div className="space-y-2 pt-4">
              <div className="h-4 bg-slate-200 dark:bg-slate-800 rounded w-full"></div>
              <div className="h-4 bg-slate-200 dark:bg-slate-800 rounded w-full"></div>
              <div className="h-4 bg-slate-200 dark:bg-slate-800 rounded w-2/3"></div>
            </div>
          </div>
        </div>
      </div>
    )
  }

  const handleRead = () => {
    const pdfUrl = getBookPdf(book.id)
    window.open(pdfUrl, '_blank')
  }

  const handleDownload = () => {
    const pdfUrl = getBookPdf(book.id)
    // Create a temporary link to force download if possible, or just open
    const link = document.createElement('a')
    link.href = pdfUrl
    link.download = `${book.title}.pdf`
    document.body.appendChild(link)
    link.click()
    document.body.removeChild(link)
  }

  const handleToggleFavorite = () => {
    setIsFavorite(!isFavorite)
    // TODO: Implement favorite toggle functionality with API
  }

  const handleReport = () => {
    // TODO: Implement report functionality
    console.log("Report book:", book.id)
  }

  const samplePages = getBookPageList(book.id, 4, 5)

  // Determine cover image URL safely
  const coverUrl = getBookCover(book.id, "lg")
  const fallbackCoverUrl = getBookCover(book.id, "md")

  return (
    <div className="w-full">
      {/* Navigation */}
      <div className="mb-8">
        <Link to={AppRoute.book.books.url} className="inline-flex">
          <Button variant="ghost" className="pl-0 hover:bg-transparent hover:text-primary transition-colors gap-2 text-slate-500 dark:text-slate-400">
            <ArrowLeft className="w-5 h-5" />
            <span className="text-base font-medium">{t('books.detail.backToBooks')}</span>
          </Button>
        </Link>
      </div>

      <div className="flex flex-col lg:flex-row gap-6 lg:gap-8">
        {/* Left Column - Cover */}
        <div className="flex-shrink-0 w-full lg:w-[400px]">
          <div className="sticky top-24">
            <div className="w-full relative group rounded-2xl shadow-2xl overflow-hidden bg-white dark:bg-slate-900 aspect-[2/3] max-h-[400px] lg:max-h-none border border-slate-200 dark:border-slate-800">
              <img
                src={coverUrl}
                alt={`Cover of ${book.title}`}
                className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105"
                onError={(e) => { e.currentTarget.src = fallbackCoverUrl }}
              />
              <div className="absolute inset-0 ring-1 ring-inset ring-black/10 dark:ring-white/10 rounded-2xl" />
            </div>

            {/* Action Buttons */}
            <div className="flex flex-col gap-3 mt-6">
              <Button onClick={handleRead} className="w-full h-10">
                <BookOpen className="w-5 h-5 mr-2" />
                {t('books.detail.readOnline')}
              </Button>
              <div className="grid grid-cols-3 gap-3">
                <Button onClick={handleDownload} variant="outline" className="w-full h-10">
                  <Download className="w-5 h-5 mr-2" />
                  {t('books.detail.download')}
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
                  {t('books.detail.favorites')}
                </Button>
                <Button onClick={handleReport} variant="outline" className="w-full h-10 border border-slate-200 dark:border-slate-800 hover:bg-red-50 dark:hover:bg-red-900/20 text-slate-600 dark:text-slate-400 hover:text-red-600 dark:hover:text-red-400">
                  <Flag className="w-5 h-5 mr-2" />
                  {t('books.detail.report')}
                </Button>
              </div>
            </div>
          </div>
        </div>

        {/* Right Column - Details */}
        <div className="flex-1 min-w-0 pb-16">
          <div className="flex flex-col gap-4">
            {/* Header Info */}
            <div>
              <div className="flex flex-wrap gap-2 mb-4">
                <Badge variant="secondary" className="bg-blue-100 dark:bg-blue-900/30 text-blue-700 dark:text-blue-300 hover:bg-blue-200 border-transparent px-3 py-1">
                  {book.category.name}
                </Badge>
                <Badge variant="outline" className="border-slate-300 dark:border-slate-700 text-slate-600 dark:text-slate-400">
                  {book.group.name}
                </Badge>

                <Badge variant="outline" className="border-slate-300 dark:border-slate-700 text-slate-600 dark:text-slate-400">
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
              <div className="flex items-center gap-6 mt-6">
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
                    {book.view?.toLocaleString() ?? 0}
                  </span>
                  <span className="text-xs text-slate-500 dark:text-slate-400 font-medium uppercase tracking-wider">
                    {t('books.detail.views')}
                  </span>
                </div>
                <div className="w-px h-8 bg-slate-200 dark:bg-slate-800" />
                <div className="flex flex-col items-center">
                  <span className="font-bold text-slate-900 dark:text-white text-lg leading-none">
                    {book.favoriteTotal?.toLocaleString() ?? 0}
                  </span>
                  <span className="text-xs text-slate-500 dark:text-slate-400 font-medium uppercase tracking-wider">
                    {t('books.detail.favorites')}
                  </span>
                </div>
              </div>
            </div>

            <Separator className="my-2 bg-slate-200 dark:bg-slate-800" />

            {/* Description */}
            <div className="prose prose-slate dark:prose-invert max-w-none">
              <p className="text-lg leading-relaxed text-slate-600 dark:text-slate-300">
                {book.description || ""}
              </p>
            </div>

            {/* Info Grid */}
            <div className="grid grid-cols-3 gap-4">
              <InfoCard
                icon={BookOpen}
                label={t('books.detail.pages')}
                value={book.totalPages?.toString()}
              />
              <InfoCard
                icon={FileText}
                label={t('books.detail.fileSize')}
                value={formatFileSize(book.size)}
              />
              {/* <InfoCard
                icon={BookIcon}
                label={t('books.detail.group')}
                value={book.group.name}
              /> */}
              <InfoCard
                icon={Calendar}
                label={t('books.detail.addedOn')}
                value={new Date(book.createdAt).toLocaleDateString(undefined, { month: 'short', day: 'numeric', year: 'numeric' })}
              />
            </div>

            {/* Sample Pages */}
            <div className="mt-8">
              <h3 className="text-xl font-bold text-slate-900 dark:text-white mb-4 flex items-center gap-2">
                <Eye className="w-5 h-5" />
                {t('books.detail.preview')}
              </h3>
              <SamplePages book={book} samplePages={samplePages} />
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

function InfoCard({ icon: Icon, label, value }: { icon: any, label: string, value?: string }) {
  if (!value) return null
  return (
    <div className="bg-white dark:bg-slate-900/50 border border-slate-200 dark:border-slate-800/50 rounded-xl p-4 flex flex-col gap-3 hover:border-blue-500/50 transition-colors group">
      <div className="p-2 bg-slate-100 dark:bg-slate-800 rounded-lg w-fit group-hover:bg-blue-50 dark:group-hover:bg-blue-900/20 transition-colors">
        <Icon className="w-5 h-5 text-slate-600 dark:text-slate-400 group-hover:text-blue-600 dark:group-hover:text-blue-400" />
      </div>
      <div>
        <p className="text-xs font-semibold uppercase tracking-wider text-slate-500 dark:text-slate-500 mb-0.5">
          {label}
        </p>
        <p className="font-semibold text-slate-900 dark:text-slate-200">
          {value}
        </p>
      </div>
    </div>
  )
}
