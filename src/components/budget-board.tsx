import { AlertTriangle, Flag, PiggyBank, TrendingUp } from "lucide-react";

import {
  budgetCategories,
  formatCurrencyCLP,
  monthlySnapshot,
} from "@/lib/dashboard-data";

export function BudgetBoard() {
  const mostPressuredBudget = [...budgetCategories].sort(
    (left, right) => right.spent / right.limit - left.spent / left.limit,
  )[0];

  return (
    <section className="glass-panel rounded-[32px] p-5 sm:p-6">
      <div className="flex items-start justify-between gap-4">
        <div>
          <p className="text-sm uppercase tracking-[0.22em] text-[color:var(--muted)]">
            Limites del mes
          </p>
          <h2 className="section-title mt-2 text-3xl font-semibold">
            Pon limites y miralos en tiempo real
          </h2>
          <p className="mt-3 max-w-2xl text-sm leading-6 text-[color:var(--muted)]">
            El dashboard debe decirte cuanto queda antes de pasarte, no solo cuanto
            gastaste despues.
          </p>
        </div>

        <span className="rounded-full bg-[color:var(--accent-soft)] p-3 text-[color:var(--accent-strong)]">
          <PiggyBank className="h-5 w-5" />
        </span>
      </div>

      <div className="mt-6 grid gap-4 lg:grid-cols-[1.1fr_0.9fr]">
        <div className="space-y-3">
          {budgetCategories.map((budget) => {
            const progress = budget.spent / budget.limit;
            const remaining = budget.limit - budget.spent;
            const isCritical = progress >= 0.85;
            const isWarning = progress >= 0.7 && progress < 0.85;

            return (
              <article
                key={budget.slug}
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
                  La que hoy merece mas friccion positiva.
                </p>
              </div>
            </div>

            <div className="mt-5 rounded-[24px] bg-white px-4 py-4">
              <p className="text-xs uppercase tracking-[0.18em] text-[color:var(--muted)]">
                {mostPressuredBudget.label}
              </p>
              <p className="mt-2 text-3xl font-semibold">
                {formatCurrencyCLP(mostPressuredBudget.limit - mostPressuredBudget.spent)}
              </p>
              <p className="mt-2 text-sm leading-6 text-[color:var(--muted)]">
                Si sigues registrando antes de pagar o justo despues, aqui deberias ver
                el cambio inmediato.
              </p>
            </div>
          </article>

          <article className="rounded-[28px] border border-[color:var(--line)] bg-white/80 p-5">
            <div className="flex items-center gap-3">
              <span className="rounded-full bg-[color:var(--accent-soft)] p-2 text-[color:var(--accent-strong)]">
                <TrendingUp className="h-4 w-4" />
              </span>
              <div>
                <p className="text-sm font-semibold">Pulso general</p>
                <p className="text-xs text-[color:var(--muted)]">
                  Lectura corta para decidir rapido.
                </p>
              </div>
            </div>

            <div className="mt-5 grid gap-3">
              <StatLine
                icon={Flag}
                label="Presupuesto total usado"
                value={`${Math.round(monthlySnapshot.budgetUsed * 100)}%`}
              />
              <StatLine
                icon={PiggyBank}
                label="Balance del mes"
                value={formatCurrencyCLP(monthlySnapshot.balance)}
              />
              <StatLine
                icon={AlertTriangle}
                label="Pendientes por revisar"
                value={`${monthlySnapshot.reviewQueue} movimientos`}
              />
            </div>
          </article>
        </div>
      </div>
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
