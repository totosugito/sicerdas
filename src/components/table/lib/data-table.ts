import type { Column, TableFeatures, RowData } from "@tanstack/react-table";
import React from "react";

export function getCommonPinningStyles<TData extends RowData = any>({
  column,
  withBorder = false,
}: {
  column: Column<TableFeatures, TData>;
  withBorder?: boolean;
}): React.CSSProperties {
  const isPinned = column.getIsPinned();
  const isLeftPinned = (isPinned as any) === "left";
  const isRightPinned = (isPinned as any) === "right";
  const isLastLeftPinnedColumn =
    isLeftPinned && column.getIsLastColumn("left" as any);
  const isFirstRightPinnedColumn =
    isRightPinned && column.getIsFirstColumn("right" as any);

  return {
    boxShadow: withBorder
      ? isLastLeftPinnedColumn
        ? "-4px 0 4px -4px var(--border) inset"
        : isFirstRightPinnedColumn
          ? "4px 0 4px -4px var(--border) inset"
          : undefined
      : undefined,
    left: isLeftPinned ? `${column.getStart("left" as any)}px` : undefined,
    right: isRightPinned ? `${column.getAfter("right" as any)}px` : undefined,
    opacity: isPinned ? 0.97 : 1,
    position: isPinned ? "sticky" : "relative",
    width: column.getSize(),
    zIndex: isPinned ? 1 : 0,
  };
}