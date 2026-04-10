import { AlertTriangle, Flag, PiggyBank, TrendingUp } from "lucide-react";

import { formatCurrencyCLP } from "@/lib/currency";
import type {
  BudgetCategory,
  MonthlySnapshot,
  SetupFocusItem,
} from "@/lib/finance-types";

export function BudgetBoard({
  budgetCategories,
  monthlySnapshot,
  setupFocus,
}: {
  budgetCategories: BudgetCategory[];
  monthlySnapshot: MonthlySnapshot;
  setupFocus: SetupFocusItem[];
}) {
  const mostPressuredBudget = [...budgetCategories].sort(
    (left, right) => right.spent / right.limit - left.spent / left.limit,
  )[0];

  return (
    <section className="glass-panel rounded-[32px] p-5 sm:p-6">
      <div className="flex items-start justify-between gap-4">
        <div>
          <p className="text-sm uppercase tracking-[0.22em] text-[color:var(--muted)]">
            Presupuestos
          </p>
          <h2 className="section-title mt-2 text-3xl font-semibold">
            Limites por categoria
          </h2>
          <p className="mt-2 text-sm text-[color:var(--muted)]">
            Restante, avance y foco del mes.
          </p>
        </div>

        <span className="rounded-full bg-[color:var(--accent-soft)] p-3 text-[color:var(--accent-strong)]">
          <PiggyBank className="h-5 w-5" />
        </span>
      </div>

      {budgetCategories.length > 0 ? (
        <div className="mt-6 grid gap-4 lg:grid-cols-[1.1fr_0.9fr]">
          <div className="space-y-3">
            {budgetCategories.map((budget) => {
              const progress = budget.spent / budget.limit;
              const remaining = budget.limit - budget.spent;
              const isCritical = progress >= 0.85;
              const isWarning = progress >= 0.7 && progress < 0.85;

              return (
                <article
                  key={budget.id}
                  className="rounded-[24px] border border-[color:var(--line)] bg-white/80 p-4"
                >
                  <div className="flex items-start justify-between gap-4">
                    <div>
                      <p className="font-semibold text-[color:var(--ink)]">{budget.label}</p>
                      <p className="mt-1 text-sm leading-6 text-[color:var(--muted)]">
                        {budget.note}
                      </p>
                    </div>
                    <span
                      className={`rounded-full px-3 py-1 text-[11px] font-semibold uppercase tracking-[0.18em] ${
                        isCritical
                          ? "bg-rose-100 text-rose-700"
                          : isWarning
                            ? "bg-amber-100 text-amber-700"
                            : "bg-emerald-100 text-emerald-700"
                      }`}
                    >
                      {Math.round(progress * 100)}%
                    </span>
                  </div>

                  <div className="metric-track mt-4 h-3 overflow-hidden rounded-full">
                    <div
                      className="h-full rounded-full transition-all"
                      style={{
                        width: `${Math.min(progress * 100, 100)}%`,
                        background: isCritical
                          ? "linear-gradient(90deg, #f97316 0%, #fb7185 100%)"
                          : "linear-gradient(90deg, #0c7c59 0%, #20b486 100%)",
                      }}
                    />
                  </div>

                  <div className="mt-3 flex flex-wrap items-center justify-between gap-2 text-sm">
                    <span className="text-[color:var(--muted)]">
                      {formatCurrencyCLP(budget.spent)} de {formatCurrencyCLP(budget.limit)}
                    </span>
                    <span className="font-semibold text-[color:var(--ink)]">
                      Restante {formatCurrencyCLP(remaining)}
                    </span>
                  </div>
                </article>
              );
            })}
          </div>

          <div className="grid gap-4">
            <article className="rounded-[28px] border border-[color:var(--line)] bg-[color:var(--surface-strong)] p-5">
              <div className="flex items-center gap-3">
                <span className="rounded-full bg-[color:var(--alert-soft)] p-2 text-[color:var(--alert)]">
                  <AlertTriangle className="h-4 w-4" />
                </span>
                <div>
                  <p className="text-sm font-semibold">Categoria mas sensible</p>
                  <p className="text-xs text-[color:var(--muted)]">
                    La que hoy merece mas control.
                  </p>
                </div>
              </div>

              <div className="mt-5 rounded-[24px] bg-white px-4 py-4">
                <p className="text-xs uppercase tracking-[0.18em] text-[color:var(--muted)]">
                  {mostPressuredBudget.label}
                </p>
                <p className="mt-2 text-3xl font-semibold">
                  {formatCurrencyCLP(
                    mostPressuredBudget.limit - mostPressuredBudget.spent,
                  )}
                </p>
                <p className="mt-2 text-sm text-[color:var(--muted)]">Disponible hoy.</p>
              </div>
            </article>

            <article className="rounded-[28px] border border-[color:var(--line)] bg-white/80 p-5">
              <div className="flex items-center gap-3">
                <span className="rounded-full bg-[color:var(--accent-soft)] p-2 text-[color:var(--accent-strong)]">
                  <TrendingUp className="h-4 w-4" />
                </span>
                <div>
                  <p className="text-sm font-semibold">Pulso general</p>
                  <p className="text-xs text-[color:var(--muted)]">Lectura del mes.</p>
                </div>
              </div>

              <div className="mt-5 grid gap-3">
                <StatLine
                  icon={Flag}
                  label="Presupuesto total usado"
                  value={
                    monthlySnapshot.budgetUsed !== null
                      ? `${Math.round(monthlySnapshot.budgetUsed * 100)}%`
                      : "Sin limites cargados"
                  }
                />
                <StatLine
                  icon={PiggyBank}
                  label="Balance del mes"
                  value={formatCurrencyCLP(monthlySnapshot.balance)}
                />
                <StatLine
                  icon={AlertTriangle}
                  label="Promedio diario"
                  value={formatCurrencyCLP(monthlySnapshot.dailyExpenseAverage)}
                />
              </div>
            </article>
          </div>
        </div>
      ) : (
        <div className="mt-6 grid gap-4 lg:grid-cols-[1.1fr_0.9fr]">
          <div className="rounded-[28px] border border-dashed border-[color:var(--line-strong)] bg-[color:var(--surface-strong)] px-5 py-8">
            <p className="text-lg font-semibold text-[color:var(--ink)]">
              Aun no has cargado limites
            </p>
            <p className="mt-3 max-w-2xl text-sm leading-6 text-[color:var(--muted)]">
              Deja esta parte limpia hasta que quieras fijar un tope real. Tus focos
              actuales ya están claros y puedes usar eso para definir presupuestos.
            </p>
          </div>

          <div className="grid gap-3">
            {setupFocus.map((item) => (
              <div
                key={item.title}
                className="rounded-[22px] border border-[color:var(--line)] bg-white/82 px-4 py-4"
              >
                <p className="text-sm font-semibold text-[color:var(--ink)]">{item.title}</p>
                <p className="mt-2 text-sm leading-6 text-[color:var(--muted)]">
                  {item.detail}
                </p>
              </div>
            ))}
          </div>
        </div>
      )}
    </section>
  );
}

function StatLine({
  icon: Icon,
  label,
  value,
}: {
  icon: typeof PiggyBank;
  label: string;
  value: string;
}) {
  return (
    <div className="flex items-center justify-between gap-4 rounded-[20px] border border-[color:var(--line)] bg-[color:var(--surface-strong)] px-4 py-3">
      <div className="flex items-center gap-3">
        <span className="rounded-full bg-white p-2 text-[color:var(--accent-strong)]">
          <Icon className="h-4 w-4" />
        </span>
        <span className="text-sm text-[color:var(--muted)]">{label}</span>
      </div>
      <span className="text-sm font-semibold text-[color:var(--ink)]">{value}</span>
    </div>
  );
}
