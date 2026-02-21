import { cn } from "@/lib/utils";
import { PeriodicElement } from "../types/types";
import { getElementStyle } from "../utils/element-styles";
import { EnumPeriodicGroup } from "backend/src/db/schema/table-periodic/types";
import { getColumnGroup } from "../utils/element";

interface PeriodicCellProps {
  element: PeriodicElement;
  onCellClick?: (element: PeriodicElement) => void;
  cellSize: number;
  isSelected?: boolean;
  isHeaderHighlighted?: boolean;
  isSearchMatch?: boolean;
  isSearchActive?: boolean;
  theme?: string; // Add theme prop
}

export const PeriodicCell = ({
  element,
  onCellClick,
  cellSize,
  isSelected = false,
  isHeaderHighlighted = false,
  isSearchMatch = false,
  isSearchActive = false,
  theme = 'theme1', // Default theme
}: PeriodicCellProps) => {
  const { atomicNumber, atomicSymbol, atomicName, atomicGroup } = element;

  // Handle empty cells
  if (atomicGroup === EnumPeriodicGroup.empty) {
    return <div style={{ width: `${cellSize}px`, height: `${cellSize}px` }} />;
  }

  // Handle header cells
  if (atomicGroup === EnumPeriodicGroup.header || atomicGroup === EnumPeriodicGroup.headerEmpty) {
    return (
      <div
        className={cn(
          "flex items-center justify-center transition-all duration-300 border",
          isHeaderHighlighted
            ? "bg-muted/95 shadow-sm"
            : "bg-card/95 backdrop-blur-sm"
        )}
        style={{ width: element.idx === 0 ? `${cellSize / 2}px` : `${cellSize}px`, height: element.idy === 0 ? `${cellSize / 2}px` : `${cellSize}px` }}
      >
        <span className={cn(
          "text-sm font-bold transition-colors",
          isHeaderHighlighted ? "text-primary dark:text-primary-foreground" : "text-foreground dark:text-white/90"
        )}>
          {atomicSymbol}{((element.idy === 0) && (element.idx > 0)) ? (getColumnGroup(atomicSymbol)) : ""}
        </span>
      </div>
    );
  }

  // Handle special cells (Lanthanides/Actinides markers)
  const isSpecialMarker = atomicNumber > 1000;
  const displayNumber = isSpecialMarker ? atomicName : atomicNumber.toString();
  const displaySymbol = isSpecialMarker ? "" : atomicSymbol;
  const displayName = isSpecialMarker ? atomicSymbol : atomicName;

  const elementStyle = getElementStyle(atomicGroup, theme); // Pass theme to getElementStyle
  const colorClass = isSelected ? elementStyle.selected : elementStyle.element;

  return (
    <button
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
    </button>
  );
};