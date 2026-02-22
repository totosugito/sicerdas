import { createFileRoute } from '@tanstack/react-router';
import {
    useListCategory,
    useCreateCategory,
    useUpdateCategory,
    useDeleteCategory,
    ExamCategory
} from '@/api/exam/categories';
import { useQueryClient } from '@tanstack/react-query';
import { showNotifSuccess, showNotifError } from "@/lib/show-notif";
import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { Button } from '@/components/ui/button';
import { PageTitle } from '@/components/app';
import { Plus, Trash2, Search } from 'lucide-react';
import { DialogModal } from '@/components/custom/components';
import { DataTable, useDataTable } from '@/components/custom/table';
import { useCategoryColumns } from '@/components/pages/exam/categories/admin/category-columns';
import { CategoryDialog } from '@/components/pages/exam/categories/admin/category-dialog';
import { Input } from '@/components/ui/input';

export const Route = createFileRoute('/(pages)/exam/categories/admin/categories')({
    component: AdminExamCategoriesPage,
});

function AdminExamCategoriesPage() {
    const { t } = useTranslation();
    const queryClient = useQueryClient();

    // States for pagination, search, and sorting
    const [page, setPage] = useState(1);
    const [limit, setLimit] = useState(10);
    const [search, setSearch] = useState("");
    const [sortBy, setSortBy] = useState("createdAt");
    const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>("desc");

    // API Hooks
    const { data, isLoading } = useListCategory({
        page,
        limit,
        search,
        sortBy,
        sortOrder,
    });

    const createMutation = useCreateCategory();
    const updateMutation = useUpdateCategory();
    const deleteMutation = useDeleteCategory();

    // Dialog & Modal States
    const [showDialog, setShowDialog] = useState(false);
    const [showDeleteDialog, setShowDeleteDialog] = useState(false);
    const [selectedCategory, setSelectedCategory] = useState<ExamCategory | null>(null);

    // Handlers
    const handleAdd = () => {
        setSelectedCategory(null);
        setShowDialog(true);
    };

    const handleEdit = (category: ExamCategory) => {
        setSelectedCategory(category);
        setShowDialog(true);
    };

    const handleDelete = (category: ExamCategory) => {
        setSelectedCategory(category);
        setShowDeleteDialog(true);
    };

    const handleDialogSubmit = (values: any) => {
        if (selectedCategory) {
            updateMutation.mutate({ id: selectedCategory.id, ...values }, {
                onSuccess: (res) => {
                    showNotifSuccess({ message: res.message });
                    queryClient.invalidateQueries({ queryKey: ["admin-exam-categories-list"] });
                    setShowDialog(false);
                },
                onError: (err: any) => {
                    showNotifError({ message: err.message || t("common.error") });
                }
            });
        } else {
            createMutation.mutate(values, {
                onSuccess: (res) => {
                    showNotifSuccess({ message: res.message });
                    queryClient.invalidateQueries({ queryKey: ["admin-exam-categories-list"] });
                    setShowDialog(false);
                },
                onError: (err: any) => {
                    showNotifError({ message: err.message || t("common.error") });
                }
            });
        }
    };

    const confirmDelete = () => {
        if (!selectedCategory) return;
        deleteMutation.mutate(selectedCategory.id, {
            onSuccess: (res) => {
                showNotifSuccess({ message: res.message });
                queryClient.invalidateQueries({ queryKey: ["admin-exam-categories-list"] });
                setShowDeleteDialog(false);
            },
            onError: (err: any) => {
                showNotifError({ message: err.message || t("common.error") });
            }
        });
    };

    // Table Setup
    const columns = useCategoryColumns({
        onEdit: handleEdit,
        onDelete: handleDelete,
    });

    const { table } = useDataTable({
        data: data?.data.items || [],
        columns,
        pageCount: data?.data.meta.totalPages || 0,
        manualPagination: true,
        onPaginationChange: (updater: any) => {
            const nextPagination = typeof updater === 'function' ? updater({ pageIndex: page - 1, pageSize: limit }) : updater;
            setPage(nextPagination.pageIndex + 1);
            setLimit(nextPagination.pageSize);
        },
        state: {
            pagination: {
                pageIndex: page - 1,
                pageSize: limit,
            },
        },
    });

    return (
        <div className="flex flex-col w-full space-y-4 py-6">
            <div className="flex justify-between items-start">
                <PageTitle
                    title={t("exam.categories.title", "Manajemen Kategori")}
                    description={<span>{t("exam.categories.description", "Kelola kategori ujian untuk mempermudah organisasi paket soal.")}</span>}
                />
                <Button onClick={handleAdd} className="flex-shrink-0 gap-1.5 shadow-sm">
                    <Plus className="h-4 w-4" />
                    <span className="hidden sm:inline">{t("common.add")}</span>
                </Button>
            </div>

            <div className="flex items-center gap-2 max-w-sm mb-2">
                <div className="relative w-full">
                    <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
                    <Input
                        placeholder={t("common.search", "Cari kategori...")}
                        className="pl-8"
                        value={search}
                        onChange={(e) => {
                            setSearch(e.target.value);
                            setPage(1);
                        }}
                    />
                </div>
            </div>

            <DataTable
                table={table}
                paginationData={data?.data.meta}
                totalRowCount={data?.data.meta.total}
            />

            <CategoryDialog
                open={showDialog}
                onOpenChange={setShowDialog}
                category={selectedCategory}
                onSubmit={handleDialogSubmit}
                isPending={createMutation.isPending || updateMutation.isPending}
            />

            <DialogModal
                open={showDeleteDialog}
                onOpenChange={setShowDeleteDialog}
                modal={{
                    title: t("common.deleteConfirm", { name: selectedCategory?.name }),
                    desc: t("exam.categories.delete.confirmDesc", "Apakah Anda yakin ingin menghapus kategori ini? Tindakan ini tidak dapat dibatalkan."),
                    variant: "destructive",
                    iconType: "error",
                    headerIcon: <Trash2 className="h-5 w-5 text-destructive" />,
                    textCancel: t("common.cancel"),
                    textConfirm: t("common.delete"),
                    onConfirmClick: confirmDelete,
                    isPending: deleteMutation.isPending,
                }}
            />
        </div>
    );
}
