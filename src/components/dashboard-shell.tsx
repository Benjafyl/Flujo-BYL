"use client";

import type { LucideIcon } from "lucide-react";
import { Activity, startTransition, useEffect, useState } from "react";
import {
  ArrowDownLeft,
  ArrowUpRight,
  AudioLines,
  BrainCircuit,
  ChartColumnIncreasing,
  Landmark,
  LayoutDashboard,
  Link2,
  ListFilter,
  PiggyBank,
  Sparkles,
  WalletCards,
} from "lucide-react";
import { usePathname, useRouter } from "next/navigation";

import { AutomationPlaybook } from "@/components/automation-playbook";
import { BudgetBoard } from "@/components/budget-board";
import { CaptureStudio } from "@/components/capture-studio";
import { FinanceCopilot } from "@/components/finance-copilot";
import { TransactionsDesk } from "@/components/transactions-desk";
import {
  formatCurrencyCLP,
  formatSignedCurrencyCLP,
} from "@/lib/currency";
import type { DashboardData } from "@/lib/finance-types";
import { getCategoryAppearance } from "@/lib/merchant-rules";

type WorkspaceView =
  | "overview"
  | "capture"
  | "transactions"
  | "budget"
  | "assistant"
  | "automation";

const workspaceViews: Array<{
  id: WorkspaceView;
  label: string;
  shortLabel: string;
  title: string;
  description: string;
  icon: LucideIcon;
}> = [
  {
    id: "overview",
    label: "Resumen",
    shortLabel: "Resumen",
    title: "Vista general",
    description: "Tus totales reales, cuentas y foco del mes.",
    icon: LayoutDashboard,
  },
  {
    id: "capture",
    label: "Captura",
    shortLabel: "Captura",
    title: "Nuevo movimiento",
    description: "Texto o voz con guardado inmediato.",
    icon: AudioLines,
  },
  {
    id: "transactions",
    label: "Movimientos",
    shortLabel: "Movs",
    title: "Movimientos",
    description: "Filtra y recorre todo lo que ya registraste.",
    icon: ListFilter,
  },
  {
    id: "budget",
    label: "Presupuestos",
    shortLabel: "Limites",
    title: "Presupuestos",
    description: "Restante por categoria y control del mes.",
    icon: PiggyBank,
  },
  {
    id: "assistant",
    label: "Analista",
    shortLabel: "Analista",
    title: "Analista",
    description: "Preguntas puntuales sobre tus numeros reales.",
    icon: BrainCircuit,
  },
  {
    id: "automation",
    label: "Automatizar",
    shortLabel: "Atajos",
    title: "Automatizaciones",
    description: "Shortcut, voz y el siguiente paso para registro automatico.",
    icon: Link2,
  },
];

