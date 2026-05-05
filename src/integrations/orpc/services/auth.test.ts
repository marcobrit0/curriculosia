import { beforeEach, describe, expect, it, vi } from "vite-plus/test";

// --- Mocks ---

const mockSelect = {
  from: vi.fn().mockReturnThis(),
  where: vi.fn().mockReturnThis(),
  limit: vi.fn(),
};

const mockDeleteChain = {
  where: vi.fn(),
};
const mockDelete = vi.fn().mockReturnValue(mockDeleteChain);

const mockStorageDelete = vi.fn();

vi.mock("@/integrations/drizzle/client", () => ({
  db: {
    select: () => mockSelect,
    delete: (...args: unknown[]) => mockDelete(...args),
  },
}));

const fakeSchema = {
  user: { id: { name: "id" }, plan: { name: "plan" }, planExpiresAt: { name: "plan_expires_at" } },
  resume: { id: { name: "id" }, userId: { name: "user_id" } },
  subscription: { id: { name: "id" }, userId: { name: "user_id" } },
  aiUsage: { period: { name: "period" }, userId: { name: "user_id" } },
};

vi.mock("@/integrations/drizzle", () => ({
  schema: fakeSchema,
}));

vi.mock("@/integrations/drizzle/schema", () => fakeSchema);

vi.mock("@/utils/env", () => ({
  env: {
    GOOGLE_CLIENT_ID: undefined,
    GOOGLE_CLIENT_SECRET: undefined,
    GITHUB_CLIENT_ID: undefined,
    GITHUB_CLIENT_SECRET: undefined,
    OAUTH_CLIENT_ID: undefined,
    OAUTH_CLIENT_SECRET: undefined,
  },
}));

vi.mock("./storage", () => ({
  getStorageService: () => ({ delete: mockStorageDelete }),
}));

const { authService } = await import("./auth");

beforeEach(() => {
  mockSelect.from.mockClear().mockReturnThis();
  mockSelect.where.mockReset();
  mockSelect.limit.mockReset();
  mockDelete.mockClear().mockReturnValue(mockDeleteChain);
  mockDeleteChain.where.mockReset();
  mockStorageDelete.mockReset();
});

// --- exportData ---

describe("exportData", () => {
  it("returns user, resumes, subscriptions, and aiUsage in a single document", async () => {
    const now = new Date("2026-05-05T12:00:00.000Z");

    // User query: .from().where().limit(1) — where chains; limit resolves.
    mockSelect.where.mockReturnValueOnce(mockSelect);
    mockSelect.limit.mockResolvedValueOnce([
      {
        id: "user-1",
        name: "Test User",
        email: "test@example.com",
        username: "testuser",
        displayUsername: "testuser",
        image: null,
        plan: "premium",
        planExpiresAt: new Date("2027-01-01T00:00:00.000Z"),
        acceptedTermsAt: now,
        createdAt: now,
        updatedAt: now,
      },
    ]);

    // Subsequent queries (resumes/subscriptions/aiUsage) end at .where()
    // resumes
    mockSelect.where.mockResolvedValueOnce([
      {
        id: "resume-1",
        name: "Resume",
        slug: "resume",
        tags: ["test"],
        isPublic: false,
        isLocked: false,
        data: { foo: "bar" },
        createdAt: now,
        updatedAt: now,
      },
    ]);

    // subscriptions
    mockSelect.where.mockResolvedValueOnce([
      {
        id: "sub-1",
        provider: "stripe",
        status: "active",
        currentPeriodStart: now,
        currentPeriodEnd: new Date("2026-06-05T12:00:00.000Z"),
        cancelAtPeriodEnd: false,
        canceledAt: null,
        createdAt: now,
        updatedAt: now,
      },
    ]);

    // aiUsage
    mockSelect.where.mockResolvedValueOnce([{ period: "2026-05", requestCount: 17 }]);

    const result = await authService.exportData({ userId: "user-1" });

    expect(result.user.id).toBe("user-1");
    expect(result.user.email).toBe("test@example.com");
    expect(result.user.acceptedTermsAt).toBe(now.toISOString());
    expect(result.resumes).toHaveLength(1);
    expect(result.resumes[0].id).toBe("resume-1");
    expect(result.subscriptions).toHaveLength(1);
    expect(result.subscriptions[0].provider).toBe("stripe");
    expect(result.aiUsage).toEqual([{ period: "2026-05", requestCount: 17 }]);
    expect(typeof result.exportedAt).toBe("string");
  });

  it("throws NOT_FOUND when the user does not exist", async () => {
    mockSelect.where.mockReturnValueOnce(mockSelect);
    mockSelect.limit.mockResolvedValueOnce([]);

    await expect(authService.exportData({ userId: "missing" })).rejects.toThrow();
  });
});

// --- deleteAccount ---

describe("deleteAccount", () => {
  it("deletes user files via storage then deletes the user row (cascade fires at the DB)", async () => {
    mockStorageDelete.mockResolvedValue(undefined);
    mockDeleteChain.where.mockResolvedValue(undefined);

    await authService.deleteAccount({ userId: "user-1" });

    expect(mockStorageDelete).toHaveBeenCalledWith("uploads/user-1");
    expect(mockDelete).toHaveBeenCalledWith(fakeSchema.user);
    expect(mockDeleteChain.where).toHaveBeenCalledTimes(1);
  });

  it("ignores storage errors and still deletes the user row", async () => {
    mockStorageDelete.mockRejectedValue(new Error("network blip"));
    mockDeleteChain.where.mockResolvedValue(undefined);

    await expect(authService.deleteAccount({ userId: "user-1" })).resolves.toBeUndefined();
    expect(mockDeleteChain.where).toHaveBeenCalled();
  });

  it("returns silently on empty userId", async () => {
    await authService.deleteAccount({ userId: "" });
    expect(mockStorageDelete).not.toHaveBeenCalled();
    expect(mockDeleteChain.where).not.toHaveBeenCalled();
  });

  it("throws when the user-row delete fails", async () => {
    mockStorageDelete.mockResolvedValue(undefined);
    mockDeleteChain.where.mockRejectedValue(new Error("FK violation"));

    await expect(authService.deleteAccount({ userId: "user-1" })).rejects.toThrow();
  });
});
