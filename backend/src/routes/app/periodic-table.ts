import type { FastifyPluginAsyncTypebox } from "@fastify/type-provider-typebox";
import { Type } from "@sinclair/typebox";
import { db } from "../../db/db-pool.ts";
import { getTypedI18n } from "../../utils/i18n-typed.ts";
import { periodicElements, periodicElementNotes } from "../../db/schema/periodic-table/index.ts";

const ElementItem = Type.Object({
  id: Type.Integer(),
  idx: Type.Integer(),
  idy: Type.Integer(),
  atomicNumber: Type.Integer(),
  atomicGroup: Type.String(),
  atomicName: Type.String(),
  atomicSymbol: Type.String(),
  atomicImages: Type.Record(Type.String(), Type.Unknown()),
  atomicProperties: Type.Record(Type.String(), Type.Unknown()),
  atomicIsotope: Type.Record(Type.String(), Type.Unknown()),
  atomicExtra: Type.Record(Type.String(), Type.Unknown()),
});

const NoteItem = Type.Object({
  id: Type.Integer(),
  atomicNumber: Type.Integer(),
  localeCode: Type.String(),
  atomicOverview: Type.String(),
  atomicHistory: Type.String(),
  atomicApps: Type.String(),
  atomicFacts: Type.String(),
});

const PeriodicTableResponse = Type.Object({
  success: Type.Boolean(),
  message: Type.String(),
  data: Type.Object({
    elements: Type.Array(ElementItem),
    notes: Type.Array(NoteItem),
  }),
});

const periodicTableRoute: FastifyPluginAsyncTypebox = async (app) => {
  app.route({
    url: "/periodic-table",
    method: "GET",
    schema: {
      tags: ["V1/App"],
      summary: "Get all periodic table data",
      description: "Returns all periodic table elements and notes for offline client sync",
      response: {
        200: PeriodicTableResponse,
        "4xx": Type.Object({
          success: Type.Boolean({ default: false }),
          message: Type.String(),
        }),
        "5xx": Type.Object({
          success: Type.Boolean({ default: false }),
          message: Type.String(),
        }),
      },
    },
    handler: async function handler(
      req,
      reply,
    ): Promise<typeof PeriodicTableResponse.static> {
      const { t } = getTypedI18n(req);

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

      return reply.status(200).send({
        success: true,
        message: t(($) => $.periodic.success),
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
      });
    },
  });
};

export default periodicTableRoute;
