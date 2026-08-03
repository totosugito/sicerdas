import type { FastifyPluginAsyncTypebox } from "@fastify/type-provider-typebox";
import type { FastifyReply, FastifyRequest } from "fastify";
import { Type } from "@sinclair/typebox";
import { ErrorResponseSchema } from "../../../types/response.ts";
import { PublicCourseStructureResponse } from "../../../modules/course/courses/courses.schema.ts";
import { structureCourseService } from "../../../modules/course/courses/services/admin/structure-course.service.ts";

const ParamsSchema = Type.Object({
  id: Type.String({ format: "uuid" }),
});

const publicStructureRoute: FastifyPluginAsyncTypebox = async (app) => {
  app.route({
    url: "/structure/:id",
    method: "GET",
    schema: {
      tags: ["Public Courses"],
      summary: "Get course structure/syllabus preview",
      params: ParamsSchema,
      response: {
        200: PublicCourseStructureResponse,
        "4xx": ErrorResponseSchema,
      },
    },
    handler: async function handler(
      req: FastifyRequest<{ Params: typeof ParamsSchema.static }>,
      reply: FastifyReply,
    ) {
      const result = await structureCourseService(req.params.id);

      if (!result.success) {
        const message = req.t(result.errorKey!);
        return reply.badRequest(message);
      }

      // Map to simple structure response
      const publicData = (result.data || []).map((chapter: any) => ({
        id: chapter.id,
        chapterName: chapter.chapterName,
        courseId: chapter.courseId,
        position: chapter.position,
        lectures: (chapter.lectures || []).map((lecture: any) => ({
          id: lecture.id,
          title: lecture.title,
          description: lecture.description,
          chapterId: lecture.chapterId,
          type: lecture.type,
          position: lecture.position,
        })),
      }));

      return reply.status(200).send({
        success: true,
        message: req.t(($) => $.course.courses.detail.success),
        data: publicData,
      });
    },
  });
};

export default publicStructureRoute;
