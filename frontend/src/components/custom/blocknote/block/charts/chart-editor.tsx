import React, { useState } from "react";
import { ChartData, ChartType, DEFAULT_PALETTE } from "./chart-types";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { BarChart3, Settings, Table } from "lucide-react";
import { DataTab } from "./component/data-tab";
import { TypeTab } from "./component/type-tab";
import { OptionsTab } from "./component/options-tab";

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
        <TabsContent value="data" className="m-0">
          <DataTab
            data={data}
            updateTitle={updateTitle}
            updateCategory={updateCategory}
            addCategory={addCategory}
            removeCategory={removeCategory}
            updateSeriesName={updateSeriesName}
            updateSeriesColor={updateSeriesColor}
            updateSeriesValue={updateSeriesValue}
            addSeries={addSeries}
            removeSeries={removeSeries}
          />
        </TabsContent>

        {/* Tab 2: Chart Type */}
        <TabsContent value="type" className="m-0">
          <TypeTab data={data} selectType={selectType} />
        </TabsContent>

        {/* Tab 3: Options */}
        <TabsContent value="options" className="m-0">
          <OptionsTab
            data={data}
            updateOption={updateOption}
            applyPalette={applyPalette}
          />
        </TabsContent>
      </Tabs>
    </div>
  );
};
