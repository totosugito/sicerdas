import { ExamCategory } from "@/api/exam/categories";
import { ColumnDef } from "@tanstack/react-table";
import { createRowNumberColumn } from "@/components/custom/table";
import { Badge } from "@/components/ui/badge";
import { DataTableColumnHeader } from "@/components/custom/table";
import { useTranslation } from "react-i18next";
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

interface CategoryColumnsProps {
    onEdit: (category: ExamCategory) => void;
    onDelete: (category: ExamCategory) => void;
}

export const useCategoryColumns = ({ onEdit, onDelete }: CategoryColumnsProps): ColumnDef<ExamCategory>[] => {
    const { t } = useTranslation();

    return [
        createRowNumberColumn<ExamCategory>({
            id: "no",
        }),
        {
            accessorKey: "name",
            header: ({ column }) => (
                <DataTableColumnHeader column={column} title={t("common.name")} />
            ),
            cell: ({ row }) => <div className="font-medium">{row.getValue("name")}</div>,
        },
        {
            accessorKey: "description",
            header: ({ column }) => (
                <DataTableColumnHeader column={column} title={t("common.description")} />
            ),
            cell: ({ row }) => (
                <div className="max-w-[300px] truncate text-muted-foreground italic text-sm">
                    {row.getValue("description") || "-"}
                </div>
            ),
        },
        {
            accessorKey: "isActive",
            header: ({ column }) => (
                <DataTableColumnHeader column={column} title={t("common.status")} />
            ),
            cell: ({ row }) => {
                const isActive = row.getValue("isActive") as boolean;
                return (
                    <Badge variant={isActive ? "success" : "secondary"}>
                        {isActive ? t("common.active") : t("common.inactive")}
                    </Badge>
                );
            },
        },
        {
            id: "actions",
            cell: ({ row }) => {
                const category = row.original;

                return (
                    <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                            <Button variant="ghost" className="h-8 w-8 p-0">
                                <span className="sr-only">Open menu</span>
                                <MoreHorizontal className="h-4 w-4" />
                            </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end">
                            <DropdownMenuLabel>{t("common.actions")}</DropdownMenuLabel>
                            <DropdownMenuSeparator />
                            <DropdownMenuItem onClick={() => onEdit(category)}>
                                <Pencil className="mr-2 h-4 w-4" />
                                {t("common.edit")}
                            </DropdownMenuItem>
                            <DropdownMenuItem
                                className="text-destructive focus:text-destructive"
                                onClick={() => onDelete(category)}
                            >
                                <Trash2 className="mr-2 h-4 w-4" />
                                {t("common.delete")}
                            </DropdownMenuItem>
                        </DropdownMenuContent>
                    </DropdownMenu>
                );
            },
        },
    ];
};
