import { pgTable, varchar, integer, text } from 'drizzle-orm/pg-core';
import { type InferInsertModel, type InferSelectModel } from 'drizzle-orm';

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
