import { SectionDetailItem } from "@/api/exam-package-sections/types";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Clock, Layers, Calendar, ArrowRight } from "lucide-react";
import { useAppTranslation } from "@/lib/i18n-typed";

interface SectionInfoCardProps {
  section: SectionDetailItem;
}

export function SectionInfoCard({ section }: SectionInfoCardProps) {
  const { t } = useAppTranslation();

  return (
    <Card className="shadow-sm border-primary/10 overflow-hidden">
      <CardContent className="py-0 pl-0">
        <div className="grid grid-cols-1 md:grid-cols-4 divide-y md:divide-y-0 md:divide-x">
          {/* Package Info */}
          <div className="p-5 flex items-start gap-4">
            <div className="p-2.5 rounded-xl bg-primary/10 text-primary shrink-0">
              <Layers className="h-5 w-5" />
            </div>
            <div className="space-y-1 overflow-hidden">
              <p className="text-[11px] font-bold uppercase tracking-wider text-muted-foreground/80">
                {t(($) => $.exam.sections.formPackage)}
              </p>
              <p className="font-semibold text-sm line-clamp-2 leading-tight">
                {section.packageName || "-"}
              </p>
              {section.groupName && (
                <div className="flex items-center gap-1.5 mt-1.5">
                  <Badge
                    variant="outline"
                    className="h-5 text-[10px] bg-primary/5 border-primary/20"
                  >
                    {section.groupName}
                  </Badge>
                </div>
              )}
            </div>
          </div>

          {/* Status & Order */}
          <div className="p-5 flex items-start gap-4">
            <div className="p-2.5 rounded-xl bg-orange-500/10 text-orange-600 shrink-0">
              <ArrowRight className="h-5 w-5" />
            </div>
            <div className="space-y-1">
              <p className="text-[11px] font-bold uppercase tracking-wider text-muted-foreground/80">
                {t(($) => $.exam.sections.detail.infoCard.statusAndOrder)}
              </p>
              <div className="flex items-center gap-2">
                <Badge variant="outline" className="h-6 border-primary/30 text-primary">
                  #{section.order}
                </Badge>
                <Badge variant={section.isActive ? "success" : "secondary"} className="h-6">
                  {section.isActive
                    ? t(($) => $.exam.sections.active)
                    : t(($) => $.exam.sections.inactive)}
                </Badge>
              </div>
            </div>
          </div>

          {/* Duration */}
          <div className="p-5 flex items-start gap-4">
            <div className="p-2.5 rounded-xl bg-blue-500/10 text-blue-600 shrink-0">
              <Clock className="h-5 w-5" />
            </div>
            <div className="space-y-1">
              <p className="text-[11px] font-bold uppercase tracking-wider text-muted-foreground/80">
                {t(($) => $.exam.sections.table.columns.duration)}
              </p>
              <p className="font-bold text-lg leading-none">
                {section.durationMinutes}{" "}
                <span className="text-xs font-normal text-muted-foreground">
                  {t(($) => $.exam.sections.detail.infoCard.minutes)}
                </span>
              </p>
            </div>
          </div>

          {/* Timestamps */}
          <div className="p-5 flex items-start gap-4 bg-muted/30">
            <div className="p-2.5 rounded-xl bg-muted text-muted-foreground shrink-0">
              <Calendar className="h-5 w-5" />
            </div>
            <div className="space-y-1.5 overflow-hidden w-full">
              <div className="flex items-center justify-between gap-4">
                <span className="text-[10px] text-muted-foreground whitespace-nowrap">
                  {t(($) => $.exam.sections.detail.infoCard.createdAt)}
                </span>
                <span className="text-xs font-medium tabular-nums truncate">
                  {new Date(section.createdAt).toLocaleDateString("id-ID", { dateStyle: "medium" })}
                </span>
              </div>
              <div className="flex items-center justify-between gap-4">
                <span className="text-[10px] text-muted-foreground whitespace-nowrap">
                  {t(($) => $.exam.sections.detail.infoCard.updatedAt)}
                </span>
                <span className="text-xs font-medium tabular-nums truncate font-bold text-primary">
                  {new Date(section.updatedAt).toLocaleDateString("id-ID", { dateStyle: "medium" })}
                </span>
              </div>
            </div>
          </div>
        </div>

        {section.description && (
          <div className="p-5 border-t bg-muted/10">
            <div className="flex flex-col gap-2">
              <span className="text-[11px] font-bold uppercase tracking-wider text-muted-foreground/80 flex items-center gap-2">
                <Layers className="h-4 w-4" />
                {t(($) => $.exam.sections.formDescription)}
              </span>
              <p className="text-sm whitespace-pre-wrap leading-relaxed text-muted-foreground">
                {section.description}
              </p>
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
