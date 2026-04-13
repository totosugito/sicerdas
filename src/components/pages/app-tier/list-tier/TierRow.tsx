import { GripVertical, Edit2, Trash2, Zap, MessageSquare, Check, Star } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { useSortable } from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";
import { AppTier } from "@/api/app-tier";
import { Link } from "@tanstack/react-router";
import { useAppTranslation } from "@/lib/i18n-typed";
import { AppRoute } from "@/constants/app-route";
import { to_decimal_formatted } from "@/lib/my-utils";

interface TierRowProps {
  tier: AppTier;
  onDelete: (slug: string, name: string) => void;
}

export const TierRow = ({ tier, onDelete }: TierRowProps) => {
  const { t } = useAppTranslation();
  const price = parseFloat(tier.price);
  const isUnlimited = tier.limits.chatAi.daily_messages === -1;

  const { attributes, listeners, setNodeRef, transform, transition, isDragging } = useSortable({
    id: tier.slug,
  });

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
      className={`group relative rounded-xl border bg-card p-4 transition-all mb-4 ${
        tier.isPopular
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
            {t(($) => $.appTier.list.popular)}
          </Badge>
        </div>
      )}

      <div className="flex items-start gap-4">
        {/* Left Column: Sequence Controls */}
        <div className="flex flex-col items-center gap-2">
          <button
            {...attributes}
            {...listeners}
            className="flex-shrink-0 cursor-grab active:cursor-grabbing text-muted-foreground hover:text-foreground touch-none p-1 rounded hover:bg-secondary"
          >
            <GripVertical className="w-5 h-5" />
          </button>
          <div className="flex items-center justify-center w-7 h-7 rounded-lg bg-secondary/50 border border-border/50 text-[11px] font-black text-muted-foreground/80 shrink-0 group-hover:border-primary/30 group-hover:text-primary transition-colors shadow-sm">
            {tier.sortOrder}
          </div>
        </div>

        {/* Main Content Column */}
        <div className="flex-1 min-w-0 pt-0.5 space-y-3">
          <div>
            <div className="flex items-baseline gap-2 flex-wrap">
              <h3 className="font-bold text-base tracking-tight truncate">
                <Link
                  to={AppRoute.appTier.adminEdit.url}
                  params={{ slug: tier.slug }}
                  className="text-foreground hover:text-primary transition-colors"
                >
                  {tier.name}
                </Link>
              </h3>
              <span className="text-xs text-muted-foreground font-medium bg-muted px-1.5 py-0.5 rounded uppercase tracking-wider">
                {tier.slug}
              </span>
            </div>
            <div className="flex items-baseline gap-1 mt-0.5">
              <span className="text-sm font-bold text-foreground">
                {tier.currency} {price === 0 ? "0" : price.toFixed(2)}
              </span>
              <span className="text-xs text-muted-foreground">/ {tier.billingCycle}</span>
            </div>
          </div>

          {/* Features List */}
          {tier.features && tier.features.length > 0 && (
            <div className="flex flex-wrap gap-1.5">
              {visibleFeatures.map((f) => (
                <span
                  key={f}
                  className="inline-flex items-center gap-1 text-xs bg-accent text-accent-foreground rounded-full px-2.5 py-0.5 whitespace-nowrap"
                >
                  <Check className="w-3 h-3" strokeWidth={3} />
                  {f}
                </span>
              ))}
              {hasMoreFeatures && (
                <Popover>
                  <PopoverTrigger asChild>
                    <button className="inline-flex items-center gap-1 text-xs bg-muted text-muted-foreground hover:bg-muted/80 rounded-full px-2.5 py-0.5 transition-colors">
                      +{remainingFeatures.length} {t(($) => $.appTier.list.moreFeatures)}
                    </button>
                  </PopoverTrigger>
                  <PopoverContent className="w-80" align="start">
                    <div className="space-y-2">
                      <h4 className="font-semibold text-sm">
                        {t(($) => $.appTier.list.allFeatures)}
                      </h4>
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

          {/* Limits Stats */}
          <div className="flex items-center gap-4 text-xs text-muted-foreground">
            <span className="flex items-center gap-1">
              <Zap className="w-3.5 h-3.5" />
              {tier.limits.chatAi.max_tokens
                ? to_decimal_formatted(tier.limits.chatAi.max_tokens, 0)
                : "N/A"}{" "}
              {t(($) => $.appTier.list.tokens)}
            </span>
            <span className="flex items-center gap-1">
              <MessageSquare className="w-3.5 h-3.5" />
              {isUnlimited
                ? t(($) => $.appTier.list.unlimited)
                : `${tier.limits.chatAi.daily_messages ?? "N/A"}${t(($) => $.appTier.list.perDay)}`}
            </span>
          </div>
        </div>

        {/* Right Column: Status and Actions */}
        <div className="flex flex-col items-end gap-3 shrink-0">
          <Badge
            variant={tier.isActive ? "default" : "secondary"}
            className={
              tier.isActive
                ? "bg-primary/10 text-primary border-0 hover:bg-primary/20 text-xs px-2"
                : "text-xs px-2"
            }
          >
            {tier.isActive ? t(($) => $.appTier.list.active) : t(($) => $.appTier.list.inactive)}
          </Badge>

          <div className="flex items-center gap-1">
            <Button
              variant="ghost"
              size="sm"
              className="h-8 w-8 p-0"
              asChild
              title={t(($) => $.labels.edit)}
            >
              <Link to={AppRoute.appTier.adminEdit.url} params={{ slug: tier.slug }}>
                <Edit2 className="w-4 h-4" />
              </Link>
            </Button>
            <Button
              variant="ghost"
              size="sm"
              className="h-8 w-8 p-0 hover:text-destructive hover:bg-destructive/10"
              onClick={() => onDelete(tier.slug, tier.name)}
              title={t(($) => $.labels.delete)}
            >
              <Trash2 className="w-4 h-4" />
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
};
