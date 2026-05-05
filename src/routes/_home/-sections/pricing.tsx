import { Trans } from "@lingui/react/macro";
import { ArrowRightIcon, CheckIcon } from "@phosphor-icons/react";
import { Link } from "@tanstack/react-router";
import { motion } from "motion/react";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { PRICING } from "@/constants/pricing";

const plans = [
  {
    name: <Trans>Grátis</Trans>,
    price: "R$ 0",
    description: <Trans>Para criar e editar seu currículo antes de exportar.</Trans>,
    features: [
      <Trans key="editor">Criar currículo no editor</Trans>,
      <Trans key="templates">Usar modelos profissionais</Trans>,
      <Trans key="design">Personalizar cores, fontes e seções</Trans>,
      <Trans key="account">Salvar progresso na conta</Trans>,
    ],
    cta: <Trans>Criar currículo grátis</Trans>,
    href: "/auth/register",
  },
  {
    name: <Trans>Exportação avulsa</Trans>,
    price: PRICING.oneTimeExport.label,
    description: <Trans>Para quem quer baixar um currículo pronto sem assinar.</Trans>,
    features: [
      <Trans key="pdf">Exportar 1 currículo em PDF</Trans>,
      <Trans key="access">Manter acesso ao currículo criado</Trans>,
      <Trans key="edits">Reeditar e exportar o mesmo currículo novamente</Trans>,
    ],
    cta: <Trans>Criar e exportar</Trans>,
    href: "/auth/register",
  },
  {
    name: <Trans>Premium</Trans>,
    price: PRICING.premiumMonthly.label,
    description: <Trans>Para adaptar versões, usar IA e exportar sem limite.</Trans>,
    features: [
      <Trans key="exports">Exportações ilimitadas</Trans>,
      <Trans key="ai">Todos os recursos de IA</Trans>,
      <Trans key="versions">Criar múltiplas versões do currículo</Trans>,
      <Trans key="jobs">Ajustes para vagas diferentes</Trans>,
    ],
    cta: <Trans>Começar Premium</Trans>,
    href: "/auth/register",
    badge: <Trans>Melhor para quem está procurando emprego</Trans>,
  },
];

export function Pricing() {
  return (
    <section id="pricing" className="p-4 md:p-8 xl:py-16">
      <motion.div
        className="space-y-8"
        initial={{ opacity: 0, y: 20 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true }}
        transition={{ duration: 0.45 }}
        style={{ willChange: "transform, opacity" }}
      >
        <div className="max-w-2xl space-y-4">
          <h2 className="text-2xl font-semibold tracking-tight md:text-4xl xl:text-5xl">
            <Trans>Comece grátis. Exporte quando estiver pronto.</Trans>
          </h2>
          <p className="leading-relaxed text-muted-foreground">
            <Trans>
              Você pode montar o currículo sem cartão. A exportação em PDF é paga: escolha um desbloqueio avulso ou o
              Premium com exportações ilimitadas e IA.
            </Trans>
          </p>
        </div>

        <div className="grid gap-4 lg:grid-cols-3">
          {plans.map((plan, planIndex) => (
            <article key={planIndex} className="relative flex rounded-md border bg-background p-5">
              {plan.badge && (
                <Badge className="absolute top-5 right-5 max-w-36 justify-center text-center text-[11px] leading-tight">
                  {plan.badge}
                </Badge>
              )}
              <div className="flex min-h-full flex-col gap-5">
                <div className="space-y-2 pr-24 lg:pr-0">
                  <h3 className="text-lg font-semibold tracking-tight">{plan.name}</h3>
                  <p className="text-3xl font-bold tracking-tight tabular-nums">{plan.price}</p>
                  <p className="text-sm leading-relaxed text-muted-foreground">{plan.description}</p>
                </div>

                <ul className="space-y-3 text-sm">
                  {plan.features.map((feature, index) => (
                    <li key={index} className="flex gap-2 text-muted-foreground">
                      <CheckIcon className="mt-0.5 size-4 shrink-0 text-primary" weight="bold" />
                      <span>{feature}</span>
                    </li>
                  ))}
                </ul>

                <Button
                  nativeButton={false}
                  className="group mt-auto w-full gap-2"
                  variant={plan.badge ? "default" : "outline"}
                  render={
                    <Link to={plan.href}>
                      {plan.cta}
                      <ArrowRightIcon className="size-4 transition-transform group-hover:translate-x-0.5" />
                    </Link>
                  }
                />
              </div>
            </article>
          ))}
        </div>
      </motion.div>
    </section>
  );
}
