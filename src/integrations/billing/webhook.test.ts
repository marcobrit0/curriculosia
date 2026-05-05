import type Stripe from "stripe";

import { beforeEach, describe, expect, it, vi } from "vite-plus/test";

// --- DB mock chain ---

type Chain = Record<string, ReturnType<typeof vi.fn>>;

function makeChain(): Chain {
  const c: Chain = {};
  c.values = vi.fn().mockReturnValue(c);
  c.set = vi.fn().mockReturnValue(c);
  c.where = vi.fn().mockReturnValue(c);
  c.from = vi.fn().mockReturnValue(c);
  c.limit = vi.fn();
  c.onConflictDoNothing = vi.fn().mockReturnValue(c);
  c.onConflictDoUpdate = vi.fn().mockReturnValue(c);
  c.returning = vi.fn();
  return c;
}

const insertChain = makeChain();
const selectChain = makeChain();
const updateChain = makeChain();

const insert = vi.fn().mockReturnValue(insertChain);
const select = vi.fn().mockReturnValue(selectChain);
const update = vi.fn().mockReturnValue(updateChain);

vi.mock("@/integrations/drizzle/client", () => ({
  db: {
    insert: (...args: unknown[]) => insert(...args),
    select: (...args: unknown[]) => select(...args),
    update: (...args: unknown[]) => update(...args),
  },
}));

vi.mock("@/integrations/drizzle/schema", () => ({
  user: { id: { name: "id" }, stripeCustomerId: { name: "stripe_customer_id" } },
  subscription: { providerSubscriptionId: { name: "provider_subscription_id" } },
  resumeExportEntitlement: { id: { name: "id" } },
  billingEventLog: { stripeEventId: { name: "stripe_event_id" } },
}));

const captureMock = vi.fn();
vi.mock("@/integrations/sentry", () => ({
  captureException: (...args: unknown[]) => captureMock(...args),
}));

const { handleStripeWebhookEvent } = await import("./webhook");

// --- Helpers ---

function makeSubscription(overrides: Record<string, unknown> = {}): Stripe.Subscription {
  const now = Math.floor(Date.now() / 1000);
  return {
    id: "sub_123",
    object: "subscription",
    customer: "cus_123",
    status: "active",
    current_period_start: now,
    current_period_end: now + 30 * 24 * 60 * 60,
    cancel_at_period_end: false,
    canceled_at: null,
    metadata: {},
    items: { data: [] },
    ...overrides,
  } as unknown as Stripe.Subscription;
}

function makeStripe(overrides: { retrieve?: ReturnType<typeof vi.fn> } = {}): Stripe {
  const subs = {
    retrieve: vi.fn(async () => makeSubscription()),
    ...overrides,
  };
  return { subscriptions: subs } as unknown as Stripe;
}

function eventLogReturnsNew(): void {
  // First insert returning {stripeEventId: "..."} = "we own this event"
  insertChain.returning.mockReturnValueOnce(Promise.resolve([{ stripeEventId: "evt_test" }]));
}

function eventLogReturnsDuplicate(): void {
  insertChain.returning.mockReturnValueOnce(Promise.resolve([]));
}

function selectUserOnce(user: { id: string } | null): void {
  selectChain.limit.mockReturnValueOnce(Promise.resolve(user ? [user] : []));
}

beforeEach(() => {
  insert.mockClear().mockReturnValue(insertChain);
  select.mockClear().mockReturnValue(selectChain);
  update.mockClear().mockReturnValue(updateChain);

  Object.values(insertChain).forEach((fn) => fn.mockClear?.());
  Object.values(selectChain).forEach((fn) => fn.mockClear?.());
  Object.values(updateChain).forEach((fn) => fn.mockClear?.());

  insertChain.values.mockReturnValue(insertChain);
  insertChain.onConflictDoNothing.mockReturnValue(insertChain);
  insertChain.onConflictDoUpdate.mockReturnValue(insertChain);
  selectChain.from.mockReturnValue(selectChain);
  selectChain.where.mockReturnValue(selectChain);
  updateChain.set.mockReturnValue(updateChain);
  updateChain.where.mockReturnValue(undefined);

  captureMock.mockReset();
});

// --- Tests ---

describe("idempotency", () => {
  it("skips processing when the event id already exists in the log", async () => {
    eventLogReturnsDuplicate();

    const stripe = makeStripe();
    const subRetrieve = stripe.subscriptions.retrieve as ReturnType<typeof vi.fn>;

    await handleStripeWebhookEvent(
      {
        id: "evt_test",
        type: "customer.subscription.updated",
        data: { object: makeSubscription() },
      } as unknown as Stripe.Event,
      stripe,
    );

    // No state-changing writes happen on duplicate
    expect(subRetrieve).not.toHaveBeenCalled();
    expect(update).not.toHaveBeenCalled();
  });
});

