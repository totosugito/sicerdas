import { ChartData, DEFAULT_PALETTE } from "./chart-types";
import { renderBlockNoteChartTooltip } from "./utils/tooltip";
import { computeLinearRegression } from "./utils/trendline";

export function chartDataToEChartsOption(data: ChartData) {
  const { chartType, title, categories, series, options } = data;
  const showLegend = options?.showLegend ?? true;
  const showGrid = options?.showGrid ?? true;
  const showValues = options?.showValues ?? false;

  const firstSeries = series[0] || { name: "Series 1", values: [] };
  const palette = firstSeries.colors && firstSeries.colors.length > 0
    ? firstSeries.colors
    : series.map((s) => s.color).filter((c): c is string => !!c).length > 0
      ? series.map((s) => s.color!)
      : DEFAULT_PALETTE;

  // Handle Pie & Doughnut charts
  if (chartType === "pie" || chartType === "doughnut") {
    const pieData = categories.map((cat, idx) => ({
      name: cat,
      value: firstSeries.values[idx] ?? 0,
      itemStyle: {
        color: firstSeries.colors?.[idx] || palette[idx % palette.length] || DEFAULT_PALETTE[idx % DEFAULT_PALETTE.length],
      },
    }));

    const hasLegend = showLegend;
    const hasTitle = !!title;

    return {
      title: hasTitle
        ? {
          text: title,
          left: "center",
          top: 5,
          textStyle: { fontSize: 14, fontWeight: "bold" },
        }
        : undefined,
      tooltip: {
        trigger: "item",
        renderMode: "html",
        className: "custom-echarts-tooltip",
        formatter: (params: any) => {
          const { name, value, percent, marker, seriesName } = params;
          return `
            <div class="flex flex-col gap-1 p-2 rounded-md border shadow-md text-xs bg-popover text-popover-foreground">
              <div class="flex items-center gap-1.5 font-bold border-b pb-1">
                ${marker}
                <span>${name}</span>
              </div>
              <div class="flex items-center justify-between gap-4 font-mono font-medium tabular-nums pt-0.5">
                <span class="text-muted-foreground text-[11px] font-sans">${seriesName || 'Value'}:</span>
                <span class="font-bold text-foreground">${Number(value).toLocaleString()}</span>
                <span class="text-muted-foreground bg-muted px-1.5 py-0.5 rounded text-[10px] font-sans">${percent}%</span>
              </div>
            </div>
          `;
        },
      },
      legend: hasLegend
        ? {
          orient: "horizontal",
          bottom: 4,
          left: "center",
        }
        : undefined,
      series: [
        {
          name: firstSeries.name || title || "Data",
          type: "pie",
          radius: chartType === "doughnut" ? ["40%", "60%"] : "60%",
          center: ["50%", hasLegend ? (hasTitle ? "48%" : "44%") : (hasTitle ? "55%" : "50%")],
          data: pieData,
          avoidLabelOverlap: true,
          label: {
            show: showValues,
            formatter: "{b}: {c}",
            fontSize: 11,
          },
          labelLine: {
            show: showValues,
            length: 8,
            length2: 8,
          },
          labelLayout: {
            hideOverlap: true,
          },
          emphasis: {
            itemStyle: {
              shadowBlur: 10,
              shadowOffsetX: 0,
              shadowColor: "rgba(0, 0, 0, 0.5)",
            },
          },
        },
      ],
    };
  }

  // Handle Radar charts
  if (chartType === "radar") {
    const allValues = series.flatMap((s) => s.values);
    const maxVal = Math.max(...allValues, 10);
    const max = Math.ceil(maxVal * 1.1);

    const indicator = categories.map((cat) => ({
      name: cat,
      max: max,
    }));

    const radarSeriesData = series.map((s, idx) => {
      const seriesColor = s.color || palette[idx % palette.length];
      return {
        name: s.name || `Series ${idx + 1}`,
        value: s.values,
        itemStyle: { color: seriesColor },
        areaStyle: { opacity: 0.25, color: seriesColor },
        lineStyle: { width: 2, color: seriesColor },
      };
    });

    const hasTitle = !!title;
    const hasLegend = showLegend;

    return {
      title: hasTitle
        ? {
          text: title,
          left: "center",
          top: 5,
          textStyle: { fontSize: 14, fontWeight: "bold" },
        }
        : undefined,
      tooltip: {
        trigger: "item",
      },
      legend: hasLegend
        ? {
          orient: "horizontal",
          bottom: 4,
          left: "center",
        }
        : undefined,
      radar: {
        indicator: indicator,
        center: ["50%", hasLegend ? (hasTitle ? "48%" : "44%") : (hasTitle ? "55%" : "50%")],
        radius: "60%",
      },
      series: [
        {
          type: "radar",
          data: radarSeriesData,
        },
      ],
    };
  }

  const isHorizontal = chartType === "bar" && options?.horizontal;
  const isScatter = chartType === "scatter";
  const isNumericX = isScatter && categories.length > 0 && categories.every((c) => !isNaN(parseFloat(c)) && c.trim() !== "");

  const echartsSeries = series.map((s, idx) => {
    const seriesColor = s.color || DEFAULT_PALETTE[idx % DEFAULT_PALETTE.length];
    const isArea = chartType === "area";
    const actualType = isArea ? "line" : chartType;

    const seriesData = isNumericX
      ? s.values.map((v, i) => [parseFloat(categories[i]), v])
      : s.values;

    return {
      name: s.name || `Series ${idx + 1}`,
      type: actualType,
      data: seriesData,
      symbolSize: chartType === "scatter" ? 10 : 6,
      itemStyle: {
        color: seriesColor,
      },
      lineStyle:
        chartType === "line" || isArea
          ? {
            color: seriesColor,
            width: 2,
          }
          : undefined,
      areaStyle: isArea
        ? {
          opacity: 0.3,
          color: seriesColor,
        }
        : undefined,
      label: {
        show: showValues,
        position: isHorizontal ? "right" : "top",
        fontSize: 10,
        formatter: (params: any) => {
          const formatMode = options?.valueLabelFormat || "y";
          if (formatMode === "xy") {
            if (Array.isArray(params.value)) {
              return `(${params.value[0]}, ${params.value[1]})`;
            }
            return `(${params.name}, ${params.value})`;
          }
          if (Array.isArray(params.value)) {
            return `${params.value[1]}`;
          }
          return `${params.value}`;
        },
      },
      stack: options?.stacked ? "total" : undefined,
    };
  });

  // Linear Regression Trendline (y = mx + c)
  const trendlineSeries = computeLinearRegression(categories, series, options, isNumericX);
  if (trendlineSeries) {
    echartsSeries.push(trendlineSeries);
  }

  const categoryAxis = {
    type: "category",
    data: categories,
    name: isHorizontal ? options?.yAxisLabel : options?.xAxisLabel,
    nameLocation: "middle",
    nameGap: 30,
    nameTextStyle: {
      fontWeight: 600,
      fontSize: 11,
    },
  };

  const valueAxis = {
    type: "value",
    name: isHorizontal ? options?.xAxisLabel : options?.yAxisLabel,
    nameLocation: "middle",
    nameGap: isHorizontal ? 30 : 35,
    nameTextStyle: {
      fontWeight: 600,
      fontSize: 11,
    },
  };

  const numericXAxis = {
    type: "value",
    name: options?.xAxisLabel,
    nameLocation: "middle",
    nameGap: 30,
    nameTextStyle: {
      fontWeight: 600,
      fontSize: 11,
    },
  };

  const hasYLabel = isHorizontal ? options?.xAxisLabel : options?.yAxisLabel;
  const hasXLabel = isHorizontal ? options?.yAxisLabel : options?.xAxisLabel;

  return {
    title: title
      ? {
        text: title,
        left: "center",
        textStyle: { fontSize: 14, fontWeight: "bold" },
      }
      : undefined,
    tooltip: {
      trigger: (isScatter && !options?.showTrendline) ? "item" : "axis",
      renderMode: "html",
      className: "custom-echarts-tooltip",
      axisPointer: {
        type: isScatter ? "cross" : (chartType === "bar" ? "shadow" : "line"),
      },
      formatter: renderBlockNoteChartTooltip,
    },
    legend: showLegend
      ? {
        bottom: 0,
      }
      : undefined,
    grid: {
      left: hasYLabel ? 35 : 20,
      right: 25,
      bottom: hasXLabel ? (showLegend ? 55 : 40) : (showLegend ? 40 : 20),
      top: title ? 45 : 25,
      containLabel: true,
      show: showGrid,
    },
    xAxis: isNumericX ? numericXAxis : (isHorizontal ? valueAxis : categoryAxis),
    yAxis: isHorizontal ? categoryAxis : valueAxis,
    series: echartsSeries,
  };
}

export function mapChartDataToOption(data: ChartData): any {
  return chartDataToEChartsOption(data);
}
