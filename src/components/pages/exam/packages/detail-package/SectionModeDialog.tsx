import { DialogModal } from "@/components/custom/components";
import { useAppTranslation } from "@/lib/i18n-typed";
import {
  useSessionHistory,
  useStartSession,
  ExamHistoryItem,
  ExamSessionMode,
} from "@/api/exam-sessions";
import { Clock, Play, BookOpen, ChevronRight, AlertCircle, Loader2 } from "lucide-react";
import { cn } from "@/lib/utils";
import { format } from "date-fns";
import { id as localeId } from "date-fns/locale";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { ExamSessionStatusConfig } from "@/constants/app-enum";

interface SectionModeDialogProps {
  isOpen: boolean;
  onOpenChange: (open: boolean) => void;
  packageId: string;
  sectionId: string;
  sectionTitle: string;
  onStart: (mode: ExamSessionMode) => void;
}

export const SectionModeDialog = ({
  isOpen,
  onOpenChange,
  packageId,
  sectionId,
  sectionTitle,
  onStart,
}: SectionModeDialogProps) => {
  const { t } = useAppTranslation();
  const { data: historyRes, isLoading: isHistoryLoading } = useSessionHistory(packageId, sectionId);
  const { isPending: isStarting } = useStartSession();

  const history = historyRes?.data || [];
  const inProgressSession = history.find((h) => h.status === "in_progress");

  const getStatusBadge = (status: string) => {
    const config = ExamSessionStatusConfig[status as keyof typeof ExamSessionStatusConfig];
    if (!config) return null;

    return (
      <Badge variant={config.variant as any} className={cn(config.animate && "animate-pulse")}>
        {t(($) => ($.exam.sessions.status as any)[config.labelKey.split(".").pop()!])}
      </Badge>
    );
  };

  const getModeLabel = (mode: string) => {
    return mode === "study"
      ? t(($) => $.exam.sessions.mode.study)
      : t(($) => $.exam.sessions.mode.tryout);
  };

  const dialogContent = (
    <div className="flex flex-col gap-6">
      {/* History Section */}
      <div className="space-y-3">
        <h4 className="text-xs font-bold uppercase tracking-wider text-muted-foreground flex items-center gap-2">
          <Clock className="h-3 w-3" />
          {t(($) => $.exam.sessions.history.title)}
        </h4>

        {isHistoryLoading ? (
          <div className="flex items-center justify-center py-8">
            <Loader2 className="h-6 w-6 animate-spin text-primary" />
          </div>
        ) : history.length === 0 ? (
          <div className="rounded-lg border border-dashed p-6 text-center">
            <p className="text-sm text-muted-foreground">
              {t(($) => $.exam.sessions.history.empty)}
            </p>
          </div>
        ) : (
          <div className="max-h-[200px] overflow-y-auto pr-1 space-y-2 custom-scrollbar">
            {history.map((item) => (
              <div
                key={item.id}
                className="group flex items-center justify-between rounded-xl border bg-card p-3 transition-all hover:border-primary/30 hover:bg-primary/5"
              >
                <div className="flex flex-col gap-1">
                  <div className="flex items-center gap-2">
                    <span className="text-sm font-bold">{getModeLabel(item.mode)}</span>
                    {getStatusBadge(item.status)}
                  </div>
                  <span className="text-[10px] text-muted-foreground">
                    {format(new Date(item.startTime), "PPP p", { locale: localeId })}
                  </span>
                </div>
                <div className="flex items-center gap-3">
                  {item.score !== null && (
                    <div className="text-right">
                      <div className="text-sm font-bold text-primary">{item.score}</div>
                      <div className="text-[10px] text-muted-foreground">Skor</div>
                    </div>
                  )}
                  <ChevronRight className="h-4 w-4 text-muted-foreground group-hover:text-primary" />
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Mode Selection */}
      <div className="space-y-3 pt-2 border-t">
        <h4 className="text-xs font-bold uppercase tracking-wider text-muted-foreground flex items-center gap-2">
          <Play className="h-3 w-3" />
          {t(($) => $.exam.sessions.start.chooseMode)}
        </h4>

        {inProgressSession ? (
          <div className="rounded-xl border border-amber-200 bg-amber-50 p-4 dark:border-amber-900/50 dark:bg-amber-900/20">
            <div className="flex items-start gap-3">
              <AlertCircle className="mt-0.5 h-5 w-5 text-amber-600" />
              <div className="flex-1 space-y-3">
                <div className="space-y-1">
                  <p className="text-sm font-bold text-amber-900 dark:text-amber-200">
                    Sesi Sedang Berjalan
                  </p>
                  <p className="text-xs text-amber-800/80 dark:text-amber-300/80">
                    Anda memiliki sesi {getModeLabel(inProgressSession.mode)} yang belum selesai.
                    Silakan lanjutkan sesi tersebut.
                  </p>
                </div>
                <Button
                  className="w-full bg-amber-600 hover:bg-amber-700 text-white"
                  onClick={() => onStart(inProgressSession.mode as ExamSessionMode)}
                  disabled={isStarting}
                >
                  {isStarting ? (
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  ) : (
                    <Play className="mr-2 h-4 w-4" />
                  )}
                  Lanjutkan Sesi
                </Button>
              </div>
            </div>
          </div>
        ) : (
          <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
            <button
              onClick={() => onStart("study")}
              disabled={isStarting}
              className="group relative flex flex-col items-start gap-2 rounded-2xl border bg-card p-4 text-left transition-all hover:border-primary/50 hover:bg-primary/5 hover:shadow-md active:scale-[0.98] disabled:opacity-50"
            >
              <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-primary/10 text-primary transition-colors group-hover:bg-primary group-hover:text-white">
                <BookOpen className="h-5 w-5" />
              </div>
              <div className="space-y-1">
                <p className="text-sm font-bold group-hover:text-primary">Mode Belajar</p>
                <p className="text-[10px] leading-relaxed text-muted-foreground">
                  Lihat kunci jawaban & pembahasan setelah menjawab.
                </p>
              </div>
            </button>

            <button
              onClick={() => onStart("tryout")}
              disabled={isStarting}
              className="group relative flex flex-col items-start gap-2 rounded-2xl border bg-card p-4 text-left transition-all hover:border-emerald-500/50 hover:bg-emerald-500/5 hover:shadow-md active:scale-[0.98] disabled:opacity-50"
            >
              <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-emerald-500/10 text-emerald-600 transition-colors group-hover:bg-emerald-500 group-hover:text-white">
                <Play className="h-5 w-5" />
              </div>
              <div className="space-y-1">
                <p className="text-sm font-bold group-hover:text-emerald-600">Mode Tryout</p>
                <p className="text-[10px] leading-relaxed text-muted-foreground">
                  Simulasi ujian sungguhan. Skor & pembahasan muncul di akhir.
                </p>
              </div>
            </button>
          </div>
        )}
      </div>
    </div>
  );

  return (
    <DialogModal
      open={isOpen}
      onOpenChange={onOpenChange}
      modal={{
        title: sectionTitle,
        desc: t(($) => $.exam.sections.takeExamConfirm),
        content: dialogContent,
        textConfirm: "", // Remove default buttons to use custom ones
        textCancel: t(($) => $.labels.close),
        maxWidth: "md",
        iconType: "info",
      }}
    />
  );
};
