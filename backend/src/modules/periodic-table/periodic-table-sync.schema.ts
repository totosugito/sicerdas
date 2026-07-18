import { Type, type Static } from "@sinclair/typebox";
import { BaseResponseSchema } from "../../types/response.ts";

export const SyncElementItem = Type.Object({
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

export const SyncNoteItem = Type.Object({
  id: Type.Integer(),
  atomicNumber: Type.Integer(),
  localeCode: Type.String(),
  atomicOverview: Type.String(),
  atomicHistory: Type.String(),
  atomicApps: Type.String(),
  atomicFacts: Type.String(),
});

export const PeriodicSyncResponse = Type.Intersect([
  BaseResponseSchema,
  Type.Object({
    data: Type.Object({
      elements: Type.Array(SyncElementItem),
      notes: Type.Array(SyncNoteItem),
    }),
  }),
]);

export type SyncElement = Static<typeof SyncElementItem>;
export type SyncNote = Static<typeof SyncNoteItem>;
