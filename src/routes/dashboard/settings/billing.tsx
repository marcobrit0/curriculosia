import { t } from "@lingui/core/macro";
import { Trans } from "@lingui/react/macro";
import { ArrowSquareOutIcon, CheckCircleIcon, CreditCardIcon, CrownIcon, InfoIcon } from "@phosphor-icons/react";
import { useMutation, useQuery } from "@tanstack/react-query";
import { createFileRoute } from "@tanstack/react-router";
import { motion } from "motion/react";
import { useState } from "react";
import { toast } from "sonner";

import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import { Spinner } from "@/components/ui/spinner";
import { PRICING } from "@/constants/pricing";
import { orpc } from "@/integrations/orpc/client";

import { DashboardHeader } from "../-components/header";

export const Route = createFileRoute("/dashboard/settings/billing")({
  validateSearch: (search): { status?: string } => ({
    status: typeof search.status === "string" ? search.status : undefined,
  }),
  component: RouteComponent,
});

function RouteComponent() {
  const { status } = Route.useSearch();
  const [selectedPlan, setSelectedPlan] = useState<"monthly" | "annual">("monthly");

  const { data: subscription, isLoading: isSubLoading } = useQuery(orpc.billing.getSubscription.queryOptions());
  const subCheckout = useMutation(orpc.billing.createSubscriptionCheckout.mutationOptions());
  const portal = useMutation(orpc.billing.createPortalSession.mutationOptions());

  const isPremiumActive =
    subscription &&
    ["active", "trialing", "past_due"].includes(subscription.status) &&
    (subscription.currentPeriodEnd ? new Date(subscription.currentPeriodEnd) > new Date() : true);

  const onSubscribe = async () => {
    try {
      const { url } = await subCheckout.mutateAsync({ plan: selectedPlan });
      window.location.href = url;
    } catch (error) {
      toast.error(error instanceof Error ? error.message : t`Could not start checkout.`);
    }
  };

  const onManage = async () => {
    try {
      const { url } = await portal.mutateAsync(undefined);
      window.location.href = url;
    } catch (error) {
      toast.error(error instanceof Error ? error.message : t`Could not open billing portal.`);
    }
  };

  return (
    <div className="space-y-4">
      <DashboardHeader icon={CreditCardIcon} title={t`Plano e Cobrança`} />

      <Separator />

      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.25, ease: "easeOut" }}
        style={{ willChange: "transform, opacity" }}
        className="grid max-w-2xl gap-6"
      >
        {status === "subscription_success" && (
          <StatusBanner intent="success">
            <Trans>Assinatura ativada! O acesso Premium já está liberado na sua conta.</Trans>
          </StatusBanner>
        )}
        {status === "export_success" && (
          <StatusBanner intent="success">
            <Trans>Pagamento confirmado! Você já pode exportar este currículo quantas vezes quiser.</Trans>
          </StatusBanner>
        )}
        {status === "cancelled" && (
          <StatusBanner intent="info">
            <Trans>Pagamento cancelado. Você pode tentar novamente quando quiser.</Trans>
          </StatusBanner>
        )}

        {isSubLoading ? (
          <div className="flex justify-center p-8">
            <Spinner />
          </div>
        ) : isPremiumActive ? (
          <ActivePlanCard subscription={subscription} onManage={onManage} isManaging={portal.isPending} />
        ) : (
          <PlanPicker
            selectedPlan={selectedPlan}
            onSelectedPlanChange={setSelectedPlan}
            onSubscribe={onSubscribe}
            isSubscribing={subCheckout.isPending}
          />
        )}

        <div className="flex items-start gap-4 rounded-md border bg-popover p-6">
          <div className="rounded-md bg-muted p-2.5">
            <InfoIcon className="text-muted-foreground" size={24} />
          </div>
          <div className="flex-1 space-y-2 text-sm leading-relaxed text-muted-foreground">
            <p>
              <Trans>
                Pagamentos são processados pelo Stripe. Em sua fatura, a cobrança aparecerá como{" "}
                <strong>MadeofIA</strong>.
              </Trans>
            </p>
            <p>
              <Trans>
                Usuários do plano grátis podem desbloquear a exportação de um currículo específico por{" "}
                {PRICING.oneTimeExport.label} (pagamento único) diretamente do botão de exportação no editor.
              </Trans>
            </p>
          </div>
        </div>
      </motion.div>
    </div>
  );
}

