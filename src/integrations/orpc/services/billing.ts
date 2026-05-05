import { ORPCError } from "@orpc/client";
import { and, eq } from "drizzle-orm";

import { getStripe } from "@/integrations/billing/client";
import { schema } from "@/integrations/drizzle";
import { db } from "@/integrations/drizzle/client";
import { resumeExportEntitlement, subscription, user } from "@/integrations/drizzle/schema";
import { env } from "@/utils/env";

import { isPremiumUser } from "./ai";

function ensureBillingEnabled(): void {
  if (!env.BILLING_ENABLED) {
    throw new ORPCError("SERVICE_UNAVAILABLE", { message: "Billing is not enabled on this instance." });
  }
}

function getReturnUrl(suffix: string): string {
  const base = (env.STRIPE_PORTAL_RETURN_URL ?? `${env.APP_URL}/dashboard/billing`).replace(/\/$/, "");
  return suffix.startsWith("?") ? `${base}${suffix}` : `${base}/${suffix.replace(/^\//, "")}`;
}

export type SubscriptionPlanCode = "monthly" | "annual";

function priceIdForPlan(plan: SubscriptionPlanCode): string {
  if (plan === "monthly") {
    if (!env.STRIPE_PRICE_ID_PREMIUM_MONTHLY)
      throw new ORPCError("INTERNAL_SERVER_ERROR", { message: "Monthly price not configured." });
    return env.STRIPE_PRICE_ID_PREMIUM_MONTHLY;
  }
  if (!env.STRIPE_PRICE_ID_PREMIUM_ANNUAL)
    throw new ORPCError("INTERNAL_SERVER_ERROR", { message: "Annual price not configured." });
  return env.STRIPE_PRICE_ID_PREMIUM_ANNUAL;
}

async function getOrCreateStripeCustomerId(args: { userId: string; email: string; name: string }): Promise<string> {
  const [row] = await db
    .select({ stripeCustomerId: user.stripeCustomerId })
    .from(user)
    .where(eq(user.id, args.userId))
    .limit(1);
  if (row?.stripeCustomerId) return row.stripeCustomerId;

  const stripe = getStripe();
  const customer = await stripe.customers.create({
    email: args.email,
    name: args.name,
    metadata: { user_id: args.userId, app: "curriculosia" },
  });

  await db.update(user).set({ stripeCustomerId: customer.id }).where(eq(user.id, args.userId));
  return customer.id;
}

