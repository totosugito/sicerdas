import { ChartSeries, ChartOptions } from "../chart-types";

export function computeLinearRegression(
  categories: string[],
  series: ChartSeries[],
  options?: ChartOptions,
  isNumericX?: boolean
): any | null {
  if (!options?.showTrendline || series.length === 0) return null;

  const firstS = series[0];
  const n = firstS.values.length;
  if (n < 2) return null;

  let sumX = 0, sumY = 0, sumXY = 0, sumXX = 0;
  for (let i = 0; i < n; i++) {
    const parsedX = parseFloat(categories[i]);
    const x = isNaN(parsedX) ? i : parsedX;
    const y = Number(firstS.values[i]) || 0;
    sumX += x;
    sumY += y;
    sumXY += x * y;
    sumXX += x * x;
  }

  const denom = n * sumXX - sumX * sumX;
  if (denom === 0) return null;

  const m = (n * sumXY - sumX * sumY) / denom;
  const c = (sumY - m * sumX) / n;

  const trendValues: any[] = categories.map((cat, i) => {
    const parsedX = parseFloat(cat);
    const x = isNaN(parsedX) ? i : parsedX;
    const yVal = Number((m * x + c).toFixed(2));
    return isNumericX ? [x, yVal] : yVal;
  });

  if (options?.fullTrendline && isNumericX) {
    const numericXList = categories.map((c) => parseFloat(c)).filter((v) => !isNaN(v));
    const minCatX = numericXList.length > 0 ? Math.min(...numericXList) : 0;
    const startX = minCatX > 0 ? 0 : minCatX;
    const startY = Number((m * startX + c).toFixed(2));

    if (!numericXList.includes(startX)) {
      trendValues.unshift([startX, startY]);
      trendValues.sort((a: any, b: any) => (Array.isArray(a) ? a[0] : 0) - (Array.isArray(b) ? b[0] : 0));
    }
  }

  const eqStr = `y = ${m >= 0 ? m.toFixed(2) : "-" + Math.abs(m).toFixed(2)}x ${c >= 0 ? "+ " + c.toFixed(2) : "- " + Math.abs(c).toFixed(2)}`;

  return {
    name: eqStr,
    type: "line",
    data: trendValues,
    symbolSize: 6,
    smooth: false,
    itemStyle: { color: "#ef4444" },
    lineStyle: { color: "#ef4444", width: 1, type: options?.trendlineStyle || "dashed" },
    label: { show: false },
    stack: undefined,
  };
}
