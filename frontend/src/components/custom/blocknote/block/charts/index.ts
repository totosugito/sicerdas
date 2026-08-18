import React from "react";
import { DefaultReactSuggestionItem } from "@blocknote/react";
import { BarChart2 } from "lucide-react";
import { DEFAULT_CHART_DATA } from "./chart-types";
import "./styles.css";

export * from "./chart-types";
export * from "./chart-mapper";
export * from "./chart-renderer";
export * from "./chart-editor";
export * from "./chart-block";

export const getChartSlashMenuItem = (editor: any): DefaultReactSuggestionItem => ({
  title: "Chart",
  onItemClick: () => {
    editor.insertBlocks(
      [
        {
          type: "chart",
          props: {
            chartData: JSON.stringify(DEFAULT_CHART_DATA),
          },
        },
      ],
      editor.getTextCursorPosition().block,
      "after"
    );
  },
  aliases: ["chart", "graph", "bar", "line", "pie", "statistics", "data"],
  group: "Custom",
  icon: React.createElement(BarChart2, { className: "w-4 h-4" }),
  subtext: "Insert an interactive bar, line, or pie chart",
});
