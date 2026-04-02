import type { FastifyPluginAsyncTypebox } from "@fastify/type-provider-typebox";
import type { FastifyReply, FastifyRequest } from "fastify";
import { Type } from "@sinclair/typebox";
import { appVersion as tableAppVersion } from "../../../db/schema/app/app-version.ts";
import { db } from "../../../db/db-pool.ts";
import { and, eq } from "drizzle-orm";
import { withErrorHandler } from "../../../utils/withErrorHandler.ts";
import { getTypedI18n } from "../../../utils/i18n-typed.ts";
import { EnumContentType, EnumContentStatus } from "../../../db/schema/enum/enum-app.ts";

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

const CreateVersionResponse = Type.Object({
  success: Type.Boolean(),
  message: Type.String(),
  data: VersionResponseItem,
});

const createVersionRoute: FastifyPluginAsyncTypebox = async (app) => {
  app.route({
    url: "/create",
    method: "POST",
    schema: {
      tags: ["Version"],
      body: CreateVersionBody,
      response: {
        201: CreateVersionResponse,
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
      request: FastifyRequest<{ Body: typeof CreateVersionBody.static }>,
      reply: FastifyReply,
    ): Promise<typeof CreateVersionResponse.static> {
      const { t } = getTypedI18n(request);
      const {
        appVersion: appVer,
        dbVersion: dbVer,
        dataType,
        status,
        name,
        note,
        extra,
      } = request.body;

      const existingVersion = await db.query.appVersion.findFirst({
        where: and(
          eq(tableAppVersion.appVersion, appVer),
          eq(tableAppVersion.dbVersion, dbVer),
          eq(tableAppVersion.dataType, dataType),
        ),
      });

      if (existingVersion) {
        return reply.badRequest(t(($) => $.version.create.exists));
      }

      const [newVersion] = await db
        .insert(tableAppVersion)
        .values({
          appVersion: appVer,
          dbVersion: dbVer,
          dataType,
          status: status || EnumContentStatus.UNPUBLISHED,
          name,
          note: note || [],
          extra: extra || {},
        })
        .returning();

      // Refresh cache if published
      if (newVersion.status === EnumContentStatus.PUBLISHED) {
        await app.versionCache.refresh(newVersion.dataType);
      }

      return reply.status(201).send({
        success: true,
        message: t(($) => $.version.create.success),
        data: {
          ...newVersion,
          note: newVersion.note as Record<string, unknown>[],
          extra: (newVersion.extra as Record<string, unknown>) || {},
          createdAt: newVersion.createdAt?.toISOString(),
          updatedAt: newVersion.updatedAt?.toISOString(),
        },
      });
    }),
  });
};

export default createVersionRoute;
