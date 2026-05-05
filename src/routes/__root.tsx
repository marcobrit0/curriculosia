import "@fontsource-variable/ibm-plex-sans";
import "@phosphor-icons/web/regular/style.css";
import type { QueryClient } from "@tanstack/react-query";

import { i18n } from "@lingui/core";
import { I18nProvider } from "@lingui/react";
import { IconContext } from "@phosphor-icons/react";
import { createRootRouteWithContext, HeadContent, Scripts } from "@tanstack/react-router";
import { MotionConfig } from "motion/react";

import type { AuthSession } from "@/integrations/auth/types";
import type { orpc } from "@/integrations/orpc/client";
import type { FeatureFlags } from "@/integrations/orpc/services/flags";

import { CommandPalette } from "@/components/command-palette";
import { BreakpointIndicator } from "@/components/layout/breakpoint-indicator";
import { NavigationProgress } from "@/components/layout/navigation-progress";
import { ThemeProvider } from "@/components/theme/provider";
import { Toaster } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { PRICING } from "@/constants/pricing";
import { DialogManager } from "@/dialogs/manager";
import { ConfirmDialogProvider } from "@/hooks/use-confirm";
import { PromptDialogProvider } from "@/hooks/use-prompt";
import { getSession } from "@/integrations/auth/functions";
import { PostHogProvider } from "@/integrations/posthog/provider";
import { getLocale, isRTL, type Locale, loadLocale } from "@/utils/locale";
import { getTheme, type Theme } from "@/utils/theme";

import appCss from "../styles/globals.css?url";

type RouterContext = {
  theme: Theme;
  locale: Locale;
  orpc: typeof orpc;
  queryClient: QueryClient;
  session: AuthSession | null;
  flags: FeatureFlags;
};

const appName = "Currículos IA";
const tagline = "Crie seu currículo profissional com IA";
const title = `${appName} — ${tagline}`;
const description =
  "Currículos IA ajuda profissionais no Brasil a criar currículos claros, modernos e prontos para enviar. Comece grátis e exporte em PDF quando estiver pronto.";

await loadLocale(await getLocale());

export const Route = createRootRouteWithContext<RouterContext>()({
  shellComponent: RootDocument,
  head: () => {
    const appUrl = process.env.APP_URL ?? "https://curriculos.ia.br/";

    return {
      links: [
        { rel: "stylesheet", href: appCss },
        // Icons
        { rel: "icon", href: "/favicon.ico", type: "image/x-icon", sizes: "128x128" },
        { rel: "icon", href: "/favicon.svg", type: "image/svg+xml", sizes: "256x256 any" },
        { rel: "apple-touch-icon", href: "/apple-touch-icon-180x180.png", type: "image/png", sizes: "180x180 any" },
        // Manifest
        { rel: "manifest", href: "/manifest.webmanifest", crossOrigin: "use-credentials" },
        // Canonical
        { rel: "canonical", href: appUrl },
      ],
      meta: [
        { title },
        { charSet: "UTF-8" },
        { name: "description", content: description },
        { name: "viewport", content: "width=device-width, initial-scale=1" },
        // Twitter Tags
        { property: "twitter:image", content: `${appUrl}/opengraph/banner.jpg` },
        { property: "twitter:card", content: "summary_large_image" },
        { property: "twitter:title", content: title },
        { property: "twitter:description", content: description },
        // OpenGraph Tags
        { property: "og:type", content: "website" },
        { property: "og:image", content: `${appUrl}/opengraph/banner.jpg` },
        { property: "og:image:width", content: "1200" },
        { property: "og:image:height", content: "630" },
        { property: "og:site_name", content: appName },
        { property: "og:title", content: title },
        { property: "og:description", content: description },
        { property: "og:url", content: appUrl },
        { property: "og:locale", content: "pt_BR" },
      ],
      // Register service worker via script tag
      scripts: [
        {
          children: `
						if('serviceWorker' in navigator) {
							window.addEventListener('load', () => {
								navigator.serviceWorker.register('/sw.js', { scope: '/' })
							})
						}
					`,
        },
        {
          type: "application/ld+json",
          children: JSON.stringify({
            "@context": "https://schema.org",
            "@graph": [
              {
                "@type": "WebApplication",
                "@id": `${appUrl}#webapp`,
                name: appName,
                url: appUrl,
                description,
                applicationCategory: "BusinessApplication",
                operatingSystem: "Web",
                offers: [
                  {
                    "@type": "Offer",
                    name: "Editor grátis",
                    price: "0",
                    priceCurrency: "BRL",
                  },
                  {
                    "@type": "Offer",
                    name: "Exportação avulsa em PDF",
                    price: PRICING.oneTimeExport.amount.replace(",", "."),
                    priceCurrency: "BRL",
                  },
                  {
                    "@type": "Offer",
                    name: "Premium mensal",
                    price: PRICING.premiumMonthly.amount.replace(",", "."),
                    priceCurrency: "BRL",
                  },
                ],
                inLanguage: ["pt-BR", "en"],
                featureList: [
                  "Editor de currículos com início grátis",
                  "Inteligência artificial para currículos",
                  "Exportação paga em PDF",
                  "12+ modelos de currículo",
                  "Compartilhamento com link público",
                ],
              },
              {
                "@type": "Organization",
                "@id": `${appUrl}#organization`,
                name: appName,
                url: appUrl,
                logo: `${appUrl}/opengraph/logo.svg`,
              },
            ],
          }),
        },
      ],
    };
  },
  beforeLoad: async ({ context }) => {
    const [theme, locale, session] = await Promise.all([getTheme(), getLocale(), getSession()]);

    return { theme, locale, session, flags: context.flags };
  },
});

type Props = {
  children: React.ReactNode;
};

function RootDocument({ children }: Props) {
  const { theme, locale, session } = Route.useRouteContext();
  const dir = isRTL(locale) ? "rtl" : "ltr";

  return (
    <html suppressHydrationWarning dir={dir} lang={locale} className={theme}>
      <head>
        <HeadContent />
      </head>

      <body>
        <MotionConfig reducedMotion="user">
          <I18nProvider i18n={i18n}>
            <IconContext.Provider value={{ size: 16, weight: "regular" }}>
              <PostHogProvider>
                <ThemeProvider theme={theme}>
                  <TooltipProvider>
                    <ConfirmDialogProvider>
                      <PromptDialogProvider>
                        {children}

                        <NavigationProgress />
                        <DialogManager />
                        {session && <CommandPalette />}
                        <Toaster richColors position="bottom-right" />

                        {import.meta.env.DEV && <BreakpointIndicator />}
                      </PromptDialogProvider>
                    </ConfirmDialogProvider>
                  </TooltipProvider>
                </ThemeProvider>
              </PostHogProvider>
            </IconContext.Provider>
          </I18nProvider>
        </MotionConfig>

        <Scripts />
      </body>
    </html>
  );
}
