import Stripe from "stripe";

import { env } from "@/utils/env";

let cached: Stripe | null = null;

export function getStripe(): Stripe {
  if (!env.BILLING_ENABLED) {
    throw new Error("Billing is disabled. Set BILLING_ENABLED=true and configure Stripe env vars.");
  }
  if (!env.STRIPE_SECRET_KEY) {
    throw new Error("STRIPE_SECRET_KEY is not configured.");
  }
  if (!cached) {
    cached = new Stripe(env.STRIPE_SECRET_KEY, {
      apiVersion: "2026-04-22.dahlia",
      appInfo: { name: "Currículos IA" },
      typescript: true,
    });
  }
  return cached;
}

// Test-only override.
export function __setStripeForTesting(client: Stripe | null) {
  cached = client;
}
