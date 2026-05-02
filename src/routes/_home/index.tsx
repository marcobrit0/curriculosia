import { createFileRoute } from "@tanstack/react-router";

import { FAQ } from "./-sections/faq";
import { Features } from "./-sections/features";
import { Footer } from "./-sections/footer";
import { Hero } from "./-sections/hero";
import { Prefooter } from "./-sections/prefooter";
import { Statistics } from "./-sections/statistics";
import { Templates } from "./-sections/templates";
import { Testimonials } from "./-sections/testimonials";

const faqJsonLd = {
  "@context": "https://schema.org",
  "@type": "FAQPage",
  mainEntity: [
    {
      "@type": "Question",
      name: "O Currículos IA é realmente gratuito?",
      acceptedAnswer: {
        "@type": "Answer",
        text: "Sim! O criador de currículos — com templates, exportação em PDF e compartilhamento — é gratuito e sempre será. Os recursos com IA fazem parte de um plano premium opcional. O Currículos IA também é open-source: você pode hospedar na sua própria infraestrutura sem custo adicional.",
      },
    },
    {
      "@type": "Question",
      name: "Como meus dados são protegidos?",
      acceptedAnswer: {
        "@type": "Answer",
        text: "Seus dados são armazenados com segurança e nunca são compartilhados com terceiros. Você também pode hospedar o Currículos IA nos seus próprios servidores para ter controle total sobre suas informações.",
      },
    },
    {
      "@type": "Question",
      name: "Posso exportar meu currículo em PDF?",
      acceptedAnswer: {
        "@type": "Answer",
        text: "Com certeza! Você pode exportar seu currículo em PDF com um único clique. O PDF exportado mantém toda a formatação e o estilo exatamente como você configurou.",
      },
    },
    {
      "@type": "Question",
      name: "O que diferencia o Currículos IA de outros criadores de currículo?",
      acceptedAnswer: {
        "@type": "Answer",
        text: "O Currículos IA é open-source e focado em privacidade. O criador de currículos é gratuito, sem anúncios e sem rastreamento do conteúdo dos seus currículos.",
      },
    },
    {
      "@type": "Question",
      name: "O Currículos IA funciona bem para vagas no Brasil?",
      acceptedAnswer: {
        "@type": "Answer",
        text: "Sim! O Currículos IA foi pensado para o mercado brasileiro. Você pode criar currículos em português, com formatos e estilos adequados para as expectativas de recrutadores e empresas brasileiras.",
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
          <Statistics />
          <Features />
          <Templates />
          <Testimonials />
          <FAQ />
          <Prefooter />
          <Footer />
        </div>
      </div>
    </main>
  );
}
