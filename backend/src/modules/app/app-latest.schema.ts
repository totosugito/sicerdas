import { Type, type Static } from "@sinclair/typebox";
import { BaseResponseSchema } from "../../types/response.ts";

export const AppLatestBody = Type.Object({
  dbVersion: Type.Number(),
});

export const VersionItem = Type.Object({
  id: Type.Number(),
  appVersion: Type.Number(),
  dbVersion: Type.Number(),
  dataType: Type.String(),
  status: Type.String(),
  name: Type.String(),
  htmlNote: Type.String(),
  extra: Type.Record(Type.String(), Type.Unknown()),
});

export const GradeItem = Type.Object({
  id: Type.Number(),
  grade: Type.String(),
  name: Type.String(),
  desc: Type.Union([Type.String(), Type.Null()]),
});

export const CategoryItem = Type.Object({
  id: Type.Number(),
  name: Type.String(),
  key: Type.String(),
  description: Type.Union([Type.String(), Type.Null()]),
});

export const GroupItem = Type.Object({
  id: Type.Number(),
  versionId: Type.Number(),
  categoryId: Type.Number(),
  name: Type.String(),
  shortName: Type.String(),
  desc: Type.Union([Type.String(), Type.Null()]),
  status: Type.String(),
  bookTotal: Type.Union([Type.Number(), Type.Null()]),
});

export const AdPlacement = Type.Object({
  id: Type.String(),
  enabled: Type.Boolean(),
});

export const SettingsItem = Type.Object({
  cloudUrl: Type.String(),
  ads: Type.Object({
    enabled: Type.Boolean(),
    adsDelayCounter: Type.Number(),
    adsDelayTimeInSec: Type.Number(),
    android: Type.Object({
      adsProvider: Type.String(),
      banner: AdPlacement,
      rewards: AdPlacement,
      interstitial: AdPlacement,
      native: AdPlacement,
    }),
    ios: Type.Object({
      adsProvider: Type.String(),
      banner: AdPlacement,
      rewards: AdPlacement,
      interstitial: AdPlacement,
      native: AdPlacement,
    }),
  }),
});

export const BookItem = Type.Object({
  id: Type.String({ format: "uuid" }),
  bookId: Type.Number(),
  versionId: Type.Number(),
  title: Type.String(),
  description: Type.Union([Type.String(), Type.Null()]),
  author: Type.Union([Type.String(), Type.Null()]),
  publishedYear: Type.String(),
  totalPages: Type.Number(),
  size: Type.Number(),
  status: Type.String(),
  bookGroupId: Type.Number(),
  educationGradeId: Type.Number(),
});

export const AppLatestResponse = Type.Intersect([
  BaseResponseSchema,
  Type.Object({
    data: Type.Object({
      versions: Type.Array(VersionItem),
      books: Type.Array(BookItem),
      grades: Type.Array(GradeItem),
      categories: Type.Array(CategoryItem),
      groups: Type.Array(GroupItem),
      settings: SettingsItem,
    }),
  }),
]);

export type AppLatestVersion = Static<typeof VersionItem>;
export type AppLatestBook = Static<typeof BookItem>;
export type AppLatestGrade = Static<typeof GradeItem>;
export type AppLatestCategory = Static<typeof CategoryItem>;
export type AppLatestGroup = Static<typeof GroupItem>;
export type AppSettings = Static<typeof SettingsItem>;
