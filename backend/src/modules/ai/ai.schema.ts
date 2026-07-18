import { Type, type Static } from "@sinclair/typebox";
import { BaseResponseSchema } from "../../types/response.ts";

export const ModelResponseItem = Type.Object({
  id: Type.String(),
  name: Type.String(),
  provider: Type.String(),
  description: Type.Optional(Type.String()),
  modelIdentifier: Type.String(),
  maxTokens: Type.Optional(Type.Number()),
  supportsImage: Type.Boolean(),
  supportsFile: Type.Boolean(),
  acceptedImageExtensions: Type.Optional(Type.Array(Type.String())),
  acceptedFileExtensions: Type.Optional(Type.Array(Type.String())),
  maxFileSize: Type.Optional(Type.Number()),
  isDefault: Type.Boolean(),
  isEnabled: Type.Optional(Type.Boolean()),
  requiredTierId: Type.Optional(Type.String()),
  tierCapabilities: Type.Optional(Type.Record(Type.String(), Type.Unknown())),
  createdAt: Type.String({ format: "date-time" }),
  updatedAt: Type.String({ format: "date-time" }),
});

export const ModelDetailItem = Type.Intersect([
  ModelResponseItem,
  Type.Object({
    stats: Type.Optional(
      Type.Array(
        Type.Object({
          date: Type.String(),
          successCount: Type.Number(),
          totalRequests: Type.Number(),
          avgDuration: Type.Number(),
        }),
      ),
    ),
  }),
]);

const TierCapabilitiesItem = Type.Object({
  supportsImage: Type.Optional(Type.Boolean()),
  supportsFile: Type.Optional(Type.Boolean()),
  maxFileSize: Type.Optional(Type.Number()),
  maxTokens: Type.Optional(Type.Number()),
});

const ModelBaseFields = {
  name: Type.String({ minLength: 1 }),
  provider: Type.String({ minLength: 1 }),
  modelIdentifier: Type.String({ minLength: 1 }),
  apiKey: Type.Optional(Type.String()),
  description: Type.Optional(Type.String()),
  maxTokens: Type.Optional(Type.Number()),
  supportsImage: Type.Boolean({ default: false }),
  supportsFile: Type.Boolean({ default: false }),
  acceptedImageExtensions: Type.Optional(Type.Array(Type.String())),
  acceptedFileExtensions: Type.Optional(Type.Array(Type.String())),
  maxFileSize: Type.Optional(Type.Number()),
  isDefault: Type.Optional(Type.Boolean({ default: false })),
  isEnabled: Type.Optional(Type.Boolean({ default: true })),
  requiredTierId: Type.Optional(Type.String()),
  tierCapabilities: Type.Optional(Type.Record(Type.String(), TierCapabilitiesItem)),
  extra: Type.Optional(Type.Record(Type.String(), Type.Unknown())),
};

export const ModelCreateBody = Type.Object(ModelBaseFields);

export const ModelUpdateBody = Type.Partial(Type.Object(ModelBaseFields));

export const StatsQuery = Type.Object({
  modelId: Type.Optional(Type.String()),
  periodStart: Type.Optional(Type.String({ format: "date-time" })),
  periodEnd: Type.Optional(Type.String({ format: "date-time" })),
  limit: Type.Optional(Type.Number({ default: 100 })),
  offset: Type.Optional(Type.Number({ default: 0 })),
  sortBy: Type.Optional(Type.String({ default: "periodStart" })),
  sortOrder: Type.Optional(Type.String({ default: "desc" })),
});

export const StatsLogItem = Type.Object({
  id: Type.String(),
  modelId: Type.String(),
  periodStart: Type.String({ format: "date-time" }),
  periodEnd: Type.String({ format: "date-time" }),
  successCount: Type.Number(),
  failureCount: Type.Number(),
  totalRequests: Type.Number(),
  avgDuration: Type.Optional(Type.Number()),
  totalTokens: Type.Optional(Type.Number()),
  createdAt: Type.String({ format: "date-time" }),
  modelName: Type.Optional(Type.String()),
});

export const ModelResponse = Type.Intersect([
  BaseResponseSchema,
  Type.Object({ data: ModelResponseItem }),
]);

export const DetailModelResponse = Type.Intersect([
  BaseResponseSchema,
  Type.Object({ data: ModelDetailItem }),
]);

export const ListModelStatsResponse = Type.Intersect([
  BaseResponseSchema,
  Type.Object({
    data: Type.Array(StatsLogItem),
    meta: Type.Object({
      total: Type.Number(),
      limit: Type.Number(),
      offset: Type.Number(),
    }),
  }),
]);

export type ModelData = Static<typeof ModelResponseItem>;
export type ModelDetailData = Static<typeof ModelDetailItem>;
export type CreateModelParams = Static<typeof ModelCreateBody>;
export type UpdateModelParams = Static<typeof ModelUpdateBody>;
export type StatsQueryParams = Static<typeof StatsQuery>;
export type StatsLogData = Static<typeof StatsLogItem>;
