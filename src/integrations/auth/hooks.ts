import { useRouteContext } from "@tanstack/react-router";

import type { AuthSession } from "./types";

export function useCurrentSession() {
  const context = useRouteContext({ strict: false });
  return (context?.session as AuthSession | null | undefined) ?? null;
}
