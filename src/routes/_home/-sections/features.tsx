import { t } from "@lingui/core/macro";
import { Trans } from "@lingui/react/macro";
import {
  CloudArrowUpIcon,
  CodeSimpleIcon,
  CurrencyDollarIcon,
  DatabaseIcon,
  DotsThreeIcon,
  FileCssIcon,
  FilesIcon,
  GithubLogoIcon,
  GlobeIcon,
  type Icon,
  KeyIcon,
  LayoutIcon,
  LockSimpleIcon,
  PaletteIcon,
  ProhibitIcon,
  ShieldCheckIcon,
  TranslateIcon,
} from "@phosphor-icons/react";
import { motion } from "motion/react";
import { useMemo } from "react";

import { cn } from "@/utils/style";

type Feature = {
  id: string;
  icon: Icon;
  title: string;
  description: string;
};

type FeatureCardProps = Feature;

const getFeatures = (): Feature[] => [
  {
    id: "free",
    icon: CurrencyDollarIcon,
    title: t`Completamente gratuito`,
    description: t`Crie currículos profissionais sem pagar nada. Sem planos escondidos, sem limites de uso — gratuito para sempre.`,
  },
  {
    id: "open-source",
    icon: GithubLogoIcon,
    title: t`Open Source`,
    description: t`Código aberto e auditável. Construído pela comunidade, para a comunidade, com total transparência.`,
  },
  {
    id: "no-ads",
    icon: ProhibitIcon,
    title: t`Sem anúncios, sem rastreamento`,
    description: t`Nenhum banner, nenhum pop-up. Sua experiência de criação de currículo é limpa e focada.`,
  },
  {
    id: "data-security",
    icon: DatabaseIcon,
    title: t`Seus dados são seus`,
    description: t`Seus dados pessoais e currículos nunca são vendidos ou compartilhados com terceiros.`,
  },
  {
    id: "self-host",
    icon: CloudArrowUpIcon,
    title: t`Auto-hospedagem com Docker`,
    description: t`Instale o Currículos IA nos seus próprios servidores com Docker e tenha controle total dos seus dados.`,
  },
  {
    id: "languages",
    icon: TranslateIcon,
    title: t`Multilíngue`,
    description: t`Disponível em português, inglês e outros idiomas. Crie currículos para vagas no Brasil e no exterior.`,
  },
  {
    id: "auth",
    icon: KeyIcon,
    title: t`Acesso com um clique`,
    description: t`Entre com GitHub, Google ou provedor OAuth personalizado. Sem complicação para começar.`,
  },
  {
    id: "2fa",
    icon: ShieldCheckIcon,
    title: t`Passkeys e autenticação 2FA`,
    description: t`Proteja sua conta com camadas extras de segurança, incluindo passkeys e verificação em duas etapas.`,
  },
  {
    id: "unlimited-resumes",
    icon: FilesIcon,
    title: t`Currículos ilimitados`,
    description: t`Crie quantos currículos quiser — para vagas diferentes, áreas diferentes, sem nenhum limite.`,
  },
  {
    id: "design",
    icon: PaletteIcon,
    title: t`Personalização total`,
    description: t`Escolha cores, fontes e estilos para deixar seu currículo com a sua identidade visual.`,
  },
  {
    id: "css",
    icon: FileCssIcon,
    title: t`CSS personalizado`,
    description: t`Escreva seu próprio CSS ou use IA para gerar estilos exclusivos e ter controle absoluto do layout.`,
  },
  {
    id: "templates",
    icon: LayoutIcon,
    title: t`12+ modelos profissionais`,
    description: t`Modelos de currículo modernos e elegantes para diferentes perfis e áreas de atuação.`,
  },
  {
    id: "public",
    icon: GlobeIcon,
    title: t`Link público para compartilhar`,
    description: t`Compartilhe seu currículo com um link único. Ideal para enviar a recrutadores e LinkedIn.`,
  },
  {
    id: "password-protection",
    icon: LockSimpleIcon,
    title: t`Proteção por senha`,
    description: t`Defina uma senha para o seu currículo e controle quem pode visualizá-lo.`,
  },
  {
    id: "api-access",
    icon: CodeSimpleIcon,
    title: t`Acesso via API`,
    description: t`Integre o Currículos IA aos seus sistemas e acesse seus dados programaticamente.`,
  },
  {
    id: "more",
    icon: DotsThreeIcon,
    title: t`E muito mais...`,
    description: t`Novas funcionalidades são adicionadas regularmente. Fique de olho nas novidades!`,
  },
];

function FeatureCard({ icon: Icon, title, description }: FeatureCardProps) {
  return (
    <motion.div
      className={cn(
        "group relative flex min-h-48 flex-col gap-4 overflow-hidden border-b bg-background p-6 transition-[background-color] duration-300",
        "not-nth-[2n]:border-r xl:not-nth-[4n]:border-r",
        "hover:bg-secondary/30",
      )}
      initial={{ opacity: 0, y: 16 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, amount: 0.1 }}
      transition={{ duration: 0.35, ease: "easeOut" }}
      whileHover={{ y: -3, scale: 1.01 }}
      whileTap={{ scale: 0.995 }}
      style={{ willChange: "transform, opacity" }}
    >
      {/* Hover gradient overlay */}
      <div
        aria-hidden="true"
        className="pointer-events-none absolute inset-0 bg-linear-to-br from-primary/5 via-transparent to-transparent opacity-0 transition-opacity duration-300 group-hover:opacity-100"
      />

      {/* Icon */}
      <div aria-hidden="true" className="relative">
        <div className="inline-flex rounded-md bg-primary/5 p-2.5 text-foreground transition-colors group-hover:bg-primary/10 group-hover:text-primary">
          <Icon size={24} weight="regular" />
        </div>
      </div>

      {/* Content */}
      <div className="relative flex flex-col gap-y-1.5">
        <h3 className="text-base font-semibold tracking-tight transition-colors group-hover:text-primary">{title}</h3>
        <p className="text-sm leading-relaxed text-muted-foreground">{description}</p>
      </div>
    </motion.div>
  );
}

export function Features() {
  const features = useMemo(() => getFeatures(), []);

  return (
    <section id="features">
      {/* Header */}
      <motion.div
        className="space-y-4 p-4 md:p-8 xl:py-16"
        initial={{ opacity: 0, y: 20 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true }}
        transition={{ duration: 0.45 }}
        style={{ willChange: "transform, opacity" }}
      >
        <h2 className="text-2xl font-semibold tracking-tight md:text-4xl xl:text-5xl">
          <Trans>Tudo que você precisa para o seu currículo</Trans>
        </h2>

        <p className="max-w-2xl leading-relaxed text-muted-foreground">
          <Trans>
            Crie, personalize e compartilhe currículos profissionais com privacidade total. Open-source, sem anúncios,
            com IA integrada — e 100% gratuito para sempre.
          </Trans>
        </p>
      </motion.div>

      {/* Features Grid */}
      <div className="xs:grid-cols-2 grid grid-cols-1 border-t xl:grid-cols-4">
        {features.map((feature) => (
          <FeatureCard key={feature.id} {...feature} />
        ))}
      </div>
    </section>
  );
}
