# Admin Dashboard - User Management Specification

This specification documents the requirements, schema mapping, UI components, performance optimizations, and daily analytics aggregation for the **Admin User Dashboard** in the Si Cerdas application.

---

## 1. Overview & Scope
The Admin User Dashboard provides administrators with complete visibility into registered users, active sessions, subscription tiers, and account moderation controls, designed specifically to scale seamlessly for dataset sizes exceeding **1,000,000+ users**.

---

## 2. Database Schema Mapping

### Core Tables
- `users`: Core account identity (`id`, `name`, `email`, `role`, `banned`, `banReason`, `banExpires`, `createdAt`, `updatedAt`).
- `users_profiles`: Academic and profile data (`school`, `educationLevel`, `grade`, `phone`, `address`, `bio`, `dateOfBirth`, `tierId`, `extra`).
- `users_sessions`: Active user sessions (`id`, `expiresAt`, `token`, `ipAddress`, `userAgent`, `userId`, `impersonatedBy`).

### Enums (`backend/src/db/schema/enum/enum-general.ts`)
```typescript
export const EnumStatsPeriodType = {
    DAILY: 'daily',
    WEEKLY: 'weekly',
    MONTHLY: 'monthly',
} as const;

export const PgEnumStatsPeriodType = pgEnum('stats_period_type', Object.values(EnumStatsPeriodType) as [string, ...string[]]);
```

### Multi-Granularity Aggregation Snapshot Table (`users_stats` in `backend/src/db/schema/user/stats.ts`)
To guarantee sub-millisecond chart query speeds without querying 1M+ rows or performing client/server-side `SUM()` aggregations, a pre-computed aggregation table stores pre-aggregated **Daily**, **Weekly**, and **Monthly** historical snapshots populated by a background cron job at `00:00`:

```typescript
export const usersStats = pgTable('users_stats', {
  id: uuid('id').primaryKey().defaultRandom(),
  
  // Period Identification & Granularity
  periodType: PgEnumStatsPeriodType('period_type').notNull(), // 'daily' | 'weekly' | 'monthly'
  periodKey: varchar('period_key', { length: 20 }).notNull(), // e.g. '2026-07-23' (daily), '2026-W29' (weekly), '2026-07' (monthly)
  date: date('date').notNull(), // End date of period snapshot
  
  // Aggregated Metrics for Specified Period
  newUsersCount: integer('new_users_count').notNull().default(0), // New registrations during this period
  totalUsersCount: integer('total_users_count').notNull().default(0), // Cumulative total users at end of period
  activeUsersCount: integer('active_users_count').notNull().default(0), // Active login users during this period
  bannedUsersCount: integer('banned_users_count').notNull().default(0), // Banned users count snapshot
  
  // Flexible Structured Breakdowns (JSONB)
  roleBreakdown: jsonb('role_breakdown').$type<{ admin: number; teacher: number; user: number; guest: number }>().notNull(),
  tierBreakdown: jsonb('tier_breakdown').$type<Record<string, number>>().notNull(), // e.g., { free: 800000, pro: 200000 }
  educationBreakdown: jsonb('education_breakdown').$type<Record<string, number>>().notNull(),
  
  createdAt: timestamp('created_at', { withTimezone: true }).defaultNow().notNull(),
});
```

*Note: All users are automatically verified in this system, so `emailVerified` is excluded from dashboard indicators.*

---

## 3. Key Dashboard Components & Data Specifications

### 3.1. Headline Metrics (KPI Cards)
Aggregated high-level metrics displayed at the top of the dashboard:
- **Total Users**: Count of all registered users (`users.id`).
- **Active Sessions (Online Users)**: Unique users with non-expired sessions (`users_sessions.expires_at > NOW()`).
- **Banned Accounts**: Total users currently banned (`users.banned = true`).
- **Role Distribution**: Count of users grouped by `users.role` (`ADMIN`, `TEACHER`, `USER`, `GUEST`).
- **Tier Distribution**: Count of users grouped by `users_profiles.tier_id` (e.g., `free`, `pro`).

### 3.2. User Management Table (Data Grid)
Main interactive table supporting pagination, sorting, and filtering:
- **Columns**:
  - User: Avatar (`users.image`), Full Name (`users.name`), Email (`users.email`).
  - Role Badge: Color-coded badge (`users.role`).
  - Tier Badge: Tier level (`users_profiles.tier_id`).
  - Education Info: Level (`users_profiles.education_level`) & Grade (`users_profiles.grade`).
  - School: (`users_profiles.school`).
  - Account Status: Badge (`Active` / `Banned`).
  - Joined Date: (`users.created_at`).
- **Filters & Search**:
  - Search Input: By Name (`users.name`), Email (`users.email`), or School (`users_profiles.school`).
  - Dropdown Filters: Role, Tier, Education Level, Ban Status.

