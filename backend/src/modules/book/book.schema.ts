import { Type, type Static } from "@sinclair/typebox";
import { BaseResponseSchema } from "../../types/response.ts";

export const BookInfoQuery = Type.Object({
  bookId: Type.Number(),
  page: Type.Number(),
});

export const BookInfoResponseItem = Type.Object({
  id: Type.String({ format: "uuid" }),
  bookId: Type.Number(),
  title: Type.String(),
  description: Type.Optional(Type.String()),
  author: Type.Optional(Type.String()),
  publishedYear: Type.String(),
  totalPages: Type.Number(),
  size: Type.Number(),
  status: Type.String(),
  pdf: Type.String(),
});

export const BookInfoResponse = Type.Intersect([
  BaseResponseSchema,
  Type.Object({
    data: BookInfoResponseItem,
  }),
]);

export type BookInfoData = Static<typeof BookInfoResponseItem>;
