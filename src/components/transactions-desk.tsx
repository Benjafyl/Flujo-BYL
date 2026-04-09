"use client";

import { useDeferredValue, useState } from "react";
import {
  ArrowDownLeft,
  ArrowUpRight,
  Clock3,
  Search,
  ShieldAlert,
} from "lucide-react";

import {
  formatCurrencyCLP,
  recentTransactions,
} from "@/lib/dashboard-data";
import type { RecentTransaction } from "@/lib/finance-types";
import { categoryMeta } from "@/lib/merchant-rules";

type TransactionFilter = "all" | "expense" | "income" | "review";

const filterOptions: Array<{
  id: TransactionFilter;
  label: string;
}> = [
  { id: "all", label: "Todos" },
  { id: "expense", label: "Egresos" },
  { id: "income", label: "Ingresos" },
  { id: "review", label: "Revisar" },
];

export function TransactionsDesk() {
  const [query, setQuery] = useState("");
  const [filter, setFilter] = useState<TransactionFilter>("all");
  const deferredQuery = useDeferredValue(query);
  const normalizedQuery = deferredQuery.trim().toLowerCase();
  const visibleTransactions = recentTransactions.filter((transaction) =>
    matchesTransaction(transaction, filter, normalizedQuery),
  );
  const expenseCount = recentTransactions.filter(
    (transaction) => transaction.type === "expense",
  ).length;
  const incomeCount = recentTransactions.filter(
    (transaction) => transaction.type === "income",
  ).length;
  const reviewCount = recentTransactions.filter(
    (transaction) => transaction.needsReview,
  ).length;

  return (
    <section className="glass-panel rounded-[32px] p-5 sm:p-6">
      <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
        <div>
          <p className="text-sm uppercase tracking-[0.22em] text-[color:var(--muted)]">
            Movimientos
          </p>
          <h2 className="section-title mt-2 text-3xl font-semibold text-[color:var(--ink)]">
            Buscar, filtrar y revisar
          </h2>
        </div>

        <div className="grid gap-3 sm:grid-cols-3">
          <DeskStat label="Egresos" value={`${expenseCount}`} icon={ArrowDownLeft} />
          <DeskStat label="Ingresos" value={`${incomeCount}`} icon={ArrowUpRight} />
          <DeskStat label="Revisar" value={`${reviewCount}`} icon={ShieldAlert} />
        </div>
      </div>

      <div className="mt-6 rounded-[28px] border border-[color:var(--line)] bg-[color:var(--surface-strong)] p-4 sm:p-5">
        <div className="flex flex-col gap-3 lg:flex-row lg:items-center">
          <label className="relative block min-w-0 flex-1">
            <Search className="pointer-events-none absolute left-4 top-1/2 h-4 w-4 -translate-y-1/2 text-[color:var(--muted)]" />
            <input
              value={query}
              onChange={(event) => setQuery(event.target.value)}
              className="min-h-[44px] w-full rounded-full border border-[color:var(--line)] bg-white pl-11 pr-4 text-sm outline-none transition focus:border-[color:var(--accent)]"
              placeholder="Buscar por comercio, cuenta o descripcion"
            />
          </label>

          <div className="scroll-row flex gap-2 overflow-x-auto pb-1">
            {filterOptions.map((option) => (
              <button
                key={option.id}
                type="button"
                onClick={() => setFilter(option.id)}
                className={`min-h-[44px] rounded-full px-4 py-2 text-sm font-semibold transition ${
                  filter === option.id
                    ? "bg-[color:var(--accent-strong)] text-white"
                    : "border border-[color:var(--line)] bg-white text-[color:var(--muted)]"
                }`}
              >
                {option.label}
              </button>
            ))}
          </div>
        </div>
      </div>

      <div className="mt-5 space-y-3">
        {visibleTransactions.length > 0 ? (
          visibleTransactions.map((transaction) => {
            const meta = categoryMeta[transaction.category];

            return (
              <article
                key={transaction.id}
                className="rounded-[24px] border border-[color:var(--line)] bg-white/82 px-4 py-4"
              >
                <div className="flex flex-col gap-4 lg:flex-row lg:items-start lg:justify-between">
                  <div>
                    <div className="flex flex-wrap items-center gap-2">
                      <span
                        className="rounded-full px-2 py-1 text-[11px] font-semibold uppercase tracking-[0.14em]"
                        style={{ background: meta.soft, color: meta.ink }}
                      >
                        {meta.label}
                      </span>
                      {transaction.needsReview ? (
                        <span className="rounded-full bg-amber-100 px-2 py-1 text-[11px] font-semibold uppercase tracking-[0.14em] text-amber-700">
                          revisar
                        </span>
                      ) : null}
                    </div>

                    <p className="mt-3 text-base font-semibold text-[color:var(--ink)]">
                      {transaction.title}
                    </p>
                    <p className="mt-1 text-sm text-[color:var(--muted)]">
                      {transaction.description}
                    </p>

                    <div className="mt-3 flex flex-wrap items-center gap-3 text-xs text-[color:var(--muted)]">
                      <span className="rounded-full bg-[color:var(--surface-muted)] px-3 py-1">
                        {transaction.account}
                      </span>
                      <span className="inline-flex items-center gap-1">
                        <Clock3 className="h-3.5 w-3.5" />
                        {transaction.occurredAt}
                      </span>
                    </div>
                  </div>

                  <div className="text-left lg:text-right">
                    <p
                      className={`text-lg font-semibold ${
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
              </article>
            );
          })
        ) : (
          <div className="rounded-[24px] border border-dashed border-[color:var(--line-strong)] bg-[color:var(--surface-strong)] px-4 py-10 text-center text-sm text-[color:var(--muted)]">
            No hay movimientos que coincidan con ese filtro.
          </div>
        )}
      </div>
    </section>
  );
}

function matchesTransaction(
  transaction: RecentTransaction,
  filter: TransactionFilter,
  query: string,
) {
  if (filter === "expense" && transaction.type !== "expense") {
    return false;
  }

  if (filter === "income" && transaction.type !== "income") {
    return false;
  }

  if (filter === "review" && !transaction.needsReview) {
    return false;
  }

  if (!query) {
    return true;
  }

  return [
    transaction.title,
    transaction.description,
    transaction.account,
    transaction.occurredAt,
  ]
    .join(" ")
    .toLowerCase()
    .includes(query);
}

function DeskStat({
  label,
  value,
  icon: Icon,
}: {
  label: string;
  value: string;
  icon: typeof ArrowDownLeft;
}) {
  return (
    <div className="rounded-[20px] border border-[color:var(--line)] bg-[color:var(--surface-strong)] px-4 py-3">
      <div className="flex items-center gap-2">
        <span className="rounded-full bg-[color:var(--accent-soft)] p-2 text-[color:var(--accent-strong)]">
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
