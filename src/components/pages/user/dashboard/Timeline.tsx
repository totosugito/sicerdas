import React from "react";
import { 
  Trophy, 
  Book, 
  Clock, 
  FileText, 
  BookOpen 
} from "lucide-react";
import { formatDistanceToNow } from "date-fns";
import { id } from "date-fns/locale";
import { cn } from "@/lib/utils";
import { useAppTranslation } from "@/lib/i18n-typed";

interface TimelineProps {
  history: any[];
  bookHistory: any[];
}

export function Timeline({ history, bookHistory }: TimelineProps) {
  const { t } = useAppTranslation();
  
  // Merge and sort activities by date
  const activities = [
    ...history.map((item) => {
      const date = new Date(item.createdAt);
      return {
        id: item.id,
        type: "exam",
        title: item.packageTitle,
        date: isNaN(date.getTime()) ? new Date() : date,
        metadata: `${item.score}% • ${item.mode === "tryout" ? "Exam" : "Study"}`,
        icon: Trophy,
        color: "bg-blue-500",
      };
    }),
    ...bookHistory.map((item) => {
      const date = new Date(item.updatedAt);
      return {
        id: item.id,
        type: "book",
        title: item.title,
        date: isNaN(date.getTime()) ? new Date() : date,
        metadata: item.category.name,
        icon: Book,
        color: "bg-amber-500",
      };
    }),
  ]
    .filter((a) => a.date !== null)
    .sort((a, b) => b.date.getTime() - a.date.getTime());

  if (activities.length === 0) {
    return (
      <div className="py-12 text-center">
        <p className="text-slate-400 font-bold">No activities recorded yet.</p>
      </div>
    );
  }

  return (
    <div className="relative space-y-8 before:absolute before:inset-0 before:ml-5 before:-translate-x-px md:before:mx-auto md:before:translate-x-0 before:h-full before:w-0.5 before:bg-gradient-to-b before:from-transparent before:via-slate-200 dark:before:via-slate-800 before:to-transparent">
      {activities.map((activity, idx) => (
        <div key={`${activity.type}-${activity.id}-${idx}`} className="relative flex items-center justify-between md:justify-normal md:odd:flex-row-reverse group is-active">
          {/* Icon */}
          <div className={cn(
            "flex items-center justify-center w-10 h-10 rounded-full border border-white dark:border-slate-900 shadow-xl shrink-0 md:order-1 md:group-odd:-translate-x-1/2 md:group-even:translate-x-1/2 z-10 transition-transform duration-300 group-hover:scale-110",
            activity.color
          )}>
            <activity.icon className="w-5 h-5 text-white" />
          </div>
          {/* Card */}
          <div className="w-[calc(100%-4rem)] md:w-[calc(50%-2.5rem)] bg-white dark:bg-slate-900/50 p-6 rounded-3xl border border-slate-100 dark:border-slate-800 shadow-sm hover:shadow-xl hover:border-primary/20 transition-all duration-300">
            <div className="flex items-center justify-between space-x-2 mb-1">
              <div className="font-black text-slate-900 dark:text-white group-hover:text-primary transition-colors">{activity.title}</div>
              <time className="text-[10px] font-black uppercase text-slate-400 whitespace-nowrap">
                {formatDistanceToNow(activity.date, { addSuffix: true, locale: id })}
              </time>
            </div>
            <div className="text-xs font-bold text-slate-500 dark:text-slate-400 flex items-center gap-2">
               {activity.type === 'exam' ? <FileText className="w-3 h-3" /> : <BookOpen className="w-3 h-3" />}
               {activity.metadata}
            </div>
          </div>
        </div>
      ))}
    </div>
  );
}
