import { Type, type Static } from "@sinclair/typebox";
import { BaseResponseSchema } from "../../types/response.ts";
import { EnumReportReason } from "../../db/schema/enum/enum-general.ts";
import { EnumContentType } from "../../db/schema/enum/enum-app.ts";

export const CreateReportBody = Type.Object({
  name: Type.String({ minLength: 1 }),
  email: Type.String({ format: "email" }),
  title: Type.String({ minLength: 1 }),
  contentType: Type.Enum(EnumContentType),
  referenceId: Type.String({ format: "uuid" }),
  reason: Type.Enum(EnumReportReason),
  description: Type.Optional(Type.String()),
  extra: Type.Optional(Type.Record(Type.String(), Type.Unknown())),
});

export const CreateReportResponseItem = Type.Object({
  id: Type.String({ format: "uuid" }),
});

export const CreateReportResponse = Type.Intersect([
  BaseResponseSchema,
  Type.Object({
    data: CreateReportResponseItem,
  }),
]);

export type CreateReportParams = Static<typeof CreateReportBody>;
export type CreateReportData = Static<typeof CreateReportResponseItem>;
