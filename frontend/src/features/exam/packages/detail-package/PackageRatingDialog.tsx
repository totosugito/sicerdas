import { useState, useEffect } from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Star } from "lucide-react";
import { cn } from "@/lib/utils";
import { useAppTranslation } from "@/lib/i18n-typed";

interface PackageRatingDialogProps {
  isOpen: boolean;
  onOpenChange: (open: boolean) => void;
  onRate: (rating: number) => Promise<void>;
  initialRating?: number;
  packageTitle?: string;
}

export function PackageRatingDialog({
  isOpen,
  onOpenChange,
  onRate,
  initialRating = 0,
  packageTitle,
}: PackageRatingDialogProps) {
  const { t } = useAppTranslation();
  const [rating, setRating] = useState(initialRating);
  const [hoveredRating, setHoveredRating] = useState(0);
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    if (isOpen) {
      setRating(initialRating);
    }
  }, [isOpen, initialRating]);

  const handleSubmit = async () => {
    if (rating === 0) return;
    setIsSubmitting(true);
    try {
      await onRate(rating);
      onOpenChange(false);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle className="text-xl font-bold">
            {t(($) => $.exam.packages.rating.title)}
          </DialogTitle>
          <DialogDescription className="pt-2">
            {t(($) => $.exam.packages.rating.description, { title: packageTitle })}
          </DialogDescription>
        </DialogHeader>

        <div className="flex flex-col items-center justify-center py-10">
          <div className="flex items-center gap-2">
            {[1, 2, 3, 4, 5].map((star) => (
              <button
                key={star}
                type="button"
                className="transition-transform active:scale-90"
                onMouseEnter={() => setHoveredRating(star)}
                onMouseLeave={() => setHoveredRating(0)}
                onClick={() => setRating(star)}
              >
                <Star
                  className={cn(
                    "w-10 h-10 transition-colors duration-200",
                    (hoveredRating || rating) >= star
                      ? "fill-amber-500 text-amber-500"
                      : "text-slate-200 dark:text-slate-700",
                  )}
                />
              </button>
            ))}
          </div>
          <p className="mt-4 text-sm font-semibold text-slate-500">
            {rating > 0
              ? t(($) => $.exam.packages.rating.selected, { count: rating })
              : t(($) => $.exam.packages.rating.prompt)}
          </p>
        </div>

        <DialogFooter>
          <Button
            variant="outline"
            onClick={() => onOpenChange(false)}
            disabled={isSubmitting}
            className="flex-1 sm:flex-none"
          >
            {t(($) => $.labels.cancel)}
          </Button>
          <Button
            onClick={handleSubmit}
            disabled={rating === 0 || isSubmitting}
            className="flex-1 sm:flex-none"
          >
            {isSubmitting ? t(($) => $.labels.saving) : t(($) => $.labels.save)}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
