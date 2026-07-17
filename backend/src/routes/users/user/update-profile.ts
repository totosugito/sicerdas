import type { FastifyPluginAsyncTypebox } from "@fastify/type-provider-typebox";
import { Type } from "@fastify/type-provider-typebox";
import type { UploadedFile } from "../../../types/file.ts";
import { updateProfileService } from "../../../modules/user/index.ts";
import { BaseResponseSchema, ErrorResponseSchema } from "../../../types/response.ts";

const UpdateProfileResponseSchema = Type.Intersect([
  BaseResponseSchema,
  Type.Object({
    data: Type.Object({
      id: Type.String({ format: "uuid" }),
      email: Type.String({ format: "email" }),
      name: Type.Union([Type.String(), Type.Null()]),
      image: Type.Union([Type.String({ format: "uri" }), Type.Null()]),
      emailVerified: Type.Boolean(),
      school: Type.Union([Type.String(), Type.Null()]),
      grade: Type.Union([Type.String(), Type.Null()]),
      phone: Type.Union([Type.String(), Type.Null()]),
      address: Type.Union([Type.String(), Type.Null()]),
      bio: Type.Union([Type.String(), Type.Null()]),
      educationLevel: Type.Union([Type.String(), Type.Null()]),
      dateOfBirth: Type.Union([Type.String(), Type.Null()]),
      providerId: Type.String(),
      extra: Type.Object({}, { additionalProperties: true }),
      createdAt: Type.String({ format: "date-time" }),
      updatedAt: Type.String({ format: "date-time" }),
    }),
  }),
]);

const protectedRoute: FastifyPluginAsyncTypebox = async (app) => {
  app.route({
    url: "/update-profile",
    method: "PUT",
    schema: {
      tags: ["User"],
      summary: "Update user profile",
      description:
        "Update the current user's profile information. Expected multipart/form-data fields: name, school, grade, phone, address, bio, dateOfBirth, image (all optional). Invalid dateOfBirth formats will be ignored.",
      consumes: ["multipart/form-data"],
      response: {
        200: UpdateProfileResponseSchema,
        "4xx": ErrorResponseSchema,
      },
    },
    handler: async (req, reply) => {
      // Get user ID from session (verified by user.hook.ts)
      const userId = req.session.user.id;

      // Initialize variables for form data
      const updateData: {
        name?: string;
        school?: string;
        grade?: string;
        phone?: string;
        address?: string;
        bio?: string;
        dateOfBirth?: string;
        extra?: string;
        educationLevel?: string;
      } = {};

      let imageFile: UploadedFile | null = null;

      // Parse multipart form data
      const parts = req.parts();
      for await (const part of parts) {
        if (part.type === "field") {
          updateData[part.fieldname as keyof typeof updateData] = part.value as string;
        } else if (part.type === "file" && part.fieldname === "image") {
          imageFile = {
            buffer: await part.toBuffer(),
            filename: part.filename,
            mimetype: part.mimetype,
          };
        }
      }

      // Remove any restricted fields that might have been sent
      const restrictedFields = [
        "id",
        "email",
        "password",
        "role",
        "banned",
        "banReason",
        "image",
        "tierId",
      ];
      const safeUpdateData = Object.entries(updateData)
        .filter(([key]) => !restrictedFields.includes(key))
        .reduce(
          (obj, [key, value]) => {
            obj[key] = value;
            return obj;
          },
          {} as Record<string, any>,
        );

      const result = await updateProfileService({
        id: userId,
        file: imageFile || undefined,
        ...safeUpdateData,
      });

      if (!result.success || !result.data) {
        const message = req.t(result.errorKey!);
        return reply.badRequest(message);
      }

      return reply.status(200).send({
        success: true,
        message: req.t(($) => $.user.userUpdatedSuccessfully),
        data: result.data,
      });
    },
  });
};

export default protectedRoute;
