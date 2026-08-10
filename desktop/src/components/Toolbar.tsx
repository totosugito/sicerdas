import React, { useState, useEffect } from "react";
import {
  CheckCircle2,
  FolderOpen,
  ArrowUp,
  RefreshCw,
  Home,
  ArrowLeft,
  ArrowRight,
} from "lucide-react";
import { VscMarkdown, VscJson } from "react-icons/vsc";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

import { DesktopLoginDialog } from "./DesktopLoginDialog";

interface ToolbarProps {
  currentFolderPath: string | null;
  isDirty: boolean;
  saveStatus: string | null;
  canGoBack: boolean;
  canGoForward: boolean;
  showRawMarkdown: boolean;
  showRawJson: boolean;
  onBack: () => void;
  onForward: () => void;
  onOpenFolder: () => void;
  onNavigateUp: () => void;
  onRefresh: () => void;
  onGoHome: () => void;
  onNavigateToPath: (path: string) => void;
  onSave: () => void;
  onToggleRawMarkdown: () => void;
  onToggleRawJson: () => void;
}

export function Toolbar({
  currentFolderPath,
  isDirty,
  saveStatus,
  canGoBack,
  canGoForward,
  showRawMarkdown,
  showRawJson,
  onBack,
  onForward,
  onOpenFolder,
  onNavigateUp,
  onRefresh,
  onGoHome,
  onNavigateToPath,
  onSave,
  onToggleRawMarkdown,
  onToggleRawJson,
}: ToolbarProps) {
  const [draftPath, setDraftPath] = useState(currentFolderPath ?? "");

  useEffect(() => {
    setDraftPath(currentFolderPath ?? "");
  }, [currentFolderPath]);

  useEffect(() => {
    const handler = (e: KeyboardEvent) => {
      if ((e.ctrlKey || e.metaKey) && e.key.toLowerCase() === "s") {
        e.preventDefault();
        if (isDirty) onSave();
      }
    };
    window.addEventListener("keydown", handler);
    return () => window.removeEventListener("keydown", handler);
  }, [isDirty, onSave]);

  const handleEnter = () => {
    const target = draftPath.trim();
    if (target && target !== currentFolderPath) {
      onNavigateToPath(target);
    }
  };

  return (
    <header className="h-10 w-full border-b bg-card/60 backdrop-blur-md flex items-center justify-between px-3 shrink-0 gap-2">
      {/* Left: Navigation, Actions & View Toggle */}
      <div className="flex items-center gap-1 shrink-0">
        <Button
          variant="ghost"
          size="icon-sm"
          onClick={onBack}
          disabled={!canGoBack}
          title="Back (history)"
          className="disabled:opacity-25 disabled:border-transparent w-8 h-8 items-center flex"
        >
          <ArrowLeft className="h-4 w-4" />
        </Button>

        <Button
          variant="ghost"
          size="icon-sm"
          onClick={onForward}
          disabled={!canGoForward}
          title="Forward (history)"
          className="w-8 h-8 items-center flex disabled:opacity-25 disabled:border-transparent"
        >
          <ArrowRight className="h-4 w-4" />
        </Button>

        <div className="h-5 w-px bg-border shrink-0 mx-0.5" />

        <Button
          variant="ghost"
          size="icon-sm"
          onClick={onOpenFolder}
          title="Browse and open a directory folder"
          className="w-8 h-8 items-center flex "
        >
          <FolderOpen className="h-4 w-4" />
        </Button>

        <Button
          variant="ghost"
          size="icon-sm"
          onClick={onNavigateUp}
          title="Up to Parent Directory"
          disabled={!currentFolderPath || currentFolderPath === "/"}
          className="w-8 h-8 items-center flex"
        >
          <ArrowUp className="h-4 w-4" />
        </Button>

        <Button
          variant="ghost"
          size="icon-sm"
          onClick={onRefresh}
          title="Refresh Folder"
          className="w-8 h-8 items-center flex"
        >
          <RefreshCw className="h-4 w-4" />
        </Button>

        <Button
          variant="ghost"
          size="icon-sm"
          onClick={onGoHome}
          title="Go to Default OS Path"
          className="w-8 h-8 items-center flex"
        >
          <Home className="h-4 w-4" />
        </Button>

        <div className="h-5 w-px bg-border shrink-0 mx-0.5" />
        <Button
          variant={showRawMarkdown ? "outline" : "ghost"}
          size="icon-sm"
          onClick={onToggleRawMarkdown}
          title={showRawMarkdown ? "Show rendered markdown" : "Show raw markdown"}
          className="w-8 h-8 items-center flex rounded-md"
        >
          <VscMarkdown className="h-4 w-4" />
        </Button>
        <Button
          variant={showRawJson ? "outline" : "ghost"}
          size="icon-sm"
          onClick={onToggleRawJson}
          title={showRawJson ? "Show rendered JSON" : "Show raw JSON"}
          className="w-8 h-8 items-center flex rounded-md"
        >
          <VscJson className="h-4 w-4" />
        </Button>
      </div>

      <div className="h-5 w-px bg-border shrink-0" />

      {/* Center: Editable Address Bar */}
      <div className="flex-1 min-w-0 flex items-stretch gap-2">
        <Input
          value={draftPath}
          onChange={(e) => setDraftPath(e.target.value)}
          onKeyDown={(e) => {
            if (e.key === "Enter") handleEnter();
            if (e.key === "Escape") setDraftPath(currentFolderPath ?? "");
          }}
          onBlur={() => setDraftPath(currentFolderPath ?? "")}
          spellCheck={false}
          placeholder="Type a directory path and press Enter"
          className="h-7 text-[11px] font-mono focus-visible:ring-1"
          title="Type a directory path and press Enter to navigate"
        />
      </div>

      {/* Right: Actions */}
      <div className="flex items-center gap-2 shrink-0">
        {saveStatus && (
          <span className="flex items-center gap-1 text-xs text-emerald-600 font-medium">
            <CheckCircle2 className="h-3.5 w-3.5" />
            {saveStatus}
          </span>
        )}
        <DesktopLoginDialog />
      </div>
    </header>
  );
}
