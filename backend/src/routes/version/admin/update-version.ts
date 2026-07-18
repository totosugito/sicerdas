import type { FastifyPluginAsyncTypebox } from "@fastify/type-provider-typebox";
import type { FastifyReply, FastifyRequest } from "fastify";
import { Type } from "@sinclair/typebox";
import { EnumContentStatus } from "../../../db/schema/enum/enum-app.ts";
import { updateVersionService } from "../../../modules/version/services/update-version.service.ts";
import { UpdateVersionBody, VersionResponse } from "../../../modules/version/index.ts";
import { ErrorResponseSchema } from "../../../types/response.ts";

const UpdateVersionParams = Type.Object({
  id: Type.Number(),
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
        200: VersionResponse,
        "4xx": ErrorResponseSchema,
      },
    },
    handler: async function handler(
      request: FastifyRequest<{
        Params: typeof UpdateVersionParams.static;
        Body: typeof UpdateVersionBody.static;
      }>,
      reply: FastifyReply,
    ): Promise<typeof VersionResponse.static> {
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
