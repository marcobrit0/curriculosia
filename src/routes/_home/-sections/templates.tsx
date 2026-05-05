import { t } from "@lingui/core/macro";
import { useLingui } from "@lingui/react";
import { Trans } from "@lingui/react/macro";
import { ArrowRightIcon, PauseIcon, PlayIcon } from "@phosphor-icons/react";
import { Link } from "@tanstack/react-router";
import { motion, useAnimationControls } from "motion/react";
import { useEffect, useMemo, useState } from "react";

import type { TemplateMetadata } from "@/dialogs/resume/template/data";

import { Button } from "@/components/ui/button";
import { templates } from "@/dialogs/resume/template/data";

type TemplateItemProps = {
  template: string;
  metadata: TemplateMetadata;
};

const templateDisplayNames: Record<string, string> = {
  azurill: "Criativo",
  bronzor: "Executivo",
  chikorita: "Moderno",
  ditgar: "Tecnologia",
  ditto: "Clássico",
  gengar: "Corporativo",
  glalie: "Minimalista",
  kakuna: "Primeiro emprego",
  lapras: "Sênior",
  leafish: "Saúde e impacto",
  onyx: "Profissional",
  pikachu: "Editorial",
  rhyhorn: "Design",
};

function TemplateItem({ template, metadata }: TemplateItemProps) {
  const { i18n } = useLingui();
  const displayName = templateDisplayNames[template] ?? metadata.name;
  const altText = t`Modelo de currículo ${displayName}: ${i18n.t(metadata.description)}`;

  return (
    <motion.div
      className="group relative shrink-0"
      initial={{ scale: 1, zIndex: 10 }}
      whileHover={{ scale: 1.06, zIndex: 20 }}
      whileTap={{ scale: 0.99 }}
      transition={{ type: "spring", stiffness: 320, damping: 26 }}
      style={{ willChange: "transform" }}
    >
      <div className="relative aspect-page w-48 overflow-hidden rounded-md border bg-card shadow-lg transition-all duration-300 group-hover:shadow-2xl sm:w-56 md:w-64 lg:w-72">
        <img src={metadata.imageUrl} alt={altText} className="size-full object-cover" />

        {/* Subtle overlay on hover */}
        <div className="absolute inset-0 bg-linear-to-t from-black/70 via-black/20 to-transparent opacity-0 transition-opacity duration-300 group-hover:opacity-100" />

        {/* Template name on hover */}
        <div className="absolute inset-x-0 bottom-0 translate-y-full p-4 transition-transform duration-300 group-hover:translate-y-0">
          <p className="font-semibold text-white drop-shadow-lg">{displayName}</p>
        </div>

        {/* Shine effect on hover */}
        <div className="pointer-events-none absolute inset-0 -translate-x-full rotate-12 bg-linear-to-r from-transparent via-white/10 to-transparent transition-transform duration-700 group-hover:translate-x-full" />
      </div>
    </motion.div>
  );
}

type MarqueeRowProps = {
  templates: Array<[string, TemplateMetadata]>;
  rowId: string;
  direction: "left" | "right";
  duration?: number;
  isPaused: boolean;
};

function MarqueeRow({ templates, rowId, direction, duration = 40, isPaused }: MarqueeRowProps) {
  const controls = useAnimationControls();

  useEffect(() => {
    const animateX = direction === "left" ? ["0%", "-50%"] : ["-50%", "0%"];
    if (isPaused) {
      controls.stop();
    } else {
      void controls.start({
        x: animateX,
        transition: { x: { repeat: Infinity, repeatType: "loop", duration, ease: "linear" } },
      });
    }
  }, [isPaused, controls, direction, duration]);

  return (
    <motion.div
      animate={controls}
      initial={{ x: direction === "left" ? "0%" : "-50%" }}
      className="flex gap-x-4 will-change-transform sm:gap-x-6"
    >
      {templates.map(([template, metadata], index) => (
        <TemplateItem key={`${rowId}-${template}-${index}`} template={template} metadata={metadata} />
      ))}
    </motion.div>
  );
}

export function Templates() {
  const [isPaused, setIsPaused] = useState(false);

  // Split templates into two rows and duplicate for seamless infinite scroll
  const { row1, row2 } = useMemo(() => {
    const entries = Object.entries(templates);
    const half = Math.ceil(entries.length / 2);
    const firstHalf = entries.slice(0, half);
    const secondHalf = entries.slice(half);

    // Duplicate each row for seamless scrolling
    return {
      row1: [...firstHalf, ...firstHalf],
      row2: [...secondHalf, ...secondHalf],
    };
  }, []);

  return (
    <section id="templates" className="overflow-hidden border-t-0! p-4 md:p-8 xl:py-16">
      <motion.div
        className="flex items-start justify-between gap-4"
        initial={{ opacity: 0, y: 20 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true }}
        transition={{ duration: 0.35 }}
        style={{ willChange: "transform, opacity" }}
      >
        <div className="space-y-4">
          <h2 className="text-2xl font-semibold tracking-tight md:text-4xl xl:text-5xl">
            <Trans>Modelos profissionais para diferentes carreiras</Trans>
          </h2>

          <p className="max-w-2xl leading-relaxed text-muted-foreground">
            <Trans>Comece com um layout pronto e personalize o currículo sem perder tempo com formatação.</Trans>
          </p>
        </div>

        <div className="flex shrink-0 items-center gap-2">
          <Button
            nativeButton={false}
            className="hidden gap-2 sm:inline-flex"
            render={
              <Link to="/auth/register">
                <Trans>Escolher um modelo</Trans>
                <ArrowRightIcon className="size-4" />
              </Link>
            }
          />
          <Button
            size="icon"
            variant="outline"
            className="mt-1 shrink-0"
            aria-label={isPaused ? t`Retomar animação dos modelos` : t`Pausar animação dos modelos`}
            onClick={() => setIsPaused((prev) => !prev)}
          >
            {isPaused ? <PlayIcon aria-hidden="true" /> : <PauseIcon aria-hidden="true" />}
          </Button>
        </div>
      </motion.div>

      <div
        className="relative mt-8 -rotate-3 py-8 sm:-rotate-4 lg:mt-0 lg:-rotate-5"
        aria-label={t`Galeria de modelos de currículo`}
        role="region"
        aria-live="off"
      >
        {/* Marquee container with minimum height */}
        <div className="flex min-h-[280px] flex-col gap-y-4 sm:min-h-[320px] sm:gap-y-6 md:min-h-[380px] lg:min-h-[420px]">
          {/* First row - moves left to right */}
          <MarqueeRow templates={row1} rowId="row1" direction="left" duration={45} isPaused={isPaused} />

          {/* Second row - moves right to left (opposite direction) */}
          <MarqueeRow templates={row2} rowId="row2" direction="right" duration={50} isPaused={isPaused} />
        </div>
      </div>

      <Button
        nativeButton={false}
        className="mt-6 w-full gap-2 sm:hidden"
        render={
          <Link to="/auth/register">
            <Trans>Escolher um modelo</Trans>
            <ArrowRightIcon className="size-4" />
          </Link>
        }
      />
    </section>
  );
}
