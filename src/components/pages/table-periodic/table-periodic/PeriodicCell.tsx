import { cn } from "@/lib/utils";
import { PeriodicElement, getElementStyle } from "./types";
import { Button } from "@/components/ui/button";

interface PeriodicCellProps {
  element: PeriodicElement;
  onCellClick?: (element: PeriodicElement) => void;
  cellSize: number;
  isSelected?: boolean;
  isHeaderHighlighted?: boolean;
  isSearchMatch?: boolean;
  isSearchActive?: boolean;
}

export const PeriodicCell = ({ 
  element, 
  onCellClick, 
  cellSize, 
  isSelected = false,
  isHeaderHighlighted = false,
  isSearchMatch = false,
  isSearchActive = false,
}: PeriodicCellProps) => {
  const { atomicNumber, atomicSymbol, atomicName, atomicGroup } = element;

  // Handle empty cells
  if (atomicGroup === "empty") {
    return <div style={{ width: `${cellSize}px`, height: `${cellSize}px` }} />;
  }

  // Handle header cells
  if (atomicGroup === "header" || atomicGroup === "headerEmpty") {
    return (
      <div 
        className={cn(
          "flex items-center justify-center transition-all duration-300 border",
          isHeaderHighlighted 
            ? "bg-card/95 border-primary shadow-lg" 
            : "bg-card/95 backdrop-blur-sm border-border/50 dark:border-border"
        )}
        style={{ width: `${cellSize}px`, height: `${cellSize}px` }}
      >
        <span className={cn(
          "text-sm font-bold transition-colors",
          isHeaderHighlighted ? "text-primary dark:text-primary-foreground" : "text-foreground dark:text-white/90"
        )}>
          {atomicSymbol}
        </span>
      </div>
    );
  }

  // Handle special cells (Lanthanides/Actinides markers)
  const isSpecialMarker = atomicNumber > 1000;
  const displayNumber = isSpecialMarker ? atomicName : atomicNumber.toString();
  const displaySymbol = isSpecialMarker ? "" : atomicSymbol;
  const displayName = isSpecialMarker ? atomicSymbol : atomicName;

  const elementStyle = getElementStyle(atomicGroup);
  const colorClass = isSelected ? elementStyle.selected : elementStyle.element;

  return (
    <Button
      onClick={() => onCellClick?.(element)}
      className={cn(
        "relative p-1 rounded-sm transition-all duration-300",
        "flex flex-col items-center justify-center",
        "group cursor-pointer border border-3",
        "h-auto w-full",
        "hover:scale-105 hover:shadow-lg",
        colorClass,
        (isSearchActive && !isSearchMatch) ? "opacity-40 dark:opacity-30" : ""
      )}
      style={{
        width: `${cellSize}px`,
        height: `${cellSize}px`,
      }}
      variant="ghost"
      asChild
    >
      <div>
        {/* Atomic Number */}
        <div className="absolute top-1 left-1 text-xs font-bold">
          {displayNumber}
        </div>

        {/* Symbol - Main Focus */}
        {displaySymbol && (
          <div className="text-xl font-bold">
            {displaySymbol}
          </div>
        )}

        {/* Element Name */}
        <div className="absolute bottom-1 left-1 right-1 text-center text-[0.7rem] font-medium truncate">
          {displayName}
        </div>

        {/* Hover Glow Effect */}
        <div className="absolute inset-0 rounded-sm opacity-0 group-hover:opacity-20 transition-opacity" />
      </div>
    </Button>
  );
};