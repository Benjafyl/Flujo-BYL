import {
  budgetCategories,
  categoryInsights,
  formatCurrencyCLP,
  monthlySnapshot,
} from "@/lib/dashboard-data";
import type { FinanceAnswer } from "@/lib/finance-types";

export function answerFinanceQuestion(question: string): FinanceAnswer {
  const normalized = normalize(question);
  const hottestBudget = [...budgetCategories].sort(
    (left, right) => right.spent / right.limit - left.spent / left.limit,
  )[0];
  const biggestCategory = categoryInsights[0];

  if (mentionsAny(normalized, ["categoria", "gaste mas", "gasto mas", "mas se fue"])) {
    return {
      title: "Categoria principal del mes",
      summary: `${biggestCategory.label} va liderando con ${formatCurrencyCLP(biggestCategory.amount)}.`,
      bullets: [
        `Representa ${Math.round(biggestCategory.share * 100)}% de tus egresos actuales.`,
        `Cambio vs mes anterior: ${formatCurrencyCLP(biggestCategory.change)}.`,
        biggestCategory.description,
      ],
    };
  }

  if (mentionsAny(normalized, ["delivery", "presupuesto", "queda", "restante"])) {
    const delivery = budgetCategories.find((category) => category.slug === "delivery");
    const target = delivery ?? hottestBudget;
    const remaining = target.limit - target.spent;

    return {
      title: `Presupuesto en ${target.label}`,
      summary: `Te quedan ${formatCurrencyCLP(remaining)} antes de tocar el limite.`,
      bullets: [
        `Gastado: ${formatCurrencyCLP(target.spent)} de ${formatCurrencyCLP(target.limit)}.`,
        `Uso actual: ${Math.round((target.spent / target.limit) * 100)}%.`,
        target.note,
      ],
    };
  }

  if (mentionsAny(normalized, ["promedio", "diario", "dia"])) {
    return {
      title: "Promedio diario",
      summary: `Tu gasto promedio diario del mes va en ${formatCurrencyCLP(monthlySnapshot.dailyExpenseAverage)}.`,
      bullets: [
        `Ingresos del mes: ${formatCurrencyCLP(monthlySnapshot.income)}.`,
        `Egresos del mes: ${formatCurrencyCLP(monthlySnapshot.expenses)}.`,
        `Balance neto actual: ${formatCurrencyCLP(monthlySnapshot.balance)}.`,
      ],
    };
  }

  if (mentionsAny(normalized, ["ingreso", "entra", "ganando", "gane"])) {
    return {
      title: "Pulso de ingresos",
      summary: `Este mes han entrado ${formatCurrencyCLP(monthlySnapshot.income)}.`,
      bullets: [
        `Cambio vs mes anterior: ${formatCurrencyCLP(monthlySnapshot.incomeDelta)}.`,
        `Balance neto actual: ${formatCurrencyCLP(monthlySnapshot.balance)}.`,
        "Lo siguiente es conectar esto a transacciones reales para responder por rango de fechas.",
      ],
    };
  }

  return {
    title: "Lectura rapida del mes",
    summary: `${biggestCategory.label} es la categoria mas pesada y ${hottestBudget.label} es la que esta mas cerca del limite.`,
    bullets: [
      `Balance neto: ${formatCurrencyCLP(monthlySnapshot.balance)}.`,
      `${hottestBudget.label} lleva ${Math.round((hottestBudget.spent / hottestBudget.limit) * 100)}% del presupuesto.`,
      "Pregunta por categoria, restante, ingresos o promedio diario para una respuesta mas puntual.",
    ],
  };
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
