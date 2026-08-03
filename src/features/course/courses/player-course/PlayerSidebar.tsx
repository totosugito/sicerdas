import React from "react";
import { CheckCircle2, Lock, FileText, BookOpen } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { EnumLectureType } from "backend/src/db/schema/course/enums.ts";
import { useAppTranslation } from "@/lib/i18n-typed";

export type PlayerLecture = {
  id: string;
  title: string | null;
  description: string | null;
  type: string;
  referenceUrl: string | null;
  extra: Record<string, unknown> | null;
  packageId: string | null;
  isCompleted: boolean;
  completedAt?: string | null;
};

export type PlayerChapter = {
  id: string;
  chapterName: string | null;
  lectures: PlayerLecture[];
};

interface PlayerSidebarProps {
  chapters: PlayerChapter[];
  selectedId?: string;
  onSelectLecture: (lecture: PlayerLecture) => void;
}

export function PlayerSidebar({
  chapters,
  selectedId,
  onSelectLecture,
}: PlayerSidebarProps) {
  const { t } = useAppTranslation();

  return (
    <Card className="h-fit lg:sticky lg:top-4">
      <CardHeader>
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
                  className={`flex w-full items-center gap-2 rounded-lg border p-2 text-left text-sm transition ${
                    isSelected
                      ? "border-primary bg-primary/5 text-primary"
                      : "border-transparent hover:bg-muted text-slate-700 dark:text-slate-350"
                  }`}
                >
                  <CheckCircle2
                    className={`h-4 w-4 shrink-0 ${
                      lecture.isCompleted ? "text-emerald-500" : "text-muted-foreground/40"
                    }`}
                  />
                  {lecture.type === EnumLectureType.EXAM ? (
                    <Lock className="h-4 w-4 shrink-0" />
                  ) : (
                    <FileText className="h-4 w-4 shrink-0" />
                  )}
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
