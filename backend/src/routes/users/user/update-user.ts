import type { FastifyPluginAsyncTypebox } from "@fastify/type-provider-typebox";
import { Type } from "@fastify/type-provider-typebox";
import type { UploadedFile } from "../../../types/file.ts";
import { updateUserService } from "../../../modules/user/index.ts";
import { BaseResponseSchema, ErrorResponseSchema } from "../../../types/response.ts";

const UpdateUserResponse = Type.Intersect([
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
    url: "/update",
    method: "PUT",
    schema: {
      tags: ["User"],
      summary: "Update user profile",
      description:
        "Update the current user's profile information. Expected multipart/form-data fields: name, school, grade, phone, address, bio, dateOfBirth, image (all optional). Invalid dateOfBirth formats will be ignored.",
      consumes: ["multipart/form-data"],
      response: {
        200: UpdateUserResponse,
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
            if (key === "dateOfBirth") {
              const dateRegex = /^\d{4}-\d{2}-\d{2}$/;
              if (dateRegex.test(value)) {
                obj[key] = new Date(value as string);
              } else {
                obj[key] = null;
              }
            } else if (key === "extra") {
              try {
                obj[key] = JSON.parse(value as string);
              } catch (e) {
                console.warn("Failed to parse extra field:", e);
              }
            } else {
              obj[key] = value;
            }
            return obj;
          },
          {} as Record<string, any>,
        );

      // If no valid updates are provided and no image was uploaded, return early
      if (Object.keys(safeUpdateData).length === 0 && !imageFile) {
        return reply.badRequest(req.t(($) => $.user.noValidUpdateData));
      }

      // Separate user and profile data
      const userFields = ["name"];
      const profileFields = [
        "school",
        "grade",
        "phone",
        "address",
        "bio",
        "dateOfBirth",
        "extra",
        "educationLevel",
      ];

      const userData: Record<string, any> = {};
      const profileData: Record<string, any> = {};

      Object.entries(safeUpdateData).forEach(([key, value]) => {
        if (userFields.includes(key)) {
          userData[key] = value;
        } else if (profileFields.includes(key)) {
          profileData[key] = value;
        }
      });

      const result = await updateUserService({
        id: userId,
        name: userData.name,
        file: imageFile || undefined,
        profile: Object.keys(profileData).length > 0 ? profileData : undefined,
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
