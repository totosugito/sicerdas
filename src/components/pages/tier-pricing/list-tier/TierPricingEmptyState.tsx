import { Button } from '@/components/ui/button';
import { Inbox, Plus } from 'lucide-react';
import { Link } from '@tanstack/react-router';
import { AppRoute } from '@/constants/app-route';
import { useTranslation } from 'react-i18next';

export const TierPricingEmptyState = () => {
    const { t } = useTranslation();

    return (
        <div className="flex flex-col items-center justify-center py-16 px-4 text-center border rounded-xl border-dashed bg-muted/5 animate-in fade-in-50">
            <div className="bg-background p-4 rounded-full shadow-sm mb-4 ring-1 ring-border">
                <Inbox className="h-8 w-8 text-muted-foreground/50" />
            </div>
            <h3 className="text-lg font-semibold mb-2 tracking-tight">
                {t('tierPricing.list.noDataTitle')}
            </h3>
            <p className="text-muted-foreground max-w-sm mx-auto mb-6 text-sm">
                {t('tierPricing.list.noDataDescription')}
            </p>
            <Button asChild>
                <Link to={AppRoute.tierPricing.adminCreate.url} className="gap-2">
                    <Plus className="h-4 w-4" />
                    {t('tierPricing.list.createButton')}
                </Link>
            </Button>
        </div>
    );
};
