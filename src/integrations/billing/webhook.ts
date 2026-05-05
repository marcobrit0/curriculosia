import type Stripe from "stripe";

import { eq, sql } from "drizzle-orm";

import { db } from "@/integrations/drizzle/client";
import { billingEventLog, resumeExportEntitlement, subscription, user } from "@/integrations/drizzle/schema";
import { captureException } from "@/integrations/sentry";

// Status values that grant Premium access. `past_due` keeps the user
// premium during a brief grace window; we lean on a separate cron / webhook
// to demote them when the period actually expires.
const PREMIUM_STATUSES: ReadonlySet<string> = new Set(["active", "trialing", "past_due"]);

function isPremiumStatus(status: string): boolean {
  return PREMIUM_STATUSES.has(status);
}

async function alreadyProcessed(stripeEventId: string, eventType: string): Promise<boolean> {
  const [row] = await db
    .insert(billingEventLog)
    .values({ stripeEventId, eventType })
    .onConflictDoNothing()
    .returning({ stripeEventId: billingEventLog.stripeEventId });

  return !row;
}

async function findUserByStripeCustomerId(customerId: string): Promise<{ id: string } | null> {
  const [row] = await db.select({ id: user.id }).from(user).where(eq(user.stripeCustomerId, customerId)).limit(1);
  return row ?? null;
}

async function refreshUserPlanFromSubscription(args: {
  userId: string;
  status: string;
  currentPeriodEnd: Date | null;
}): Promise<void> {
  const grantsPremium =
    isPremiumStatus(args.status) && (args.currentPeriodEnd === null || args.currentPeriodEnd > new Date());

  await db
    .update(user)
    .set({
      plan: grantsPremium ? "premium" : "free",
      planExpiresAt: grantsPremium ? args.currentPeriodEnd : null,
    })
    .where(eq(user.id, args.userId));
}

// Stripe moved `current_period_start/end` onto `items.data[i]` in 2025-08; we
// take whichever shape the API currently returns. Older API versions still
// return them at the top level for backward compatibility.
function getPeriodTimestamps(sub: Stripe.Subscription): { start: number | null; end: number | null } {
  const item = sub.items?.data?.[0] as
    | (Stripe.SubscriptionItem & { current_period_start?: number | null; current_period_end?: number | null })
    | undefined;
  const top = sub as Stripe.Subscription & { current_period_start?: number | null; current_period_end?: number | null };
  return {
    start: top.current_period_start ?? item?.current_period_start ?? null,
    end: top.current_period_end ?? item?.current_period_end ?? null,
  };
}

async function upsertSubscriptionFromStripe(args: { userId: string; sub: Stripe.Subscription }): Promise<void> {
  const { start: startTs, end: endTs } = getPeriodTimestamps(args.sub);
  const start = startTs ? new Date(startTs * 1000) : null;
  const end = endTs ? new Date(endTs * 1000) : null;
  const canceledAt = args.sub.canceled_at ? new Date(args.sub.canceled_at * 1000) : null;

  await db
    .insert(subscription)
    .values({
      userId: args.userId,
      provider: "stripe",
      providerCustomerId: typeof args.sub.customer === "string" ? args.sub.customer : args.sub.customer.id,
      providerSubscriptionId: args.sub.id,
      status: args.sub.status,
      currentPeriodStart: start,
      currentPeriodEnd: end,
      cancelAtPeriodEnd: args.sub.cancel_at_period_end ?? false,
      canceledAt,
      metadata: args.sub.metadata ? { ...args.sub.metadata } : null,
    })
    .onConflictDoUpdate({
      target: subscription.providerSubscriptionId,
      set: {
        status: args.sub.status,
        currentPeriodStart: start,
        currentPeriodEnd: end,
        cancelAtPeriodEnd: args.sub.cancel_at_period_end ?? false,
        canceledAt,
        metadata: args.sub.metadata ? { ...args.sub.metadata } : null,
        updatedAt: new Date(),
      },
    });

  await refreshUserPlanFromSubscription({
    userId: args.userId,
    status: args.sub.status,
    currentPeriodEnd: end,
  });
}

