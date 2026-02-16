import { TierPricingList, TierPricingListSkeleton, TierPricingEmptyState } from '@/components/pages/tier-pricing/list-tier-pricing';
import { createFileRoute, Link } from '@tanstack/react-router';
import { useListTierPricing, useDeleteTierPricing, useUpdateTierPricing, TierPricing } from '@/api/tier-pricing';
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
import { Plus } from 'lucide-react';

export const Route = createFileRoute('/(pages)/(tier-pricing)/admin/list-tier')({
    component: AdminTierPricingPage,
});

function AdminTierPricingPage() {
    const { t } = useTranslation();
    const { data, isLoading } = useListTierPricing();
    const deleteMutation = useDeleteTierPricing();
    const updateMutation = useUpdateTierPricing();
    const queryClient = useQueryClient();

    const [items, setItems] = useState<TierPricing[]>([]);

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

    const handleDelete = (slug: string) => {
        if (confirm(t('tierPricing.list.confirmDelete'))) {
            deleteMutation.mutate(slug, {
                onSuccess: (data) => {
                    showNotifSuccess({ message: data.message });
                    queryClient.invalidateQueries({ queryKey: ['admin-tier-pricing-list'] });
                },
                onError: (error: any) => {
                    showNotifError({ message: error.message || t('tierPricing.list.deleteError') });
                }
            });
        }
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
                    showNotifSuccess({ message: success.message || t('tierPricing.list.orderSuccess') });
                    queryClient.invalidateQueries({ queryKey: ['admin-tier-pricing-list'] });
                }).catch((error: any) => {
                    showNotifError({ message: error.message || t('tierPricing.list.orderError') });
                    queryClient.invalidateQueries({ queryKey: ['admin-tier-pricing-list'] });
                });

                return updatedItems;
            });
        }
    };

    if (isLoading) {
        return (
            <div className="space-y-4 p-8">
                <div className="flex justify-between items-center">
                    <PageTitle title={t('tierPricing.list.pageTitle')} />
                </div>
                <TierPricingListSkeleton />
            </div>
        );
    }

    return (
        <div className="space-y-4 px-4 py-6">
            <div className="flex justify-between items-center">
                <PageTitle title={t('tierPricing.list.pageTitle')} />
                {items.length > 0 && <Button asChild>
                    <Link to={AppRoute.tierPricing.adminCreate.url} className="gap-2">
                        <Plus className="h-4 w-4" />
                        {t('tierPricing.list.createButton')}
                    </Link>
                </Button>}
            </div>
            {items.length === 0 ? (
                <TierPricingEmptyState />
            ) : (
                <TierPricingList
                    items={items}
                    sensors={sensors}
                    onDragEnd={handleDragEnd}
                    onDelete={handleDelete}
                />
            )}
        </div>
    );
}
