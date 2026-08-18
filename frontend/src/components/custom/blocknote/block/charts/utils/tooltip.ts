export function renderBlockNoteChartTooltip(params: any): string {
  const paramsArray = Array.isArray(params) ? params : [params];
  if (!paramsArray || paramsArray.length === 0) return "";

  const firstP: any = paramsArray[0];
  let title = "";
  if (firstP.axisValueLabel !== undefined && firstP.axisValueLabel !== null && firstP.axisValueLabel !== "") {
    title = `X = ${firstP.axisValueLabel}`;
  } else if (Array.isArray(firstP.value) && firstP.value.length >= 2) {
    title = `X = ${firstP.value[0]}`;
  } else if (firstP.name && firstP.name !== firstP.seriesName) {
    title = firstP.name;
  } else if (firstP.seriesName) {
    title = firstP.seriesName;
  }

  return `
    <div class="flex flex-col gap-1 p-2 rounded-md border border-border/60 shadow-md text-xs bg-popover/95 backdrop-blur-xs min-w-[160px] text-popover-foreground">
      ${title ? `<div class="font-bold text-popover-foreground pb-1 border-b border-border/40 text-[11px]">${title}</div>` : ""}
      <div class="flex flex-col gap-1 pt-0.5">
        ${paramsArray.map(({ name, value, marker, seriesName }: any) => {
          let displayVal = "";
          if (Array.isArray(value) && value.length >= 2) {
            displayVal = isNaN(Number(value[1])) ? String(value[1]) : Number(value[1]).toLocaleString();
          } else {
            displayVal = isNaN(Number(value)) ? String(value) : Number(value).toLocaleString();
          }
          return `
            <div class="flex flex-row gap-2 items-center justify-between text-xs">
              <div class="flex items-center gap-1.5 min-w-0">
                ${marker || ''}
                <span class="font-medium truncate text-muted-foreground">${seriesName || name}</span>
              </div>
              <span class="text-foreground font-mono font-semibold tabular-nums ml-2 shrink-0">${displayVal}</span>
            </div>
          `;
        }).join('')}
      </div>
    </div>
  `;
}