describe("checkout.session.completed (mode=payment)", () => {
  it("inserts a resume_export_entitlement when metadata is present", async () => {
    eventLogReturnsNew();

    const stripe = makeStripe();
    const session = {
      id: "cs_123",
      mode: "payment",
      payment_intent: "pi_abc",
      amount_total: 999,
      currency: "brl",
      metadata: { user_id: "user-1", resume_id: "resume-1" },
    } as unknown as Stripe.Checkout.Session;

    await handleStripeWebhookEvent(
      { id: "evt_export_1", type: "checkout.session.completed", data: { object: session } } as unknown as Stripe.Event,
      stripe,
    );

    // First insert is the event log; second insert should be the entitlement.
    expect(insert).toHaveBeenCalledTimes(2);
    expect(insertChain.values).toHaveBeenCalledWith(
      expect.objectContaining({
        userId: "user-1",
        resumeId: "resume-1",
        stripePaymentIntentId: "pi_abc",
        amountCents: 999,
        currency: "brl",
      }),
    );
  });

  it("captures Sentry exception when metadata is missing", async () => {
    eventLogReturnsNew();

    const stripe = makeStripe();
    const session = {
      id: "cs_123",
      mode: "payment",
      payment_intent: "pi_abc",
      metadata: {}, // missing user_id / resume_id
    } as unknown as Stripe.Checkout.Session;

    await handleStripeWebhookEvent(
      { id: "evt_export_2", type: "checkout.session.completed", data: { object: session } } as unknown as Stripe.Event,
      stripe,
    );

    expect(captureMock).toHaveBeenCalled();
  });
});

describe("checkout.session.completed (mode=subscription)", () => {
  it("upserts the subscription row and bumps the user plan when customer matches", async () => {
    eventLogReturnsNew();
    selectUserOnce({ id: "user-1" });

    const sub = makeSubscription({ status: "active" });
    const stripe = makeStripe({
      retrieve: vi.fn(async () => sub),
    });

    const session = {
      id: "cs_456",
      mode: "subscription",
      subscription: "sub_123",
    } as unknown as Stripe.Checkout.Session;

    await handleStripeWebhookEvent(
      { id: "evt_sub_1", type: "checkout.session.completed", data: { object: session } } as unknown as Stripe.Event,
      stripe,
    );

    expect(stripe.subscriptions.retrieve).toHaveBeenCalledWith("sub_123");
    expect(insert).toHaveBeenCalledTimes(2); // event log + subscription upsert
    expect(insertChain.values).toHaveBeenCalledWith(
      expect.objectContaining({ userId: "user-1", providerSubscriptionId: "sub_123", status: "active" }),
    );
    // user plan flipped to premium
    expect(update).toHaveBeenCalled();
    expect(updateChain.set).toHaveBeenCalledWith(expect.objectContaining({ plan: "premium" }));
  });

  it("captures Sentry exception when no user matches the customer", async () => {
    eventLogReturnsNew();
    selectUserOnce(null);

    const stripe = makeStripe();

    const session = {
      id: "cs_999",
      mode: "subscription",
      subscription: "sub_unknown",
    } as unknown as Stripe.Checkout.Session;

    await handleStripeWebhookEvent(
      {
        id: "evt_sub_unknown",
        type: "checkout.session.completed",
        data: { object: session },
      } as unknown as Stripe.Event,
      stripe,
    );

    expect(captureMock).toHaveBeenCalled();
    // No upsert happened
    expect(update).not.toHaveBeenCalled();
  });
});

describe("subscription lifecycle status → plan flip", () => {
  it("active subscription → user.plan = premium", async () => {
    eventLogReturnsNew();
    selectUserOnce({ id: "user-1" });

    const sub = makeSubscription({ status: "active" });
    const stripe = makeStripe();

    await handleStripeWebhookEvent(
      { id: "evt_active", type: "customer.subscription.updated", data: { object: sub } } as unknown as Stripe.Event,
      stripe,
    );

    expect(updateChain.set).toHaveBeenCalledWith(expect.objectContaining({ plan: "premium" }));
  });

  it("canceled subscription with past period_end → user.plan = free", async () => {
    eventLogReturnsNew();
    selectUserOnce({ id: "user-1" });

    const past = Math.floor(Date.now() / 1000) - 60 * 60 * 24;
    const sub = makeSubscription({ status: "canceled", current_period_end: past });
    const stripe = makeStripe();

    await handleStripeWebhookEvent(
      { id: "evt_canceled", type: "customer.subscription.deleted", data: { object: sub } } as unknown as Stripe.Event,
      stripe,
    );

    expect(updateChain.set).toHaveBeenCalledWith(expect.objectContaining({ plan: "free" }));
  });

  it("past_due keeps premium during the grace window", async () => {
    eventLogReturnsNew();
    selectUserOnce({ id: "user-1" });

    const future = Math.floor(Date.now() / 1000) + 60 * 60 * 24;
    const sub = makeSubscription({ status: "past_due", current_period_end: future });
    const stripe = makeStripe();

    await handleStripeWebhookEvent(
      { id: "evt_past_due", type: "customer.subscription.updated", data: { object: sub } } as unknown as Stripe.Event,
      stripe,
    );

    expect(updateChain.set).toHaveBeenCalledWith(expect.objectContaining({ plan: "premium" }));
  });
});
