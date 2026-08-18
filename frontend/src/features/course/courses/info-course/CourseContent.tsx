import React from "react";
import { CourseStructureChapter } from "@/api/course/courses/admin/structure-course";
import { Card, CardContent } from "@/components/ui/card";
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion";
import { useAppTranslation } from "@/lib/i18n-typed";
import { LectureIcon, LectureStatusBadge } from "@/features/components";

interface CourseContentProps {
  chapters: CourseStructureChapter[];
  isStructureLoading: boolean;
  isEnrolled?: boolean;
}

export function CourseContent({ chapters, isStructureLoading, isEnrolled }: CourseContentProps) {
  const { t } = useAppTranslation();

  return (
    <Card className="border-border/40 shadow-sm">
      <CardContent className="p-6">
        <h2 className="text-lg font-bold text-slate-900 dark:text-white mb-4">
          {t(($) => $.course.public.detail.syllabus)}
        </h2>

        {isStructureLoading ? (
          <div className="space-y-3">
            {[1, 2, 3].map((n) => (
              <div key={n} className="h-12 bg-muted animate-pulse rounded-xl" />
            ))}
          </div>
        ) : chapters.length === 0 ? (
          <div className="text-slate-400 dark:text-slate-500 italic text-center py-6 text-sm">
            {t(($) => $.course.public.detail.emptySyllabus)}
          </div>
        ) : (
          <Accordion multiple className="w-full space-y-3">
            {chapters.map((chapter, idx) => (
              <AccordionItem
                key={chapter.id}
                value={chapter.id}
                className="border border-slate-100 dark:border-slate-800 rounded-xl px-4 overflow-hidden bg-slate-50/30 dark:bg-slate-950/20"
              >
                <AccordionTrigger className="hover:no-underline py-4 text-left">
                  <div className="flex flex-col gap-1 pr-4">
                    <span className="text-xs text-primary font-bold uppercase tracking-wider">
                      {t(($) => $.course.public.detail.chapter)} {idx + 1}
                    </span>
                    <span className="font-bold text-slate-900 dark:text-white">
                      {chapter.chapterName}
                    </span>
                  </div>
                </AccordionTrigger>
                <AccordionContent className="pb-4 pt-1 space-y-2 border-t border-slate-100 dark:border-slate-850">
                  {chapter.lectures && chapter.lectures.length > 0 ? (
                    chapter.lectures.map((lecture, lIdx) => (
                      <div
                        key={lecture.id}
                        className="flex items-center justify-between p-3 rounded-lg bg-white dark:bg-slate-900 border border-slate-100 dark:border-slate-800/40"
                      >
                        <div className="flex items-center gap-3">
                          <LectureIcon type={lecture.type} />
                          <div className="flex flex-col">
                            <span className="text-xs font-semibold text-slate-400 dark:text-slate-500">
                              {t(($) => $.course.public.detail.lecture)} {lIdx + 1} • {lecture.type.toUpperCase()}
                            </span>
                            <span className="text-sm font-semibold text-slate-700 dark:text-slate-350">
                              {lecture.title}
                            </span>
                          </div>
                        </div>

                        <LectureStatusBadge
                          isEnrolled={isEnrolled}
                          isCompleted={(lecture as any).isCompleted}
                        />
                      </div>
                    ))
                  ) : (
                    <div className="text-xs text-slate-400 dark:text-slate-500 italic p-2">
                      {t(($) => $.course.public.detail.noChapterLectures)}
                    </div>
                  )}
                </AccordionContent>
              </AccordionItem>
            ))}
          </Accordion>
        )}
      </CardContent>
    </Card>
  );
}
