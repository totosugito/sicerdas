import { useState, useMemo } from "react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { TrendingUp, Calendar } from "lucide-react";
import type { UserStatsData } from "@/api/users";
import { Skeleton } from "@/components/ui/skeleton";
import { useAppTranslation } from "@/lib/i18n-typed";
import { useTheme } from "@/lib/theme-provider";
import { ReactECharts } from "@/components/custom/charts/ReactECharts";

interface UserAnalyticsChartProps {
  periodType: "daily" | "weekly" | "monthly";
  onPeriodChange: (period: "daily" | "weekly" | "monthly") => void;
  history?: UserStatsData["history"];
  isLoading?: boolean;
}

export function UserAnalyticsChart({
  periodType,
  onPeriodChange,
  history = [],
  isLoading,
}: UserAnalyticsChartProps) {
  const { t } = useAppTranslation();
  const { theme } = useTheme();
  const isDark = theme === "dark";

  const [activeTab, setActiveTab] = useState<"registrations" | "active">("registrations");

  const periods: Array<{ id: "daily" | "weekly" | "monthly"; label: string }> = [
    { id: "daily", label: t(($) => $.user.management.dashboard.analytics.daily) },
    { id: "weekly", label: t(($) => $.user.management.dashboard.analytics.weekly) },
    { id: "monthly", label: t(($) => $.user.management.dashboard.analytics.monthly) },
  ];

  // ECharts Options configuration matching ActivityBarChart pattern
  const chartOption = useMemo(() => {
    if (history.length === 0) return null;

    const dates = history.map((item) => item.periodKey);
    const values = history.map((item) =>
      activeTab === "registrations" ? item.newUsersCount : item.activeUsersCount
    );

    const seriesName =
      activeTab === "registrations"
        ? t(($) => $.user.management.dashboard.analytics.newSignups)
        : t(($) => $.user.management.dashboard.analytics.activeUsers);

    return {
      grid: {
        top: "12%",
        right: "3%",
        bottom: "10%",
        left: "3%",
        containLabel: true,
      },
      tooltip: {
        trigger: "axis",
        axisPointer: {
          type: "shadow",
        },
        backgroundColor: "transparent",
        borderWidth: 0,
        shadowBlur: 0,
        padding: 0,
        extraCssText: "box-shadow: none !important; border: none !important;",
        textStyle: {
          fontFamily: "Inter, sans-serif",
        },
        formatter: (params: any) => {
          if (!params || params.length === 0) return "";
          const item = params[0];
          const val = item.value;
          const key = item.name;

          return `
            <div class="flex flex-col gap-1 p-2.5 rounded-md border bg-popover/95 shadow-xl min-w-[160px] text-xs backdrop-blur-sm">
              <div class="font-bold text-popover-foreground border-b pb-1 mb-1">${key}</div>
              <div class="flex justify-between items-center">
                <span class="text-muted-foreground font-medium">${seriesName}:</span>
                <span class="font-black text-primary">${val}</span>
              </div>
            </div>
          `;
        },
      },
      xAxis: {
        type: "category",
        data: dates,
        axisLabel: {
          color: isDark ? "#94a3b8" : "#64748b",
          fontSize: 11,
          fontWeight: "bold",
        },
        axisLine: {
          lineStyle: {
            color: isDark ? "rgba(255, 255, 255, 0.1)" : "rgba(0, 0, 0, 0.05)",
          },
        },
        axisTick: {
          show: false,
        },
      },
      yAxis: {
        type: "value",
        minInterval: 1,
        splitLine: {
          lineStyle: {
            color: isDark ? "rgba(255, 255, 255, 0.05)" : "rgba(0, 0, 0, 0.03)",
            type: "dashed",
          },
        },
        axisLabel: {
          color: isDark ? "#94a3b8" : "#64748b",
          fontSize: 11,
        },
      },
      series: [
        {
          name: seriesName,
          type: "bar",
          barWidth: "35%",
          barMaxWidth: 28,
          data: values,
          itemStyle: {
            color: activeTab === "registrations"
              ? (isDark ? "#60a5fa" : "#3b82f6")
              : (isDark ? "#34d399" : "#10b981"),
            borderRadius: [6, 6, 0, 0],
          },
          emphasis: {
            itemStyle: {
              color: activeTab === "registrations"
                ? (isDark ? "#3b82f6" : "#2563eb")
                : (isDark ? "#10b981" : "#059669"),
            },
          },
        },
      ],
    };
  }, [history, activeTab, isDark, t]);

  return (
    <Card className="shadow-xs border border-border">
      <CardHeader className="flex flex-col sm:flex-row items-start sm:items-center justify-between pb-4 gap-3">
        <div className="space-y-1">
          <div className="flex items-center gap-2">
            <TrendingUp className="h-4 w-4 text-primary" />
            <CardTitle className="text-base font-semibold">
              {t(($) => $.user.management.dashboard.analytics.title)}
            </CardTitle>
          </div>
          <CardDescription className="text-xs">
            {t(($) => $.user.management.dashboard.analytics.description)}
          </CardDescription>
        </div>

        <div className="flex items-center gap-2 flex-wrap">
          {/* Metric Selector */}
          <div className="inline-flex items-center rounded-lg p-1 bg-muted text-xs">
            <button
              onClick={() => setActiveTab("registrations")}
              className={`px-2.5 py-1 rounded-md text-xs font-medium transition-all ${
                activeTab === "registrations"
                  ? "bg-background text-foreground shadow-xs"
                  : "text-muted-foreground hover:text-foreground"
              }`}
            >
              {t(($) => $.user.management.dashboard.analytics.newSignups)}
            </button>
            <button
              onClick={() => setActiveTab("active")}
              className={`px-2.5 py-1 rounded-md text-xs font-medium transition-all ${
                activeTab === "active"
                  ? "bg-background text-foreground shadow-xs"
                  : "text-muted-foreground hover:text-foreground"
              }`}
            >
              {t(($) => $.user.management.dashboard.analytics.activeUsers)}
            </button>
          </div>

          {/* Granularity Selector */}
          <div className="inline-flex items-center rounded-lg p-1 bg-muted text-xs">
            {periods.map((p) => (
              <button
                key={p.id}
                onClick={() => onPeriodChange(p.id)}
                className={`px-2.5 py-1 rounded-md text-xs font-medium transition-all ${
                  periodType === p.id
                    ? "bg-primary text-primary-foreground shadow-xs"
                    : "text-muted-foreground hover:text-foreground"
                }`}
              >
                {p.label}
              </button>
            ))}
          </div>
        </div>
      </CardHeader>

      <CardContent className="pt-2">
        {isLoading ? (
          <div className="h-[280px] flex items-center justify-center p-4">
            <Skeleton className="h-full w-full rounded-md" />
          </div>
        ) : history.length === 0 || !chartOption ? (
          <div className="h-[280px] flex flex-col items-center justify-center text-center text-muted-foreground p-6">
            <Calendar className="h-8 w-8 mb-2 opacity-50" />
            <p className="text-sm font-medium">
              {t(($) => $.user.management.dashboard.analytics.noDataTitle)}
            </p>
            <p className="text-xs">
              {t(($) => $.user.management.dashboard.analytics.noDataDesc)}
            </p>
          </div>
        ) : (
          <div className="space-y-2">
            <ReactECharts options={chartOption} series={chartOption.series} className="h-[280px] w-full" />


            <div className="flex items-center justify-between text-xs text-muted-foreground px-2 pt-2 border-t border-border/40">
              <span>
                {t(($) => $.user.management.dashboard.analytics.granularityLabel)}:{" "}
                <strong className="capitalize text-foreground">{periodType}</strong>
              </span>
              <span>
                {t(($) => $.user.management.dashboard.analytics.showingSnapshots, { count: history.length })}
              </span>
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
