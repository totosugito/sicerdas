import type { FastifyPluginAsyncTypebox } from "@fastify/type-provider-typebox";
import type { FastifyReply, FastifyRequest } from "fastify";
import { Type } from "@sinclair/typebox";
import { ErrorResponseSchema } from "../../../types/response.ts";
import { CourseUserDetailResponse } from "../../../modules/course/courses/courses.schema.ts";
import { userDetailCourseService } from "../../../modules/course/courses/index.ts";
import { fromNodeHeaders } from "better-auth/node";
import { getAuthInstance } from "../../../decorators/auth.decorator.ts";

const ParamsSchema = Type.Object({
  id: Type.String({ format: "uuid" }),
});

const publicDetailRoute: FastifyPluginAsyncTypebox = async (app) => {
  app.route({
    url: "/detail/:id",
    method: "GET",
    schema: {
      tags: ["Public Courses"],
      summary: "Get published course preview details",
      params: ParamsSchema,
      response: {
        200: CourseUserDetailResponse,
        "4xx": ErrorResponseSchema,
      },
    },
    handler: async function handler(
      req: FastifyRequest<{ Params: typeof ParamsSchema.static }>,
      reply: FastifyReply,
    ) {
      const session = await getAuthInstance(app).api.getSession({
        headers: fromNodeHeaders(req.headers),
      });

      const result = await userDetailCourseService(req.params.id, session?.user?.id);

      if (!result.success) {
        const message = req.t(result.errorKey!);
        return reply.badRequest(message);
      }

      const course = result.data!;
      // Filter out admin/metadata fields
      const publicDetails = {
        id: course.id,
        courseCode: course.courseCode,
        courseName: course.courseName,
        courseDescription: course.courseDescription,
        whatYouWillLearn: course.whatYouWillLearn,
        price: course.price,
        thumbnail: course.thumbnail,
        category: course.category,
        grade: course.grade,
        totalChapters: course.totalChapters ?? 0,
        totalLectures: course.totalLectures ?? 0,
        enrolledCount: course.enrolledCount ?? 0,
        totalRatings: course.totalRatings ?? 0,
        averageRating: course.averageRating ?? 5,
        progress: course.enrollmentStatus
          ? {
              enrollmentStatus: course.enrollmentStatus,
              completedLectures: course.completedLectures ?? 0,
              progressPercentage: course.progressPercentage ?? 0,
            }
          : null,
      };

      return reply.status(200).send({
        success: true,
        message: req.t(($) => $.course.courses.detail.success),
        data: publicDetails,
      });
    },
  });
};

export default publicDetailRoute;
