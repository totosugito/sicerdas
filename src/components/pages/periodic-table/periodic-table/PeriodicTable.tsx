import { useState, useEffect, useCallback, useMemo } from "react";
import { cn } from "@/lib/utils";
import { PeriodicCell } from "./PeriodicCell";
import { PeriodicElement } from "./types";
import { SearchBar } from "./SearchBar";
import { PeriodicTableHeader } from "./PeriodicTableHeader";
import { ThemeSelector } from "./ThemeSelector";
import { ElementDetailPopover } from "./ElementDetailPopover";
import { useAppStore } from "@/stores/useAppStore";
import { EnumPeriodicGroup } from "backend/src/db/schema/enum-app";

interface PeriodicTableProps {
  elements: PeriodicElement[];
  theme?: string; // Add theme prop
}

export const PeriodicTable = ({ elements, theme = 'theme1' }: PeriodicTableProps) => { // Accept theme prop
  const store = useAppStore();
  const pageProps = store.periodicTable;

  const [searchQuery, setSearchQuery] = useState("");
  const [windowWidth, setWindowWidth] = useState(typeof window !== 'undefined' ? window.innerWidth : 1200);

  // Create a 2D grid based on idx and idy
  const gridColumns = 19; // 0-18 (groups)
  const gridRows = 11; // 0-10 (periods)

  const handleCellClick = (element: PeriodicElement) => {
    // Only show dialog for actual elements (not headers or empty cells)
    if (
      element.atomicNumber > 0 &&
      element.atomicGroup !== EnumPeriodicGroup.header &&
      element.atomicGroup !== EnumPeriodicGroup.headerEmpty &&
      element.atomicGroup !== EnumPeriodicGroup.empty
    ) {
      // With the popover implementation, we don't need to set state here
      // The popover will handle its own open/close state
      return;
    }
  };

  const isSelected = (element: PeriodicElement) => {
    // With popover implementation, we no longer track selected element state
    return false;
  };

  const isHeaderHighlighted = (element: PeriodicElement) => {
    // With popover implementation, we no longer highlight headers based on selection
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
    el.atomicGroup !== EnumPeriodicGroup.empty &&
    el.atomicGroup !== EnumPeriodicGroup.header &&
    el.atomicGroup !== EnumPeriodicGroup.headerEmpty &&
    matchesSearch(el)
  );

  // Get actual element cells (not headers or empty)
  const actualElements = elements.filter(
    el => el.atomicNumber > 0 &&
      el.atomicGroup !== EnumPeriodicGroup.header &&
      el.atomicGroup !== EnumPeriodicGroup.headerEmpty &&
      el.atomicGroup !== EnumPeriodicGroup.empty
  );

  // Handle window resize
  useEffect(() => {
    if (typeof window === 'undefined') return;

    const handleResize = () => {
      setWindowWidth(window.innerWidth);
    };

    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  // Calculate dynamic cell size based on screen width
  const { cellSize, gap } = useMemo(() => {
    // Define breakpoints and corresponding cell sizes
    if (windowWidth < 1024) {
      // Medium screens (tablet)
      return { cellSize: 65, gap: 3 };
    } else {
      // Large screens (desktop)
      return { cellSize: 70, gap: 4 };
    }
  }, [windowWidth]);

  // Calculate table dimensions
  const tableWidth = (cellSize / 2) + ((gridColumns - 1) * cellSize) + ((gridColumns - 1) * gap);
  const tableHeight = (cellSize / 2) + (7 * cellSize) + (cellSize / 2) + ((gridRows - 9) * cellSize) + (gridRows - 1) * gap;

  // Navigate to element by arrow keys
  const navigateElement = useCallback((direction: 'up' | 'down' | 'left' | 'right') => {
    // With popover implementation, we no longer need keyboard navigation for element selection
    return;
  }, []);

  // Clear all filters and selections
  const clearAll = useCallback(() => {
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
    };
  }, [navigateElement, clearAll]);

  // Handle theme change
  const handleThemeChange = (newTheme: string) => {
    store.setPeriodicTable({ ...pageProps, viewMode: newTheme });
  };

  // Dynamic cellSize and gap are calculated above with useMemo

  return (
    <div className="space-y-4">
      <PeriodicTableHeader totalElements={elements.length} />
      <div className="space-y-4 px-4">
      <div className="flex w-full justify-center items-center">
        <div className="px-0 flex w-full gap-4" style={{ width: `${tableWidth}px` }}>
          <div className="w-full">
            <SearchBar
              searchQuery={searchQuery}
              onSearchChange={setSearchQuery}
              hasSearchResults={!!(searchQuery.trim() && hasSearchResults)}
            />
          </div>

          {/* Theme Selector with Popover Preview */}
          <div className="flex flex-1 justify-end items-center">
            <ThemeSelector 
              currentTheme={pageProps.viewMode} 
              onThemeChange={handleThemeChange} 
            />
          </div>
        </div>
      </div>

      <div className="w-full overflow-auto pt-2 mb-0">
        <div className="grid mx-auto bg-card/50 mb-5"
          style={{
            gridTemplateColumns: `minmax(0, ${cellSize / 2}px) repeat(${gridColumns - 1}, minmax(0, ${cellSize}px))`,
            gridTemplateRows: `minmax(0, ${cellSize / 2}px) repeat(7, minmax(0, ${cellSize}px)) minmax(0, ${cellSize / 2}px) repeat(${gridRows - 9}, minmax(0, ${cellSize}px))`,
            gap: `${gap}px`,
            width: `${tableWidth}px`,
            height: `${tableHeight}px`,
          }}
        >
          {elements.map((element) => {
            const isRowHeader = element.idx === 0 && (element.atomicGroup === EnumPeriodicGroup.header || element.atomicGroup === EnumPeriodicGroup.headerEmpty);
            const isColumnHeader = element.idy === 0 && (element.atomicGroup === EnumPeriodicGroup.header || element.atomicGroup === EnumPeriodicGroup.headerEmpty);

            // Calculate cell dimensions based on whether it's a header cell
            const cellWidth = isRowHeader ? cellSize / 2 : cellSize;
            const cellHeight = isColumnHeader || element.idy === 8 ? cellSize / 2 : cellSize;

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
                  width: `${cellWidth}px`,
                  height: `${cellHeight}px`,
                }}
              >
                {element.atomicNumber >= 1 && element.atomicNumber <= 200 ? (
                  <ElementDetailPopover 
                    element={element}
                    theme={pageProps.viewMode}
                  >
                    <PeriodicCell
                      element={element}
                      cellSize={cellSize}
                      isSelected={isSelected(element)}
                      isHeaderHighlighted={isHeaderHighlighted(element)}
                      isSearchMatch={matchesSearch(element)}
                      isSearchActive={!!searchQuery.trim()}
                      theme={pageProps.viewMode} // Pass theme to PeriodicCell
                    />
                  </ElementDetailPopover>
                ) : (
                  <PeriodicCell
                    element={element}
                    cellSize={cellSize}
                    isSelected={isSelected(element)}
                    isHeaderHighlighted={isHeaderHighlighted(element)}
                    isSearchMatch={matchesSearch(element)}
                    isSearchActive={!!searchQuery.trim()}
                    theme={pageProps.viewMode} // Pass theme to PeriodicCell
                  />
                )}
              </div>
            );
          })}
        </div>
      </div>
    </div>
    </div>
  );
};