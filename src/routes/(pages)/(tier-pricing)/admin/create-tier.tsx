import { createFileRoute, useNavigate } from '@tanstack/react-router';
import { useTranslation } from 'react-i18next';
import { PageTitle } from '@/components/app';
import { CreateTierForm } from '@/components/pages/tier-pricing/create-tier';
import { useCreateTierPricing, CreateTierPricingRequest } from '@/api/tier-pricing/admin/create-tier-pricing';
import { showNotifSuccess, showNotifError } from "@/lib/show-notif";
import { useQueryClient } from '@tanstack/react-query';
import { AppRoute } from '@/constants/app-route';

export const Route = createFileRoute('/(pages)/(tier-pricing)/admin/create-tier')({
    component: CreateTierPage,
});

function CreateTierPage() {
    const { t } = useTranslation();
    const navigate = useNavigate();
    const queryClient = useQueryClient();
    const createMutation = useCreateTierPricing();

    const handleSubmit = (data: CreateTierPricingRequest) => {
        createMutation.mutate(data, {
            onSuccess: (response) => {
                showNotifSuccess({ message: response.message || t('tierPricing.createTier.messages.success') });
                queryClient.invalidateQueries({ queryKey: ['admin-tier-pricing-list'] });
                navigate({ to: AppRoute.tierPricing.adminList.url });
            },
            onError: (error: any) => {
                showNotifError({
                    message: error.message || t('tierPricing.createTier.messages.error')
                });
            }
        });
    };

    const handleCancel = () => {
        navigate({ to: AppRoute.tierPricing.adminList.url });
    };

    return (
        <div className="flex flex-col w-full space-y-6 pt-6">
            <PageTitle
                title={t('tierPricing.createTier.pageTitle')}
                description={<span>{t('tierPricing.createTier.description')}</span>}
            />

            <div className="max-w-4xl">
                <CreateTierForm
                    onSubmit={handleSubmit}
                    onCancel={handleCancel}
                    isLoading={createMutation.isPending}
                />
            </div>
        </div>
    );
}