export function DashboardShell({
  initialView,
  data,
}: {
  initialView: WorkspaceView;
  data: DashboardData;
}) {
  const pathname = usePathname();
  const router = useRouter();
  const [activeView, setActiveView] = useState<WorkspaceView>(initialView);
  const activeMeta =
    workspaceViews.find((view) => view.id === activeView) ?? workspaceViews[0];

  useEffect(() => {
    setActiveView(initialView);
  }, [initialView]);

  function openView(nextView: WorkspaceView) {
    setActiveView(nextView);

    startTransition(() => {
      const params = new URLSearchParams(window.location.search);

      if (nextView === "overview") {
        params.delete("view");
      } else {
        params.set("view", nextView);
      }

      const query = params.toString();
      router.replace(query ? `${pathname}?${query}` : pathname, {
        scroll: false,
      });
    });
  }

  return (
    <>
      <a href="#workspace-main" className="skip-link">
        Saltar al contenido
      </a>

      <main className="px-3 py-3 sm:px-5 lg:px-6 lg:py-5">
        <div className="mx-auto max-w-[1500px] lg:grid lg:grid-cols-[280px_minmax(0,1fr)] lg:gap-5">
          <aside className="sidebar-shell hidden lg:flex lg:min-h-[calc(100vh-2.5rem)] lg:flex-col lg:justify-between lg:rounded-[30px] lg:p-5">
            <div className="space-y-5">
              <div className="space-y-3">
                <div className="inline-flex items-center gap-2 rounded-full border border-white/10 bg-white/6 px-3 py-1 text-[11px] font-semibold uppercase tracking-[0.24em] text-slate-300">
                  <Sparkles className="h-3.5 w-3.5 text-sky-300" />
                  FLUJO BYL
                </div>
                <div>
                  <h1 className="text-2xl font-semibold tracking-tight text-white">
                    {data.userName}, tu dinero en orden.
                  </h1>
                  <p className="mt-2 text-sm leading-6 text-slate-300">
                    {data.monthLabel}. Sin datos ficticios ni pantallas rellenas.
                  </p>
                </div>
              </div>

              <nav className="space-y-2" aria-label="Secciones">
                {workspaceViews.map((view) => (
                  <SidebarLink
                    key={view.id}
                    active={view.id === activeView}
                    icon={view.icon}
                    label={view.label}
                    description={view.description}
                    onClick={() => openView(view.id)}
                  />
                ))}
              </nav>
            </div>

            <div className="space-y-3">
              <SidebarMetric
                label="Balance"
                value={formatCurrencyCLP(data.monthlySnapshot.balance)}
              />
              <SidebarMetric
                label="Gasto"
                value={formatCurrencyCLP(data.monthlySnapshot.expenses)}
              />
              <SidebarMetric
                label="Movimientos"
                value={`${data.monthlySnapshot.transactionCount}`}
              />
              <SidebarMetric label="Modo" value="Personal" />
            </div>
          </aside>

          <div className="space-y-4">
            <section className="glass-panel rounded-[28px] p-4 lg:hidden">
              <div className="flex items-center justify-between gap-3">
                <div>
                  <p className="text-xs font-semibold uppercase tracking-[0.22em] text-[color:var(--muted)]">
                    FLUJO BYL
                  </p>
                  <h1 className="mt-2 text-2xl font-semibold tracking-tight text-[color:var(--ink)]">
                    {data.userName}
                  </h1>
                </div>
                <div className="rounded-[20px] bg-[color:var(--surface-muted)] px-3 py-2 text-right">
                  <p className="text-[11px] uppercase tracking-[0.18em] text-[color:var(--muted)]">
                    Balance
                  </p>
                  <p className="mt-1 text-sm font-semibold text-[color:var(--ink)]">
                    {formatCurrencyCLP(data.monthlySnapshot.balance)}
                  </p>
                </div>
              </div>

              <div className="scroll-row mt-4 flex gap-2 overflow-x-auto pb-1">
                {workspaceViews.map((view) => (
                  <MobileNavButton
                    key={view.id}
                    active={view.id === activeView}
                    label={view.shortLabel}
                    icon={view.icon}
                    onClick={() => openView(view.id)}
                  />
                ))}
              </div>
            </section>

            <section className="glass-panel rounded-[30px] p-4 sm:p-5">
              <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
                <div>
                  <p className="text-xs font-semibold uppercase tracking-[0.22em] text-[color:var(--muted)]">
                    {activeMeta.label}
                  </p>
                  <h2 className="section-title mt-2 text-3xl font-semibold text-[color:var(--ink)]">
                    {activeMeta.title}
                  </h2>
                  <p className="mt-2 text-sm text-[color:var(--muted)]">
                    {activeMeta.description}
                  </p>
                </div>

                <div className="grid gap-3 sm:grid-cols-3">
                  <MiniStatCard
                    icon={ArrowUpRight}
                    label="Ingresos"
                    value={formatCurrencyCLP(data.monthlySnapshot.income)}
                    tone="text-emerald-600 bg-emerald-50"
                  />
                  <MiniStatCard
                    icon={ArrowDownLeft}
                    label="Egresos"
                    value={formatCurrencyCLP(data.monthlySnapshot.expenses)}
                    tone="text-orange-600 bg-orange-50"
                  />
                  <MiniStatCard
                    icon={Landmark}
                    label="Cuentas"
                    value={`${data.accountSnapshots.length}`}
                    tone="text-sky-700 bg-sky-50"
                  />
                </div>
              </div>
            </section>

            <div id="workspace-main" className="space-y-4">
              <Activity mode={activeView === "overview" ? "visible" : "hidden"}>
                <OverviewPanel data={data} openView={openView} />
              </Activity>

              <Activity mode={activeView === "capture" ? "visible" : "hidden"}>
                <CaptureStudio
                  captureExamples={data.captureExamples}
                  defaultAccountLabel={data.defaultAccountLabel}
                />
              </Activity>

              <Activity mode={activeView === "transactions" ? "visible" : "hidden"}>
                <TransactionsDesk transactions={data.recentTransactions} />
              </Activity>

              <Activity mode={activeView === "budget" ? "visible" : "hidden"}>
                <BudgetBoard
                  budgetCategories={data.budgetCategories}
                  monthlySnapshot={data.monthlySnapshot}
                  setupFocus={data.setupFocus}
                />
              </Activity>

              <Activity mode={activeView === "assistant" ? "visible" : "hidden"}>
                <FinanceCopilot prompts={data.askFinancePrompts} />
              </Activity>

              <Activity mode={activeView === "automation" ? "visible" : "hidden"}>
                <AutomationPlaybook automationMethods={data.automationMethods} />
              </Activity>
            </div>
          </div>
        </div>
      </main>
    </>
  );
}

