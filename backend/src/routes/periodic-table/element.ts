import type { FastifyPluginAsyncTypebox } from "@fastify/type-provider-typebox";
import { Type } from '@sinclair/typebox';
import { withErrorHandler } from "../../utils/withErrorHandler.ts";
import { db } from "../../db/index.ts";
import { and, eq } from "drizzle-orm";
import { periodicElements, periodicElementNotes } from "../../db/schema/index.ts";
import type { FastifyReply, FastifyRequest } from "fastify";

const GetElementParams = Type.Object({
  atomicNumber: Type.Integer({ description: 'Atomic number of the element to retrieve' })
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
  message: Type.String(),
  data: Type.Object({
    id: Type.Integer(),
    atomicNumber: Type.Integer(),
    atomicGroup: Type.String(),
    atomicName: Type.String(),
    atomicSymbol: Type.String(),
    atomicProperties: Type.Record(Type.String(), Type.Unknown()),
    atomicIsotope: Type.Record(Type.String(), Type.Unknown()),
    atomicExtra: Type.Record(Type.String(), Type.Unknown()),
    notes: Type.Optional(ElementNoteSchema),
    navigation: Type.Object({
      prev: Type.Optional(Type.Object({
        atomicNumber: Type.Integer(),
        atomicName: Type.String(),
        atomicGroup: Type.String(),
        atomicSymbol: Type.String(),
      })),
      next: Type.Optional(Type.Object({
        atomicNumber: Type.Integer(),
        atomicName: Type.String(),
        atomicGroup: Type.String(),
        atomicSymbol: Type.String(),
      })),
    })
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
      req: FastifyRequest<{ Params: typeof GetElementParams.static }>,
      reply: FastifyReply
    ) {
      const { atomicNumber } = req.params;
      const locale = req.headers['accept-language'] || 'id';

      // Query the periodic element with joined notes
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

      // Initialize navigation data
      let navigation = {
        prev: undefined as {
          atomicNumber: number;
          atomicName: string;
          atomicGroup: string;
          atomicSymbol: string;
        } | undefined,
        next: undefined as {
          atomicNumber: number;
          atomicName: string;
          atomicGroup: string;
          atomicSymbol: string;
        } | undefined,
      };

      // Only calculate navigation if atomic number is in range 1-118
      if (elementData.atomicNumber >= 1 && elementData.atomicNumber <= 118) {
        // Get previous element
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
            navigation.prev = {
              atomicNumber: prevResult[0].atomicNumber,
              atomicName: prevResult[0].atomicName,
              atomicGroup: prevResult[0].atomicGroup,
              atomicSymbol: prevResult[0].atomicSymbol,
            };
          }
        }

        // Get next element
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
            navigation.next = {
              atomicNumber: nextResult[0].atomicNumber,
              atomicName: nextResult[0].atomicName,
              atomicGroup: nextResult[0].atomicGroup,
              atomicSymbol: nextResult[0].atomicSymbol,
            };
          }
        }
      }

      return reply.status(200).send({
        success: true,
        message: req.i18n.t('periodic.success'),
        data: {
          id: elementData.id,
          atomicNumber: elementData.atomicNumber,
          atomicGroup: elementData.atomicGroup,
          atomicName: elementData.atomicName,
          atomicSymbol: elementData.atomicSymbol,
          atomicProperties: elementData.atomicProperties || {},
          atomicIsotope: elementData.atomicIsotope || {},
          atomicExtra: elementData.atomicExtra || {},
          ...(elementData.localeCode && {
            notes: {
              localeCode: elementData.localeCode,
              atomicOverview: elementData.atomicOverview,
              atomicHistory: elementData.atomicHistory,
              atomicApps: elementData.atomicApps,
              atomicFacts: elementData.atomicFacts,
            }
          }),
          navigation
        }
      });
    }),
  });
};

export default publicRoute;