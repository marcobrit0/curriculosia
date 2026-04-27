import { createEnv } from "@t3-oss/env-core";
import { z } from "zod";

const isProduction = process.env.NODE_ENV === "production";

const PLACEHOLDER_AUTH_SECRET = "change-me-to-a-secure-secret-key-in-production";

const authSecretSchema = z
  .string()
  .min(1)
  .superRefine((value, ctx) => {
    if (!isProduction) return;

    if (value === PLACEHOLDER_AUTH_SECRET) {
      ctx.addIssue({
        code: "custom",
        message:
          "AUTH_SECRET must not be the placeholder value in production. Generate one with `openssl rand -hex 32`.",
      });
    }

    if (value.length < 32) {
      ctx.addIssue({
        code: "custom",
        message: "AUTH_SECRET must be at least 32 characters in production.",
      });
    }
  });

export const env = createEnv({
  clientPrefix: "VITE_",
  runtimeEnv: process.env,
  emptyStringAsUndefined: true,

  client: {},

  server: {
    // Server
    TZ: z.string().default("Etc/UTC"),
    APP_URL: z.url({ protocol: /https?/ }),
    PRINTER_APP_URL: z.url({ protocol: /https?/ }).optional(),

    // Printer
    PRINTER_ENDPOINT: z.url({ protocol: /^(wss?|https?)$/ }),

    // Database
    DATABASE_URL: z.url({ protocol: /postgres(ql)?/ }),

    // Authentication
    AUTH_SECRET: authSecretSchema,
    BETTER_AUTH_API_KEY: z.string().min(1).optional(),

    // Social Auth (Google)
    GOOGLE_CLIENT_ID: z.string().min(1).optional(),
    GOOGLE_CLIENT_SECRET: z.string().min(1).optional(),

    // Social Auth (GitHub)
    GITHUB_CLIENT_ID: z.string().min(1).optional(),
    GITHUB_CLIENT_SECRET: z.string().min(1).optional(),

    // Custom OAuth Provider
    OAUTH_PROVIDER_NAME: z.string().min(1).optional(),
    OAUTH_CLIENT_ID: z.string().min(1).optional(),
    OAUTH_CLIENT_SECRET: z.string().min(1).optional(),
    OAUTH_DISCOVERY_URL: z.url({ protocol: /https?/ }).optional(),
    OAUTH_AUTHORIZATION_URL: z.url({ protocol: /https?/ }).optional(),
    OAUTH_TOKEN_URL: z.url({ protocol: /https?/ }).optional(),
    OAUTH_USER_INFO_URL: z.url({ protocol: /https?/ }).optional(),
    OAUTH_SCOPES: z
      .string()
      .min(1)
      .transform((value) => value.split(" "))
      .default(["openid", "profile", "email"]),

    // Email (SMTP)
    SMTP_HOST: z.string().min(1).optional(),
    SMTP_PORT: z.coerce.number().int().min(1).max(65535).default(587),
    SMTP_USER: z.string().min(1).optional(),
    SMTP_PASS: z.string().min(1).optional(),
    SMTP_FROM: z.string().min(1).optional(),
    SMTP_SECURE: z.stringbool().default(false),
    // In production, refuses to boot unless either SMTP_* is fully configured or
    // EMAIL_TRANSPORT is explicitly set to "console" (logs emails to stdout).
    EMAIL_TRANSPORT: z.enum(["smtp", "console"]).default("smtp"),

    // Storage (Optional)
    S3_ACCESS_KEY_ID: z.string().min(1).optional(),
    S3_SECRET_ACCESS_KEY: z.string().min(1).optional(),
    S3_REGION: z.string().default("us-east-1"),
    S3_ENDPOINT: z.url({ protocol: /https?/ }).optional(),
    S3_BUCKET: z.string().min(1).optional(),
    // Set to "true" for path-style URLs (endpoint/bucket), common with MinIO, SeaweedFS, etc.
    // Set to "false" for virtual-hosted-style URLs (bucket.endpoint), common with AWS S3, Cloudflare R2, etc.
    S3_FORCE_PATH_STYLE: z.stringbool().default(false),

    // Observability (optional)
    SENTRY_DSN: z.url({ protocol: /https?/ }).optional(),
    SENTRY_ENVIRONMENT: z.string().min(1).optional(),
    SENTRY_TRACES_SAMPLE_RATE: z.coerce.number().min(0).max(1).default(0),

    // Feature Flags
    FLAG_DEBUG_PRINTER: z.stringbool().default(false),
    FLAG_DISABLE_SIGNUPS: z.stringbool().default(false),
    FLAG_DISABLE_EMAIL_AUTH: z.stringbool().default(false),
    FLAG_DISABLE_IMAGE_PROCESSING: z.stringbool().default(false),
    FLAG_DISABLE_AI: z.stringbool().default(true),
  },
});

if (isProduction && env.EMAIL_TRANSPORT === "smtp") {
  const missing = [
    ["SMTP_HOST", env.SMTP_HOST],
    ["SMTP_USER", env.SMTP_USER],
    ["SMTP_PASS", env.SMTP_PASS],
    ["SMTP_FROM", env.SMTP_FROM],
  ]
    .filter(([, value]) => !value)
    .map(([name]) => name);

  if (missing.length > 0) {
    throw new Error(
      `Missing SMTP configuration in production: ${missing.join(", ")}. ` +
        `Configure SMTP_HOST, SMTP_USER, SMTP_PASS, and SMTP_FROM, or explicitly opt in to console-logged emails by setting EMAIL_TRANSPORT="console".`,
    );
  }
}
