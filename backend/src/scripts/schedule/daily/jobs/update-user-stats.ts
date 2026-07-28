import { db } from "../../../../db/db-pool.ts";
import { usersStats } from "../../../../db/schema/users/index.ts";
import { EnumStatsPeriodType } from "../../../../db/schema/enum/enum-general.ts";
import { and, eq, gte, lt, sum, sql } from "drizzle-orm";
import { fileURLToPath } from "url";

/**
 * Returns ISO week key (e.g. '2026-W29') and its start/end Date bounds (Monday to next Monday)
 */
const getIsoWeekInfo = (d: Date) => {
  const date = new Date(Date.UTC(d.getFullYear(), d.getMonth(), d.getDate()));
  const dayNum = date.getUTCDay() || 7;
  date.setUTCDate(date.getUTCDate() + 4 - dayNum);
  const yearStart = new Date(Date.UTC(date.getUTCFullYear(), 0, 1));
  const weekNo = Math.ceil(((date.getTime() - yearStart.getTime()) / 86400000 + 1) / 7);
  const weekKey = `${date.getUTCFullYear()}-W${String(weekNo).padStart(2, '0')}`;

  const monday = new Date(d);
  const day = monday.getDay();
  const diff = monday.getDate() - day + (day === 0 ? -6 : 1);
  monday.setDate(diff);
  monday.setHours(0, 0, 0, 0);

  const nextMonday = new Date(monday);
  nextMonday.setDate(nextMonday.getDate() + 7);

  return { weekKey, startOfWeek: monday, endOfWeek: nextMonday };
};

/**
 * Returns Month key (e.g. '2026-07') and its start/end Date bounds (1st of month to 1st of next month)
 */
const getMonthInfo = (d: Date) => {
  const year = d.getFullYear();
  const month = d.getMonth();
  const monthKey = `${year}-${String(month + 1).padStart(2, '0')}`;

  const startOfMonth = new Date(year, month, 1, 0, 0, 0, 0);
  const endOfMonth = new Date(year, month + 1, 1, 0, 0, 0, 0);

  return { monthKey, startOfMonth, endOfMonth };
};

/**
 * Formats date to 'YYYY-MM-DD'
 */
const formatDateKey = (d: Date): string => d.toISOString().split('T')[0];

/**
 * Highly optimized daily, weekly, and monthly user statistics aggregation job.
 * Consolidates snapshot metrics, active users (DAU/WAU/MAU), and upserts using minimum SQL queries.
 */
