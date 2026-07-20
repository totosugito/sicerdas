import type { FastifyPluginAsyncTypebox } from "@fastify/type-provider-typebox";
import type { FastifyReply, FastifyRequest } from "fastify";
import { EnumContentStatus } from "../../../db/schema/enum/enum-app.ts";
import { createVersionService } from "../../../modules/version/services/admin/create-version.service.ts";
import { CreateVersionBody, VersionResponse } from "../../../modules/version/index.ts";
import { ErrorResponseSchema } from "../../../types/response.ts";

const createVersionRoute: FastifyPluginAsyncTypebox = async (app) => {
  app.route({
    url: "/create",
    method: "POST",
    schema: {
      tags: ["Version"],
      body: CreateVersionBody,
      response: {
        201: VersionResponse,
        "4xx": ErrorResponseSchema,
      },
    },
    handler: async function handler(
      request: FastifyRequest<{ Body: typeof CreateVersionBody.static }>,
      reply: FastifyReply,
    ): Promise<typeof VersionResponse.static> {
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
