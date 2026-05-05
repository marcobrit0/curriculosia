import { Trans } from "@lingui/react/macro";
import { CheckCircleIcon, SparkleIcon } from "@phosphor-icons/react";
import { motion } from "motion/react";

const aiFeatures = [
  {
    title: <Trans>Melhore textos fracos</Trans>,
    description: <Trans>Transforme frases genéricas em descrições mais claras, profissionais e objetivas.</Trans>,
  },
  {
    title: <Trans>Adapte para uma vaga</Trans>,
    description: <Trans>Cole a descrição da vaga e receba sugestões para destacar experiências relevantes.</Trans>,
  },
  {
    title: <Trans>Resumo profissional com IA</Trans>,
    description: <Trans>Gere uma primeira versão do seu resumo com base no seu cargo, experiência e objetivo.</Trans>,
  },
  {
    title: <Trans>Português mais natural</Trans>,
    description: <Trans>Corrija erros, melhore clareza e mantenha um tom profissional em português do Brasil.</Trans>,
  },
];

export function AISection() {
  return (
    <section id="ai" className="p-4 md:p-8 xl:py-16">
      <motion.div
        className="grid gap-8 lg:grid-cols-[1.1fr_0.9fr] lg:items-center"
        initial={{ opacity: 0, y: 20 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true }}
        transition={{ duration: 0.45 }}
        style={{ willChange: "transform, opacity" }}
      >
        <div className="space-y-4">
          <div className="inline-flex items-center gap-2 rounded-md border bg-secondary/40 px-3 py-1 text-sm font-medium">
            <SparkleIcon className="text-primary" weight="fill" />
            <Trans>Recursos de IA no Premium</Trans>
          </div>
          <h2 className="text-2xl font-semibold tracking-tight md:text-4xl xl:text-5xl">
            <Trans>Escreva melhor sem perder sua voz profissional</Trans>
          </h2>
          <p className="max-w-2xl leading-relaxed text-muted-foreground">
            <Trans>
              A IA ajuda a organizar ideias, reescrever trechos e adaptar o currículo para cada vaga. Você continua no
              controle e revisa tudo antes de enviar.
            </Trans>
          </p>
        </div>

        <div className="rounded-md border bg-popover p-5 shadow-sm">
          <div className="mb-5 rounded-md border bg-background p-4">
            <p className="text-xs font-medium tracking-wide text-muted-foreground uppercase">
              <Trans>Painel de IA</Trans>
            </p>
            <p className="mt-3 text-sm leading-relaxed">
              <Trans>
                “Reescreva meu resumo para uma vaga de Analista de Marketing, mantendo um tom profissional e objetivo.”
              </Trans>
            </p>
            <div className="mt-4 rounded-md bg-primary/10 p-3 text-sm leading-relaxed text-primary">
              <Trans>
                Sugestão criada com foco em campanhas pagas, análise de métricas e comunicação com times comerciais.
              </Trans>
            </div>
          </div>

          <div className="space-y-4">
            {aiFeatures.map((feature, index) => (
              <div key={index} className="flex gap-3">
                <CheckCircleIcon className="mt-0.5 size-5 shrink-0 text-primary" weight="fill" />
                <div>
                  <h3 className="font-medium tracking-tight">{feature.title}</h3>
                  <p className="text-sm leading-relaxed text-muted-foreground">{feature.description}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </motion.div>
    </section>
  );
}
