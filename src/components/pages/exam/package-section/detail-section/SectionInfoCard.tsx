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
      <CardContent className="p-0">
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
                <Badge variant={section.isActive ? "success" : "secondary"} className="h-6">
                  {section.isActive
                    ? t(($) => $.exam.sections.active)
                    : t(($) => $.exam.sections.inactive)}
                </Badge>
                <Badge variant="outline" className="h-6 border-primary/30 text-primary">
                  #{section.order}
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
      </CardContent>
    </Card>
  );
}
