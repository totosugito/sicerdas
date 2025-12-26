import { pgTable, varchar, integer, jsonb, index, text } from 'drizzle-orm/pg-core';
import { type InferInsertModel, type InferSelectModel } from 'drizzle-orm';
import { PgEnumPeriodicGroup } from "./enum-app.ts";
export type SchemaPeriodicElementInsert = InferInsertModel<typeof periodicElements>;
export type SchemaPeriodicElementSelect = InferSelectModel<typeof periodicElements>;

/**
 * Periodic Elements
 * 
 * The `periodicElements` table stores detailed information about chemical elements in the periodic table.
 * Each element contains data such as atomic number, symbol, name, position in the periodic table, 
 * and extensive properties data in JSON format.
 * 
 * Fields:
 * - atomicId: Unique identifier for the element in the periodic table data.
 * - idx: X-coordinate position in the periodic table grid.
 * - idy: Y-coordinate position in the periodic table grid.
 * - atomicNumber: Atomic number of the element (-1 for header/empty cells).
 * - atomicGroup: Classification of the element (e.g., otherNonMetals, alkaliMetals).
 * - atomicName: Name of the element.
 * - atomicSymbol: Chemical symbol of the element.
 * - atomicProperties: JSONB field containing detailed element properties.
 * - atomicIsotope: JSONB field containing isotope information.
 * - atomicExtra: JSONB field for additional metadata.
 */
export const periodicElements = pgTable('periodic_elements', {
  id: integer('id').primaryKey().notNull(),
  idx: integer('idx').notNull(),
  idy: integer('idy').notNull(),
  atomicNumber: integer('atomic_number').notNull(),
  atomicGroup: PgEnumPeriodicGroup('atomic_group').notNull().default('header'),
  atomicName: varchar('atomic_name', { length: 128 }).notNull(),
  atomicSymbol: varchar('atomic_symbol', { length: 8 }).notNull(),
  atomicProperties: jsonb("atomic_properties")
    .$type<Record<string, unknown>>()
    .default({}),
  atomicIsotope: jsonb("atomic_isotope")
    .$type<Record<string, unknown>>()
    .default({}),
  atomicExtra: jsonb("atomic_extra")
    .$type<Record<string, unknown>>()
    .default({}),
}, (table) => [
  index('periodic_elements_atomic_number_index').on(table.atomicNumber),
  index('periodic_elements_atomic_symbol_index').on(table.atomicSymbol),
  index('periodic_elements_idx_idy_index').on(table.idx, table.idy),
]);

/**
 * Periodic Element Notes
 * 
 * The `periodicElementNotes` table stores detailed notes and information about chemical elements.
 * Each record contains data such as overview, history, applications, and interesting facts about an element.
 * 
 * Fields:
 * - rowId: Unique identifier for the note.
 * - atomicNumber: Atomic number of the element (corresponds to periodicElements.atomicNumber).
 * - localeCode: Language code for localization (e.g., 'en', 'id').
 * - atomicOverview: General overview of the element.
 * - atomicHistory: Historical information about the element.
 * - atomicApps: Applications of the element.
 * - atomicFacts: Interesting facts about the element.
 */
export const periodicElementNotes = pgTable('periodic_element_notes', {
  id: integer('id').primaryKey().notNull(),
  atomicNumber: integer('atomic_number').notNull(),
  localeCode: varchar('locale_code', { length: 3 }).notNull(),
  atomicOverview: text('atomic_overview').notNull(),
  atomicHistory: text('atomic_history').notNull(),
  atomicApps: text('atomic_apps').notNull(),
  atomicFacts: text('atomic_facts').notNull(),
});

export type SchemaPeriodicElementNoteInsert = InferInsertModel<typeof periodicElementNotes>;
export type SchemaPeriodicElementNoteSelect = InferSelectModel<typeof periodicElementNotes>;
