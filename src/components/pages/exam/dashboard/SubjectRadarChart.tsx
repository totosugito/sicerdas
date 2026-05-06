import { ReactECharts } from "@/components/custom/charts/ReactECharts";
import { SubjectStats } from "@/api/exam-user-stats/types";
import { useTheme } from "@/lib/theme-provider";
import { useMemo } from "react";

interface SubjectRadarChartProps {
  stats: SubjectStats[];
  className?: string;
}

export const SubjectRadarChart = ({ stats, className }: SubjectRadarChartProps) => {
  const { theme } = useTheme();
  const isDark = theme === "dark";

  const options = useMemo(() => {
    const indicators = stats.map((s) => ({
      name: s.subjectName,
      max: 100,
    }));

    const data = stats.map((s) => parseFloat(s.accuracyRate));

    return {
      radar: {
        indicator: indicators,
        radius: "65%",
        splitNumber: 5,
        axisName: {
          color: isDark ? "#94a3b8" : "#64748b",
          fontSize: 12,
          fontWeight: "bold",
        },
        splitLine: {
          lineStyle: {
            color: isDark ? "rgba(255, 255, 255, 0.1)" : "rgba(0, 0, 0, 0.05)",
          },
        },
        splitArea: {
          show: false,
        },
        axisLine: {
          lineStyle: {
            color: isDark ? "rgba(255, 255, 255, 0.1)" : "rgba(0, 0, 0, 0.05)",
          },
        },
      },
      tooltip: {
        trigger: "item",
      },
      series: [
        {
          name: "Subject Accuracy",
          type: "radar",
          data: [
            {
              value: data,
              name: "Accuracy Rate (%)",
              symbol: "circle",
              symbolSize: 6,
              lineStyle: {
                width: 2,
                color: "#3b82f6",
              },
              areaStyle: {
                color: "rgba(59, 130, 246, 0.2)",
              },
              itemStyle: {
                color: "#3b82f6",
              },
            },
          ],
        },
      ],
    };
  }, [stats, isDark]);

  if (stats.length === 0) {
    return (
      <div className="flex items-center justify-center h-full text-muted-foreground text-sm font-medium italic">
        No subject data available
      </div>
    );
  }

  return <ReactECharts options={options} className={className} />;
};