### 3.3. User Detail & Moderation Drawer
Drawer modal for viewing deep details and performing administrative actions:
- **Profile & Contact**: Phone (`users_profiles.phone`), Address (`users_profiles.address`), DOB (`users_profiles.date_of_birth`), Bio, Extra JSON metadata.
- **Account Moderation**:
  - Change Role (`users.role`).
  - Change Tier (`users_profiles.tier_id`).
  - Ban / Unban User: Modify `users.banned`, `users.ban_reason`, and `users.ban_expires`.
- **Session Management**:
  - Display active sessions (`ip_address`, `user_agent`, `expires_at`).
  - Action: Revoke Session / Force Logout (removes row from `users_sessions`).
  - Action: Impersonate User (`impersonatedBy`).

### 3.4. Analytics & Charts (Powered by `users_stats`)
Supports instant Granularity Toggle (**Daily**, **Weekly**, **Monthly**):
- **Registration Trend Chart**: Line chart querying `users_stats` filtered by `periodType` (`WHERE period_type = :granularity ORDER BY period_key ASC`).
- **Education Demographics**: Pie/Donut chart querying latest snapshot in `users_stats.educationBreakdown`.
- **Tier Breakdown**: Bar chart querying latest snapshot in `users_stats.tierBreakdown`.

---

## 4. Performance & Scalability Strategy (>1,000,000 Users)

To ensure sub-second query response times and prevent server resource exhaustion when managing over 1 million users, the following optimizations are mandated:

### 4.1. Strict Pagination & Execution Constraints
- All user list queries must enforce explicit page limits (`LIMIT 10 / 25 / 50`).
- Joins between `users` and `users_profiles` must occur after applying `LIMIT` and pagination windows.

### 4.2. Database Indexing Plan
- **Range & Filtering Indexes**:
  - `users(created_at)` for registration trend queries.
  - `users(role)` for role filtering.
  - `users(banned)` for moderation status filtering.
  - `users_profiles(tier_id, education_level)` composite index for demographic queries.
  - `users_sessions(expires_at, user_id)` for quick online user count.
  - `users_stats(period_type, period_key)` composite unique index for instant chart data fetches.
- **Search Optimization**:
  - Trigram Index (`pg_trgm`) on `users(name, email)` and `users_profiles(school)` to enable instant substring searching (`ILIKE`).

### 4.3. Caching & Aggregation Strategy
- **Daily Cron Job (`backend/src/scripts/schedule/daily/jobs/update-user-stats.ts`)**:
  - Generates/updates daily record (`period_type = 'daily'`).
  - Updates weekly summary (`period_type = 'weekly'`, e.g., key `'2026-W29'`).
  - Updates monthly summary (`period_type = 'monthly'`, e.g., key `'2026-07'`).
- **Real-Time KPI Stats Caching**: Aggregate queries for today's live KPI cards are cached in Redis or Memory (5–15 min TTL) to avoid live table scans.

---

## 5. Heavy Process To-Do List

### 🗄️ Database & Schema Optimization
- [ ] Add `EnumStatsPeriodType` & `PgEnumStatsPeriodType` in `backend/src/db/schema/enum/enum-general.ts`.
- [ ] Create `users_stats` table in `backend/src/db/schema/user/stats.ts` and re-export in `backend/src/db/schema/user/index.ts`.
- [ ] Add Drizzle schema indexes:
  - `users_created_at_idx` on `users(created_at)`.
  - `users_role_idx` on `users(role)`.
  - `users_banned_idx` on `users(banned)`.
  - `profiles_tier_education_idx` on `users_profiles(tier_id, education_level)`.
  - `sessions_active_idx` on `users_sessions(expires_at, user_id)`.
  - `users_stats_period_idx` composite unique index on `users_stats(period_type, period_key)`.
- [ ] Enable PostgreSQL `pg_trgm` extension and create trigram index for `users(name, email)` and `users_profiles(school)`.

### ⚙️ Backend & API Optimization
- [ ] Create job script `backend/src/scripts/schedule/daily/jobs/update-user-stats.ts`.
- [ ] Register job script in `backend/src/scripts/schedule/daily/daily.ts`.
- [ ] Implement Caching Layer (Redis / Memory TTL 5–10 mins) for live KPI Stats API endpoint.
- [ ] Implement optimized keyset/offset paginated list API endpoint.
- [ ] Implement background cron worker for cleaning up expired sessions (`users_sessions.expires_at < NOW()`).

### 🎨 Frontend Implementation
- [ ] Build KPI Cards component with cached metrics.
- [ ] Build User Data Grid with server-side pagination, search debouncing, and filtering.
- [ ] Build User Detail & Moderation Drawer (Role update, Tier update, Ban form, Active Session revoke).
- [ ] Build Analytics Charts with Daily / Weekly / Monthly granularity toggle powered directly by `users_stats`.
