import { Card } from '@/components/ui/card';
import { Skeleton } from '@/components/ui/skeleton';

export function TierPricingListSkeleton() {
    return (
        <div className="max-w-4xl mx-auto space-y-2">
            {[...Array(3)].map((_, i) => (
                <Card key={i} className="flex items-center justify-between p-4 bg-card">
                    <div className="flex items-center gap-4">
                        {/* Grip Icon Placeholder */}
                        <div className="p-2">
                            <Skeleton className="h-5 w-5" />
                        </div>
                        <div>
                            {/* Name Placeholder */}
                            <Skeleton className="h-6 w-48 mb-2" />
                            {/* Details Placeholder */}
                            <div className="flex gap-2 items-center">
                                <Skeleton className="h-4 w-24" />
                                <span className="text-muted-foreground">•</span>
                                <Skeleton className="h-4 w-32" />
                            </div>
                        </div>
                    </div>

                    <div className="flex items-center gap-4">
                        {/* Badge Placeholder */}
                        <Skeleton className="h-6 w-16" />
                        {/* Sort Order Placeholder */}
                        <Skeleton className="h-7 w-8" />
                        {/* Buttons Placeholder */}
                        <div className="flex gap-2">
                            <Skeleton className="h-9 w-9" />
                            <Skeleton className="h-9 w-9" />
                        </div>
                    </div>
                </Card>
            ))}
        </div>
    );
}
