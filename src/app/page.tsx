import { DashboardShell } from "@/components/dashboard-shell";
import { getDashboardData } from "@/lib/dashboard-data";
import { connection } from "next/server";

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
  await connection();
  const resolvedSearchParams = await searchParams;
  const requestedView = resolvedSearchParams.view;
  const initialView: AllowedView =
    requestedView && allowedViewSet.has(requestedView)
      ? (requestedView as AllowedView)
      : "overview";
  const dashboardData = await getDashboardData();

  return <DashboardShell initialView={initialView} data={dashboardData} />;
}
