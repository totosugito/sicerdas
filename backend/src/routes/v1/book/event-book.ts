import type { FastifyPluginAsyncTypebox } from "@fastify/type-provider-typebox";
import { Type } from '@sinclair/typebox';
import { withErrorHandler } from "../../../utils/withErrorHandler.ts";
import { db } from "../../../db/index.ts";
import { books, bookEventStats, userBookInteractions } from "../../../db/schema/book-schema.ts";
import { userEventHistory } from "../../../db/schema/web-schema.ts";
import { and, eq, sql } from "drizzle-orm";
import { randomUUID } from 'crypto';
import type { FastifyReply, FastifyRequest } from "fastify";
import { getAuthInstance } from "../../../decorators/auth.decorator.ts";
import { fromNodeHeaders } from "better-auth/node";

// Request schema for book events
const BookEventRequest = Type.Object({
  bookId: Type.String({ format: 'uuid' }),
  view: Type.Optional(Type.Boolean({ default: false })),
  download: Type.Optional(Type.Boolean({ default: false })),
  read: Type.Optional(Type.Boolean({ default: false })),
  like: Type.Optional(Type.Boolean({ default: false })),
  dislike: Type.Optional(Type.Boolean({ default: false })),
  share: Type.Optional(Type.Boolean({ default: false })),
  bookmark: Type.Optional(Type.Boolean({ default: false })),
  rating: Type.Optional(Type.Number({ minimum: 1, maximum: 5 })),
});

// Response schema
const BookEventResponse = Type.Object({
  success: Type.Boolean(),
  message: Type.String(),
});

