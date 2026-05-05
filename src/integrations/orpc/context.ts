import type { User } from "better-auth";

import { ORPCError, os } from "@orpc/server";
import { eq } from "drizzle-orm";

import type { Locale } from "@/utils/locale";

import { env } from "@/utils/env";

import { auth, verifyOAuthToken } from "../auth/config";
import { db } from "../drizzle/client";
import { user } from "../drizzle/schema";
import { isPremiumUser } from "./services/ai";

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
 * Authenticated procedure for AI endpoints. Decides per-request whether to
 * route through BYO (user-supplied credentials) or managed (server's
 * OPENROUTER_API_KEY, gated to plan === "premium") based on FLAG_AI_MODE
 * and the user's plan. Adds `aiMode` to context so handlers can resolve
 * credentials via `resolveAICredentials`.
 */
export const aiProcedure = protectedProcedure.use(async ({ context, next }) => {
  if (env.FLAG_DISABLE_AI) {
    throw new ORPCError("FORBIDDEN", { message: "AI features are currently disabled" });
  }

  const flagMode = env.FLAG_AI_MODE;
  let aiMode: "byo" | "managed";

  if (flagMode === "byo") {
    aiMode = "byo";
  } else {
    const isPremium = await isPremiumUser(context.user.id);

    if (flagMode === "managed") {
      if (!isPremium) {
        throw new ORPCError("FORBIDDEN", {
          message: "AI features require a Premium plan.",
        });
      }
      aiMode = "managed";
    } else {
      // "both" — premium gets managed, free falls back to BYO
      aiMode = isPremium ? "managed" : "byo";
    }
  }

  if (aiMode === "managed" && !env.OPENROUTER_API_KEY) {
    throw new ORPCError("INTERNAL_SERVER_ERROR", {
      message: "Managed AI is not configured on this server.",
    });
  }

  return next({ context: { ...context, aiMode } });
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
