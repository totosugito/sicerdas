import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { useTranslation } from "react-i18next"
import { BookDetil } from "@/api/book/book-detail"
import { Image, ImageOff, X } from "lucide-react"
import { useState } from "react"
import {
  Dialog,
  DialogContent,
} from "@/components/ui/dialog"

export const SamplePages = ({ book, samplePages }: { book: BookDetil, samplePages: any }) => {
  const { t } = useTranslation()
  const [selectedImage, setSelectedImage] = useState<string | null>(null)

  return (
    <>
      <Card>
        <CardHeader>
          <CardTitle className="text-xl flex items-center">
            <Image className="w-5 h-5 mr-2" />
            {t('book.detail.samplePages')}
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex flex-row flex-wrap gap-4">
            {samplePages.map((pageUrl: any, index: number) => (
              <div
                key={index}
                className="group cursor-pointer"
                onClick={() => setSelectedImage(pageUrl.image)}
              >
                <div className="w-36 h-42 overflow-hidden rounded-lg border border-border/50 bg-card/50 backdrop-blur-sm hover:shadow-lg transition-all duration-300">
                  <SamplePageThumbnail
                    src={pageUrl.thumb}
                    alt={`Page ${index + 1} of ${book.title}`}
                  />
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      <Dialog open={!!selectedImage} onOpenChange={(open) => !open && setSelectedImage(null)}>
        <DialogContent className="max-w-[90vh] sm:max-w-[90vh] w-full p-0 bg-red-300 border-none shadow-none">
          <div className="relative flex items-center justify-center">
            {selectedImage && (
              <div className="relative">
                <img
                  src={selectedImage}
                  alt="Page Preview"
                  className="max-w-full max-h-[80vh] object-contain rounded-lg shadow-2xl"
                />
                <button
                  onClick={() => setSelectedImage(null)}
                  className="absolute top-2 right-2 bg-black/50 hover:bg-black/70 text-white rounded-full p-2"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>
            )}
          </div>
        </DialogContent>
      </Dialog>

    </>
  )
}

function SamplePageThumbnail({ src, alt }: { src: string, alt: string }) {
  const [error, setError] = useState(false)

  if (error) {
    return (
      <div className="w-full h-full flex items-center justify-center bg-slate-100 dark:bg-slate-800/50">
        <ImageOff className="w-8 h-8 text-slate-400 dark:text-slate-600" />
      </div>
    )
  }

  return (
    <img
      src={src}
      alt={alt}
      className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
      onError={() => setError(true)}
    />
  )
}