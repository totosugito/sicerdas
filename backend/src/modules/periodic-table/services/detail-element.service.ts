import { db } from "../../../db/db-pool.ts";
import { and, eq } from "drizzle-orm";
import { periodicElements, periodicElementNotes } from "../../../db/schema/periodic-table/index.ts";
import { getAtomicImages } from "../../../utils/periodic-table/table-periodic-utils.ts";
import type { ServiceResponse } from "../../../types/index.ts";
import type { ElementData, AtomicProperties, AtomicIsotopeItem } from "../periodic-table.schema.ts";

export interface DetailElementResponse extends ServiceResponse {
  data?: ElementData;
}

export async function detailElementService(
  atomicNumber: number,
  locale: string,
): Promise<DetailElementResponse> {
  const result = await db
    .select({
      id: periodicElements.id,
      atomicNumber: periodicElements.atomicNumber,
      atomicGroup: periodicElements.atomicGroup,
      atomicName: periodicElements.atomicName,
      atomicSymbol: periodicElements.atomicSymbol,
      atomicProperties: periodicElements.atomicProperties,
      atomicIsotope: periodicElements.atomicIsotope,
      atomicExtra: periodicElements.atomicExtra,
      localeCode: periodicElementNotes.localeCode,
      atomicOverview: periodicElementNotes.atomicOverview,
      atomicHistory: periodicElementNotes.atomicHistory,
      atomicApps: periodicElementNotes.atomicApps,
      atomicFacts: periodicElementNotes.atomicFacts,
      atomicImages: periodicElements.atomicImages,
    })
    .from(periodicElements)
    .leftJoin(
      periodicElementNotes,
      and(
        eq(periodicElements.atomicNumber, periodicElementNotes.atomicNumber),
        eq(periodicElementNotes.localeCode, locale),
      ),
    )
    .where(eq(periodicElements.atomicNumber, atomicNumber));

  if (!result || result.length === 0) {
    return { success: false, statusCode: 404, errorKey: ($) => $.periodic.elementNotFound };
  }

  const elementData = result[0];

  let navigation: ElementData["navigation"] = {
    prev: undefined,
    next: undefined,
  };

  if (elementData.atomicNumber >= 1 && elementData.atomicNumber <= 118) {
    if (elementData.atomicNumber > 1) {
      const prevResult = await db
        .select({
          atomicNumber: periodicElements.atomicNumber,
          atomicName: periodicElements.atomicName,
          atomicGroup: periodicElements.atomicGroup,
          atomicSymbol: periodicElements.atomicSymbol,
        })
        .from(periodicElements)
        .where(eq(periodicElements.atomicNumber, elementData.atomicNumber - 1));

      if (prevResult.length > 0) {
        navigation.prev = prevResult[0];
      }
    }

    if (elementData.atomicNumber < 118) {
      const nextResult = await db
        .select({
          atomicNumber: periodicElements.atomicNumber,
          atomicName: periodicElements.atomicName,
          atomicGroup: periodicElements.atomicGroup,
          atomicSymbol: periodicElements.atomicSymbol,
        })
        .from(periodicElements)
        .where(eq(periodicElements.atomicNumber, elementData.atomicNumber + 1));

      if (nextResult.length > 0) {
        navigation.next = nextResult[0];
      }
    }
  }

  return {
    success: true,
    data: {
      id: elementData.id,
      atomicNumber: elementData.atomicNumber,
      atomicGroup: elementData.atomicGroup,
      atomicName: elementData.atomicName,
      atomicSymbol: elementData.atomicSymbol,
      atomicProperties: (elementData.atomicProperties || {}) as AtomicProperties,
      atomicIsotope: (elementData.atomicIsotope || {}) as Record<string, AtomicIsotopeItem>,
      atomicExtra: elementData.atomicExtra || {},
      atomicImages: getAtomicImages(elementData.atomicImages || {}),
      ...(elementData.localeCode && {
        notes: {
          localeCode: elementData.localeCode,
          atomicOverview: elementData.atomicOverview ?? "",
          atomicHistory: elementData.atomicHistory ?? "",
          atomicApps: elementData.atomicApps ?? "",
          atomicFacts: elementData.atomicFacts ?? "",
        },
      }),
      navigation,
    },
  };
}