const publicRoute: FastifyPluginAsyncTypebox = async (app) => {
  app.route({
    url: '/event',
    method: 'POST',
    schema: {
      tags: ['V1/Book'],
      summary: 'Track book events',
      description: 'Track user interactions with books (views, downloads, likes, etc.)',
      body: BookEventRequest,
      response: {
        200: BookEventResponse,
      },
    },
    handler: withErrorHandler(async function handler(
      req: FastifyRequest<{ Body: typeof BookEventRequest.static }>,
      reply: FastifyReply
    ): Promise<typeof BookEventResponse.static> {
      const { bookId, view, download, read, like, dislike, share, bookmark, rating } = req.body;
      
      // Validate that the book exists FIRST before doing any other operations
      const book = await db.query.books.findFirst({
        where: eq(books.id, bookId),
      });
      
      if (!book) {
        return reply.status(404).send({
          success: false,
          message: 'Book not found',
        });
      }

      // Get session from better-auth
      const session = await getAuthInstance(app).api.getSession({
        headers: fromNodeHeaders(req.headers),
      });
      
      const userId = session?.user?.id;
      let sessionId: string | undefined;
      
      // If user is not authenticated, try to get session ID from cookies
      if (!userId) {
        // Get session ID from cookie if available
        const cookieSessionId = req.cookies['book_session_id'];
        
        if (cookieSessionId) {
          sessionId = cookieSessionId;
        } else {
          sessionId = randomUUID();
        }
        
        // Set session ID in cookie for future requests
        reply.setCookie('book_session_id', sessionId, {
          path: '/',
          httpOnly: true,
          secure: process.env.NODE_ENV === 'production',
          maxAge: 60 * 60 * 60 * 7, // 1 week
          sameSite: 'strict'
        });
      }

      // Check if userEventHistory exists, create if not
      let eventHistory;
      if (userId) {
        // For authenticated users, look for existing event history
        const existingHistory = await db.query.userEventHistory.findFirst({
          where: eq(userEventHistory.userId, userId),
        });
        
        if (existingHistory) {
          eventHistory = existingHistory;
        } else {
          // Create new event history for user
          const [newHistory] = await db.insert(userEventHistory).values({
            userId: userId,
            sessionId: sessionId,
            ipAddress: req.ip,
            userAgent: req.headers['user-agent'] || '',
            extra: {},
          }).returning();
          
          eventHistory = newHistory;
        }
      } else if (sessionId) {
        // For anonymous users, look for existing event history by session ID
        const existingHistory = await db.query.userEventHistory.findFirst({
          where: eq(userEventHistory.sessionId, sessionId),
        });
        
        if (existingHistory) {
          eventHistory = existingHistory;
        } else {
          // Create new event history for anonymous user
          const [newHistory] = await db.insert(userEventHistory).values({
            userId: randomUUID(), // Create a temporary user ID for anonymous users
            sessionId: sessionId,
            ipAddress: req.ip,
            userAgent: req.headers['user-agent'] || '',
            extra: {},
          }).returning();
          
          eventHistory = newHistory;
        }
      } else {
        return reply.status(400).send({
          success: false,
          message: 'User must be authenticated or have a session',
        });
      }

      // Check if bookEventStats exists for this book, create if not
      let bookStats = await db.query.bookEventStats.findFirst({
        where: and(
          eq(bookEventStats.bookId, bookId),
          eq(bookEventStats.userEventHistory, eventHistory.id)
        ),
      });
      
      if (!bookStats) {
        // Create initial book event stats
        const [newStats] = await db.insert(bookEventStats).values({
          userEventHistory: eventHistory.id,
          bookId: bookId,
          viewCount: 0,
          downloadCount: 0,
          readCount: 0,
          likeCount: 0,
          dislikeCount: 0,
          shareCount: 0,
          bookmarkCount: 0,
          rating: '0.00',
          extra: {},
        }).returning();
        
        bookStats = newStats;
      }

      // For authenticated users, get user interactions once to avoid redundant queries
      let userInteractionsData = null;
      if (userId) {
        const userInteractions = await db.select().from(userBookInteractions).where(
          and(
            eq(userBookInteractions.userId, userId),
            eq(userBookInteractions.bookId, bookId)
          )
        );
        userInteractionsData = userInteractions.length > 0 ? userInteractions[0] : null;
      }

      // Prepare update values for event stats
      const updateValues: Record<string, any> = {};
      
      // For view, download, and read events, check if enough time has passed (24 hours)
      const oneDayAgo = new Date(Date.now() - 24 * 60 * 60 * 1000);
      
      // Check if we can increment view count (24 hour cooldown)
      if (view) {
        // If the stats were updated more than 24 hours ago, we can increment
        if (bookStats.updatedAt < oneDayAgo) {
          updateValues.viewCount = sql`${bookEventStats.viewCount} + 1`;
        }
      }
      
      // Check if we can increment download count (24 hour cooldown)
      if (download) {
        // If the stats were updated more than 24 hours ago, we can increment
        if (bookStats.updatedAt < oneDayAgo) {
          updateValues.downloadCount = sql`${bookEventStats.downloadCount} + 1`;
        }
      }
      
      // Check if we can increment read count (24 hour cooldown)
      if (read) {
        // If the stats were updated more than 24 hours ago, we can increment
        if (bookStats.updatedAt < oneDayAgo) {
          updateValues.readCount = sql`${bookEventStats.readCount} + 1`;
        }
      }
      
      // Handle like as a toggle (increment/decrement based on value)
      // Like is only for logged-in users
      if (like !== undefined && userId) {
        const currentUserLikeStatus = userInteractionsData?.liked || false;
        
        // Only update if the like status is changing
        if (like !== currentUserLikeStatus) {
          if (like) {
            // User is liking the book (increment like count)
            updateValues.likeCount = sql`${bookEventStats.likeCount} + 1`;
            
            // If user was previously disliking, decrement dislike count
            const currentUserDislikeStatus = userInteractionsData?.disliked || false;
            if (currentUserDislikeStatus) {
              updateValues.dislikeCount = sql`GREATEST(${bookEventStats.dislikeCount} - 1, 0)`;
            }
          } else {
            // User is unliking the book (decrement like count, but not below 0)
            updateValues.likeCount = sql`GREATEST(${bookEventStats.likeCount} - 1, 0)`;
          }
        }
      }
      
      // Handle dislike as a toggle (increment/decrement based on value)
      // Dislike is only for logged-in users
      if (dislike !== undefined && userId) {
        const currentUserDislikeStatus = userInteractionsData?.disliked || false;
        
        // Only update if the dislike status is changing
        if (dislike !== currentUserDislikeStatus) {
          if (dislike) {
            // User is disliking the book (increment dislike count)
            updateValues.dislikeCount = sql`${bookEventStats.dislikeCount} + 1`;
            
            // If user was previously liking, decrement like count
            const currentUserLikeStatus = userInteractionsData?.liked || false;
            if (currentUserLikeStatus) {
              updateValues.likeCount = sql`GREATEST(${bookEventStats.likeCount} - 1, 0)`;
            }
          } else {
            // User is undisliking the book (decrement dislike count, but not below 0)
            updateValues.dislikeCount = sql`GREATEST(${bookEventStats.dislikeCount} - 1, 0)`;
          }
        }
      }
      
      // Handle share (immediate increment for authenticated users)
      if (share && userId) {
        updateValues.shareCount = sql`${bookEventStats.shareCount} + 1`;
      }
      
      // Handle bookmark as a toggle (increment/decrement based on value)
      // Bookmark is only for logged-in users
      if (bookmark !== undefined && userId) {
        const currentUserBookmarkStatus = userInteractionsData?.bookmarked || false;
        
        // Only update if the bookmark status is changing
        if (bookmark !== currentUserBookmarkStatus) {
          if (bookmark) {
            // User is bookmarking the book (increment count)
            updateValues.bookmarkCount = sql`${bookEventStats.bookmarkCount} + 1`;
          } else {
            // User is unbookmarking the book (decrement count, but not below 0)
            updateValues.bookmarkCount = sql`GREATEST(${bookEventStats.bookmarkCount} - 1, 0)`;
          }
        }
      }
      
      // Note: We don't update the rating here as it should be calculated separately
      
      // Update book event stats
      if (Object.keys(updateValues).length > 0) {
        await db.update(bookEventStats)
          .set({
            ...updateValues,
            updatedAt: new Date(),
          })
          .where(and(
            eq(bookEventStats.bookId, bookId),
            eq(bookEventStats.userEventHistory, eventHistory.id)
          ));
      }

      // Handle user book interactions (for authenticated users only)
      if (userId) {
        let userInteraction = userInteractionsData;
        
        if (!userInteraction) {
          // Create new user interaction
          const newInteractions = await db.insert(userBookInteractions).values({
            userId: userId,
            bookId: bookId,
            liked: (like !== undefined && userId) ? like : false,
            disliked: (dislike !== undefined && userId) ? dislike : false,
            rating: rating?.toString() || '0.00',
            bookmarked: (bookmark !== undefined && userId) ? bookmark : false,
            extra: {},
          }).returning();
          
          userInteraction = newInteractions[0];
        } else {
          // Update existing user interaction
          const updateValues: Record<string, any> = {};
          
          // Only update like/dislike/bookmark for authenticated users
          if (like !== undefined && userId) updateValues.liked = like;
          if (dislike !== undefined && userId) updateValues.disliked = dislike;
          if (rating !== undefined) updateValues.rating = rating.toString();
          if (bookmark !== undefined && userId) updateValues.bookmarked = bookmark;
          
          if (Object.keys(updateValues).length > 0) {
            await db.update(userBookInteractions)
              .set({
                ...updateValues,
                updatedAt: new Date(),
              })
              .where(and(
                eq(userBookInteractions.userId, userId),
                eq(userBookInteractions.bookId, bookId)
              ));
          }
        }
      }

      return reply.status(200).send({
        success: true,
        message: 'Book event tracked successfully',
      });
    }),
  });
};

export default publicRoute;