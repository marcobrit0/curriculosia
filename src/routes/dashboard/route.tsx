import { createFileRoute, Outlet, redirect } from "@tanstack/react-router";

import { SidebarProvider } from "@/components/ui/sidebar";

import { DashboardPendingIndicator } from "./-components/pending-indicator";
import { DashboardSidebar } from "./-components/sidebar";

export const Route = createFileRoute("/dashboard")({
  component: RouteComponent,
  beforeLoad: async ({ context }) => {
    if (!context.session) throw redirect({ to: "/auth/login", replace: true });
    return { session: context.session };
  },
});

function RouteComponent() {
  return (
    <SidebarProvider defaultOpen>
      <DashboardSidebar />

      <main className="@container relative flex-1 p-4 md:ps-2">
        <DashboardPendingIndicator />
        <Outlet />
      </main>
    </SidebarProvider>
  );
}
