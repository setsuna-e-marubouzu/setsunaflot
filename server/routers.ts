import { COOKIE_NAME } from "@shared/const";
import { getSessionCookieOptions } from "./_core/cookies";
import { systemRouter } from "./_core/systemRouter";
import { publicProcedure, protectedProcedure, router } from "./_core/trpc";
import { z } from "zod";
import * as db from "./db";
import * as stripe from "./stripe";
import { TRPCError } from "@trpc/server";
import { ENV } from "./_core/env";

export const appRouter = router({
  system: systemRouter,
  auth: router({
    me: publicProcedure.query(opts => opts.ctx.user),
    logout: publicProcedure.mutation(({ ctx }) => {
      const cookieOptions = getSessionCookieOptions(ctx.req);
      ctx.res.clearCookie(COOKIE_NAME, { ...cookieOptions, maxAge: -1 });
      return {
        success: true,
      } as const;
    }),
  }),

  // ===== Subscription Management =====
  subscription: router({
    getPlans: publicProcedure.query(async () => {
      return db.getActiveSubscriptionPlans();
    }),

    getUserSubscription: protectedProcedure.query(async ({ ctx }) => {
      return db.getUserActiveSubscription(ctx.user.id);
    }),

    getSubscriptionHistory: protectedProcedure.query(async ({ ctx }) => {
      return db.getUserSubscriptionHistory(ctx.user.id);
    }),

    createCheckoutSession: protectedProcedure
      .input(z.object({ planId: z.number() }))
      .mutation(async ({ ctx, input }) => {
        if (!ENV.stripeSecretKey) {
          throw new TRPCError({
            code: "INTERNAL_SERVER_ERROR",
            message: "Stripe not configured",
          });
        }

        const plan = await db.getSubscriptionPlanById(input.planId);
        if (!plan) {
          throw new TRPCError({
            code: "NOT_FOUND",
            message: "Plan not found",
          });
        }

        try {
          const stripeCustomer = await stripe.createStripeCustomer(
            ctx.user.email ?? `user-${ctx.user.id}@fansite.local`,
            ctx.user.name ?? undefined
          );

          const subscription = await stripe.createSubscription(
            stripeCustomer.id,
            plan.stripePriceId,
            {
              userId: ctx.user.id.toString(),
              planId: input.planId.toString(),
            }
          );

          // Store subscription in database
          await db.createUserSubscription({
            userId: ctx.user.id,
            planId: input.planId,
            stripeSubscriptionId: subscription.id,
            status: "incomplete",
            currentPeriodStart: new Date(),
            currentPeriodEnd: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000),
          });

          return {
            stripeCustomerId: stripeCustomer.id,
            subscriptionId: subscription.id,
            clientSecret: (subscription.latest_invoice as any)?.payment_intent?.client_secret,
          };
        } catch (error) {
          console.error("Subscription creation error:", error);
          throw new TRPCError({
            code: "INTERNAL_SERVER_ERROR",
            message: "Failed to create subscription",
          });
        }
      }),

    cancelSubscription: protectedProcedure.mutation(async ({ ctx }) => {
      const subscription = await db.getUserActiveSubscription(ctx.user.id);
      if (!subscription) {
        throw new TRPCError({
          code: "NOT_FOUND",
          message: "No active subscription",
        });
      }

      try {
        await stripe.cancelSubscription(subscription.stripeSubscriptionId);
        await db.updateUserSubscriptionStatus(subscription.id, "canceled");
        return { success: true };
      } catch (error) {
        console.error("Subscription cancellation error:", error);
        throw new TRPCError({
          code: "INTERNAL_SERVER_ERROR",
          message: "Failed to cancel subscription",
        });
      }
    }),
  }),

  // ===== Gallery Images (Subscriber Only) =====
  gallery: router({
    getImages: publicProcedure.query(async ({ ctx }) => {
      const images = await db.getGalleryImages(true);
      
      // If user is not a subscriber, return only thumbnails
      if (!ctx.user) {
        return images.map(img => ({
          ...img,
          s3Key: null, // Hide actual image key
        }));
      }

      const subscription = await db.getUserActiveSubscription(ctx.user.id);
      if (!subscription) {
        return images.map(img => ({
          ...img,
          s3Key: null,
        }));
      }

      return images;
    }),

    getImage: publicProcedure
      .input(z.object({ id: z.number() }))
      .query(async ({ ctx, input }) => {
        const image = await db.getGalleryImageById(input.id);
        if (!image) {
          throw new TRPCError({
            code: "NOT_FOUND",
            message: "Image not found",
          });
        }

        // Check subscription status
        if (image.isSubscriberOnly && ctx.user) {
          const subscription = await db.getUserActiveSubscription(ctx.user.id);
          if (!subscription) {
            return { ...image, s3Key: null };
          }
        } else if (image.isSubscriberOnly) {
          return { ...image, s3Key: null };
        }

        return image;
      }),
  }),

  // ===== Sale Images =====
  saleImages: router({
    getImages: publicProcedure.query(async () => {
      return db.getSaleImages();
    }),

    getImage: publicProcedure
      .input(z.object({ id: z.number() }))
      .query(async ({ input }) => {
        const image = await db.getSaleImageById(input.id);
        if (!image) {
          throw new TRPCError({
            code: "NOT_FOUND",
            message: "Image not found",
          });
        }
        return image;
      }),

    createPaymentIntent: protectedProcedure
      .input(z.object({ imageId: z.number() }))
      .mutation(async ({ ctx, input }) => {
        if (!ENV.stripeSecretKey) {
          throw new TRPCError({
            code: "INTERNAL_SERVER_ERROR",
            message: "Stripe not configured",
          });
        }

        const image = await db.getSaleImageById(input.imageId);
        if (!image) {
          throw new TRPCError({
            code: "NOT_FOUND",
            message: "Image not found",
          });
        }

        try {
          const stripeCustomer = await stripe.createStripeCustomer(
            ctx.user.email ?? `user-${ctx.user.id}@fansite.local`,
            ctx.user.name ?? undefined
          );

          const paymentIntent = await stripe.createPaymentIntent(
            stripeCustomer.id,
            image.stripePriceId,
            image.priceJpy,
            {
              userId: ctx.user.id.toString(),
              imageId: input.imageId.toString(),
            }
          );

          return {
            clientSecret: paymentIntent.client_secret,
            paymentIntentId: paymentIntent.id,
          };
        } catch (error) {
          console.error("Payment intent creation error:", error);
          throw new TRPCError({
            code: "INTERNAL_SERVER_ERROR",
            message: "Failed to create payment intent",
          });
        }
      }),
  }),

  // ===== Activity Reports =====
  activityReports: router({
    getReports: publicProcedure
      .input(
        z.object({
          limit: z.number().default(20),
          offset: z.number().default(0),
        })
      )
      .query(async ({ input }) => {
        return db.getActivityReports(input.limit, input.offset);
      }),

    getReport: publicProcedure
      .input(z.object({ id: z.number() }))
      .query(async ({ input }) => {
        const report = await db.getActivityReportById(input.id);
        if (!report) {
          throw new TRPCError({
            code: "NOT_FOUND",
            message: "Report not found",
          });
        }
        return report;
      }),

    createReport: protectedProcedure
      .input(
        z.object({
          title: z.string().min(1).max(255),
          content: z.string().min(1),
          audioS3Key: z.string().optional(),
        })
      )
      .mutation(async ({ ctx, input }) => {
        if (ctx.user.role !== "admin") {
          throw new TRPCError({
            code: "FORBIDDEN",
            message: "Only admins can create reports",
          });
        }

        return db.createActivityReport({
          title: input.title,
          content: input.content,
          audioS3Key: input.audioS3Key,
          postedBy: ctx.user.id,
        });
      }),
  }),

  // ===== Admin Dashboard =====
  admin: router({
    getRevenueStats: protectedProcedure
      .input(
        z.object({
          startDate: z.date(),
          endDate: z.date(),
        })
      )
      .query(async ({ ctx, input }) => {
        if (ctx.user.role !== "admin") {
          throw new TRPCError({
            code: "FORBIDDEN",
            message: "Only admins can view revenue stats",
          });
        }

        return db.getRevenueStats(input.startDate, input.endDate);
      }),

    uploadGalleryImage: protectedProcedure
      .input(
        z.object({
          title: z.string().min(1).max(255),
          description: z.string().optional(),
          fileSize: z.number(),
        })
      )
      .mutation(async ({ ctx, input }) => {
        if (ctx.user.role !== "admin") {
          throw new TRPCError({
            code: "FORBIDDEN",
            message: "Only admins can upload images",
          });
        }

        return db.createGalleryImage({
          title: input.title,
          description: input.description,
          s3Key: `gallery/${Date.now()}-${Math.random().toString(36).substring(7)}`,
          thumbnailS3Key: null,
          isSubscriberOnly: true,
          uploadedBy: ctx.user.id,
        });
      }),

    deleteGalleryImage: protectedProcedure
      .input(z.object({ imageId: z.number() }))
      .mutation(async ({ ctx, input }) => {
        if (ctx.user.role !== "admin") {
          throw new TRPCError({
            code: "FORBIDDEN",
            message: "Only admins can delete images",
          });
        }

        return db.deleteGalleryImage(input.imageId);
      }),

    deleteActivityReport: protectedProcedure
      .input(z.object({ reportId: z.number() }))
      .mutation(async ({ ctx, input }) => {
        if (ctx.user.role !== "admin") {
          throw new TRPCError({
            code: "FORBIDDEN",
            message: "Only admins can delete reports",
          });
        }

        return db.deleteActivityReport(input.reportId);
      }),
  }),

  // ===== User Profile =====
  profile: router({
    getPurchaseHistory: protectedProcedure.query(async ({ ctx }) => {
      return db.getUserPurchases(ctx.user.id);
    }),
  }),
});

export type AppRouter = typeof appRouter;
