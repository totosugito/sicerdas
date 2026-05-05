import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { useAppTranslation } from "@/lib/i18n-typed";
import { BookDetil } from "@/api/book/book-detail";
import { Image, ImageOff, X, ChevronLeft, ChevronRight } from "lucide-react";
import { useState, useMemo } from "react";
import { Dialog, DialogContent, DialogTitle } from "@/components/ui/dialog";
import { APP_CONFIG } from "@/constants/config";

export const SamplePages = ({ book }: { book: BookDetil }) => {
  const { t } = useAppTranslation();
  const [selectedIndex, setSelectedIndex] = useState<number | null>(null);
  const [invalidIndices, setInvalidIndices] = useState<Set<number>>(new Set());

  const samplePages = useMemo(() => {
    const pages = [];
    for (let i = 1; i <= APP_CONFIG.book.samplePages; i++) {
      const paddedIndex = String(i).padStart(4, "0");
      pages.push({
        lg: `${book.samples.lg}${paddedIndex}_lg.jpg`,
        xs: `${book.samples.xs}${paddedIndex}_xs.jpg`,
      });
    }
    return pages;
  }, [book]);

  const handleImageError = (index: number) => {
    setInvalidIndices((prev) => {
      const newSet = new Set(prev);
      newSet.add(index);
      return newSet;
    });
  };

  const handleNext = () => {
    if (selectedIndex === null) return;
    let next = selectedIndex + 1;
    while (next < samplePages.length && invalidIndices.has(next)) {
      next++;
    }
    if (next < samplePages.length) setSelectedIndex(next);
  };

  const handlePrev = () => {
    if (selectedIndex === null) return;
    let prev = selectedIndex - 1;
    while (prev >= 0 && invalidIndices.has(prev)) {
      prev--;
    }
    if (prev >= 0) setSelectedIndex(prev);
  };

  const hasNext = () => {
    if (selectedIndex === null) return false;
    let next = selectedIndex + 1;
    while (next < samplePages.length) {
      if (!invalidIndices.has(next)) return true;
      next++;
    }
    return false;
  };

  const hasPrev = () => {
    if (selectedIndex === null) return false;
    let prev = selectedIndex - 1;
    while (prev >= 0) {
      if (!invalidIndices.has(prev)) return true;
      prev--;
    }
    return false;
  };

  return (
    <>
      <Card className="w-full overflow-hidden">
        <CardHeader className="bg-muted/30 border-b px-6 py-4">
          <CardTitle className="text-lg font-bold flex items-center gap-2.5">
            <div className="p-2 bg-primary/10 rounded-lg">
              <Image className="w-5 h-5 text-primary" />
            </div>
            <span>{t(($) => $.book.detail.samplePages)}</span>
          </CardTitle>
        </CardHeader>
        <CardContent className="p-6">
          <div className="flex flex-row flex-wrap gap-6 justify-center sm:justify-start">
            {samplePages.map(
              (pageUrl: { xs: string; lg: string }, index: number) =>
                !invalidIndices.has(index) && (
                  <div key={index} className="group relative">
                    <div
                      className="w-32 sm:w-40 aspect-[3/4] overflow-hidden rounded-xl border border-border/60 bg-white dark:bg-slate-900 shadow-sm hover:shadow-xl hover:border-primary/40 transition-all duration-500 cursor-pointer relative"
                      onClick={() => setSelectedIndex(index)}
                    >
                      <SamplePageThumbnail
                        src={pageUrl.xs}
                        alt={`Page ${index + 1} of ${book.title}`}
                        onLoadError={() => handleImageError(index)}
                      />
                      <div className="absolute inset-0 bg-primary/0 group-hover:bg-primary/5 transition-colors duration-500" />
                      <div className="absolute bottom-2 right-2 opacity-0 group-hover:opacity-100 transition-opacity duration-500">
                        <div className="bg-white/90 dark:bg-slate-800/90 backdrop-blur-md p-1.5 rounded-lg shadow-lg border border-primary/20">
                          <Image className="w-3.5 h-3.5 text-primary" />
                        </div>
                      </div>
                    </div>
                    <div className="mt-2 text-center">
                      <span className="text-[10px] font-bold text-muted-foreground uppercase tracking-wider opacity-0 group-hover:opacity-100 transition-opacity duration-500">
                         {t(($) => $.book.info.pages)} {index + 1}
                      </span>
                    </div>
                  </div>
                ),
            )}
          </div>
        </CardContent>
      </Card>

      <Dialog
        open={selectedIndex !== null}
        onOpenChange={(open) => !open && setSelectedIndex(null)}
      >
        <DialogContent
          showCloseButton={false}
          aria-describedby={undefined}
          className="max-w-[95vw] sm:max-w-[90vw] md:max-w-[85vw] lg:max-w-[1200px] p-0 border-none shadow-none bg-transparent"
        >
          <DialogTitle className="sr-only">{t(($) => $.book.detail.samplePageViewer)}</DialogTitle>
          <div className="flex items-center justify-center w-full gap-4 px-4 md:px-8">
            {selectedIndex !== null && samplePages[selectedIndex] && (
              <>
                <button
                  disabled={!hasPrev()}
                  onClick={handlePrev}
                  className="group/btn p-3 md:p-4 bg-slate-900/60 hover:bg-slate-900/80 backdrop-blur-md text-white rounded-full border border-white/10 disabled:opacity-0 transition-all duration-300 hover:scale-110 active:scale-95 shadow-xl shrink-0"
                >
                  <ChevronLeft className="w-6 h-6 md:w-8 md:h-8 group-hover/btn:-translate-x-0.5 transition-transform" />
                </button>

                <div className="relative max-h-[90vh] overflow-hidden rounded-2xl shadow-[0_0_50px_rgba(0,0,0,0.5)] border border-white/10 bg-slate-900/50 backdrop-blur-sm">
                  <img
                    src={samplePages[selectedIndex].lg}
                    alt={`Page ${selectedIndex + 1}`}
                    className="max-h-[90vh] w-auto object-contain select-none transition-all duration-500"
                  />
                  
                  <div className="absolute top-4 right-4 z-50">
                    <button
                      onClick={() => setSelectedIndex(null)}
                      className="p-2.5 bg-slate-900/60 hover:bg-slate-900/80 backdrop-blur-md text-white rounded-xl border border-white/10 transition-all duration-300 hover:rotate-90 shadow-xl"
                    >
                      <X className="w-5 h-5" />
                    </button>
                  </div>

                  <div className="absolute bottom-6 left-1/2 -translate-x-1/2 z-50">
                    <div className="px-4 py-2 bg-slate-900/60 backdrop-blur-md text-white rounded-full border border-white/10 text-xs font-bold tracking-widest uppercase shadow-xl">
                      {selectedIndex + 1} / {samplePages.length}
                    </div>
                  </div>
                </div>

                <button
                  disabled={!hasNext()}
                  onClick={handleNext}
                  className="group/btn p-3 md:p-4 bg-slate-900/60 hover:bg-slate-900/80 backdrop-blur-md text-white rounded-full border border-white/10 disabled:opacity-0 transition-all duration-300 hover:scale-110 active:scale-95 shadow-xl shrink-0"
                >
                  <ChevronRight className="w-6 h-6 md:w-8 md:h-8 group-hover/btn:translate-x-0.5 transition-transform" />
                </button>
              </>
            )}
          </div>
        </DialogContent>
      </Dialog>
    </>
  );
};

function SamplePageThumbnail({
  src,
  alt,
  onClick,
  onLoadError,
}: {
  src: string;
  alt: string;
  onClick?: () => void;
  onLoadError?: () => void;
}) {
  const [error, setError] = useState(false);

  if (error) {
    return (
      <div className="w-full h-full flex items-center justify-center bg-slate-100 dark:bg-slate-800/50 cursor-default">
        <ImageOff className="w-8 h-8 text-slate-400 dark:text-slate-600" />
      </div>
    );
  }

  return (
    <img
      src={src}
      alt={alt}
      className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-700 ease-out cursor-pointer"
      onError={() => {
        setError(true);
        onLoadError?.();
      }}
      onClick={onClick}
      loading="lazy"
    />
  );
}
