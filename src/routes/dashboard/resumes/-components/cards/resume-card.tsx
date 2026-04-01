import { t } from "@lingui/core/macro";
import { useLingui } from "@lingui/react";
import { CircleNotchIcon, FileTextIcon, LockSimpleIcon } from "@phosphor-icons/react";
import { useQuery } from "@tanstack/react-query";
import { Link } from "@tanstack/react-router";
import { AnimatePresence, motion, useInView } from "motion/react";
import { useEffect, useMemo, useRef, useState } from "react";
import { match, P } from "ts-pattern";

import { orpc, type RouterOutput } from "@/integrations/orpc/client";
import { cn } from "@/utils/style";

import { ResumeContextMenu } from "../menus/context-menu";
import { BaseCard } from "./base-card";

type ResumeCardProps = {
  resume: RouterOutput["resume"]["list"][number];
};

export function ResumeCard({ resume }: ResumeCardProps) {
  const { i18n } = useLingui();
  const cardRef = useRef<HTMLDivElement>(null);
  const isInView = useInView(cardRef, { once: true, amount: 0.2, margin: "200px" });
  const [showFallback, setShowFallback] = useState(false);

  const { data: screenshotData, isLoading } = useQuery({
    ...orpc.printer.getResumeScreenshot.queryOptions({ input: { id: resume.id } }),
    enabled: isInView,
    retry: false,
  });

  useEffect(() => {
    if (!isInView || !isLoading) {
      setShowFallback(false);
      return;
    }

    const timeoutId = window.setTimeout(() => setShowFallback(true), 4_000);
    return () => window.clearTimeout(timeoutId);
  }, [isInView, isLoading, resume.id]);

  const updatedAt = useMemo(() => {
    return Intl.DateTimeFormat(i18n.locale, { dateStyle: "long", timeStyle: "short" }).format(resume.updatedAt);
  }, [i18n.locale, resume.updatedAt]);

  const imageSrc = screenshotData?.url ?? null;
  const isPreviewLoading = isInView && isLoading && !showFallback;

  return (
    <ResumeContextMenu resume={resume}>
      <Link to="/builder/$resumeId" params={{ resumeId: resume.id }} className="cursor-default">
        <motion.div
          ref={cardRef}
          whileHover={{ y: -2, scale: 1.005 }}
          whileTap={{ scale: 0.998 }}
          transition={{ type: "spring", stiffness: 320, damping: 28 }}
          style={{ willChange: "transform" }}
        >
          <BaseCard title={resume.name} description={t`Last updated on ${updatedAt}`} tags={resume.tags}>
            {match({ isLoading: isPreviewLoading, imageSrc })
              .with({ isLoading: true }, () => (
                <div className="flex size-full items-center justify-center">
                  <CircleNotchIcon weight="thin" className="size-12 animate-spin" />
                </div>
              ))
              .with({ imageSrc: P.string }, ({ imageSrc }) => (
                <img
                  src={imageSrc}
                  alt={resume.name}
                  loading="lazy"
                  decoding="async"
                  className={cn("size-full object-cover transition-all", resume.isLocked && "blur-xs")}
                />
              ))
              .otherwise(() => (
                <ResumePreviewFallback />
              ))}

            <ResumeLockOverlay isLocked={resume.isLocked} />
          </BaseCard>
        </motion.div>
      </Link>
    </ResumeContextMenu>
  );
}

function ResumeLockOverlay({ isLocked }: { isLocked: boolean }) {
  return (
    <AnimatePresence>
      {isLocked && (
        <motion.div
          key="resume-lock-overlay"
          initial={{ opacity: 0 }}
          animate={{ opacity: 0.6 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.15 }}
          style={{ willChange: "opacity" }}
          className="absolute inset-0 flex items-center justify-center"
        >
          <div className="flex items-center justify-center rounded-full bg-popover p-6">
            <LockSimpleIcon weight="thin" className="size-12 opacity-60" />
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}

function ResumePreviewFallback() {
  return (
    <div className="flex size-full flex-col items-center justify-center gap-3 bg-linear-to-br from-muted/40 via-background to-muted/10 px-6 text-center text-muted-foreground">
      <div className="rounded-full bg-background/80 p-4 shadow-sm ring-1 ring-foreground/10">
        <FileTextIcon className="size-10" weight="thin" />
      </div>

      <div className="space-y-1">
        <p className="text-sm font-medium text-foreground">{t`Preview unavailable`}</p>
        <p className="text-xs">{t`Open the resume to keep editing.`}</p>
      </div>
    </div>
  );
}
