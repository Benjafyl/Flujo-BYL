import type {
  AccountSnapshot,
  AutomationMethod,
  BudgetCategory,
  CategoryInsight,
  DashboardData,
  MonthlySnapshot,
  RecentTransaction,
  SetupFocusItem,
  WeeklyFlowPoint,
} from "@/lib/finance-types";
import { formatCurrencyCLP } from "@/lib/currency";
import {
  getPersonalDashboardRecords,
  type AccountRow,
  type CategoryRow,
  type TransactionRow,
} from "@/lib/personal-finance";

const dateFormatter = new Intl.DateTimeFormat("es-CL", {
  month: "long",
  year: "numeric",
  timeZone: "America/Santiago",
});

const occurredAtFormatter = new Intl.DateTimeFormat("es-CL", {
  day: "2-digit",
  month: "short",
  hour: "2-digit",
  minute: "2-digit",
  hour12: false,
  timeZone: "America/Santiago",
});

export const automationMethods: AutomationMethod[] = [
  {
    id: "apple-pay",
    title: "Atajo post-pago",
    description:
      "Cada pago del iPhone puede terminar en un movimiento guardado en FLUJO BYL.",
    bullets: [
      "Pensado para uso personal.",
      "Ideal para Apple Pay y Shortcuts.",
      "Mantiene el registro al dia.",
    ],
    footnote: "El webhook ya existe. Solo falta cerrar la parte autenticada del atajo.",
  },
  {
    id: "voice-button",
    title: "Boton de voz",
    description:
      "Dictas el gasto con lenguaje natural y se registra directo con monto y categoria.",
    bullets: [
      "Sin escribir formularios.",
      "Perfecto para el celular.",
      "Aprende tus comercios frecuentes.",
    ],
    footnote: "La captura manual y hablada ya comparte el mismo flujo de guardado.",
  },
  {
    id: "message-trigger",
    title: "Mensajes y correos",
    description:
      "El siguiente paso es transformar confirmaciones del banco en movimientos reales.",
    bullets: [
      "Sirve para SMS o email.",
      "Comparte la misma normalizacion.",
      "Mantiene una sola entrada de datos.",
    ],
    footnote: "Queda listo para cuando agreguemos ingestion automatica segura.",
  },
];

export const askFinancePrompts = [
  "Cuanto he gastado en supermercado este mes?",
  "Cuanto debo hoy en Tenpo?",
  "Que tan cargado voy en servicios basicos?",
];

export const captureExamples = [
  "Pague 18.900 en iMark con Bice",
  "Me llego finiquito de Interchileclima por 495 mil",
  "Pague 43.500 de gasto comun",
];

export const setupFocus: SetupFocusItem[] = [
  {
    title: "Banco Bice",
    detail: "Cuenta corriente como base diaria y tarjeta de credito con cupo de $300.000.",
  },
  {
    title: "BancoEstado",
    detail: "CuentaRUT disponible como cuenta secundaria.",
  },
  {
    title: "Tenpo",
    detail: "Tarjeta de credito con deuda pendiente de $300.000 para monitorear.",
  },
  {
    title: "Ingresos irregulares",
    detail: "Finiquito de Interchileclima en cuotas y sin sueldo fijo actual.",
  },
  {
    title: "Obligaciones base",
    detail: "Gasto comun, agua, luz, internet y supermercado como foco del mes.",
  },
];

