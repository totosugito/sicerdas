import React, { useMemo } from "react";
import { ReactECharts } from "@/components/charts/ReactECharts";
import { ChartData } from "./chart-types";
import { chartDataToEChartsOption } from "./chart-mapper";
import { cn } from "@/lib/utils";

interface ChartRendererProps {
  data: ChartData;
  className?: string;
  height?: string | number;
}

export const ChartRenderer: React.FC<ChartRendererProps> = ({
  data,
  className,
  height = "320px",
}) => {
  const options = useMemo(() => {
    return chartDataToEChartsOption(data);
  }, [data]);

  return (
    <div
      className={cn("w-full overflow-hidden p-2 bg-transparent", className)}
      style={{ height }}
    >
      <ReactECharts options={options} className="h-full w-full" />
    </div>
  );
};
