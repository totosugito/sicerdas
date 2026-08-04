import { useCourseCategoryStats, type SchemaCategoryStatItem } from "@/api/course/user-stats";
import { ReactECharts } from "@/components/charts/ReactECharts";
import { useTheme } from "@/lib/theme-provider";
import { useAppTranslation } from "@/lib/i18n-typed";
import { useMemo } from "react";
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from "@/components/ui/card";
import { BarChart3 } from "lucide-react";

interface CourseCategoryChartProps {
  className?: string;
}

export const CourseCategoryChart = ({ className }: CourseCategoryChartProps) => {
  const { theme } = useTheme();
  const { t } = useAppTranslation();
  const isDark = theme === "dark";

  const { data: statsRes, isLoading } = useCourseCategoryStats();
  const stats = statsRes?.data || [];

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
        data: ["Terdaftar", "Selesai"],
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
          name: "Terdaftar",
          type: "bar",
          data: enrolledData,
          itemStyle: {
            color: "#3b82f6", // Blue
            borderRadius: [0, 4, 4, 0],
          },
          barWidth: "30%",
        },
        {
          name: "Selesai",
          type: "bar",
          data: completedData,
          itemStyle: {
            color: "#10b981", // Emerald/Green
            borderRadius: [0, 4, 4, 0],
          },
          barWidth: "30%",
        },
      ],
    };
  }, [stats, isDark]);

  if (isLoading) {
    return (
      <Card className={className}>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-4">
          <div className="space-y-1">
            <CardTitle className="text-lg font-bold">Progress Kategori</CardTitle>
            <CardDescription>Memuat analisis data...</CardDescription>
          </div>
        </CardHeader>
        <CardContent className="h-[280px] flex items-center justify-center animate-pulse">
          <div className="w-full h-full bg-slate-100 dark:bg-slate-800 rounded-xl" />
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className={className}>
      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-4">
        <div className="space-y-1">
          <CardTitle className="text-lg font-bold flex items-center gap-2">
            <BarChart3 className="w-5 h-5 text-primary" />
            Progress Berdasarkan Kategori
          </CardTitle>
          <CardDescription>Jumlah kursus yang diikuti dan diselesaikan di setiap kategori</CardDescription>
        </div>
      </CardHeader>
      <CardContent className="h-[280px]">
        {stats.length > 0 && options ? (
          <ReactECharts options={options} className="h-full w-full" />
        ) : (
          <div className="flex flex-col items-center justify-center h-full text-center p-6 border-2 border-dashed rounded-xl border-slate-200 dark:border-slate-800">
            <p className="text-sm font-medium text-slate-500">Belum ada aktivitas belajar per kategori.</p>
          </div>
        )}
      </CardContent>
    </Card>
  );
};
