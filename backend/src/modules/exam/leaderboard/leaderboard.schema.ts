import { Type, type Static } from "@sinclair/typebox";
import { BaseResponseSchema } from "../../../types/response.ts";

export const LeaderboardItem = Type.Object({
  rank: Type.Number(),
  userId: Type.String({ format: "uuid" }),
  name: Type.Union([Type.String(), Type.Null()]),
  averageScore: Type.String(),
  totalExamsTaken: Type.Number(),
});

export const LeaderboardBody = Type.Object({
  limit: Type.Optional(Type.Number({ default: 50, minimum: 1, maximum: 100 })),
});

export const LeaderboardResponse = Type.Intersect([
  BaseResponseSchema,
  Type.Object({ data: Type.Array(LeaderboardItem) }),
]);

export type LeaderboardData = Static<typeof LeaderboardItem>;
export type LeaderboardParams = Static<typeof LeaderboardBody>;
