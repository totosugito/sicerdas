import type { InferSelectModel, InferInsertModel } from 'drizzle-orm';
import { boolean, pgTable, text, timestamp, uuid, varchar, jsonb } from 'drizzle-orm/pg-core';
import {EnumUserRole, PgEnumUserRole} from "./enum-auth.ts";
import { EnumEducationLevel, PgEnumEducationLevel } from './enum-app.ts';

/**
 * Table: users
 * 
 * This table stores core user account information including authentication details, profile data, and status.
 * It serves as the primary source of user identity and access control within the application.
 * 
 * Fields:
 * - id: Unique identifier for the user account
 * - email: User's email address (unique across all accounts)
 * - emailVerified: Whether the user's email has been verified
 * - name: User's full name or display name
 * - role: User's role/access level (user, admin, etc.)
 * - image: URL to user's profile image (optional)
 * - createdAt: When the user account was created
 * - updatedAt: When the user account was last updated
 * - banned: Whether the user account is currently banned
 * - banReason: Reason for account ban (optional)
 * - banExpires: When the ban expires (optional)
 * 
 * Design Notes:
 * - The email field is unique and serves as a primary identifier for login
 * - Email verification status is tracked separately to support email confirmation flows
 * - User roles are defined in the EnumUserRole enumeration
 * - Ban information is stored directly in the user record for quick access control checks
 * - The updatedAt field is maintained for cache invalidation and audit purposes
 */
export const users = pgTable('users', {
  id: uuid().primaryKey().notNull().defaultRandom(),
  email: varchar({ length: 50 }).notNull().unique(),
  emailVerified: boolean('email_verified').notNull().default(false),
  name: varchar('name', { length: 50 }).notNull(),
  role: PgEnumUserRole('role').notNull().default(EnumUserRole.USER),
  image: text('image'),
  createdAt: timestamp('created_at').defaultNow().notNull(),
  updatedAt: timestamp('updated_at').notNull(),
  banned: boolean().notNull().default(false),
  banReason: text('ban_reason'),
  banExpires: timestamp('ban_expires'),
});

/**
 * Table: sessions
 * 
 * This table tracks active user sessions with authentication tokens and metadata.
 * It enables session-based authentication and provides security information about user sessions.
 * 
 * Fields:
 * - id: Unique identifier for the session record
 * - expiresAt: When the session token expires
 * - token: Unique session token used for authentication
 * - createdAt: When the session was created
 * - updatedAt: When the session was last updated
 * - ipAddress: IP address of the client when session was created
 * - userAgent: Browser/user agent information of the client
 * - userId: ID of the user who owns this session
 * - impersonatedBy: ID of admin user who is impersonating (optional)
 * 
 * Design Notes:
 * - Sessions are tied to specific users via the userId foreign key with cascade delete
 * - The token field is unique to prevent duplicate sessions
 * - IP address and user agent are stored for security auditing
 * - Impersonation tracking allows admins to act on behalf of users while maintaining accountability
 * - Expire times enable automatic session cleanup and security
 */
export const sessions = pgTable('users_sessions', {
  id: uuid().primaryKey().notNull().defaultRandom(),
  expiresAt: timestamp('expires_at').notNull(),
  token: text('token').notNull().unique(),
  createdAt: timestamp('created_at').defaultNow().notNull(),
  updatedAt: timestamp('updated_at').notNull(),
  ipAddress: text('ip_address'),
  userAgent: text('user_agent'),
  userId: uuid('user_id')
    .notNull()
    .references(() => users.id, { onDelete: 'cascade', onUpdate: 'cascade' }),
  impersonatedBy: uuid('impersonated_by'),
});

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

/**
 * Table: verifications
 * 
 * This table stores temporary verification codes for email confirmation, password reset, etc.
 * It enables secure verification flows for user account actions.
 * 
 * Fields:
 * - id: Unique identifier for the verification record
 * - identifier: Unique identifier for the verification (e.g., email address)
 * - value: The user id
 * - expiresAt: When the verification code expires
 * - createdAt: When the verification record was created
 * - updatedAt: When the verification record was last updated
 * 
 * Design Notes:
 * - Used for email verification, password reset, and other account confirmation flows
 * - The identifier field can store email addresses or other unique identifiers
 * - Verification codes are time-limited for security
 * - The value field stores the user id
 * - Automatic cleanup of expired records should be implemented via cron job
 */
export const verifications = pgTable("users_verifications", {
  id: uuid().primaryKey().notNull().defaultRandom(),
  identifier: varchar("identifier", { length: 255 }).notNull(),
  value: varchar("value", { length: 255 }).notNull(),
  expiresAt: timestamp("expires_at").notNull(),
  createdAt: timestamp("created_at").notNull(),
  updatedAt: timestamp("updated_at").notNull(),
});

/**
 * Table: user_profiles
 * 
 * This table stores additional user information such as school, grade, phone number, and other profile details.
 * This table has a one-to-one relationship with the users table.
 * 
 * Fields:
 * - id: Unique identifier matching the user ID (one-to-one relationship)
 * - school: Name of the user's school (optional)
 * - grade: Educational grade level of the user (optional)
 * - phone: User's phone number (optional)
 * - address: User's address (optional)
 * - bio: Short biography or description of the user (optional)
 * - dateOfBirth: User's date of birth (optional)
 * - extra: JSONB field for storing additional structured data without requiring schema changes with default empty object
 * - createdAt: When the profile record was created
 * - updatedAt: When the profile record was last updated
 * 
 * Design Notes:
 * - This table maintains a one-to-one relationship with the users table
 * - All fields are optional to accommodate different user types and data availability
 * - The extra field allows for flexible storage of profile-specific metadata
 *   without requiring database migrations
 * - The id field references the user's ID directly, ensuring data consistency
 */
export const userProfile = pgTable('user_profiles', {
  // Primary key that matches the user ID for one-to-one relationship
  id: uuid('id').primaryKey().notNull()
    .references(() => users.id, { onDelete: 'cascade', onUpdate: 'cascade' }),
  
  // Educational information
  school: varchar('school', { length: 255 }),
  educationLevel: PgEnumEducationLevel('education_level').default(EnumEducationLevel.UNKNOWN),
  grade: varchar('grade', { length: 50 }),
  
  // Contact information
  phone: varchar('phone', { length: 20 }),
  address: text('address'),
  
  // Personal information
  bio: text('bio'),
  dateOfBirth: timestamp('date_of_birth'),
  
  // Flexible data storage
  extra: jsonb('extra')
    .$type<Record<string, unknown>>()
    .default({}),
  
  // Timestamps
  createdAt: timestamp('created_at').defaultNow().notNull(),
  updatedAt: timestamp('updated_at').defaultNow().notNull(),
});

export type User = InferSelectModel<typeof users>;
export type SchemaUserSelect = InferSelectModel<typeof users>;
export type SchemaUserInsert = InferInsertModel<typeof users>;

export type SchemaSessionSelect = InferSelectModel<typeof sessions>;
export type SchemaSessionInsert = InferInsertModel<typeof sessions>;

export type SchemaAccountSelect = InferSelectModel<typeof accounts>;
export type SchemaAccountInsert = InferInsertModel<typeof accounts>;

export type SchemaVerificationSelect = InferSelectModel<typeof verifications>;
export type SchemaVerificationInsert = InferInsertModel<typeof verifications>;

export type SchemaUserProfileSelect = InferSelectModel<typeof userProfile>;
export type SchemaUserProfileInsert = InferInsertModel<typeof userProfile>;