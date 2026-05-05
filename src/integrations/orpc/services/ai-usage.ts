import { and, eq, sql } from "drizzle-orm";

import { db } from "@/integrations/drizzle/client";
import { aiUsage } from "@/integrations/drizzle/schema";
import { env } from "@/utils/env";

export type AIUsage = {
  used: number;
  cap: number;
  remaining: number;
  period: string;
  periodEnd: Date;
};

export function getCurrentPeriod(now: Date = new Date()): string {
  // ISO 8601 UTC YYYY-MM, e.g. "2026-05".
  return now.toISOString().slice(0, 7);
}

function getPeriodEnd(period: string): Date {
  const [year, month] = period.split("-").map(Number);
  // First instant of the next UTC month.
  return new Date(Date.UTC(year, month, 1));
}

export async function getUsage(userId: string, period: string = getCurrentPeriod()): Promise<AIUsage> {
  const [row] = await db
    .select({ requestCount: aiUsage.requestCount })
    .from(aiUsage)
    .where(and(eq(aiUsage.userId, userId), eq(aiUsage.period, period)))
    .limit(1);

  const used = row?.requestCount ?? 0;
  const cap = env.AI_MONTHLY_REQUEST_CAP;
  return {
    used,
    cap,
    remaining: Math.max(0, cap - used),
    period,
    periodEnd: getPeriodEnd(period),
  };
}

// Atomic UPSERT-RETURNING. Safe under concurrent calls — each invocation
// returns the post-increment count and Postgres serializes the conflict
// resolution. Returns the new request_count.
export async function incrementUsage(userId: string, period: string = getCurrentPeriod()): Promise<number> {
  const [row] = await db
    .insert(aiUsage)
    .values({ userId, period, requestCount: 1 })
    .onConflictDoUpdate({
      target: [aiUsage.userId, aiUsage.period],
      set: {
        requestCount: sql`${aiUsage.requestCount} + 1`,
        updatedAt: new Date(),
      },
    })
    .returning({ requestCount: aiUsage.requestCount });

  return row?.requestCount ?? 1;
}
