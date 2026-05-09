import { useAppTranslation } from "@/lib/i18n-typed";
import {
  Bookmark,
  Book,
  Download
} from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { cn } from "@/lib/utils";

interface StatsBookProps {
  totalFavorites?: number;
  totalMaterialsRead?: number;
  totalDownloads?: number;
}

export const StatsBook = ({
  totalFavorites = 0,
  totalMaterialsRead = 0,
  totalDownloads = 0,
}: StatsBookProps) => {
  const { t } = useAppTranslation();

  const stats = [
    {
      label: t(($) => $.book.dashboard.favorites.title),
      value: totalFavorites,
      icon: Bookmark,
      color: "amber",
      bg: "bg-amber-500/10",
      text: "text-amber-600 dark:text-amber-400",
    },
    {
      label: t(($) => $.book.dashboard.history.title),
      value: totalMaterialsRead,
      icon: Book,
      color: "indigo",
      bg: "bg-indigo-500/10",
      text: "text-indigo-600 dark:text-indigo-400",
    },
    {
      label: t(($) => $.book.dashboard.stats.offlineAccess),
      value: totalDownloads,
      icon: Download,
      color: "emerald",
      bg: "bg-emerald-500/10",
      text: "text-emerald-600 dark:text-emerald-400",
    },
  ];

  return (
    <Card className="overflow-hidden">
      <CardContent className="p-0">
        <div className="flex flex-col sm:flex-row items-stretch divide-y sm:divide-y-0 sm:divide-x divide-slate-100 dark:divide-white/5">
          {stats.map((item, index) => (
            <div
              key={index}
              className="flex-1 p-5 flex items-center gap-4 group hover:bg-slate-50/50 dark:hover:bg-white/[0.02] transition-colors"
            >
              <div className={cn(
                "w-12 h-12 rounded-2xl flex items-center justify-center transition-transform group-hover:scale-110 duration-300",
                item.bg,
                item.text
              )}>
                <item.icon className="w-6 h-6" />
              </div>

              <div className="flex flex-col">
                <span className="text-2xl font-black tabular-nums tracking-tight text-slate-900 dark:text-white leading-none mb-1">
                  {item.value}
                </span>
                <span className="text-[10px] font-bold text-slate-500 uppercase tracking-widest">
                  {item.label}
                </span>
              </div>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
};
