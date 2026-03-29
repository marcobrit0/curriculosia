import { Trans } from "@lingui/react/macro";

import { cn } from "@/utils/style";

type Props = React.ComponentProps<"div">;

export function Copyright({ className, ...props }: Props) {
  return (
    <div className={cn("text-xs leading-relaxed text-muted-foreground/80", className)} {...props}>
      <p>
        <Trans>
          Licensed under{" "}
          <a href="#" target="_blank" rel="noopener" className="font-medium underline underline-offset-2">
            MIT
          </a>
          .
        </Trans>
      </p>

      <p>
        <Trans>By the community, for the community.</Trans>
      </p>

      <p>
        <Trans>
          Built by{" "}
          <a
            target="_blank"
            rel="noopener"
            href="https://curriculos.ia.br"
            className="font-medium underline underline-offset-2"
          >
            CriarCurrículo
          </a>
          , based on Reactive Resume by Amruth Pillai.
        </Trans>
      </p>

      <p className="mt-4">CriarCurrículo v{__APP_VERSION__}</p>
    </div>
  );
}
