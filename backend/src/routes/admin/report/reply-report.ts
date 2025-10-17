import type {FastifyPluginAsyncTypebox} from "@fastify/type-provider-typebox";
import {withErrorHandler} from "../../../utils/withErrorHandler.ts";
import {db} from "../../../db/index.ts";
import {
  userReports,
  type SchemaUserReportInsert,
  EnumReportStatus
} from "../../../db/schema/index.ts";
import {Type} from "@sinclair/typebox";
import {eq} from "drizzle-orm";
import type {FastifyReply, FastifyRequest} from "fastify";

const protectedRoute: FastifyPluginAsyncTypebox = async (app) => {
  app.route({
    url: '/:id/reply',
    method: 'PATCH',
    schema: {
      tags: ['Admin/Report'],
      summary: 'Reply to a user report',
      description: 'Update the status of a report and add resolution notes',
      params: Type.Object({
        id: Type.String({ format: 'uuid', description: 'Report ID' })
      }),
      body: Type.Object({
        status: Type.Enum(EnumReportStatus, {
          description: 'New status for the report'
        }),
        resolutionNotes: Type.Optional(Type.String({
          maxLength: 2000,
          description: 'Notes about the resolution'
        }))
      }),
      response: {
        200: Type.Object({
          success: Type.Boolean(),
          message: Type.String(),
          data: Type.Object({
            id: Type.String({ format: 'uuid' }),
            status: Type.String(),
            resolvedAt: Type.Optional(Type.String({ format: 'date-time' })),
            resolvedBy: Type.Optional(Type.String({ format: 'uuid' }))
          })
        }),
        400: Type.Object({
          success: Type.Boolean(),
          message: Type.String()
        }),
        404: Type.Object({
          success: Type.Boolean(),
          message: Type.String()
        }),
        409: Type.Object({
          success: Type.Boolean(),
          message: Type.String()
        }),
        500: Type.Object({
          success: Type.Boolean(),
          message: Type.String(),
        })
      }
    },
    handler: withErrorHandler(
      async (req: FastifyRequest, reply: FastifyReply) => {
        const { id } = req.params as { id: string };
        const { status, resolutionNotes } = req.body as {
          status: keyof typeof EnumReportStatus,
          resolutionNotes?: string
        };

        // Validate that the report exists
        const [report] = await db
          .select()
          .from(userReports)
          .where(eq(userReports.id, id))
          .limit(1);

        if (!report) {
          return reply.status(404).send({
            success: false,
            message: 'Report not found'
          });
        }

        // Prepare update data
        const updateData: Partial<SchemaUserReportInsert> = {
          status,
          updatedAt: new Date()
        };

        // If the status is a "final" status, set resolved fields
        const finalStatuses = ['resolved', 'dismissed', 'violate', 'duplicate'];
        if (finalStatuses.includes(status)) {
          updateData.resolvedAt = new Date();
          updateData.resolvedBy = req.session.user.id;
        }

        // Add resolution notes if provided
        if (resolutionNotes) {
          updateData.resolutionNotes = resolutionNotes;
        }

        // Update the report
        const [updatedReport] = await db
          .update(userReports)
          .set(updateData)
          .where(eq(userReports.id, id))
          .returning({
            id: userReports.id,
            status: userReports.status,
            resolvedAt: userReports.resolvedAt,
            resolvedBy: userReports.resolvedBy
          });

        return {
          success: true,
          message: 'Report updated successfully',
          data: {
            id: updatedReport.id,
            status: updatedReport.status,
            resolvedAt: updatedReport.resolvedAt?.toISOString(),
            resolvedBy: updatedReport.resolvedBy
          }
        };
      },
      409
    ),
  });
}
export default protectedRoute;