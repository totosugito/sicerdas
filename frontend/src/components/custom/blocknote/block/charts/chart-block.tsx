import React, { useState, useRef } from "react";
import { createReactBlockSpec } from "@blocknote/react";
import { DEFAULT_CHART_DATA, ChartData } from "./chart-types";
import { ChartRenderer } from "./chart-renderer";
import { ChartEditor } from "./chart-editor";
import { Button } from "@/components/ui/button";
import { Edit2, BarChart2, Download } from "lucide-react";
import { cn } from "@/lib/utils";
import { getInstanceByDom } from "echarts/core";

export const ChartBlock = createReactBlockSpec(
  {
    type: "chart",
    propSchema: {
      chartData: {
        default: JSON.stringify(DEFAULT_CHART_DATA),
      },
    },
    content: "none",
  },
  {
    render: (props) => {
      const { block, editor } = props;
      const [isEditing, setIsEditing] = useState<boolean>(false);
      const [draftData, setDraftData] = useState<ChartData | null>(null);
      const containerRef = useRef<HTMLDivElement>(null);

      let savedData: ChartData = DEFAULT_CHART_DATA;
      try {
        if (block.props.chartData) {
          savedData = typeof block.props.chartData === "string"
            ? JSON.parse(block.props.chartData)
            : block.props.chartData;
        }
      } catch (e) {
        savedData = DEFAULT_CHART_DATA;
      }

      const activeData = isEditing && draftData ? draftData : savedData;

      const handleStartEditing = () => {
        setDraftData(savedData);
        setIsEditing(true);
      };

      const handleSave = () => {
        if (draftData) {
          editor.updateBlock(block, {
            type: "chart",
            props: {
              ...block.props,
              chartData: JSON.stringify(draftData),
            },
          });
        }
        setIsEditing(false);
        setDraftData(null);
      };

      const handleCancel = () => {
        setIsEditing(false);
        setDraftData(null);
      };

      const handleExportImage = () => {
        if (!containerRef.current) return;
        const chartDiv = containerRef.current.querySelector("div[_echarts_instance_]");
        if (chartDiv) {
          const instance = getInstanceByDom(chartDiv as HTMLElement);
          if (instance) {
            const url = instance.getDataURL({
              type: "png",
              pixelRatio: 2,
              backgroundColor: "#ffffff",
            });
            const link = document.createElement("a");
            link.download = `${activeData.title || "chart"}.png`;
            link.href = url;
            document.body.appendChild(link);
            link.click();
            document.body.removeChild(link);
          }
        }
      };

      const alignment = activeData.options?.alignment || "center";
      const width = activeData.options?.width || "full";

      const widthClass =
        width === "small" ? "w-full md:w-1/2" : width === "medium" ? "w-full md:w-3/4" : "w-full";

      const alignClass =
        alignment === "left"
          ? "mr-auto ml-0"
          : alignment === "right"
          ? "ml-auto mr-0"
          : "mx-auto";

      return (
        <div
          ref={containerRef}
          className={cn("my-2 relative group transition-all", widthClass, alignClass)}
          contentEditable={false}
        >
          {editor.isEditable ? (
            <div className="border bg-card rounded-md overflow-hidden">
              {/* Header Controls for Editor */}
              <div className="flex items-center justify-between px-2.5 py-1 bg-muted/40 border-b text-xs">
                <div className="flex items-center gap-1.5 font-semibold text-muted-foreground">
                  <BarChart2 className="w-3.5 h-3.5" />
                  <span>{activeData.title || "Interactive Chart"}</span>
                </div>
                <div className="flex items-center gap-1">
                  <Button
                    type="button"
                    variant="ghost"
                    size="sm"
                    className="h-6 px-2 text-[11px] flex items-center gap-1 hover:bg-background"
                    onClick={handleExportImage}
                    title="Export Chart as PNG Image"
                  >
                    <Download className="w-3 h-3 text-muted-foreground" />
                    Export Image
                  </Button>
                  {!isEditing && (
                    <Button
                      type="button"
                      variant="ghost"
                      size="sm"
                      className="h-6 px-2 text-[11px] flex items-center gap-1 hover:bg-background"
                      onClick={handleStartEditing}
                    >
                      <Edit2 className="w-3 h-3" />
                      Edit Data
                    </Button>
                  )}
                </div>
              </div>

              {/* Interactive Chart Preview */}
              <ChartRenderer data={activeData} />

              {/* Inline Data Editor */}
              {isEditing && (
                <div className="p-2 border-t bg-muted/10">
                  <ChartEditor
                    data={activeData}
                    onChange={setDraftData}
                    onSave={handleSave}
                    onCancel={handleCancel}
                  />
                </div>
              )}
            </div>
          ) : (
            /* Clean viewer mode without card border or header */
            <ChartRenderer data={activeData} />
          )}
        </div>
      );
    },
    toExternalHTML: (props) => {
      let data: ChartData = DEFAULT_CHART_DATA;
      try {
        data = typeof props.block.props.chartData === "string"
          ? JSON.parse(props.block.props.chartData)
          : props.block.props.chartData;
      } catch (e) {
        data = DEFAULT_CHART_DATA;
      }

      const jsonStr = JSON.stringify(data);

      const alignment = data.options?.alignment || "center";
      const width = data.options?.width || "full";

      const widthStyle =
        width === "small" ? "max-width: 50%;" : width === "medium" ? "max-width: 75%;" : "max-width: 100%;";

      const alignStyle =
        alignment === "left"
          ? "margin-right: auto; margin-left: 0;"
          : alignment === "right"
          ? "margin-left: auto; margin-right: 0;"
          : "margin-left: auto; margin-right: auto;";

      // Create fallback HTML table for non-JS clients / email
      const headerCols = data.categories.map((c) => `<th>${c}</th>`).join("");
      const bodyRows = data.series
        .map((s) => {
          const vals = s.values.map((v) => `<td>${v}</td>`).join("");
          return `<tr><td>${s.name}</td>${vals}</tr>`;
        })
        .join("");

      return (
        <div
          data-type="chart"
          data-chart-type={data.chartType}
          data-chart={jsonStr}
          className="chart-block-container my-4"
          style={{
            maxWidth: width === "small" ? "50%" : width === "medium" ? "75%" : "100%",
            marginLeft: alignment === "left" ? "0" : "auto",
            marginRight: alignment === "right" ? "0" : "auto",
          }}
        >
          <table>
            <thead>
              <tr>
                <th>Series</th>
                {headerCols}
              </tr>
            </thead>
            <tbody>{bodyRows}</tbody>
          </table>
        </div>
      );
    },
  }
);
