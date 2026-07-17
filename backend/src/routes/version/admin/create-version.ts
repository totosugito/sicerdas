import type { FastifyPluginAsyncTypebox } from "@fastify/type-provider-typebox";
import type { FastifyReply, FastifyRequest } from "fastify";
import { Type } from "@sinclair/typebox";
import { EnumContentType, EnumContentStatus } from "../../../db/schema/enum/enum-app.ts";
import { createVersionService } from "../../../modules/version/services/create-version.service.ts";
import { BaseResponseSchema, ErrorResponseSchema } from "../../../types/response.ts";

const CreateVersionBody = Type.Object({
  appVersion: Type.Number(),
  dbVersion: Type.Number(),
  dataType: Type.Enum(EnumContentType),
  status: Type.Optional(Type.Enum(EnumContentStatus)),
  name: Type.String({ minLength: 1 }),
  note: Type.Optional(Type.Array(Type.Record(Type.String(), Type.Unknown()))),
  extra: Type.Optional(Type.Record(Type.String(), Type.Unknown())),
});

const VersionResponseItem = Type.Object({
  id: Type.Number(),
  appVersion: Type.Number(),
  dbVersion: Type.Number(),
  dataType: Type.String(),
  status: Type.String(),
  name: Type.String(),
  note: Type.Optional(Type.Array(Type.Record(Type.String(), Type.Unknown()))),
  extra: Type.Record(Type.String(), Type.Unknown()),
  createdAt: Type.String({ format: "date-time" }),
  updatedAt: Type.String({ format: "date-time" }),
});

const CreateVersionResponse = Type.Intersect([
  BaseResponseSchema,
  Type.Object({
    data: VersionResponseItem,
  }),
]);

const createVersionRoute: FastifyPluginAsyncTypebox = async (app) => {
  app.route({
    url: "/create",
    method: "POST",
    schema: {
      tags: ["Version"],
      body: CreateVersionBody,
      response: {
        201: CreateVersionResponse,
        "4xx": ErrorResponseSchema,
      },
    },
    handler: async function handler(
      request: FastifyRequest<{ Body: typeof CreateVersionBody.static }>,
      reply: FastifyReply,
    ): Promise<typeof CreateVersionResponse.static> {
      const {
        appVersion: appVer,
        dbVersion: dbVer,
        dataType,
        status,
        name,
        note,
        extra,
      } = request.body;

      const result = await createVersionService({
        appVersion: appVer,
        dbVersion: dbVer,
        dataType,
        status,
        name,
        note,
        extra,
      });

      if (!result.success || !result.data) {
        return reply.badRequest(request.t(result.errorKey!));
      }

      // Refresh cache if published
      if (result.data.status === EnumContentStatus.PUBLISHED) {
        await app.versionCache.refresh(result.data.dataType as any);
      }

      return reply.status(201).send({
        success: true,
        message: request.t(($) => $.version.create.success),
        data: result.data,
      });
    },
  });
};

export default createVersionRoute;
