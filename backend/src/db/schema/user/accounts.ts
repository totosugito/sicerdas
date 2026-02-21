import type { InferSelectModel, InferInsertModel } from 'drizzle-orm';
import { pgTable, text, timestamp, uuid } from 'drizzle-orm/pg-core';
import { users } from "./users.ts";

/**
 * Table: accounts
 * 
 * This table stores external authentication provider information and credentials for users.
 * It enables support for multiple authentication methods (OAuth, password-based, etc.).
 * 
 * Fields:
 * - id: Unique identifier for the account record
 * - accountId: Unique identifier from the external authentication provider
 * - providerId: Identifier for the authentication provider (e.g., google, github, email)
 * - userId: ID of the user who owns this account
 * - accessToken: OAuth access token (optional)
 * - refreshToken: OAuth refresh token (optional)
 * - idToken: ID token from authentication provider (optional)
 * - accessTokenExpiresAt: When the access token expires (optional)
 * - refreshTokenExpiresAt: When the refresh token expires (optional)
 * - scope: OAuth scope permissions (optional)
 * - password: Hashed password for password-based authentication (optional)
 * - createdAt: When the account record was created
 * - updatedAt: When the account record was last updated
 * 
 * Design Notes:
 * - Supports multiple authentication providers through the providerId field
 * - Password field is optional to support OAuth-only accounts
 * - Token expiration tracking enables automatic token refresh
 * - Accounts are tied to users via the userId foreign key with cascade delete
 * - Scope field stores OAuth permission scopes for access control
 */
export const accounts = pgTable('users_accounts', {
    id: uuid().primaryKey().notNull().defaultRandom(),
    accountId: text('account_id').notNull(),
    providerId: text('provider_id').notNull(),
    userId: uuid('user_id')
        .notNull()
        .references(() => users.id, { onDelete: 'cascade', onUpdate: 'cascade' }),
    accessToken: text('access_token'),
    refreshToken: text('refresh_token'),
    idToken: text('id_token'),
    accessTokenExpiresAt: timestamp('access_token_expires_at'),
    refreshTokenExpiresAt: timestamp('refresh_token_expires_at'),
    scope: text('scope'),
    password: text('password'),
    createdAt: timestamp('created_at').notNull(),
    updatedAt: timestamp('updated_at').notNull(),
});

export type SchemaAccountSelect = InferSelectModel<typeof accounts>;
export type SchemaAccountInsert = InferInsertModel<typeof accounts>;
