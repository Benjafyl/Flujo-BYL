import {
  ArrowDownLeft,
  ArrowUpRight,
  AudioLines,
  BrainCircuit,
  ChartColumnIncreasing,
  CircleAlert,
  Clock3,
  Coins,
  Landmark,
  PiggyBank,
  Plus,
  ScanSearch,
  Sparkles,
  WalletCards,
} from "lucide-react";

import {
  accountSnapshots,
  categoryInsights,
  formatCurrencyCLP,
  formatSignedCurrencyCLP,
  monthlySnapshot,
  parserChecklist,
  recentTransactions,
  weeklyFlow,
} from "@/lib/dashboard-data";
import type { ParsedTransactionCandidate } from "@/lib/finance-types";
import { categoryMeta } from "@/lib/merchant-rules";

type DashboardShellProps = {
  parsedExamples: ParsedTransactionCandidate[];
};

export function DashboardShell({ parsedExamples }: DashboardShellProps) {
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
        <section className="glass-panel noise-overlay relative overflow-hidden rounded-[34px] p-5 sm:p-7">
          <div className="absolute inset-x-0 top-0 h-32 bg-gradient-to-r from-teal-700/18 via-transparent to-orange-500/15" />
          <div className="absolute -right-10 top-6 h-40 w-40 rounded-full bg-teal-600/12 blur-3xl" />
          <div className="absolute bottom-0 left-0 h-32 w-32 rounded-full bg-orange-500/12 blur-3xl" />
          <div className="relative grid gap-6 lg:grid-cols-[1.35fr_0.9fr]">
            <div className="space-y-6">
              <div className="flex flex-col gap-4 md:flex-row md:items-start md:justify-between">
                <div className="max-w-2xl space-y-4">
                  <div className="inline-flex items-center gap-2 rounded-full border border-[color:var(--line)] bg-white/70 px-3 py-1 text-[11px] font-semibold uppercase tracking-[0.24em] text-[color:var(--muted)]">
                    <Sparkles className="h-3.5 w-3.5 text-[color:var(--accent)]" />
                    Presupuesto personal
                  </div>
                  <div className="space-y-2">
                    <h1 className="section-title text-4xl font-semibold tracking-tight text-[color:var(--ink)] sm:text-5xl">
                      Tu dinero debería sentirse legible, no caótico.
                    </h1>
                    <p className="max-w-2xl text-sm leading-6 text-[color:var(--muted)] sm:text-base">
                      Primera base de <strong>FLUJO BYL</strong>: dashboard mensual,
                      captura rápida y motor de clasificación para que registrar un
                      gasto sea casi tan rápido como decirlo.
                    </p>
                  </div>
                </div>

                <div className="grid w-full max-w-xs gap-2 rounded-[28px] border border-[color:var(--line)] bg-[color:var(--surface-strong)] p-3 text-sm shadow-sm">
                  <ActionButton icon={Plus} title="Nuevo ingreso" subtitle="Agregar manual en menos de 10 segundos" />
                  <ActionButton icon={AudioLines} title="Registrar por voz" subtitle="Pipeline de transcripción y parser listo para conectar" />
                  <ActionButton icon={ScanSearch} title="Revisar pendientes" subtitle={`${monthlySnapshot.reviewQueue} movimientos con confianza media`} />
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

              <section className="grid gap-4 xl:grid-cols-[1.15fr_0.85fr]">
                <article className="rounded-[30px] border border-[color:var(--line)] bg-[color:var(--surface-strong)] p-5">
                  <div className="flex items-center justify-between gap-3">
                    <div>
                      <p className="text-sm uppercase tracking-[0.24em] text-[color:var(--muted)]">
                        Abril 2026
                      </p>
                      <h2 className="section-title mt-2 text-xl font-semibold">
                        Flujo por semana
                      </h2>
                    </div>
                    <span className="rounded-full bg-[color:var(--accent-soft)] p-2 text-[color:var(--accent-strong)]">
                      <ChartColumnIncreasing className="h-5 w-5" />
                    </span>
                  </div>

                  <div className="mt-6 grid gap-4 sm:grid-cols-4">
                    {weeklyFlow.map((week) => {
                      const highestBar = Math.max(week.income, week.expense);

                      return (
                        <div
                          key={week.label}
                          className="rounded-[22px] border border-[color:var(--line)] bg-white/70 p-3"
                        >
                          <div className="grid h-40 grid-cols-2 items-end gap-2">
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
                </article>

                <article className="rounded-[30px] border border-[color:var(--line)] bg-[color:var(--surface-strong)] p-5">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm uppercase tracking-[0.24em] text-[color:var(--muted)]">
                        Pulso del mes
                      </p>
                      <h2 className="section-title mt-2 text-xl font-semibold">
                        Qué está pasando
                      </h2>
                    </div>
                    <span className="rounded-full bg-[color:var(--violet-soft)] p-2 text-violet-700">
                      <BrainCircuit className="h-5 w-5" />
                    </span>
                  </div>

                  <div className="mt-6 space-y-4">
                    <InsightChip
                      icon={Coins}
                      title="Gasto promedio diario"
                      value={formatCurrencyCLP(monthlySnapshot.dailyExpenseAverage)}
                      tone="bg-orange-50 text-orange-700"
                    />
                    <InsightChip
                      icon={CircleAlert}
                      title="Presupuesto usado"
                      value={`${Math.round(monthlySnapshot.budgetUsed * 100)}%`}
                      tone="bg-amber-50 text-amber-700"
                    />
                    <InsightChip
                      icon={Clock3}
                      title="Pendientes de revisión"
                      value={`${monthlySnapshot.reviewQueue} movimientos`}
                      tone="bg-violet-50 text-violet-700"
                    />
                    <InsightChip
                      icon={Landmark}
                      title="Categoría más pesada"
                      value={categoryInsights[0].label}
                      tone="bg-teal-50 text-teal-800"
                    />
                  </div>
                </article>
              </section>
            </div>

            <VoiceCapturePanel parsedExamples={parsedExamples} />
          </div>
        </section>

        <section className="grid gap-6 xl:grid-cols-[1.05fr_0.95fr]">
          <article className="glass-panel rounded-[32px] p-5 sm:p-6">
            <div className="flex items-center justify-between gap-3">
              <div>
                <p className="text-sm uppercase tracking-[0.24em] text-[color:var(--muted)]">
                  Categorías
                </p>
                <h2 className="section-title mt-2 text-2xl font-semibold">
                  En qué se está yendo la plata
                </h2>
              </div>
              <span className="rounded-full bg-[color:var(--accent-soft)] p-2 text-[color:var(--accent-strong)]">
                <WalletCards className="h-5 w-5" />
              </span>
            </div>

            <div className="mt-6 space-y-4">
              {categoryInsights.map((category) => (
                <div
                  key={category.slug}
                  className="rounded-[24px] border border-[color:var(--line)] bg-white/75 p-4"
                >
                  <div className="flex items-start justify-between gap-4">
                    <div>
                      <p className="font-semibold">{category.label}</p>
                      <p className="mt-1 text-sm text-[color:var(--muted)]">
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
                    <span>{Math.round(category.budgetFill * 100)}% del presupuesto</span>
                  </div>
                </div>
              ))}
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
                    Lo último que se registró
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
                    Dónde está tu plata
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

function ActionButton({
  icon: Icon,
  title,
  subtitle,
}: {
  icon: typeof Plus;
  title: string;
  subtitle: string;
}) {
  return (
    <button
      type="button"
      className="flex items-start gap-3 rounded-[22px] border border-[color:var(--line)] bg-white/85 px-4 py-3 text-left transition hover:border-[color:var(--line-strong)] hover:bg-white"
    >
      <span className="rounded-full bg-[color:var(--accent-soft)] p-2 text-[color:var(--accent-strong)]">
        <Icon className="h-4 w-4" />
      </span>
      <span>
        <span className="block text-sm font-semibold text-[color:var(--ink)]">{title}</span>
        <span className="mt-1 block text-xs leading-5 text-[color:var(--muted)]">
          {subtitle}
        </span>
      </span>
    </button>
  );
}

function VoiceCapturePanel({
  parsedExamples,
}: {
  parsedExamples: ParsedTransactionCandidate[];
}) {
  return (
    <aside className="glass-panel grid-paper rounded-[34px] p-5 sm:p-6">
      <div className="space-y-5">
        <div className="flex items-start justify-between gap-4">
          <div>
            <p className="text-sm uppercase tracking-[0.24em] text-[color:var(--muted)]">
              Motor de captura
            </p>
            <h2 className="section-title mt-2 text-2xl font-semibold">
              Voz, texto y clasificación
            </h2>
          </div>
          <span className="rounded-full bg-[color:var(--accent-soft)] p-2 text-[color:var(--accent-strong)]">
            <AudioLines className="h-5 w-5" />
          </span>
        </div>

        <div className="rounded-[28px] bg-[color:var(--accent-strong)] p-4 text-white shadow-lg">
          <div className="flex items-center justify-between gap-3">
            <div>
              <p className="text-xs uppercase tracking-[0.24em] text-teal-100/90">
                Quick capture
              </p>
              <p className="mt-2 text-lg font-semibold">
                “Gasté 2.000 en iMark”
              </p>
            </div>
            <span className="rounded-full border border-white/15 bg-white/10 p-3">
              <AudioLines className="h-5 w-5" />
            </span>
          </div>
          <div className="mt-4 flex items-center gap-2 text-xs text-teal-100/85">
            <span className="h-2 w-2 rounded-full bg-emerald-300" />
            Grabando
            <span className="h-2 w-2 rounded-full bg-orange-300" />
            Interpretando
            <span className="h-2 w-2 rounded-full bg-white/60" />
            Confirmando
          </div>
        </div>

        <div className="space-y-3">
          {parsedExamples.map((example) => (
            <div
              key={example.input}
              className="rounded-[24px] border border-[color:var(--line)] bg-white/85 p-4"
            >
              <p className="font-medium text-[color:var(--ink)]">“{example.input}”</p>
              <div className="mt-4 grid gap-2 text-sm text-[color:var(--muted)] sm:grid-cols-2">
                <ResultRow label="Tipo" value={example.type} />
                <ResultRow
                  label="Monto"
                  value={example.amount ? formatCurrencyCLP(example.amount) : "Sin detectar"}
                />
                <ResultRow label="Merchant" value={example.merchant ?? "Pendiente"} />
                <ResultRow
                  label="Categoría"
                  value={example.category ? categoryMeta[example.category].label : "Pendiente"}
                />
              </div>
              <div className="mt-4 flex items-center justify-between gap-4 text-xs">
                <span className="rounded-full bg-slate-100 px-2 py-1 font-semibold uppercase tracking-[0.16em] text-slate-700">
                  confianza {Math.round(example.confidence * 100)}%
                </span>
                <span
                  className={`rounded-full px-2 py-1 font-semibold uppercase tracking-[0.16em] ${
                    example.needsReview
                      ? "bg-violet-100 text-violet-700"
                      : "bg-emerald-100 text-emerald-700"
                  }`}
                >
                  {example.needsReview ? "revisar" : "auto"}
                </span>
              </div>
              <p className="mt-3 text-xs leading-5 text-[color:var(--muted)]">
                {example.explanation}
              </p>
            </div>
          ))}
        </div>

        <div className="rounded-[28px] border border-dashed border-[color:var(--line-strong)] bg-white/60 p-4">
          <div className="flex items-center gap-2">
            <BrainCircuit className="h-4 w-4 text-[color:var(--accent-strong)]" />
            <p className="text-sm font-semibold">Checklist del parser MVP</p>
          </div>
          <ul className="mt-3 space-y-2 text-sm text-[color:var(--muted)]">
            {parserChecklist.map((item) => (
              <li key={item} className="flex gap-2">
                <span className="mt-[7px] h-1.5 w-1.5 rounded-full bg-[color:var(--accent)]" />
                <span>{item}</span>
              </li>
            ))}
          </ul>
        </div>
      </div>
    </aside>
  );
}

function InsightChip({
  icon: Icon,
  title,
  value,
  tone,
}: {
  icon: typeof Coins;
  title: string;
  value: string;
  tone: string;
}) {
  return (
    <div className="flex items-center gap-3 rounded-[24px] border border-[color:var(--line)] bg-white/70 px-4 py-3">
      <span className={`rounded-full p-2 ${tone}`}>
        <Icon className="h-4 w-4" />
      </span>
      <div>
        <p className="text-sm font-medium">{title}</p>
        <p className="text-xs text-[color:var(--muted)]">{value}</p>
      </div>
    </div>
  );
}

function ResultRow({ label, value }: { label: string; value: string }) {
  return (
    <div>
      <p className="text-[11px] font-semibold uppercase tracking-[0.16em] text-[color:var(--muted)]">
        {label}
      </p>
      <p className="mt-1 text-sm font-medium text-[color:var(--ink)]">{value}</p>
    </div>
  );
}
