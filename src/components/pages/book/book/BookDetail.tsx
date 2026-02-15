import { useState } from "react"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Separator } from "@/components/ui/separator"
import { Calendar, BookOpen, FileText, Heart, Star, Download, Flag, ImageOff } from "lucide-react"
import { getGrade } from "@/components/pages/book/types/books"
import { formatFileSize } from "@/lib/my-utils"
import { useTranslation } from "react-i18next"
import { SamplePages } from "./SamplePages"
import { BookDetailInfoCard } from "./BookDetailInfoCard"
import { cn } from "@/lib/utils"
import { BookDetil } from "@/api/book/book-detail"

interface BookDetailProps {
  book: BookDetil
  isFavorite: boolean
  onRead: () => void
  onDownload: () => void
  onToggleFavorite: () => void
  onReport: () => void
}

export const BookDetail = ({
  book,
  isFavorite,
  onRead,
  onDownload,
  onToggleFavorite,
  onReport
}: BookDetailProps) => {
  const { t } = useTranslation()
  const [imageError, setImageError] = useState(false)

  return (
    <div className="w-full">
      <div className="flex flex-col lg:flex-row gap-6 lg:gap-8">
        {/* Left Column - Cover */}
        <div className="flex-shrink-0 w-full lg:w-[400px]">
          <div className="">
            <div className="w-full relative group rounded-2xl shadow-2xl overflow-hidden bg-white dark:bg-slate-900 aspect-[2/3] max-h-[350px] lg:max-h-none border border-slate-200 dark:border-slate-800">
              {imageError ? (
                <div className="w-full h-full flex items-center justify-center bg-slate-100 dark:bg-slate-800/50 cursor-default">
                  <ImageOff className="w-20 h-20 text-slate-400 dark:text-slate-600" />
                </div>
              ) : (
                <img
                  src={book.cover.lg}
                  alt={`Cover of ${book.title}`}
                  className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105"
                  onError={() => setImageError(true)}
                />
              )}
              <div className="absolute inset-0 ring-1 ring-inset ring-black/10 dark:ring-white/10 rounded-2xl pointer-events-none" />
            </div>

            {/* Action Buttons */}
            <div className="flex flex-col gap-3 mt-6">
              <Button onClick={onRead} className="w-full h-10">
                <BookOpen className="w-5 h-5 mr-2" />
                {t('book.detail.readOnline')}
              </Button>
              <div className="grid grid-cols-3 gap-3">
                <Button onClick={onDownload} variant="outline" className="w-full h-10">
                  <Download className="w-5 h-5 mr-2" />
                  {t('book.detail.download')}
                </Button>
                <Button
                  onClick={onToggleFavorite}
                  variant="outline"
                  className={cn(
                    "w-full h-10",
                    isFavorite ? "text-red-500 hover:text-red-600 dark:text-red-400 dark:hover:text-red-300" : "text-slate-600 dark:text-slate-400"
                  )}
                >
                  <Heart className={cn("w-5 h-5 mr-2", isFavorite && "fill-current")} />
                  {t('book.detail.favorites')}
                </Button>
                <Button onClick={onReport} variant="outline" className="w-full h-10 border border-slate-200 dark:border-slate-800 hover:bg-red-50 dark:hover:bg-red-900/20 text-slate-600 dark:text-slate-400 hover:text-red-600 dark:hover:text-red-400">
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

              <div className="flex items-center gap-2 text-slate-500 dark:text-slate-400 text-lg">
                <span className="flex flex-row gap-2 font-medium text-slate-800 dark:text-slate-200">
                  {book.publishedYear && (
                    <>
                      {book.publishedYear}
                    </>
                  )}
                </span>
                ◉ {book.author}
              </div>

              {/* Rating & Action Stats */}
              <div className="flex items-center gap-6 mt-4">
                <div className="flex items-center gap-1.5">
                  <Star className="w-6 h-6 text-amber-500 fill-amber-500" />
                  <span className="text-2xl font-bold text-slate-900 dark:text-white">
                    {book.rating?.toFixed(1)}
                  </span>
                  <span className="text-slate-500 dark:text-slate-400 text-sm mt-1">/ 5.0</span>
                </div>
                <div className="w-px h-8 bg-slate-200 dark:bg-slate-800" />
                <div className="flex flex-col items-center">
                  <span className="font-bold text-slate-900 dark:text-white text-lg leading-none">
                    {book.viewCount?.toLocaleString()}
                  </span>
                  <span className="text-xs text-slate-500 dark:text-slate-400 font-medium uppercase tracking-wider">
                    {t('book.detail.views')}
                  </span>
                </div>
                <div className="w-px h-8 bg-slate-200 dark:bg-slate-800" />
                <div className="flex flex-col items-center">
                  <span className="font-bold text-slate-900 dark:text-white text-lg leading-none">
                    {book.downloadCount?.toLocaleString()}
                  </span>
                  <span className="text-xs text-slate-500 dark:text-slate-400 font-medium uppercase tracking-wider">
                    {t('book.detail.download')}
                  </span>
                </div>
                <div className="w-px h-8 bg-slate-200 dark:bg-slate-800" />
                <div className="flex flex-col items-center">
                  <span className="font-bold text-slate-900 dark:text-white text-lg leading-none">
                    {book.bookmarkCount?.toLocaleString()}
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
              <SamplePages book={book} />
            </div>
          </div>
        </div>
      </div>

    </div>
  )
}


