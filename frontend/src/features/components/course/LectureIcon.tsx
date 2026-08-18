import React from "react";
import { PlayCircle, FileText, GraduationCap, FileMinus, MessageSquare, File } from "lucide-react";
import { EnumLectureType } from "@/api/course/types";
import { cn } from "@/lib/utils";

interface LectureIconProps {
  type: string;
  className?: string;
}

export function LectureIcon({ type, className }: LectureIconProps) {
  switch (type) {
    case EnumLectureType.VIDEO:
      return <PlayCircle className={cn("h-4.5 w-4.5 text-sky-500 dark:text-sky-400 shrink-0", className)} />;
    case EnumLectureType.EXAM:
      return <GraduationCap className={cn("h-4.5 w-4.5 text-emerald-500 dark:text-emerald-400 shrink-0", className)} />;
    case EnumLectureType.TEXT:
      return <FileText className={cn("h-4.5 w-4.5 text-amber-500 dark:text-amber-400 shrink-0", className)} />;
    case EnumLectureType.PDF:
      return <FileMinus className={cn("h-4.5 w-4.5 text-rose-500 dark:text-rose-400 shrink-0", className)} />;
    case EnumLectureType.DISCUSSION:
      return <MessageSquare className={cn("h-4.5 w-4.5 text-indigo-500 dark:text-indigo-400 shrink-0", className)} />;
    default:
      return <File className={cn("h-4.5 w-4.5 text-slate-400 dark:text-slate-500 shrink-0", className)} />;
  }
}
