import { DashboardShell } from "@/components/dashboard-shell";
import { demoVoiceExamples } from "@/lib/dashboard-data";
import { parseTransactionInput } from "@/lib/transaction-parser";

export default function Home() {
  const parsedExamples = demoVoiceExamples.map((input) =>
    parseTransactionInput(input),
  );

  return <DashboardShell parsedExamples={parsedExamples} />;
}
