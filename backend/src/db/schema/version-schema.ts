import {jsonb, pgTable, serial, text, timestamp, integer} from "drizzle-orm/pg-core";
import {EnumContentStatus, EnumContentType, PgEnumContentStatus, PgEnumContentType} from "./enum-app.ts";
import type { InferSelectModel, InferInsertModel } from 'drizzle-orm';

/**
 * Table: app_version
 * 
 * This table tracks application and database versions for content management.
 * Each record represents a specific version of the application data schema,
 * allowing for version control and rollback capabilities.
 * 
 * Fields:
 * - id: Unique serial identifier for the version record
 * - appVersion: Application version number (semantic versioning)
 * - dbVersion: Database schema version number
 * - dataType: Type of content this version applies to (book, test, course, or other)
 * - status: Publication status of this version (published, unpublished, archived, deleted)
 * - name: Descriptive name for this version (optional)
 * - note: Additional notes or description about this version (optional)
 * - extra: JSONB field for storing additional structured data without requiring schema changes
 * - createdAt: When this version record was created
 * - updatedAt: When this version record was last updated
 * 
 * Design Notes:
 * - The combination of appVersion and dbVersion allows for independent tracking
 *   of application features and database schema changes
 * - dataType enables versioning of different content types separately
 * - status field controls which versions are active in the application
 * - The extra field provides flexibility for storing version-specific metadata
 *   without requiring database migrations
 */
export const appVersion = pgTable('app_version', {
  id: serial('id').primaryKey().notNull(),
  appVersion: integer('app_version').notNull(),
  dbVersion: integer('db_version').notNull(),
  dataType: PgEnumContentType('data_type').notNull().default(EnumContentType.BOOK),
  status: PgEnumContentStatus('status').notNull().default(EnumContentStatus.UNPUBLISHED),
  name: text('name').default(''),
  note: text('note')
    .default(''),
  extra: jsonb("extra")
    .$type<Record<string, unknown>>()
    .default({}),
  createdAt: timestamp('created_at').defaultNow(),
  updatedAt: timestamp('updated_at').defaultNow(),
});

export type SchemaAppVersionSelect = InferSelectModel<typeof appVersion>;
export type SchemaAppVersionInsert = InferInsertModel<typeof appVersion>;