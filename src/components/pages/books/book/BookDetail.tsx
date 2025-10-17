import { Badge } from "@/components/ui/badge"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Separator } from "@/components/ui/separator"
import { Calendar, BookOpen, FileText, Eye, Heart, Star, Download, Share2 } from "lucide-react"
import { Book, getBookCover, getBookPdf, getBookPageList } from "../types/books"
import { formatFileSize } from "@/lib/my-utils"
import { useTranslation } from "react-i18next"
import { SamplePages } from "./SamplePages"

interface BookDetailProps {
  book: Book
  isLoading?: boolean
}

export const BookDetail = ({ book, isLoading = false }: BookDetailProps) => {
  const { t } = useTranslation();

  if (isLoading) {
    return (
      <div className="container mx-auto p-6 max-w-6xl">
        <div className="animate-pulse">
          <div className="h-8 bg-gray-300 rounded w-3/4 mb-4"></div>
          <div className="flex flex-col lg:flex-row gap-8">
            <div className="w-full lg:w-80 h-96 bg-gray-300 rounded"></div>
            <div className="flex-1 space-y-4">
              <div className="h-6 bg-gray-300 rounded w-1/2"></div>
              <div className="h-4 bg-gray-300 rounded w-full"></div>
              <div className="h-4 bg-gray-300 rounded w-3/4"></div>
            </div>
          </div>
        </div>
      </div>
    )
  }

  const handleDownload = () => {
    const pdfUrl = getBookPdf(book.id)
    window.open(pdfUrl, '_blank')
  }

  const handleShare = () => {
    if (navigator.share) {
      navigator.share({
        title: book.title,
        text: `Check out this book: ${book.title} by ${book.author}`,
        url: window.location.href,
      })
    } else {
      // Fallback: copy URL to clipboard
      navigator.clipboard.writeText(window.location.href)
    }
  }

  // Get sample pages (first 4 pages)
  const samplePages = getBookPageList(book.id, 4, 5)

  return (
    <div className="container mx-auto p-6 max-w-6xl">
      {/* Header */}
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-foreground mb-2">{book.title}</h1>
        <p className="text-lg text-muted-foreground">{book.author}</p>
      </div>

      <div className="flex flex-col lg:flex-row gap-8">
        {/* Book Cover - Left Side */}
        <div className="w-full lg:w-80 flex-shrink-0">
          <Card className="overflow-hidden">
            <div className="relative">
              <img
                src={getBookCover(book.id, "lg")}
                alt={`Cover of ${book.title}`}
                className="w-full h-auto object-cover"
                onError={(e) => {
                  e.currentTarget.src = getBookCover(book.id, "md")
                }}
              />
            </div>
            <CardContent className="p-4">
              <div className="flex gap-2 mb-4">
                <Button 
                  onClick={handleDownload}
                  className="flex-1"
                  size="sm"
                >
                  <Download className="w-4 h-4 mr-2" />
                  {t('shared.download')}
                </Button>
                <Button 
                  onClick={handleShare}
                  variant="outline"
                  size="sm"
                >
                  <Share2 className="w-4 h-4" />
                </Button>
              </div>
              
              {/* Book Stats */}
              <div className="space-y-3">
                <div className="flex justify-between items-center">
                  <div className="flex items-center text-muted-foreground text-sm">
                    <Eye className="w-4 h-4 mr-2" />
                    <span>{t('labels.views')}</span>
                  </div>
                  <span className="font-medium">{book.view ?? 0}</span>
                </div>
                
                {(book?.rating ?? 0) > 0 && (
                  <div className="flex justify-between items-center">
                    <div className="flex items-center text-sm">
                      <Star className="w-4 h-4 text-amber-500 mr-2 fill-current" />
                      <span>{t('labels.rating')}</span>
                    </div>
                    <span className="font-medium text-amber-600 dark:text-amber-400">
                      {book.rating}/5
                    </span>
                  </div>
                )}
                
                <div className="flex justify-between items-center">
                  <div className="flex items-center text-muted-foreground text-sm">
                    <Heart className={`w-4 h-4 mr-2 ${book.favorite
                      ? 'text-red-500 fill-current'
                      : 'text-muted-foreground'
                    }`} />
                    <span>{t('labels.favorites')}</span>
                  </div>
                  <span className="font-medium">{book.favoriteTotal ?? 0}</span>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Book Details - Right Side */}
        <div className="flex-1 space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="text-xl">{t('labels.bookDetails')}</CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">
              {/* Description */}
              {book.description && (
                <div>
                  <h3 className="font-semibold text-foreground mb-2">{t('labels.description')}</h3>
                  <p className="text-muted-foreground leading-relaxed">{book.description}</p>
                </div>
              )}

              <Separator />

              {/* Categories and Tags */}
              <div>
                <h3 className="font-semibold text-foreground mb-3">{t('labels.categories')}</h3>
                <div className="flex flex-wrap gap-2">
                  <Badge variant="default" className="text-sm">
                    {book.category.name}
                  </Badge>
                  <Badge variant="outline" className="text-sm">
                    {book.grade.name} - {book.grade.grade}
                  </Badge>
                  <Badge variant="outline" className="text-sm">
                    {book.group.name}
                  </Badge>
                  <Badge 
                    variant={book.status === 'active' ? 'default' : 'secondary'} 
                    className="text-sm"
                  >
                    {book.status}
                  </Badge>
                </div>
              </div>

              <Separator />

              {/* Book Information */}
              <div>
                <h3 className="font-semibold text-foreground mb-3">{t('labels.bookInformation')}</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="flex items-center text-sm">
                    <BookOpen className="w-4 h-4 mr-3 text-muted-foreground" />
                    <span className="text-muted-foreground mr-2">{t('labels.pages')}:</span>
                    <span className="font-medium">{book.totalPages}</span>
                  </div>
                  
                  <div className="flex items-center text-sm">
                    <FileText className="w-4 h-4 mr-3 text-muted-foreground" />
                    <span className="text-muted-foreground mr-2">{t('labels.fileSize')}:</span>
                    <span className="font-medium">{formatFileSize(book.size)}</span>
                  </div>
                  
                  <div className="flex items-center text-sm">
                    <Calendar className="w-4 h-4 mr-3 text-muted-foreground" />
                    <span className="text-muted-foreground mr-2">{t('labels.publishedYear')}:</span>
                    <span className="font-medium">{book.publishedYear}</span>
                  </div>
                  
                  <div className="flex items-center text-sm">
                    <Calendar className="w-4 h-4 mr-3 text-muted-foreground" />
                    <span className="text-muted-foreground mr-2">{t('labels.addedOn')}:</span>
                    <span className="font-medium">
                      {new Date(book.createdAt).toLocaleDateString()}
                    </span>
                  </div>
                </div>
              </div>

              {book.updatedAt !== book.createdAt && (
                <>
                  <Separator />
                  <div className="text-sm text-muted-foreground">
                    {t('labels.lastUpdated')}: {new Date(book.updatedAt).toLocaleDateString()}
                  </div>
                </>
              )}
            </CardContent>
          </Card>

          <SamplePages book={book} samplePages={samplePages} />
        </div>
      </div>
    </div>
  )
}