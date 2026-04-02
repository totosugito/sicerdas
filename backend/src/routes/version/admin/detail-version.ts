import type { FastifyPluginAsyncTypebox } from "@fastify/type-provider-typebox";
import type { FastifyReply, FastifyRequest } from "fastify";
import { Type } from "@sinclair/typebox";
import { appVersion } from "../../../db/schema/app/app-version.ts";
import { db } from "../../../db/db-pool.ts";
import { eq } from "drizzle-orm";
import { withErrorHandler } from "../../../utils/withErrorHandler.ts";
import { getTypedI18n } from "../../../utils/i18n-typed.ts";

const DetailVersionParams = Type.Object({
  id: Type.Number(),
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

const DetailVersionResponse = Type.Object({
  success: Type.Boolean(),
  message: Type.String(),
  data: VersionResponseItem,
});

const detailVersionRoute: FastifyPluginAsyncTypebox = async (app) => {
  app.route({
    url: "/detail/:id",
    method: "GET",
    schema: {
      tags: ["Version"],
      params: DetailVersionParams,
      response: {
        200: DetailVersionResponse,
        "4xx": Type.Object({
          success: Type.Boolean({ default: false }),
          message: Type.String(),
        }),
        "5xx": Type.Object({
          success: Type.Boolean({ default: false }),
          message: Type.String(),
        }),
      },
    },
    handler: withErrorHandler(async function handler(
      request: FastifyRequest<{ Params: typeof DetailVersionParams.static }>,
      reply: FastifyReply,
    ): Promise<typeof DetailVersionResponse.static> {
      const { t } = getTypedI18n(request);
      const { id } = request.params;

      const item = await db.query.appVersion.findFirst({
        where: eq(appVersion.id, id),
      });

      if (!item) {
        return reply.notFound(t(($) => $.version.notFound));
      }

      return reply.status(200).send({
        success: true,
        message: t(($) => $.version.detailSuccess),
        data: {
          ...item,
          note: item.note as Record<string, unknown>[],
          extra: (item.extra as Record<string, unknown>) || {},
          createdAt: item.createdAt?.toISOString(),
          updatedAt: item.updatedAt?.toISOString(),
        },
      });
    }),
  });
};

export default detailVersionRoute;
