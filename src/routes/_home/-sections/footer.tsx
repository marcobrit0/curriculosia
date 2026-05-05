import { t } from "@lingui/core/macro";
import { Trans } from "@lingui/react/macro";
import { Link } from "@tanstack/react-router";
import { motion } from "motion/react";
import { useState } from "react";

import { BrandIcon } from "@/components/ui/brand-icon";
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

const getProductLinks = (): FooterLinkItem[] => [
  { url: "/#how-it-works", label: t`Como funciona`, external: false },
  { url: "/#templates", label: t`Modelos`, external: false },
  { url: "/#ai", label: t`IA`, external: false },
  { url: "/#pricing", label: t`Preços`, external: false },
];

const getAccountLinks = (): FooterLinkItem[] => [
  { url: "/auth/login", label: t`Entrar`, external: false },
  { url: "/auth/register", label: t`Criar conta`, external: false },
];

const getLegalLinks = (): FooterLinkItem[] => [
  { url: "/privacy", label: t`Política de Privacidade`, external: false },
  { url: "/terms", label: t`Termos de Uso`, external: false },
];

const getContactLinks = (): FooterLinkItem[] => [
  { url: "mailto:suporte@curriculos.ia.br", label: "suporte@curriculos.ia.br", external: true },
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
      <div className="grid grid-cols-1 gap-8 sm:grid-cols-2 lg:grid-cols-5">
        <div className="space-y-4 sm:col-span-2 lg:col-span-1">
          <BrandIcon variant="logo" className="h-10 max-w-[11rem]" />

          <div className="space-y-2">
            <p className="text-lg font-bold tracking-tight">Currículos IA</p>
            <p className="max-w-xs text-sm leading-relaxed text-muted-foreground">
              <Trans>Ajuda profissionais no Brasil a criar currículos claros, modernos e prontos para enviar.</Trans>
            </p>
          </div>
        </div>

        <FooterLinkGroup title={t`Produto`} links={getProductLinks()} />
        <FooterLinkGroup title={t`Conta`} links={getAccountLinks()} />
        <FooterLinkGroup title={t`Legal`} links={getLegalLinks()} />

        <div className="space-y-6">
          <FooterLinkGroup title={t`Contato`} links={getContactLinks()} />
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
  const linkClassName = "relative inline-block text-sm transition-colors hover:text-foreground";
  const isHashLink = url.startsWith("/#");
  const isMailLink = url.startsWith("mailto:");
  const isInternalRoute = url.startsWith("/") && !isHashLink;
  const opensNewTab = external && !isHashLink && !isMailLink;

  const inner = (
    <>
      {label}
      {opensNewTab && <span className="sr-only"> ({t`abre em nova aba`})</span>}
      <motion.div
        aria-hidden="true"
        initial={{ width: 0, opacity: 0 }}
        animate={isHovered ? { width: "100%", opacity: 1 } : { width: 0, opacity: 0 }}
        transition={{ duration: 0.2, ease: "easeOut" }}
        className="pointer-events-none absolute inset-s-0 -bottom-0.5 h-px rounded-md bg-primary"
        style={{ willChange: "width, opacity" }}
      />
    </>
  );

  return (
    <li className="relative" onMouseEnter={() => setIsHovered(true)} onMouseLeave={() => setIsHovered(false)}>
      {isInternalRoute ? (
        <Link to={url} className={linkClassName}>
          {inner}
        </Link>
      ) : (
        <a
          href={url}
          target={opensNewTab ? "_blank" : undefined}
          rel={opensNewTab ? "noopener noreferrer" : undefined}
          className={linkClassName}
        >
          {inner}
        </a>
      )}
    </li>
  );
}
