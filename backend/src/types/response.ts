import { Type } from "@sinclair/typebox";
import type { Static } from "@sinclair/typebox";
import type { AppLocale } from "../locales/locales.ts";

export const BaseResponseSchema = Type.Object({
  success: Type.Boolean(),
  message: Type.String(),
});

export type BaseResponse = Static<typeof BaseResponseSchema>;

export const ErrorResponseSchema = Type.Object({
  success: Type.Boolean({ default: false }),
  message: Type.String(),
});

export type ErrorResponse = Static<typeof ErrorResponseSchema>;

export const PaginationMetaSchema = Type.Object({
  total: Type.Number(),
  page: Type.Number(),
  limit: Type.Number(),
  totalPages: Type.Number(),
});

export type PaginationMeta = Static<typeof PaginationMetaSchema>;

export interface ServiceResponse {
  success: boolean;
  statusCode?: 400 | 401 | 403 | 404 | 409 | 500;
  errorKey?: (locale: AppLocale) => any;
}
