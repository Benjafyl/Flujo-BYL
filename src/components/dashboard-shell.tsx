import {
  ArrowDownLeft,
  ArrowUpRight,
  AudioLines,
  ChartColumnIncreasing,
  Clock3,
  Landmark,
  PiggyBank,
  Sparkles,
  WalletCards,
} from "lucide-react";

import { AutomationPlaybook } from "@/components/automation-playbook";
import { BudgetBoard } from "@/components/budget-board";
import { CaptureStudio } from "@/components/capture-studio";
import { FinanceCopilot } from "@/components/finance-copilot";
import {
  accountSnapshots,
  categoryInsights,
  formatCurrencyCLP,
  formatSignedCurrencyCLP,
  monthlySnapshot,
  recentTransactions,
  weeklyFlow,
} from "@/lib/dashboard-data";
import { categoryMeta } from "@/lib/merchant-rules";

export function DashboardShell() {
  const summaryCards = [
    {
      label: "Ingresos del mes",
      value: monthlySnapshot.income,
      delta: monthlySnapshot.incomeDelta,
      icon: ArrowUpRight,
      tone: "bg-emerald-100 text-emerald-700",
    },
    {
      label: "Egresos del mes",
      value: monthlySnapshot.expenses,
      delta: monthlySnapshot.expenseDelta,
      icon: ArrowDownLeft,
      tone: "bg-orange-100 text-orange-700",
    },
    {
      label: "Balance neto",
      value: monthlySnapshot.balance,
      delta: monthlySnapshot.balanceDelta,
      icon: PiggyBank,
      tone: "bg-teal-100 text-teal-800",
    },
  ];

  return (
    <main className="px-4 py-5 sm:px-6 lg:px-10 lg:py-8">
      <div className="mx-auto flex max-w-7xl flex-col gap-6">
        <section className="glass-panel noise-overlay relative overflow-hidden rounded-[36px] p-5 sm:p-7">
          <div className="absolute inset-x-0 top-0 h-36 bg-gradient-to-r from-teal-700/18 via-transparent to-orange-500/15" />
          <div className="absolute -right-12 top-8 h-40 w-40 rounded-full bg-teal-600/12 blur-3xl" />
          <div className="absolute bottom-0 left-0 h-32 w-32 rounded-full bg-orange-500/12 blur-3xl" />

          <div className="relative grid gap-6 xl:grid-cols-[1.15fr_0.85fr]">
            <div className="space-y-6">
              <div className="max-w-3xl space-y-4">
                <div className="inline-flex items-center gap-2 rounded-full border border-[color:var(--line)] bg-white/70 px-3 py-1 text-[11px] font-semibold uppercase tracking-[0.24em] text-[color:var(--muted)]">
                  <Sparkles className="h-3.5 w-3.5 text-[color:var(--accent)]" />
                  Flujo simple, lectura rapida
                </div>
                <div className="space-y-3">
                  <h1 className="section-title text-4xl font-semibold tracking-tight text-[color:var(--ink)] sm:text-5xl">
                    Registra el gasto antes de olvidarlo y entiende el mes sin ruido.
                  </h1>
                  <p className="max-w-2xl text-sm leading-6 text-[color:var(--muted)] sm:text-base">
                    FLUJO BYL ya esta orientado al uso que de verdad importa: captura por
                    voz o texto, presupuestos por categoria, automatizacion tipo Shortcut
                    y respuestas cortas sobre tus numeros.
                  </p>
                </div>
              </div>

              <div className="grid gap-3 md:grid-cols-3">
                {summaryCards.map((card) => {
                  const Icon = card.icon;

                  return (
                    <article
                      key={card.label}
                      className="rounded-[26px] border border-[color:var(--line)] bg-white/80 p-4 shadow-sm"
                    >
                      <div className="flex items-center justify-between">
                        <p className="text-sm text-[color:var(--muted)]">{card.label}</p>
                        <span className={`rounded-full p-2 ${card.tone}`}>
                          <Icon className="h-4 w-4" />
                        </span>
                      </div>
                      <p className="mt-4 text-3xl font-semibold tracking-tight">
                        {formatCurrencyCLP(card.value)}
                      </p>
                      <p className="mt-2 text-xs font-medium text-[color:var(--muted)]">
                        {formatSignedCurrencyCLP(card.delta)} vs mes anterior
                      </p>
                    </article>
                  );
                })}
              </div>
            </div>

            <aside className="grid gap-4">
              <article className="rounded-[32px] border border-[color:var(--line)] bg-[color:var(--accent-strong)] p-5 text-white shadow-lg">
                <div className="flex items-center justify-between gap-4">
                  <div>
                    <p className="text-xs uppercase tracking-[0.22em] text-teal-100/90">
                      Core diario
                    </p>
                    <p className="mt-2 text-2xl font-semibold">
                      Hablar, clasificar y decidir rapido.
                    </p>
                  </div>
                  <span className="rounded-full border border-white/15 bg-white/10 p-3">
                    <AudioLines className="h-5 w-5" />
                  </span>
                </div>

                <div className="mt-5 grid gap-3">
                  <HighlightLine
                    label="Presupuesto usado"
                    value={`${Math.round(monthlySnapshot.budgetUsed * 100)}%`}
                  />
                  <HighlightLine
                    label="Promedio diario"
                    value={formatCurrencyCLP(monthlySnapshot.dailyExpenseAverage)}
                  />
                  <HighlightLine
                    label="Pendientes"
                    value={`${monthlySnapshot.reviewQueue} por revisar`}
                  />
                </div>
              </article>

              <article className="rounded-[32px] border border-[color:var(--line)] bg-white/80 p-5">
                <div className="flex items-center gap-3">
                  <span className="rounded-full bg-[color:var(--accent-soft)] p-2 text-[color:var(--accent-strong)]">
                    <WalletCards className="h-4 w-4" />
                  </span>
                  <div>
                    <p className="text-sm font-semibold">Prioridades del producto</p>
                    <p className="text-xs text-[color:var(--muted)]">
                      Ordenadas segun tu uso real.
                    </p>
                  </div>
                </div>

                <div className="mt-5 space-y-3">
                  <PriorityLine title="1. Captura sin friccion" subtitle="Voz, texto y parser natural." />
                  <PriorityLine title="2. Limites visibles" subtitle="Ver restante antes de gastar." />
                  <PriorityLine title="3. Atajos y webhook" subtitle="Shortcut post-pago como siguiente capa." />
                  <PriorityLine title="4. QA financiero" subtitle="Preguntas cortas sobre tu propio flujo." />
                </div>
              </article>
            </aside>
          </div>
        </section>

        <CaptureStudio />

        <div className="grid gap-6 xl:grid-cols-2">
          <BudgetBoard />
          <FinanceCopilot />
        </div>

        <AutomationPlaybook />

        <section className="grid gap-6 xl:grid-cols-[1.1fr_0.9fr]">
          <article className="glass-panel rounded-[32px] p-5 sm:p-6">
            <div className="flex items-center justify-between gap-3">
              <div>
                <p className="text-sm uppercase tracking-[0.24em] text-[color:var(--muted)]">
                  Radiografia mensual
                </p>
                <h2 className="section-title mt-2 text-2xl font-semibold">
                  Donde se mueve el mes
                </h2>
              </div>
              <span className="rounded-full bg-[color:var(--accent-soft)] p-2 text-[color:var(--accent-strong)]">
                <ChartColumnIncreasing className="h-5 w-5" />
              </span>
            </div>

            <div className="mt-6 grid gap-4 xl:grid-cols-[0.95fr_1.05fr]">
              <div className="grid gap-3 sm:grid-cols-4 xl:grid-cols-2">
                {weeklyFlow.map((week) => {
                  const highestBar = Math.max(week.income, week.expense);

                  return (
                    <div
                      key={week.label}
                      className="rounded-[24px] border border-[color:var(--line)] bg-white/75 p-3"
                    >
                      <div className="grid h-36 grid-cols-2 items-end gap-2">
                        <div className="flex h-full items-end">
                          <div
                            className="w-full rounded-t-2xl bg-emerald-500/85"
                            style={{
                              height: `${Math.max((week.income / highestBar) * 100, 12)}%`,
                            }}
                          />
                        </div>
                        <div className="flex h-full items-end">
                          <div
                            className="w-full rounded-t-2xl bg-orange-400/90"
                            style={{
                              height: `${Math.max((week.expense / highestBar) * 100, 12)}%`,
                            }}
                          />
                        </div>
                      </div>
                      <div className="mt-4 space-y-1">
                        <p className="font-medium">{week.label}</p>
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

              <div className="space-y-4">
                {categoryInsights.map((category) => (
                  <div
                    key={category.slug}
                    className="rounded-[24px] border border-[color:var(--line)] bg-white/75 p-4"
                  >
                    <div className="flex items-start justify-between gap-4">
                      <div>
                        <p className="font-semibold">{category.label}</p>
                        <p className="mt-1 text-sm leading-6 text-[color:var(--muted)]">
                          {category.description}
                        </p>
                      </div>
                      <div className="text-right">
                        <p className="font-semibold">{formatCurrencyCLP(category.amount)}</p>
                        <p className="mt-1 text-xs text-[color:var(--muted)]">
                          {formatSignedCurrencyCLP(category.change)} vs mes anterior
                        </p>
                      </div>
                    </div>
                    <div className="metric-track mt-4 h-2 overflow-hidden rounded-full">
                      <div
                        className="metric-fill h-full rounded-full"
                        style={{ width: `${Math.round(category.share * 100)}%` }}
                      />
                    </div>
                    <div className="mt-2 flex items-center justify-between text-xs text-[color:var(--muted)]">
                      <span>{Math.round(category.share * 100)}% del gasto total</span>
                      <span>{Math.round(category.budgetFill * 100)}% del limite</span>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </article>

          <div className="grid gap-6">
            <article className="glass-panel rounded-[32px] p-5 sm:p-6">
              <div className="flex items-center justify-between gap-3">
                <div>
                  <p className="text-sm uppercase tracking-[0.24em] text-[color:var(--muted)]">
                    Actividad reciente
                  </p>
                  <h2 className="section-title mt-2 text-2xl font-semibold">
                    Lo ultimo que deberias mirar
                  </h2>
                </div>
                <span className="rounded-full bg-[color:var(--alert-soft)] p-2 text-[color:var(--alert)]">
                  <Clock3 className="h-5 w-5" />
                </span>
              </div>

              <div className="mt-6 space-y-3">
                {recentTransactions.map((transaction) => {
                  const meta = categoryMeta[transaction.category];

                  return (
                    <div
                      key={transaction.id}
                      className="rounded-[24px] border border-[color:var(--line)] bg-white/75 px-4 py-3"
                    >
                      <div className="flex items-start justify-between gap-4">
                        <div>
                          <div className="flex flex-wrap items-center gap-2">
                            <span
                              className="rounded-full px-2 py-1 text-[11px] font-semibold uppercase tracking-[0.16em]"
                              style={{
                                background: meta.soft,
                                color: meta.ink,
                              }}
                            >
                              {meta.label}
                            </span>
                            {transaction.needsReview ? (
                              <span className="rounded-full bg-violet-100 px-2 py-1 text-[11px] font-semibold uppercase tracking-[0.16em] text-violet-700">
                                revisar
                              </span>
                            ) : null}
                          </div>
                          <p className="mt-3 font-semibold">{transaction.title}</p>
                          <p className="mt-1 text-sm text-[color:var(--muted)]">
                            {transaction.description}
                          </p>
                        </div>

                        <div className="text-right">
                          <p
                            className={`font-semibold ${
                              transaction.type === "income"
                                ? "text-emerald-700"
                                : "text-[color:var(--ink)]"
                            }`}
                          >
                            {transaction.type === "income" ? "+" : "-"}
                            {formatCurrencyCLP(transaction.amount)}
                          </p>
                          <p className="mt-1 text-xs text-[color:var(--muted)]">
                            {transaction.account} · {transaction.occurredAt}
                          </p>
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            </article>

            <article className="glass-panel rounded-[32px] p-5 sm:p-6">
              <div className="flex items-center justify-between gap-3">
                <div>
                  <p className="text-sm uppercase tracking-[0.24em] text-[color:var(--muted)]">
                    Cuentas
                  </p>
                  <h2 className="section-title mt-2 text-2xl font-semibold">
                    Donde esta la plata hoy
                  </h2>
                </div>
                <span className="rounded-full bg-slate-100 p-2 text-slate-700">
                  <Landmark className="h-5 w-5" />
                </span>
              </div>

              <div className="mt-6 grid gap-3 sm:grid-cols-3">
                {accountSnapshots.map((account) => (
                  <div
                    key={account.name}
                    className="rounded-[24px] border border-[color:var(--line)] bg-white/75 p-4"
                  >
                    <p className="text-sm text-[color:var(--muted)]">{account.name}</p>
                    <p className="mt-3 text-2xl font-semibold">
                      {formatCurrencyCLP(account.balance)}
                    </p>
                    <p className="mt-1 text-xs text-[color:var(--muted)]">
                      {account.note}
                    </p>
                  </div>
                ))}
              </div>
            </article>
          </div>
        </section>
      </div>
    </main>
  );
}

function HighlightLine({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex items-center justify-between gap-4 rounded-[22px] border border-white/10 bg-white/10 px-4 py-3">
      <span className="text-sm text-teal-100/90">{label}</span>
      <span className="text-sm font-semibold text-white">{value}</span>
    </div>
  );
}

function PriorityLine({
  title,
  subtitle,
}: {
  title: string;
  subtitle: string;
}) {
  return (
    <div className="rounded-[22px] border border-[color:var(--line)] bg-[color:var(--surface-strong)] px-4 py-3">
      <p className="text-sm font-semibold text-[color:var(--ink)]">{title}</p>
      <p className="mt-1 text-xs leading-5 text-[color:var(--muted)]">{subtitle}</p>
    </div>
  );
}
