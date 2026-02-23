import { createFileRoute } from '@tanstack/react-router';
import {
    useListCategory,
    useDeleteCategory,
    ExamCategory
} from '@/api/exam/categories';
import { useQueryClient } from '@tanstack/react-query';
import { showNotifSuccess, showNotifError } from "@/lib/show-notif";
import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { Button } from '@/components/ui/button';
import { PageTitle } from '@/components/app';
import { Plus, Trash2 } from 'lucide-react';
import { DialogModal } from '@/components/custom/components';
import { CategoryTable, DialogCategoryCreate } from '@/components/pages/exam/categories';

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

    const confirmDelete = () => {
        if (!selectedCategory) return;
        deleteMutation.mutate(selectedCategory.id, {
            onSuccess: (res) => {
                showNotifSuccess({ message: res.message || t("exam.categories.categories.delete.success") });
                queryClient.invalidateQueries({ queryKey: ["admin-exam-categories-list"] });
                setShowDeleteDialog(false);
            },
            onError: (err: any) => {
                showNotifError({ message: err.message || t("labels.error") });
            }
        });
    };

    return (
        <div className="flex flex-col gap-6 w-full">
            <div className="flex justify-between items-start">
                <PageTitle
                    title={t("exam.categories.categories.title")}
                    description={<span>{t("exam.categories.categories.description")}</span>}
                />
                <Button onClick={handleAdd} className="flex-shrink-0 gap-1.5 shadow-sm">
                    <Plus className="h-4 w-4" />
                    <span className="hidden sm:inline">{t("labels.add")}</span>
                </Button>
            </div>

            <CategoryTable
                data={data}
                isLoading={isLoading}
                page={page}
                limit={limit}
                setPage={setPage}
                setLimit={setLimit}
                setSearch={setSearch}
                onEdit={handleEdit}
                onDelete={handleDelete}
            />

            <DialogCategoryCreate
                open={showDialog}
                onOpenChange={setShowDialog}
                category={selectedCategory}
            />

            <DialogModal
                open={showDeleteDialog}
                onOpenChange={setShowDeleteDialog}
                modal={{
                    title: t("exam.categories.categories.delete.confirmTitle"),
                    desc: t("exam.categories.categories.delete.confirmDesc", { name: selectedCategory?.name }),
                    infoContainer: t("exam.categories.categories.delete.deleteInfo"),
                    infoContainerVariant: "error",
                    variant: "destructive",
                    iconType: "error",
                    headerIcon: <Trash2 className="h-5 w-5 text-destructive" />,
                    textCancel: t("labels.cancel"),
                    textConfirm: t("labels.delete"),
                    onConfirmClick: confirmDelete,
                }}
            />
        </div>
    );
}
