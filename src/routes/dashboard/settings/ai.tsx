import { t } from "@lingui/core/macro";
import { Trans } from "@lingui/react/macro";
import { BrainIcon, CheckCircleIcon, CrownIcon, InfoIcon, XCircleIcon } from "@phosphor-icons/react";
import { useMutation, useQuery } from "@tanstack/react-query";
import { createFileRoute } from "@tanstack/react-router";
import { motion } from "motion/react";
import { useMemo } from "react";
import { toast } from "sonner";
import { useIsClient } from "usehooks-ts";

import { Button } from "@/components/ui/button";
import { Combobox, type ComboboxOption } from "@/components/ui/combobox";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Separator } from "@/components/ui/separator";
import { Spinner } from "@/components/ui/spinner";
import { Switch } from "@/components/ui/switch";
import { type AIProvider, useAIStore } from "@/integrations/ai/store";
import { orpc } from "@/integrations/orpc/client";
import { cn } from "@/utils/style";

import { DashboardHeader } from "../-components/header";

export const Route = createFileRoute("/dashboard/settings/ai")({
  component: RouteComponent,
});

const providerOptions: (ComboboxOption<AIProvider> & { defaultBaseURL: string })[] = [
  {
    value: "openai",
    label: "OpenAI",
    keywords: ["openai", "gpt", "chatgpt"],
    defaultBaseURL: "https://api.openai.com/v1",
  },
  {
    value: "ollama",
    label: "Ollama",
    keywords: ["ollama", "ai", "local"],
    defaultBaseURL: "http://localhost:11434",
  },
  {
    value: "anthropic",
    label: "Anthropic Claude",
    keywords: ["anthropic", "claude", "ai"],
    defaultBaseURL: "https://api.anthropic.com/v1",
  },
  {
    value: "vercel-ai-gateway",
    label: "Vercel AI Gateway",
    keywords: ["vercel", "gateway", "ai"],
    defaultBaseURL: "https://ai-gateway.vercel.sh/v1/ai",
  },
  {
    value: "gemini",
    label: "Google Gemini",
    keywords: ["gemini", "google", "bard"],
    defaultBaseURL: "https://generativelanguage.googleapis.com/v1beta",
  },
];

type UsageInfo = {
  used: number;
  cap: number;
  remaining: number;
  periodEnd: string;
};

