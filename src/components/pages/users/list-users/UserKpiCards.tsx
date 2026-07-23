import { Card, CardContent } from "@/components/ui/card";
import { Users, UserCheck, Shield, Crown } from "lucide-react";
import type { UserStatsData } from "@/api/users";
import { Skeleton } from "@/components/ui/skeleton";
import { Badge } from "@/components/ui/badge";
import { useAppTranslation } from "@/lib/i18n-typed";

interface UserKpiCardsProps {
  kpi?: UserStatsData["kpi"];
  isLoading?: boolean;
}

export function UserKpiCards({ kpi, isLoading }: UserKpiCardsProps) {
  const { t } = useAppTranslation();

  if (isLoading) {
    return (
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {[1, 2, 3, 4].map((i) => (
          <Card key={i} className="shadow-xs">
            <CardContent className="p-4 flex items-center justify-between">
              <div className="space-y-2">
                <Skeleton className="h-4 w-24" />
                <Skeleton className="h-7 w-16" />
              </div>
              <Skeleton className="h-10 w-10 rounded-full" />
            </CardContent>
          </Card>
        ))}
      </div>
    );
  }

  const totalUsers = kpi?.totalUsers ?? 0;
  const activeUsers = kpi?.activeUsers ?? 0;
  const bannedUsers = kpi?.bannedUsers ?? 0;

  const roleUserCount = kpi?.roleBreakdown?.user ?? 0;
  const roleAdminCount = kpi?.roleBreakdown?.admin ?? 0;
  const roleTeacherCount = kpi?.roleBreakdown?.teacher ?? 0;

  // Format Tier Breakdown entries (e.g., { pro: 2, enterprise: 1, free: 200 })
  const tierBreakdown = kpi?.tierBreakdown || {};
  const tierEntries = Object.entries(tierBreakdown);
  const paidTierCount = tierEntries
    .filter(([tier]) => tier.toLowerCase() !== "free")
    .reduce((acc, [_, count]) => acc + (typeof count === "number" ? count : 0), 0);

  const cards = [
    {
      title: t(($) => $.user.management.dashboard.kpi.totalUsers),
      value: totalUsers.toLocaleString(),
      subtitle: (
        <div className="flex items-center gap-1.5 flex-wrap mt-0.5">
          <span className="text-[11px] text-muted-foreground">
            {roleUserCount.toLocaleString()} {t(($) => $.user.management.dashboard.kpi.usersLabel)}
            {roleTeacherCount > 0 ? `, ${roleTeacherCount} ${t(($) => $.user.management.dashboard.kpi.teachersLabel)}` : ""}
          </span>
          {bannedUsers > 0 && (
            <Badge variant="destructive" className="text-[10px] px-1.5 py-0">
              {t(($) => $.user.management.dashboard.kpi.bannedBadge, { count: bannedUsers })}
            </Badge>
          )}
        </div>
      ),
      icon: Users,
      iconColor: "text-blue-600 dark:text-blue-400",
      bgLight: "bg-blue-50 dark:bg-blue-950/40",
      borderColor: "border-blue-100 dark:border-blue-900/50",
    },
    {
      title: t(($) => $.user.management.dashboard.kpi.activeUsers),
      value: activeUsers.toLocaleString(),
      subtitle: t(($) => $.user.management.dashboard.kpi.activeSessions),
      icon: UserCheck,
      iconColor: "text-emerald-600 dark:text-emerald-400",
      bgLight: "bg-emerald-50 dark:bg-emerald-950/40",
      borderColor: "border-emerald-100 dark:border-emerald-900/50",
    },
    {
      title: t(($) => $.user.management.dashboard.kpi.subscriptionTiers),
      value: t(($) => $.user.management.dashboard.kpi.paidCount, { count: paidTierCount }),
      subtitle: (
        <div className="flex items-center gap-1 flex-wrap mt-1">
          {tierEntries.length === 0 ? (
            <span>{t(($) => $.user.management.dashboard.kpi.noTierData)}</span>
          ) : (
            tierEntries.slice(0, 3).map(([tier, count]) => (
              <Badge key={tier} variant="outline" className="text-[10px] px-1.5 py-0 capitalize">
                {tier}: {String(count)}
              </Badge>
            ))
          )}
        </div>
      ),
      icon: Crown,
      iconColor: "text-amber-600 dark:text-amber-400",
      bgLight: "bg-amber-50 dark:bg-amber-950/40",
      borderColor: "border-amber-100 dark:border-amber-900/50",
    },
    {
      title: t(($) => $.user.management.dashboard.kpi.adminsAndModeration),
      value: roleAdminCount.toLocaleString(),
      subtitle: t(($) => $.user.management.dashboard.kpi.systemAdmins),
      icon: Shield,
      iconColor: "text-indigo-600 dark:text-indigo-400",
      bgLight: "bg-indigo-50 dark:bg-indigo-950/40",
      borderColor: "border-indigo-100 dark:border-indigo-900/50",
    },
  ];

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
      {cards.map((card, idx) => {
        const Icon = card.icon;
        return (
          <Card
            key={idx}
            className={`transition-all duration-200 hover:shadow-md border ${card.borderColor}`}
          >
            <CardContent className="p-4 flex items-center justify-between">
              <div className="space-y-1">
                <p className="text-xs font-medium text-muted-foreground">{card.title}</p>
                <div className="text-2xl font-bold tracking-tight">{card.value}</div>
                {typeof card.subtitle === "string" ? (
                  <p className="text-[11px] text-muted-foreground">{card.subtitle}</p>
                ) : (
                  card.subtitle
                )}
              </div>
              <div className={`p-2.5 rounded-xl ${card.bgLight} ${card.iconColor}`}>
                <Icon className="h-5 w-5" />
              </div>
            </CardContent>
          </Card>
        );
      })}
    </div>
  );
}
