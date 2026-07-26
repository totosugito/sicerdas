import React, { useState } from "react";
import { useAppTranslation } from "@/lib/i18n-typed";
import { Badge } from "@/components/ui/badge";
import { Card } from "@/components/ui/card";
import { Clock, Layers, ImageIcon } from "lucide-react";
import { PackageFormValues } from "./types";
import { durationOnMinutes } from "@/constants/app-enum";

type PackageHeroPreviewProps = {
  values: Partial<PackageFormValues>;
  categoryName?: string;
  gradeName?: string;
  previewUrl?: string;
};

export function PackageHeroPreview({
  values,
  categoryName,
  gradeName,
  previewUrl,
}: PackageHeroPreviewProps) {
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
    <div className="w-full space-y-4">
      <div className="relative w-full aspect-[21/9] rounded-2xl overflow-hidden bg-muted shadow-2xl border border-border/40 flex items-center justify-center">
        {displayImage && !hasError ? (
          <img
            src={displayImage}
            alt={displayTitle}
            className="w-full h-full object-cover"
            onError={() => setHasError(true)}
          />
        ) : (
          <div className="w-full h-full bg-muted/50 dark:bg-muted/20 flex items-center justify-center border-b">
            <div className="flex flex-col items-center gap-4 opacity-50">
              <div className="bg-foreground/5 rounded-full p-6 border border-foreground/10">
                <ImageIcon className="h-12 w-12 text-foreground" />
              </div>
              <div className="text-center">
                <div className="h-1 w-12 bg-primary mx-auto rounded-full" />
              </div>
            </div>
          </div>
        )}

        {displayImage && !hasError && (
          <>
            <div className="absolute inset-0 bg-gradient-to-r from-black/90 via-black/40 to-transparent z-10" />
            <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-transparent z-10" />
          </>
        )}

        <div
          className={`absolute inset-0 p-6 md:p-10 flex flex-col justify-end max-w-2xl z-20 ${displayImage && !hasError ? "text-white drop-shadow-lg" : "text-foreground"}`}
        >
          <div className="flex items-center gap-2 mb-3">
            <Badge
              className={`rounded-full px-4 backdrop-blur-md shadow-lg ${displayImage && !hasError ? "bg-primary border-0" : "bg-primary/10 text-primary border-primary/20 hover:bg-primary/20"}`}
            >
              {displayCategory}
            </Badge>
            <Badge
              variant="outline"
              className={`rounded-full px-4 backdrop-blur-md shadow-lg ${displayImage && !hasError ? "text-white border-white/40 bg-white/5" : "text-muted-foreground border-border"}`}
            >
              {displayGrade}
            </Badge>
          </div>
          <h2
            className={`text-2xl md:text-3xl font-extrabold mb-4 tracking-tight leading-tight ${displayImage && !hasError ? "drop-shadow-md" : ""}`}
          >
            {displayTitle}
          </h2>
          <div
            className={`flex items-center gap-6 text-sm font-medium ${displayImage && !hasError ? "text-white/90 drop-shadow-md" : "text-muted-foreground"}`}
          >
            <span className="flex items-center gap-2">
              <Clock className="h-4 w-4 text-primary" /> {duration}
            </span>
            <span className="flex items-center gap-2">
              <Layers className="h-4 w-4 text-primary" />{" "}
              {t(($) => $.exam.packages.form.preview.multiSections)}
            </span>
          </div>
        </div>
      </div>

      {/* Mocking the rest of the page for realism */}
      <div className="grid grid-cols-3 gap-4">
        <Card className="p-4 bg-muted/30 border-dashed border-border flex flex-col gap-2 items-center justify-center opacity-40">
          <div className="h-2 w-2/3 bg-foreground/20 rounded-full" />
          <div className="h-2 w-full bg-foreground/10 rounded-full" />
        </Card>
        <Card className="p-4 bg-muted/30 border-dashed border-border flex flex-col gap-2 items-center justify-center opacity-40">
          <div className="h-2 w-2/3 bg-foreground/20 rounded-full" />
          <div className="h-2 w-full bg-foreground/10 rounded-full" />
        </Card>
        <Card className="p-4 bg-muted/30 border-dashed border-border flex flex-col gap-2 items-center justify-center opacity-40">
          <div className="h-2 w-2/3 bg-foreground/20 rounded-full" />
          <div className="h-2 w-full bg-foreground/10 rounded-full" />
        </Card>
      </div>
    </div>
  );
}
