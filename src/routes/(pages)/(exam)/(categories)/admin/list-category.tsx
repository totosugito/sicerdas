import { createFileRoute } from '@tanstack/react-router';
import {
    useListCategory,
    useDeleteCategory,
    ExamCategory,
    ListCategoryResponse
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
import { PaginationData } from '@/components/custom/table';
import { z } from 'zod';

export const Route = createFileRoute('/(pages)/(exam)/(categories)/admin/list-category')({
    validateSearch: z.object({
        page: z.number().min(1).optional().catch(undefined),
        limit: z.number().min(5).optional().catch(undefined),
        search: z.string().optional().catch(undefined),
        sortBy: z.string().optional().catch(undefined),
        sortOrder: z.enum(['asc', 'desc']).optional().catch(undefined),
    }),
    component: AdminExamCategoriesPage,
});

function AdminExamCategoriesPage() {
    const { t } = useTranslation();
    const queryClient = useQueryClient();
    const navigate = Route.useNavigate();
    const searchParams = Route.useSearch();

    // States for pagination, search, and sorting
    const page = searchParams.page ?? 1;
    const limit = searchParams.limit ?? 10;
    const search = searchParams.search ?? "";
    const sortBy = searchParams.sortBy ?? "name";
    const sortOrder = searchParams.sortOrder ?? "asc";

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
                showNotifSuccess({ message: res.message || t("exam.categories.list.delete.success") });
                queryClient.invalidateQueries({ queryKey: ["exam-categories-list"] });
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
                    title={t("exam.categories.list.title")}
                    description={<span>{t("exam.categories.list.description")}</span>}
                />
                <Button onClick={handleAdd} className="flex-shrink-0 gap-1.5 shadow-sm">
                    <Plus className="h-4 w-4" />
                    <span className="hidden sm:inline">{t("labels.add")}</span>
                </Button>
            </div>

            <CategoryTable
                data={data as ListCategoryResponse}
                isLoading={isLoading}
                paginationData={data?.data.meta as PaginationData}
                onPaginationChange={(pagination: { page: number; limit: number }) => {
                    navigate({
                        search: {
                            ...searchParams,
                            page: pagination.page,
                            limit: pagination.limit,
                        },
                        replace: true,
                    });
                }}
                setSearch={(newSearch) => {
                    navigate({
                        search: {
                            ...searchParams,
                            search: newSearch || undefined,
                            page: 1,
                        },
                        replace: true,
                    });
                }}
                sortBy={sortBy}
                sortOrder={sortOrder as "asc" | "desc"}
                onSortChange={(newSortBy, newSortOrder) => {
                    navigate({
                        search: {
                            ...searchParams,
                            sortBy: newSortBy,
                            sortOrder: newSortOrder,
                            page: 1, // Reset to page 1 on resort
                        },
                        replace: true,
                    });
                }}
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
                    title: t("exam.categories.list.delete.confirmTitle"),
                    desc: t("exam.categories.list.delete.confirmDesc", { name: selectedCategory?.name }),
                    infoContainer: t("exam.categories.list.delete.deleteInfo"),
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
