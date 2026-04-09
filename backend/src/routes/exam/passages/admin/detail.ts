import type { FastifyPluginAsyncTypebox } from "@fastify/type-provider-typebox";
import type { FastifyReply, FastifyRequest } from "fastify";
import { Type } from "@sinclair/typebox";
import { db } from "../../../../db/db-pool.ts";
import { examPassages } from "../../../../db/schema/exam/passages.ts";
import { eq } from "drizzle-orm";
import { withErrorHandler } from "../../../../utils/withErrorHandler.ts";
import { getTypedI18n } from "../../../../utils/i18n-typed.ts";
import { resolveBlockNoteUrls } from "../../../../utils/blocknote-utils.ts";

const DetailPassageParams = Type.Object({
  id: Type.String({ format: "uuid" }),
});

const PassageResponseItem = Type.Object({
  id: Type.String({ format: "uuid" }),
  title: Type.Union([Type.String(), Type.Null()]),
  content: Type.Array(Type.Record(Type.String(), Type.Unknown())),
  isActive: Type.Boolean(),
  createdAt: Type.String({ format: "date-time" }),
  updatedAt: Type.String({ format: "date-time" }),
  subjectId: Type.String({ format: "uuid" }),
});

const DetailPassageResponse = Type.Object({
  success: Type.Boolean(),
  message: Type.String(),
  data: PassageResponseItem,
});

const detailPassageRoute: FastifyPluginAsyncTypebox = async (app) => {
  app.route({
    url: "/detail/:id",
    method: "GET",
    schema: {
      tags: ["Admin Exam Passages"],
      params: DetailPassageParams,
      response: {
        200: DetailPassageResponse,
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
      request: FastifyRequest<{ Params: typeof DetailPassageParams.static }>,
      reply: FastifyReply,
    ) {
      const { t } = getTypedI18n(request);
      const { id } = request.params;

      const passage = await db.query.examPassages.findFirst({
        where: eq(examPassages.id, id),
      });

      if (!passage) {
        return reply.notFound(t(($) => $.exam.passages.update.notFound));
      }

      return reply.status(200).send({
        success: true,
        message: t(($) => $.exam.passages.list.success),
        data: {
          ...passage,
          content: resolveBlockNoteUrls(passage.content as Record<string, unknown>[]),
          createdAt: passage.createdAt.toISOString(),
          updatedAt: passage.updatedAt.toISOString(),
        },
      });
    }),
  });
};

export default detailPassageRoute;
