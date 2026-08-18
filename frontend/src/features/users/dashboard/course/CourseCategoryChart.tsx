import { useCourseCategoryStats, type SchemaCategoryStatItem } from "@/api/course/user-stats";
import { ReactECharts } from "@/components/charts/ReactECharts";
import { useTheme } from "@/lib/theme-provider";
import { useAppTranslation } from "@/lib/i18n-typed";
import { useMemo } from "react";
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from "@/components/ui/card";
import { BarChart3 } from "lucide-react";
import { EmptyState } from "@/components/general";

interface CourseCategoryChartProps {
  className?: string;
}

export const CourseCategoryChart = ({ className }: CourseCategoryChartProps) => {
  const { theme } = useTheme();
  const { t } = useAppTranslation();
  const isDark = theme === "dark";

  const { data: statsRes, isLoading } = useCourseCategoryStats();
  const stats = statsRes?.data || [];

  const enrolledLabel = t(($) => $.course.dashboard.charts.category.enrolled);
  const completedLabel = t(($) => $.course.dashboard.charts.category.completed);

  const options = useMemo(() => {
    if (stats.length === 0) return null;

    const categoryNames = stats.map((s: SchemaCategoryStatItem) => s.categoryName);
    const enrolledData = stats.map((s: SchemaCategoryStatItem) => s.coursesEnrolled);
    const completedData = stats.map((s: SchemaCategoryStatItem) => s.coursesCompleted);

    return {
      grid: {
        top: "15%",
        right: "5%",
        bottom: "10%",
        left: "5%",
        containLabel: true,
      },
      tooltip: {
        trigger: "axis",
        axisPointer: {
          type: "shadow",
        },
        backgroundColor: isDark ? "#1e293b" : "#ffffff",
        borderColor: isDark ? "#334155" : "#e2e8f0",
        textStyle: {
          color: isDark ? "#f1f5f9" : "#0f172a",
          fontFamily: "Inter, sans-serif",
        },
      },
      legend: {
        data: [enrolledLabel, completedLabel],
        top: "0%",
        right: "center",
        textStyle: {
          color: isDark ? "#94a3b8" : "#64748b",
          fontFamily: "Inter, sans-serif",
          fontWeight: "bold",
        },
      },
      xAxis: {
        type: "value",
        splitLine: {
          lineStyle: {
            color: isDark ? "rgba(255, 255, 255, 0.05)" : "rgba(0, 0, 0, 0.05)",
          },
        },
        axisLabel: {
          color: isDark ? "#94a3b8" : "#64748b",
        },
      },
      yAxis: {
        type: "category",
        data: categoryNames,
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
      series: [
        {
          name: enrolledLabel,
          type: "bar",
          data: enrolledData,
          itemStyle: {
            color: "#3b82f6", // Blue
            borderRadius: [0, 4, 4, 0],
          },
          barWidth: "30%",
        },
        {
          name: completedLabel,
          type: "bar",
          data: completedData,
          itemStyle: {
            color: "#10b981", // Emerald/Green
            borderRadius: [0, 4, 4, 0],
          },
          barWidth: "30%",
          barGap: "-100%", // Overlap the completed bar on top of the enrolled bar
        },
      ],
    };
  }, [stats, isDark, enrolledLabel, completedLabel]);

  const chartHeight = useMemo(() => {
    return Math.max(280, stats.length * 45);
  }, [stats]);

  if (isLoading) {
    return (
      <Card className={`w-full shadow-sm overflow-hidden ${className || ""}`}>
        <CardHeader className="bg-muted/10 border-b">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-primary/10 rounded-lg flex items-center justify-center animate-pulse">
              <BarChart3 className="w-5 h-5 text-primary" />
            </div>
            <div>
              <CardTitle className="text-lg font-bold">{t(($) => $.course.dashboard.charts.category.loading)}</CardTitle>
              <CardDescription className="text-xs font-medium">{t(($) => $.course.dashboard.charts.category.loadingDesc)}</CardDescription>
            </div>
          </div>
        </CardHeader>
        <CardContent className="h-[280px] flex items-center justify-center animate-pulse">
          <div className="w-full h-full bg-slate-100 dark:bg-slate-800 rounded-xl" />
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className={`w-full shadow-sm overflow-hidden flex flex-col ${className || ""}`}>
      <CardHeader className="bg-muted/10 border-b">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 bg-primary/10 rounded-lg flex items-center justify-center">
            <BarChart3 className="w-5 h-5 text-primary" />
          </div>
          <div>
            <CardTitle className="text-lg font-bold">{t(($) => $.course.dashboard.charts.category.title)}</CardTitle>
            <CardDescription className="text-xs font-medium">{t(($) => $.course.dashboard.charts.category.description)}</CardDescription>
          </div>
        </div>
      </CardHeader>
      <CardContent className="min-h-[280px] flex-1 overflow-y-auto">
        {stats.length > 0 && options ? (
          <div style={{ height: `${chartHeight}px` }} className="w-full">
            <ReactECharts
              key={`${isDark}-${enrolledLabel}-${completedLabel}-${stats.map((s) => s.categoryId + s.coursesEnrolled + s.coursesCompleted).join("-")}`}
              options={options}
              className="h-full w-full"
            />
          </div>
        ) : (
          <EmptyState
            variant="glow"
            color="primary"
            icon={BarChart3}
            title={t(($) => $.course.dashboard.charts.category.empty)}
            description={t(($) => $.course.dashboard.charts.category.emptyDesc)}
            className="border-0 py-8"
          />
        )}
      </CardContent>
    </Card>
  );
};
