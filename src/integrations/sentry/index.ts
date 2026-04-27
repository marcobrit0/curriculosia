import * as Sentry from "@sentry/node";

let initialized = false;

export function initSentry() {
  if (initialized) return;

  const dsn = process.env.SENTRY_DSN;
  if (!dsn) return;

  Sentry.init({
    dsn,
    environment: process.env.SENTRY_ENVIRONMENT ?? process.env.NODE_ENV,
    release: process.env.npm_package_version,
    tracesSampleRate: Number(process.env.SENTRY_TRACES_SAMPLE_RATE ?? 0),
  });

  initialized = true;
}

export function isSentryEnabled() {
  return initialized;
}

export function captureException(error: unknown, context?: Record<string, unknown>) {
  if (!initialized) return;

  Sentry.captureException(error, context ? { extra: context } : undefined);
}
