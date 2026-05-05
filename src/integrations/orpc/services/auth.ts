import { ORPCError } from "@orpc/client";
import { eq } from "drizzle-orm";

import type { AuthProvider } from "@/integrations/auth/types";

import { schema } from "@/integrations/drizzle";
import { db } from "@/integrations/drizzle/client";
import { env } from "@/utils/env";

import { getStorageService } from "./storage";

export type ProviderList = Partial<Record<AuthProvider, string>>;

export type UserDataExport = {
  exportedAt: string;
  user: {
    id: string;
    name: string;
    email: string;
    username: string;
    displayUsername: string;
    image: string | null;
    plan: string;
    planExpiresAt: string | null;
    acceptedTermsAt: string | null;
    createdAt: string;
    updatedAt: string;
  };
  resumes: Array<{
    id: string;
    name: string;
    slug: string;
    tags: string[];
    isPublic: boolean;
    isLocked: boolean;
    data: unknown;
    createdAt: string;
    updatedAt: string;
  }>;
  subscriptions: Array<{
    id: string;
    provider: string;
    status: string;
    currentPeriodStart: string | null;
    currentPeriodEnd: string | null;
    cancelAtPeriodEnd: boolean;
    canceledAt: string | null;
    createdAt: string;
    updatedAt: string;
  }>;
  aiUsage: Array<{
    period: string;
    requestCount: number;
  }>;
};

const providers = {
  list: (): ProviderList => {
    const providers: ProviderList = { credential: "Password" };

    if (env.GOOGLE_CLIENT_ID && env.GOOGLE_CLIENT_SECRET) providers.google = "Google";
    if (env.GITHUB_CLIENT_ID && env.GITHUB_CLIENT_SECRET) providers.github = "GitHub";
    if (env.OAUTH_CLIENT_ID && env.OAUTH_CLIENT_SECRET) providers.custom = env.OAUTH_PROVIDER_NAME ?? "Custom OAuth";

    return providers;
  },
};

export const authService = {
  providers,

  exportData: async (input: { userId: string }): Promise<UserDataExport> => {
    const [userRow] = await db.select().from(schema.user).where(eq(schema.user.id, input.userId)).limit(1);
    if (!userRow) throw new ORPCError("NOT_FOUND");

    const resumes = await db.select().from(schema.resume).where(eq(schema.resume.userId, input.userId));
    const subscriptions = await db
      .select()
      .from(schema.subscription)
      .where(eq(schema.subscription.userId, input.userId));
    const aiUsageRows = await db.select().from(schema.aiUsage).where(eq(schema.aiUsage.userId, input.userId));

    return {
      exportedAt: new Date().toISOString(),
      user: {
        id: userRow.id,
        name: userRow.name,
        email: userRow.email,
        username: userRow.username,
        displayUsername: userRow.displayUsername,
        image: userRow.image,
        plan: userRow.plan,
        planExpiresAt: userRow.planExpiresAt?.toISOString() ?? null,
        acceptedTermsAt: userRow.acceptedTermsAt?.toISOString() ?? null,
        createdAt: userRow.createdAt.toISOString(),
        updatedAt: userRow.updatedAt.toISOString(),
      },
      resumes: resumes.map((r) => ({
        id: r.id,
        name: r.name,
        slug: r.slug,
        tags: r.tags,
        isPublic: r.isPublic,
        isLocked: r.isLocked,
        data: r.data,
        createdAt: r.createdAt.toISOString(),
        updatedAt: r.updatedAt.toISOString(),
      })),
      subscriptions: subscriptions.map((s) => ({
        id: s.id,
        provider: s.provider,
        status: s.status,
        currentPeriodStart: s.currentPeriodStart?.toISOString() ?? null,
        currentPeriodEnd: s.currentPeriodEnd?.toISOString() ?? null,
        cancelAtPeriodEnd: s.cancelAtPeriodEnd,
        canceledAt: s.canceledAt?.toISOString() ?? null,
        createdAt: s.createdAt.toISOString(),
        updatedAt: s.updatedAt.toISOString(),
      })),
      aiUsage: aiUsageRows.map((a) => ({
        period: a.period,
        requestCount: a.requestCount,
      })),
    };
  },

  deleteAccount: async (input: { userId: string }): Promise<void> => {
    if (!input.userId || input.userId.length === 0) return;

    const storageService = getStorageService();

    // Delete all user files in one call (pictures, screenshots, pdfs)
    // The storage service delete method supports recursive deletion via prefix
    try {
      await storageService.delete(`uploads/${input.userId}`);
    } catch {
      // Ignore error and proceed with deleting user
    }

    try {
      await db.delete(schema.user).where(eq(schema.user.id, input.userId));
    } catch (err) {
      console.error("Failed to delete user record:", err);

      throw new ORPCError("INTERNAL_SERVER_ERROR");
    }
  },
};
