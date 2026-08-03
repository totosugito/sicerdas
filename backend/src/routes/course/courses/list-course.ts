import type { FastifyPluginAsyncTypebox } from "@fastify/type-provider-typebox";
import type { FastifyReply, FastifyRequest } from "fastify";
import { ErrorResponseSchema } from "../../../types/response.ts";
import {
  CourseListQuery,
  CourseListResponse,
  userListCourseService,
} from "../../../modules/course/courses/index.ts";
import { EnumContentType } from "../../../db/schema/enum/enum-app.ts";
import { fromNodeHeaders } from "better-auth/node";
import { getAuthInstance } from "../../../decorators/auth.decorator.ts";

const publicListRoute: FastifyPluginAsyncTypebox = async (app) => {
  app.route({
    url: "/list",
    method: "POST",
    schema: {
      tags: ["Public Courses"],
      summary: "List published courses",
      body: CourseListQuery,
      response: {
        200: CourseListResponse,
        "4xx": ErrorResponseSchema,
      },
    },
    handler: async function handler(
      req: FastifyRequest<{ Body: typeof CourseListQuery.static }>,
      reply: FastifyReply,
    ) {
      const latestVersionId = app.versionCache.get(EnumContentType.COURSE);
      const session = await getAuthInstance(app).api.getSession({
        headers: fromNodeHeaders(req.headers),
      });
      const result = await userListCourseService(
        { ...req.body, versionId: req.body.versionId ?? (latestVersionId ?? undefined) },
        session?.user?.id,
      );

      if (!result.success) {
        const message = req.t(result.errorKey!);
        return reply.badRequest(message);
      }

      return reply.status(200).send({
        success: true,
        message: req.t(($) => $.course.courses.list.success),
        data: result.data!,
      });
    },
  });
};

export default publicListRoute;
