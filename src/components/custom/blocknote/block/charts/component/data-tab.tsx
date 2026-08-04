import React from "react";
import { ChartData, DEFAULT_PALETTE } from "../chart-types";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Plus, Trash2 } from "lucide-react";

interface DataTabProps {
  data: ChartData;
  updateTitle: (title: string) => void;
  updateCategory: (index: number, value: string) => void;
  addCategory: () => void;
  removeCategory: (index: number) => void;
  updateSeriesName: (seriesIndex: number, name: string) => void;
  updateSeriesColor: (seriesIndex: number, color: string) => void;
  updateSeriesValue: (seriesIndex: number, valIndex: number, numValue: number) => void;
  addSeries: () => void;
  removeSeries: (seriesIndex: number) => void;
}

export const DataTab: React.FC<DataTabProps> = ({
  data,
  updateTitle,
  updateCategory,
  addCategory,
  removeCategory,
  updateSeriesName,
  updateSeriesColor,
  updateSeriesValue,
  addSeries,
  removeSeries,
}) => {
  return (
    <div className="space-y-2.5 m-0">
      <div className="flex items-center gap-2">
        <Label className="text-[11px] font-semibold text-muted-foreground shrink-0 w-20">
          Chart Title
        </Label>
        <Input
          value={data.title || ""}
          onChange={(e) => updateTitle(e.target.value)}
          placeholder="Enter chart title..."
          className="h-6 text-xs bg-background border-border/70 focus-visible:ring-1 focus-visible:ring-primary/40 rounded flex-1"
        />
      </div>

      {/* Category Management Section */}
      <div className="bn-chart-section-card space-y-1.5 p-1.5">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-1.5">
            <Label className="text-xs font-bold text-foreground">Categories</Label>
            <span className="text-[9px] font-semibold px-1.5 py-0.2 rounded-full bg-muted text-muted-foreground border border-border/50">
              {data.categories.length}
            </span>
          </div>
          <Button
            type="button"
            variant="outline"
            size="sm"
            className="h-5 text-[10px] px-1.5 py-0 flex items-center gap-0.5 bg-background border-border/70 hover:bg-muted/60 rounded font-medium"
            onClick={addCategory}
          >
            <Plus className="w-2.5 h-2.5 text-muted-foreground" /> Add
          </Button>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-1">
          {data.categories.map((cat, idx) => (
            <div
              key={idx}
              className="flex items-center gap-0.5 p-0.5 border border-border/60 rounded bg-background"
            >
              <Input
                value={cat}
                onChange={(e) => updateCategory(idx, e.target.value)}
                className="h-5 text-xs px-1 py-0 bg-transparent border-0 focus-visible:ring-0 flex-1 min-w-0"
                placeholder={`Cat ${idx + 1}`}
              />
              {data.categories.length > 1 && (
                <button
                  type="button"
                  onClick={() => removeCategory(idx)}
                  className="text-muted-foreground hover:text-red-500 w-4 h-4 flex items-center justify-center shrink-0 rounded hover:bg-red-500/10 transition-colors"
                  title="Remove category"
                >
                  <Trash2 className="w-2.5 h-2.5" />
                </button>
              )}
            </div>
          ))}
        </div>
      </div>

      {/* Series & Values Data Cards */}
      <div className="space-y-1.5">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-1.5">
            <Label className="text-xs font-bold text-foreground">Series & Values</Label>
            <span className="text-[9px] font-semibold px-1.5 py-0.2 rounded-full bg-muted text-muted-foreground border border-border/50">
              {data.series.length}
            </span>
          </div>
          <Button
            type="button"
            variant="outline"
            size="sm"
            className="h-5 text-[10px] px-1.5 py-0 flex items-center gap-0.5 bg-background border-border/70 hover:bg-muted/60 rounded font-medium"
            onClick={addSeries}
          >
            <Plus className="w-2.5 h-2.5 text-muted-foreground" /> Add Series
          </Button>
        </div>

        <div className="space-y-1.5">
          {data.series.map((s, sIdx) => (
            <div
              key={sIdx}
              className="bn-chart-section-card border border-border/70 rounded-md p-1.5 bg-card space-y-1.5"
            >
              {/* Series Header: Color & Name */}
              <div className="flex items-center justify-between border-b border-border/40 pb-1">
                <div className="flex items-center gap-1 flex-1 max-w-xs">
                  <input
                    type="color"
                    value={s.color || DEFAULT_PALETTE[sIdx % DEFAULT_PALETTE.length]}
                    onChange={(e) => updateSeriesColor(sIdx, e.target.value)}
                    className="w-3.5 h-3.5 rounded-full cursor-pointer border border-background shadow-2xs p-0 bg-transparent shrink-0"
                    title="Series color"
                  />
                  <Input
                    value={s.name}
                    onChange={(e) => updateSeriesName(sIdx, e.target.value)}
                    className="h-5 text-xs px-1.5 py-0 font-bold bg-muted/30 border-border/40 focus-visible:ring-1 focus-visible:ring-primary/40 rounded flex-1"
                    placeholder={`Series ${sIdx + 1}`}
                  />
                </div>
                {data.series.length > 1 && (
                  <button
                    type="button"
                    onClick={() => removeSeries(sIdx)}
                    className="text-muted-foreground hover:text-red-500 w-4 h-4 flex items-center justify-center rounded hover:bg-red-500/10 transition-colors"
                    title="Remove series"
                  >
                    <Trash2 className="w-2.5 h-2.5" />
                  </button>
                )}
              </div>

              {/* Values Grid */}
              <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-1.5">
                {data.categories.map((cat, cIdx) => (
                  <div
                    key={cIdx}
                    className="space-y-0.5 p-1 border border-border/40 rounded bg-background/80"
                  >
                    <span
                      className="text-[9px] font-semibold text-muted-foreground block truncate uppercase"
                      title={cat || `Cat ${cIdx + 1}`}
                    >
                      {cat || `Cat ${cIdx + 1}`}
                    </span>
                    <Input
                      type="number"
                      value={s.values[cIdx] ?? 0}
                      onChange={(e) =>
                        updateSeriesValue(sIdx, cIdx, parseFloat(e.target.value))
                      }
                      className="h-6 text-xs px-1.5 py-0 bg-background font-mono font-medium text-right border-border/40 focus-visible:ring-1 focus-visible:ring-primary/40 rounded"
                    />
                  </div>
                ))}
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};
