import { beforeEach, describe, expect, it, vi } from "vite-plus/test";

// --- Mocks ---

const mockSelect = {
  from: vi.fn().mockReturnThis(),
  where: vi.fn().mockReturnThis(),
  limit: vi.fn(),
};

const mockInsert = {
  values: vi.fn().mockReturnThis(),
  onConflictDoUpdate: vi.fn().mockReturnThis(),
  returning: vi.fn(),
};

vi.mock("@/integrations/drizzle/client", () => ({
  db: {
    select: () => mockSelect,
    insert: () => mockInsert,
  },
}));

vi.mock("@/integrations/drizzle/schema", () => ({
  aiUsage: {
    userId: { name: "user_id" },
    period: { name: "period" },
    requestCount: { name: "request_count" },
  },
}));

vi.mock("@/utils/env", () => ({
  env: { AI_MONTHLY_REQUEST_CAP: 200 },
}));

const { getCurrentPeriod, getUsage, incrementUsage } = await import("./ai-usage");

beforeEach(() => {
  mockSelect.from.mockClear().mockReturnThis();
  mockSelect.where.mockClear().mockReturnThis();
  mockSelect.limit.mockReset();
  mockInsert.values.mockClear().mockReturnThis();
  mockInsert.onConflictDoUpdate.mockClear().mockReturnThis();
  mockInsert.returning.mockReset();
});

// --- Pure helpers ---

describe("getCurrentPeriod", () => {
  it("returns YYYY-MM in UTC", () => {
    expect(getCurrentPeriod(new Date(Date.UTC(2026, 4, 5, 12, 0, 0)))).toBe("2026-05");
  });

  it("uses UTC, not local time, at month boundaries", () => {
    // 2026-01-01T00:00:00Z is January in UTC regardless of local TZ
    expect(getCurrentPeriod(new Date(Date.UTC(2026, 0, 1, 0, 0, 0)))).toBe("2026-01");
    // Last second of December UTC stays in December
    expect(getCurrentPeriod(new Date(Date.UTC(2026, 11, 31, 23, 59, 59)))).toBe("2026-12");
  });
});

// --- getUsage ---

describe("getUsage", () => {
  it("returns zero used / cap remaining when no row exists", async () => {
    mockSelect.limit.mockResolvedValue([]);

    const usage = await getUsage("user-1", "2026-05");

    expect(usage.used).toBe(0);
    expect(usage.cap).toBe(200);
    expect(usage.remaining).toBe(200);
    expect(usage.period).toBe("2026-05");
    expect(usage.periodEnd).toEqual(new Date(Date.UTC(2026, 5, 1)));
  });

  it("returns requestCount from the row when it exists", async () => {
    mockSelect.limit.mockResolvedValue([{ requestCount: 75 }]);

    const usage = await getUsage("user-1", "2026-05");

    expect(usage.used).toBe(75);
    expect(usage.remaining).toBe(125);
  });

  it("clamps remaining at zero when over cap", async () => {
    mockSelect.limit.mockResolvedValue([{ requestCount: 250 }]);

    const usage = await getUsage("user-1", "2026-05");

    expect(usage.used).toBe(250);
    expect(usage.remaining).toBe(0);
  });

  it("computes periodEnd as the first instant of the next UTC month", async () => {
    mockSelect.limit.mockResolvedValue([]);

    const dec = await getUsage("user-1", "2026-12");
    expect(dec.periodEnd).toEqual(new Date(Date.UTC(2027, 0, 1)));

    const jan = await getUsage("user-1", "2026-01");
    expect(jan.periodEnd).toEqual(new Date(Date.UTC(2026, 1, 1)));
  });
});

// --- incrementUsage ---

describe("incrementUsage", () => {
  it("returns the post-increment count from the UPSERT", async () => {
    mockInsert.returning.mockResolvedValue([{ requestCount: 42 }]);

    const count = await incrementUsage("user-1", "2026-05");

    expect(count).toBe(42);
    expect(mockInsert.values).toHaveBeenCalledWith({ userId: "user-1", period: "2026-05", requestCount: 1 });
    expect(mockInsert.onConflictDoUpdate).toHaveBeenCalled();
  });

  it("falls back to 1 when RETURNING is empty (e.g., race condition stub)", async () => {
    mockInsert.returning.mockResolvedValue([]);

    const count = await incrementUsage("user-1", "2026-05");

    expect(count).toBe(1);
  });
});
