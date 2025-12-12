import type { FastifyPluginAsyncTypebox } from "@fastify/type-provider-typebox";
import { Type } from '@sinclair/typebox';
import { withErrorHandler } from "../../../utils/withErrorHandler.ts";
import { db } from "../../../db/index.ts";
import { and, eq } from "drizzle-orm";
import { periodicElements, periodicElementNotes } from "../../../db/schema/index.ts";
import type { FastifyReply, FastifyRequest } from "fastify";
// Request parameter schema
const GetElementParams = Type.Object({
  atomicNumber: Type.Integer({ description: 'Atomic number of the element to retrieve' })
});

// Query string schema for locale
const GetElementQuery = Type.Object({
  locale: Type.Optional(Type.String({ description: 'Locale code for element notes (e.g., en, id)', default: 'en' }))
});
// Response schema
const ElementNoteSchema = Type.Object({
  localeCode: Type.String(),
  atomicOverview: Type.String(),
  atomicHistory: Type.String(),
  atomicApps: Type.String(),
  atomicFacts: Type.String(),
});

const ElementResponse = Type.Object({
  success: Type.Boolean(),
  data: Type.Object({
    atomicId: Type.Integer(),
    idx: Type.Integer(),
    idy: Type.Integer(),
    atomicNumber: Type.Integer(),
    atomicGroup: Type.String(),
    atomicName: Type.String(),
    atomicSymbol: Type.String(),
    atomicProperties: Type.Record(Type.String(), Type.Unknown()),
    atomicIsotope: Type.Record(Type.String(), Type.Unknown()),
    atomicExtra: Type.Record(Type.String(), Type.Unknown()),
    notes: Type.Optional(ElementNoteSchema)
  }),
});

const ElementNotFoundResponse = Type.Object({
  success: Type.Boolean({ default: false }),
  message: Type.String()
});

/**
 * Get periodic element by atomic number
 * 
 * Retrieves detailed information about a chemical element by its atomic number,
 * including element properties and localized notes.
 */
const publicRoute: FastifyPluginAsyncTypebox = async (app) => {
  app.route({
    url: '/element/:atomicNumber',
    method: 'GET',
    schema: {
      tags: ['V1/Periodic'],
      summary: 'Get element by atomic number',
      description: 'Retrieve detailed information about a chemical element by its atomic number with optional localized notes',
      params: GetElementParams,
      querystring: GetElementQuery,
      response: {
        200: ElementResponse,
        '4xx': ElementNotFoundResponse,
        '5xx': Type.Object({
          success: Type.Boolean({ default: false }),
          message: Type.String()
        })
      },
    },
    handler: withErrorHandler(async function handler(
      req: FastifyRequest<{ Params: typeof GetElementParams.static, Querystring: typeof GetElementQuery.static }>,
      reply: FastifyReply
    ) {
      const { atomicNumber } = req.params;
      const { locale = 'en' } = req.query;

      // Query the periodic element with joined notes
      const result = await db
        .select({
          atomicId: periodicElements.atomicId,
          idx: periodicElements.idx,
          idy: periodicElements.idy,
          atomicNumber: periodicElements.atomicNumber,
          atomicGroup: periodicElements.atomicGroup,
          atomicName: periodicElements.atomicName,
          atomicSymbol: periodicElements.atomicSymbol,
          atomicProperties: periodicElements.atomicProperties,
          atomicIsotope: periodicElements.atomicIsotope,
          atomicExtra: periodicElements.atomicExtra,
          // Notes fields (will be null if no matching note for locale)
          localeCode: periodicElementNotes.localeCode,
          atomicOverview: periodicElementNotes.atomicOverview,
          atomicHistory: periodicElementNotes.atomicHistory,
          atomicApps: periodicElementNotes.atomicApps,
          atomicFacts: periodicElementNotes.atomicFacts,
        })
        .from(periodicElements)
        .leftJoin(periodicElementNotes, 
          and(
            eq(periodicElements.atomicNumber, periodicElementNotes.atomicNumber),
            eq(periodicElementNotes.localeCode, locale)
          ))
        .where(eq(periodicElements.atomicNumber, atomicNumber));
      // Check if element exists
      if (!result || result.length === 0) {
        return reply.notFound(req.i18n.t('periodic.elementNotFound', { atomicNumber }));
      }
      // Take the first result (there should only be one element)
      const elementData = result[0];
      
      return reply.status(200).send({
        success: true,
        data: {
          atomicId: elementData.atomicId,
          idx: elementData.idx,
          idy: elementData.idy,
          atomicNumber: elementData.atomicNumber,
          atomicGroup: elementData.atomicGroup,
          atomicName: elementData.atomicName,
          atomicSymbol: elementData.atomicSymbol,
          atomicProperties: elementData.atomicProperties || {},
          atomicIsotope: elementData.atomicIsotope || {},
          atomicExtra: elementData.atomicExtra || {},
          // Only include notes object if notes data exists
          ...(elementData.localeCode && {
            notes: {
              localeCode: elementData.localeCode,
              atomicOverview: elementData.atomicOverview,
              atomicHistory: elementData.atomicHistory,
              atomicApps: elementData.atomicApps,
              atomicFacts: elementData.atomicFacts,
            }
          })
        }
      });
    }),
  });
};

export default publicRoute;