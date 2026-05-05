import { Trans } from "@lingui/react/macro";
import { ArrowRightIcon, FilePdfIcon, MagicWandIcon, SquaresFourIcon } from "@phosphor-icons/react";
import { Link } from "@tanstack/react-router";
import { motion } from "motion/react";

import { Button } from "@/components/ui/button";

const steps = [
  {
    icon: SquaresFourIcon,
    title: <Trans>Escolha um modelo</Trans>,
    description: <Trans>Comece com um template profissional e ajuste cores, fontes e seções.</Trans>,
  },
  {
    icon: MagicWandIcon,
    title: <Trans>Preencha com ajuda da IA</Trans>,
    description: <Trans>Escreva do zero ou peça para a IA melhorar seu resumo, experiências e habilidades.</Trans>,
  },
  {
    icon: FilePdfIcon,
    title: <Trans>Exporte quando estiver pronto</Trans>,
    description: <Trans>Revise o currículo, gere o PDF e envie para vagas, recrutadores ou LinkedIn.</Trans>,
  },
];

export function HowItWorks() {
  return (
    <section id="how-it-works" className="p-4 md:p-8 xl:py-16">
      <motion.div
        className="grid gap-8 lg:grid-cols-[0.85fr_1.4fr]"
        initial={{ opacity: 0, y: 20 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true }}
        transition={{ duration: 0.45 }}
        style={{ willChange: "transform, opacity" }}
      >
        <div className="space-y-4">
          <h2 className="text-2xl font-semibold tracking-tight md:text-4xl xl:text-5xl">
            <Trans>Como funciona</Trans>
          </h2>
          <p className="max-w-lg leading-relaxed text-muted-foreground">
            <Trans>Do primeiro rascunho ao PDF final sem brigar com formatação.</Trans>
          </p>
          <Button
            nativeButton={false}
            className="group gap-2"
            render={
              <Link to="/auth/register">
                <Trans>Criar currículo grátis</Trans>
                <ArrowRightIcon className="size-4 transition-transform group-hover:translate-x-0.5" />
              </Link>
            }
          />
        </div>

        <div className="grid gap-4 md:grid-cols-3">
          {steps.map((step, index) => (
            <div key={index} className="rounded-md border bg-background p-5">
              <div className="mb-6 flex size-11 items-center justify-center rounded-md bg-primary/10 text-primary">
                <step.icon size={24} />
              </div>
              <p className="text-sm font-medium text-muted-foreground">0{index + 1}</p>
              <h3 className="mt-2 text-lg font-semibold tracking-tight">{step.title}</h3>
              <p className="mt-2 text-sm leading-relaxed text-muted-foreground">{step.description}</p>
            </div>
          ))}
        </div>
      </motion.div>
    </section>
  );
}
