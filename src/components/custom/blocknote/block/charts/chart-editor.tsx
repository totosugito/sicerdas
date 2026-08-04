import React, { useState } from "react";
import { ChartData, ChartType, DEFAULT_PALETTE, PALETTES } from "./chart-types";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { BarChart3, LineChart, PieChart, ScatterChart, Plus, Trash2, Settings, Table, AlignLeft, AlignCenter, AlignRight, Palette } from "lucide-react";

interface ChartEditorProps {
  data: ChartData;
  onChange: (newData: ChartData) => void;
  onSave?: () => void;
  onCancel?: () => void;
  onClose?: () => void;
}

export const ChartEditor: React.FC<ChartEditorProps> = ({
  data,
  onChange,
  onSave,
  onCancel,
  onClose,
}) => {
  const [activeTab, setActiveTab] = useState<string>("data");

  const handleSaveAction = () => {
    if (onSave) onSave();
    else if (onClose) onClose();
  };

  const handleCancelAction = () => {
    if (onCancel) onCancel();
    else if (onClose) onClose();
  };

  const updateTitle = (title: string) => {
    onChange({ ...data, title });
  };

  const updateCategory = (index: number, value: string) => {
    const newCategories = [...data.categories];
    newCategories[index] = value;
    onChange({ ...data, categories: newCategories });
  };

  const addCategory = () => {
    const newCategories = [...data.categories, `Category ${data.categories.length + 1}`];
    const newSeries = data.series.map((s) => ({
      ...s,
      values: [...s.values, 0],
    }));
    onChange({ ...data, categories: newCategories, series: newSeries });
  };

  const removeCategory = (index: number) => {
    if (data.categories.length <= 1) return;
    const newCategories = data.categories.filter((_, i) => i !== index);
    const newSeries = data.series.map((s) => ({
      ...s,
      values: s.values.filter((_, i) => i !== index),
    }));
    onChange({ ...data, categories: newCategories, series: newSeries });
  };

  const updateSeriesName = (seriesIndex: number, name: string) => {
    const newSeries = [...data.series];
    newSeries[seriesIndex] = { ...newSeries[seriesIndex], name };
    onChange({ ...data, series: newSeries });
  };

  const updateSeriesColor = (seriesIndex: number, color: string) => {
    const newSeries = [...data.series];
    newSeries[seriesIndex] = { ...newSeries[seriesIndex], color, colors: undefined };
    onChange({ ...data, series: newSeries });
  };

  const updateSeriesValue = (seriesIndex: number, valIndex: number, numValue: number) => {
    const newSeries = [...data.series];
    const newValues = [...newSeries[seriesIndex].values];
    newValues[valIndex] = isNaN(numValue) ? 0 : numValue;
    newSeries[seriesIndex] = { ...newSeries[seriesIndex], values: newValues };
    onChange({ ...data, series: newSeries });
  };

  const addSeries = () => {
    const nextColor = DEFAULT_PALETTE[data.series.length % DEFAULT_PALETTE.length];
    const newSeriesItem = {
      name: `Series ${data.series.length + 1}`,
      values: new Array(data.categories.length).fill(0),
      color: nextColor,
    };
    onChange({ ...data, series: [...data.series, newSeriesItem] });
  };

  const removeSeries = (seriesIndex: number) => {
    if (data.series.length <= 1) return;
    const newSeries = data.series.filter((_, i) => i !== seriesIndex);
    onChange({ ...data, series: newSeries });
  };

  const selectType = (typeKey: string) => {
    if (typeKey === "bar-horizontal") {
      onChange({
        ...data,
        chartType: "bar",
        options: { ...data.options, horizontal: true },
      });
    } else if (typeKey === "bar") {
      onChange({
        ...data,
        chartType: "bar",
        options: { ...data.options, horizontal: false },
      });
    } else {
      onChange({ ...data, chartType: typeKey as ChartType });
    }
  };

  const updateOption = (key: keyof NonNullable<ChartData["options"]>, value: any) => {
    onChange({
      ...data,
      options: {
        ...data.options,
        [key]: value,
      },
    });
  };

  const applyPalette = (colors: string[]) => {
    const newSeries = data.series.map((s, idx) => ({
      ...s,
      color: colors[idx % colors.length],
      colors: colors,
    }));
    onChange({ ...data, series: newSeries });
  };

  return (
    <div className="bn-chart-editor-container p-2.5 text-xs space-y-2.5 my-1 border border-border/80 rounded-lg bg-card text-card-foreground shadow-sm transition-all">
      <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
        <div className="flex items-center justify-between border-b border-border/50 pb-2 mb-2.5 gap-2">
          <TabsList className="h-7 p-0.5 bg-muted/60 rounded-md gap-0.5">
            <TabsTrigger value="data" className="bn-chart-tab-trigger">
              <Table className="w-3 h-3" />
              Data
            </TabsTrigger>
            <TabsTrigger value="type" className="bn-chart-tab-trigger">
              <BarChart3 className="w-3 h-3" />
              Type
            </TabsTrigger>
            <TabsTrigger value="options" className="bn-chart-tab-trigger">
              <Settings className="w-3 h-3" />
              Options
            </TabsTrigger>
          </TabsList>

          <div className="flex items-center gap-1.5">
            <Button
              type="button"
              size="sm"
              variant="outline"
              className="h-6 text-[10px] px-2 border-border/80 hover:bg-muted/50 rounded-md font-medium"
              onClick={handleCancelAction}
            >
              Cancel
            </Button>
            <Button
              type="button"
              size="sm"
              className="h-6 text-[10px] px-2.5 rounded-md font-semibold shadow-2xs"
              onClick={handleSaveAction}
            >
              Done
            </Button>
          </div>
        </div>

        {/* Tab 1: Data Editor */}
        <TabsContent value="data" className="space-y-2.5 m-0">
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
        </TabsContent>

        {/* Tab 2: Chart Type */}
        <TabsContent value="type" className="space-y-2 m-0">
          <Label className="text-[10px] font-semibold text-muted-foreground uppercase">
            Select Visualization Type
          </Label>
          <div className="grid grid-cols-4 sm:grid-cols-8 gap-1.5">
            {[
              { type: "bar", label: "Bar", icon: BarChart3, isSelected: data.chartType === "bar" && !data.options?.horizontal },
              { type: "bar-horizontal", label: "H. Bar", icon: BarChart3, isSelected: data.chartType === "bar" && !!data.options?.horizontal },
              { type: "line", label: "Line", icon: LineChart, isSelected: data.chartType === "line" },
              { type: "pie", label: "Pie", icon: PieChart, isSelected: data.chartType === "pie" },
              { type: "doughnut", label: "Doughnut", icon: PieChart, isSelected: data.chartType === "doughnut" },
              { type: "area", label: "Area", icon: LineChart, isSelected: data.chartType === "area" },
              { type: "radar", label: "Radar", icon: BarChart3, isSelected: data.chartType === "radar" },
              { type: "scatter", label: "Scatter", icon: ScatterChart, isSelected: data.chartType === "scatter" },
            ].map((item) => {
              const Icon = item.icon;
              return (
                <button
                  key={item.type}
                  type="button"
                  onClick={() => selectType(item.type)}
                  className={`bn-chart-type-card ${item.isSelected ? "active" : ""}`}
                >
                  <Icon className="w-4 h-4" />
                  <span className="text-[10px] font-medium">{item.label}</span>
                </button>
              );
            })}
          </div>
        </TabsContent>

        {/* Tab 3: Options */}
        <TabsContent value="options" className="space-y-2 m-0">
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
                      className={`h-6 text-[10px] flex-1 flex items-center gap-1 rounded font-medium ${isSelected ? "shadow-2xs" : "border-border/70"
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
                      className={`h-6 text-[10px] flex-1 rounded font-medium ${isSelected ? "shadow-2xs" : "border-border/70"
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
        </TabsContent>
      </Tabs>
    </div>
  );
};
