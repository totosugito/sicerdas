import React from "react";
import { ChartData } from "../chart-types";
import { Label } from "@/components/ui/label";
import { BarChart3, LineChart, PieChart, ScatterChart } from "lucide-react";

interface TypeTabProps {
  data: ChartData;
  selectType: (typeKey: string) => void;
}

export const TypeTab: React.FC<TypeTabProps> = ({ data, selectType }) => {
  return (
    <div className="space-y-2 m-0">
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
    </div>
  );
};
