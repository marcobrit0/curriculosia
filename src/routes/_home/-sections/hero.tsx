import { Trans } from "@lingui/react/macro";
import { ArrowRightIcon, FilePdfIcon, SparkleIcon } from "@phosphor-icons/react";
import { Link } from "@tanstack/react-router";
import { motion } from "motion/react";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";

export function Hero() {
  return (
    <section
      id="hero"
      className="relative flex min-h-svh w-svw items-center overflow-hidden border-b bg-background px-4 py-24 sm:px-6 lg:px-12"
    >
      <div className="container mx-auto grid items-center gap-10 pt-8 lg:grid-cols-[0.9fr_1.1fr]">
        <motion.div
          className="relative z-10 max-w-2xl space-y-6"
          initial={{ opacity: 0, y: 28 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.55, ease: "easeOut" }}
          style={{ willChange: "transform, opacity" }}
        >
          <Badge variant="secondary" className="h-auto gap-1.5 px-3 py-1">
            <SparkleIcon aria-hidden="true" className="size-3.5 text-primary" weight="fill" />
            <Trans>Currículo profissional com IA, em português</Trans>
          </Badge>

          <div className="space-y-4">
            <h1 className="text-4xl font-bold tracking-tight md:text-5xl lg:text-6xl">
              <Trans>Crie um currículo pronto para enviar em minutos</Trans>
            </h1>
            <p className="max-w-xl text-base leading-relaxed text-muted-foreground md:text-lg">
              <Trans>
                Escolha um modelo, preencha suas informações e use a IA para melhorar textos, adaptar seu currículo para
                vagas e exportar em PDF quando estiver pronto.
              </Trans>
            </p>
          </div>

          <div className="flex flex-col gap-3 sm:flex-row">
            <Button
              size="lg"
              nativeButton={false}
              className="group gap-2 px-4"
              render={
                <Link to="/auth/register">
                  <Trans>Criar currículo grátis</Trans>
                  <ArrowRightIcon className="size-4 transition-transform group-hover:translate-x-0.5" />
                </Link>
              }
            />
            <Button
              size="lg"
              variant="outline"
              nativeButton={false}
              className="px-4"
              render={
                <a href="#templates">
                  <Trans>Ver modelos</Trans>
                </a>
              }
            />
          </div>

          <p className="max-w-lg text-sm leading-relaxed text-muted-foreground">
            <Trans>Comece sem cartão. Pague apenas quando quiser exportar ou liberar os recursos Premium.</Trans>
          </p>
        </motion.div>

        <motion.div
          className="relative"
          initial={{ opacity: 0, y: 32, scale: 0.98 }}
          animate={{ opacity: 1, y: 0, scale: 1 }}
          transition={{ duration: 0.65, delay: 0.1, ease: "easeOut" }}
          style={{ willChange: "transform, opacity" }}
        >
          <ProductMockup />
        </motion.div>
      </div>
    </section>
  );
}

function ProductMockup() {
  return (
    <div className="relative mx-auto max-w-3xl">
      <div className="overflow-hidden rounded-md border bg-popover shadow-2xl">
        <div className="flex items-center justify-between border-b px-4 py-3">
          <div className="flex items-center gap-2">
            <span className="size-2.5 rounded-full bg-destructive/70" />
            <span className="size-2.5 rounded-full bg-amber-400" />
            <span className="size-2.5 rounded-full bg-success" />
          </div>
          <p className="text-xs font-medium text-muted-foreground">
            <Trans>Editor de currículo</Trans>
          </p>
        </div>

        <div className="grid bg-secondary/30 md:grid-cols-[15rem_1fr]">
          <aside className="hidden border-r bg-background p-4 md:block">
            <p className="text-xs font-medium tracking-wide text-muted-foreground uppercase">
              <Trans>Seções</Trans>
            </p>
            <div className="mt-4 space-y-2">
              {["Dados pessoais", "Resumo", "Experiência", "Formação", "Habilidades"].map((item, index) => (
                <div
                  key={item}
                  className={
                    index === 1
                      ? "rounded-md bg-primary/10 px-3 py-2 text-sm font-medium text-primary"
                      : "rounded-md px-3 py-2 text-sm text-muted-foreground"
                  }
                >
                  {item}
                </div>
              ))}
            </div>
          </aside>

          <div className="p-4 sm:p-6">
            <div className="mx-auto aspect-page max-h-[34rem] rounded-sm bg-white p-8 text-neutral-950 shadow-lg">
              <div className="border-b border-neutral-200 pb-5">
                <h2 className="text-3xl font-bold tracking-tight">Ana Souza</h2>
                <p className="mt-1 text-sm text-neutral-600">Analista de Marketing · São Paulo, SP</p>
              </div>

              <div className="mt-6 grid gap-6 md:grid-cols-[1fr_0.7fr]">
                <div className="space-y-5">
                  <ResumeSection title="Resumo">
                    Analista de Marketing com experiência em campanhas pagas, CRM e otimização de conversão para times
                    B2B.
                  </ResumeSection>
                  <ResumeSection title="Experiência">
                    <strong>Marketing Performance</strong>
                    <br />
                    Aumentei em 32% a taxa de conversão de campanhas pagas em 6 meses.
                  </ResumeSection>
                </div>
                <div className="space-y-5">
                  <ResumeSection title="Habilidades">Google Ads · CRM · Conteúdo · Análise de dados</ResumeSection>
                  <ResumeSection title="Formação">Comunicação Social · 2018</ResumeSection>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="absolute -top-4 right-2 hidden rounded-md border bg-background p-3 shadow-lg sm:block">
        <p className="flex items-center gap-2 text-sm font-medium">
          <SparkleIcon className="text-primary" weight="fill" />
          <Trans>IA melhorou seu resumo</Trans>
        </p>
      </div>

      <div className="absolute -bottom-5 left-2 hidden rounded-md border bg-background p-3 shadow-lg sm:block">
        <p className="flex items-center gap-2 text-sm font-medium">
          <FilePdfIcon className="text-primary" />
          <Trans>PDF pronto para exportar</Trans>
        </p>
      </div>
    </div>
  );
}

function ResumeSection({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <section>
      <h3 className="mb-2 text-xs font-bold tracking-wide text-neutral-500 uppercase">{title}</h3>
      <p className="text-xs leading-relaxed text-neutral-700">{children}</p>
    </section>
  );
}
