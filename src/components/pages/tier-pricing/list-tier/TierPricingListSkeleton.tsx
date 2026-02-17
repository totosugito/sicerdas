import { Skeleton } from '@/components/ui/skeleton';

export function TierPricingListSkeleton() {
    return (
        <div className="w-full space-y-2">
            {[...Array(3)].map((_, i) => (
                <div
                    key={i}
                    className="rounded-xl border bg-card px-4 py-8 mb-4"
                >
                    <div className="flex items-center gap-3">
                        {/* Drag Handle */}
                        <Skeleton className="h-5 w-5" />

                        {/* Sort Order */}
                        <Skeleton className="h-7 w-7 rounded-lg" />

                        {/* Name & Price */}
                        <div className="flex-1 space-y-2">
                            <Skeleton className="h-5 w-40" />
                            <Skeleton className="h-4 w-28" />
                        </div>

                        {/* Status Badge */}
                        <Skeleton className="h-6 w-16 rounded-md" />

                        {/* Action Buttons */}
                        <Skeleton className="h-9 w-9 rounded-md" />
                        <Skeleton className="h-9 w-9 rounded-md" />
                    </div>
                </div>
            ))}
        </div>
    );
}
