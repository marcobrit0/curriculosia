import posthog from "posthog-js";

import type { AuthSession } from "@/integrations/auth/types";

const posthogKey = import.meta.env.VITE_POSTHOG_KEY;
const posthogHost = import.meta.env.VITE_POSTHOG_HOST ?? "https://us.i.posthog.com";

let hasInitializedPostHog = false;

export const posthogEvents = {
  authSignInCompleted: "auth_sign_in_completed",
  authSignOutCompleted: "auth_sign_out_completed",
  authSignUpCompleted: "auth_sign_up_completed",
  resumeCreated: "resume_created",
  resumeExported: "resume_exported",
  resumeImported: "resume_imported",
} as const;

function compactProperties(properties: Record<string, unknown>) {
  return Object.fromEntries(Object.entries(properties).filter(([, value]) => value !== undefined));
}

export function isPostHogEnabled() {
  return typeof window !== "undefined" && Boolean(posthogKey);
}

export function initPostHog() {
  if (!isPostHogEnabled() || hasInitializedPostHog || !posthogKey) return;

  posthog.init(posthogKey, {
    api_host: posthogHost,
    autocapture: false,
    capture_pageleave: false,
    capture_pageview: false,
    disable_conversations: true,
    disable_product_tours: true,
    disable_session_recording: true,
    disable_surveys: true,
    loaded: (client) => {
      if (import.meta.env.DEV) client.debug();
    },
  });

  hasInitializedPostHog = true;
}

export function capturePostHogEvent(event: string, properties: Record<string, unknown> = {}) {
  if (!isPostHogEnabled()) return;

  initPostHog();
  posthog.capture(event, compactProperties(properties));
}

export function capturePostHogPageview() {
  if (typeof window === "undefined") return;

  capturePostHogEvent("$pageview", {
    $current_url: window.location.href,
    pathname: window.location.pathname,
    search: window.location.search || undefined,
    title: document.title || undefined,
  });
}

export function identifyPostHogUser(session: AuthSession) {
  if (!isPostHogEnabled()) return;

  initPostHog();
  posthog.identify(
    session.user.id,
    compactProperties({
      email: session.user.email,
      name: session.user.name,
      username: session.user.username,
    }),
  );
}

export function resetPostHogUser() {
  if (!isPostHogEnabled()) return;

  initPostHog();
  posthog.reset();
}
