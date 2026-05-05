import { createFileRoute } from "@tanstack/react-router";

import { PRICING } from "@/constants/pricing";

import { AISection } from "./-sections/ai";
import { FAQ } from "./-sections/faq";
import { Footer } from "./-sections/footer";
import { Hero } from "./-sections/hero";
import { HowItWorks } from "./-sections/how-it-works";
import { Prefooter } from "./-sections/prefooter";
import { Pricing } from "./-sections/pricing";
import { Privacy } from "./-sections/privacy";
import { Templates } from "./-sections/templates";

const faqJsonLd = {
  "@context": "https://schema.org",
  "@type": "FAQPage",
  mainEntity: [
    {
      "@type": "Question",
      name: "O CurrículosIA é gratuito?",
      acceptedAnswer: {
        "@type": "Answer",
        text: "Você pode criar e editar seu currículo gratuitamente. A exportação em PDF e os recursos Premium são pagos. Assim você só paga quando o currículo estiver pronto para uso.",
      },
    },
    {
      "@type": "Question",
      name: "Preciso de cartão para começar?",
      acceptedAnswer: {
        "@type": "Answer",
        text: "Não. Você pode criar sua conta e montar o currículo antes de escolher uma forma de pagamento.",
      },
    },
    {
      "@type": "Question",
      name: "Quanto custa o Premium?",
      acceptedAnswer: {
        "@type": "Answer",
        text: `O Premium custa ${PRICING.premiumMonthly.label} e inclui exportações ilimitadas e todos os recursos com IA.`,
      },
    },
    {
      "@type": "Question",
      name: "Posso pagar apenas para exportar um currículo?",
      acceptedAnswer: {
        "@type": "Answer",
        text: `Sim. Você pode pagar ${PRICING.oneTimeExport.label} para desbloquear a exportação em PDF de um currículo, sem assinar o Premium.`,
      },
    },
    {
      "@type": "Question",
      name: "A IA escreve meu currículo por mim?",
      acceptedAnswer: {
        "@type": "Answer",
        text: "A IA ajuda a criar, reescrever e melhorar os textos. Você deve revisar tudo antes de enviar para uma vaga.",
      },
    },
    {
      "@type": "Question",
      name: "Posso cancelar o Premium quando quiser?",
      acceptedAnswer: {
        "@type": "Answer",
        text: "Sim. O acesso Premium permanece ativo até o fim do período já pago.",
      },
    },
    {
      "@type": "Question",
      name: "Meus dados são vendidos ou compartilhados?",
      acceptedAnswer: {
        "@type": "Answer",
        text: "Não vendemos seus dados pessoais. O currículo fica associado à sua conta e é usado para entregar o serviço.",
      },
    },
    {
      "@type": "Question",
      name: "Posso exportar em PDF?",
      acceptedAnswer: {
        "@type": "Answer",
        text: "Sim. A exportação em PDF é uma funcionalidade paga, disponível via exportação avulsa ou Premium.",
      },
    },
  ],
};

export const Route = createFileRoute("/_home/")({
  head: () => ({
    scripts: [
      {
        type: "application/ld+json",
        children: JSON.stringify(faqJsonLd),
      },
    ],
  }),
  component: RouteComponent,
});

function RouteComponent() {
  return (
    <main id="main-content" className="relative">
      <Hero />

      <div className="container mx-auto px-4 sm:px-6 lg:px-12">
        <div className="border-x border-border [&>section]:border-t [&>section]:border-border [&>section:first-child]:border-t-0">
          <HowItWorks />
          <AISection />
          <Templates />
          <Pricing />
          <Privacy />
          <FAQ />
          <Prefooter />
          <Footer />
        </div>
      </div>
    </main>
  );
}
