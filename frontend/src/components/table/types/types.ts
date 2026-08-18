import type { Column, ColumnDef, Table, Row, Header, TableFeatures, RowData } from "@tanstack/react-table";

export type CustomColumnDef<TData extends RowData = any, TValue = unknown> = ColumnDef<TableFeatures, TData, TValue>;
export type CustomTable<TData extends RowData = any> = Table<TableFeatures, TData>;
export type CustomColumn<TData extends RowData = any, TValue = unknown> = Column<TableFeatures, TData, TValue>;
export type CustomRow<TData extends RowData = any> = Row<TableFeatures, TData>;
export type CustomHeader<TData extends RowData = any, TValue = unknown> = Header<TableFeatures, TData, TValue>;

export interface ColumnMeta<TData extends RowData = any> {
  label?: string;
  initialVisible?: boolean;
  disableHiding?: boolean;
  variant?: 'text' | 'number' | 'select' | 'date' | 'datetime-local' | 'time' | 'checkbox' | 'radio' | 'switch';
  placeholder?: string;
  unit?: string;
  options?: Array<{ label: string; value: string | number }>;
  // Add any other meta properties you need
}

export type ColumnWithMeta<TData extends RowData = any> = CustomColumn<TData> & {
  columnDef: {
    meta?: ColumnMeta<TData>;
  };
};

export interface PaginationData {
  page: number;
  limit: number;
  total: number;
  totalPages: number;
}