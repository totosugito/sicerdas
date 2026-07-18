import { db } from "../../../db/db-pool.ts";
import { periodicElements, periodicElementNotes } from "../../../db/schema/periodic-table/index.ts";
import type { ServiceResponse } from "../../../types/index.ts";
import type { SyncElement, SyncNote } from "../periodic-table-sync.schema.ts";

export interface ListSyncPeriodicResponse extends ServiceResponse {
  data?: {
    elements: SyncElement[];
    notes: SyncNote[];
  };
}

export async function listSyncPeriodicService(): Promise<ListSyncPeriodicResponse> {
  const elements = await db
    .select({
      id: periodicElements.id,
      idx: periodicElements.idx,
      idy: periodicElements.idy,
      atomicNumber: periodicElements.atomicNumber,
      atomicGroup: periodicElements.atomicGroup,
      atomicName: periodicElements.atomicName,
      atomicSymbol: periodicElements.atomicSymbol,
      atomicImages: periodicElements.atomicImages,
      atomicProperties: periodicElements.atomicProperties,
      atomicIsotope: periodicElements.atomicIsotope,
      atomicExtra: periodicElements.atomicExtra,
    })
    .from(periodicElements);

  const notes = await db
    .select({
      id: periodicElementNotes.id,
      atomicNumber: periodicElementNotes.atomicNumber,
      localeCode: periodicElementNotes.localeCode,
      atomicOverview: periodicElementNotes.atomicOverview,
      atomicHistory: periodicElementNotes.atomicHistory,
      atomicApps: periodicElementNotes.atomicApps,
      atomicFacts: periodicElementNotes.atomicFacts,
    })
    .from(periodicElementNotes);

  return {
    success: true,
    data: {
      elements: elements.map((el) => ({
        ...el,
        atomicImages: el.atomicImages || {},
        atomicProperties: el.atomicProperties || {},
        atomicIsotope: el.atomicIsotope || {},
        atomicExtra: el.atomicExtra || {},
      })),
      notes,
    },
  };
}
