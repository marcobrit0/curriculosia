import { useRouterState } from "@tanstack/react-router";
import { AnimatePresence, motion } from "motion/react";
import { useEffect, useState } from "react";

export function NavigationProgress() {
  const [isVisible, setIsVisible] = useState(false);
  const isPending = useRouterState({
    select: (state) => {
      const resolvedHref = state.resolvedLocation?.href ?? state.location.href;
      return state.status === "pending" || state.location.href !== resolvedHref;
    },
  });

  useEffect(() => {
    if (!isPending) {
      setIsVisible(false);
      return;
    }

    const timeout = window.setTimeout(() => {
      setIsVisible(true);
    }, 120);

    return () => window.clearTimeout(timeout);
  }, [isPending]);

  return (
    <AnimatePresence>
      {isVisible && (
        <motion.div
          key="navigation-progress"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="pointer-events-none fixed inset-x-0 top-0 z-50 h-0.5 overflow-hidden"
        >
          <motion.div
            className="h-full w-1/3 rounded-full bg-primary shadow-[0_0_12px_hsl(var(--primary)/0.5)]"
            animate={{ x: ["-100%", "350%"] }}
            transition={{ duration: 1.1, ease: "easeInOut", repeat: Number.POSITIVE_INFINITY }}
          />
        </motion.div>
      )}
    </AnimatePresence>
  );
}
