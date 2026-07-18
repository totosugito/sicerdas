import { Type, type Static } from "@sinclair/typebox";
import { BaseResponseSchema } from "../../types/response.ts";
import { EnumContentType, EnumContentStatus } from "../../db/schema/enum/enum-app.ts";

export const VersionResponseItem = Type.Object({
  id: Type.Number(),
  appVersion: Type.Number(),
  dbVersion: Type.Number(),
  dataType: Type.Enum(EnumContentType),
  status: Type.Enum(EnumContentStatus),
  name: Type.String(),
  note: Type.Array(Type.Record(Type.String(), Type.Unknown())),
  extra: Type.Record(Type.String(), Type.Unknown()),
  createdAt: Type.String({ format: "date-time" }),
  updatedAt: Type.String({ format: "date-time" }),
});

export const VersionResponse = Type.Intersect([
  BaseResponseSchema,
  Type.Object({
    data: VersionResponseItem,
  }),
]);

const VersionBaseFields = {
  appVersion: Type.Number(),
  dbVersion: Type.Number(),
  status: Type.Enum(EnumContentStatus),
  name: Type.String({ minLength: 1 }),
  note: Type.Array(Type.Record(Type.String(), Type.Unknown())),
  extra: Type.Record(Type.String(), Type.Unknown()),
};

export const CreateVersionBody = Type.Object({
  appVersion: VersionBaseFields.appVersion,
  dbVersion: VersionBaseFields.dbVersion,
  dataType: Type.Enum(EnumContentType),
  status: Type.Optional(VersionBaseFields.status),
  name: VersionBaseFields.name,
  note: Type.Optional(VersionBaseFields.note),
  extra: Type.Optional(VersionBaseFields.extra),
});

export const UpdateVersionBody = Type.Partial(Type.Object({
  appVersion: VersionBaseFields.appVersion,
  dbVersion: VersionBaseFields.dbVersion,
  status: VersionBaseFields.status,
  name: Type.String(),
  note: VersionBaseFields.note,
  extra: VersionBaseFields.extra,
}));

export type AppVersion = Static<typeof VersionResponseItem>;

export type CreateVersionBodyType = Static<typeof CreateVersionBody>;
export type UpdateVersionBodyType = Static<typeof UpdateVersionBody>;

export type CreateVersionParams = CreateVersionBodyType;
export type UpdateVersionParams = UpdateVersionBodyType;

export type CreateVersionRequest = CreateVersionParams;
export type UpdateVersionRequest = UpdateVersionParams;
