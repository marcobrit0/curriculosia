import { zodResolver } from "@hookform/resolvers/zod";
import { t } from "@lingui/core/macro";
import { Trans } from "@lingui/react/macro";
import { ArrowRightIcon } from "@phosphor-icons/react";
import { createFileRoute, Link, redirect } from "@tanstack/react-router";
import { useState } from "react";
import { useForm } from "react-hook-form";
import { toast } from "sonner";
import z from "zod";

import { Button } from "@/components/ui/button";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { authClient } from "@/integrations/auth/client";

export const Route = createFileRoute("/auth/forgot-password")({
  component: RouteComponent,
  beforeLoad: async ({ context }) => {
    if (context.flags.disableEmailAuth) throw redirect({ to: "/auth/login", replace: true });
  },
});

const formSchema = z.object({
  email: z.email(),
});

type FormValues = z.infer<typeof formSchema>;

function RouteComponent() {
  const [submitted, setSubmitted] = useState(false);

  const form = useForm<FormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      email: "",
    },
  });

  const onSubmit = async (data: FormValues) => {
    const toastId = toast.loading(t`Enviando e-mail de redefinição de senha...`);

    const { error } = await authClient.requestPasswordReset({
      email: data.email,
      redirectTo: "/auth/reset-password",
    });

    if (error) {
      toast.error(error.message, { id: toastId });
      return;
    }

    setSubmitted(true);
    toast.dismiss(toastId);
  };

  if (submitted) return <PostForgotPasswordScreen />;

  return (
    <>
      <div className="space-y-1 text-center">
        <h1 className="text-2xl font-bold tracking-tight">
          <Trans>Esqueceu sua senha?</Trans>
        </h1>

        <div className="text-muted-foreground">
          <Trans>
            Lembrou sua senha?{" "}
            <Button
              variant="link"
              className="h-auto gap-1.5 px-1! py-0"
              nativeButton={false}
              render={
                <Link to="/auth/login">
                  Entrar agora <ArrowRightIcon />
                </Link>
              }
            />
          </Trans>
        </div>
      </div>

      <Form {...form}>
        <form className="space-y-6" onSubmit={form.handleSubmit(onSubmit)}>
          <FormField
            control={form.control}
            name="email"
            render={({ field }) => (
              <FormItem>
                <FormLabel>
                  <Trans>E-mail</Trans>
                </FormLabel>
                <FormControl
                  render={<Input type="email" autoComplete="email" placeholder="ana.souza@example.com" {...field} />}
                />
                <FormMessage />
              </FormItem>
            )}
          />

          <Button type="submit" className="w-full">
            <Trans>Enviar e-mail de redefinição</Trans>
          </Button>
        </form>
      </Form>
    </>
  );
}

function PostForgotPasswordScreen() {
  return (
    <>
      <div className="space-y-1 text-center">
        <h1 className="text-2xl font-bold tracking-tight">
          <Trans>Enviamos um e-mail para você</Trans>
        </h1>
        <p className="text-muted-foreground">
          <Trans>Confira sua caixa de entrada para redefinir sua senha.</Trans>
        </p>
      </div>

      <Button
        nativeButton={false}
        render={
          <a href="mailto:">
            <Trans>Abrir aplicativo de e-mail</Trans>
          </a>
        }
      />
    </>
  );
}
