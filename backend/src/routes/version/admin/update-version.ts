import type { FastifyPluginAsyncTypebox } from "@fastify/type-provider-typebox";
import type { FastifyReply, FastifyRequest } from "fastify";
import { Type } from "@sinclair/typebox";
import { EnumContentStatus } from "../../../db/schema/enum/enum-app.ts";
import { updateVersionService } from "../../../modules/version/services/update-version.service.ts";
import { ErrorResponseSchema } from "../../../types/response.ts";

const UpdateVersionParams = Type.Object({
  id: Type.Number(),
});

const UpdateVersionBody = Type.Object({
  appVersion: Type.Optional(Type.Number()),
  dbVersion: Type.Optional(Type.Number()),
  status: Type.Optional(Type.Enum(EnumContentStatus)),
  name: Type.Optional(Type.String()),
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
  note: Type.Array(Type.Record(Type.String(), Type.Unknown())),
  extra: Type.Record(Type.String(), Type.Unknown()),
  createdAt: Type.String({ format: "date-time" }),
  updatedAt: Type.String({ format: "date-time" }),
});

const UpdateVersionResponse = Type.Object({
  success: Type.Boolean(),
  message: Type.String(),
  data: VersionResponseItem,
});

const updateVersionRoute: FastifyPluginAsyncTypebox = async (app) => {
  app.route({
    url: "/update/:id",
    method: "PUT",
    schema: {
      tags: ["Version"],
      params: UpdateVersionParams,
      body: UpdateVersionBody,
      response: {
        200: UpdateVersionResponse,
        "4xx": ErrorResponseSchema,
        "5xx": ErrorResponseSchema,
      },
    },
    handler: async function handler(
      request: FastifyRequest<{
        Params: typeof UpdateVersionParams.static;
        Body: typeof UpdateVersionBody.static;
      }>,
      reply: FastifyReply,
    ): Promise<typeof UpdateVersionResponse.static> {
      const { id } = request.params;
      const { appVersion: appVer, dbVersion: dbVer, status, name, note, extra } = request.body;

      const result = await updateVersionService(id, {
        appVersion: appVer,
        dbVersion: dbVer,
        status,
        name,
        note,
        extra,
      });

      if (!result.success || !result.data) {
        return reply.notFound(request.t(result.errorKey!));
      }

      // Refresh cache if it is now published or changed while published
      if (result.data.status === EnumContentStatus.PUBLISHED) {
        await app.versionCache.refresh(result.data.dataType as any);
      }

      return reply.status(200).send({
        success: true,
        message: request.t(($) => $.version.update.success),
        data: result.data,
      });
    },
  });
};

export default updateVersionRoute;
