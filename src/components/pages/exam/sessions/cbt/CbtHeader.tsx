import React from "react";
import { useCbtStore, CbtFontSize } from "@/stores/useCbtStore";
import { Button } from "@/components/ui/button";
import { ArrowLeft, Type, Check, Settings, Flag } from "lucide-react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
  DropdownMenuSub,
  DropdownMenuSubContent,
  DropdownMenuSubTrigger,
  DropdownMenuPortal,
  DropdownMenuSeparator,
} from "@/components/ui/dropdown-menu";

interface CbtHeaderProps {
  title: string;
  subtitle?: string;
  mode: "study" | "tryout";
  onSubmit: () => void;
  isSubmitting?: boolean;
  showSubmit?: boolean;
  onGoToResult?: () => void;
  onExit?: () => void;
  onReport?: () => void;
}

const formatTime = (seconds: number) => {
  const m = Math.floor(seconds / 60);
  const s = seconds % 60;
  return `${m.toString().padStart(2, "0")}:${s.toString().padStart(2, "0")}`;
};

export const CbtHeader: React.FC<CbtHeaderProps> = ({
  title,
  subtitle,
  mode,
  onSubmit,
  isSubmitting,
  showSubmit = true,
  onGoToResult,
  onExit,
  onReport,
}) => {
  const { elapsedSeconds, isTimerActive, fontSize, setFontSize } = useCbtStore();

  const fontSizes: { label: string; value: CbtFontSize }[] = [
    { label: "Kecil", value: "sm" },
    { label: "Normal", value: "base" },
    { label: "Besar", value: "lg" },
    { label: "Sangat Besar", value: "xl" },
  ];

  return (
    <header className="flex flex-col md:flex-row md:items-center justify-between px-4 lg:px-6 py-3 md:py-4 bg-white/95 dark:bg-slate-900/95 border border-slate-200 dark:border-slate-800 rounded-2xl shadow-sm backdrop-blur-md gap-3 md:gap-4">
      {/* Title & Subtitle Area */}
      <div className="flex-1 min-w-0 pr-0 md:pr-4 flex items-center gap-3">
        {onExit && (
          <Button
            variant="ghost"
            size="icon"
            onClick={onExit}
            className="flex-shrink-0 -ml-2 text-muted-foreground hover:text-foreground hover:bg-slate-100 dark:hover:bg-slate-800"
            title="Keluar"
          >
            <ArrowLeft className="w-5 h-5" />
          </Button>
        )}
        <div className="min-w-0">
          <h1 className="font-semibold text-slate-800 dark:text-slate-200 leading-snug line-clamp-2 md:line-clamp-1">{title}</h1>
          {subtitle && (
            <p className="text-xs text-slate-500 dark:text-slate-400 font-medium line-clamp-2 md:line-clamp-1 mt-0.5">{subtitle}</p>
          )}
        </div>
      </div>

      {/* Timer & Actions Area */}
      <div className="flex items-center justify-between md:justify-end gap-3 md:gap-4 flex-shrink-0">
        <div className="flex justify-center">
          {mode === "tryout" || isTimerActive ? (
            <div
              className={`px-4 py-1.5 rounded-full font-mono text-sm font-medium border ${
                mode === "tryout" && elapsedSeconds < 300
                  ? "bg-destructive/10 text-destructive border-destructive/20 animate-pulse"
                  : "bg-muted border-border"
              }`}
            >
              {formatTime(elapsedSeconds)}
            </div>
          ) : (
            <div className="px-4 py-1.5 rounded-full font-mono text-sm font-medium bg-muted border border-border">
              {formatTime(elapsedSeconds)} (Study)
            </div>
          )}
        </div>

        <div className="flex items-center gap-2">
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="outline" size="icon" className="text-slate-500 shrink-0" title="Pengaturan">
                <Settings className="w-4 h-4" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="w-48">
              <DropdownMenuSub>
                <DropdownMenuSubTrigger>
                  <Type className="w-4 h-4 mr-2" />
                  <span>Ukuran Teks</span>
                </DropdownMenuSubTrigger>
                <DropdownMenuPortal>
                  <DropdownMenuSubContent>
                    {fontSizes.map((size) => (
                      <DropdownMenuItem
                        key={size.value}
                        onClick={() => setFontSize(size.value)}
                        className="flex items-center justify-between min-w-[120px]"
                      >
                        {size.label}
                        {fontSize === size.value && <Check className="w-4 h-4 ml-2 text-primary" />}
                      </DropdownMenuItem>
                    ))}
                  </DropdownMenuSubContent>
                </DropdownMenuPortal>
              </DropdownMenuSub>
              {onReport && (
                <>
                  <DropdownMenuSeparator />
                  <DropdownMenuItem onClick={onReport} className="text-destructive focus:text-destructive cursor-pointer">
                    <Flag className="w-4 h-4 mr-2" />
                    <span>Laporkan</span>
                  </DropdownMenuItem>
                </>
              )}
            </DropdownMenuContent>
          </DropdownMenu>

          {showSubmit ? (
            <Button variant="default" size="sm" onClick={onSubmit} disabled={isSubmitting}>
              {isSubmitting ? "Submitting..." : mode === "tryout" ? "Submit Exam" : "Finish Study"}
            </Button>
          ) : onGoToResult ? (
            <Button
              variant="outline"
              size="sm"
              onClick={onGoToResult}
              className="border-primary text-primary hover:bg-primary/5"
            >
              Lihat Hasil
            </Button>
          ) : null}
        </div>
      </div>
    </header>
  );
};
