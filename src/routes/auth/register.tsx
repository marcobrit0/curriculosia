import { zodResolver } from "@hookform/resolvers/zod";
import { t } from "@lingui/core/macro";
import { Trans } from "@lingui/react/macro";
import { ArrowRightIcon, EyeIcon, EyeSlashIcon } from "@phosphor-icons/react";
import { createFileRoute, Link, redirect, useRouter } from "@tanstack/react-router";
import { useState } from "react";
import { useForm } from "react-hook-form";
import { toast } from "sonner";
import { useToggle } from "usehooks-ts";
import z from "zod";

import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Button } from "@/components/ui/button";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { authClient } from "@/integrations/auth/client";
import { clearSessionCache } from "@/integrations/auth/functions";
import { capturePostHogEvent, posthogEvents } from "@/integrations/posthog/client";

import { SocialAuth } from "./-components/social-auth";

export const Route = createFileRoute("/auth/register")({
  component: RouteComponent,
  beforeLoad: async ({ context }) => {
    if (context.session) throw redirect({ to: "/dashboard", replace: true });
    if (context.flags.disableSignups) throw redirect({ to: "/auth/login", replace: true });
    return { session: null };
  },
});

const formSchema = z.object({
  name: z.string().min(3).max(64),
  username: z
    .string()
    .min(3)
    .max(64)
    .trim()
    .toLowerCase()
    .regex(/^[a-z0-9._-]+$/, {
      message: "O nome de usuário só pode conter letras minúsculas, números, pontos, hífens e underscores.",
    }),
  email: z.email().toLowerCase(),
  password: z.string().min(6).max(64),
  acceptTerms: z.literal(true, {
    error: "Você precisa aceitar os Termos de Uso e a Política de Privacidade para criar uma conta.",
  }),
});

type FormValues = z.infer<typeof formSchema>;

