import { ExamPackageSection, ListSectionsResponse } from '@/api/exam-package-sections';
import {
    DataTable,
    useDataTable,
    DataTableFilter,
    createRowNumberColumn,
    DataTableColumnHeader,
    PaginationData
} from '@/components/custom/table';
import { useAppTranslation } from '@/lib/i18n-typed';
import { ColumnDef } from "@tanstack/react-table";
import { Badge } from "@/components/ui/badge";
import { MoreHorizontal, Pencil, Trash2, Eye } from "lucide-react";
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

interface SectionTableProps {
    data: ListSectionsResponse;
    isLoading: boolean;
    paginationData: PaginationData;
    onPaginationChange?: (pagination: { page: number; limit: number }) => void;
    setSearch: (search: string) => void;
    sortBy: string;
    sortOrder: "asc" | "desc";
    onSortChange: (sortBy: string, sortOrder: "asc" | "desc") => void;
    onDelete: (section: ExamPackageSection) => void;
    onEdit: (section: ExamPackageSection) => void;
}

export function SectionTable({
    data,
    isLoading,
    paginationData,
    onPaginationChange,
    setSearch,
    sortBy,
    sortOrder,
    onSortChange,
    onDelete,
    onEdit,
}: SectionTableProps) {
    const { t } = useAppTranslation();

    const columns: ColumnDef<ExamPackageSection>[] = [
        createRowNumberColumn<ExamPackageSection>({
            id: "no",
            size: 50,
            paginationData: paginationData
        }),
        {
            accessorKey: "title",
            enableSorting: true,
            header: ({ column }) => (
                <DataTableColumnHeader column={column} title={t($ => $.exam.sections.table.columns.title)} />
            ),
            cell: ({ row }) => {
                const section = row.original;
                return (
                    <div className="font-medium text-primary font-semibold">
                        <Link to={AppRoute.exam.packageSections.admin.detail.url.replace("$id", section.id)} className="hover:underline">
                            {row.getValue("title")}
                        </Link>
                    </div>
                );
            }
        },
        {
            accessorKey: "packageName",
            enableSorting: false,
            header: ({ column }) => (
                <DataTableColumnHeader column={column} title={t($ => $.exam.sections.table.columns.package)} />
            ),
            cell: ({ row }) => {
                const section = row.original;
                return (
                    <div className="font-medium text-primary">
                        <Link to={AppRoute.exam.packages.admin.detail.url.replace("$id", section.packageId)} className="hover:underline">
                            {row.getValue("packageName")}
                        </Link>
                    </div>
                );
            }
        },
        {
            accessorKey: "totalQuestions",
            enableSorting: true,
            size: 100,
            header: ({ column }) => (
                <DataTableColumnHeader column={column} title={t($ => $.exam.sections.table.columns.questions)} className='justify-center' />
            ),
            cell: ({ row }) => (
                <div className='flex justify-center'>
                    <span className="text-sm">{row.getValue("totalQuestions")}</span>
                </div>
            )
        },
        {
            accessorKey: "durationMinutes",
            enableSorting: true,
            minSize: 70,
            maxSize: 100,
            header: ({ column }) => (
                <DataTableColumnHeader column={column} title={t($ => $.exam.sections.table.columns.duration)} className='justify-center' />
            ),
            cell: ({ row }) => {
                const duration = row.getValue("durationMinutes") as number;
                return (
                    <div className='flex justify-center'>
                        <span className="text-sm">{duration || "-"}</span>
                    </div>
                );
            },
        },
        {
            accessorKey: "isActive",
            enableSorting: true,
            size: 70,
            minSize: 70,
            maxSize: 70,
            header: ({ column }) => (
                <DataTableColumnHeader column={column} title={t($ => $.exam.sections.table.columns.status)} className='justify-center' />
            ),
            cell: ({ row }) => {
                const isActive = row.getValue("isActive") as boolean;
                return (
                    <div className='flex justify-center'>
                        <Badge variant={isActive ? "success" : "secondary"}>
                            {isActive ? t($ => $.exam.sections.table.status.active) : t($ => $.exam.sections.table.status.inactive)}
                        </Badge>
                    </div>
                );
            },
        },
        {
            accessorKey: "updatedAt",
            enableSorting: true,
            minSize: 70,
            maxSize: 100,
            header: ({ column }) => (
                <DataTableColumnHeader column={column} title={t($ => $.exam.sections.table.columns.updatedAt)} />
            ),
            cell: ({ row }) => (
                <span className="text-sm text-muted-foreground">
                    {string_to_locale_date("id-ID", row.getValue("updatedAt"))}
                </span>
            ),
        },
        {
            id: "actions",
            minSize: 50,
            maxSize: 50,
            header: ({ column }) => (
                <DataTableColumnHeader column={column} title={t($ => $.exam.sections.table.columns.actions)} className='justify-center' />
            ),
            cell: ({ row }) => {
                const section = row.original;

                return (
                    <div className='flex justify-center'>
                        <DropdownMenu>
                            <DropdownMenuTrigger asChild>
                                <Button variant="ghost" className="h-8 w-8 p-0">
                                    <span className="sr-only">{t($ => $.exam.sections.table.actions.openMenu)}</span>
                                    <MoreHorizontal className="h-4 w-4" />
                                </Button>
                            </DropdownMenuTrigger>
                            <DropdownMenuContent align="end">
                                <DropdownMenuLabel>{t($ => $.exam.sections.table.columns.actions)}</DropdownMenuLabel>
                                <DropdownMenuSeparator />
                                <DropdownMenuItem asChild>
                                    <Link to={AppRoute.exam.packageSections.admin.detail.url.replace("$id", section.id)}>
                                        <Eye className="mr-2 h-4 w-4" />
                                        {t($ => $.exam.sections.table.actions.detail)}
                                    </Link>
                                </DropdownMenuItem>
                                <DropdownMenuItem
                                    onClick={() => onEdit(section)}
                                >
                                    <Pencil className="mr-2 h-4 w-4" />
                                    {t($ => $.exam.sections.table.actions.edit)}
                                </DropdownMenuItem>
                                <DropdownMenuItem
                                    className="text-destructive focus:text-destructive"
                                    onClick={() => onDelete(section)}
                                >
                                    <Trash2 className="mr-2 h-4 w-4" />
                                    {t($ => $.exam.sections.table.actions.delete)}
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
                        searchPlaceholder={t($ => $.exam.sections.table.search)}
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
                defaultNoResultText={t($ => $.exam.sections.table.noResult)}
            />
        </div>
    );
}
