import { AuthPanel } from "@/components/auth-panel";
import { DashboardShell } from "@/components/dashboard-shell";
import { getDashboardData, type DashboardSupabase } from "@/lib/dashboard-data";
import { createSupabaseServerClient } from "@/lib/supabase-server";

const allowedViews = [
  "overview",
  "capture",
  "transactions",
  "budget",
  "assistant",
  "automation",
] as const;

type AllowedView = (typeof allowedViews)[number];
type PageSearchParams = Promise<{
  view?: string;
}>;

const allowedViewSet = new Set<string>(allowedViews);

export default async function Home({
  searchParams,
}: {
  searchParams: PageSearchParams;
}) {
  const supabase = await createSupabaseServerClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  const resolvedSearchParams = await searchParams;
  const requestedView = resolvedSearchParams.view;
  const initialView: AllowedView =
    requestedView && allowedViewSet.has(requestedView)
      ? (requestedView as AllowedView)
      : "overview";

  if (!user) {
    return <AuthPanel />;
  }

  const dashboardData = await getDashboardData(
    supabase as unknown as DashboardSupabase,
    user,
  );

  return <DashboardShell initialView={initialView} data={dashboardData} />;
}
