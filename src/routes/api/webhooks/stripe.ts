import { createFileRoute } from "@tanstack/react-router";

import { getStripe } from "@/integrations/billing/client";
import { handleStripeWebhookEvent } from "@/integrations/billing/webhook";
import { captureException } from "@/integrations/sentry";
import { env } from "@/utils/env";

async function handler({ request }: { request: Request }) {
  if (!env.BILLING_ENABLED || !env.STRIPE_WEBHOOK_SECRET) {
    return new Response("Billing not configured", { status: 503 });
  }

  const signature = request.headers.get("stripe-signature");
  if (!signature) {
    return new Response("Missing Stripe signature", { status: 400 });
  }

  // Stripe HMAC must be computed against the raw bytes of the request body.
  // Read once via arrayBuffer; do not re-parse downstream.
  const rawBody = Buffer.from(await request.arrayBuffer());

  const stripe = getStripe();
  let event;
  try {
    event = stripe.webhooks.constructEvent(rawBody, signature, env.STRIPE_WEBHOOK_SECRET);
  } catch (error) {
    captureException(error, { handler: "stripe-webhook", reason: "signature-verification-failed" });
    return new Response("Invalid signature", { status: 400 });
  }

  try {
    await handleStripeWebhookEvent(event, stripe);
  } catch (error) {
    captureException(error, { handler: "stripe-webhook", eventType: event.type, eventId: event.id });
    // Return 5xx so Stripe retries — only when the failure is on our side.
    return new Response("Processing failed", { status: 500 });
  }

  return new Response("ok", { status: 200 });
}

export const Route = createFileRoute("/api/webhooks/stripe")({
  server: {
    handlers: {
      POST: handler,
    },
  },
});
