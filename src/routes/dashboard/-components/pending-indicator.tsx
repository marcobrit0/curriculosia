import { Trans } from "@lingui/react/macro";
import { useRouterState } from "@tanstack/react-router";
import { AnimatePresence, motion } from "motion/react";
import { useEffect, useState } from "react";

import { Spinner } from "@/components/ui/spinner";

export function DashboardPendingIndicator() {
  const [isVisible, setIsVisible] = useState(false);
  const isDashboardNavigation = useRouterState({
    select: (state) => {
      const resolvedPathname = state.resolvedLocation?.pathname ?? state.location.pathname;
      const resolvedHref = state.resolvedLocation?.href ?? state.location.href;

      return (
        (state.location.pathname.startsWith("/dashboard") || resolvedPathname.startsWith("/dashboard")) &&
        (state.status === "pending" || state.location.href !== resolvedHref)
      );
    },
  });

  useEffect(() => {
    if (!isDashboardNavigation) {
      setIsVisible(false);
      return;
    }

    const timeout = window.setTimeout(() => {
      setIsVisible(true);
    }, 120);

    return () => window.clearTimeout(timeout);
  }, [isDashboardNavigation]);

  return (
    <AnimatePresence>
      {isVisible && (
        <motion.div
          key="dashboard-pending-indicator"
          initial={{ opacity: 0, y: -8 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -8 }}
          transition={{ duration: 0.16, ease: "easeOut" }}
          className="pointer-events-none sticky top-0 z-20 flex justify-end"
        >
          <div className="mt-1 inline-flex items-center gap-x-2 rounded-full border bg-background/95 px-3 py-1.5 text-xs text-muted-foreground shadow-sm backdrop-blur">
            <Spinner className="size-3.5" />
            <span>
              <Trans>Loading section...</Trans>
            </span>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
