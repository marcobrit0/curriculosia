import type { Icon } from "@phosphor-icons/react";

import { t } from "@lingui/core/macro";
import { Trans } from "@lingui/react/macro";
import { GithubLogoIcon } from "@phosphor-icons/react";
import { motion } from "motion/react";
import { useState } from "react";

import { BrandIcon } from "@/components/ui/brand-icon";
import { Button } from "@/components/ui/button";
import { Copyright } from "@/components/ui/copyright";

type FooterLinkItem = {
  url: string;
  label: string;
  external?: boolean;
};

type FooterLinkGroupProps = {
  title: string;
  links: FooterLinkItem[];
};

type SocialLink = {
  url: string;
  label: string;
  icon: Icon;
};

const getResourceLinks = (): FooterLinkItem[] => [
  { url: "https://docs.curriculos.ia.br/getting-started", label: t`Documentação`, external: true },
  { url: "https://docs.curriculos.ia.br/getting-started/quickstart", label: t`Início rápido`, external: true },
  { url: "https://github.com/marcobrit0/curriculosia", label: t`Código-fonte`, external: true },
];

const getCommunityLinks = (): FooterLinkItem[] => [
  { url: "https://github.com/marcobrit0/curriculosia/issues", label: t`Reportar um problema`, external: true },
  {
    url: "https://github.com/marcobrit0/curriculosia/discussions",
    label: t`Discussões`,
    external: true,
  },
];

const getLegalLinks = (): FooterLinkItem[] => [
  { url: "https://docs.curriculos.ia.br/legal/privacy-policy", label: t`Política de Privacidade`, external: true },
  { url: "https://docs.curriculos.ia.br/legal/terms-of-service", label: t`Termos de Uso`, external: true },
  { url: "https://docs.curriculos.ia.br/legal/license", label: t`Licença`, external: true },
];

const socialLinks: SocialLink[] = [
  { url: "https://github.com/marcobrit0/curriculosia", label: "GitHub", icon: GithubLogoIcon },
];

export function Footer() {
  return (
    <motion.footer
      id="footer"
      className="p-4 pb-8 md:p-8 md:pb-12"
      initial={{ opacity: 0 }}
      whileInView={{ opacity: 1 }}
      viewport={{ once: true }}
      transition={{ duration: 0.45 }}
      style={{ willChange: "opacity" }}
    >
      <div className="grid grid-cols-1 gap-8 sm:grid-cols-2 lg:grid-cols-4">
        {/* Brand Column */}
        <div className="space-y-4 sm:col-span-2 lg:col-span-1">
          <BrandIcon variant="logo" className="h-10 max-w-[11rem]" />

          <div className="space-y-2">
            <p className="text-lg font-bold tracking-tight">Currículos IA</p>
            <p className="max-w-xs text-sm leading-relaxed text-muted-foreground">
              <Trans>
                Criador de currículos gratuito e open-source com inteligência artificial, feito para o Brasil.
              </Trans>
            </p>
          </div>

          {/* Social Links */}
          <div className="flex items-center gap-2 pt-2">
            {socialLinks.map((social) => (
              <Button
                key={social.label}
                size="icon-sm"
                variant="ghost"
                nativeButton={false}
                render={
                  <a
                    href={social.url}
                    target="_blank"
                    rel="noopener noreferrer"
                    aria-label={`${social.label} (${t`abre em nova aba`})`}
                  >
                    <social.icon aria-hidden="true" size={18} />
                  </a>
                }
              />
            ))}
          </div>
        </div>

        {/* Resources Column */}
        <FooterLinkGroup title={t`Recursos`} links={getResourceLinks()} />

        {/* Community Column */}
        <FooterLinkGroup title={t`Comunidade`} links={getCommunityLinks()} />

        {/* Legal Column */}
        <div className="space-y-4">
          <FooterLinkGroup title={t`Legal`} links={getLegalLinks()} />
          <Copyright />
        </div>
      </div>
    </motion.footer>
  );
}

function FooterLinkGroup({ title, links }: FooterLinkGroupProps) {
  return (
    <div className="space-y-4">
      <h3 className="text-sm font-medium tracking-tight text-muted-foreground">{title}</h3>

      <ul className="space-y-3">
        {links.map((link) => (
          <FooterLink key={link.url} {...link} />
        ))}
      </ul>
    </div>
  );
}

function FooterLink({ url, label, external = true }: FooterLinkItem) {
  const [isHovered, setIsHovered] = useState(false);

  return (
    <li className="relative" onMouseEnter={() => setIsHovered(true)} onMouseLeave={() => setIsHovered(false)}>
      <a
        href={url}
        target={external ? "_blank" : undefined}
        rel={external ? "noopener noreferrer" : undefined}
        className="relative inline-block text-sm transition-colors hover:text-foreground"
      >
        {label}
        {external && <span className="sr-only"> ({t`abre em nova aba`})</span>}

        <motion.div
          aria-hidden="true"
          initial={{ width: 0, opacity: 0 }}
          animate={isHovered ? { width: "100%", opacity: 1 } : { width: 0, opacity: 0 }}
          transition={{ duration: 0.2, ease: "easeOut" }}
          className="pointer-events-none absolute inset-s-0 -bottom-0.5 h-px rounded-md bg-primary"
          style={{ willChange: "width, opacity" }}
        />
      </a>
    </li>
  );
}