export const billingService = {
  createSubscriptionCheckout: async (input: {
    userId: string;
    email: string;
    name: string;
    plan: SubscriptionPlanCode;
  }): Promise<{ url: string }> => {
    ensureBillingEnabled();
    const stripe = getStripe();
    const customerId = await getOrCreateStripeCustomerId({
      userId: input.userId,
      email: input.email,
      name: input.name,
    });

    const session = await stripe.checkout.sessions.create({
      mode: "subscription",
      customer: customerId,
      client_reference_id: input.userId,
      line_items: [{ price: priceIdForPlan(input.plan), quantity: 1 }],
      success_url: getReturnUrl("?status=subscription_success"),
      cancel_url: getReturnUrl("?status=cancelled"),
      allow_promotion_codes: true,
      subscription_data: {
        metadata: { user_id: input.userId, plan: input.plan },
      },
    });

    if (!session.url)
      throw new ORPCError("INTERNAL_SERVER_ERROR", { message: "Stripe did not return a checkout URL." });
    return { url: session.url };
  },

  createExportCheckout: async (input: {
    userId: string;
    email: string;
    name: string;
    resumeId: string;
  }): Promise<{ url: string; alreadyEntitled: boolean }> => {
    ensureBillingEnabled();
    if (!env.STRIPE_PRICE_ID_EXPORT_UNLOCK) {
      throw new ORPCError("INTERNAL_SERVER_ERROR", { message: "Export unlock price not configured." });
    }

    // Verify the resume belongs to this user before letting them pay for it.
    const [ownedResume] = await db
      .select({ id: schema.resume.id })
      .from(schema.resume)
      .where(and(eq(schema.resume.id, input.resumeId), eq(schema.resume.userId, input.userId)))
      .limit(1);
    if (!ownedResume) throw new ORPCError("NOT_FOUND");

    // If they already have an entitlement (or are premium), short-circuit.
    const [existing] = await db
      .select({ id: resumeExportEntitlement.id })
      .from(resumeExportEntitlement)
      .where(
        and(eq(resumeExportEntitlement.userId, input.userId), eq(resumeExportEntitlement.resumeId, input.resumeId)),
      )
      .limit(1);
    if (existing) {
      return { url: getReturnUrl("?status=already_entitled"), alreadyEntitled: true };
    }

    const stripe = getStripe();
    const customerId = await getOrCreateStripeCustomerId({
      userId: input.userId,
      email: input.email,
      name: input.name,
    });

    const session = await stripe.checkout.sessions.create({
      mode: "payment",
      customer: customerId,
      client_reference_id: input.userId,
      line_items: [{ price: env.STRIPE_PRICE_ID_EXPORT_UNLOCK, quantity: 1 }],
      success_url: getReturnUrl("?status=export_success"),
      cancel_url: getReturnUrl("?status=cancelled"),
      metadata: { user_id: input.userId, resume_id: input.resumeId, type: "export_unlock" },
      payment_intent_data: {
        metadata: { user_id: input.userId, resume_id: input.resumeId, type: "export_unlock" },
      },
    });

    if (!session.url)
      throw new ORPCError("INTERNAL_SERVER_ERROR", { message: "Stripe did not return a checkout URL." });
    return { url: session.url, alreadyEntitled: false };
  },

  createPortalSession: async (input: { userId: string }): Promise<{ url: string }> => {
    ensureBillingEnabled();
    const [row] = await db
      .select({ stripeCustomerId: user.stripeCustomerId })
      .from(user)
      .where(eq(user.id, input.userId))
      .limit(1);
    if (!row?.stripeCustomerId) {
      throw new ORPCError("PRECONDITION_FAILED", {
        message: "No Stripe customer for this user. Subscribe first.",
      });
    }
    const stripe = getStripe();
    const session = await stripe.billingPortal.sessions.create({
      customer: row.stripeCustomerId,
      return_url: getReturnUrl(""),
    });
    return { url: session.url };
  },

  getSubscription: async (input: { userId: string }) => {
    const [row] = await db
      .select()
      .from(subscription)
      .where(eq(subscription.userId, input.userId))
      .orderBy(subscription.createdAt)
      .limit(1);

    if (!row) return null;
    return {
      id: row.id,
      provider: row.provider,
      status: row.status,
      currentPeriodStart: row.currentPeriodStart?.toISOString() ?? null,
      currentPeriodEnd: row.currentPeriodEnd?.toISOString() ?? null,
      cancelAtPeriodEnd: row.cancelAtPeriodEnd,
      canceledAt: row.canceledAt?.toISOString() ?? null,
    };
  },

  listEntitlements: async (input: { userId: string }) => {
    const rows = await db
      .select({ resumeId: resumeExportEntitlement.resumeId, purchasedAt: resumeExportEntitlement.purchasedAt })
      .from(resumeExportEntitlement)
      .where(eq(resumeExportEntitlement.userId, input.userId));
    return rows.map((r) => ({ resumeId: r.resumeId, purchasedAt: r.purchasedAt.toISOString() }));
  },

  hasEntitlementFor: async (input: { userId: string; resumeId: string }): Promise<boolean> => {
    const [row] = await db
      .select({ id: resumeExportEntitlement.id })
      .from(resumeExportEntitlement)
      .where(
        and(eq(resumeExportEntitlement.userId, input.userId), eq(resumeExportEntitlement.resumeId, input.resumeId)),
      )
      .limit(1);
    return Boolean(row);
  },

  getExportStatus: async (input: {
    userId: string;
    resumeId: string;
  }): Promise<{ canExport: boolean; isPremium: boolean; isEntitled: boolean }> => {
    if (!env.BILLING_ENABLED) {
      // No billing configured: keep export free for the owner (self-host default).
      return { canExport: true, isPremium: false, isEntitled: false };
    }
    const [premium, entitled] = await Promise.all([
      isPremiumUser(input.userId),
      billingService.hasEntitlementFor({ userId: input.userId, resumeId: input.resumeId }),
    ]);
    return { canExport: premium || entitled, isPremium: premium, isEntitled: entitled };
  },

  // Cancels every active Stripe subscription tied to the user — best-effort,
  // called from the account-delete flow before the row goes away.
  cancelAllSubscriptions: async (input: { userId: string }): Promise<void> => {
    if (!env.BILLING_ENABLED) return;
    const [row] = await db
      .select({ stripeCustomerId: user.stripeCustomerId })
      .from(user)
      .where(eq(user.id, input.userId))
      .limit(1);
    if (!row?.stripeCustomerId) return;

    const stripe = getStripe();
    const subs = await stripe.subscriptions.list({ customer: row.stripeCustomerId, limit: 50, status: "all" });
    for (const sub of subs.data) {
      if (["canceled", "incomplete_expired"].includes(sub.status)) continue;
      try {
        await stripe.subscriptions.cancel(sub.id);
      } catch (error) {
        // Don't block account deletion on Stripe API errors; log to console.
        console.error("[billing] Failed to cancel Stripe subscription before delete:", sub.id, error);
      }
    }
  },
};
