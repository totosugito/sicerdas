import React from "react";
import { ChartData, PALETTES } from "../chart-types";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { AlignLeft, AlignCenter, AlignRight } from "lucide-react";

interface OptionsTabProps {
  data: ChartData;
  updateOption: (key: keyof NonNullable<ChartData["options"]>, value: any) => void;
  applyPalette: (colors: string[]) => void;
}

export const OptionsTab: React.FC<OptionsTabProps> = ({
  data,
  updateOption,
  applyPalette,
}) => {
  return (
    <div className="space-y-2 m-0">
      <div className="space-y-1.5 bg-background p-2 border border-border/60 rounded-lg">
        <div className="flex items-center justify-between">
          <Label className="text-xs font-medium">Show Legend</Label>
          <Switch
            checked={data.options?.showLegend ?? true}
            onCheckedChange={(v) => updateOption("showLegend", v)}
          />
        </div>

        {data.chartType !== "pie" && data.chartType !== "doughnut" && data.chartType !== "radar" && (
          <>
            <div className="flex items-center justify-between border-t border-border/40 pt-1.5">
              <Label className="text-xs font-medium">Show Grid Lines</Label>
              <Switch
                checked={data.options?.showGrid ?? true}
                onCheckedChange={(v) => updateOption("showGrid", v)}
              />
            </div>

            <div className="flex items-center justify-between border-t border-border/40 pt-1.5">
              <Label className="text-xs font-medium">Stacked Series</Label>
              <Switch
                checked={data.options?.stacked ?? false}
                onCheckedChange={(v) => updateOption("stacked", v)}
              />
            </div>

            <div className="flex items-center justify-between border-t border-border/40 pt-1.5">
              <Label className="text-xs font-medium">Show Trendline (y = mx + c)</Label>
              <Switch
                checked={data.options?.showTrendline ?? false}
                onCheckedChange={(v) => updateOption("showTrendline", v)}
              />
            </div>

            {data.options?.showTrendline && (
              <>
                <div className="flex items-center justify-between border-t border-border/40 pt-1.5 pl-3">
                  <Label className="text-xs font-medium text-muted-foreground">Extend Trendline to Full Area</Label>
                  <Switch
                    checked={data.options?.fullTrendline ?? false}
                    onCheckedChange={(v) => updateOption("fullTrendline", v)}
                  />
                </div>

                <div className="flex items-center justify-between border-t border-border/40 pt-1.5 pl-3 gap-2">
                  <Label className="text-xs font-medium text-muted-foreground shrink-0">Line Style</Label>
                  <div className="flex items-center gap-1">
                    <Button
                      type="button"
                      variant={(data.options?.trendlineStyle || "dashed") === "dashed" ? "default" : "outline"}
                      size="sm"
                      className="h-5 text-[10px] px-2 rounded font-medium"
                      onClick={() => updateOption("trendlineStyle", "dashed")}
                    >
                      Dashed
                    </Button>
                    <Button
                      type="button"
                      variant={(data.options?.trendlineStyle || "dashed") === "solid" ? "default" : "outline"}
                      size="sm"
                      className="h-5 text-[10px] px-2 rounded font-medium"
                      onClick={() => updateOption("trendlineStyle", "solid")}
                    >
                      Solid
                    </Button>
                  </div>
                </div>
              </>
            )}
          </>
        )}

        {data.chartType === "bar" && (
          <div className="flex items-center justify-between border-t border-border/40 pt-1.5">
            <Label className="text-xs font-medium">Horizontal Bar</Label>
            <Switch
              checked={data.options?.horizontal ?? false}
              onCheckedChange={(v) => updateOption("horizontal", v)}
            />
          </div>
        )}

        <div className="flex items-center justify-between border-t border-border/40 pt-1.5">
          <Label className="text-xs font-medium">Show Data Values</Label>
          <Switch
            checked={data.options?.showValues ?? false}
            onCheckedChange={(v) => updateOption("showValues", v)}
          />
        </div>

        {data.options?.showValues && (
          <div className="flex items-center justify-between border-t border-border/40 pt-1.5 pl-3 gap-2">
            <Label className="text-xs font-medium text-muted-foreground shrink-0">Label Format</Label>
            <div className="flex items-center gap-1">
              <Button
                type="button"
                variant={(data.options?.valueLabelFormat || "y") === "y" ? "default" : "outline"}
                size="sm"
                className="h-5 text-[10px] px-2 rounded font-medium"
                onClick={() => updateOption("valueLabelFormat", "y")}
              >
                Y (65)
              </Button>
              <Button
                type="button"
                variant={(data.options?.valueLabelFormat || "y") === "xy" ? "default" : "outline"}
                size="sm"
                className="h-5 text-[10px] px-2 rounded font-medium"
                onClick={() => updateOption("valueLabelFormat", "xy")}
              >
                (X, Y) (2, 65)
              </Button>
            </div>
          </div>
        )}
      </div>

      {/* Axis Labels Inputs */}
      {data.chartType !== "pie" && data.chartType !== "doughnut" && data.chartType !== "radar" && (
        <div className="grid grid-cols-2 gap-2 bg-background p-2 border border-border/60 rounded-lg">
          <div className="space-y-1">
            <Label className="text-[10px] font-semibold text-muted-foreground uppercase">X-Axis Label</Label>
            <Input
              value={data.options?.xAxisLabel || ""}
              onChange={(e) => updateOption("xAxisLabel", e.target.value)}
              placeholder="X Axis..."
              className="h-6 text-xs px-1.5 py-0"
            />
          </div>
          <div className="space-y-1">
            <Label className="text-[10px] font-semibold text-muted-foreground uppercase">Y-Axis Label</Label>
            <Input
              value={data.options?.yAxisLabel || ""}
              onChange={(e) => updateOption("yAxisLabel", e.target.value)}
              placeholder="Y Axis..."
              className="h-6 text-xs px-1.5 py-0"
            />
          </div>
        </div>
      )}

      {/* Palette Preset Swatches */}
      <div className="bg-background p-2 border border-border/60 rounded-lg space-y-1.5">
        <Label className="text-[10px] font-semibold text-muted-foreground uppercase block">Color Palette Presets</Label>
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-1.5">
          {Object.entries(PALETTES).map(([pName, pColors]) => (
            <button
              key={pName}
              type="button"
              onClick={() => applyPalette(pColors)}
              className="flex items-center justify-between p-1.5 border border-border/60 rounded hover:bg-muted/50 text-[10px] font-medium"
            >
              <span>{pName}</span>
              <div className="flex items-center gap-0.5">
                {pColors.slice(0, 3).map((c, i) => (
                  <span key={i} className="w-2.5 h-2.5 rounded-full" style={{ backgroundColor: c }} />
                ))}
              </div>
            </button>
          ))}
        </div>
      </div>

      {/* Alignment & Container Width Controls */}
      <div className="space-y-2 bg-background p-2 border border-border/60 rounded-lg">
        <div>
          <Label className="text-[10px] font-semibold text-muted-foreground uppercase block mb-1">
            Alignment
          </Label>
          <div className="flex items-center gap-1">
            {[
              { align: "left", label: "Left", icon: AlignLeft },
              { align: "center", label: "Center", icon: AlignCenter },
              { align: "right", label: "Right", icon: AlignRight },
            ].map((item) => {
              const Icon = item.icon;
              const isSelected = (data.options?.alignment || "center") === item.align;
              return (
                <Button
                  key={item.align}
                  type="button"
                  variant={isSelected ? "default" : "outline"}
                  size="sm"
                  className={`h-6 text-[10px] flex-1 flex items-center gap-1 rounded font-medium ${
                    isSelected ? "shadow-2xs" : "border-border/70"
                  }`}
                  onClick={() => updateOption("alignment", item.align)}
                >
                  <Icon className="w-3 h-3" />
                  {item.label}
                </Button>
              );
            })}
          </div>
        </div>

        <div className="border-t border-border/40 pt-1.5">
          <Label className="text-[10px] font-semibold text-muted-foreground uppercase block mb-1">
            Container Width
          </Label>
          <div className="flex items-center gap-1">
            {[
              { w: "full", label: "Full (100%)" },
              { w: "medium", label: "Medium (75%)" },
              { w: "small", label: "Small (50%)" },
            ].map((item) => {
              const isSelected = (data.options?.width || "full") === item.w;
              return (
                <Button
                  key={item.w}
                  type="button"
                  variant={isSelected ? "default" : "outline"}
                  size="sm"
                  className={`h-6 text-[10px] flex-1 rounded font-medium ${
                    isSelected ? "shadow-2xs" : "border-border/70"
                  }`}
                  onClick={() => updateOption("width", item.w)}
                >
                  {item.label}
                </Button>
              );
            })}
          </div>
        </div>
      </div>
    </div>
  );
};
