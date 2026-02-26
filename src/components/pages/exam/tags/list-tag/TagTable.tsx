import { ExamTag, ListTagResponse } from '@/api/exam/tags';
import {
    DataTable,
    useDataTable,
    DataTableFilter,
    createRowNumberColumn,
    DataTableColumnHeader,
    PaginationData
} from '@/components/custom/table';
import { LongText } from '@/components/custom/components';
import { useTranslation } from 'react-i18next';
import { ColumnDef } from "@tanstack/react-table";
import { Badge } from "@/components/ui/badge";
import { MoreHorizontal, Pencil, Trash2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuLabel,
    DropdownMenuSeparator,
    DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { string_to_locale_date } from '@/lib/my-utils';

interface TagTableProps {
    data: ListTagResponse;
    isLoading: boolean;
    paginationData: PaginationData;
    onPaginationChange?: (pagination: { page: number; limit: number }) => void;
    setSearch: (search: string) => void;
    sortBy: string;
    sortOrder: "asc" | "desc";
    onSortChange: (sortBy: string, sortOrder: "asc" | "desc") => void;
    onEdit: (tag: ExamTag) => void;
    onDelete: (tag: ExamTag) => void;
}

export function TagTable({
    data,
    isLoading,
    paginationData,
    onPaginationChange,
    setSearch,
    sortBy,
    sortOrder,
    onSortChange,
    onEdit,
    onDelete,
}: TagTableProps) {
    const { t } = useTranslation();

    const columns: ColumnDef<ExamTag>[] = [
        createRowNumberColumn<ExamTag>({
            id: "no",
            size: 50,
            paginationData: paginationData
        }),
        {
            accessorKey: "name",
            enableSorting: true,
            header: ({ column }) => (
                <DataTableColumnHeader column={column} title={t("exam.tags.list.table.columns.name")} />
            ),
        },
        {
            accessorKey: "description",
            enableSorting: false,
            header: ({ column }) => (
                <DataTableColumnHeader column={column} title={t("exam.tags.list.table.columns.description")} />
            ),
            cell: ({ row }) => (
                <LongText
                    text={row.getValue("description") || "-"}
                    title={row.getValue("name")}
                    className="max-w-[300px] text-muted-foreground italic text-sm"
                />
            ),
        },
        {
            accessorKey: "totalQuestions",
            enableSorting: false,
            header: ({ column }) => (
                <DataTableColumnHeader column={column} title={t("exam.tags.list.table.columns.totalQuestions")} className='justify-center' />
            ),
            cell: ({ row }) => {
                const total = row.getValue("totalQuestions") as number;
                return (
                    <div className='flex justify-center'>
                        <span className="text-sm font-medium">{total}</span>
                    </div>
                );
            },
        },
        {
            accessorKey: "isActive",
            enableSorting: true,
            minSize: 70,
            maxSize: 70,
            header: ({ column }) => (
                <DataTableColumnHeader column={column} title={t("exam.tags.list.table.columns.status")} className='justify-center' />
            ),
            cell: ({ row }) => {
                const isActive = row.getValue("isActive") as boolean;
                return (
                    <div className='flex justify-center'>
                        <Badge variant={isActive ? "success" : "secondary"}>
                            {isActive ? t("exam.tags.list.table.status.active") : t("exam.tags.list.table.status.inactive")}
                        </Badge>
                    </div>
                );
            },
        },
        {
            accessorKey: "updatedAt",
            enableSorting: true,
            minSize: 100,
            maxSize: 100,
            header: ({ column }) => (
                <DataTableColumnHeader column={column} title={t("exam.tags.list.table.columns.updatedAt")} />
            ),
            cell: ({ row }) => (
                <span className="text-sm text-muted-foreground whitespace-nowrap">
                    {string_to_locale_date("id-ID", row.getValue("updatedAt"))}
                </span>
            ),
        },
        {
            id: "actions",
            minSize: 50,
            maxSize: 50,
            header: ({ column }) => (
                <DataTableColumnHeader column={column} title={t("exam.tags.list.table.columns.actions")} className='justify-center' />
            ),
            cell: ({ row }) => {
                const tag = row.original;

                return (
                    <div className='flex justify-center'>
                        <DropdownMenu>
                            <DropdownMenuTrigger asChild>
                                <Button variant="ghost" className="h-8 w-8 p-0">
                                    <span className="sr-only">{t("exam.tags.list.table.actions.openMenu")}</span>
                                    <MoreHorizontal className="h-4 w-4" />
                                </Button>
                            </DropdownMenuTrigger>
                            <DropdownMenuContent align="end">
                                <DropdownMenuLabel>{t("exam.tags.list.table.columns.actions")}</DropdownMenuLabel>
                                <DropdownMenuSeparator />
                                <DropdownMenuItem onClick={() => onEdit(tag)}>
                                    <Pencil className="mr-2 h-4 w-4" />
                                    {t("exam.tags.list.table.actions.edit")}
                                </DropdownMenuItem>
                                <DropdownMenuItem
                                    className="text-destructive focus:text-destructive"
                                    onClick={() => onDelete(tag)}
                                >
                                    <Trash2 className="mr-2 h-4 w-4" />
                                    {t("exam.tags.list.table.actions.delete")}
                                </DropdownMenuItem>
                            </DropdownMenuContent>
                        </DropdownMenu>
                    </div>
                );
            },
        },
    ];

    const { table } = useDataTable({
        data: data?.data.items || [],
        columns,
        pageCount: paginationData?.totalPages || -1,
        initialState: {
            pagination: {
                pageIndex: (paginationData?.page || 1) - 1,
                pageSize: paginationData?.limit || 10,
            },
            sorting: [
                {
                    id: sortBy,
                    desc: sortOrder === "desc",
                },
            ],
        },
        manualSorting: true,
        onSortingChange: (updater: any) => {
            const nextSorting = typeof updater === "function" ? updater(table.getState().sorting) : updater;
            if (nextSorting && nextSorting.length > 0) {
                onSortChange(nextSorting[0].id, nextSorting[0].desc ? "desc" : "asc");
            } else {
                onSortChange("updatedAt", "desc");
            }
        },
        manualPagination: true,
        onPaginationChange: (updater: any) => {
            const nextPagination = typeof updater === "function" ? updater(table.getState().pagination) : updater;
            if (onPaginationChange) {
                onPaginationChange({
                    page: nextPagination.pageIndex + 1,
                    limit: nextPagination.pageSize,
                });
            }
        },
        manualFiltering: true,
        onGlobalFilterChange: (searchValue: any) => {
            setSearch(searchValue);
        },
    });

    return (
        <div className="flex flex-col gap-4 border border-border rounded-lg bg-card">
            <div className={"flex flex-row gap-2 justify-between px-4 pt-4"}>
                <div></div>
                <div className={"flex flex-row gap-2 max-w-sm"}>
                    <DataTableFilter
                        table={table}
                        searchPlaceholder={t("exam.tags.list.table.search")}
                        className='min-w-sm'
                        searchOnEnter={true}
                    >
                    </DataTableFilter>
                </div>
            </div>
            <DataTable
                table={table}
                paginationData={paginationData}
                totalRowCount={paginationData?.total || 0}
                showSideBorders={false}
                showZebraStriping={true}
                defaultNoResultText={t("exam.tags.list.table.noResult")}
            />
        </div>
    );
}
