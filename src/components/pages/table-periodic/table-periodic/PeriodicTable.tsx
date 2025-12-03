import { useState, useEffect, useCallback } from "react";
import { Keyboard } from "lucide-react";
import { cn } from "@/lib/utils";
import { PeriodicCell } from "./PeriodicCell";
import { PeriodicElement } from "./types";
import { SearchBar } from "./SearchBar";

interface PeriodicTableProps {
  elements: PeriodicElement[];
}

export const PeriodicTable = ({ elements }: PeriodicTableProps) => {
  const [selectedElement, setSelectedElement] = useState<PeriodicElement | null>(null);
  const [searchQuery, setSearchQuery] = useState("");

  // Create a 2D grid based on idx and idy
  const gridColumns = 19; // 0-18 (groups)
  const gridRows = 11; // 0-10 (periods)

  const handleCellClick = (element: PeriodicElement) => {
    // Only show dialog for actual elements (not headers or empty cells)
    if (
      element.atomicNumber > 0 &&
      element.atomicGroup !== "header" &&
      element.atomicGroup !== "headerEmpty" &&
      element.atomicGroup !== "empty"
    ) {
      setSelectedElement(element);
    }
  };

  const isSelected = (element: PeriodicElement) => {
    return selectedElement?.atomicId === element.atomicId;
  };

  const isHeaderHighlighted = (element: PeriodicElement) => {
    if (!selectedElement) return false;
    
    // Highlight column header if same idx
    if (element.atomicGroup === "header" && element.idx === selectedElement.idx) {
      return true;
    }
    
    // Highlight row header if same idy
    if (element.atomicGroup === "header" && element.idy === selectedElement.idy && element.idx === 0) {
      return true;
    }
    
    return false;
  };

  const matchesSearch = (element: PeriodicElement) => {
    if (!searchQuery.trim()) return false;
    
    const query = searchQuery.toLowerCase().trim();
    const name = element.atomicName.toLowerCase();
    const symbol = element.atomicSymbol.toLowerCase();
    const number = element.atomicNumber.toString();
    
    return name.includes(query) || symbol.includes(query) || number.includes(query);
  };

  const hasSearchResults = searchQuery.trim() && elements.some(el => 
    el.atomicGroup !== "empty" && 
    el.atomicGroup !== "header" && 
    el.atomicGroup !== "headerEmpty" && 
    matchesSearch(el)
  );

  // Get actual element cells (not headers or empty)
  const actualElements = elements.filter(
    el => el.atomicNumber > 0 && 
    el.atomicGroup !== "header" && 
    el.atomicGroup !== "headerEmpty" && 
    el.atomicGroup !== "empty"
  );

  // Navigate to element by arrow keys
  const navigateElement = useCallback((direction: 'up' | 'down' | 'left' | 'right') => {
    if (!selectedElement) {
      // If no element selected, select the first actual element
      const firstElement = actualElements[0];
      if (firstElement) setSelectedElement(firstElement);
      return;
    }

    const { idx, idy } = selectedElement;
    let newIdx = idx;
    let newIdy = idy;

    switch (direction) {
      case 'left':
        newIdx = idx - 1;
        break;
      case 'right':
        newIdx = idx + 1;
        break;
      case 'up':
        newIdy = idy - 1;
        break;
      case 'down':
        newIdy = idy + 1;
        break;
    }

    // Find element at new position
    const newElement = actualElements.find(
      el => el.idx === newIdx && el.idy === newIdy
    );

    if (newElement) {
      setSelectedElement(newElement);
    }
  }, [selectedElement, actualElements]);

  // Clear all filters and selections
  const clearAll = useCallback(() => {
    setSelectedElement(null);
    setSearchQuery("");
  }, []);

  // Keyboard shortcuts handler
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.target as HTMLElement).tagName === 'INPUT') return;

      switch (e.key) {
        case 'ArrowUp':
          e.preventDefault();
          navigateElement('up');
          break;
        case 'ArrowDown':
          e.preventDefault();
          navigateElement('down');
          break;
        case 'ArrowLeft':
          e.preventDefault();
          navigateElement('left');
          break;
        case 'ArrowRight':
          e.preventDefault();
          navigateElement('right');
          break;
        case 'Escape':
          e.preventDefault();
          clearAll();
          break;
        default:
          break;
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => {
      window.removeEventListener('keydown', handleKeyDown);
      clearTimeout((window as any).atomicNumberTimeout);
    };
  }, [navigateElement, clearAll]);

  const cellSize = 70; // Fixed cell size in pixels
  const gap = 4; // Gap between cells
  const tableWidth = (gridColumns * cellSize) + ((gridColumns - 1) * gap) - (cellSize/2);
  const tableHeight = gridRows * cellSize + (gridRows - 1) * gap;

  return (
    <div className="space-y-6">
      <SearchBar
        searchQuery={searchQuery}
        onSearchChange={setSearchQuery}
        hasSearchResults={!!(searchQuery.trim() && hasSearchResults)}
      />

      <div className="w-full overflow-auto p-0 bg-card/50">
        <div className="grid mx-auto px-2 pt-2 mb-5"
          style={{
            gridTemplateColumns: `repeat(${gridColumns}, ${cellSize}px)`,
            gridTemplateRows: `repeat(${gridRows}, ${cellSize}px)`,
            gap: `${gap}px`,
            width: `${tableWidth}px`,
            height: `${tableHeight}px`,
          }}
        >
          {elements.map((element) => {
            const isRowHeader = element.idx === 0 && (element.atomicGroup === "header" || element.atomicGroup === "headerEmpty");
            const isColumnHeader = element.idy === 0 && (element.atomicGroup === "header" || element.atomicGroup === "headerEmpty");
            
            return (
              <div
                key={element.atomicId}
                className={cn(
                  isRowHeader && "sticky left-0 z-10",
                  isColumnHeader && "sticky top-0 z-10",
                  isRowHeader && isColumnHeader && "z-20"
                )}
                style={{
                  gridColumn: element.idx + 1,
                  gridRow: element.idy + 1,
                  width: `${cellSize}px`,
                  height: `${cellSize}px`,
                }}
              >
                <PeriodicCell 
                  element={element} 
                  onCellClick={handleCellClick} 
                  cellSize={cellSize}
                  isSelected={isSelected(element)}
                  isHeaderHighlighted={isHeaderHighlighted(element)}
                  isSearchMatch={matchesSearch(element)}
                  isSearchActive={!!searchQuery.trim()}
                />
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
};