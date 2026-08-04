export type ChartType = "bar" | "line" | "area" | "pie" | "doughnut" | "radar" | "scatter";

export interface ChartSeries {
  name: string;
  values: number[];
  color?: string;
  colors?: string[];
}

export interface ChartOptions {
  showLegend?: boolean;
  showGrid?: boolean;
  stacked?: boolean;
  horizontal?: boolean;
  showValues?: boolean;
  xAxisLabel?: string;
  yAxisLabel?: string;
  alignment?: "left" | "center" | "right";
  width?: "full" | "medium" | "small";
}

export interface ChartData {
  chartType: ChartType;
  title?: string;
  categories: string[];
  series: ChartSeries[];
  options?: ChartOptions;
}

export const DEFAULT_PALETTE = [
  "#3b82f6", // Blue
  "#10b981", // Emerald
  "#f59e0b", // Amber
  "#ef4444", // Red
  "#8b5cf6", // Purple
  "#ec4899", // Pink
];

export const PALETTES: Record<string, string[]> = {
  Default: ["#3b82f6", "#10b981", "#f59e0b", "#ef4444", "#8b5cf6", "#ec4899"],
  Ocean: ["#0ea5e9", "#06b6d4", "#14b8a6", "#22c55e", "#84cc16", "#eab308"],
  Sunset: ["#f43f5e", "#f97316", "#f59e0b", "#eab308", "#a3e635", "#22c55e"],
  Monochrome: ["#1e293b", "#334155", "#475569", "#64748b", "#94a3b8", "#cbd5e1"],
};

export const DEFAULT_CHART_DATA: ChartData = {
  chartType: "bar",
  title: "Chart Title",
  categories: ["Category 1", "Category 2", "Category 3"],
  series: [
    {
      name: "Series 1",
      values: [40, 65, 50],
      color: DEFAULT_PALETTE[0],
    },
  ],
  options: {
    showLegend: true,
    showGrid: true,
    showValues: false,
    alignment: "center",
    width: "full",
  },
};
