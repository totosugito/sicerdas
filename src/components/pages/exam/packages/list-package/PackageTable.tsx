import { ExamPackage, ListPackagesResponse } from '@/api/exam/packages';
import {
    DataTable,
    useDataTable,
    DataTableFilter,
    createRowNumberColumn,
    DataTableColumnHeader,
    PaginationData
} from '@/components/custom/table';
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
import { Link } from '@tanstack/react-router';
import { AppRoute } from '@/constants/app-route';

interface PackageTableProps {
    data: ListPackagesResponse;
    isLoading: boolean;
    paginationData: PaginationData;
    onPaginationChange?: (pagination: { page: number; limit: number }) => void;
    setSearch: (search: string) => void;
    sortBy: string;
    sortOrder: "asc" | "desc";
    onSortChange: (sortBy: string, sortOrder: "asc" | "desc") => void;
    onDelete: (pkg: ExamPackage) => void;
}

export function PackageTable({
    data,
    isLoading,
    paginationData,
    onPaginationChange,
    setSearch,
    sortBy,
    sortOrder,
    onSortChange,
    onDelete,
}: PackageTableProps) {
    const { t } = useTranslation();

    const columns: ColumnDef<ExamPackage>[] = [
        createRowNumberColumn<ExamPackage>({
            id: "no",
            size: 50,
            paginationData: paginationData
        }),
        {
            accessorKey: "title",
            enableSorting: true,
            header: ({ column }) => (
                <DataTableColumnHeader column={column} title={t("exam.packages.list.table.columns.title")} />
            ),
            cell: ({ row }) => (
                <div className="font-medium text-primary">
                    {row.getValue("title")}
                </div>
            )
        },
        {
            accessorKey: "examType",
            enableSorting: true,
            header: ({ column }) => (
                <DataTableColumnHeader column={column} title={t("exam.packages.list.table.columns.examType")} />
            ),
            cell: ({ row }) => (
                <Badge variant="outline" className="capitalize">
                    {row.getValue("examType")}
                </Badge>
            )
        },
        {
            accessorKey: "durationMinutes",
            enableSorting: true,
            header: ({ column }) => (
                <DataTableColumnHeader column={column} title={t("exam.packages.list.table.columns.duration")} className='justify-center' />
            ),
            cell: ({ row }) => {
                const duration = row.getValue("durationMinutes") as number;
                return (
                    <div className='flex justify-center'>
                        <span className="text-sm">{duration}</span>
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
                <DataTableColumnHeader column={column} title={t("exam.packages.list.table.columns.status")} className='justify-center' />
            ),
            cell: ({ row }) => {
                const isActive = row.getValue("isActive") as boolean;
                return (
                    <div className='flex justify-center'>
                        <Badge variant={isActive ? "success" : "secondary"}>
                            {isActive ? t("exam.packages.list.table.status.active") : t("exam.packages.list.table.status.inactive")}
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
                <DataTableColumnHeader column={column} title={t("exam.packages.list.table.columns.updatedAt")} />
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
                <DataTableColumnHeader column={column} title={t("exam.packages.list.table.columns.actions")} className='justify-center' />
            ),
            cell: ({ row }) => {
                const pkg = row.original;

                return (
                    <div className='flex justify-center'>
                        <DropdownMenu>
                            <DropdownMenuTrigger asChild>
                                <Button variant="ghost" className="h-8 w-8 p-0">
                                    <span className="sr-only">{t("exam.packages.list.table.actions.openMenu")}</span>
                                    <MoreHorizontal className="h-4 w-4" />
                                </Button>
                            </DropdownMenuTrigger>
                            <DropdownMenuContent align="end">
                                <DropdownMenuLabel>{t("exam.packages.list.table.columns.actions")}</DropdownMenuLabel>
                                <DropdownMenuSeparator />
                                <DropdownMenuItem asChild>
                                    <Link to={AppRoute.exam.packages.admin.edit.url.replace("$id", pkg.id)}>
                                        <Pencil className="mr-2 h-4 w-4" />
                                        {t("exam.packages.list.table.actions.edit")}
                                    </Link>
                                </DropdownMenuItem>
                                <DropdownMenuItem
                                    className="text-destructive focus:text-destructive"
                                    onClick={() => onDelete(pkg)}
                                >
                                    <Trash2 className="mr-2 h-4 w-4" />
                                    {t("exam.packages.list.table.actions.delete")}
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
                        searchPlaceholder={t("exam.packages.list.table.search")}
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
                defaultNoResultText={t("exam.packages.list.table.noResult")}
            />
        </div>
    );
}
