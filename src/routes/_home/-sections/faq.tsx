import { t } from "@lingui/core/macro";
import { Trans } from "@lingui/react/macro";
import { motion } from "motion/react";

import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion";
import { buttonVariants } from "@/components/ui/button";
import { cn } from "@/utils/style";

const crowdinUrl = "https://github.com/marcobrit0/curriculosia";

type FAQItemData = {
  question: string;
  answer: React.ReactNode;
};

const getFaqItems = (): FAQItemData[] => [
  {
    question: t`O Currículos IA é realmente gratuito?`,
    answer: t`Sim! O criador de currículos — com templates, exportação em PDF e compartilhamento — é gratuito e sempre será. Os recursos com IA (sugestões de conteúdo, importação de PDF/DOCX e ajuste automático para vagas) fazem parte de um plano premium opcional, que ajuda a custear os modelos de IA. O Currículos IA também é open-source: você pode hospedar na sua própria infraestrutura e usar suas próprias chaves de IA sem custo adicional.`,
  },
  {
    question: t`Como meus dados são protegidos?`,
    answer: t`Seus dados são armazenados com segurança e nunca são compartilhados com terceiros. Você também pode hospedar o Currículos IA nos seus próprios servidores para ter controle total sobre suas informações.`,
  },
  {
    question: t`Posso exportar meu currículo em PDF?`,
    answer: t`Com certeza! Você pode exportar seu currículo em PDF com um único clique. O PDF exportado mantém toda a formatação e o estilo exatamente como você configurou.`,
  },
  {
    question: t`O Currículos IA está disponível em português?`,
    answer: (
      <Trans>
        Sim, o Currículos IA está disponível em português do Brasil e em outros idiomas. Você pode escolher o idioma nas
        configurações ou usar o seletor de idioma no topo da página. Se não encontrar o seu idioma, ou quiser melhorar as
        traduções existentes, você pode{" "}
        <a
          href={crowdinUrl}
          target="_blank"
          rel="noopener noreferrer"
          className={buttonVariants({ variant: "link", className: "h-auto px-0!" })}
        >
          contribuir com as traduções no Crowdin
          <span className="sr-only"> (abre em nova aba)</span>
        </a>
        .
      </Trans>
    ),
  },
  {
    question: t`O que diferencia o Currículos IA de outros criadores de currículo?`,
    answer: t`O Currículos IA é open-source e focado em privacidade. O criador de currículos é gratuito, sem anúncios e sem rastreamento do conteúdo dos seus currículos. Os recursos com IA são oferecidos como plano premium opcional para cobrir os custos dos modelos, e quem hospeda a própria instância pode usar suas chaves gratuitamente.`,
  },
  {
    question: t`Posso personalizar os templates?`,
    answer: t`Sim! Todos os templates são totalmente personalizáveis. Você pode alterar cores, fontes, espaçamento e até escrever CSS personalizado para ter controle completo sobre a aparência do seu currículo.`,
  },
  {
    question: t`Como compartilho meu currículo?`,
    answer: t`Você pode compartilhar seu currículo por um link público exclusivo, protegê-lo com senha, ou baixá-lo em PDF para enviar diretamente. A escolha é sua!`,
  },
  {
    question: t`O Currículos IA funciona bem para vagas no Brasil?`,
    answer: t`Sim! O Currículos IA foi pensado para o mercado brasileiro. Você pode criar currículos em português, com formatos e estilos adequados para as expectativas de recrutadores e empresas brasileiras — além de suporte a currículos em inglês para vagas internacionais.`,
  },
];

export function FAQ() {
  const faqItems = getFaqItems();

  return (
    <section
      id="frequently-asked-questions"
      className="flex flex-col gap-x-16 gap-y-6 p-4 md:p-8 lg:flex-row lg:gap-x-18 xl:py-16"
    >
      <motion.h2
        className={cn(
          "flex-1 text-2xl font-semibold tracking-tight md:text-4xl xl:text-5xl",
          "flex shrink-0 flex-wrap items-center gap-x-1.5 lg:flex-col lg:items-start",
        )}
        initial={{ opacity: 0, x: -20 }}
        whileInView={{ opacity: 1, x: 0 }}
        viewport={{ once: true }}
        transition={{ duration: 0.45 }}
        style={{ willChange: "transform, opacity" }}
      >
        <Trans context="Every word needs to be wrapped in a tag">
          <span>Perguntas</span>
          <span>Frequentes</span>
        </Trans>
      </motion.h2>

      <motion.div
        className="max-w-2xl flex-2 lg:ml-auto 2xl:max-w-3xl"
        initial={{ opacity: 0, y: 20 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true }}
        transition={{ duration: 0.45, delay: 0.08 }}
        style={{ willChange: "transform, opacity" }}
      >
        <Accordion multiple>
          {faqItems.map((item, index) => (
            <FAQItemComponent key={item.question} item={item} index={index} />
          ))}
        </Accordion>
      </motion.div>
    </section>
  );
}

type FAQItemComponentProps = {
  item: FAQItemData;
  index: number;
};

function FAQItemComponent({ item, index }: FAQItemComponentProps) {
  return (
    <motion.div
      className="last:border-b"
      initial={{ opacity: 0, y: 10 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true }}
      transition={{ duration: 0.24, delay: Math.min(0.16, index * 0.03) }}
      style={{ willChange: "transform, opacity" }}
    >
      <AccordionItem value={item.question} className="group border-t">
        <AccordionTrigger className="py-5">{item.question}</AccordionTrigger>
        <AccordionContent className="pb-5 leading-relaxed text-muted-foreground">{item.answer}</AccordionContent>
      </AccordionItem>
    </motion.div>
  );
}