function RouteComponent() {
  const router = useRouter();
  const [submitted, setSubmitted] = useState(false);
  const [showPassword, toggleShowPassword] = useToggle(false);
  const { flags } = Route.useRouteContext();

  const form = useForm<FormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      name: "",
      username: "",
      email: "",
      password: "",
      acceptTerms: false as unknown as true,
    },
  });

  const onSubmit = async (data: FormValues) => {
    const toastId = toast.loading(t`Criando sua conta...`);

    const { error } = await authClient.signUp.email({
      name: data.name,
      email: data.email,
      password: data.password,
      username: data.username,
      displayUsername: data.username,
      callbackURL: "/dashboard",
    });

    if (error) {
      toast.error(error.message, { id: toastId });
      return;
    }

    capturePostHogEvent(posthogEvents.authSignUpCompleted, {
      email_domain: data.email.split("@")[1]?.toLowerCase(),
      method: "email",
    });

    // Refresh route context so the post-signup navigation sees the new session.
    clearSessionCache();
    await router.invalidate();
    setSubmitted(true);
    toast.dismiss(toastId);
  };

  if (submitted) return <PostSignupScreen />;

  return (
    <>
      <div className="space-y-1 text-center">
        <h1 className="text-2xl font-bold tracking-tight">
          <Trans>Criar uma nova conta</Trans>
        </h1>

        <div className="text-muted-foreground">
          <Trans>
            Já tem uma conta?{" "}
            <Button
              variant="link"
              nativeButton={false}
              className="h-auto gap-1.5 px-1! py-0"
              render={
                <Link to="/auth/login">
                  Entrar agora <ArrowRightIcon />
                </Link>
              }
            />
          </Trans>
        </div>
      </div>

      {!flags.disableEmailAuth && (
        <Form {...form}>
          <form className="space-y-6" onSubmit={form.handleSubmit(onSubmit)}>
            <FormField
              control={form.control}
              name="name"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>
                    <Trans>Nome</Trans>
                  </FormLabel>
                  <FormControl
                    render={
                      <Input min={3} max={64} autoComplete="section-register name" placeholder="Ana Souza" {...field} />
                    }
                  />
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="username"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>
                    <Trans>Nome de usuário</Trans>
                  </FormLabel>
                  <FormControl
                    render={
                      <Input
                        min={3}
                        max={64}
                        autoComplete="section-register username"
                        placeholder="john.doe"
                        className="lowercase"
                        {...field}
                      />
                    }
                  />
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="email"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>
                    <Trans>E-mail</Trans>
                  </FormLabel>
                  <FormControl
                    render={
                      <Input
                        type="email"
                        autoComplete="section-register email"
                        placeholder="ana.souza@example.com"
                        className="lowercase"
                        {...field}
                      />
                    }
                  />
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="password"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>
                    <Trans>Senha</Trans>
                  </FormLabel>
                  <div className="flex items-center gap-x-1.5">
                    <FormControl
                      render={
                        <Input
                          min={6}
                          max={64}
                          type={showPassword ? "text" : "password"}
                          autoComplete="section-register new-password"
                          {...field}
                        />
                      }
                    />

                    <Button size="icon" variant="ghost" onClick={toggleShowPassword}>
                      {showPassword ? <EyeIcon /> : <EyeSlashIcon />}
                    </Button>
                  </div>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="acceptTerms"
              render={({ field }) => (
                <FormItem className="flex items-start gap-2 space-y-0">
                  <FormControl
                    render={
                      <input
                        type="checkbox"
                        checked={field.value === true}
                        onChange={(e) => field.onChange(e.target.checked)}
                        onBlur={field.onBlur}
                        ref={field.ref}
                        name={field.name}
                        className="mt-1 size-4 cursor-pointer rounded border-border accent-primary"
                      />
                    }
                  />
                  <div className="space-y-1">
                    <FormLabel className="cursor-pointer text-sm leading-relaxed font-normal">
                      <Trans>
                        Eu li e concordo com os{" "}
                        <Link to="/terms" target="_blank" className="font-medium underline underline-offset-2">
                          Termos de Uso
                        </Link>{" "}
                        e a{" "}
                        <Link to="/privacy" target="_blank" className="font-medium underline underline-offset-2">
                          Política de Privacidade
                        </Link>
                        .
                      </Trans>
                    </FormLabel>
                    <FormMessage />
                  </div>
                </FormItem>
              )}
            />

            <Button type="submit" className="w-full">
              <Trans>Criar conta</Trans>
            </Button>
          </form>
        </Form>
      )}

      <SocialAuth />

      <p className="text-center text-xs leading-relaxed text-muted-foreground">
        <Trans>
          Ao continuar com qualquer método de cadastro, você concorda com os{" "}
          <Link to="/terms" target="_blank" className="font-medium underline underline-offset-2">
            Termos de Uso
          </Link>{" "}
          e a{" "}
          <Link to="/privacy" target="_blank" className="font-medium underline underline-offset-2">
            Política de Privacidade
          </Link>
          .
        </Trans>
      </p>
    </>
  );
}

function PostSignupScreen() {
  return (
    <>
      <div className="space-y-1 text-center">
        <h1 className="text-2xl font-bold tracking-tight">
          <Trans>Enviamos um e-mail para você</Trans>
        </h1>
        <p className="text-muted-foreground">
          <Trans>Confira sua caixa de entrada para verificar sua conta.</Trans>
        </p>
      </div>

      <Alert>
        <AlertTitle>
          <Trans>Esta etapa é opcional, mas recomendada.</Trans>
        </AlertTitle>
        <AlertDescription>
          <Trans>Verificar o e-mail é necessário para redefinir sua senha depois.</Trans>
        </AlertDescription>
      </Alert>

      <Button
        nativeButton={false}
        render={
          <Link to="/dashboard/resumes" search={{ sort: "lastUpdatedAt", tags: [] }}>
            <Trans>Continuar</Trans> <ArrowRightIcon />
          </Link>
        }
      />
    </>
  );
}
