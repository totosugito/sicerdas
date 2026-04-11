import React from "react";
import { ExamPackageSection } from "@/api/exam-package-sections";
import { useAppTranslation } from "@/lib/i18n-typed";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import {
  Clock,
  Layers,
  MoreHorizontal,
  Pencil,
  Trash2,
  CalendarDays,
  HelpCircle,
  Hash,
} from "lucide-react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { string_to_locale_date } from "@/lib/my-utils";
import { cn } from "@/lib/utils";

interface SectionCardListItemProps {
  section: ExamPackageSection;
  onEdit: (section: ExamPackageSection) => void;
  onDelete: (section: ExamPackageSection) => void;
}

export function SectionCardListItem({ section, onEdit, onDelete }: SectionCardListItemProps) {
  const { t } = useAppTranslation();

  return (
    <Card className="group overflow-hidden border-border/50 hover:border-primary/50 hover:shadow-xl transition-all duration-300 bg-card/50 backdrop-blur-sm flex flex-col h-full py-0">
      {/* Abstract Header Area (Since no thumbnails) */}
      <div className="relative h-24 overflow-hidden bg-muted/30">
        <div className="absolute inset-0 bg-gradient-to-br from-primary/5 to-primary/20" />
        <div className="absolute right-[-20px] top-[-20px] opacity-10">
          <Layers className="h-32 w-32 rotate-12" />
        </div>

        {/* Status Badge Overlay */}
        <div className="absolute top-3 left-3 flex flex-col gap-2">
          <Badge
            variant={section.isActive ? "success" : "secondary"}
            className="shadow-sm backdrop-blur-md"
          >
            {section.isActive
              ? t(($) => $.exam.sections.active)
              : t(($) => $.exam.sections.inactive)}
          </Badge>
        </div>

        {/* Action Overlay for hover (Quick Edit) */}
        <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-2">
          <Button
            size="sm"
            variant="secondary"
            className="rounded-full h-9 px-4 font-bold text-xs gap-2"
            onClick={() => onEdit(section)}
          >
            <Pencil className="h-3.5 w-3.5" />
            {t(($) => $.exam.sections.table.actions.edit)}
          </Button>
        </div>
      </div>

      <CardContent className="p-4 flex flex-col flex-1 space-y-4">
        <div className="space-y-1.5 flex-1">
          <div className="flex items-start justify-between gap-2">
            <div className="space-y-1">
              <span className="text-[10px] font-bold text-primary uppercase tracking-wider">
                {section.groupName || "-"}
              </span>
              <h3 className="font-bold text-base leading-tight line-clamp-2 group-hover:text-primary transition-colors">
                {section.title}
              </h3>
            </div>

            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="ghost" size="icon" className="h-8 w-8 shrink-0">
                  <MoreHorizontal className="h-4 w-4" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end">
                <DropdownMenuLabel>
                  {t(($) => $.exam.sections.table.columns.actions)}
                </DropdownMenuLabel>
                <DropdownMenuSeparator />
                <DropdownMenuItem onClick={() => onEdit(section)}>
                  <Pencil className="mr-2 h-4 w-4" /> {t(($) => $.exam.sections.table.actions.edit)}
                </DropdownMenuItem>
                <DropdownMenuItem
                  className="text-destructive focus:text-destructive"
                  onClick={() => onDelete(section)}
                >
                  <Trash2 className="mr-2 h-4 w-4" />{" "}
                  {t(($) => $.exam.sections.table.actions.delete)}
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>

          <p className="text-xs text-muted-foreground line-clamp-2 min-h-[2rem]">
            {section.description || "-"}
          </p>
        </div>

        <div className="pt-3 border-t border-border/40 grid grid-cols-2 gap-x-2 gap-y-3">
          <div className="flex items-center gap-2 text-[11px] text-muted-foreground font-medium">
            <Hash className="h-3.5 w-3.5 text-primary" />
            <span className="truncate">
              {t(($) => $.labels.order)}: {section.order}
            </span>
          </div>
          <div className="flex items-center gap-2 text-[11px] text-muted-foreground font-medium">
            <HelpCircle className="h-3.5 w-3.5 text-primary" />
            <span className="truncate">
              {section.activeQuestions}/
              {Math.max(0, section.totalQuestions - section.activeQuestions)}{" "}
              {t(($) => $.exam.sections.table.columns.questions)}
            </span>
          </div>
          <div className="flex items-center gap-2 text-[11px] text-muted-foreground font-medium">
            <Clock className="h-3.5 w-3.5 text-primary" />
            <span className="truncate">
              {section.durationMinutes || 0} {t(($) => $.exam.sections.table.columns.duration)}
            </span>
          </div>
          <div className="flex items-center gap-2 text-[11px] text-muted-foreground font-medium">
            <CalendarDays className="h-3.5 w-3.5 text-primary" />
            <span className="truncate">{string_to_locale_date("id-ID", section.updatedAt)}</span>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
