import React from "react";
import { useCbtStore } from "@/stores/useCbtStore";
import { Button } from "@/components/ui/button";

interface CbtHeaderProps {
  title: string;
  mode: "study" | "tryout";
  onSubmit: () => void;
}

const formatTime = (seconds: number) => {
  const m = Math.floor(seconds / 60);
  const s = seconds % 60;
  return `${m.toString().padStart(2, "0")}:${s.toString().padStart(2, "0")}`;
};

export const CbtHeader: React.FC<CbtHeaderProps> = ({ title, mode, onSubmit }) => {
  const { elapsedSeconds, isTimerActive } = useCbtStore();

  return (
    <header className="sticky top-0 z-50 flex items-center justify-between px-4 py-3 bg-background border-b border-border/40 backdrop-blur-md">
      <div className="flex-1 font-semibold truncate pr-4">{title}</div>

      <div className="flex-1 flex justify-center">
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

      <div className="flex-1 flex justify-end items-center gap-2">
        <Button variant="default" size="sm" onClick={onSubmit}>
          {mode === "tryout" ? "Submit Exam" : "Finish Study"}
        </Button>
      </div>
    </header>
  );
};