function OverviewPanel({
  data,
  openView,
}: {
  data: DashboardData;
  openView: (view: WorkspaceView) => void;
}) {
  const strongestCategory = data.categoryInsights[0] ?? null;
  const defaultAccount =
    data.accountSnapshots.find((account) => account.isDefault) ?? data.accountSnapshots[0];

  return (
    <section className="grid gap-4">
      <div className="grid gap-4 xl:grid-cols-[1.15fr_0.85fr]">
        <article className="glass-panel overflow-hidden rounded-[30px] p-5 sm:p-6">
          <div className="flex flex-col gap-5 lg:flex-row lg:items-start lg:justify-between">
            <div>
              <p className="text-xs font-semibold uppercase tracking-[0.22em] text-[color:var(--muted)]">
                {data.monthLabel}
              </p>
              <h3 className="section-title mt-2 text-4xl font-semibold tracking-tight text-[color:var(--ink)]">
                {formatCurrencyCLP(data.monthlySnapshot.balance)}
              </h3>
              <p className="mt-2 text-sm text-[color:var(--muted)]">
                Balance neto del mes con {data.monthlySnapshot.transactionCount} movimientos
                registrados.
              </p>
            </div>

            <div className="flex flex-wrap gap-2">
              <QuickActionButton
                icon={AudioLines}
                label="Registrar"
                onClick={() => openView("capture")}
              />
              <QuickActionButton
                icon={PiggyBank}
                label="Presupuestos"
                onClick={() => openView("budget")}
              />
              <QuickActionButton
                icon={BrainCircuit}
                label="Preguntar"
                onClick={() => openView("assistant")}
              />
            </div>
          </div>

          <div className="mt-6 grid gap-3 md:grid-cols-3">
            <SummaryCard
              label="Ingresos"
              value={formatCurrencyCLP(data.monthlySnapshot.income)}
              icon={ArrowUpRight}
              tone="bg-emerald-100 text-emerald-700"
              footer={data.monthLabel}
            />
            <SummaryCard
              label="Egresos"
              value={formatCurrencyCLP(data.monthlySnapshot.expenses)}
              icon={ArrowDownLeft}
              tone="bg-orange-100 text-orange-700"
              footer={data.monthLabel}
            />
            <SummaryCard
              label="Cuenta principal"
              value={defaultAccount ? defaultAccount.name : "Sin cuenta"}
              icon={WalletCards}
              tone="bg-sky-100 text-sky-700"
              footer={
                defaultAccount
                  ? renderAccountNote(defaultAccount)
                  : "Tu primera cuenta aparecera aqui"
              }
            />
          </div>
        </article>

        <article className="glass-panel rounded-[30px] p-5 sm:p-6">
          <div className="flex items-center justify-between gap-3">
            <div>
              <p className="text-xs font-semibold uppercase tracking-[0.22em] text-[color:var(--muted)]">
                Radar rapido
              </p>
              <h3 className="mt-2 text-xl font-semibold text-[color:var(--ink)]">
                Lo importante hoy
              </h3>
            </div>
            <span className="rounded-full bg-[color:var(--accent-soft)] p-2 text-[color:var(--accent-strong)]">
              <Sparkles className="h-4 w-4" />
            </span>
          </div>

          <div className="mt-5 grid gap-3">
            <SignalCard
              title="Promedio diario"
              value={formatCurrencyCLP(data.monthlySnapshot.dailyExpenseAverage)}
            />
            <SignalCard
              title="Presupuestos activos"
              value={`${data.budgetCategories.length}`}
            />
            <SignalCard
              title="Categoria principal"
              value={strongestCategory?.label ?? "Sin datos aun"}
            />
          </div>
        </article>
      </div>

      <div className="grid gap-4 xl:grid-cols-[1.05fr_0.95fr]">
        <article className="glass-panel rounded-[30px] p-5 sm:p-6">
          <div className="flex items-center justify-between gap-3">
            <div>
              <p className="text-xs font-semibold uppercase tracking-[0.22em] text-[color:var(--muted)]">
                Flujo semanal
              </p>
              <h3 className="mt-2 text-xl font-semibold text-[color:var(--ink)]">
                Entradas y salidas
              </h3>
            </div>
            <span className="rounded-full bg-[color:var(--surface-muted)] p-2 text-[color:var(--accent-strong)]">
              <ChartColumnIncreasing className="h-4 w-4" />
            </span>
          </div>

          {data.hasTransactions ? (
            <>
              <div className="mt-5 grid gap-3 sm:grid-cols-4">
                {data.weeklyFlow.map((week) => {
                  const highestBar = Math.max(week.income, week.expense, 1);

                  return (
                    <div
                      key={week.label}
                      className="rounded-[22px] border border-[color:var(--line)] bg-[color:var(--surface-strong)] p-3"
                    >
                      <div className="grid h-32 grid-cols-2 items-end gap-2">
                        <div className="flex h-full items-end">
                          <div
                            className="w-full rounded-t-2xl bg-emerald-500/85"
                            style={{
                              height: `${Math.max((week.income / highestBar) * 100, 8)}%`,
                            }}
                          />
                        </div>
                        <div className="flex h-full items-end">
                          <div
                            className="w-full rounded-t-2xl bg-orange-400/90"
                            style={{
                              height: `${Math.max((week.expense / highestBar) * 100, 8)}%`,
                            }}
                          />
                        </div>
                      </div>
                      <div className="mt-3 space-y-1">
                        <p className="text-sm font-semibold text-[color:var(--ink)]">
                          {week.label}
                        </p>
                        <p className="text-xs text-[color:var(--muted)]">
                          + {formatCurrencyCLP(week.income)}
                        </p>
                        <p className="text-xs text-[color:var(--muted)]">
                          - {formatCurrencyCLP(week.expense)}
                        </p>
                      </div>
                    </div>
                  );
                })}
              </div>

              <div className="mt-5 grid gap-3">
                {data.categoryInsights.map((category) => (
                  <div
                    key={category.slug}
                    className="rounded-[22px] border border-[color:var(--line)] bg-white/78 p-4"
                  >
                    <div className="flex items-center justify-between gap-3">
                      <div>
                        <p className="font-semibold text-[color:var(--ink)]">
                          {category.label}
                        </p>
                        <p className="mt-1 text-xs text-[color:var(--muted)]">
                          {Math.round(category.share * 100)}% del gasto total
                        </p>
                      </div>
                      <div className="text-right">
                        <p className="font-semibold text-[color:var(--ink)]">
                          {formatCurrencyCLP(category.amount)}
                        </p>
                        <p className="mt-1 text-xs text-[color:var(--muted)]">
                          {category.budgetFill !== null
                            ? `${Math.round(category.budgetFill * 100)}% del limite`
                            : "Sin limite activo"}
                        </p>
                      </div>
                    </div>

                    <div className="metric-track mt-3 h-2 overflow-hidden rounded-full">
                      <div
                        className="metric-fill h-full rounded-full"
                        style={{ width: `${Math.round(category.share * 100)}%` }}
                      />
                    </div>
                  </div>
                ))}
              </div>
            </>
          ) : (
            <EmptyPanel
              title="Todavia no hay movimientos"
              detail="Usa Captura para registrar tu primer gasto o ingreso. Desde ahi el dashboard empezara a llenarse solo."
              actionLabel="Ir a captura"
              onClick={() => openView("capture")}
            />
          )}
        </article>

        <div className="grid gap-4">
          <article className="glass-panel rounded-[30px] p-5 sm:p-6">
            <div className="flex items-center justify-between gap-3">
              <div>
                <p className="text-xs font-semibold uppercase tracking-[0.22em] text-[color:var(--muted)]">
                  Reciente
                </p>
                <h3 className="mt-2 text-xl font-semibold text-[color:var(--ink)]">
                  Ultimos movimientos
                </h3>
              </div>
              <button
                type="button"
                onClick={() => openView("transactions")}
                className="rounded-full border border-[color:var(--line)] bg-white px-3 py-2 text-xs font-semibold text-[color:var(--ink)] transition hover:border-[color:var(--line-strong)]"
              >
                Ver todos
              </button>
            </div>

            {data.recentTransactions.length > 0 ? (
              <div className="mt-5 space-y-3">
                {data.recentTransactions.slice(0, 4).map((transaction) => {
                  const meta = getCategoryAppearance(
                    transaction.categorySlug,
                    transaction.categoryLabel,
                  );

                  return (
                    <div
                      key={transaction.id}
                      className="rounded-[22px] border border-[color:var(--line)] bg-white/78 px-4 py-3"
                    >
                      <div className="flex items-start justify-between gap-4">
                        <div>
                          <span
                            className="rounded-full px-2 py-1 text-[11px] font-semibold uppercase tracking-[0.14em]"
                            style={{ background: meta.soft, color: meta.ink }}
                          >
                            {meta.label}
                          </span>
                          <p className="mt-3 text-sm font-semibold text-[color:var(--ink)]">
                            {transaction.title}
                          </p>
                          <p className="mt-1 text-xs text-[color:var(--muted)]">
                            {transaction.account} - {transaction.occurredAt}
                          </p>
                        </div>

                        <p
                          className={`text-sm font-semibold ${
                            transaction.type === "income"
                              ? "text-emerald-700"
                              : "text-[color:var(--ink)]"
                          }`}
                        >
                          {transaction.type === "income" ? "+" : "-"}
                          {formatCurrencyCLP(transaction.amount)}
                        </p>
                      </div>
                    </div>
                  );
                })}
              </div>
            ) : (
              <div className="mt-5 rounded-[24px] border border-dashed border-[color:var(--line-strong)] bg-[color:var(--surface-strong)] px-4 py-8 text-sm leading-6 text-[color:var(--muted)]">
                Aun no hay movimientos guardados.
              </div>
            )}
          </article>
          <article className="glass-panel rounded-[30px] p-5 sm:p-6">
            <div className="flex items-center justify-between gap-3">
              <div>
                <p className="text-xs font-semibold uppercase tracking-[0.22em] text-[color:var(--muted)]">
                  Cuentas
                </p>
                <h3 className="mt-2 text-xl font-semibold text-[color:var(--ink)]">
                  Posicion actual
                </h3>
              </div>
              <span className="rounded-full bg-[color:var(--surface-muted)] p-2 text-[color:var(--accent-strong)]">
                <Landmark className="h-4 w-4" />
              </span>
            </div>

            <div className="mt-5 grid gap-3">
              {data.accountSnapshots.map((account) => (
                <div
                  key={account.id}
                  className="rounded-[22px] border border-[color:var(--line)] bg-[color:var(--surface-strong)] px-4 py-3"
                >
                  <div className="flex items-center justify-between gap-4">
                    <div>
                      <p className="text-sm font-semibold text-[color:var(--ink)]">
                        {account.name}
                      </p>
                      <p className="mt-1 text-xs text-[color:var(--muted)]">
                        {renderAccountNote(account)}
                      </p>
                    </div>
                    <div className="text-right">
                      <p
                        className={`text-sm font-semibold ${
                          account.balance < 0 ? "text-rose-700" : "text-[color:var(--ink)]"
                        }`}
                      >
                        {formatSignedCurrencyCLP(account.balance)}
                      </p>
                      {account.creditLimit > 0 ? (
                        <p className="mt-1 text-xs text-[color:var(--muted)]">
                          Cupo {formatCurrencyCLP(account.creditLimit)}
                        </p>
                      ) : null}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </article>

          {!data.hasTransactions ? (
            <article className="glass-panel rounded-[30px] p-5 sm:p-6">
              <p className="text-xs font-semibold uppercase tracking-[0.22em] text-[color:var(--muted)]">
                Base personal
              </p>
              <div className="mt-4 grid gap-3">
                {data.setupFocus.map((item) => (
                  <div
                    key={item.title}
                    className="rounded-[22px] border border-[color:var(--line)] bg-white/78 px-4 py-4"
                  >
                    <p className="text-sm font-semibold text-[color:var(--ink)]">
                      {item.title}
                    </p>
                    <p className="mt-2 text-sm leading-6 text-[color:var(--muted)]">
                      {item.detail}
                    </p>
                  </div>
                ))}
              </div>
            </article>
          ) : null}
        </div>
      </div>
    </section>
  );
}

function SidebarLink({
  active,
  icon: Icon,
  label,
  description,
  onClick,
}: {
  active: boolean;
  icon: LucideIcon;
  label: string;
  description: string;
  onClick: () => void;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      aria-current={active ? "page" : undefined}
      className={`flex w-full items-start gap-3 rounded-[20px] px-4 py-3 text-left transition ${
        active
          ? "bg-white text-slate-950 shadow-sm"
          : "bg-white/5 text-slate-200 hover:bg-white/8"
      }`}
    >
      <span
        className={`mt-0.5 rounded-full p-2 ${
          active ? "bg-slate-100 text-[color:var(--accent-strong)]" : "bg-white/10"
        }`}
      >
        <Icon className="h-4 w-4" />
      </span>
      <span className="min-w-0">
        <span className="block text-sm font-semibold">{label}</span>
        <span
          className={`mt-1 block text-xs leading-5 ${
            active ? "text-slate-500" : "text-slate-400"
          }`}
        >
          {description}
        </span>
      </span>
    </button>
  );
}

function SidebarMetric({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-[20px] border border-white/10 bg-white/6 px-4 py-3">
      <p className="text-[11px] font-semibold uppercase tracking-[0.18em] text-slate-400">
        {label}
      </p>
      <p className="mt-2 text-sm font-semibold text-white">{value}</p>
    </div>
  );
}

function MobileNavButton({
  active,
  icon: Icon,
  label,
  onClick,
}: {
  active: boolean;
  icon: LucideIcon;
  label: string;
  onClick: () => void;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={`inline-flex min-h-[44px] items-center gap-2 rounded-full px-4 py-2 text-sm font-semibold transition ${
        active
          ? "bg-[color:var(--accent-strong)] text-white"
          : "border border-[color:var(--line)] bg-white text-[color:var(--muted)]"
      }`}
    >
      <Icon className="h-4 w-4" />
      {label}
    </button>
  );
}

function SummaryCard({
  label,
  value,
  footer,
  icon: Icon,
  tone,
}: {
  label: string;
  value: string;
  footer: string;
  icon: LucideIcon;
  tone: string;
}) {
  return (
    <article className="rounded-[24px] border border-[color:var(--line)] bg-white/82 p-4">
      <div className="flex items-center justify-between gap-3">
        <p className="text-sm text-[color:var(--muted)]">{label}</p>
        <span className={`rounded-full p-2 ${tone}`}>
          <Icon className="h-4 w-4" />
        </span>
      </div>
      <p className="mt-4 text-2xl font-semibold tracking-tight text-[color:var(--ink)]">
        {value}
      </p>
      <p className="mt-2 text-xs text-[color:var(--muted)]">{footer}</p>
    </article>
  );
}

function MiniStatCard({
  icon: Icon,
  label,
  tone,
  value,
}: {
  icon: LucideIcon;
  label: string;
  tone: string;
  value: string;
}) {
  return (
    <div className="rounded-[20px] border border-[color:var(--line)] bg-[color:var(--surface-strong)] px-4 py-3">
      <div className="flex items-center gap-2">
        <span className={`rounded-full p-2 ${tone}`}>
          <Icon className="h-3.5 w-3.5" />
        </span>
        <p className="text-xs font-semibold uppercase tracking-[0.16em] text-[color:var(--muted)]">
          {label}
        </p>
      </div>
      <p className="mt-3 text-sm font-semibold text-[color:var(--ink)]">{value}</p>
    </div>
  );
}

function QuickActionButton({
  icon: Icon,
  label,
  onClick,
}: {
  icon: LucideIcon;
  label: string;
  onClick: () => void;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      className="inline-flex min-h-[44px] items-center gap-2 rounded-full border border-[color:var(--line)] bg-white px-4 py-2 text-sm font-semibold text-[color:var(--ink)] transition hover:border-[color:var(--line-strong)] hover:bg-[color:var(--surface-muted)]"
    >
      <Icon className="h-4 w-4 text-[color:var(--accent-strong)]" />
      {label}
    </button>
  );
}

function SignalCard({ title, value }: { title: string; value: string }) {
  return (
    <div className="rounded-[22px] border border-[color:var(--line)] bg-[color:var(--surface-strong)] px-4 py-4">
      <p className="text-xs font-semibold uppercase tracking-[0.16em] text-[color:var(--muted)]">
        {title}
      </p>
      <p className="mt-2 text-lg font-semibold text-[color:var(--ink)]">{value}</p>
    </div>
  );
}

function EmptyPanel({
  title,
  detail,
  actionLabel,
  onClick,
}: {
  title: string;
  detail: string;
  actionLabel: string;
  onClick: () => void;
}) {
  return (
    <div className="mt-5 rounded-[24px] border border-dashed border-[color:var(--line-strong)] bg-[color:var(--surface-strong)] px-5 py-8">
      <p className="text-lg font-semibold text-[color:var(--ink)]">{title}</p>
      <p className="mt-3 max-w-xl text-sm leading-6 text-[color:var(--muted)]">
        {detail}
      </p>
      <button
        type="button"
        onClick={onClick}
        className="mt-5 inline-flex min-h-[44px] items-center rounded-full bg-[color:var(--accent-strong)] px-4 py-2 text-sm font-semibold text-white transition hover:bg-[color:var(--accent)]"
      >
        {actionLabel}
      </button>
    </div>
  );
}

function renderAccountNote(account: DashboardData["accountSnapshots"][number]) {
  if (account.creditLimit > 0) {
    return `${account.note}. Balance actual ${formatSignedCurrencyCLP(account.balance)}`;
  }

  return account.note;
}
