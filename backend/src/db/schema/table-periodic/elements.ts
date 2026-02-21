import { pgTable, varchar, integer, jsonb, index } from 'drizzle-orm/pg-core';
import { type InferInsertModel, type InferSelectModel } from 'drizzle-orm';
import { PgEnumPeriodicGroup } from "./types.ts";

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
 * - atomicImages: JSONB field containing image information.
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
    atomicImages: jsonb("atomic_images")
        .$type<Record<string, unknown>>()
        .default({}),
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
