import React from "react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Search, X, ChevronDown, ChevronUp } from "lucide-react";

interface ConstitutionSearchBarProps {
  searchTerm: string;
  onSearchChange: (val: string) => void;
  onClearSearch: () => void;
  placeholder: string;
  expandedAll: boolean;
  onToggleExpandAll: () => void;
  openAllLabel: string;
  closeAllLabel: string;
  summaryNode?: React.ReactNode;
}

export const ConstitutionSearchBar: React.FC<ConstitutionSearchBarProps> = ({
  searchTerm,
  onSearchChange,
  onClearSearch,
  placeholder,
  expandedAll,
  onToggleExpandAll,
  openAllLabel,
  closeAllLabel,
  summaryNode,
}) => {
  return (
    <div className="w-full">
      <div className="flex flex-row items-center gap-2 sm:gap-3">
        <div className="relative flex-1 min-w-0">
          <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 text-muted-foreground w-4 h-4 pointer-events-none" />
          <Input
            type="text"
            placeholder={placeholder}
            value={searchTerm}
            onChange={(e) => onSearchChange(e.target.value)}
            className="pl-9 sm:pl-10 pr-9 h-10 text-xs sm:text-sm rounded-xl bg-background/60 border-border/80 focus-visible:border-red-500 focus-visible:ring-red-500/20 transition-all"
          />
          {searchTerm && (
            <Button
              onClick={onClearSearch}
              variant="ghost"
              size="icon"
              className="absolute right-1.5 top-1/2 -translate-y-1/2 h-7 w-7 rounded-lg text-muted-foreground hover:text-red-600 dark:hover:text-red-400"
            >
              <X className="w-4 h-4" />
            </Button>
          )}
        </div>

        <Button
          variant="outline"
          onClick={onToggleExpandAll}
          className="h-10 min-w-[7.5rem] sm:min-w-[8.5rem] px-3 sm:px-4 rounded-xl text-xs sm:text-sm font-semibold flex items-center justify-center gap-1.5 shrink-0"
        >
          {expandedAll ? (
            <>
              <ChevronUp className="w-4 h-4" />
              <span>{closeAllLabel}</span>
            </>
          ) : (
            <>
              <ChevronDown className="w-4 h-4" />
              <span>{openAllLabel}</span>
            </>
          )}
        </Button>
      </div>

      {searchTerm && summaryNode && (
        <div className="mt-2.5 text-xs sm:text-sm text-muted-foreground">{summaryNode}</div>
      )}
    </div>
  );
};

/**
 * Builds a regex source that matches the query at the START of a word only,
 * so searching "tuhan" matches "Tuhan" but not the middle of "Ketuhanan".
 * Special regex characters are escaped so inputs like "(1)" or "?" never crash.
 */
function buildWordStartPattern(query: string): string | null {
  const trimmed = query.trim();
  if (!trimmed) return null;
  const escaped = trimmed.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
  return `(?<![\\p{L}\\p{N}])${escaped}`;
}

/** True when the text matches the query (word-start, case-insensitive). Empty query matches all. */
export function matchesConstitutionQuery(text: string, query: string): boolean {
  const pattern = buildWordStartPattern(query);
  if (!pattern) return true;
  return new RegExp(pattern, "iu").test(text);
}

export function highlightConstitutionText(text: string, query: string): React.ReactNode {
  const pattern = buildWordStartPattern(query);
  if (!pattern) return text;

  // With one capture group, split() puts every match at an odd index.
  const parts = text.split(new RegExp(`(${pattern})`, "giu"));

  return parts.map((part, index) =>
    index % 2 === 1 ? (
      <mark
        key={index}
        className="bg-amber-200/90 text-slate-900 dark:bg-amber-400/90 dark:text-slate-950 px-0.5 rounded"
      >
        {part}
      </mark>
    ) : (
      part
    ),
  );
}
