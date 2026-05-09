import { ReactECharts } from "@/components/custom/charts/ReactECharts";
import { SubjectStats } from "@/api/exam-user-stats/types";
import { useTheme } from "@/lib/theme-provider";
import { useAppTranslation } from "@/lib/i18n-typed";
import { useMemo } from "react";
import { PieChart } from "lucide-react";

import { Card, CardHeader, CardTitle, CardDescription, CardContent } from "@/components/ui/card";
import { Target, AlertCircle, Calendar } from "lucide-react";
import { string_to_locale_date } from "@/lib/my-utils";

interface SubjectRadarChartProps {
  stats: SubjectStats[];
  className?: string;
}

export const SubjectRadarChart = ({ stats, className }: SubjectRadarChartProps) => {
  const { theme } = useTheme();
  const { t, i18n } = useAppTranslation();
  const isDark = theme === "dark";

  const options = useMemo(() => {
    // ... (options logic remains same)
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
          textStyle: {
            fontFamily: "Inter, sans-serif",
          },
          backgroundColor: "transparent",
          borderWidth: 0,
          shadowBlur: 0,
          padding: 0,
          extraCssText: "box-shadow: none !important; border: none !important;",
          formatter: (params: any) => {
            const p = params[0];
            const s = stats[p.dataIndex];
            const lastUpdate = string_to_locale_date(i18n.language, s.updatedAt);
            return `
              <div class="flex flex-col gap-2 p-3 rounded-md border bg-popover/95 shadow-xl min-w-[200px] text-xs backdrop-blur-sm">
                <div class="font-black text-sm text-popover-foreground border-b pb-2 mb-1">${s.subjectName}</div>
                <div class="space-y-1.5">
                  <div class="flex justify-between items-center">
                    <span class="text-muted-foreground font-medium">${t(($) => $.exam.sessions.results.stats.correct)}</span>
                    <span class="font-bold text-emerald-500">${s.totalCorrect}</span>
                  </div>
                  <div class="flex justify-between items-center">
                    <span class="text-muted-foreground font-medium">${t(($) => $.exam.sessions.results.stats.wrong)}</span>
                    <span class="font-bold text-red-500">${s.totalWrong}</span>
                  </div>
                  <div class="flex justify-between items-center">
                    <span class="text-muted-foreground font-medium">${t(($) => $.exam.sessions.dashboard.stats.totalQuestions)}</span>
                    <span class="font-bold text-popover-foreground">${s.totalQuestionsAnswered}</span>
                  </div>
                  <div class="flex justify-between items-center pt-2 border-t border-border mt-1">
                    <span class="text-muted-foreground font-black uppercase tracking-wider text-[10px]">${t(($) => $.exam.sessions.results.accuracy)}</span>
                    <span class="font-black text-blue-500 text-sm">${p.value}%</span>
                  </div>
                </div>
                <div class="mt-2 pt-2 border-t border-border/50 flex items-center gap-1.5 text-[10px] text-muted-foreground/70 italic">
                  <span class="font-bold">${t(($) => $.exam.packages.table.columns.updatedAt)}:</span>
                  <span>${lastUpdate}</span>
                </div>
              </div>
            `;
          },
        },
        series: [
          {
            name: t(($) => $.exam.sessions.dashboard.radarChart.seriesName),
            type: "bar",
            data: stats.map((s) => parseFloat(s.accuracyRate)),
            barWidth: stats.length === 1 ? "20%" : "40%",
            barMaxWidth: 24,
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
        backgroundColor: "transparent",
        borderWidth: 0,
        shadowBlur: 0,
        padding: 0,
        extraCssText: "box-shadow: none !important; border: none !important;",
        textStyle: {
          fontFamily: "Inter, sans-serif",
        },
        formatter: (params: any) => {
          const values = params.value as number[];
          let html = `
            <div class="flex flex-col gap-2 p-3 rounded-md border bg-popover/95 shadow-xl min-w-[240px] text-xs backdrop-blur-sm">
              <div class="font-black text-sm text-popover-foreground border-b pb-2 mb-1">${params.name}</div>
              <table class="w-full border-collapse">
                <thead>
                  <tr class="text-left text-[9px] text-muted-foreground uppercase tracking-widest border-b border-border/50">
                    <th class="pb-2 font-black">Subject</th>
                    <th class="pb-2 text-center px-2 font-black">C / W / T</th>
                    <th class="pb-2 text-right font-black">Accuracy</th>
                  </tr>
                </thead>
                <tbody class="divide-y divide-border/30">`;

          stats.forEach((s, i) => {
            html += `
              <tr class="group">
                <td class="py-2 font-bold text-popover-foreground/90">${s.subjectName}</td>
                <td class="py-2 text-center font-bold tabular-nums">
                  <span class="text-emerald-500">${s.totalCorrect}</span><span class="text-muted-foreground/30 mx-0.5">/</span><span class="text-red-500">${s.totalWrong}</span><span class="text-muted-foreground/30 mx-0.5">/</span><span class="text-muted-foreground">${s.totalQuestionsAnswered}</span>
                </td>
                <td class="py-2 text-right font-black text-blue-500">${values[i]}%</td>
              </tr>`;
          });

          html += `
                </tbody>
              </table>
            </div>`;
          return html;
        },
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
  }, [stats, isDark, t, i18n]);

  const renderContent = () => {
    if (stats.length === 0) {
      return (
        <div className="flex flex-col items-center justify-center h-[320px] text-center p-8">
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

    return <ReactECharts options={options} series={options.series} className={className || "h-[320px] w-full"} />;
  };

  return (
    <Card className="shadow-sm overflow-hidden">
      <CardHeader className="bg-muted/10 border-b">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 bg-amber-500/10 rounded-lg flex items-center justify-center">
            <Target className="w-5 h-5 text-amber-600" />
          </div>
          <div>
            <CardTitle className="text-lg font-bold">{t(($) => $.exam.sessions.dashboard.charts.subjectPerformance)}</CardTitle>
            <CardDescription className="text-xs font-medium">{t(($) => $.exam.sessions.dashboard.charts.subjectPerformanceDesc)}</CardDescription>
          </div>
        </div>
      </CardHeader>
      <CardContent className="px-6 py-8">
        {renderContent()}
      </CardContent>
    </Card>
  );
};
