import z from "zod";

import { protectedProcedure } from "../context";
import { billingService } from "../services/billing";

const subscriptionSummarySchema = z
  .object({
    id: z.string(),
    provider: z.string(),
    status: z.string(),
    currentPeriodStart: z.string().nullable(),
    currentPeriodEnd: z.string().nullable(),
    cancelAtPeriodEnd: z.boolean(),
    canceledAt: z.string().nullable(),
  })
  .nullable();

export const billingRouter = {
  createSubscriptionCheckout: protectedProcedure
    .route({
      method: "POST",
      path: "/billing/checkout/subscription",
      tags: ["Billing"],
      operationId: "createSubscriptionCheckout",
      summary: "Create a Stripe Checkout for a Premium subscription",
      description:
        "Returns a Stripe Checkout Session URL for the requested plan (monthly or annual). The client should redirect the user to this URL. Requires authentication and BILLING_ENABLED.",
      successDescription: "A redirect URL into Stripe Checkout.",
    })
    .input(z.object({ plan: z.enum(["monthly", "annual"]) }))
    .output(z.object({ url: z.url() }))
    .errors({
      SERVICE_UNAVAILABLE: { status: 503, message: "Billing is not enabled on this instance." },
    })
    .handler(async ({ context, input }) => {
      return await billingService.createSubscriptionCheckout({
        userId: context.user.id,
        email: context.user.email,
        name: context.user.name,
        plan: input.plan,
      });
    }),

  createExportCheckout: protectedProcedure
    .route({
      method: "POST",
      path: "/billing/checkout/export",
      tags: ["Billing"],
      operationId: "createExportCheckout",
      summary: "Create a Stripe Checkout for a one-time CV export unlock",
      description:
        "Returns a Stripe Checkout Session URL for unlocking PDF exports of the specified resume. The client should redirect the user to this URL. If the user is already entitled (premium or previously unlocked), returns alreadyEntitled=true. Requires authentication and BILLING_ENABLED.",
      successDescription: "A redirect URL into Stripe Checkout, plus an alreadyEntitled flag.",
    })
    .input(z.object({ resumeId: z.uuid() }))
    .output(z.object({ url: z.url(), alreadyEntitled: z.boolean() }))
    .errors({
      NOT_FOUND: { status: 404, message: "Resume not found." },
      SERVICE_UNAVAILABLE: { status: 503, message: "Billing is not enabled on this instance." },
    })
    .handler(async ({ context, input }) => {
      return await billingService.createExportCheckout({
        userId: context.user.id,
        email: context.user.email,
        name: context.user.name,
        resumeId: input.resumeId,
      });
    }),

  createPortalSession: protectedProcedure
    .route({
      method: "POST",
      path: "/billing/portal",
      tags: ["Billing"],
      operationId: "createBillingPortalSession",
      summary: "Open Stripe Customer Portal",
      description:
        "Returns a redirect URL to the Stripe Customer Portal where the user can manage payment methods, view invoices, or cancel a subscription. Requires authentication and an existing Stripe customer (i.e., the user has subscribed at least once).",
      successDescription: "A redirect URL to the Customer Portal.",
    })
    .output(z.object({ url: z.url() }))
    .errors({
      PRECONDITION_FAILED: { status: 412, message: "Subscribe first." },
      SERVICE_UNAVAILABLE: { status: 503, message: "Billing is not enabled on this instance." },
    })
    .handler(async ({ context }) => {
      return await billingService.createPortalSession({ userId: context.user.id });
    }),

  getSubscription: protectedProcedure
    .route({
      method: "GET",
      path: "/billing/subscription",
      tags: ["Billing"],
      operationId: "getCurrentSubscription",
      summary: "Get the current user's subscription summary",
      description:
        "Returns the current user's primary subscription state, or null if none exists. Includes period boundaries, cancellation flag, and status (active, past_due, canceled, etc.).",
      successDescription: "The subscription summary, or null.",
    })
    .output(subscriptionSummarySchema)
    .handler(async ({ context }) => {
      return await billingService.getSubscription({ userId: context.user.id });
    }),

  listEntitlements: protectedProcedure
    .route({
      method: "GET",
      path: "/billing/entitlements",
      tags: ["Billing"],
      operationId: "listExportEntitlements",
      summary: "List per-resume export unlocks owned by the current user",
      description:
        "Returns one entry per resume for which the user has paid the one-time export unlock. Premium subscribers do not need entitlements — they always have export access while their plan is active.",
      successDescription: "An array of (resumeId, purchasedAt) pairs.",
    })
    .output(z.array(z.object({ resumeId: z.string(), purchasedAt: z.string() })))
    .handler(async ({ context }) => {
      return await billingService.listEntitlements({ userId: context.user.id });
    }),

  getExportStatus: protectedProcedure
    .route({
      method: "GET",
      path: "/billing/export-status/{resumeId}",
      tags: ["Billing"],
      operationId: "getExportStatus",
      summary: "Check whether the user can export a specific resume",
      description:
        "Returns whether the current user can export the given resume — true when the user has Premium OR has purchased the one-time export unlock for that resume. When BILLING_ENABLED is false (self-host default) returns canExport=true.",
      successDescription: "Export entitlement summary for the resume.",
    })
    .input(z.object({ resumeId: z.uuid() }))
    .output(z.object({ canExport: z.boolean(), isPremium: z.boolean(), isEntitled: z.boolean() }))
    .handler(async ({ context, input }) => {
      return await billingService.getExportStatus({ userId: context.user.id, resumeId: input.resumeId });
    }),
};
