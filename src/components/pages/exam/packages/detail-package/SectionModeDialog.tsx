import { useState } from "react";
import { DialogModal } from "@/components/custom/components";
import { useAppTranslation } from "@/lib/i18n-typed";
import { useSessionHistory, useStartSession, ExamSessionMode } from "@/api/exam-sessions";
import { Clock, Play, BookOpen, ChevronRight, Loader2, ChevronLeft, Sparkles } from "lucide-react";
import { cn } from "@/lib/utils";
import { format } from "date-fns";
import { id as localeId } from "date-fns/locale";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { ExamSessionStatusConfig, EnumExamSessionStatus } from "@/constants/app-enum";
import { EnumExamSessionMode } from "backend/src/db/schema/exam/enums";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";

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
  const [currentPage, setCurrentPage] = useState(1);
  const { data: historyRes, isLoading: isHistoryLoading } = useSessionHistory(
    packageId,
    sectionId,
    { page: currentPage, limit: 5 },
  );
  const { isPending: isStarting } = useStartSession();

  const history = historyRes?.data?.items || [];
  const meta = historyRes?.data?.meta;

  const studyInProgress = history.find(
    (h) => h.status === EnumExamSessionStatus.IN_PROGRESS && h.mode === EnumExamSessionMode.STUDY,
  );
  const tryoutInProgress = history.find(
    (h) => h.status === EnumExamSessionStatus.IN_PROGRESS && h.mode === EnumExamSessionMode.TRYOUT,
  );

  const getStatusBadge = (status: string) => {
    const config = ExamSessionStatusConfig[status as keyof typeof ExamSessionStatusConfig];
    if (!config) return null;

    return (
      <Badge
        variant={config.variant as any}
        className={cn(
          "px-1.5 py-0 text-[10px] uppercase font-bold",
          config.animate && "animate-pulse",
        )}
      >
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
    <Tabs defaultValue="start" className="w-full">
      <TabsList className="grid w-full grid-cols-2 mb-4 bg-muted/50 p-1 rounded-xl">
        <TabsTrigger
          value="start"
          className="rounded-lg py-2 data-[state=active]:bg-background data-[state=active]:shadow-sm"
        >
          <Sparkles className="mr-2 h-4 w-4" />
          {t(($) => $.exam.sessions.start.chooseMode)}
        </TabsTrigger>
        <TabsTrigger
          value="history"
          className="rounded-lg py-2 data-[state=active]:bg-background data-[state=active]:shadow-sm"
        >
          <Clock className="mr-2 h-4 w-4" />
          {t(($) => $.exam.sessions.history.title)}
          {meta && meta.total > 0 && (
            <Badge variant="secondary" className="ml-1.5 h-4 min-w-4 px-1 text-[10px]">
              {meta.total}
            </Badge>
          )}
        </TabsTrigger>
      </TabsList>

      <div className="max-h-[60vh] overflow-y-auto overflow-x-hidden pr-2 custom-scrollbar">
        {/* Start New / Continue Tab */}
        <TabsContent value="start" className="space-y-4 focus-visible:outline-none">
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
            {/* Study Mode Card */}
            <div
              role="button"
              tabIndex={0}
              onClick={() => !isStarting && onStart("study")}
              className={cn(
                "group relative flex cursor-pointer flex-col items-start gap-3 rounded-2xl border bg-card p-5 text-left transition-all hover:shadow-lg active:scale-[0.98]",
                isStarting && "pointer-events-none opacity-50",
                studyInProgress
                  ? "border-amber-500/50 bg-amber-500/5 hover:border-amber-500 hover:bg-amber-500/10"
                  : "hover:border-primary/50 hover:bg-primary/5",
              )}
              onKeyDown={(e) => {
                if (e.key === "Enter" || e.key === " ") {
                  e.preventDefault();
                  onStart("study");
                }
              }}
            >
              <div
                className={cn(
                  "flex h-12 w-12 items-center justify-center rounded-xl transition-colors",
                  studyInProgress
                    ? "bg-amber-500 text-white"
                    : "bg-primary/10 text-primary group-hover:bg-primary group-hover:text-white",
                )}
              >
                <BookOpen className="h-6 w-6" />
              </div>
              <div className="flex w-full flex-col gap-1.5 whitespace-normal">
                <p
                  className={cn(
                    "text-base font-bold",
                    studyInProgress ? "text-amber-700" : "group-hover:text-primary",
                  )}
                >
                  {t(($) => $.exam.sessions.mode.study)}
                </p>
                <p className="text-xs leading-relaxed text-muted-foreground line-clamp-2">
                  {studyInProgress
                    ? t(($) => $.exam.sessions.active.continueDesc)
                    : t(($) => $.exam.sessions.mode.studyDesc)}
                </p>
              </div>
            </div>

            {/* Tryout Mode Card */}
            <div
              role="button"
              tabIndex={0}
              onClick={() => !isStarting && onStart("tryout")}
              className={cn(
                "group relative flex cursor-pointer flex-col items-start gap-3 rounded-2xl border bg-card p-5 text-left transition-all hover:shadow-lg active:scale-[0.98]",
                isStarting && "pointer-events-none opacity-50",
                tryoutInProgress
                  ? "border-amber-500/50 bg-amber-500/5 hover:border-amber-500 hover:bg-amber-500/10"
                  : "hover:border-emerald-500/50 hover:bg-emerald-500/5",
              )}
              onKeyDown={(e) => {
                if (e.key === "Enter" || e.key === " ") {
                  e.preventDefault();
                  onStart("tryout");
                }
              }}
            >
              <div
                className={cn(
                  "flex h-12 w-12 items-center justify-center rounded-xl transition-colors",
                  tryoutInProgress
                    ? "bg-amber-500 text-white"
                    : "bg-emerald-500/10 text-emerald-600 group-hover:bg-emerald-500 group-hover:text-white",
                )}
              >
                <Play className="h-6 w-6" />
              </div>
              <div className="flex w-full flex-col gap-1.5 whitespace-normal">
                <p
                  className={cn(
                    "text-base font-bold",
                    tryoutInProgress ? "text-amber-700" : "group-hover:text-emerald-600",
                  )}
                >
                  {t(($) => $.exam.sessions.mode.tryout)}
                </p>
                <p className="text-xs leading-relaxed text-muted-foreground line-clamp-2">
                  {tryoutInProgress
                    ? t(($) => $.exam.sessions.active.continueDesc)
                    : t(($) => $.exam.sessions.mode.tryoutDesc)}
                </p>
              </div>
            </div>
          </div>
        </TabsContent>

        {/* History Tab */}
        <TabsContent value="history" className="focus-visible:outline-none">
          {isHistoryLoading ? (
            <div className="flex items-center justify-center py-12">
              <Loader2 className="h-6 w-6 animate-spin text-primary" />
            </div>
          ) : history.length > 0 ? (
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground">
                  {t(($) => $.exam.sessions.history.title)}
                </span>
                {meta && meta.totalPages > 1 && (
                  <div className="flex items-center gap-1.5">
                    <Button
                      variant="ghost"
                      size="icon"
                      className="h-7 w-7 rounded-lg"
                      disabled={currentPage <= 1}
                      onClick={() => setCurrentPage((p) => p - 1)}
                    >
                      <ChevronLeft className="h-4 w-4" />
                    </Button>
                    <span className="text-[10px] font-bold text-muted-foreground">
                      {meta.page} / {meta.totalPages}
                    </span>
                    <Button
                      variant="ghost"
                      size="icon"
                      className="h-7 w-7 rounded-lg"
                      disabled={currentPage >= meta.totalPages}
                      onClick={() => setCurrentPage((p) => p + 1)}
                    >
                      <ChevronRight className="h-4 w-4" />
                    </Button>
                  </div>
                )}
              </div>
              <div className="max-h-[260px] overflow-y-auto pr-1 space-y-2 custom-scrollbar">
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
                      <span className="text-xs text-muted-foreground">
                        {format(new Date(item.startTime), "PPP p", { locale: localeId })}
                      </span>
                    </div>
                    <div className="flex items-center gap-3">
                      {item.score !== null && (
                        <div className="text-right">
                          <div className="text-sm font-bold text-primary">{item.score}</div>
                          <div className="text-xs text-muted-foreground">
                            {t(($) => $.exam.sessions.score)}
                          </div>
                        </div>
                      )}
                      <ChevronRight className="h-4 w-4 text-muted-foreground group-hover:text-primary" />
                    </div>
                  </div>
                ))}
              </div>
            </div>
          ) : (
            <div className="flex flex-col items-center justify-center py-12 text-center">
              <div className="rounded-full bg-muted p-3 mb-3">
                <Clock className="h-6 w-6 text-muted-foreground" />
              </div>
              <p className="text-sm font-medium text-muted-foreground">
                {t(($) => $.exam.sessions.history.empty || "Belum ada riwayat sesi")}
              </p>
            </div>
          )}
        </TabsContent>
      </div>
    </Tabs>
  );

  return (
    <DialogModal
      open={isOpen}
      onOpenChange={onOpenChange}
      variantCancel="subtle-destructive"
      classNameCancel=""
      modal={{
        title: t(($) => $.exam.sections.takeExamTitle),
        desc: (() => {
          const text = t(($) => $.exam.sections.takeExamConfirm, { title: "___TITLE___" });
          const parts = text.split("___TITLE___");
          return (
            <span>
              {parts[0]}
              <span className="font-bold text-primary underline decoration-primary/30 decoration-2 underline-offset-4">
                {sectionTitle}
              </span>
              {parts[1]}
            </span>
          );
        })(),
        content: dialogContent,
        textConfirm: "",
        textCancel: t(($) => $.labels.close),
        maxWidth: "xl",
        iconType: "info",
        showCloseButton: true,
      }}
    />
  );
};
