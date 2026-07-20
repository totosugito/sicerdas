import { Type, type Static } from "@sinclair/typebox";
import { BaseResponseSchema } from "../../types/response.ts";

export const TierLimitsSchema = Type.Object({
  chatAi: Type.Optional(
    Type.Object({
      daily_messages: Type.Optional(Type.Number()),
      max_tokens: Type.Optional(Type.Number()),
    })
  ),
});

export const TierResponseItem = Type.Object({
  slug: Type.String(),
  name: Type.String(),
  price: Type.String(),
  currency: Type.String(),
  billingCycle: Type.String(),
  features: Type.Array(Type.String()),
  limits: TierLimitsSchema,
  isActive: Type.Boolean(),
  sortOrder: Type.Number(),
  isPopular: Type.Boolean(),
  createdAt: Type.String({ format: "date-time" }),
  updatedAt: Type.String({ format: "date-time" }),
});

export const TierResponse = Type.Intersect([
  BaseResponseSchema,
  Type.Object({
    data: TierResponseItem,
  }),
]);

const TierBaseFields = {
  name: Type.String({ minLength: 4 }),
  price: Type.String(),
  currency: Type.String(),
  billingCycle: Type.String(),
  features: Type.Array(Type.String()),
  limits: TierLimitsSchema,
  isActive: Type.Boolean(),
  sortOrder: Type.Number(),
  isPopular: Type.Boolean(),
};

export const CreateTierBody = Type.Object({
  slug: Type.String({ minLength: 4 }),
  name: TierBaseFields.name,
  price: TierBaseFields.price,
  currency: Type.String({ default: "USD" }),
  billingCycle: Type.String({ default: "monthly" }),
  features: Type.Array(Type.String(), { default: [] }),
  limits: Type.Object(TierLimitsSchema.properties, { default: {} }),
  isActive: Type.Boolean({ default: true }),
  sortOrder: Type.Number({ default: -1 }),
  isPopular: Type.Boolean({ default: false }),
});

export const UpdateTierBody = Type.Partial(Type.Object(TierBaseFields));

export type CreateTierParams = Static<typeof CreateTierBody>;
export type UpdateTierParams = Static<typeof UpdateTierBody>;
export type TierItem = Static<typeof TierResponseItem>;
