import { ExamCategory } from '@/api/(exam)/(categories)';
import {
    DataTable,
    useDataTable,
    DataTableFilter,
    createRowNumberColumn,
    DataTableColumnHeader
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

interface CategoryTableProps {
    data: any;
    isLoading: boolean;
    page: number;
    limit: number;
    setPage: (page: number) => void;
    setLimit: (limit: number) => void;
    setSearch: (search: string) => void;
    onEdit: (category: ExamCategory) => void;
    onDelete: (category: ExamCategory) => void;
}

export function CategoryTable({
    data,
    isLoading,
    page,
    limit,
    setPage,
    setLimit,
    setSearch,
    onEdit,
    onDelete,
}: CategoryTableProps) {
    const { t } = useTranslation();

    const columns: ColumnDef<ExamCategory>[] = [
        createRowNumberColumn<ExamCategory>({
            id: "no",
            size: 50
        }),
        {
            accessorKey: "name",
            enableSorting: false,
            header: ({ column }) => (
                <DataTableColumnHeader column={column} title={t("exam.categories.list.table.columns.name")} />
            ),
            cell: ({ row }) => <div className="font-medium">{row.getValue("name")}</div>,
        },
        {
            accessorKey: "description",
            enableSorting: false,
            header: ({ column }) => (
                <DataTableColumnHeader column={column} title={t("exam.categories.list.table.columns.description")} />
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
            accessorKey: "isActive",
            enableSorting: false,
            minSize: 50,
            maxSize: 50,
            header: ({ column }) => (
                <DataTableColumnHeader column={column} title={t("exam.categories.list.table.columns.status")} className='justify-center' />
            ),
            cell: ({ row }) => {
                const isActive = row.getValue("isActive") as boolean;
                return (
                    <div className='flex justify-center'>
                        <Badge variant={isActive ? "success" : "secondary"}>
                            {isActive ? t("exam.categories.list.table.status.active") : t("exam.categories.list.table.status.inactive")}
                        </Badge>
                    </div>
                );
            },
        },
        {
            id: "actions",
            minSize: 50,
            maxSize: 50,
            header: ({ column }) => (
                <DataTableColumnHeader column={column} title={t("exam.categories.list.table.columns.actions")} className='justify-center' />
            ),
            cell: ({ row }) => {
                const category = row.original;

                return (
                    <div className='flex justify-center'>
                        <DropdownMenu>
                            <DropdownMenuTrigger asChild>
                                <Button variant="ghost" className="h-8 w-8 p-0">
                                    <span className="sr-only">{t("exam.categories.list.table.actions.openMenu")}</span>
                                    <MoreHorizontal className="h-4 w-4" />
                                </Button>
                            </DropdownMenuTrigger>
                            <DropdownMenuContent align="end">
                                <DropdownMenuLabel>{t("exam.categories.list.table.columns.actions")}</DropdownMenuLabel>
                                <DropdownMenuSeparator />
                                <DropdownMenuItem onClick={() => onEdit(category)}>
                                    <Pencil className="mr-2 h-4 w-4" />
                                    {t("exam.categories.list.table.actions.edit")}
                                </DropdownMenuItem>
                                <DropdownMenuItem
                                    className="text-destructive focus:text-destructive"
                                    onClick={() => onDelete(category)}
                                >
                                    <Trash2 className="mr-2 h-4 w-4" />
                                    {t("exam.categories.list.table.actions.delete")}
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
        pageCount: data?.data.meta.totalPages || 0,
        manualPagination: true,
        onPaginationChange: (updater: any) => {
            const nextPagination = typeof updater === 'function'
                ? updater({ pageIndex: page - 1, pageSize: limit })
                : updater;
            setPage(nextPagination.pageIndex + 1);
            setLimit(nextPagination.pageSize);
        },
        manualFiltering: true,
        onGlobalFilterChange: (searchValue: any) => {
            setSearch(searchValue);
            setPage(1);
        },
        initialState: {
            pagination: {
                pageIndex: page - 1,
                pageSize: limit,
            },
        },
    });

    return (
        <div className="flex flex-col gap-4 border border-border rounded-lg bg-card">
            <div className={"flex flex-row gap-2 justify-between px-4 pt-4"}>
                <div></div>
                <div className={"flex flex-row gap-2 max-w-sm"}>
                    <DataTableFilter
                        table={table}
                        searchPlaceholder={t("exam.categories.list.table.search")}
                        className='min-w-sm'
                        searchOnEnter={true}
                    >
                    </DataTableFilter>
                </div>
            </div>
            <DataTable
                table={table}
                paginationData={data?.data.meta}
                totalRowCount={data?.data.meta.total}
                showSideBorders={false}
                showZebraStriping={true}
            />
        </div>
    );
}
