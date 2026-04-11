import React, { useState } from "react";
import { useAppTranslation } from "@/lib/i18n-typed";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Clock, BookOpen, Layers, Zap, ImageIcon } from "lucide-react";
import { PackageFormValues } from "./types";
import { durationOnMinutes } from "@/constants/app-enum";

type PackageCardPreviewProps = {
  values: Partial<PackageFormValues>;
  categoryName?: string;
  gradeName?: string;
  previewUrl?: string;
};

export function PackageCardPreview({
  values,
  categoryName,
  gradeName,
  previewUrl,
}: PackageCardPreviewProps) {
  const { t } = useAppTranslation();
  const [hasError, setHasError] = useState(false);

  const displayImage = previewUrl || values.thumbnail;
  const displayTitle = values.title || t(($) => $.exam.packages.form.preview.titlePlaceholder);
  const displayCategory =
    categoryName || t(($) => $.exam.packages.form.preview.categoryPlaceholder);
  const displayGrade = gradeName || t(($) => $.exam.packages.form.preview.gradePlaceholder);
  const duration =
    durationOnMinutes.find((d) => d.value === values.durationMinutes)?.label ||
    t(($) => $.exam.packages.form.preview.durationPlaceholder);

  return (
    <Card className="overflow-hidden w-full max-w-[340px] mx-auto bg-background shadow-xl border-border/50 group hover:border-primary/50 transition-all duration-300 py-0">
      {/* Aspect Ratio 16:9 for Card */}
      <div className="aspect-video relative overflow-hidden bg-muted flex items-center justify-center">
        {displayImage && !hasError ? (
          <img
            src={displayImage}
            alt={displayTitle}
            className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110"
            onError={() => setHasError(true)}
          />
        ) : (
          <div className="w-full h-full bg-muted/50 dark:bg-muted/20 flex items-center justify-center p-6 text-center border-b">
            <div className="space-y-2 opacity-50">
              <div className="bg-foreground/5 rounded-full p-3 w-fit mx-auto">
                <ImageIcon className="h-6 w-6 text-foreground" />
              </div>
              <p className="text-[10px] text-foreground font-bold uppercase tracking-widest">
                {t(($) => $.exam.packages.form.preview.title)}
              </p>
            </div>
          </div>
        )}
        {displayImage && !hasError && (
          <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent opacity-90" />
        )}

        {/* Badges */}
        <div className="absolute top-2 left-2 flex flex-col gap-1">
          <Badge className="bg-primary/90 text-[10px] h-5 px-1.5 uppercase font-bold tracking-wider">
            {displayCategory}
          </Badge>
          {values.requiredTier && values.requiredTier !== "free" && (
            <Badge
              variant="secondary"
              className="bg-amber-500 text-white border-0 text-[10px] h-5 px-1.5 uppercase font-bold"
            >
              <Zap className="h-2.5 w-2.5 mr-1 fill-current" /> {values.requiredTier}
            </Badge>
          )}
        </div>
      </div>

      <div className="p-4 space-y-3">
        <h4 className="font-bold text-base leading-tight line-clamp-2 h-10 group-hover:text-primary transition-colors text-foreground">
          {displayTitle}
        </h4>

        <div className="flex flex-wrap items-center gap-y-2 gap-x-3 text-[11px] text-muted-foreground font-medium">
          <div className="flex items-center gap-1">
            <Clock className="h-3 w-3 text-primary/70" />
            {duration}
          </div>
          <div className="flex items-center gap-1">
            <BookOpen className="h-3 w-3 text-primary/70" />
            {displayGrade}
          </div>
          <div className="flex items-center gap-1">
            <Layers className="h-3 w-3 text-primary/70" />
            {t(($) => $.exam.packages.form.preview.new)}
          </div>
        </div>

        <button className="w-full h-9 rounded-full text-xs font-bold border border-primary/20 hover:bg-primary hover:text-white transition-all bg-transparent pointer-events-none">
          {t(($) => $.exam.packages.form.preview.viewDetail)}
        </button>
      </div>
    </Card>
  );
}
