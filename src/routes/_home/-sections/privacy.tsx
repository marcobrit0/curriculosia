import { Trans } from "@lingui/react/macro";
import { CreditCardIcon, DatabaseIcon, EyeSlashIcon, ShareNetworkIcon } from "@phosphor-icons/react";
import { motion } from "motion/react";

const items = [
  {
    icon: EyeSlashIcon,
    text: <Trans>Não vendemos seus dados pessoais.</Trans>,
  },
  {
    icon: DatabaseIcon,
    text: <Trans>Seu currículo fica salvo na sua conta.</Trans>,
  },
  {
    icon: ShareNetworkIcon,
    text: <Trans>Você controla o que exporta e compartilha.</Trans>,
  },
  {
    icon: CreditCardIcon,
    text: <Trans>Pagamentos processados por provedor seguro.</Trans>,
  },
];

export function Privacy() {
  return (
    <section id="privacy" className="p-4 md:p-8 xl:py-16">
      <motion.div
        className="grid gap-8 lg:grid-cols-[0.9fr_1.1fr] lg:items-start"
        initial={{ opacity: 0, y: 20 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true }}
        transition={{ duration: 0.45 }}
        style={{ willChange: "transform, opacity" }}
      >
        <div className="space-y-4">
          <h2 className="text-2xl font-semibold tracking-tight md:text-4xl xl:text-5xl">
            <Trans>Seus dados de carreira precisam ser tratados com cuidado</Trans>
          </h2>
          <p className="max-w-lg leading-relaxed text-muted-foreground">
            <Trans>
              Currículo tem histórico profissional, contatos e objetivos de carreira. A experiência pública precisa ser
              clara sobre o que fica na conta e o que você decide compartilhar.
            </Trans>
          </p>
        </div>

        <div className="grid gap-3 sm:grid-cols-2">
          {items.map((item, index) => (
            <div key={index} className="flex items-start gap-3 rounded-md border bg-background p-4">
              <div className="flex size-10 shrink-0 items-center justify-center rounded-md bg-primary/10 text-primary">
                <item.icon size={22} />
              </div>
              <p className="text-sm leading-relaxed text-muted-foreground">{item.text}</p>
            </div>
          ))}
        </div>
      </motion.div>
    </section>
  );
}