export async function getDashboardData() {
  const now = new Date();
  const monthStart = new Date(now.getFullYear(), now.getMonth(), 1, 0, 0, 0, 0);
  const nextMonth = new Date(now.getFullYear(), now.getMonth() + 1, 1, 0, 0, 0, 0);
  const monthDate = formatDateOnly(monthStart);

  const { owner, profile, accounts, categories, monthTransactions, recentTransactions, budgets } =
    await getPersonalDashboardRecords({
      monthStartIso: monthStart.toISOString(),
      nextMonthIso: nextMonth.toISOString(),
      monthDate,
    });

  const categoryById = new Map<string, CategoryRow>(
    categories.map((category: CategoryRow) => [category.id, category]),
  );
  const accountById = new Map<string, AccountRow>(
    accounts.map((account: AccountRow) => [account.id, account]),
  );

  const normalizedAccounts = accounts.map((account) => toAccountSnapshot(account));
  const normalizedBudgets = budgets
    .map((budget) => {
      const category = categoryById.get(budget.category_id);

      if (!category) {
        return null;
      }

      return {
        id: budget.id,
        slug: category.slug,
        label: category.name,
        spent: roundCurrency(
          monthTransactions
            .filter(
              (transaction) =>
                transaction.type === "expense" &&
                transaction.category_id === budget.category_id,
            )
            .reduce((sum, transaction) => sum + toNumber(transaction.amount), 0),
        ),
        limit: toNumber(budget.amount_limit),
        note: `Limite actual para ${category.name.toLowerCase()}.`,
      } satisfies BudgetCategory;
    })
    .filter((budget): budget is BudgetCategory => Boolean(budget));

  const normalizedRecentTransactions = recentTransactions.map((transaction) =>
    toRecentTransaction(transaction, categoryById.get(transaction.category_id ?? ""), accountById),
  );

  const monthlySnapshot = buildMonthlySnapshot(monthTransactions, normalizedBudgets, now);

  return {
    userName:
      profile.full_name?.trim() || owner.email.split("@")[0] || "Benja",
    monthLabel: capitalize(dateFormatter.format(monthStart)),
    defaultAccountId:
      accounts.find((account) => account.is_default)?.id ?? accounts[0]?.id ?? null,
    defaultAccountLabel:
      normalizedAccounts.find((account) => account.isDefault)?.name ??
      normalizedAccounts[0]?.name ??
      null,
    monthlySnapshot,
    weeklyFlow: buildWeeklyFlow(monthTransactions, monthStart, nextMonth),
    categoryInsights: buildCategoryInsights(monthTransactions, normalizedBudgets, categoryById),
    budgetCategories: normalizedBudgets,
    recentTransactions: normalizedRecentTransactions,
    accountSnapshots: normalizedAccounts,
    automationMethods,
    askFinancePrompts,
    captureExamples,
    setupFocus,
    hasTransactions: monthTransactions.length > 0,
    hasBudgets: normalizedBudgets.length > 0,
  } satisfies DashboardData;
}

function toNumber(value: number | string | null | undefined) {
  if (typeof value === "number") {
    return value;
  }

  if (!value) {
    return 0;
  }

  const parsed = Number(value);

  return Number.isFinite(parsed) ? parsed : 0;
}

function toAccountSnapshot(account: AccountRow): AccountSnapshot {
  const institutionPrefix = account.institution ? `${account.institution} ` : "";
  const balance = toNumber(account.balance);
  const creditLimit = toNumber(account.credit_limit);

  return {
    id: account.id,
    name: `${institutionPrefix}${account.name}`.trim(),
    institution: account.institution,
    balance,
    creditLimit,
    accountType: account.account_type,
    note:
      account.notes ??
      (creditLimit > 0
        ? `Cupo ${formatCurrencyCLP(creditLimit)}`
        : account.is_default
          ? "Cuenta principal"
          : "Cuenta secundaria"),
    isDefault: account.is_default,
  };
}

function toRecentTransaction(
  transaction: TransactionRow,
  category: CategoryRow | undefined,
  accountById: Map<string, AccountRow>,
): RecentTransaction {
  const account = transaction.account_id
    ? accountById.get(transaction.account_id)
    : null;
  const title = transaction.merchant_raw?.trim() || compactDescription(transaction.description_raw);
  const description = account?.institution
    ? `${account.institution} ${account.name}`.trim()
    : account?.name ?? "Sin cuenta";

  return {
    id: transaction.id,
    title,
    description,
    amount: toNumber(transaction.amount),
    type: transaction.type,
    categorySlug: category?.slug ?? null,
    categoryLabel: category?.name ?? "Sin categoria",
    account: account?.name ?? "Sin cuenta",
    occurredAt: capitalize(occurredAtFormatter.format(new Date(transaction.occurred_at))),
  };
}

