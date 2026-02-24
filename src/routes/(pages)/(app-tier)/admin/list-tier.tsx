import { TierList, TierListSkeleton, TierEmptyState } from '@/components/pages/app-tier/list-tier';
import { createFileRoute, Link } from '@tanstack/react-router';
import { useListTier, useDeleteTier, useUpdateTier, AppTier } from '@/api/app-tier';
import { useQueryClient } from '@tanstack/react-query';
import { showNotifSuccess, showNotifError } from "@/lib/show-notif";
import { useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';
import {
    KeyboardSensor,
    PointerSensor,
    useSensor,
    useSensors,
    DragEndEvent
} from '@dnd-kit/core';
import {
    sortableKeyboardCoordinates,
    arrayMove
} from '@dnd-kit/sortable';
import { Button } from '@/components/ui/button';
import { PageTitle } from '@/components/app';
import { AppRoute } from '@/constants/app-route';
import { Plus, Trash2 } from 'lucide-react';
import { DialogModal } from '@/components/custom/components';

export const Route = createFileRoute('/(pages)/(app-tier)/admin/list-tier')({
    component: AdminTierPricingPage,
});

function AdminTierPricingPage() {
    const { t } = useTranslation();
    const { data, isLoading } = useListTier();
    const deleteMutation = useDeleteTier();
    const updateMutation = useUpdateTier();
    const queryClient = useQueryClient();

    const [items, setItems] = useState<AppTier[]>([]);
    const [showDeleteDialog, setShowDeleteDialog] = useState(false);
    const [tierToDelete, setTierToDelete] = useState<{ slug: string; name: string } | null>(null);

    useEffect(() => {
        if (data?.data) {
            // Sort by sortOrder initially
            const sorted = [...data.data].sort((a, b) => (a.sortOrder || 0) - (b.sortOrder || 0));
            setItems(sorted);
        }
    }, [data]);

    const sensors = useSensors(
        useSensor(PointerSensor),
        useSensor(KeyboardSensor, {
            coordinateGetter: sortableKeyboardCoordinates,
        })
    );

    const handleDelete = (slug: string, name: string) => {
        setTierToDelete({ slug, name });
        setShowDeleteDialog(true);
    };

    const confirmDelete = () => {
        if (!tierToDelete) return;

        deleteMutation.mutate(tierToDelete.slug, {
            onSuccess: (data) => {
                showNotifSuccess({ message: data.message });
                queryClient.invalidateQueries({ queryKey: ['admin-app-tier-list'] });
                setShowDeleteDialog(false);
                setTierToDelete(null);
            },
            onError: (error: any) => {
                showNotifError({ message: error.message || t('appTier.list.deleteError') });
                setShowDeleteDialog(false);
                setTierToDelete(null);
            }
        });
    };

    const handleDragEnd = (event: DragEndEvent) => {
        const { active, over } = event;

        if (active.id !== over?.id) {
            setItems((items) => {
                const oldIndex = items.findIndex((item) => item.slug === active.id);
                const newIndex = items.findIndex((item) => item.slug === over?.id);

                const newItems = arrayMove(items, oldIndex, newIndex);

                // Update sortOrder locally for visual consistency
                const updatedItems = newItems.map((item, index) => ({
                    ...item,
                    sortOrder: index + 1,
                }));

                // Trigger API updates
                Promise.all(updatedItems.map(item =>
                    updateMutation.mutateAsync({
                        slug: item.slug,
                        sortOrder: item.sortOrder
                    })
                )).then((success: any) => {
                    showNotifSuccess({ message: success.message || t('appTier.list.orderSuccess') });
                    queryClient.invalidateQueries({ queryKey: ['admin-app-tier-list'] });
                }).catch((error: any) => {
                    showNotifError({ message: error.message || t('appTier.list.orderError') });
                    queryClient.invalidateQueries({ queryKey: ['admin-app-tier-list'] });
                });

                return updatedItems;
            });
        }
    };

    if (isLoading) {
        return (
            <div className="flex flex-col w-full space-y-4 py-6">
                <div className="flex justify-between items-start">
                    <PageTitle title={t('appTier.list.pageTitle')} description={<span>{t('appTier.list.description')}</span>} />
                </div>
                <TierListSkeleton />
            </div>
        );
    }

    return (
        <div className="flex flex-col w-full space-y-4 py-6">
            <div className="flex justify-between items-start">
                <PageTitle title={t('appTier.list.pageTitle')} description={<span>{t('appTier.list.description')}</span>} />
                {items.length > 0 &&
                    <Button asChild className="flex-shrink-0 gap-1.5 shadow-sm">
                        <Link to={AppRoute.appTier.adminCreate.url} className="gap-2">
                            <Plus className="h-4 w-4" />
                            <span className="hidden sm:inline">{t('appTier.list.createButton')}</span>
                        </Link>
                    </Button>}
            </div>
            {items.length === 0 ? (
                <TierEmptyState />
            ) : (
                <TierList
                    items={items}
                    sensors={sensors}
                    onDragEnd={handleDragEnd}
                    onDelete={handleDelete}
                />
            )}

            {/* Delete Confirmation Dialog */}
            <DialogModal
                open={showDeleteDialog}
                onOpenChange={setShowDeleteDialog}
                modal={{
                    title: t('appTier.list.deleteDialog.title', { name: tierToDelete?.name }),
                    desc: t('appTier.list.deleteDialog.description'),
                    variant: "destructive",
                    iconType: "error",
                    headerIcon: <Trash2 className="h-5 w-5 text-destructive" />,
                    showInfoSection: true,
                    infoTitle: t('appTier.list.deleteDialog.infoTitle'),
                    infoItems: [
                        { text: t('appTier.list.deleteDialog.consequence1') },
                        { text: t('appTier.list.deleteDialog.consequence2') },
                        { text: t('appTier.list.deleteDialog.consequence3') },
                    ],
                    textCancel: t('appTier.list.deleteDialog.cancel'),
                    textConfirm: t('appTier.list.deleteDialog.confirm'),
                    onConfirmClick: confirmDelete,
                    onCancelClick: () => {
                        setShowDeleteDialog(false);
                        setTierToDelete(null);
                    },
                }}
            />
        </div>
    );
}
