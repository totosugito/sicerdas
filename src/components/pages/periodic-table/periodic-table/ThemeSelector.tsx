import { useState } from "react";
import { cn } from "@/lib/utils";
import { PeriodicCell } from "./PeriodicCell";
import { EnumPeriodicViewMode } from "@/constants/app-enum";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Button } from "@/components/ui/button";
import { useTranslation } from "react-i18next";

interface ThemeSelectorProps {
  currentTheme: string;
  onThemeChange: (theme: string) => void;
}

export function ThemeSelector({ currentTheme, onThemeChange }: ThemeSelectorProps) {
  const { t } = useTranslation();
  const [popoverOpen, setPopoverOpen] = useState(false);

  // Sample element for theme preview
  const themeElement = {
    "atomicId": 21,
    "idx": 1,
    "idy": 1,
    "atomicNumber": 1,
    "atomicGroup": "otherNonMetals",
    "atomicName": "",
    "atomicSymbol": "H"
  };

  // Handle theme change
  const handleThemeChange = (newTheme: string) => {
    onThemeChange(newTheme);
  };

  return (
    <div className="flex items-center gap-2">
      <Popover open={popoverOpen} onOpenChange={setPopoverOpen}>
        <PopoverTrigger asChild>
          <Button variant="outline" className="w-[180px] justify-between">
            <span>
              {Object.values(EnumPeriodicViewMode).find(t => t.value === currentTheme)?.label || 
               t('periodicTable.searchBar.placeholder')}
            </span>
            <span className="ml-2">▼</span>
          </Button>
        </PopoverTrigger>
        <PopoverContent className="w-[300px] p-4" align="end">
          <div className="space-y-4">
            <div className="text-center">
              <h4 className="font-medium">{t('periodicTable.periodicTable.themeSelector.previewTitle')}</h4>
              <p className="text-sm text-muted-foreground">
                {t('periodicTable.periodicTable.themeSelector.currentSelection')}: {
                  Object.values(EnumPeriodicViewMode).find(t => t.value === currentTheme)?.label
                }
              </p>
            </div>
            
            {/* Large Preview Cell */}
            <div className="flex justify-center">
              <div className="w-24 h-24 flex items-center justify-center">
                <PeriodicCell
                  element={themeElement}
                  cellSize={96}
                  theme={currentTheme}
                />
              </div>
            </div>
            
            <div className="grid grid-cols-2 gap-2">
              {Object.values(EnumPeriodicViewMode).map((themeOption) => (
                <div
                  key={themeOption.value}
                  onClick={() => handleThemeChange(themeOption.value)}
                  className={cn(
                    "p-2 rounded-md border transition-all flex flex-col items-center gap-2 cursor-pointer",
                    currentTheme === themeOption.value 
                      ? "border-primary bg-primary/10" 
                      : "border-muted hover:bg-muted/50"
                  )}
                  role="button"
                  tabIndex={0}
                  onKeyDown={(e) => {
                    if (e.key === 'Enter' || e.key === ' ') {
                      e.preventDefault();
                      handleThemeChange(themeOption.value);
                    }
                  }}
                >
                  <div className="w-14 h-14 flex items-center justify-center">
                    <PeriodicCell
                      element={themeElement}
                      cellSize={56}
                      theme={themeOption.value}
                    />
                  </div>
                  <span className="text-xs">{themeOption.label}</span>
                </div>
              ))}
            </div>
          </div>
        </PopoverContent>
      </Popover>
    </div>
  );
}