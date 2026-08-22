# Better Auth 1.6 to 1.7 Migration Guide

## 1. Overview & Breaking Change

Starting in **Better Auth 1.7+**, external and local accounts are identified by the unique tuple `(issuer, accountId)`.
In version 1.6, Better Auth only matched accounts using `providerId` and `accountId`.

In 1.7:
- The `accounts` (table: `users_accounts`) model **requires** the `issuer` column (`NOT NULL`).
- A compound unique index on `(issuer, accountId)` is required.
- If `issuer` is missing or `NULL`, Better Auth fails credential resolution with `WARN [Better Auth]: User not found` and returns HTTP 401.

---

## 2. Issuer Values Mapping

| Account Type | `providerId` | `issuer` | `accountId` |
| :--- | :--- | :--- | :--- |
| **Email & Password (Credential)** | `credential` | `local:credential` | User `id` (`users.id`) |
| **Google OAuth** | `google` | `local:oauth:google` | Provider account sub/id |
| **Google One Tap** | `google` | `https://accounts.google.com` | Google `sub` claim |
| **Generic / Other OAuth** | `<provider>` | `local:oauth:<provider>` | Provider account id |

---

## 3. Database Migration Script (PostgreSQL)

File: [better_auth_1_6_to_1_7.sql](file:///home/toto/Documents/sicerdas/specs/migration/better_auth_1_6_to_1_7.sql)

```sql
BEGIN;

-- 1. Add nullable 'issuer' column
ALTER TABLE users_accounts 
ADD COLUMN IF NOT EXISTS issuer text;

-- 2. Backfill existing Email/Password accounts
UPDATE users_accounts 
SET issuer = 'local:credential' 
WHERE provider_id = 'credential' 
  AND (issuer IS NULL OR issuer = '');

-- 3. Backfill existing Google OAuth accounts
UPDATE users_accounts 
SET issuer = 'local:oauth:google' 
WHERE provider_id = 'google' 
  AND (issuer IS NULL OR issuer = '');

-- 4. Backfill other OAuth providers if any
UPDATE users_accounts 
SET issuer = 'local:oauth:' || provider_id 
WHERE provider_id NOT IN ('credential', 'google') 
  AND (issuer IS NULL OR issuer = '');

-- 5. Set NOT NULL constraint
ALTER TABLE users_accounts 
ALTER COLUMN issuer SET NOT NULL;

-- 6. Create compound unique index
CREATE UNIQUE INDEX IF NOT EXISTS account_issuer_accountId_uidx 
ON users_accounts (issuer, account_id);

COMMIT;
```

---

## 4. Application Code Changes

### A. Drizzle ORM Schema (`backend/src/db/schema/users/accounts.ts`)
```ts
import { pgTable, text, timestamp, uniqueIndex, uuid } from 'drizzle-orm/pg-core';
import { users } from "./users.ts";

export const accounts = pgTable('users_accounts', {
    id: uuid().primaryKey().notNull().defaultRandom(),
    accountId: text('account_id').notNull(),
    providerId: text('provider_id').notNull(),
    issuer: text('issuer').notNull(),
    userId: uuid('user_id')
        .notNull()
        .references(() => users.id, { onDelete: 'cascade', onUpdate: 'cascade' }),
    accessToken: text('access_token'),
    refreshToken: text('refresh_token'),
    idToken: text('id_token'),
    accessTokenExpiresAt: timestamp('access_token_expires_at', { withTimezone: true }),
    refreshTokenExpiresAt: timestamp('refresh_token_expires_at', { withTimezone: true }),
    scope: text('scope'),
    password: text('password'),
    createdAt: timestamp('created_at', { withTimezone: true }).notNull(),
    updatedAt: timestamp('updated_at', { withTimezone: true }).notNull(),
}, (table) => [
    uniqueIndex('account_issuer_accountId_uidx').on(table.issuer, table.accountId),
]);
```

### B. Admin User Creation & Seeding
Any manual account insertions (such as in `init-user.ts` and `create-user.service.ts`) must include `issuer`:
```ts
await db.insert(accounts).values({
  userId: user.id,
  accountId: user.id,
  providerId: "credential",
  issuer: "local:credential",
  password: hashedPassword,
  createdAt: new Date(),
  updatedAt: new Date(),
});
```

---

## 5. Verification Checklist

1. Check for any accounts with missing or NULL issuer:
```sql
SELECT COUNT(*) FROM users_accounts WHERE issuer IS NULL OR issuer = '';
-- Expected: 0
```

2. Check for duplicate keys before creating index:
```sql
SELECT issuer, account_id, COUNT(*) 
FROM users_accounts 
GROUP BY issuer, account_id 
HAVING COUNT(*) > 1;
-- Expected: 0 rows
```

3. Test sign in endpoint with default admin credentials:
```bash
POST /api/auth/sign-in-email
Payload: {"email": "totosugito@gmail.com", "password": "..."}
-- Expected: 200 OK with session token and user payload
```
