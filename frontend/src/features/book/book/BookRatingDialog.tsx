import { useState } from "react";
import { Star } from "lucide-react";
import { useAppTranslation } from "@/lib/i18n-typed";
import { cn } from "@/lib/utils";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";

interface BookRatingDialogProps {
  isOpen: boolean;
  onOpenChange: (open: boolean) => void;
  onRate: (rating: number) => Promise<void>;
  initialRating?: number;
  bookTitle?: string;
}

export const BookRatingDialog = ({
  isOpen,
  onOpenChange,
  onRate,
  initialRating = 0,
  bookTitle,
}: BookRatingDialogProps) => {
  const { t } = useAppTranslation();
  const [hoverRating, setHoverRating] = useState(0);
  const [selectedRating, setSelectedRating] = useState(initialRating);
  const [isPending, setIsPending] = useState(false);

  const handleRate = async (rating: number) => {
    setSelectedRating(rating);
  };

  const handleSubmit = async () => {
    if (selectedRating === 0) return;
    setIsPending(true);
    try {
      await onRate(selectedRating);
      onOpenChange(false);
    } finally {
      setIsPending(false);
    }
  };

  const ratingLevels: Record<number, string> = {
    1: t(($) => $.book.rating.levels[1]),
    2: t(($) => $.book.rating.levels[2]),
    3: t(($) => $.book.rating.levels[3]),
    4: t(($) => $.book.rating.levels[4]),
    5: t(($) => $.book.rating.levels[5]),
  };

  const currentDescription = ratingLevels[hoverRating || selectedRating] || "";

  return (
    <Dialog open={isOpen} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[420px] p-0 overflow-hidden border-none shadow-2xl bg-white dark:bg-slate-950">
        <DialogHeader className="pt-8 px-6 pb-2">
          <DialogTitle className="text-2xl font-black text-center text-slate-900 dark:text-white leading-tight">
            {t(($) => $.book.rating.giveRating)}
          </DialogTitle>
          {bookTitle && (
            <p className="text-center text-sm text-slate-500 dark:text-slate-400 font-medium mt-1 line-clamp-1">
              {bookTitle}
            </p>
          )}
        </DialogHeader>

        <div className="flex flex-col items-center py-10 px-6">
          <div className="flex items-center gap-3">
            {[1, 2, 3, 4, 5].map((star) => (
              <button
                key={star}
                type="button"
                onMouseEnter={() => setHoverRating(star)}
                onMouseLeave={() => setHoverRating(0)}
                onClick={() => handleRate(star)}
                className={cn(
                  "relative group focus:outline-none transition-all duration-300",
                  star <= (hoverRating || selectedRating)
                    ? "scale-110"
                    : "scale-100 hover:scale-105",
                  isPending && "opacity-50 cursor-not-allowed",
                )}
                disabled={isPending}
              >
                <Star
                  className={cn(
                    "w-12 h-12 transition-all duration-300",
                    star <= (hoverRating || selectedRating)
                      ? "text-amber-500 fill-amber-500 drop-shadow-[0_0_8px_rgba(245,158,11,0.4)]"
                      : "text-slate-200 dark:text-slate-800",
                  )}
                />
              </button>
            ))}
          </div>

          <div className="h-8 mt-6 flex items-center justify-center">
            {currentDescription && (
              <span className="text-lg font-bold text-amber-600 dark:text-amber-400 animate-in fade-in zoom-in duration-300">
                {currentDescription}
              </span>
            )}
          </div>
        </div>

        <div className="flex items-center gap-3 p-6 bg-slate-50 dark:bg-slate-900/50 border-t border-slate-100 dark:border-slate-800/50">
          <Button
            variant="ghost"
            className="flex-1 font-bold text-slate-600 dark:text-slate-400"
            onClick={() => onOpenChange(false)}
            disabled={isPending}
          >
            {t(($) => $.labels.cancel)}
          </Button>
          <Button
            className="flex-1 font-bold shadow-lg shadow-primary/20"
            disabled={selectedRating === 0 || isPending}
            onClick={handleSubmit}
          >
            {isPending ? t(($) => $.labels.saving) : t(($) => $.labels.submit)}
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
};
