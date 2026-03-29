import { cn } from "@/utils/style";

type Props = React.ComponentProps<"img"> & {
  variant?: "logo" | "icon";
};

export function BrandIcon({ variant = "logo", className, ...props }: Props) {
  const baseClassName =
    variant === "logo" ? "h-10 w-auto max-w-[12rem] object-contain" : "h-6 w-auto max-w-[6rem] object-contain";

  return (
    <>
      <img
        src={`/${variant}/dark.svg`}
        alt="Currículos IA"
        className={cn("hidden dark:block", baseClassName, className)}
        {...props}
      />
      <img
        src={`/${variant}/light.svg`}
        alt="Currículos IA"
        className={cn("block dark:hidden", baseClassName, className)}
        {...props}
      />
    </>
  );
}
