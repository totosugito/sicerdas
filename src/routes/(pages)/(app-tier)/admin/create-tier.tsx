import { createFileRoute, useNavigate } from '@tanstack/react-router';
import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { PageTitle } from '@/components/app';
import { CreateTierForm } from '@/components/pages/app-tier/create-tier';
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
                showNotifSuccess({ message: response.message || t('appTier.create.messages.success') });
                navigate({ to: AppRoute.appTier.adminList.url });
            },
            onError: (error: any) => {
                setError(error.message || t('appTier.create.messages.error'));
            }
        });
    };

    const handleCancel = () => {
        navigate({ to: AppRoute.appTier.adminList.url });
    };

    return (
        <div className="flex flex-col w-full space-y-6">
            <PageTitle
                title={t('appTier.create.pageTitle')}
                description={<span>{t('appTier.create.description')}</span>}
                showBack
                backTo={AppRoute.appTier.adminList.url}
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
