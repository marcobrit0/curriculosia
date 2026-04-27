import type { User } from "better-auth";

import { ORPCError, os } from "@orpc/server";
import { eq } from "drizzle-orm";

import type { Locale } from "@/utils/locale";

import { env } from "@/utils/env";

import { auth, verifyOAuthToken } from "../auth/config";
import { db } from "../drizzle/client";
import { user } from "../drizzle/schema";

interface ORPCContext {
  locale: Locale;
  reqHeaders?: Headers;
}

async function getUserFromBearerToken(headers: Headers): Promise<User | null> {
  try {
    const authHeader = headers.get("authorization");
    if (!authHeader?.startsWith("Bearer ")) return null;

    const payload = await verifyOAuthToken(authHeader.slice(7));
    if (!payload?.sub) return null;

    const [userResult] = await db.select().from(user).where(eq(user.id, payload.sub)).limit(1);
    return userResult ?? null;
  } catch {
    return null;
  }
}

async function getUserFromHeaders(headers: Headers): Promise<User | null> {
  try {
    const result = await auth.api.getSession({ headers });
    if (!result || !result.user) return null;

    return result.user;
  } catch {
    return null;
  }
}

async function getUserFromApiKey(apiKey: string): Promise<User | null> {
  try {
    const result = await auth.api.verifyApiKey({ body: { key: apiKey } });
    if (!result.key || !result.valid) return null;

    const [userResult] = await db.select().from(user).where(eq(user.id, result.key.referenceId)).limit(1);
    if (!userResult) return null;

    return userResult;
  } catch {
    return null;
  }
}

const base = os.$context<ORPCContext>();

export const publicProcedure = base.use(async ({ context, next }) => {
  const headers = context.reqHeaders ?? new Headers();
  const apiKey = headers.get("x-api-key");

  const user = apiKey
    ? await getUserFromApiKey(apiKey)
    : ((await getUserFromBearerToken(headers)) ?? (await getUserFromHeaders(headers)));

  return next({
    context: {
      ...context,
      user: user ?? null,
    },
  });
});

export const protectedProcedure = publicProcedure.use(async ({ context, next }) => {
  if (!context.user) throw new ORPCError("UNAUTHORIZED");

  return next({
    context: {
      ...context,
      user: context.user,
    },
  });
});

/**
 * Authenticated procedure for AI endpoints. Rejects requests when AI features
 * are globally disabled via FLAG_DISABLE_AI. This is the choke point that will
 * be replaced with a per-user premium check once subscriptions are wired up.
 */
export const gatedAIProcedure = protectedProcedure.use(async ({ context, next }) => {
  if (env.FLAG_DISABLE_AI) {
    throw new ORPCError("FORBIDDEN", { message: "AI features are currently disabled" });
  }

  return next({ context });
});

/**
 * Server-only procedure that can only be called from server-side code (e.g., loaders).
 * Rejects requests from the browser with a 401 UNAUTHORIZED error.
 */
export const serverOnlyProcedure = publicProcedure.use(async ({ context, next }) => {
  const headers = context.reqHeaders ?? new Headers();
  // Defense in depth: the bypass requires NODE_ENV !== "production" AND no Fly
  // app context, on top of the operator opting in via FLAG_DEBUG_PRINTER.
  const isNonProduction = process.env.NODE_ENV !== "production" && !process.env.FLY_APP_NAME;
  const isDebugBypassEnabled = env.FLAG_DEBUG_PRINTER && isNonProduction;

  // Check for the custom header that indicates this is a server-side call
  // Server-side calls using createRouterClient have this header set
  const isServerSideCall = isDebugBypassEnabled || headers.get("x-server-side-call") === "true";

  // If the header is not present, this is a client-side HTTP request - reject it
  if (!isServerSideCall) {
    throw new ORPCError("UNAUTHORIZED", {
      message: "This endpoint can only be called from server-side code",
    });
  }

  return next({ context });
});
