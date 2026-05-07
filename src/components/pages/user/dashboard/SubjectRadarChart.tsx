import { ReactECharts } from "@/components/custom/charts/ReactECharts";
import { SubjectStats } from "@/api/exam-user-stats/types";
import { useTheme } from "@/lib/theme-provider";
import { useAppTranslation } from "@/lib/i18n-typed";
import { useMemo } from "react";
import { PieChart } from "lucide-react";

interface SubjectRadarChartProps {
  stats: SubjectStats[];
  className?: string;
}

export const SubjectRadarChart = ({ stats, className }: SubjectRadarChartProps) => {
  const { theme } = useTheme();
  const { t } = useAppTranslation();
  const isDark = theme === "dark";

  const options = useMemo(() => {
    // Radar charts require at least 3 indicators to render a polygon.
    // If we have fewer than 3 subjects, we switch to a bar chart for better visualization.
    if (stats.length > 0 && stats.length < 3) {
      return {
        grid: {
          top: "15%",
          right: "5%",
          bottom: "10%",
          left: "5%",
          containLabel: true,
        },
        xAxis: {
          type: "value",
          max: 100,
          splitLine: {
            lineStyle: {
              color: isDark ? "rgba(255, 255, 255, 0.1)" : "rgba(0, 0, 0, 0.05)",
            },
          },
          axisLabel: {
            color: isDark ? "#94a3b8" : "#64748b",
            formatter: "{value}%",
          },
        },
        yAxis: {
          type: "category",
          data: stats.map((s) => s.subjectName),
          axisLabel: {
            color: isDark ? "#94a3b8" : "#64748b",
            fontWeight: "bold",
          },
          axisLine: {
            show: false,
          },
          axisTick: {
            show: false,
          },
        },
        tooltip: {
          trigger: "axis",
        },
        series: [
          {
            name: t(($) => $.exam.sessions.dashboard.radarChart.seriesName),
            type: "bar",
            data: stats.map((s) => parseFloat(s.accuracyRate)),
            barWidth: stats.length === 1 ? "20%" : "40%",
            itemStyle: {
              color: "#3b82f6",
              borderRadius: [0, 8, 8, 0],
            },
            label: {
              show: true,
              position: "right",
              formatter: "{c}%",
              color: isDark ? "#fff" : "#000",
              fontWeight: "bold",
            },
          },
        ],
      };
    }

    const indicators = stats.map((s) => ({
      name: s.subjectName,
      max: 100,
    }));

    const data = stats.map((s) => parseFloat(s.accuracyRate));

    return {
      // Explicitly override xAxis/yAxis from defaults to avoid conflicts in radar mode
      xAxis: { show: false },
      yAxis: { show: false },
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
          name: t(($) => $.exam.sessions.dashboard.radarChart.seriesName),
          type: "radar",
          data: [
            {
              value: data,
              name: t(($) => $.exam.sessions.dashboard.radarChart.dataName),
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
      <div className="flex flex-col items-center justify-center h-full text-center p-8">
        <div className="w-16 h-16 rounded-2xl bg-slate-50 dark:bg-slate-800/50 flex items-center justify-center mb-4 border border-slate-100 dark:border-slate-800">
          <PieChart className="w-8 h-8 text-slate-300 dark:text-slate-600" />
        </div>
        <h3 className="text-lg font-bold text-slate-900 dark:text-white mb-1">
          {t(($) => $.exam.sessions.dashboard.radarChart.noData)}
        </h3>
        <p className="text-sm text-muted-foreground max-w-[280px]">
          {t(($) => $.exam.sessions.dashboard.empty.noStatsDesc)}
        </p>
      </div>
    );
  }

  return <ReactECharts options={options} series={options.series} className={className} />;

};
