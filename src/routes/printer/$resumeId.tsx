import { createFileRoute, redirect } from "@tanstack/react-router";
import { createServerFn } from "@tanstack/react-start";
import { zodValidator } from "@tanstack/zod-adapter";
import { useEffect } from "react";
import { z } from "zod";

import { LoadingScreen } from "@/components/layout/loading-screen";
import { ResumePreview } from "@/components/resume/preview";
import { useResumeStore } from "@/components/resume/store/resume";
import { getORPCClient } from "@/integrations/orpc/client";

const searchSchema = z.object({
  token: z.string().catch(""),
});

const printerAccessSchema = z.object({
  resumeId: z.string(),
  token: z.string(),
});

const verifyPrinterAccessServerFn = createServerFn({ method: "POST" })
  .inputValidator(printerAccessSchema)
  .handler(async ({ data }) => {
    const [{ env }, { verifyPrinterToken }] = await Promise.all([
      import("@/utils/env"),
      import("@/utils/printer-token"),
    ]);

    if (env.FLAG_DEBUG_PRINTER) return;

    const tokenResumeId = await verifyPrinterToken(data.token);
    if (tokenResumeId !== data.resumeId) throw new Error("Invalid printer token");
  });

export const Route = createFileRoute("/printer/$resumeId")({
  component: RouteComponent,
  validateSearch: zodValidator(searchSchema),
  beforeLoad: async ({ params, search }) => {
    try {
      await verifyPrinterAccessServerFn({ data: { resumeId: params.resumeId, token: search.token } });
    } catch {
      // Invalid or missing token - throw error to be caught by error handler
      throw redirect({ to: "/", search: {}, throw: true });
    }
  },
  loader: async ({ params }) => {
    const client = getORPCClient();
    const resume = await client.resume.getByIdForPrinter({ id: params.resumeId });

    return { resume };
  },
});

function RouteComponent() {
  const { resume } = Route.useLoaderData();

  const isReady = useResumeStore((state) => state.isReady);
  const initialize = useResumeStore((state) => state.initialize);

  useEffect(() => {
    if (!resume) return;
    initialize(resume);
    return () => initialize(null);
  }, [resume, initialize]);

  if (!isReady) return <LoadingScreen />;

  return <ResumePreview pageClassName="print:w-full!" />;
}