async function recordExportPurchase(args: { session: Stripe.Checkout.Session }): Promise<void> {
  const metadata = args.session.metadata ?? {};
  const userId = metadata.user_id ?? metadata.userId;
  const resumeId = metadata.resume_id ?? metadata.resumeId;
  const paymentIntentId =
    typeof args.session.payment_intent === "string" ? args.session.payment_intent : args.session.payment_intent?.id;

  if (!userId || !resumeId || !paymentIntentId) {
    captureException(new Error("Stripe export checkout missing required metadata"), {
      sessionId: args.session.id,
      metadata,
    });
    return;
  }

  await db
    .insert(resumeExportEntitlement)
    .values({
      userId,
      resumeId,
      stripePaymentIntentId: paymentIntentId,
      amountCents: args.session.amount_total ?? 0,
      currency: args.session.currency ?? "brl",
    })
    .onConflictDoNothing();
}

async function handleCheckoutSessionCompleted(session: Stripe.Checkout.Session, stripe: Stripe): Promise<void> {
  if (session.mode === "payment") {
    await recordExportPurchase({ session });
    return;
  }

  if (session.mode === "subscription") {
    if (!session.subscription) return;
    const subId = typeof session.subscription === "string" ? session.subscription : session.subscription.id;
    const sub = await stripe.subscriptions.retrieve(subId);
    const customerId = typeof sub.customer === "string" ? sub.customer : sub.customer.id;
    const userRow = await findUserByStripeCustomerId(customerId);
    if (!userRow) {
      captureException(new Error("Stripe subscription checkout references unknown customer"), {
        sessionId: session.id,
        customerId,
      });
      return;
    }
    await upsertSubscriptionFromStripe({ userId: userRow.id, sub });
  }
}

async function handleSubscriptionUpdate(sub: Stripe.Subscription): Promise<void> {
  const customerId = typeof sub.customer === "string" ? sub.customer : sub.customer.id;
  const userRow = await findUserByStripeCustomerId(customerId);
  if (!userRow) return;
  await upsertSubscriptionFromStripe({ userId: userRow.id, sub });
}

async function handleInvoicePaymentSucceeded(invoice: Stripe.Invoice, stripe: Stripe): Promise<void> {
  // Retrieve the linked subscription if present (recurring renewals only).
  const subId = (invoice as Stripe.Invoice & { subscription?: string }).subscription;
  if (!subId) return;
  const sub = await stripe.subscriptions.retrieve(subId);
  await handleSubscriptionUpdate(sub);
}

async function handleInvoicePaymentFailed(invoice: Stripe.Invoice, stripe: Stripe): Promise<void> {
  const subId = (invoice as Stripe.Invoice & { subscription?: string }).subscription;
  if (!subId) return;
  const sub = await stripe.subscriptions.retrieve(subId);
  await handleSubscriptionUpdate(sub);
}

export async function handleStripeWebhookEvent(event: Stripe.Event, stripe: Stripe): Promise<void> {
  // Idempotency: insert event id into log; bail if already seen.
  if (await alreadyProcessed(event.id, event.type)) return;

  switch (event.type) {
    case "checkout.session.completed":
      await handleCheckoutSessionCompleted(event.data.object, stripe);
      break;

    case "customer.subscription.created":
    case "customer.subscription.updated":
    case "customer.subscription.deleted":
      await handleSubscriptionUpdate(event.data.object);
      break;

    case "invoice.payment_succeeded":
      await handleInvoicePaymentSucceeded(event.data.object, stripe);
      break;

    case "invoice.payment_failed":
      await handleInvoicePaymentFailed(event.data.object, stripe);
      break;

    default:
      // Ignore other events; they're logged for replay if needed.
      break;
  }
}

// Demotes users whose Premium plan has expired without a renewal webhook.
// Defensive — should normally be a no-op since `customer.subscription.updated`
// keeps `plan_expires_at` fresh.
export async function expireLapsedPlans(): Promise<number> {
  const result = await db
    .update(user)
    .set({ plan: "free", planExpiresAt: null })
    .where(sql`${user.plan} = 'premium' AND ${user.planExpiresAt} IS NOT NULL AND ${user.planExpiresAt} < now()`);
  return result.rowCount ?? 0;
}
