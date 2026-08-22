-- ==============================================================================
-- Migration: Better Auth 1.6 to 1.7
-- Target Database: PostgreSQL
-- Table: users_accounts
-- Description: Adds 'issuer' column, backfills existing data, sets NOT NULL,
--              and creates unique compound index on (issuer, account_id).
-- ==============================================================================

BEGIN;

-- 1. Add nullable 'issuer' column if not exists
ALTER TABLE users_accounts 
ADD COLUMN IF NOT EXISTS issuer text;

-- 2. Backfill 'issuer' for Email & Password (credential) accounts
UPDATE users_accounts 
SET issuer = 'local:credential' 
WHERE provider_id = 'credential' 
  AND (issuer IS NULL OR issuer = '');

-- 3. Backfill 'issuer' for Google OAuth accounts
UPDATE users_accounts 
SET issuer = 'local:oauth:google' 
WHERE provider_id = 'google' 
  AND (issuer IS NULL OR issuer = '');

-- 4. Backfill 'issuer' for any other third-party OAuth providers
UPDATE users_accounts 
SET issuer = 'local:oauth:' || provider_id 
WHERE provider_id NOT IN ('credential', 'google') 
  AND (issuer IS NULL OR issuer = '');

-- 5. Enforce NOT NULL constraint on 'issuer' column
ALTER TABLE users_accounts 
ALTER COLUMN issuer SET NOT NULL;

-- 6. Create compound unique index on (issuer, account_id)
CREATE UNIQUE INDEX IF NOT EXISTS account_issuer_accountId_uidx 
ON users_accounts (issuer, account_id);

COMMIT;
