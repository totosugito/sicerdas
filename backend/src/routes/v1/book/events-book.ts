import type {FastifyPluginAsyncTypebox} from "@fastify/type-provider-typebox";
import {Type} from '@sinclair/typebox';
import {withErrorHandler} from "../../../utils/withErrorHandler.ts";
import {db} from "../../../db/index.ts";
import {books, bookEvents, EnumEventStatus, EnumDeviceType} from "../../../db/schema/index.ts";
import {and, eq, gte, or} from "drizzle-orm";
import {GUEST_EVENT_WINDOW_MS} from "../../../config/app-constant.ts";

const EventCreateRequest = Type.Object({
  id: Type.String({ format: 'uuid' }),
  eventType: Type.Optional(Type.Enum(EnumEventStatus, {description: 'Type of event (view, download, etc.)'})),
  sessionId: Type.Optional(Type.String({format: 'uuid', description: 'Session ID for anonymous tracking'})),
  deviceType: Type.Optional(Type.String({description: 'Type of device (mobile, desktop, etc.)'})),
  extra: Type.Optional(Type.Record(Type.String(), Type.Unknown(), {description: 'Additional event data'}))
});

const publicRoute: FastifyPluginAsyncTypebox = async (app) => {
  app.route({
    url: '/events',
    method: 'POST',
    schema: {
      tags: ['V1/Book'],
      summary: '',
      description: 'Track user interactions with books (views, downloads, etc.)',
      body: EventCreateRequest,
      response: {
        201: Type.Object({
          success: Type.Boolean(),
          data: Type.Object({
            id: Type.String({format: 'uuid'}),
            bookId: Type.Number(),
            eventType: Type.String(),
            timestamp: Type.String({format: 'date-time'})
          })
        }),
        400: Type.Object({
          success: Type.Boolean(),
          message: Type.String()
        }),
        404: Type.Object({
          success: Type.Boolean(),
          message: Type.String()
        })
      }
    },
    handler: withErrorHandler(async (req, reply) => {
      const { id: rawBookId, eventType, sessionId, deviceType = EnumDeviceType.mobile, extra } = req.body as typeof EventCreateRequest.static;
      const now = new Date();
      const timeWindowStart = new Date(now.getTime() - GUEST_EVENT_WINDOW_MS);
      const bookId = rawBookId;

      // Input validation
      if (!bookId) {
        return reply.status(400).send({
          success: false,
          message: 'Book ID is required'
        });
      }

      // Single transaction for both check and insert
      const result = await db.transaction(async (tx) => {
        // Set default event type if not provided or invalid
        const newEventType = eventType && Object.values(EnumEventStatus).includes(eventType as keyof typeof EnumEventStatus)
          ? eventType
          : EnumEventStatus.view;

        const userId = req.session?.user?.id;

        // Check for existing event (both user and guest) in a single query
        const [book, existingEvent] = await Promise.all([
          tx.query.books.findFirst({
            where: eq(books.id, bookId)
          }),
          tx.query.bookEvents.findFirst({
            where: and(
              eq(bookEvents.id, bookId),
              eq(bookEvents.eventType, newEventType as keyof typeof EnumEventStatus),
              or(
                ...(userId ? [eq(bookEvents.userId, userId)] : []),
                ...(sessionId ? [
                  eq(bookEvents.sessionId, sessionId),
                  gte(bookEvents.createdAt, timeWindowStart)
                ] : [])
              )
            ),
            columns: {
              id: true,
              bookId: true,
              eventType: true,
              createdAt: true
            }
          })
        ]);

        // Verify book exists
        if (!book) {
          return reply.status(404).send({
            success: false,
            message: 'Book not found'
          });
        }

        // Return existing event if found
        if (existingEvent) {
          return {
            status: 200,
            response: {
              success: true,
              data: {
                id: existingEvent.id,
                bookId: existingEvent.bookId,
                eventType: existingEvent.eventType,
                timestamp: existingEvent.createdAt.toISOString(),
                isDuplicate: true
              }
            }
          };
        }

        // Create new event
        const [event] = await tx.insert(bookEvents).values({
          bookId,
          eventType: newEventType,
          sessionId: userId ? undefined : sessionId, // Don't store sessionId for logged-in users
          ipAddress: req.ip,
          userAgent: req.headers['user-agent'],
          deviceType,
          extra,
          userId: userId || null
        }).returning();

        return {
          status: 200,
          response: {
            success: true,
            data: {
              id: event.id,
              bookId: event.bookId,
              eventType: event.eventType,
              timestamp: event.createdAt.toISOString(),
              isDuplicate: false
            }
          }
        };
      });

      return reply.status(result.status).send(result.response);
    }),
  });
};

export default publicRoute;
