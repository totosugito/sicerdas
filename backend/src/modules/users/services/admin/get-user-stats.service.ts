import { db } from "../../../../db/db-pool.ts";
import { usersStats } from "../../../../db/schema/users/index.ts";
import { EnumStatsPeriodType } from "../../../../db/schema/enum/enum-general.ts";
import { desc, eq } from "drizzle-orm";
import type { GetUserStatsQuery, UserStatsData, UserStatsItem } from "../../user.schema.ts";

export async function getUserStatsService(params: GetUserStatsQuery): Promise<UserStatsData> {
  const { periodType = EnumStatsPeriodType.DAILY, limit = 12 } = params;

  // 1. Fetch latest snapshot for headline KPI metrics
  const latestSnapshotRows = await db
    .select()
    .from(usersStats)
    .orderBy(desc(usersStats.createdAt))
    .limit(1);

  const latest = latestSnapshotRows[0];

  const kpi = {
    totalUsers: latest ? latest.totalUsersCount : 0,
    activeUsers: latest ? latest.activeUsersCount : 0,
    bannedUsers: latest ? latest.bannedUsersCount : 0,
    roleBreakdown: latest ? latest.roleBreakdown : { admin: 0, teacher: 0, user: 0, guest: 0 },
    tierBreakdown: latest ? latest.tierBreakdown : {},
  };

  // 2. Fetch history records for the specified periodType ordered by periodKey ASC for charts
  const historyRows = await db
    .select()
    .from(usersStats)
    .where(eq(usersStats.periodType, periodType as any))
    .orderBy(desc(usersStats.periodKey))
    .limit(limit);

  // Reverse to get ASC order for line/bar charts
  const history: UserStatsItem[] = historyRows.reverse().map((row) => ({
    id: row.id,
    periodType: row.periodType,
    periodKey: row.periodKey,
    date: row.date,
    newUsersCount: row.newUsersCount,
    totalUsersCount: row.totalUsersCount,
    activeUsersCount: row.activeUsersCount,
    bannedUsersCount: row.bannedUsersCount,
    roleBreakdown: row.roleBreakdown,
    tierBreakdown: row.tierBreakdown,
    educationBreakdown: row.educationBreakdown,
    createdAt: row.createdAt ? row.createdAt.toISOString() : new Date().toISOString(),
  }));

  return {
    kpi,
    history,
  };
}
