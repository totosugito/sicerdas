import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { useTranslation } from "react-i18next"
import { BookDetil } from "@/api/book/book-detail"
import { Image, ImageOff, X, ChevronLeft, ChevronRight } from "lucide-react"
import { useState } from "react"
import {
  Dialog,
  DialogClose,
  DialogContent,
  DialogTitle,
} from "@/components/ui/dialog"

export const SamplePages = ({ book, samplePages }: { book: BookDetil, samplePages: any }) => {
  const { t } = useTranslation()
  const [selectedIndex, setSelectedIndex] = useState<number | null>(null)
  const [invalidIndices, setInvalidIndices] = useState<Set<number>>(new Set())

  const handleImageError = (index: number) => {
    setInvalidIndices((prev) => {
      const newSet = new Set(prev)
      newSet.add(index)
      return newSet
    })
  }

  const handleNext = () => {
    if (selectedIndex === null) return
    let next = selectedIndex + 1
    while (next < samplePages.length && invalidIndices.has(next)) {
      next++
    }
    if (next < samplePages.length) setSelectedIndex(next)
  }

  const handlePrev = () => {
    if (selectedIndex === null) return
    let prev = selectedIndex - 1
    while (prev >= 0 && invalidIndices.has(prev)) {
      prev--
    }
    if (prev >= 0) setSelectedIndex(prev)
  }

  const hasNext = () => {
    if (selectedIndex === null) return false
    let next = selectedIndex + 1
    while (next < samplePages.length) {
      if (!invalidIndices.has(next)) return true
      next++
    }
    return false
  }

  const hasPrev = () => {
    if (selectedIndex === null) return false
    let prev = selectedIndex - 1
    while (prev >= 0) {
      if (!invalidIndices.has(prev)) return true
      prev--
    }
    return false
  }

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
              !invalidIndices.has(index) && (
                <div
                  key={index}
                  className="group"
                >
                  <div className="w-36 h-42 overflow-hidden rounded-lg border border-border/50 bg-card/50 backdrop-blur-sm hover:shadow-lg transition-all duration-300">
                    <SamplePageThumbnail
                      src={pageUrl.thumb}
                      alt={`Page ${index + 1} of ${book.title}`}
                      onClick={() => setSelectedIndex(index)}
                      onLoadError={() => handleImageError(index)}
                    />
                  </div>
                </div>
              )
            ))}
          </div>
        </CardContent>
      </Card>

      <Dialog open={selectedIndex !== null} onOpenChange={(open) => !open && setSelectedIndex(null)}>
        <DialogContent showCloseButton={false} aria-describedby={undefined} className="w-full p-0 border-none shadow-none sm:max-w-[80vh] bg-transparent">
          <DialogTitle className="sr-only"></DialogTitle>
          <div className="flex items-center justify-center w-full gap-4 w-full px-8">
            {selectedIndex !== null && samplePages[selectedIndex] && (
              <>
                <button
                  disabled={!hasPrev()}
                  onClick={handlePrev}
                  className="p-2 bg-black/50 hover:bg-black/70 dark:bg-white/50 dark:hover:bg-white/70 text-white rounded-full disabled:opacity-0 transition-opacity shrink-0"
                >
                  <ChevronLeft className="w-8 h-8" />
                </button>

                <div className="relative">
                  <img
                    src={samplePages[selectedIndex].image}
                    alt={`Page ${selectedIndex + 1}`}
                    className="h-[70vh] w-full object-cover rounded-lg shadow-2xl"
                  />
                  <button
                    onClick={() => setSelectedIndex(null)}
                    className="absolute top-2 right-2 bg-black/50 hover:bg-black/70 text-white rounded-full p-2"
                  >
                    <X className="w-4 h-4" />
                  </button>
                </div>

                <button
                  disabled={!hasNext()}
                  onClick={handleNext}
                  className="p-2 bg-black/50 hover:bg-black/70 dark:bg-white/50 dark:hover:bg-white/70 text-white rounded-full disabled:opacity-0 transition-opacity shrink-0"
                >
                  <ChevronRight className="w-8 h-8" />
                </button>
              </>
            )}
          </div>
        </DialogContent>
      </Dialog>

    </>
  )
}

function SamplePageThumbnail({ src, alt, onClick, onLoadError }: { src: string, alt: string, onClick: () => void, onLoadError?: () => void }) {
  const [error, setError] = useState(false)

  if (error) {
    return (
      <div className="w-full h-full flex items-center justify-center bg-slate-100 dark:bg-slate-800/50 cursor-default">
        <ImageOff className="w-8 h-8 text-slate-400 dark:text-slate-600" />
      </div>
    )
  }

  return (
    <img
      src={src}
      alt={alt}
      className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500 cursor-pointer"
      onError={() => {
        setError(true)
        onLoadError?.()
      }}
      onClick={onClick}
    />
  )
}