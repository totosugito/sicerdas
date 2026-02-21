import { GripVertical, Edit2, Trash2, Zap, MessageSquare, Check, Star } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { useSortable } from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";
import { AppTier } from "@/api/app-tier";
import { Link } from "@tanstack/react-router";
import { useTranslation } from "react-i18next";

interface TierRowProps {
    tier: AppTier;
    onDelete: (slug: string, name: string) => void;
}

export const TierRow = ({ tier, onDelete }: TierRowProps) => {
    const { t } = useTranslation();
    const price = parseFloat(tier.price);
    const isUnlimited = tier.limits.chatAi.daily_messages === -1;

    const {
        attributes,
        listeners,
        setNodeRef,
        transform,
        transition,
        isDragging,
    } = useSortable({ id: tier.slug });

    const style = {
        transform: CSS.Transform.toString(transform),
        transition,
    };

    const maxVisibleFeatures = 4;
    const visibleFeatures = tier.features?.slice(0, maxVisibleFeatures) || [];
    const remainingFeatures = tier.features?.slice(maxVisibleFeatures) || [];
    const hasMoreFeatures = remainingFeatures.length > 0;

    return (
        <div
            ref={setNodeRef}
            style={style}
            className={`group relative rounded-xl border bg-card p-4 transition-all mb-4 ${tier.isPopular
                ? isDragging
                    ? "shadow-lg opacity-90 z-10 border-amber-500 dark:border-amber-400 ring-2 ring-amber-500/20 dark:ring-amber-400/30"
                    : "border-amber-500/50 dark:border-amber-400/60 hover:border-amber-500 dark:hover:border-amber-400 shadow-md shadow-amber-500/10 dark:shadow-amber-400/20 hover:shadow-lg hover:shadow-amber-500/20 dark:hover:shadow-amber-400/30"
                : isDragging
                    ? "shadow-lg opacity-90 z-10 border-primary"
                    : "hover:border-primary/30 hover:shadow-sm"
                }`}
        >
            {/* Popular Badge */}
            {tier.isPopular && (
                <div className="absolute -top-2 -right-2 z-10">
                    <Badge className="bg-gradient-to-r from-amber-500 to-yellow-500 dark:from-amber-400 dark:to-yellow-400 text-white dark:text-gray-900 border-0 shadow-md dark:shadow-lg dark:shadow-amber-400/30 px-2 py-0.5 text-xs font-semibold flex items-center gap-1">
                        <Star className="w-3 h-3 fill-current" />
                        {t('tierPricing.list.popular')}
                    </Badge>
                </div>
            )}
            {/* Top row: drag handle, name, price, status, actions */}
            <div className="flex items-center gap-3">
                <button
                    {...attributes}
                    {...listeners}
                    className="flex-shrink-0 cursor-grab active:cursor-grabbing text-muted-foreground hover:text-foreground touch-none p-1 rounded hover:bg-secondary"
                >
                    <GripVertical className="w-5 h-5" />
                </button>

                <div className="flex-shrink-0 w-7 h-7 rounded-lg bg-secondary flex items-center justify-center">
                    <span className="text-xs font-bold text-muted-foreground">#{tier.sortOrder}</span>
                </div>

                <div className="flex-1 min-w-0">
                    <div className="flex items-baseline gap-2 flex-wrap">
                        <h3 className="font-semibold text-foreground leading-tight">{tier.name}</h3>
                        <span className="text-xs text-muted-foreground">{tier.slug}</span>
                    </div>
                    <div className="flex items-baseline gap-1 mt-0.5">
                        <span className="text-sm font-bold text-foreground">
                            {tier.currency} {price === 0 ? "0" : price.toFixed(2)}
                        </span>
                        <span className="text-xs text-muted-foreground">/ {tier.billingCycle}</span>
                    </div>
                </div>

                <Badge
                    variant={tier.isActive ? "default" : "secondary"}
                    className={
                        tier.isActive
                            ? "flex-shrink-0 bg-primary/15 text-primary border-0 hover:bg-primary/20 text-xs"
                            : "flex-shrink-0 text-xs"
                    }
                >
                    {tier.isActive ? t('tierPricing.list.active') : t('tierPricing.list.inactive')}
                </Badge>

                <div className="flex-shrink-0 flex items-center gap-2">
                    <Button variant="ghost" size="icon" asChild>
                        <Link to="/admin/tier-pricing/$slug" params={{ slug: tier.slug }}>
                            <Edit2 className="w-4 h-4" />
                        </Link>
                    </Button>
                    <Button
                        variant="ghost"
                        size="icon"
                        className="hover:text-destructive hover:bg-destructive/10"
                        onClick={() => onDelete(tier.slug, tier.name)}
                    >
                        <Trash2 className="w-4 h-4" />
                    </Button>
                </div>
            </div>

            {/* Features */}
            {tier.features && tier.features.length > 0 && (
                <div className="mt-3 ml-[52px] flex flex-wrap gap-1.5">
                    {visibleFeatures.map((f) => (
                        <span
                            key={f}
                            className="inline-flex items-center gap-1 text-xs bg-accent text-accent-foreground rounded-full px-2.5 py-0.5"
                        >
                            <Check className="w-3 h-3" strokeWidth={3} />
                            {f}
                        </span>
                    ))}
                    {hasMoreFeatures && (
                        <Popover>
                            <PopoverTrigger asChild>
                                <button className="inline-flex items-center gap-1 text-xs bg-muted text-muted-foreground hover:bg-muted/80 rounded-full px-2.5 py-0.5 transition-colors">
                                    +{remainingFeatures.length} {t('tierPricing.list.moreFeatures')}
                                </button>
                            </PopoverTrigger>
                            <PopoverContent className="w-80" align="start">
                                <div className="space-y-2">
                                    <h4 className="font-semibold text-sm">{t('tierPricing.list.allFeatures')}</h4>
                                    <div className="flex flex-wrap gap-1.5">
                                        {tier.features.map((f) => (
                                            <span
                                                key={f}
                                                className="inline-flex items-center gap-1 text-xs bg-accent text-accent-foreground rounded-full px-2.5 py-0.5"
                                            >
                                                <Check className="w-3 h-3" strokeWidth={3} />
                                                {f}
                                            </span>
                                        ))}
                                    </div>
                                </div>
                            </PopoverContent>
                        </Popover>
                    )}
                </div>
            )}

            {/* Limits */}
            <div className="mt-2 ml-[52px] flex items-center gap-4 text-xs text-muted-foreground">
                <span className="flex items-center gap-1">
                    <Zap className="w-3.5 h-3.5" />
                    {tier.limits.chatAi.max_tokens ? tier.limits.chatAi.max_tokens.toLocaleString() : 'N/A'} {t('tierPricing.list.tokens')}
                </span>
                <span className="flex items-center gap-1">
                    <MessageSquare className="w-3.5 h-3.5" />
                    {isUnlimited ? t('tierPricing.list.unlimited') : `${tier.limits.chatAi.daily_messages ?? 'N/A'}${t('tierPricing.list.perDay')}`}
                </span>
            </div>
        </div>
    );
};