export const updateUserStats = async (refDate: Date = new Date()) => {
  console.log("[Job] Starting user statistics aggregation job...");

  const targetDate = new Date(refDate);
  targetDate.setHours(0, 0, 0, 0);

  const startOfDay = new Date(targetDate);
  const endOfDay = new Date(targetDate);
  endOfDay.setDate(endOfDay.getDate() + 1);

  const dailyKey = formatDateKey(targetDate);
  const { weekKey, startOfWeek, endOfWeek } = getIsoWeekInfo(targetDate);
  const { monthKey, startOfMonth, endOfMonth } = getMonthInfo(targetDate);

  try {
    // ----------------------------------------------------
    // 1. CONSOLIDATED SNAPSHOT & DAILY NEW USERS QUERY (Single pass)
    // ----------------------------------------------------
    const snapshotRes = await db.execute<{
      total_users: number;
      banned_users: number;
      role_admin: number;
      role_teacher: number;
      role_user: number;
      role_guest: number;
      daily_new_users: number;
    }>(sql`
      SELECT 
        COUNT(id)::int as total_users,
        COALESCE(SUM(CASE WHEN banned = true THEN 1 ELSE 0 END), 0)::int as banned_users,
        COALESCE(SUM(CASE WHEN role = 'admin' THEN 1 ELSE 0 END), 0)::int as role_admin,
        COALESCE(SUM(CASE WHEN role = 'teacher' THEN 1 ELSE 0 END), 0)::int as role_teacher,
        COALESCE(SUM(CASE WHEN role = 'user' THEN 1 ELSE 0 END), 0)::int as role_user,
        COALESCE(SUM(CASE WHEN role = 'guest' THEN 1 ELSE 0 END), 0)::int as role_guest,
        COALESCE(SUM(CASE WHEN created_at >= ${startOfDay} AND created_at < ${endOfDay} THEN 1 ELSE 0 END), 0)::int as daily_new_users
      FROM users;
    `);

    const snapshotRow = snapshotRes.rows[0];

    // Tier Breakdown (Consolidated query)
    const tierRows = await db.execute<{ tier_id: string; total: number }>(sql`
      SELECT tier_id, COUNT(id)::int as total
      FROM users_profiles
      WHERE tier_id IS NOT NULL
      GROUP BY tier_id;
    `);
    const tierBreakdown: Record<string, number> = {};
    for (const t of tierRows.rows) {
      if (t.tier_id) tierBreakdown[t.tier_id] = Number(t.total);
    }

    // Education Level Breakdown (Consolidated query)
    const eduRows = await db.execute<{ education_level: string; total: number }>(sql`
      SELECT education_level, COUNT(id)::int as total
      FROM users_profiles
      WHERE education_level IS NOT NULL
      GROUP BY education_level;
    `);
    const educationBreakdown: Record<string, number> = {};
    for (const e of eduRows.rows) {
      if (e.education_level) educationBreakdown[e.education_level] = Number(e.total);
    }

    const baseSnapshot = {
      totalUsersCount: Number(snapshotRow?.total_users ?? 0),
      bannedUsersCount: Number(snapshotRow?.banned_users ?? 0),
      roleBreakdown: {
        admin: Number(snapshotRow?.role_admin ?? 0),
        teacher: Number(snapshotRow?.role_teacher ?? 0),
        user: Number(snapshotRow?.role_user ?? 0),
        guest: Number(snapshotRow?.role_guest ?? 0),
      },
      tierBreakdown,
      educationBreakdown,
    };

    const dailyNewUsers = Number(snapshotRow?.daily_new_users ?? 0);

    // ----------------------------------------------------
    // 2. CONSOLIDATED ACTIVE USERS QUERY (DAU, WAU, MAU in 1 Query)
    // ----------------------------------------------------
    const activeUsersRes = await db.execute<{
      dau: number;
      wau: number;
      mau: number;
    }>(sql`
      SELECT 
        COUNT(DISTINCT CASE WHEN created_at >= ${startOfDay} AND created_at < ${endOfDay} THEN user_id END)::int as dau,
        COUNT(DISTINCT CASE WHEN created_at >= ${startOfWeek} AND created_at < ${endOfWeek} THEN user_id END)::int as wau,
        COUNT(DISTINCT CASE WHEN created_at >= ${startOfMonth} AND created_at < ${endOfMonth} THEN user_id END)::int as mau
      FROM users_sessions
      WHERE created_at >= ${startOfMonth} AND created_at < ${endOfMonth};
    `);

    const activeRow = activeUsersRes.rows[0];

    const dailyActiveUsers = Number(activeRow?.dau ?? 0);
    const weeklyActiveUsers = Number(activeRow?.wau ?? 0);
    const monthlyActiveUsers = Number(activeRow?.mau ?? 0);

    // ----------------------------------------------------
    // 3. SUM NEW USERS FOR WEEKLY & MONTHLY
    // ----------------------------------------------------
    const getSumDailyNewUsersInRange = async (startStr: string, endStr: string) => {
      const [res] = await db
        .select({ totalNew: sum(usersStats.newUsersCount) })
        .from(usersStats)
        .where(
          and(
            eq(usersStats.periodType, EnumStatsPeriodType.DAILY),
            gte(usersStats.date, startStr),
            lt(usersStats.date, endStr)
          )
        );
      return Number(res?.totalNew ?? 0);
    };

    const startDateStr = formatDateKey(startOfWeek);
    const endDateStr = formatDateKey(endOfWeek);
    const weeklySumNewUsers = await getSumDailyNewUsersInRange(startDateStr, endDateStr);
    const weeklyNewUsers = weeklySumNewUsers > 0 ? weeklySumNewUsers : dailyNewUsers;

    const startMonthStr = formatDateKey(startOfMonth);
    const endMonthStr = formatDateKey(endOfMonth);
    const monthlySumNewUsers = await getSumDailyNewUsersInRange(startMonthStr, endMonthStr);
    const monthlyNewUsers = monthlySumNewUsers > 0 ? monthlySumNewUsers : dailyNewUsers;

    // Helper to upsert with IS DISTINCT FROM guard
    const upsertStatsRecord = async (
      periodType: typeof EnumStatsPeriodType[keyof typeof EnumStatsPeriodType],
      periodKey: string,
      newUsersCount: number,
      activeUsersCount: number
    ) => {
      const payload = {
        date: dailyKey,
        newUsersCount,
        activeUsersCount,
        ...baseSnapshot,
      };

      await db
        .insert(usersStats)
        .values({
          periodType,
          periodKey,
          ...payload,
        })
        .onConflictDoUpdate({
          target: [usersStats.periodType, usersStats.periodKey],
          set: payload,
          where: sql`
            ${usersStats.newUsersCount} IS DISTINCT FROM ${payload.newUsersCount} OR
            ${usersStats.activeUsersCount} IS DISTINCT FROM ${payload.activeUsersCount} OR
            ${usersStats.totalUsersCount} IS DISTINCT FROM ${payload.totalUsersCount} OR
            ${usersStats.bannedUsersCount} IS DISTINCT FROM ${payload.bannedUsersCount}
          `,
        });
    };

    // Upsert DAILY, WEEKLY, MONTHLY
    await upsertStatsRecord(EnumStatsPeriodType.DAILY, dailyKey, dailyNewUsers, dailyActiveUsers);
    await upsertStatsRecord(EnumStatsPeriodType.WEEKLY, weekKey, weeklyNewUsers, weeklyActiveUsers);
    await upsertStatsRecord(EnumStatsPeriodType.MONTHLY, monthKey, monthlyNewUsers, monthlyActiveUsers);

    console.log(
      `[Job] Hybrid rollup completed successfully!\n` +
      `  - Daily (${dailyKey}): +${dailyNewUsers} new users, ${dailyActiveUsers} DAU\n` +
      `  - Weekly (${weekKey}): +${weeklyNewUsers} new users (summed from daily stats), ${weeklyActiveUsers} WAU\n` +
      `  - Monthly (${monthKey}): +${monthlyNewUsers} new users (summed from daily stats), ${monthlyActiveUsers} MAU`
    );
  } catch (error) {
    console.error("[Job] Error during update-user-stats job:", error);
  }
};

// Run if called directly
if (process.argv[1] === fileURLToPath(import.meta.url)) {
  updateUserStats().then(() => process.exit(0)).catch((err) => {
    console.error(err);
    process.exit(1);
  });
}
