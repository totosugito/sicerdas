import { ExamPackageSection } from "@/api/exam-package-sections";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
import { useAppTranslation } from "@/lib/i18n-typed";
import { Clock, LayoutGrid } from "lucide-react";
import { useMemo } from "react";

interface PackageSectionAccordionProps {
  sections: ExamPackageSection[];
  onTakeExam?: (sectionId: string) => void;
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

      <Accordion type="multiple" defaultValue={[chapters[0]?.name]} className="w-full space-y-3">
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
                    onClick={() => onTakeExam?.(section.id)}
                    className="group flex flex-col gap-4 p-5 transition-all hover:bg-primary/5 sm:flex-row sm:items-center sm:justify-between"
                  >
                    <div className="flex items-center gap-4 flex-1">
                      <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-muted transition-colors group-hover:bg-primary group-hover:text-primary-foreground group-active:scale-90">
                        <Clock className="h-5 w-5" />
                      </div>
                      <div className="flex flex-col gap-1">
                        <span className="text-sm font-bold text-foreground transition-colors group-hover:text-primary">
                          {section.title}
                        </span>
                        {section.description && (
                          <p className="line-clamp-1 text-xs text-muted-foreground">
                            {section.description}
                          </p>
                        )}
                      </div>
                    </div>

                    <div className="flex items-center gap-6 text-xs font-bold text-muted-foreground">
                      <div className="flex items-center gap-2">
                        <div className="h-1.5 w-1.5 rounded-full bg-primary/40" />
                        <span>
                          {section.durationMinutes} {t(($) => $.exam.packages.detail.mnt)}
                        </span>
                      </div>
                      <div className="flex items-center gap-2 border-l pl-6">
                        <div className="h-1.5 w-1.5 rounded-full bg-amber-400/60" />
                        <span>
                          {section.totalQuestions} {t(($) => $.exam.packages.detail.questions)}
                        </span>
                      </div>
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
