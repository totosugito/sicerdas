import { Type, type Static } from "@sinclair/typebox";
import { BaseResponseSchema } from "../../types/response.ts";

export const PackageItem = Type.Object({
  packId: Type.Integer(),
  packName: Type.String(),
  packReleaseDate: Type.String(),
  packFileSize: Type.Integer(),
  packTitle: Type.String(),
  packSource: Type.String(),
  packDesc: Type.String(),
  packUrl: Type.String(),
  packWordInfo: Type.Array(Type.String()),
  packSampleScreen: Type.Array(Type.String()),
});

export const DictionaryDataResponse = Type.Intersect([
  BaseResponseSchema,
  Type.Object({
    data: Type.Array(PackageItem),
  }),
]);

export type DictionaryPackage = Static<typeof PackageItem>;
