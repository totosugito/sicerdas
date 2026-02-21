import { createFileRoute, useNavigate } from '@tanstack/react-router';
import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { PageTitle } from '@/components/app';
import { CreateTierForm } from '@/components/pages/tier-pricing/create-tier';
import { useCreateTier, CreateTierRequest } from '@/api/app-tier/admin/create-tier';
import { showNotifSuccess } from "@/lib/show-notif";
import { AppRoute } from '@/constants/app-route';

export const Route = createFileRoute('/(pages)/(app-tier)/admin/create-tier')({
    component: CreateTierPage,
});

function CreateTierPage() {
    const { t } = useTranslation();
    const navigate = useNavigate();
    const createMutation = useCreateTier();
    const [error, setError] = useState<string | null>(null);

    const handleSubmit = (data: CreateTierRequest) => {
        setError(null);
        createMutation.mutate(data, {
            onSuccess: (response) => {
                showNotifSuccess({ message: response.message || t('tierPricing.createTier.messages.success') });
                navigate({ to: AppRoute.tierPricing.adminList.url });
            },
            onError: (error: any) => {
                setError(error.message || t('tierPricing.createTier.messages.error'));
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
                showBack
                backTo={AppRoute.tierPricing.adminList.url}
            />

            <CreateTierForm
                onSubmit={handleSubmit}
                onCancel={handleCancel}
                isLoading={createMutation.isPending}
                error={error}
            />
        </div>
    );
}
