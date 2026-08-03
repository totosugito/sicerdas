import React from "react";
import { CheckCircle2, BookOpen } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { EnumLectureType } from "@/api/course/types";
import { LectureProgressItem, ChapterProgressItem } from "@/api/course/user-progress";
import { useAppTranslation } from "@/lib/i18n-typed";
import { cn } from "@/lib/utils";
import { LectureIcon } from "@/features/components";

interface PlayerSidebarProps {
  chapters: ChapterProgressItem[];
  selectedId?: string;
  onSelectLecture: (lecture: LectureProgressItem) => void;
  className?: string;
}

export function PlayerSidebar({
  chapters,
  selectedId,
  onSelectLecture,
  className,
}: PlayerSidebarProps) {
  const { t } = useAppTranslation();

  return (
    <Card className={cn("h-fit lg:sticky lg:top-4", className)}>
      <CardHeader className="pb-2">
        <CardTitle className="flex items-center gap-2 text-base">
          <BookOpen className="h-4 w-4" />
          {t(($) => $.course.public.detail.syllabus)}
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        {chapters.map((chapter) => (
          <div key={chapter.id} className="space-y-2">
            <p className="text-xs font-bold uppercase tracking-wide text-muted-foreground">
              {chapter.chapterName}
            </p>
            {chapter.lectures.map((lecture) => {
              const isSelected = selectedId === lecture.id;
              return (
                <button
                  key={lecture.id}
                  type="button"
                  onClick={() => onSelectLecture(lecture)}
                  className={`flex w-full items-center gap-2 rounded-lg border p-2 text-left text-sm transition ${isSelected
                    ? "border-primary bg-primary/5 text-primary"
                    : "border-transparent hover:bg-muted text-slate-700 dark:text-slate-350"
                    }`}
                >
                  <CheckCircle2
                    className={`h-4 w-4 shrink-0 ${lecture.isCompleted ? "text-emerald-500" : "text-muted-foreground/40"
                      }`}
                  />
                  <LectureIcon type={lecture.type} className="h-4 w-4" />
                  <span className="line-clamp-2">{lecture.title}</span>
                </button>
              );
            })}
          </div>
        ))}
      </CardContent>
    </Card>
  );
}
