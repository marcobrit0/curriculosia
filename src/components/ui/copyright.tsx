import { Trans } from "@lingui/react/macro";

import { cn } from "@/utils/style";

type Props = React.ComponentProps<"div">;

const COPYRIGHT_YEAR = new Date().getFullYear();

export function Copyright({ className, ...props }: Props) {
  return (
    <div className={cn("text-xs leading-relaxed text-muted-foreground/80", className)} {...props}>
      <p>
        <Trans>Currículos IA é um produto da empresa MadeofIA © {COPYRIGHT_YEAR} Todos os direitos reservados.</Trans>
      </p>

      <p>CNPJ 65.599.230/0001-64</p>

      <p className="mt-4">Currículos IA v{__APP_VERSION__}</p>
    </div>
  );
}
