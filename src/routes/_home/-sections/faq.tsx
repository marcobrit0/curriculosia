import { t } from "@lingui/core/macro";
import { Trans } from "@lingui/react/macro";
import { motion } from "motion/react";

import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion";
import { PRICING } from "@/constants/pricing";
import { cn } from "@/utils/style";

type FAQItemData = {
  question: string;
  answer: React.ReactNode;
};

const getFaqItems = (): FAQItemData[] => [
  {
    question: t`O CurrículosIA é gratuito?`,
    answer: t`Você pode criar e editar seu currículo gratuitamente. A exportação em PDF e os recursos Premium são pagos. Assim você só paga quando o currículo estiver pronto para uso.`,
  },
  {
    question: t`Preciso de cartão para começar?`,
    answer: t`Não. Você pode criar sua conta e montar o currículo antes de escolher uma forma de pagamento.`,
  },
  {
    question: t`Quanto custa o Premium?`,
    answer: t`O Premium custa ${PRICING.premiumMonthly.label} e inclui exportações ilimitadas e todos os recursos com IA.`,
  },
  {
    question: t`Posso pagar apenas para exportar um currículo?`,
    answer: t`Sim. Você pode pagar ${PRICING.oneTimeExport.label} para desbloquear a exportação em PDF de um currículo, sem assinar o Premium.`,
  },
  {
    question: t`O currículo fica em português do Brasil?`,
    answer: t`Sim. A interface e os textos foram pensados para o mercado brasileiro. Você também pode criar uma versão em inglês ajustando o conteúdo do currículo.`,
  },
  {
    question: t`A IA escreve meu currículo por mim?`,
    answer: t`A IA ajuda a criar, reescrever e melhorar os textos. Você deve revisar tudo antes de enviar para uma vaga.`,
  },
  {
    question: t`Posso cancelar o Premium quando quiser?`,
    answer: t`Sim. O acesso Premium permanece ativo até o fim do período já pago.`,
  },
  {
    question: t`Meus dados são vendidos ou compartilhados?`,
    answer: t`Não vendemos seus dados pessoais. O currículo fica associado à sua conta e é usado para entregar o serviço.`,
  },
  {
    question: t`Posso exportar em PDF?`,
    answer: t`Sim. A exportação em PDF é uma funcionalidade paga, disponível via exportação avulsa ou Premium.`,
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
