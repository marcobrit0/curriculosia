import { useRouter } from "@tanstack/react-router";
import { useEffect, useRef } from "react";

import type { AuthSession } from "@/integrations/auth/types";

import { useCurrentSession } from "@/integrations/auth/hooks";

import { capturePostHogPageview, identifyPostHogUser, initPostHog, isPostHogEnabled, resetPostHogUser } from "./client";

type Props = {
  children: React.ReactNode;
};

export function PostHogProvider({ children }: Props) {
  const router = useRouter();
  const session = useCurrentSession();
  const identifiedUserIdRef = useRef<string | null>(null);
  const lastPageKeyRef = useRef<string | null>(null);

  useEffect(() => {
    if (!isPostHogEnabled()) return;

    initPostHog();

    const captureCurrentPageview = () => {
      const pageKey = `${window.location.pathname}${window.location.search}`;
      if (lastPageKeyRef.current === pageKey) return;

      lastPageKeyRef.current = pageKey;
      capturePostHogPageview();
    };

    captureCurrentPageview();

    return router.subscribe("onResolved", captureCurrentPageview);
  }, [router]);

  useEffect(() => {
    if (!isPostHogEnabled()) return;

    if (!session?.user) {
      if (identifiedUserIdRef.current) {
        resetPostHogUser();
        identifiedUserIdRef.current = null;
      }

      return;
    }

    if (identifiedUserIdRef.current === session.user.id) return;

    identifyPostHogUser(session as AuthSession);
    identifiedUserIdRef.current = session.user.id;
  }, [session]);

  return <>{children}</>;
}
