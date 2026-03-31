import { createIsomorphicFn } from "@tanstack/react-start";
import { getRequestHeaders } from "@tanstack/react-start/server";

import type { AuthSession } from "./types";

import { authClient } from "./client";
import { auth } from "./config";

const SESSION_CACHE_TTL_MS = 30_000;

let cachedSession: AuthSession | null | undefined;
let cachedSessionAt = 0;
let pendingSessionRequest: Promise<AuthSession | null> | null = null;

function setSessionCache(session: AuthSession | null) {
  cachedSession = session;
  cachedSessionAt = Date.now();
}

export function clearSessionCache() {
  cachedSession = undefined;
  cachedSessionAt = 0;
  pendingSessionRequest = null;
}

export const getSession = createIsomorphicFn()
  .client(async (): Promise<AuthSession | null> => {
    const hasFreshCache = cachedSession !== undefined && Date.now() - cachedSessionAt < SESSION_CACHE_TTL_MS;
    if (hasFreshCache) return cachedSession ?? null;

    if (!pendingSessionRequest) {
      pendingSessionRequest = authClient
        .getSession()
        .then(({ data, error }) => {
          const session = error ? null : (data as AuthSession | null);
          setSessionCache(session);
          return session;
        })
        .finally(() => {
          pendingSessionRequest = null;
        });
    }

    return pendingSessionRequest;
  })
  .server(async (): Promise<AuthSession | null> => {
    const result = await auth.api.getSession({ headers: getRequestHeaders() });
    return result as AuthSession | null;
  });
