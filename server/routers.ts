import { COOKIE_NAME } from "@shared/const";
import { getSessionCookieOptions } from "./_core/cookies";
import { systemRouter } from "./_core/systemRouter";
import { publicProcedure, router, protectedProcedure } from "./_core/trpc";
import { z } from "zod";
import {
  upsertUserProfile,
  getUserProfile,
  getOrCreateWallet,
  getWalletBalance,
  processWalletTransaction,
  createTutoringRequest,
  getOpenTutoringRequests,
  acceptTutoringRequest,
  rejectTutoringRequest,
  getAvailableMentorsBySubject,
  createProgressNote,
  getProgressNotesForStudent,
  createNotification,
  getUnreadNotifications,
  markNotificationAsRead,
  createSocialPost,
  getSocialFeed,
  likeSocialPost,
  commentOnSocialPost,
  createStripePayment,
  linkParentToStudent,
  getStudentsForParent,
  getParentsForStudent,
  getUserById,
} from "./db";
import { TRPCError } from "@trpc/server";

export const appRouter = router({
  system: systemRouter,
  auth: router({
    me: publicProcedure.query((opts) => opts.ctx.user),
    logout: publicProcedure.mutation(({ ctx }) => {
      const cookieOptions = getSessionCookieOptions(ctx.req);
      ctx.res.clearCookie(COOKIE_NAME, { ...cookieOptions, maxAge: -1 });
      return {
        success: true,
      } as const;
    }),
  }),

  /**
   * User Profile Management
   */
  profile: router({
    /**
     * Get current user's profile
     */
    me: protectedProcedure.query(async ({ ctx }) => {
      const profile = await getUserProfile(ctx.user.id);
      return profile;
    }),

    /**
     * Update user profile
     */
    update: protectedProcedure
      .input(
        z.object({
          userType: z.enum(["student", "mentor", "parent", "school_admin"]),
          studentGrade: z.string().optional(),
          studentSchool: z.string().optional(),
          mentorSpecialties: z.array(z.string()).optional(),
          mentorBio: z.string().optional(),
          mentorHourlyRate: z.string().optional(),
          phoneNumber: z.string().optional(),
          language: z.enum(["fr", "en", "ar"]).optional(),
        })
      )
      .mutation(async ({ ctx, input }) => {
        await upsertUserProfile(ctx.user.id, {
          userType: input.userType,
          studentGrade: input.studentGrade,
          studentSchool: input.studentSchool,
          mentorSpecialties: input.mentorSpecialties,
          mentorBio: input.mentorBio,
          mentorHourlyRate: input.mentorHourlyRate,
          phoneNumber: input.phoneNumber,
          language: input.language,
        });
        return { success: true };
      }),

    /**
     * Get user profile by ID
     */
    getById: protectedProcedure
      .input(z.object({ userId: z.number() }))
      .query(async ({ input }) => {
        const profile = await getUserProfile(input.userId);
        if (!profile) {
          throw new TRPCError({
            code: "NOT_FOUND",
            message: "Profile not found",
          });
        }
        return profile;
      }),
  }),

  /**
   * Wallet & Currency System
   */
  wallet: router({
    /**
     * Get current user's wallet balance
     */
    getBalance: protectedProcedure.query(async ({ ctx }) => {
      const wallet = await getOrCreateWallet(ctx.user.id);
      return {
        balanceCoins: wallet.balanceCoins,
        balanceTnd: Number(wallet.balanceCoins) / 10, // 1 TND = 10 Coins
        totalEarned: wallet.totalEarned,
        totalSpent: wallet.totalSpent,
      };
    }),

    /**
     * Process wallet transaction (internal use)
     */
    processTransaction: protectedProcedure
      .input(
        z.object({
          amountCoins: z.number().int().positive(),
          transactionType: z.enum([
            "topup_stripe",
            "session_deduction",
            "session_earning",
            "withdrawal",
            "refund",
            "admin_adjustment",
          ]),
          metadata: z.object({}).passthrough().optional(),
        })
      )
      .mutation(async ({ ctx, input }) => {
        try {
          const transaction = await processWalletTransaction(
            ctx.user.id,
            input.amountCoins,
            input.transactionType,
            input.metadata
          );
          return { success: true, transaction };
        } catch (error) {
          throw new TRPCError({
            code: "BAD_REQUEST",
            message:
              error instanceof Error ? error.message : "Transaction failed",
          });
        }
      }),
  }),

  /**
   * Tutoring Request & Matching System
   */
  tutoring: router({
    /**
     * Create a tutoring request (Student)
     */
    createRequest: protectedProcedure
      .input(
        z.object({
          subject: z.string().min(1),
          description: z.string().optional(),
          urgency: z.enum(["low", "medium", "high"]).optional(),
          maxBudgetCoins: z.number().int().optional(),
        })
      )
      .mutation(async ({ ctx, input }) => {
        const profile = await getUserProfile(ctx.user.id);
        if (!profile || profile.userType !== "student") {
          throw new TRPCError({
            code: "FORBIDDEN",
            message: "Only students can create tutoring requests",
          });
        }

        const request = await createTutoringRequest(ctx.user.id, {
          subject: input.subject,
          description: input.description,
          urgency: input.urgency,
          maxBudgetCoins: input.maxBudgetCoins,
        });

        if (request && request.id) {
          // Notify available mentors
          await createNotification(ctx.user.id, {
            type: "tutor_request",
            title: `Nouvelle demande de tuteur en ${input.subject}`,
            message: input.description,
            relatedEntityType: "tutoring_request",
            relatedEntityId: request.id,
          });
        }

        return request;
      }),

    /**
     * Get open tutoring requests (Mentor)
     */
    getOpenRequests: protectedProcedure
      .input(
        z.object({
          subject: z.string().optional(),
        })
      )
      .query(async ({ ctx, input }) => {
        const profile = await getUserProfile(ctx.user.id);
        if (!profile || profile.userType !== "mentor") {
          throw new TRPCError({
            code: "FORBIDDEN",
            message: "Only mentors can view open requests",
          });
        }

        const requests = await getOpenTutoringRequests(input.subject);
        return requests;
      }),

    /**
     * Accept tutoring request (Mentor)
     */
    acceptRequest: protectedProcedure
      .input(
        z.object({
          requestId: z.number(),
        })
      )
      .mutation(async ({ ctx, input }) => {
        const profile = await getUserProfile(ctx.user.id);
        if (!profile || profile.userType !== "mentor") {
          throw new TRPCError({
            code: "FORBIDDEN",
            message: "Only mentors can accept requests",
          });
        }

        try {
          const session = await acceptTutoringRequest(
            input.requestId,
            ctx.user.id
          );

          // Deduct coins from student wallet
          const student = await getUserById(session.studentId);
          if (student) {
            await processWalletTransaction(
              session.studentId,
              -10, // Deduct 10 EduCoins
              "session_deduction",
              {
                sessionId: session.id,
              }
            );

            // Add coins to mentor wallet
            await processWalletTransaction(
              ctx.user.id,
              10, // Add 10 EduCoins
              "session_earning",
              {
                sessionId: session.id,
              }
            );

            // Notify student
            await createNotification(session.studentId, {
              type: "request_accepted",
              title: "Votre demande de tuteur a été acceptée",
              message: `${student.name} a accepté votre demande`,
              relatedEntityType: "tutoring_session",
              relatedEntityId: session.id,
            });
          }

          return { success: true, session };
        } catch (error) {
          throw new TRPCError({
            code: "BAD_REQUEST",
            message:
              error instanceof Error ? error.message : "Failed to accept request",
          });
        }
      }),

    /**
     * Reject tutoring request (Mentor)
     */
    rejectRequest: protectedProcedure
      .input(
        z.object({
          requestId: z.number(),
        })
      )
      .mutation(async ({ ctx, input }) => {
        const profile = await getUserProfile(ctx.user.id);
        if (!profile || profile.userType !== "mentor") {
          throw new TRPCError({
            code: "FORBIDDEN",
            message: "Only mentors can reject requests",
          });
        }

        await rejectTutoringRequest(input.requestId, ctx.user.id);
        return { success: true };
      }),

    /**
     * Get available mentors by subject
     */
    getAvailableMentors: protectedProcedure
      .input(
        z.object({
          subject: z.string(),
        })
      )
      .query(async ({ input }) => {
        const mentors = await getAvailableMentorsBySubject(input.subject);
        return mentors;
      }),
  }),

  /**
   * Progress Notes & Parent-Teacher Communication
   */
  progressNotes: router({
    /**
     * Create progress note (Teacher)
     */
    create: protectedProcedure
      .input(
        z.object({
          studentId: z.number(),
          subject: z.string().optional(),
          content: z.string().min(1),
          visibleToParent: z.boolean().optional(),
        })
      )
      .mutation(async ({ ctx, input }) => {
        const profile = await getUserProfile(ctx.user.id);
        if (!profile || profile.userType !== "mentor") {
          throw new TRPCError({
            code: "FORBIDDEN",
            message: "Only teachers/mentors can create progress notes",
          });
        }

        const note = await createProgressNote(ctx.user.id, input.studentId, {
          subject: input.subject,
          content: input.content,
          visibleToParent: input.visibleToParent,
        });

        // Notify parents if visible
        if (input.visibleToParent) {
          const parents = await getParentsForStudent(input.studentId);
          for (const parent of parents) {
            await createNotification(parent.parentId, {
              type: "progress_note",
              title: `Nouvelle note pour ${input.subject || "votre enfant"}`,
              message: input.content.substring(0, 100),
              relatedEntityType: "progress_note",
              relatedEntityId: note.id,
            });
          }
        }

        return note;
      }),

    /**
     * Get progress notes for student (Parent/Teacher)
     */
    getForStudent: protectedProcedure
      .input(
        z.object({
          studentId: z.number(),
        })
      )
      .query(async ({ ctx, input }) => {
        const profile = await getUserProfile(ctx.user.id);

        // Check permissions
        if (profile?.userType === "parent") {
          // Parents can only see notes for their children
          const students = await getStudentsForParent(ctx.user.id);
          if (!students.some((s) => s.studentId === input.studentId)) {
            throw new TRPCError({
              code: "FORBIDDEN",
              message: "You can only view notes for your children",
            });
          }
        }

        const notes = await getProgressNotesForStudent(
          input.studentId,
          profile?.userType === "parent" // Only show visible notes to parents
        );
        return notes;
      }),
  }),

  /**
   * Notifications System
   */
  notifications: router({
    /**
     * Get unread notifications
     */
    getUnread: protectedProcedure.query(async ({ ctx }) => {
      const notifications = await getUnreadNotifications(ctx.user.id);
      return notifications;
    }),

    /**
     * Mark notification as read
     */
    markAsRead: protectedProcedure
      .input(
        z.object({
          notificationId: z.number(),
        })
      )
      .mutation(async ({ input }) => {
        await markNotificationAsRead(input.notificationId);
        return { success: true };
      }),
  }),

  /**
   * Social Feed
   */
  socialFeed: router({
    /**
     * Get public feed
     */
    getFeed: protectedProcedure
      .input(
        z.object({
          limit: z.number().int().positive().default(20),
          offset: z.number().int().nonnegative().default(0),
        })
      )
      .query(async ({ input }) => {
        const posts = await getSocialFeed(input.limit, input.offset);
        return posts;
      }),

    /**
     * Create social post
     */
    createPost: protectedProcedure
      .input(
        z.object({
          content: z.string().min(1),
          postType: z
            .enum(["achievement", "milestone", "resource", "question", "update"])
            .optional(),
          visibility: z
            .enum(["public", "class_only", "private"])
            .optional(),
          imageUrl: z.string().optional(),
        })
      )
      .mutation(async ({ ctx, input }) => {
        const post = await createSocialPost(ctx.user.id, {
          content: input.content,
          postType: input.postType,
          visibility: input.visibility,
          imageUrl: input.imageUrl,
        });
        return post;
      }),

    /**
     * Like/unlike post
     */
    toggleLike: protectedProcedure
      .input(
        z.object({
          postId: z.number(),
        })
      )
      .mutation(async ({ ctx, input }) => {
        const result = await likeSocialPost(input.postId, ctx.user.id);
        return result;
      }),

    /**
     * Comment on post
     */
    comment: protectedProcedure
      .input(
        z.object({
          postId: z.number(),
          content: z.string().min(1),
        })
      )
      .mutation(async ({ ctx, input }) => {
        await commentOnSocialPost(input.postId, ctx.user.id, input.content);
        return { success: true };
      }),
  }),

  /**
   * Stripe Payment Integration
   */
  payment: router({
    /**
     * Create Stripe payment for topup
     */
    createTopupIntent: protectedProcedure
      .input(
        z.object({
          amountTnd: z.string().regex(/^\d+(\.\d{1,3})?$/),
        })
      )
      .mutation(async ({ ctx, input }) => {
        const amountCoins = Math.floor(Number(input.amountTnd) * 10);

        await createStripePayment(ctx.user.id, {
          paymentType: "topup",
          amountTnd: input.amountTnd,
          amountCoins,
        });

        return {
          amountTnd: input.amountTnd,
          amountCoins,
          message: "Payment intent created",
        };
      }),

    /**
     * Create Stripe payment for withdrawal
     */
    createWithdrawalIntent: protectedProcedure
      .input(
        z.object({
          amountCoins: z.number().int().positive(),
        })
      )
      .mutation(async ({ ctx, input }) => {
        const profile = await getUserProfile(ctx.user.id);
        if (!profile || profile.userType !== "mentor") {
          throw new TRPCError({
            code: "FORBIDDEN",
            message: "Only mentors can withdraw earnings",
          });
        }

        const wallet = await getOrCreateWallet(ctx.user.id);
        if (wallet.balanceCoins < input.amountCoins) {
          throw new TRPCError({
            code: "BAD_REQUEST",
            message: "Insufficient balance",
          });
        }

        const amountTnd = (input.amountCoins / 10).toFixed(3);

        await createStripePayment(ctx.user.id, {
          paymentType: "withdrawal",
          amountTnd,
          amountCoins: input.amountCoins,
        });

        return {
          amountCoins: input.amountCoins,
          amountTnd,
          message: "Withdrawal intent created",
        };
      }),
  }),

  /**
   * Relationships (Parent-Student, Teacher-Student)
   */
  relationships: router({
    /**
     * Link parent to student
     */
    linkParentToStudent: protectedProcedure
      .input(
        z.object({
          studentId: z.number(),
          relationship: z.string(),
        })
      )
      .mutation(async ({ ctx, input }) => {
        const profile = await getUserProfile(ctx.user.id);
        if (!profile || profile.userType !== "parent") {
          throw new TRPCError({
            code: "FORBIDDEN",
            message: "Only parents can link to students",
          });
        }

        await linkParentToStudent(
          ctx.user.id,
          input.studentId,
          input.relationship
        );
        return { success: true };
      }),

    /**
     * Get students for parent
     */
    getStudentsForParent: protectedProcedure.query(async ({ ctx }) => {
      const profile = await getUserProfile(ctx.user.id);
      if (!profile || profile.userType !== "parent") {
        throw new TRPCError({
          code: "FORBIDDEN",
          message: "Only parents can view their students",
        });
      }

      const students = await getStudentsForParent(ctx.user.id);
      return students;
    }),

    /**
     * Get parents for student
     */
    getParentsForStudent: protectedProcedure.query(async ({ ctx }) => {
      const profile = await getUserProfile(ctx.user.id);
      if (!profile || profile.userType !== "student") {
        throw new TRPCError({
          code: "FORBIDDEN",
          message: "Only students can view their parents",
        });
      }

      const parents = await getParentsForStudent(ctx.user.id);
      return parents;
    }),
  }),
});

export type AppRouter = typeof appRouter;
