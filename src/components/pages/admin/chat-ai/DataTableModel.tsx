import React, { useMemo } from "react";
import { useTranslation } from "react-i18next";
import { IoMenu } from "react-icons/io5";
import { Button } from "@/components/ui/button";
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuGroup,
    DropdownMenuItem,
    DropdownMenuTrigger,
    DropdownMenuSeparator
} from "@/components/ui/dropdown-menu";
import { Badge } from "@/components/ui/badge";
import { CiTrash, CiEdit } from "react-icons/ci";
import {
    useDataTable,
    DataTable,
    DataTableColumnHeader,
    DataTableFilter, DataTableViewOptions,
    createRowNumberColumn
} from "@/components/custom/table";
import type { ColumnDef } from "@tanstack/react-table";
import { AiModel } from "@/api/chat-ai/list-models";

type Props = {
    data: Record<string, any>; // Containing items, total, etc.
    loading: boolean;
    onDeleteClicked: (item: AiModel) => void;
    onEditClicked: (item: AiModel) => void;
    toolbarContent?: React.ReactNode;
    onPaginationChange?: (paginationData: { page: number; limit: number; total?: number; totalPages?: number }) => void;
    paginationData?: {
        page: number;
        limit: number;
        total: number;
        totalPages: number;
    };
}

const DataTableModel = ({
    data, loading, onDeleteClicked,
    onEditClicked, toolbarContent,
    onPaginationChange, paginationData = { page: 1, limit: 10, total: 0, totalPages: 0 }
}: Props) => {
    const { t } = useTranslation();

    const columns = useMemo<ColumnDef<AiModel>[]>(() => [
        createRowNumberColumn({ accessorKey: "rowNum", id: "rowNum", paginationData: paginationData }),
        {
            accessorKey: "name",
            header: ({ column }) => <DataTableColumnHeader column={column} title={"Name"} />,
            cell: ({ cell, row }) => (
                <div>
                    <div className={"font-medium"}>{cell.getValue() as string}</div>
                    <div className={"text-xs text-muted-foreground"}>{row.original?.modelIdentifier}</div>
                </div>
            ),
        },
        {
            accessorKey: "provider",
            header: ({ column }) => <DataTableColumnHeader column={column} title={"Provider"} />,
        },
        {
            accessorKey: "status",
            header: "Tier",
            cell: ({ cell }) => {
                const status = cell.getValue() as string;
                return <Badge variant={status === 'free' ? 'secondary' : 'default'}>{status}</Badge>
            }
        },
        {
            accessorKey: "isEnabled",
            header: "Status",
            cell: ({ cell }) => {
                const isEnabled = cell.getValue() as boolean;
                const className = isEnabled
                    ? "border-green-700 bg-green-300 text-neutral-700"
                    : "border-red-700 bg-red-300 text-neutral-700";
                return (
                    <Badge className={className}>
                        {isEnabled ? "Active" : "Disabled"}
                    </Badge>
                )
            },
        },
        {
            accessorKey: "action",
            size: 60,
            header: "",
            cell: ({ row }) => {
                return (
                    <div className="text-center">
                        <DropdownMenu>
                            <DropdownMenuTrigger asChild>
                                <Button variant="ghost" size={"icon"} disabled={loading}><IoMenu /></Button>
                            </DropdownMenuTrigger>
                            <DropdownMenuContent className="w-56" side="bottom" align="start">
                                <DropdownMenuGroup>
                                    <DropdownMenuItem onClick={() => onEditClicked(row.original)}>
                                        <CiEdit /> {t("shared.edit")}
                                    </DropdownMenuItem>
                                    <DropdownMenuSeparator />
                                    <DropdownMenuItem onClick={() => onDeleteClicked(row.original)} className={"text-destructive"}>
                                        <CiTrash className={"text-destructive"} /> {t("shared.delete")}
                                    </DropdownMenuItem>
                                </DropdownMenuGroup>
                            </DropdownMenuContent>
                        </DropdownMenu>
                    </div>
                );
            }
        },
    ], [loading, paginationData]);

    const { table } = useDataTable({
        data: data?.items || [],
        columns,
        pageCount: paginationData.totalPages || -1,
        initialState: {
            columnPinning: { left: ["rowNum", "action"] },
            pagination: {
                pageIndex: paginationData.page - 1,
                pageSize: paginationData.limit
            },
        },
        manualSorting: true,
        manualPagination: true,
        onPaginationChange: (updater: any) => {
            const nextPagination = typeof updater === "function" ? updater(table.getState().pagination) : updater;
            if (onPaginationChange) {
                onPaginationChange({
                    page: nextPagination.pageIndex + 1,
                    limit: nextPagination.pageSize,
                    total: paginationData.total,
                    totalPages: paginationData.totalPages,
                });
            }
        },
        manualFiltering: false,
    });

    return (
        <div className={""}>
            <DataTable
                table={table}
                totalRowCount={paginationData.total}
                paginationData={paginationData}
            >
                <div className={"flex flex-row gap-2 justify-between"}>
                    <div className={"flex flex-row gap-2"}>
                        <DataTableFilter table={table} searchColumnIds={["name", "provider"]} searchPlaceholder="Search models..." />
                        <DataTableViewOptions table={table} />
                    </div>
                    {toolbarContent}
                </div>
            </DataTable>
        </div>
    );
}

export default DataTableModel;