function ManagedAIPanel({
  isPremium,
  hasManagedKey,
  defaultModel,
  usage,
}: {
  isPremium: boolean;
  hasManagedKey: boolean;
  defaultModel: string;
  usage: UsageInfo | undefined;
}) {
  const model = useAIStore((s) => s.model);
  const setStore = useAIStore((s) => s.set);

  if (!hasManagedKey) {
    return (
      <div className="flex items-start gap-4 rounded-md border bg-popover p-6">
        <div className="rounded-md bg-muted p-2.5">
          <InfoIcon className="text-muted-foreground" size={24} />
        </div>
        <div className="flex-1 space-y-2">
          <h3 className="font-semibold">
            <Trans>Managed AI not configured</Trans>
          </h3>
          <p className="leading-relaxed text-muted-foreground">
            <Trans>
              This instance is set to managed mode but no managed API key is configured. Contact your administrator.
            </Trans>
          </p>
        </div>
      </div>
    );
  }

  if (!isPremium) {
    return (
      <div className="flex items-start gap-4 rounded-md border bg-popover p-6">
        <div className="rounded-md bg-primary/10 p-2.5">
          <CrownIcon className="text-primary" size={24} />
        </div>
        <div className="flex-1 space-y-2">
          <h3 className="font-semibold">
            <Trans>Premium AI is not enabled on your account</Trans>
          </h3>
          <p className="leading-relaxed text-muted-foreground">
            <Trans>Subscribe to Premium to use Currículos IA's managed AI without bringing your own API key.</Trans>
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <div className="flex items-start gap-4 rounded-md border bg-popover p-6">
        <div className="rounded-md bg-primary/10 p-2.5">
          <CrownIcon className="text-primary" size={24} />
        </div>
        <div className="flex-1 space-y-2">
          <h3 className="font-semibold">
            <Trans>Managed AI is active</Trans>
          </h3>
          <p className="leading-relaxed text-muted-foreground">
            <Trans>Your AI requests are routed through Currículos IA's managed key. No further setup required.</Trans>
          </p>
        </div>
      </div>

      {usage && <UsageMeter usage={usage} />}

      <div className="flex flex-col gap-y-2">
        <Label htmlFor="ai-managed-model">
          <Trans>Model (optional)</Trans>
        </Label>
        <Input
          id="ai-managed-model"
          name="ai-managed-model"
          type="text"
          value={model}
          onChange={(e) =>
            setStore((draft) => {
              draft.model = e.target.value;
            })
          }
          placeholder={defaultModel}
          autoCorrect="off"
          autoComplete="off"
          spellCheck="false"
          autoCapitalize="off"
        />
        <p className="text-xs text-muted-foreground">
          <Trans>
            Leave blank to use the default. Any OpenRouter model identifier works (e.g., openai/gpt-4o-mini).
          </Trans>
        </p>
      </div>
    </div>
  );
}

function UsageMeter({ usage }: { usage: UsageInfo }) {
  const pct = usage.cap > 0 ? Math.min(100, Math.round((usage.used / usage.cap) * 100)) : 0;
  const resetDate = new Date(usage.periodEnd);
  const isOverLimit = usage.remaining <= 0;
  const isNearLimit = !isOverLimit && pct >= 80;

  return (
    <div className="rounded-md border bg-popover p-4">
      <div className="mb-2 flex items-baseline justify-between">
        <span className="text-sm font-medium">
          <Trans>Monthly AI usage</Trans>
        </span>
        <span
          className={cn(
            "text-sm tabular-nums",
            isOverLimit && "text-destructive",
            isNearLimit && "text-amber-600 dark:text-amber-400",
          )}
        >
          {usage.used} / {usage.cap}
        </span>
      </div>
      <div className="h-2 w-full overflow-hidden rounded-full bg-muted">
        <div
          className={cn(
            "h-full transition-[width]",
            isOverLimit ? "bg-destructive" : isNearLimit ? "bg-amber-500" : "bg-primary",
          )}
          style={{ width: `${pct}%` }}
        />
      </div>
      <p className="mt-2 text-xs text-muted-foreground">
        <Trans>Resets on {resetDate.toLocaleDateString()}</Trans>
      </p>
    </div>
  );
}

function AIForm() {
  const { set, model, apiKey, baseURL, provider, enabled, testStatus } = useAIStore();

  const selectedOption = useMemo(() => {
    return providerOptions.find((option) => option.value === provider);
  }, [provider]);

  const { mutate: testConnection, isPending: isTesting } = useMutation(orpc.ai.testConnection.mutationOptions());

  const handleProviderChange = (value: AIProvider | null) => {
    if (!value) return;
    set((draft) => {
      draft.provider = value;
    });
  };

  const handleModelChange = (value: string) => {
    set((draft) => {
      draft.model = value;
    });
  };

  const handleApiKeyChange = (value: string) => {
    set((draft) => {
      draft.apiKey = value;
    });
  };

  const handleBaseURLChange = (value: string) => {
    set((draft) => {
      draft.baseURL = value;
    });
  };

  const handleTestConnection = () => {
    testConnection(
      { provider, model, apiKey, baseURL },
      {
        onSuccess: (data) => {
          set((draft) => {
            draft.testStatus = data ? "success" : "failure";
          });
        },
        onError: (error) => {
          set((draft) => {
            draft.testStatus = "failure";
          });

          toast.error(error.message);
        },
      },
    );
  };

  return (
    <div className="grid gap-6 sm:grid-cols-2">
      <div className="flex flex-col gap-y-2">
        <Label htmlFor="ai-provider">
          <Trans>Provider</Trans>
        </Label>
        <Combobox
          id="ai-provider"
          value={provider}
          disabled={enabled}
          options={providerOptions}
          onValueChange={handleProviderChange}
        />
      </div>

      <div className="flex flex-col gap-y-2">
        <Label htmlFor="ai-model">
          <Trans>Model</Trans>
        </Label>
        <Input
          id="ai-model"
          name="ai-model"
          type="text"
          value={model}
          disabled={enabled}
          onChange={(e) => handleModelChange(e.target.value)}
          placeholder="e.g., gpt-4, claude-3-opus, gemini-pro"
          autoCorrect="off"
          autoComplete="off"
          spellCheck="false"
          autoCapitalize="off"
        />
      </div>

      <div className="flex flex-col gap-y-2 sm:col-span-2">
        <Label htmlFor="ai-api-key">
          <Trans>API Key</Trans>
        </Label>
        <Input
          id="ai-api-key"
          name="ai-api-key"
          type="password"
          value={apiKey}
          disabled={enabled}
          onChange={(e) => handleApiKeyChange(e.target.value)}
          autoCorrect="off"
          autoComplete="off"
          spellCheck="false"
          autoCapitalize="off"
          // ignore password managers
          data-lpignore="true"
          data-bwignore="true"
          data-1p-ignore="true"
        />
      </div>

      <div className="flex flex-col gap-y-2 sm:col-span-2">
        <Label htmlFor="ai-base-url">
          <Trans>Base URL (Optional)</Trans>
        </Label>
        <Input
          id="ai-base-url"
          name="ai-base-url"
          type="url"
          value={baseURL}
          disabled={enabled}
          placeholder={selectedOption?.defaultBaseURL}
          onChange={(e) => handleBaseURLChange(e.target.value)}
          autoCorrect="off"
          autoComplete="off"
          spellCheck="false"
          autoCapitalize="off"
        />
      </div>

      <div>
        <Button variant="outline" disabled={isTesting || enabled} onClick={handleTestConnection}>
          {isTesting ? (
            <Spinner />
          ) : testStatus === "success" ? (
            <CheckCircleIcon className="text-success" />
          ) : testStatus === "failure" ? (
            <XCircleIcon className="text-destructive" />
          ) : null}
          <Trans>Test Connection</Trans>
        </Button>
      </div>
    </div>
  );
}

function RouteComponent() {
  const isClient = useIsClient();

  const enabled = useAIStore((state) => state.enabled);
  const canEnable = useAIStore((state) => state.canEnable());
  const setEnabled = useAIStore((state) => state.setEnabled);
  const mode = useAIStore((state) => state.mode);
  const setMode = useAIStore((state) => state.setMode);

  const { data: config, isLoading: isConfigLoading } = useQuery(orpc.ai.getConfig.queryOptions());

  const serverMode = config?.mode ?? "byo";
  const canPickManaged = serverMode === "both" && Boolean(config?.hasManagedKey) && Boolean(config?.isPremium);

  let effectiveMode: "byo" | "managed";
  if (serverMode === "byo") {
    effectiveMode = "byo";
  } else if (serverMode === "managed") {
    effectiveMode = "managed";
  } else {
    effectiveMode = canPickManaged && mode === "managed" ? "managed" : "byo";
  }
  const showByoForm = effectiveMode === "byo";
  const showManagedPanel = effectiveMode === "managed";

  if (!isClient) return null;

  return (
    <div className="space-y-4">
      <DashboardHeader icon={BrainIcon} title={t`Artificial Intelligence`} />

      <Separator />

      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.25, ease: "easeOut" }}
        style={{ willChange: "transform, opacity" }}
        className="grid max-w-xl gap-6"
      >
        <div className="flex items-start gap-4 rounded-md border bg-popover p-6">
          <div className="rounded-md bg-primary/10 p-2.5">
            <InfoIcon className="text-primary" size={24} />
          </div>

          <div className="flex-1 space-y-2">
            <h3 className="font-semibold">
              <Trans>Your data is stored locally</Trans>
            </h3>

            <p className="leading-relaxed text-muted-foreground">
              <Trans>
                Bring-your-own-key credentials are stored only on your browser. Your data is sent to the AI provider
                only when you make a request, and is never stored or logged on our servers.
              </Trans>
            </p>
          </div>
        </div>

        {!isConfigLoading && config && !config.enabled && (
          <div className="flex items-start gap-4 rounded-md border bg-popover p-6">
            <div className="rounded-md bg-destructive/10 p-2.5">
              <XCircleIcon className="text-destructive" size={24} />
            </div>
            <div className="flex-1 space-y-2">
              <h3 className="font-semibold">
                <Trans>AI is disabled on this instance</Trans>
              </h3>
              <p className="leading-relaxed text-muted-foreground">
                <Trans>The administrator has disabled all AI features.</Trans>
              </p>
            </div>
          </div>
        )}

        {canPickManaged && (
          <>
            <Separator />
            <div className="flex items-center justify-between">
              <Label htmlFor="ai-mode-toggle">
                <Trans>Use managed AI (Premium)</Trans>
              </Label>
              <Switch
                id="ai-mode-toggle"
                checked={mode === "managed"}
                onCheckedChange={(checked) => setMode(checked ? "managed" : "byo")}
              />
            </div>
          </>
        )}

        <Separator />

        {showManagedPanel && (
          <ManagedAIPanel
            isPremium={Boolean(config?.isPremium)}
            hasManagedKey={Boolean(config?.hasManagedKey)}
            defaultModel={config?.defaultManagedModel ?? ""}
            usage={config?.usage}
          />
        )}

        {showByoForm && (
          <>
            <div className="flex items-center justify-between">
              <Label htmlFor="enable-ai">
                <Trans>Enable AI Features</Trans>
              </Label>
              <Switch id="enable-ai" checked={enabled} disabled={!canEnable} onCheckedChange={setEnabled} />
            </div>

            <p className={cn("flex items-center gap-x-2", enabled ? "text-success" : "text-destructive")}>
              {enabled ? <CheckCircleIcon /> : <XCircleIcon />}
              {enabled ? <Trans>Enabled</Trans> : <Trans>Disabled</Trans>}
            </p>

            <AIForm />
          </>
        )}
      </motion.div>
    </div>
  );
}
