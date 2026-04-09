import { DashboardShell } from "@/components/dashboard-shell";

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
  const resolvedSearchParams = await searchParams;
  const requestedView = resolvedSearchParams.view;
  const initialView: AllowedView =
    requestedView && allowedViewSet.has(requestedView)
      ? (requestedView as AllowedView)
      : "overview";

  return <DashboardShell initialView={initialView} />;
}