function buildMonthlySnapshot(
  monthTransactions: TransactionRow[],
  budgets: BudgetCategory[],
  now: Date,
): MonthlySnapshot {
  const income = roundCurrency(
    monthTransactions
      .filter((transaction) => transaction.type === "income")
      .reduce((sum, transaction) => sum + toNumber(transaction.amount), 0),
  );
  const expenses = roundCurrency(
    monthTransactions
      .filter((transaction) => transaction.type === "expense")
      .reduce((sum, transaction) => sum + toNumber(transaction.amount), 0),
  );
  const totalBudget = budgets.reduce((sum, budget) => sum + budget.limit, 0);

  return {
    income,
    expenses,
    balance: income - expenses,
    budgetUsed: totalBudget > 0 ? expenses / totalBudget : null,
    dailyExpenseAverage: expenses / Math.max(now.getDate(), 1),
    transactionCount: monthTransactions.length,
  };
}

function buildWeeklyFlow(
  monthTransactions: TransactionRow[],
  monthStart: Date,
  nextMonth: Date,
) {
  const weeks: WeeklyFlowPoint[] = [];
  const monthEnd = new Date(nextMonth.getTime() - 1);
  const totalDays = monthEnd.getDate();
  const weekCount = Math.max(Math.ceil(totalDays / 7), 4);

  for (let weekIndex = 0; weekIndex < weekCount; weekIndex += 1) {
    const startDay = weekIndex * 7 + 1;
    const endDay = Math.min(startDay + 6, 31);

    const weekTransactions = monthTransactions.filter((transaction) => {
      const occurredAt = new Date(transaction.occurred_at);

      return (
        occurredAt >= monthStart &&
        occurredAt.getDate() >= startDay &&
        occurredAt.getDate() <= endDay
      );
    });

    weeks.push({
      label: `Semana ${weekIndex + 1}`,
      income: roundCurrency(
        weekTransactions
          .filter((transaction) => transaction.type === "income")
          .reduce((sum, transaction) => sum + toNumber(transaction.amount), 0),
      ),
      expense: roundCurrency(
        weekTransactions
          .filter((transaction) => transaction.type === "expense")
          .reduce((sum, transaction) => sum + toNumber(transaction.amount), 0),
      ),
    });
  }

  return weeks;
}

function buildCategoryInsights(
  monthTransactions: TransactionRow[],
  budgets: BudgetCategory[],
  categoryById: Map<string, CategoryRow>,
) {
  const expenseTransactions = monthTransactions.filter(
    (transaction) => transaction.type === "expense",
  );
  const totalExpenses = expenseTransactions.reduce(
    (sum, transaction) => sum + toNumber(transaction.amount),
    0,
  );
  const grouped = new Map<
    string,
    {
      slug: string;
      label: string;
      amount: number;
    }
  >();

  expenseTransactions.forEach((transaction) => {
    const category = transaction.category_id
      ? categoryById.get(transaction.category_id)
      : null;
    const slug = category?.slug ?? "other";
    const label = category?.name ?? "Sin categoria";
    const current = grouped.get(slug);

    grouped.set(slug, {
      slug,
      label,
      amount: (current?.amount ?? 0) + toNumber(transaction.amount),
    });
  });

  return [...grouped.values()]
    .map((category) => {
      const matchingBudget = budgets.find((budget) => budget.slug === category.slug);

      return {
        slug: category.slug,
        label: category.label,
        amount: roundCurrency(category.amount),
        share: totalExpenses > 0 ? category.amount / totalExpenses : 0,
        budgetFill: matchingBudget ? category.amount / matchingBudget.limit : null,
      } satisfies CategoryInsight;
    })
    .sort((left, right) => right.amount - left.amount)
    .slice(0, 4);
}

function roundCurrency(value: number) {
  return Math.round(value);
}

function compactDescription(value: string) {
  return value.trim().slice(0, 48);
}

function formatDateOnly(date: Date) {
  return [
    date.getFullYear(),
    String(date.getMonth() + 1).padStart(2, "0"),
    String(date.getDate()).padStart(2, "0"),
  ].join("-");
}

function capitalize(value: string) {
  if (!value) {
    return value;
  }

  return value.charAt(0).toUpperCase() + value.slice(1);
}
