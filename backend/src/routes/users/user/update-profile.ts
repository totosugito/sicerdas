import type { FastifyPluginAsyncTypebox } from "@fastify/type-provider-typebox";
import type { UploadedFile } from "../../../types/file.ts";
import { updateProfileService, UpdateProfileResponseSchema, type BaseUpdateProfileData } from "../../../modules/users/index.ts";
import { ErrorResponseSchema } from "../../../types/response.ts";
import type { FastifyReply, FastifyRequest } from "fastify";

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
    handler: async (request: FastifyRequest, reply: FastifyReply) => {
      // Get user ID from session (verified by user.hook.ts)
      const userId = request.session.user.id;

      // Initialize variables for form data
      const updateData: BaseUpdateProfileData = {};

      let imageFile: UploadedFile | null = null;

      // Parse multipart form data
      const parts = request.parts();
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
        const message = request.t(result.errorKey!);
        return reply.badRequest(message);
      }

      return reply.status(200).send({
        success: true,
        message: request.t(($) => $.user.userUpdatedSuccessfully),
        data: result.data,
      });
    },
  });
};

export default protectedRoute;
