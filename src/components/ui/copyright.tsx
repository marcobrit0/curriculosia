import { Trans } from "@lingui/react/macro";

import { cn } from "@/utils/style";

type Props = React.ComponentProps<"div">;

export function Copyright({ className, ...props }: Props) {
  return (
    <div className={cn("text-xs leading-relaxed text-muted-foreground/80", className)} {...props}>
      <p>
        <Trans>By the community, for the community.</Trans>
      </p>

      <p>
        <Trans>
          Built for{" "}
          <a
            target="_blank"
            rel="noopener"
            href="https://curriculos.ia.br"
            className="font-medium underline underline-offset-2"
          >
            Currículos IA
          </a>
          .
        </Trans>
      </p>

      <p className="mt-4">Currículos IA v{__APP_VERSION__}</p>
    </div>
  );
}
