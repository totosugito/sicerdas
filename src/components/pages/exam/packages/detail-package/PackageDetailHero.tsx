import { ExamPackage } from "@/api/exam/packages";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { useAppTranslation } from "@/lib/i18n-typed";
import { cn } from "@/lib/utils";
import { to_decimal_formatted } from "@/lib/my-utils";
import { Heart, Star, ImageOff } from "lucide-react";
import { useState } from "react";
import { getGradeColor } from "@/lib/exam-utils";

interface PackageDetailHeroProps {
  pkg: ExamPackage;
  isFavorite: boolean;
  onToggleFavorite: () => void;
  onRatingClick: () => void;
}

export const PackageDetailHero = ({
  pkg,
  isFavorite,
  onToggleFavorite,
  onRatingClick,
}: PackageDetailHeroProps) => {
  const { t } = useAppTranslation();
  const [imageError, setImageError] = useState(false);

  return (
    <div className="relative overflow-hidden rounded-3xl border bg-card p-6 shadow-sm">
      {/* Background Decoration */}
      <div className="absolute -right-20 -top-20 h-64 w-64 rounded-full bg-primary/5 blur-3xl" />
      <div className="absolute -bottom-20 -left-20 h-64 w-64 rounded-full bg-primary/5 blur-3xl" />

      <div className="relative flex flex-col gap-8 lg:flex-row">
        {/* Left Column: Thumbnail (Hero Header on Mobile) */}
        <div className="shrink-0 -mx-6 -mt-6 lg:m-0">
          <div className="group relative w-full max-h-[280px] overflow-hidden rounded-t-[22px] bg-muted shadow-sm lg:rounded-2xl lg:shadow-lg lg:w-[240px] lg:max-h-none">
            {imageError || !pkg.thumbnail ? (
              <div className="flex aspect-video items-center justify-center bg-accent/30 lg:aspect-[4/3]">
                <ImageOff className="h-12 w-12 text-muted-foreground/40" />
              </div>
            ) : (
              <img
                src={pkg.thumbnail}
                alt={pkg.title}
                className="aspect-video w-full max-h-[280px] object-cover transition-transform duration-700 group-hover:scale-110 lg:aspect-[4/3] lg:max-h-none"
                onError={() => setImageError(true)}
              />
            )}
            <div className="absolute inset-0 ring-1 ring-inset ring-black/5" />
          </div>
        </div>

        {/* Right Column: Title & Actions */}
        <div className="flex flex-1 flex-col">
          <div className="flex flex-row items-center justify-between gap-4">
            <div className="flex flex-wrap gap-2">
              {pkg.isNew && (
                <Badge
                  variant="secondary"
                  className="bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-300"
                >
                  {t(($) => $.labels.new)}
                </Badge>
              )}
              {pkg.category.name && (
                <Badge variant="outline" className="bg-primary/5 text-primary">
                  {pkg.category.name}
                </Badge>
              )}
              {pkg.grade.name && (
                <Badge
                  className={cn(
                    getGradeColor(pkg.grade.name),
                    "text-white border-none shadow-sm text-xs px-2 py-0.5 font-medium",
                  )}
                >
                  {pkg.grade.name}
                </Badge>
              )}
            </div>

            <div className="flex items-center gap-2 shrink-0">
              <Button
                variant="outline"
                size="icon"
                className={cn(
                  "h-10 w-10 shrink-0 rounded-xl transition-all",
                  isFavorite
                    ? "border-red-200 bg-red-50 text-red-500 hover:bg-red-100 dark:border-red-900/30 dark:bg-red-900/20"
                    : "hover:bg-accent",
                )}
                onClick={onToggleFavorite}
              >
                <Heart className={cn("h-5 w-5", isFavorite && "fill-current")} />
              </Button>
            </div>
          </div>

          <h1 className="mt-4 text-2xl font-black tracking-tight text-foreground sm:text-3xl lg:text-4xl">
            {pkg.title}
          </h1>

          <div className="mt-6 flex flex-wrap items-center gap-x-6 gap-y-4">
            <div
              className="flex items-center gap-3 cursor-pointer hover:bg-accent/50 p-2 -m-2 rounded-xl transition-colors group"
              onClick={onRatingClick}
            >
              <div className="flex items-center gap-2">
                <Star className="w-8 h-8 text-amber-500 fill-amber-500 group-hover:scale-110 transition-transform" />
                <div className="flex flex-col items-start leading-tight">
                  <span className="text-2xl font-black text-foreground tracking-tight">
                    {pkg.stats.rating.toFixed(1)}
                  </span>
                  <span className="text-xs text-muted-foreground font-bold uppercase tracking-widest mt-0.5">
                    {(pkg.stats.ratingCount || 0) < 1000
                      ? `${to_decimal_formatted(pkg.stats.ratingCount || 0, 0)} ${t(($) => $.labels.rating)}`
                      : `(${to_decimal_formatted(pkg.stats.ratingCount || 0, 0)})`}
                  </span>
                </div>
              </div>
            </div>

            <div className="h-10 w-px bg-border/50 max-sm:hidden" />

            <div className="flex flex-col leading-none">
              <span className="text-sm font-black text-foreground tracking-tight">
                {to_decimal_formatted(pkg.stats.viewCount || 0, 0)}
              </span>
              <span className="mt-1.5 text-xs font-bold uppercase tracking-widest text-muted-foreground/60">
                {t(($) => $.labels.views)}
              </span>
            </div>

            <div className="h-10 w-px bg-border/50 max-sm:hidden" />

            <div className="flex flex-col leading-none">
              <span className="text-sm font-black text-foreground tracking-tight">
                {to_decimal_formatted(pkg.stats.bookmarkCount || 0, 0)}
              </span>
              <span className="mt-1.5 text-xs font-bold uppercase tracking-widest text-muted-foreground/60">
                {t(($) => $.labels.favorites)}
              </span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
