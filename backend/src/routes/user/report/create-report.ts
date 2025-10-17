import type {FastifyPluginAsyncTypebox} from "@fastify/type-provider-typebox";
import {withErrorHandler} from "../../../utils/withErrorHandler.ts";
import {db} from "../../../db/index.ts";
import {
  userReports,
  type SchemaUserReportInsert,
  books, EnumDataType, EnumReportReason
} from "../../../db/schema/index.ts";
import {Type} from "@sinclair/typebox";
import {eq} from "drizzle-orm";
import type {FastifyReply, FastifyRequest} from "fastify";

const protectedRoute: FastifyPluginAsyncTypebox = async (app) => {
  app.route({
    url: '/create',
    method: 'POST',
    schema: {
      tags: ['User/Report'],
      summary: '',
      description: 'Create a new report for a book, test, or course',
      body: Type.Object({
        dataType: Type.String({
          description: 'Type of content being reported (book, test, or course)'
        }),
        referenceId: Type.Integer({
          description: 'ID of the content being reported'
        }),
        reason: Type.String({
          description: 'Reason for the report'
        }),
        description: Type.Optional(Type.String({
          maxLength: 2000,
          description: 'Optional detailed description for the report'
        }))
      }),
      response: {
        200: Type.Object({
          success: Type.Boolean(),
          message: Type.String(),
          data: Type.Object({
            id: Type.String({ format: 'uuid' }),
            dataType: Type.String(),
            referenceId: Type.Integer()
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
        const { dataType, referenceId, reason, description = '' } = req.body as SchemaUserReportInsert & {
          dataType: string
        };

        // Validate data type
        if (dataType && !Object.values(EnumDataType).includes(dataType as keyof typeof EnumDataType)) {
          return reply.status(400).send({
            success: false,
            message: 'Invalid data type. Must be one of: book, test, course'
          });
        }

        // Validate reason
        const validReasonValues = Object.values(EnumReportReason);
        if (!validReasonValues.includes(reason as any)) {
          return reply.status(400).send({
            success: false,
            message: `Invalid reason. Must be one of: ${validReasonValues.join(', ')}`
          });
        }

        // Validate that the referenceId exists for the given dataType
        let exists = false;
        switch (dataType) {
          case 'book':
            // For books, we need to check if a book with the given bookId exists
            const [book] = await db
              .select()
              .from(books)
              .where(eq(books.bookId, referenceId))
              .limit(1);
            exists = !!book;
            break;
          case 'test':
            // For now, we'll assume tests exist (implementation would depend on test schema)
            // This would be expanded when test schema is implemented
            exists = true;
            break;
          case 'course':
            // For now, we'll assume courses exist (implementation would depend on course schema)
            // This would be expanded when course schema is implemented
            exists = true;
            break;
        }

        if (!exists) {
          return reply.status(404).send({
            success: false,
            message: `The specified ${dataType} with ID ${referenceId} was not found`
          });
        }

        // Create the new report
        const [newReport] = await db.insert(userReports)
          .values({
            reporterId: req.session.user.id, // Get user ID from session
            dataType,
            referenceId,
            reason,
            description,
            status: 'pending', // Always default to 'pending'
            createdAt: new Date(),
            updatedAt: new Date()
          })
          .returning({
            id: userReports.id,
            dataType: userReports.dataType,
            referenceId: userReports.referenceId,
            createdAt: userReports.createdAt
          });

        return {
          success: true,
          message: 'Report created successfully',
          data: {
            id: newReport.id,
            dataType: newReport.dataType,
            referenceId: newReport.referenceId
          }
        };
      },
      409
    ),
  });
}
export default protectedRoute;