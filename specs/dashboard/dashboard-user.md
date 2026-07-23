# Admin Dashboard - User Management Specification

This specification documents the requirements, schema mapping, UI components, performance optimizations, daily analytics aggregation, and API routes for the **Admin User Dashboard** in the Si Cerdas application.

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
  newUsersCount: integer('new_users_count').notNull().default(0),
  totalUsersCount: integer('total_users_count').notNull().default(0),
  activeUsersCount: integer('active_users_count').notNull().default(0),
  bannedUsersCount: integer('banned_users_count').notNull().default(0),
  
  // Flexible Structured Breakdowns (JSONB)
  roleBreakdown: jsonb('role_breakdown').$type<{ admin: number; teacher: number; user: number; guest: number }>().notNull(),
  tierBreakdown: jsonb('tier_breakdown').$type<Record<string, number>>().notNull(),
  educationBreakdown: jsonb('education_breakdown').$type<Record<string, number>>().notNull(),
  
  createdAt: timestamp('created_at', { withTimezone: true }).defaultNow().notNull(),
});
```

---

## 3. Existing & New API Routes (`backend/src/routes/users/admin/`)

The admin user routes are organized inside `backend/src/routes/users/admin/` and powered by services in `backend/src/modules/users/services/admin/`:

### 3.1. Existing Admin User API Routes
- **`POST /api/v1/users/admin/list`** (`list-users.ts`):
  - Fetches paginated user list with search (`name`, `email`), role filtering, and sorting (`createdAt`, etc.).
- **`POST /api/v1/users/admin/ban`** (`ban.ts`):
  - Moderation endpoint to ban or unban a user with `banned` and `banReason`.
- **`POST /api/v1/users/admin/update`** (`update-user.ts`):
  - Updates user account and profile data (including `role`, `tierId`, academic info).
- **`POST /api/v1/users/admin/details`** (`details-user.ts`):
  - Fetches complete user details and profile info for drawer deep dive.
- **`POST /api/v1/users/admin/create`** (`create-user.ts`):
  - Admin endpoint to create new user accounts.
- **`POST /api/v1/users/admin/delete` & `/deletes`** (`delete-user.ts`, `deletes.ts`):
  - Single and bulk delete user operations.

### 3.2. New Admin Dashboard API Routes Needed
- **`GET /api/v1/users/admin/stats`** (New: `stats-user.ts` & `get-user-stats.service.ts`):
  - Fetches historical chart analytics & KPI summary from `users_stats`.
  - Supports Query Parameters: `?periodType=daily|weekly|monthly` & `?limit=12`.

---

## 4. Key Dashboard Components & Data Specifications

### 4.1. Headline Metrics (KPI Cards)
- **Total Users**: Count of all registered users (`usersStats.totalUsersCount`).
- **Active Sessions (Online Users)**: Unique users with active login sessions (`usersStats.activeUsersCount`).
- **Banned Accounts**: Total users currently banned (`usersStats.bannedUsersCount`).
- **Role Distribution**: Count of users grouped by `users.role`.
- **Tier Distribution**: Count of users grouped by `users_profiles.tier_id`.

### 4.2. User Management Table (Data Grid)
Powered by existing `POST /api/v1/users/admin/list` endpoint:
- **Columns**: Avatar, Full Name, Email, Role Badge, Tier Badge, Education Level, Grade, School, Account Status, Joined Date.
- **Filters & Search**: Search input (Name, Email, School), Dropdown Filters (Role, Tier, Education Level, Ban Status).

### 4.3. User Detail & Moderation Drawer
Powered by existing `POST /api/v1/users/admin/details`, `/update`, and `/ban` endpoints:
- **Profile & Contact**: Phone, Address, DOB, Bio, Extra JSON metadata.
- **Account Moderation**: Change Role, Change Tier, Ban / Unban User with `banReason`.

### 4.4. Analytics & Charts (Powered by `GET /api/v1/users/admin/stats`)
- **Registration Trend Chart**: Line chart querying `users_stats` by `periodType` (`daily`, `weekly`, `monthly`).
- **Education Demographics**: Donut chart querying latest `educationBreakdown`.
- **Tier Breakdown**: Bar chart querying latest `tierBreakdown`.

---

## 5. Heavy Process To-Do List

### 🗄️ Database & Schema Optimization (COMPLETED ✓)
- [x] Added `EnumStatsPeriodType` & `PgEnumStatsPeriodType` in `backend/src/db/schema/enum/enum-general.ts`.
- [x] Created `users_stats` table in `backend/src/db/schema/user/stats.ts` and re-exported in `backend/src/db/schema/user/index.ts`.
- [x] Pushed database migrations (`bun run db:push_dev`).
- [x] Created job script `backend/src/scripts/schedule/daily/jobs/update-user-stats.ts`.
- [x] Registered job script and toggle controls in `backend/src/scripts/schedule/daily/daily.ts`.

### ⚙️ Backend & API Optimization
- [ ] Create `get-user-stats.service.ts` in `backend/src/modules/users/services/admin/`.
- [ ] Create `stats-user.ts` route in `backend/src/routes/users/admin/stats-user.ts`.
- [ ] Re-export new service & route.

### 🎨 Frontend Implementation
- [ ] Build KPI Cards component with stats API data.
- [ ] Build User Data Grid consuming `POST /api/v1/users/admin/list`.
- [ ] Build User Detail & Moderation Drawer consuming `/details`, `/update`, and `/ban`.
- [ ] Build Analytics Charts with Daily / Weekly / Monthly toggle consuming `GET /api/v1/users/admin/stats`.
