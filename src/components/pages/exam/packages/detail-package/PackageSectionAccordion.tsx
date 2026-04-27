import { ExamPackageSection } from "@/api/exam-package-sections";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
import { useAppTranslation } from "@/lib/i18n-typed";
import { Clock, LayoutGrid, PlayCircle, Trophy } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";
import { useMemo } from "react";
import { ExamSessionStatusConfig } from "@/constants/app-enum";

interface PackageSectionAccordionProps {
  sections: ExamPackageSection[];
  onTakeExam?: (sectionId: string, sectionTitle: string) => void;
}

interface Chapter {
  name: string;
  sections: ExamPackageSection[];
}

export const PackageSectionAccordion = ({ sections, onTakeExam }: PackageSectionAccordionProps) => {
  const { t } = useAppTranslation();

  const chapters = useMemo(() => {
    const chapterMap: Record<string, ExamPackageSection[]> = {};
    const chapterOrder: string[] = [];

    sections.forEach((section) => {
      const groupName = section.groupName || t(($) => $.exam.sections.generalGroup);
      if (!chapterMap[groupName]) {
        chapterMap[groupName] = [];
        chapterOrder.push(groupName);
      }
      chapterMap[groupName].push(section);
    });

    return chapterOrder.map((name) => ({
      name,
      sections: chapterMap[name],
    }));
  }, [sections, t]);

  if (sections.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-12 text-center">
        <div className="flex h-12 w-12 items-center justify-center rounded-full bg-muted">
          <LayoutGrid className="h-6 w-6 text-muted-foreground" />
        </div>
        <p className="mt-4 text-sm font-medium text-muted-foreground">
          {t(($) => $.exam.sections.noSections)}
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <div className="flex flex-col gap-1">
        <h3 className="text-lg font-bold tracking-tight">{t(($) => $.exam.sections.title)}</h3>
        <p className="text-sm text-muted-foreground">
          {t(($) => $.exam.sections.curriculumDescription)}
        </p>
      </div>

      <Accordion
        type="multiple"
        defaultValue={chapters.map((chapter) => chapter.name)}
        className="w-full space-y-3"
      >
        {chapters.map((chapter) => (
          <AccordionItem
            key={chapter.name}
            value={chapter.name}
            className="overflow-hidden rounded-xl border bg-card"
          >
            <AccordionTrigger className="px-5 py-4 hover:bg-accent/50 hover:no-underline [&[data-state=open]]:bg-accent/30">
              <div className="flex items-center gap-3">
                <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-primary/10 text-primary">
                  <LayoutGrid className="h-4 w-4" />
                </div>
                <div className="flex flex-col items-start gap-0.5">
                  <span className="text-sm font-bold leading-none">{chapter.name}</span>
                  <span className="text-xs font-medium text-muted-foreground">
                    {chapter.sections.length} {t(($) => $.exam.sections.sectionsCount)}
                  </span>
                </div>
              </div>
            </AccordionTrigger>
            <AccordionContent className="border-t bg-muted/20 px-0 pb-0 transition-all">
              <div className="divide-y divide-border/50">
                {chapter.sections.map((section) => (
                  <div
                    key={section.id}
                    role="button"
                    onClick={() => onTakeExam?.(section.id, section.title)}
                    className="group flex flex-col gap-4 p-5 transition-all hover:bg-primary/5 sm:flex-row sm:items-center sm:justify-between"
                  >
                    <div className="flex flex-1 items-start gap-4 min-w-0">
                      <div className="flex shrink-0 items-center justify-center transition-all group-active:scale-90 mt-1 w-6">
                        {(() => {
                          const config = section.userStatus
                            ? ExamSessionStatusConfig[
                                section.userStatus as keyof typeof ExamSessionStatusConfig
                              ]
                            : ExamSessionStatusConfig.abandoned;

                          const StatusIcon = config.icon;
                          return (
                            <StatusIcon
                              className={cn("h-5 w-5 transition-colors", config.iconClassName)}
                            />
                          );
                        })()}
                      </div>
                      <div className="flex flex-col gap-1 min-w-0 flex-1">
                        <span className="text-sm font-bold text-foreground transition-colors group-hover:text-primary line-clamp-2">
                          {section.title}
                        </span>
                        {section.description && (
                          <p className="line-clamp-1 text-xs text-muted-foreground">
                            {section.description}
                          </p>
                        )}
                        <div className="mt-1 flex flex-wrap items-center gap-3 text-xs font-bold uppercase tracking-wider text-muted-foreground/60">
                          <div className="flex items-center gap-1.5">
                            <Clock className="h-3 w-3" />
                            <span>
                              {section.durationMinutes} {t(($) => $.exam.packages.detail.mnt)}
                            </span>
                          </div>
                          <div className="flex items-center gap-1.5 border-l pl-3">
                            <PlayCircle className="h-3 w-3" />
                            <span>
                              {section.totalQuestions} {t(($) => $.exam.packages.detail.questions)}
                            </span>
                          </div>
                          {section.userMode && (
                            <div className="flex items-center gap-1.5 border-l pl-3 text-amber-500/80">
                              <span>
                                {section.userMode === "study"
                                  ? t(($) => $.exam.sessions.mode.study)
                                  : t(($) => $.exam.sessions.mode.tryout)}
                              </span>
                            </div>
                          )}
                        </div>
                      </div>
                    </div>

                    <div className="flex shrink-0 flex-col items-end gap-3 sm:text-right">
                      {section.userStatus &&
                        ExamSessionStatusConfig[
                          section.userStatus as keyof typeof ExamSessionStatusConfig
                        ] &&
                        (() => {
                          const config =
                            ExamSessionStatusConfig[
                              section.userStatus as keyof typeof ExamSessionStatusConfig
                            ];
                          const StatusIcon = config.icon;
                          return (
                            <Badge
                              variant={config.variant as any}
                              className={cn(
                                "h-6 px-2 text-xs uppercase tracking-wider font-black",
                                config.animate && "animate-pulse",
                              )}
                            >
                              <span className="flex items-center gap-1">
                                <StatusIcon className="h-3 w-3" />
                                {t(
                                  ($) =>
                                    ($.exam.sessions.status as any)[
                                      config.labelKey.split(".").pop()!
                                    ],
                                )}
                              </span>
                            </Badge>
                          );
                        })()}

                      {section.bestTryoutScore !== null &&
                        section.bestTryoutScore !== undefined && (
                          <div className="flex items-center gap-3 rounded-lg bg-primary/5 px-3 py-1.5 text-primary ring-1 ring-primary/10 transition-colors group-hover:bg-primary/10">
                            <Trophy className="h-4 w-4 shrink-0" />
                            <div className="flex flex-col items-end">
                              <span className="text-xs leading-none uppercase font-black text-primary/60 tracking-tighter">
                                {t(($) => $.exam.sessions.bestScore)}
                              </span>
                              <span className="text-lg font-black leading-none">
                                {section.bestTryoutScore}
                              </span>
                            </div>
                          </div>
                        )}
                    </div>
                  </div>
                ))}
              </div>
            </AccordionContent>
          </AccordionItem>
        ))}
      </Accordion>
    </div>
  );
};
