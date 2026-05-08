import { ReactECharts } from "@/components/custom/charts/ReactECharts";
import { useActivityStats } from "@/api/exam-user-stats";
import { useTheme } from "@/lib/theme-provider";
import { useAppTranslation } from "@/lib/i18n-typed";
import { useMemo } from "react";
import { BarChart3 } from "lucide-react";
import { format, parseISO } from "date-fns";
import { id } from "date-fns/locale";
import { LoadingView } from "@/components/app/LoadingView";

import { Card, CardHeader, CardTitle, CardDescription, CardContent } from "@/components/ui/card";
import { Activity } from "lucide-react";

interface ActivityBarChartProps {
  days?: number;
  className?: string;
}

export const ActivityBarChart = ({ days = 7, className }: ActivityBarChartProps) => {
  const { theme } = useTheme();
  const { t } = useAppTranslation();
  const isDark = theme === "dark";

  const { data: activityStatsRes, isLoading } = useActivityStats({ days });
  const stats = activityStatsRes?.data || [];

  const options = useMemo(() => {
    // ... (options logic remains same)
    if (stats.length === 0) return null;

    const displayData = stats;
    
    const dates = displayData.map((s) => {
      try {
        return format(parseISO(s.date), "dd MMM", { locale: id });
      } catch {
        return s.date;
      }
    });

    const correctData = displayData.map((s) => s.totalCorrect);
    const wrongData = displayData.map((s) => s.totalWrong);

    return {
      grid: {
        top: "15%",
        right: "5%",
        bottom: "10%",
        left: "5%",
        containLabel: true
      },
      tooltip: {
        trigger: "axis",
        axisPointer: {
          type: "shadow"
        },
        backgroundColor: isDark ? "#1e293b" : "#fff",
        borderColor: isDark ? "rgba(255, 255, 255, 0.1)" : "rgba(0, 0, 0, 0.1)",
        textStyle: {
          color: isDark ? "#f1f5f9" : "#1e293b"
        },
        borderRadius: 12,
        padding: [10, 14]
      },
      legend: {
        data: [
          t(($) => $.exam.sessions.results.stats.correct),
          t(($) => $.exam.sessions.results.stats.wrong)
        ],
        top: "0%",
        right: "center",
        textStyle: {
          color: isDark ? "#94a3b8" : "#64748b",
          fontSize: 12,
          fontWeight: "bold"
        },
        icon: "circle"
      },
      xAxis: {
        type: "category",
        data: dates,
        axisLabel: {
          color: isDark ? "#94a3b8" : "#64748b",
          fontSize: 11,
          fontWeight: "bold"
        },
        axisLine: {
          lineStyle: {
            color: isDark ? "rgba(255, 255, 255, 0.1)" : "rgba(0, 0, 0, 0.05)"
          }
        },
        axisTick: {
          show: false
        }
      },
      yAxis: {
        type: "value",
        splitLine: {
          lineStyle: {
            color: isDark ? "rgba(255, 255, 255, 0.05)" : "rgba(0, 0, 0, 0.03)",
            type: "dashed"
          }
        },
        axisLabel: {
          color: isDark ? "#94a3b8" : "#64748b",
          fontSize: 11
        }
      },
      series: [
        {
          name: t(($) => $.exam.sessions.results.stats.correct),
          type: "bar",
          stack: "total",
          barWidth: "35%",
          barMaxWidth: 24,
          data: correctData,
          itemStyle: {
            color: isDark ? "#4ade80" : "#22c55e",
            borderRadius: [0, 0, 0, 0]
          },
          emphasis: {
            itemStyle: {
              color: isDark ? "#22c55e" : "#16a34a"
            }
          }
        },
        {
          name: t(($) => $.exam.sessions.results.stats.wrong),
          type: "bar",
          stack: "total",
          barMaxWidth: 24,
          data: wrongData,
          itemStyle: {
            color: isDark ? "#fb7185" : "#ef4444",
            borderRadius: [6, 6, 0, 0]
          },
          emphasis: {
            itemStyle: {
              color: isDark ? "#ef4444" : "#dc2626"
            }
          }
        }
      ]
    };
  }, [stats, isDark, t]);

  const renderContent = () => {
    if (isLoading) {
      return (
        <LoadingView
          title={t(($) => $.exam.sessions.dashboard.charts.activityLoadingTitle)}
          message={t(($) => $.exam.sessions.dashboard.charts.activityLoadingMessage)}
          className="h-[280px] border-0 bg-transparent shadow-none"
        />
      );
    }

    if (stats.length === 0) {
      return (
        <div className="flex flex-col items-center justify-center h-[280px] text-center p-8">
          <div className="w-16 h-16 rounded-2xl bg-slate-50 dark:bg-slate-800/50 flex items-center justify-center mb-4 border border-slate-100 dark:border-slate-800">
            <BarChart3 className="w-8 h-8 text-slate-300 dark:text-slate-600" />
          </div>
          <h3 className="text-lg font-bold text-slate-900 dark:text-white mb-1">
            {t(($) => $.exam.sessions.dashboard.empty.noActivity)}
          </h3>
          <p className="text-sm text-muted-foreground max-w-[280px]">
            {t(($) => $.exam.sessions.dashboard.empty.noActivityDesc)}
          </p>
        </div>
      );
    }

    return <ReactECharts options={options} series={options?.series} className={className || "h-[280px] w-full"} />;
  };

  return (
    <Card className="shadow-sm overflow-hidden">
      <CardHeader className="bg-muted/10 border-b">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 bg-indigo-500/10 rounded-lg flex items-center justify-center">
            <Activity className="w-5 h-5 text-indigo-500" />
          </div>
          <div>
            <CardTitle className="text-lg font-bold">{t(($) => $.exam.sessions.dashboard.charts.activityHistory)}</CardTitle>
            <CardDescription className="text-xs font-medium">{t(($) => $.exam.sessions.dashboard.charts.activityHistoryDesc)}</CardDescription>
          </div>
        </div>
      </CardHeader>
      <CardContent className="p-6 pt-4">
        {renderContent()}
      </CardContent>
    </Card>
  );
};
