import { t } from "@lingui/core/macro";
import { Trans } from "@lingui/react/macro";
import { CheckIcon, CrownIcon, FilePdfIcon } from "@phosphor-icons/react";
import { useMutation } from "@tanstack/react-query";
import { useState } from "react";
import { toast } from "sonner";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Spinner } from "@/components/ui/spinner";
import { PRICING } from "@/constants/pricing";
import { orpc } from "@/integrations/orpc/client";
import { cn } from "@/utils/style";

type Props = {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  resumeId: string;
};

type SelectedPlan = "export" | "monthly" | "annual";

export function ExportPaywall({ open, onOpenChange, resumeId }: Props) {
  const [selected, setSelected] = useState<SelectedPlan>("export");

  const subCheckout = useMutation(orpc.billing.createSubscriptionCheckout.mutationOptions());
  const exportCheckout = useMutation(orpc.billing.createExportCheckout.mutationOptions());

  const isLoading = subCheckout.isPending || exportCheckout.isPending;

  const onContinue = async () => {
    try {
      if (selected === "export") {
        const { url, alreadyEntitled } = await exportCheckout.mutateAsync({ resumeId });
        if (alreadyEntitled) {
          toast.success(t`You already have access to this resume — try the export again.`);
          onOpenChange(false);
          return;
        }
        window.location.href = url;
        return;
      }
      const { url } = await subCheckout.mutateAsync({ plan: selected });
      window.location.href = url;
    } catch (error) {
      const message = error instanceof Error ? error.message : t`Could not start checkout.`;
      toast.error(message);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-lg">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-x-2">
            <FilePdfIcon className="size-5" />
            <Trans>Desbloquear exportação em PDF</Trans>
          </DialogTitle>
          <DialogDescription>
            <Trans>
              Escolha como deseja continuar. Você pode pagar uma vez por este currículo, ou ter acesso ilimitado com o
              plano Premium.
            </Trans>
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-3">
          <PlanCard
            selected={selected === "export"}
            onSelect={() => setSelected("export")}
            title={<Trans>Desbloquear este currículo</Trans>}
            price={PRICING.oneTimeExport.label}
            cadence={<Trans>pagamento único</Trans>}
            features={[
              <Trans key="f1">Exporte e baixe este currículo quantas vezes quiser</Trans>,
              <Trans key="f2">Re-edite e re-exporte sem custos adicionais</Trans>,
            ]}
          />

          <PlanCard
            selected={selected === "monthly"}
            onSelect={() => setSelected("monthly")}
            title={<Trans>Premium mensal</Trans>}
            price={`R$ ${PRICING.premiumMonthly.amount}`}
            cadence={<Trans>por mês</Trans>}
            badge={
              <Badge variant="secondary" className="gap-x-1">
                <CrownIcon className="size-3" />
                <Trans>Premium</Trans>
              </Badge>
            }
            features={[
              <Trans key="f1">Exportação ilimitada de todos os seus currículos</Trans>,
              <Trans key="f2">Recursos de IA (importar PDF, chat, adaptar para vagas)</Trans>,
              <Trans key="f3">Cancele quando quiser pelo painel</Trans>,
            ]}
          />

          <PlanCard
            selected={selected === "annual"}
            onSelect={() => setSelected("annual")}
            title={<Trans>Premium anual</Trans>}
            price={`R$ ${PRICING.premiumAnnual.amount}`}
            cadence={<Trans>por ano</Trans>}
            highlight={
              <Trans>
                Equivale a R$ {PRICING.premiumAnnual.monthlyEquivalent}/mês — economize 30% comparado ao mensal
              </Trans>
            }
            badge={
              <Badge className="gap-x-1 bg-primary text-primary-foreground">
                <Trans>Mais economia</Trans>
              </Badge>
            }
            features={[
              <Trans key="f1">Tudo do plano mensal</Trans>,
              <Trans key="f2">Pague uma vez no ano e relaxe</Trans>,
            ]}
          />
        </div>

        <div className="flex flex-col gap-2 pt-2">
          <Button onClick={onContinue} disabled={isLoading} className="w-full">
            {isLoading ? <Spinner /> : null}
            <Trans>Continuar para o pagamento</Trans>
          </Button>
          <p className="text-center text-xs text-muted-foreground">
            <Trans>
              Pagamentos seguros via Stripe. Em sua fatura, a cobrança aparecerá como <strong>MadeofIA</strong>.
            </Trans>
          </p>
        </div>
      </DialogContent>
    </Dialog>
  );
}

type PlanCardProps = {
  selected: boolean;
  onSelect: () => void;
  title: React.ReactNode;
  price: string;
  cadence: React.ReactNode;
  features: React.ReactNode[];
  highlight?: React.ReactNode;
  badge?: React.ReactNode;
};

function PlanCard({ selected, onSelect, title, price, cadence, features, highlight, badge }: PlanCardProps) {
  return (
    <button
      type="button"
      onClick={onSelect}
      className={cn(
        "w-full rounded-md border bg-popover p-4 text-start transition-colors hover:bg-muted/40",
        selected && "border-primary ring-1 ring-primary",
      )}
    >
      <div className="flex items-baseline justify-between gap-2">
        <div className="flex items-center gap-x-2">
          <h3 className="text-base font-semibold">{title}</h3>
          {badge}
        </div>
        <div className="text-end">
          <p className="text-lg font-bold tabular-nums">{price}</p>
          <p className="text-xs text-muted-foreground">{cadence}</p>
        </div>
      </div>
      {highlight && <p className="mt-1 text-xs text-primary">{highlight}</p>}
      <ul className="mt-3 space-y-1.5 text-sm">
        {features.map((feature, i) => (
          <li key={i} className="flex items-start gap-x-2 text-muted-foreground">
            <CheckIcon className="mt-0.5 size-3.5 shrink-0 text-primary" weight="bold" />
            <span>{feature}</span>
          </li>
        ))}
      </ul>
    </button>
  );
}
