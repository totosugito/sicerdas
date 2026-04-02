import type { FastifyPluginAsyncTypebox } from "@fastify/type-provider-typebox";
import type { FastifyReply, FastifyRequest } from "fastify";
import { Type } from "@sinclair/typebox";
import { appVersion as tableAppVersion } from "../../../db/schema/app/app-version.ts";
import { db } from "../../../db/db-pool.ts";
import { eq } from "drizzle-orm";
import { withErrorHandler } from "../../../utils/withErrorHandler.ts";
import { getTypedI18n } from "../../../utils/i18n-typed.ts";
import { EnumContentStatus } from "../../../db/schema/enum/enum-app.ts";

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
      request: FastifyRequest<{
        Params: typeof UpdateVersionParams.static;
        Body: typeof UpdateVersionBody.static;
      }>,
      reply: FastifyReply,
    ): Promise<typeof UpdateVersionResponse.static> {
      const { t } = getTypedI18n(request);
      const { id } = request.params;
      const { appVersion: appVer, dbVersion: dbVer, status, name, note, extra } = request.body;

      const existingVersion = await db.query.appVersion.findFirst({
        where: eq(tableAppVersion.id, id),
      });

      if (!existingVersion) {
        return reply.notFound(t(($) => $.version.notFound));
      }

      const [updatedVersion] = await db
        .update(tableAppVersion)
        .set({
          appVersion: appVer !== undefined ? appVer : undefined,
          dbVersion: dbVer !== undefined ? dbVer : undefined,
          status: status !== undefined ? status : undefined,
          name: name !== undefined ? name : undefined,
          note: note !== undefined ? note : undefined,
          extra: extra !== undefined ? extra : undefined,
          updatedAt: new Date(),
        })
        .where(eq(tableAppVersion.id, id))
        .returning();

      // Refresh cache if it is now published or changed while published
      if (updatedVersion.status === EnumContentStatus.PUBLISHED) {
        await app.versionCache.refresh(updatedVersion.dataType);
      }

      return reply.status(200).send({
        success: true,
        message: t(($) => $.version.update.success),
        data: {
          ...updatedVersion,
          note: updatedVersion.note || "",
          extra: (updatedVersion.extra as Record<string, unknown>) || {},
          createdAt: updatedVersion.createdAt?.toISOString() || "",
          updatedAt: updatedVersion.updatedAt?.toISOString() || "",
        },
      });
    }),
  });
};

export default updateVersionRoute;
