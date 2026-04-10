import { formatCurrencyCLP } from "@/lib/dashboard-data";
import type { DashboardData, FinanceAnswer } from "@/lib/finance-types";

export function answerFinanceQuestion(
  question: string,
  data: DashboardData,
): FinanceAnswer {
  const normalized = normalize(question);

  if (!data.hasTransactions) {
    return {
      title: "Todavia no hay base para analizar",
      summary:
        "Aun no tienes movimientos registrados este mes, asi que primero conviene capturar tus gastos o ingresos.",
      bullets: [
        "La captura manual y por voz ya guarda directo.",
        "Tus cuentas base ya estan listas para partir.",
        "Apenas registres movimientos, este analista respondera sobre datos reales.",
      ],
    };
  }

  if (mentionsAny(normalized, ["tenpo", "deuda", "credito"])) {
    const tenpoAccount = data.accountSnapshots.find((account) =>
      [account.name, account.institution ?? ""].join(" ").toLowerCase().includes("tenpo"),
    );

    if (tenpoAccount) {
      return {
        title: "Estado de Tenpo",
        summary:
          tenpoAccount.balance < 0
            ? `La deuda actual registrada en Tenpo es ${formatCurrencyCLP(Math.abs(tenpoAccount.balance))}.`
            : "Tenpo no muestra deuda registrada ahora mismo.",
        bullets: [
          `Balance actual: ${formatCurrencyCLP(tenpoAccount.balance)}.`,
          tenpoAccount.creditLimit > 0
            ? `Cupo registrado: ${formatCurrencyCLP(tenpoAccount.creditLimit)}.`
            : "No hay cupo cargado para esa cuenta.",
          tenpoAccount.note,
        ],
      };
    }
  }

  const budgetMatch = findBudgetMatch(normalized, data);
  if (budgetMatch) {
    const remaining = budgetMatch.limit - budgetMatch.spent;

    return {
      title: `Presupuesto en ${budgetMatch.label}`,
      summary: `Te quedan ${formatCurrencyCLP(remaining)} antes de llegar al limite cargado.`,
      bullets: [
        `Gastado: ${formatCurrencyCLP(budgetMatch.spent)} de ${formatCurrencyCLP(budgetMatch.limit)}.`,
        `Uso actual: ${Math.round((budgetMatch.spent / budgetMatch.limit) * 100)}%.`,
        budgetMatch.note,
      ],
    };
  }

  if (mentionsAny(normalized, ["categoria", "gaste mas", "gasto mas", "mas se fue"])) {
    const biggestCategory = data.categoryInsights[0];

    if (biggestCategory) {
      return {
        title: "Categoria principal del mes",
        summary: `${biggestCategory.label} lidera con ${formatCurrencyCLP(biggestCategory.amount)}.`,
        bullets: [
          `Representa ${Math.round(biggestCategory.share * 100)}% de tus egresos actuales.`,
          biggestCategory.budgetFill !== null
            ? `Va en ${Math.round(biggestCategory.budgetFill * 100)}% del limite definido.`
            : "Esa categoria no tiene limite cargado todavia.",
          "Si quieres mejor control, fija un presupuesto directo en esa categoria.",
        ],
      };
    }
  }

  if (mentionsAny(normalized, ["ingreso", "finiquito", "interchileclima"])) {
    return {
      title: "Pulso de ingresos",
      summary: `Este mes llevas ${formatCurrencyCLP(data.monthlySnapshot.income)} en ingresos registrados.`,
      bullets: [
        `Balance neto actual: ${formatCurrencyCLP(data.monthlySnapshot.balance)}.`,
        `Movimientos del mes: ${data.monthlySnapshot.transactionCount}.`,
        "Si quieres ver mejor el finiquito, registra cada cuota apenas entre.",
      ],
    };
  }

  return {
    title: "Lectura rapida del mes",
    summary: `Vas en ${formatCurrencyCLP(data.monthlySnapshot.expenses)} de egresos y ${formatCurrencyCLP(data.monthlySnapshot.income)} de ingresos.`,
    bullets: [
      `Balance neto: ${formatCurrencyCLP(data.monthlySnapshot.balance)}.`,
      `Promedio diario: ${formatCurrencyCLP(data.monthlySnapshot.dailyExpenseAverage)}.`,
      `Cuentas activas cargadas: ${data.accountSnapshots.length}.`,
    ],
  };
}

function findBudgetMatch(normalizedQuestion: string, data: DashboardData) {
  const exactBudget = data.budgetCategories.find((budget) =>
    normalize(`${budget.label} ${budget.slug}`).includes(normalizedQuestion),
  );

  if (exactBudget) {
    return exactBudget;
  }

  return data.budgetCategories.find((budget) =>
    normalizedQuestion.includes(normalize(budget.label)) ||
    normalizedQuestion.includes(normalize(budget.slug)),
  );
}

function normalize(value: string) {
  return value
    .normalize("NFD")
    .replace(/\p{Diacritic}/gu, "")
    .toLowerCase()
    .trim();
}

function mentionsAny(input: string, needles: string[]) {
  return needles.some((needle) => input.includes(needle));
}
