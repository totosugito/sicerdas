import { TierPricingForm } from '@/components/pages/tier-pricing/list-tier-pricing/TierPricingForm';
import { createFileRoute } from '@tanstack/react-router';
import { Button } from '@/components/ui/button';
import { Link } from '@tanstack/react-router';
import { ChevronLeft } from 'lucide-react';
import PageTitle from '@/components/app/PageTitle';

export const Route = createFileRoute('/(pages)/(tier-pricing)/admin/create-tier')({
    component: CreateTierPricingPage,
});

function CreateTierPricingPage() {
    return (
        <div className="space-y-6 p-8">
            <div className="flex items-center gap-4">
                <Button variant="ghost" size="icon" asChild>
                    <Link to="/admin/tier-pricing">
                        <ChevronLeft className="h-4 w-4" />
                    </Link>
                </Button>
                <PageTitle title="Create Tier Pricing" />
            </div>

            <TierPricingForm />
        </div>
    );
}
