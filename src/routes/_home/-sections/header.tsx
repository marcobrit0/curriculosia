import { t } from "@lingui/core/macro";
import { Trans } from "@lingui/react/macro";
import { ArrowRightIcon, ListIcon } from "@phosphor-icons/react";
import { Link } from "@tanstack/react-router";
import { motion, useMotionValue, useSpring } from "motion/react";
import { useEffect, useRef } from "react";

import { BrandIcon } from "@/components/ui/brand-icon";
import { Button } from "@/components/ui/button";
import { Sheet, SheetClose, SheetContent, SheetHeader, SheetTitle, SheetTrigger } from "@/components/ui/sheet";

const navLinks = [
  { href: "/#how-it-works", label: <Trans>Como funciona</Trans> },
  { href: "/#templates", label: <Trans>Modelos</Trans> },
  { href: "/#ai", label: <Trans>IA</Trans> },
  { href: "/#pricing", label: <Trans>Preços</Trans> },
  { href: "/#frequently-asked-questions", label: <Trans>FAQ</Trans> },
];

export function Header() {
  const y = useMotionValue(0);
  const lastScroll = useRef(0);
  const ticking = useRef(false);
  const springY = useSpring(y, { stiffness: 300, damping: 40 });

  useEffect(() => {
    if (typeof window === "undefined") return;

    function onScroll() {
      const current = window.scrollY ?? 0;
      if (!ticking.current) {
        window.requestAnimationFrame(() => {
          if (current > 32 && current > lastScroll.current) {
            y.set(-100);
          } else {
            y.set(0);
          }
          lastScroll.current = current;
          ticking.current = false;
        });
        ticking.current = true;
      }
    }

    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, [y]);

  return (
    <motion.header
      style={{ y: springY }}
      className="fixed inset-x-0 top-0 z-50 border-b border-border/70 bg-background/90 backdrop-blur-lg transition-colors"
      initial={{ y: -100, opacity: 0 }}
      animate={{ y: 0, opacity: 1 }}
      transition={{ duration: 0.35, ease: "easeOut" }}
    >
      <nav aria-label={t`Navegação principal`} className="container mx-auto flex items-center gap-x-4 p-3 lg:px-12">
        <Link
          to="/"
          className="transition-opacity hover:opacity-80"
          aria-label={t`Currículos IA - ir para a página inicial`}
        >
          <BrandIcon className="h-9 max-w-[10rem]" />
        </Link>

        <div className="ml-6 hidden items-center gap-x-5 text-sm font-medium text-muted-foreground md:flex">
          {navLinks.map((link) => (
            <a key={link.href} href={link.href} className="transition-colors hover:text-foreground">
              {link.label}
            </a>
          ))}
        </div>

        <div className="ml-auto hidden items-center gap-x-2 sm:flex">
          <Button
            variant="ghost"
            nativeButton={false}
            render={
              <Link to="/auth/login">
                <Trans>Entrar</Trans>
              </Link>
            }
          />
          <Button
            nativeButton={false}
            className="group gap-2"
            render={
              <Link to="/auth/register">
                <Trans>Criar currículo grátis</Trans>
                <ArrowRightIcon className="size-4 transition-transform group-hover:translate-x-0.5" />
              </Link>
            }
          />
        </div>

        <div className="ml-auto flex items-center gap-x-2 sm:hidden">
          <Button
            size="sm"
            nativeButton={false}
            render={
              <Link to="/auth/register">
                <Trans>Começar</Trans>
              </Link>
            }
          />
          <MobileMenu />
        </div>
      </nav>
    </motion.header>
  );
}

function MobileMenu() {
  return (
    <Sheet>
      <SheetTrigger
        render={
          <Button size="icon" variant="ghost" aria-label={t`Abrir menu de navegação`}>
            <ListIcon />
          </Button>
        }
      />
      <SheetContent side="right">
        <SheetHeader>
          <SheetTitle>
            <Trans>Currículos IA</Trans>
          </SheetTitle>
        </SheetHeader>

        <div className="flex flex-col gap-1 px-4">
          {navLinks.map((link) => (
            <SheetClose
              key={link.href}
              render={
                <a href={link.href} className="rounded-md px-3 py-2 text-base font-medium hover:bg-muted">
                  {link.label}
                </a>
              }
            />
          ))}
        </div>

        <div className="mt-auto grid gap-2 p-4">
          <Button
            nativeButton={false}
            render={
              <Link to="/auth/register">
                <Trans>Criar currículo grátis</Trans>
              </Link>
            }
          />
          <Button
            variant="outline"
            nativeButton={false}
            render={
              <Link to="/auth/login">
                <Trans>Entrar</Trans>
              </Link>
            }
          />
        </div>
      </SheetContent>
    </Sheet>
  );
}