function StatusBanner({ intent, children }: { intent: "success" | "info"; children: React.ReactNode }) {
  return (
    <div
      className={
        intent === "success"
          ? "flex items-start gap-3 rounded-md border border-success/30 bg-success/10 p-4 text-sm"
          : "flex items-start gap-3 rounded-md border bg-muted p-4 text-sm"
      }
    >
      <CheckCircleIcon
        className={
          intent === "success" ? "mt-0.5 size-5 shrink-0 text-success" : "mt-0.5 size-5 shrink-0 text-muted-foreground"
        }
      />
      <p>{children}</p>
    </div>
  );
}

type SubscriptionSummary = {
  id: string;
  provider: string;
  status: string;
  currentPeriodStart: string | null;
  currentPeriodEnd: string | null;
  cancelAtPeriodEnd: boolean;
  canceledAt: string | null;
};

function ActivePlanCard({
  subscription,
  onManage,
  isManaging,
}: {
  subscription: SubscriptionSummary;
  onManage: () => void;
  isManaging: boolean;
}) {
  const periodEnd = subscription.currentPeriodEnd ? new Date(subscription.currentPeriodEnd) : null;
  const cancelling = subscription.cancelAtPeriodEnd;

  return (
    <div className="space-y-4 rounded-md border bg-popover p-6">
      <div className="flex items-start justify-between gap-2">
        <div className="space-y-1">
          <div className="flex items-center gap-x-2">
            <CrownIcon className="size-5 text-primary" />
            <h3 className="text-lg font-semibold">
              <Trans>Premium ativo</Trans>
            </h3>
          </div>
          <p className="text-sm text-muted-foreground">
            <Trans>Status: {subscription.status}</Trans>
          </p>
        </div>
      </div>

      {periodEnd && (
        <p className="text-sm">
          {cancelling ? (
            <Trans>Cancelamento agendado — Premium ativo até {periodEnd.toLocaleDateString()}.</Trans>
          ) : (
            <Trans>Próxima renovação em {periodEnd.toLocaleDateString()}.</Trans>
          )}
        </p>
      )}

      <Button onClick={onManage} disabled={isManaging} variant="outline">
        {isManaging ? <Spinner /> : <ArrowSquareOutIcon />}
        <Trans>Gerenciar assinatura</Trans>
      </Button>
    </div>
  );
}

function PlanPicker({
  selectedPlan,
  onSelectedPlanChange,
  onSubscribe,
  isSubscribing,
}: {
  selectedPlan: "monthly" | "annual";
  onSelectedPlanChange: (plan: "monthly" | "annual") => void;
  onSubscribe: () => void;
  isSubscribing: boolean;
}) {
  return (
    <div className="space-y-4 rounded-md border bg-popover p-6">
      <div className="space-y-1">
        <h3 className="text-lg font-semibold">
          <Trans>Escolha seu plano Premium</Trans>
        </h3>
        <p className="text-sm text-muted-foreground">
          <Trans>Acesso ilimitado a IA, criação e exportação de currículos.</Trans>
        </p>
      </div>

      <div className="grid gap-3 sm:grid-cols-2">
        <PlanOption
          selected={selectedPlan === "monthly"}
          onSelect={() => onSelectedPlanChange("monthly")}
          title={<Trans>Mensal</Trans>}
          price={`R$ ${PRICING.premiumMonthly.amount}`}
          cadence={<Trans>por mês</Trans>}
        />
        <PlanOption
          selected={selectedPlan === "annual"}
          onSelect={() => onSelectedPlanChange("annual")}
          title={<Trans>Anual</Trans>}
          price={`R$ ${PRICING.premiumAnnual.amount}`}
          cadence={<Trans>por ano</Trans>}
          highlight={<Trans>R$ {PRICING.premiumAnnual.monthlyEquivalent}/mês — 30% off</Trans>}
        />
      </div>

      <Button onClick={onSubscribe} disabled={isSubscribing} className="w-full">
        {isSubscribing ? <Spinner /> : null}
        <Trans>Assinar Premium</Trans>
      </Button>
    </div>
  );
}

function PlanOption({
  selected,
  onSelect,
  title,
  price,
  cadence,
  highlight,
}: {
  selected: boolean;
  onSelect: () => void;
  title: React.ReactNode;
  price: string;
  cadence: React.ReactNode;
  highlight?: React.ReactNode;
}) {
  return (
    <button
      type="button"
      onClick={onSelect}
      className={
        selected
          ? "rounded-md border border-primary bg-popover p-4 text-start ring-1 ring-primary"
          : "rounded-md border bg-popover p-4 text-start hover:bg-muted/40"
      }
    >
      <p className="text-sm font-medium">{title}</p>
      <p className="text-2xl font-bold tabular-nums">{price}</p>
      <p className="text-xs text-muted-foreground">{cadence}</p>
      {highlight && <p className="mt-1 text-xs font-medium text-primary">{highlight}</p>}
    </button>
  );
}
