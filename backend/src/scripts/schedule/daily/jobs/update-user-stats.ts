import { db } from "../../../../db/db-pool.ts";
import { users, usersProfile, sessions, usersStats } from "../../../../db/schema/user/index.ts";
import { EnumStatsPeriodType } from "../../../../db/schema/enum/enum-general.ts";
import { and, count, eq, gte, lt, sql, sum } from "drizzle-orm";
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
 * Updates daily, weekly, and monthly aggregated user statistics in users_stats table.
 */
export const updateUserStats = async (refDate: Date = new Date()) => {
  console.log("[Job] Starting user statistics aggregation job...");

  const targetDate = new Date(refDate);
  targetDate.setHours(0, 0, 0, 0);

  // Time boundaries
  const startOfDay = new Date(targetDate);
  const endOfDay = new Date(targetDate);
  endOfDay.setDate(endOfDay.getDate() + 1);

  const dailyKey = formatDateKey(targetDate);
  const { weekKey, startOfWeek, endOfWeek } = getIsoWeekInfo(targetDate);
  const { monthKey, startOfMonth, endOfMonth } = getMonthInfo(targetDate);

  try {
    // ----------------------------------------------------
    // 1. SHARED SNAPSHOT METRICS (Current state at targetDate)
    // ----------------------------------------------------
    const [totalUsersRes] = await db.select({ value: count(users.id) }).from(users);
    const totalUsersCount = Number(totalUsersRes?.value ?? 0);

    const [bannedUsersRes] = await db
      .select({ value: count(users.id) })
      .from(users)
      .where(eq(users.banned, true));
    const bannedUsersCount = Number(bannedUsersRes?.value ?? 0);

    // Role Breakdown
    const roleRows = await db
      .select({ role: users.role, total: count(users.id) })
      .from(users)
      .groupBy(users.role);

    const roleBreakdown: { admin: number; teacher: number; user: number; guest: number } = {
      admin: 0,
      teacher: 0,
      user: 0,
      guest: 0,
    };
    for (const r of roleRows) {
      if (r.role in roleBreakdown) {
        roleBreakdown[r.role as keyof typeof roleBreakdown] = Number(r.total);
      }
    }

    // Tier Breakdown
    const tierRows = await db
      .select({ tierId: usersProfile.tierId, total: count(usersProfile.id) })
      .from(usersProfile)
      .groupBy(usersProfile.tierId);

    const tierBreakdown: Record<string, number> = {};
    for (const t of tierRows) {
      if (t.tierId) {
        tierBreakdown[t.tierId] = Number(t.total);
      }
    }

    // Education Level Breakdown
    const eduRows = await db
      .select({ educationLevel: usersProfile.educationLevel, total: count(usersProfile.id) })
      .from(usersProfile)
      .groupBy(usersProfile.educationLevel);

    const educationBreakdown: Record<string, number> = {};
    for (const e of eduRows) {
      if (e.educationLevel) {
        educationBreakdown[e.educationLevel] = Number(e.total);
      }
    }

    const baseSnapshot = {
      totalUsersCount,
      bannedUsersCount,
      roleBreakdown,
      tierBreakdown,
      educationBreakdown,
    };

    // Helper function to upsert a record into users_stats
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
        });
    };

    // Helper function to calculate DISTINCT active users from sessions
    const getActiveUsersInRange = async (start: Date, end: Date) => {
      const [res] = await db
        .select({ value: count(sql`DISTINCT ${sessions.userId}`) })
        .from(sessions)
        .where(and(gte(sessions.createdAt, start), lt(sessions.createdAt, end)));
      return Number(res?.value ?? 0);
    };

    // Helper function to calculate SUM of daily new users from users_stats
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

    // ----------------------------------------------------
    // 2. DAILY RECORD (Direct Calculation)
    // ----------------------------------------------------
    const [dailyNewRes] = await db
      .select({ value: count(users.id) })
      .from(users)
      .where(and(gte(users.createdAt, startOfDay), lt(users.createdAt, endOfDay)));
    const dailyNewUsers = Number(dailyNewRes?.value ?? 0);
    const dailyActiveUsers = await getActiveUsersInRange(startOfDay, endOfDay);

    await upsertStatsRecord(EnumStatsPeriodType.DAILY, dailyKey, dailyNewUsers, dailyActiveUsers);

    // ----------------------------------------------------
    // 3. WEEKLY RECORD (Hybrid Rollup)
    // ----------------------------------------------------
    const startDateStr = formatDateKey(startOfWeek);
    const endDateStr = formatDateKey(endOfWeek);

    const weeklySumNewUsers = await getSumDailyNewUsersInRange(startDateStr, endDateStr);
    const weeklyNewUsers = weeklySumNewUsers > 0 ? weeklySumNewUsers : dailyNewUsers;
    const weeklyActiveUsers = await getActiveUsersInRange(startOfWeek, endOfWeek);

    await upsertStatsRecord(EnumStatsPeriodType.WEEKLY, weekKey, weeklyNewUsers, weeklyActiveUsers);

    // ----------------------------------------------------
    // 4. MONTHLY RECORD (Hybrid Rollup)
    // ----------------------------------------------------
    const startMonthStr = formatDateKey(startOfMonth);
    const endMonthStr = formatDateKey(endOfMonth);

    const monthlySumNewUsers = await getSumDailyNewUsersInRange(startMonthStr, endMonthStr);
    const monthlyNewUsers = monthlySumNewUsers > 0 ? monthlySumNewUsers : dailyNewUsers;
    const monthlyActiveUsers = await getActiveUsersInRange(startOfMonth, endOfMonth);

    await upsertStatsRecord(EnumStatsPeriodType.MONTHLY, monthKey, monthlyNewUsers, monthlyActiveUsers);

    console.log(
      `[Job] Hybrid rollup completed successfully!\n` +
      `  - Daily (${dailyKey}): +${dailyNewUsers} new users, ${dailyActiveUsers} DAU\n` +
      `  - Weekly (${weekKey}): +${weeklyNewUsers} new users (summed from daily stats), ${weeklyActiveUsers} WAU (distinct sessions)\n` +
      `  - Monthly (${monthKey}): +${monthlyNewUsers} new users (summed from daily stats), ${monthlyActiveUsers} MAU (distinct sessions)`
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
