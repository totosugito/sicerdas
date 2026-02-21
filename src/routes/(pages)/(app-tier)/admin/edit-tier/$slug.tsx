import { useDetailsTier } from '@/api/app-tier';
import PageTitle from '@/components/app/PageTitle';
import { Button } from '@/components/ui/button';
import { createFileRoute, Link } from '@tanstack/react-router';
import { ChevronLeft } from 'lucide-react';

export const Route = createFileRoute('/(pages)/(app-tier)/admin/edit-tier/$slug')({
    component: EditTierPricingPage,
});

function EditTierPricingPage() {
    const { slug } = Route.useParams();
    const { data, isLoading, isError } = useDetailsTier(slug);

    if (isLoading) {
        return <div className="p-8">Loading...</div>;
    }

    if (isError || !data?.data) {
        return <div className="p-8 text-red-500">Failed to load tier details.</div>;
    }

    return (
        <div className="flex flex-col w-full space-y-4 py-6">
            <div className="flex items-center gap-4">
                <Button variant="ghost" size="icon" asChild>
                    <Link to="/admin/tier-pricing">
                        <ChevronLeft className="h-4 w-4" />
                    </Link>
                </Button>
                <PageTitle title={`Edit Tier Pricing: ${data.data.name}`} />
            </div>
        </div>
    );
}
