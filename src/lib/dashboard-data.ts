import type {
  AccountSnapshot,
  CategoryInsight,
  MonthlySnapshot,
  RecentTransaction,
  WeeklyFlowPoint,
} from "@/lib/finance-types";

export const monthlySnapshot: MonthlySnapshot = {
  income: 1_284_000,
  expenses: 718_500,
  balance: 565_500,
  incomeDelta: 134_000,
  expenseDelta: 66_500,
  balanceDelta: 67_500,
  budgetUsed: 0.62,
  dailyExpenseAverage: 23_950,
  reviewQueue: 2,
};

export const weeklyFlow: WeeklyFlowPoint[] = [
  { label: "Semana 1", income: 620_000, expense: 144_000 },
  { label: "Semana 2", income: 314_000, expense: 177_500 },
  { label: "Semana 3", income: 0, expense: 203_000 },
  { label: "Semana 4", income: 350_000, expense: 194_000 },
];

export const categoryInsights: CategoryInsight[] = [
  {
    slug: "supermarket",
    label: "Supermercado",
    amount: 201_000,
    share: 0.28,
    change: 34_500,
    budgetFill: 0.71,
    description: "La categoría más constante. Aquí conviene vigilar ticket promedio.",
  },
  {
    slug: "delivery",
    label: "Delivery / comida",
    amount: 132_000,
    share: 0.18,
    change: 29_000,
    budgetFill: 0.83,
    description: "Es donde más fácil se fuga dinero impulsivo en semanas pesadas.",
  },
  {
    slug: "transport",
    label: "Transporte",
    amount: 86_500,
    share: 0.12,
    change: -8_000,
    budgetFill: 0.58,
    description: "Bajó respecto al mes anterior. Buen candidato para automatizar reglas.",
  },
  {
    slug: "snacks",
    label: "Snacks / café",
    amount: 74_000,
    share: 0.1,
    change: 12_500,
    budgetFill: 0.88,
    description: "Gasto hormiga. Ideal para capturarlo por voz apenas pase.",
  },
];

export const recentTransactions: RecentTransaction[] = [
  {
    id: "tx_01",
    title: "iMark Los Carrera",
    description: "Compra semanal registrada por texto",
    amount: 24_800,
    type: "expense",
    category: "supermarket",
    account: "Débito principal",
    occurredAt: "Hoy · 13:42",
  },
  {
    id: "tx_02",
    title: "Pago freelance landing",
    description: "Transferencia recibida desde cliente",
    amount: 350_000,
    type: "income",
    category: "freelance",
    account: "Cuenta corriente",
    occurredAt: "Ayer · 10:18",
  },
  {
    id: "tx_03",
    title: "Café en la universidad",
    description: "Registrado desde audio, clasificación semi automática",
    amount: 4_500,
    type: "expense",
    category: "snacks",
    account: "Efectivo",
    occurredAt: "Ayer · 09:05",
    needsReview: true,
  },
  {
    id: "tx_04",
    title: "Uber a casa",
    description: "Categoría resuelta por merchant alias",
    amount: 7_400,
    type: "expense",
    category: "transport",
    account: "Débito principal",
    occurredAt: "Lun · 22:19",
  },
];

export const accountSnapshots: AccountSnapshot[] = [
  {
    name: "Cuenta corriente",
    balance: 426_300,
    note: "Cuenta operativa principal",
  },
  {
    name: "Débito principal",
    balance: 109_200,
    note: "La que más usarás para el día a día",
  },
  {
    name: "Efectivo",
    balance: 30_000,
    note: "Fondo chico para universidad o gastos imprevistos",
  },
];

export const demoVoiceExamples = [
  "Gasté 2.000 en iMark",
  "Compré un café en la universidad por 4.500",
  "Me llegaron 350 mil de pago freelance",
];

export const parserChecklist = [
  "Detectar tipo: ingreso, egreso o transferencia.",
  "Extraer montos chilenos como 2.000, 350 mil o 4 lucas.",
  "Normalizar merchants frecuentes como iMark, Uber o Starbucks.",
  "Clasificar por reglas primero y mandar a IA solo cuando haga falta.",
  "Marcar como revisión solo cuando la confianza no sea suficiente.",
];

const currencyFormatter = new Intl.NumberFormat("es-CL", {
  style: "currency",
  currency: "CLP",
  maximumFractionDigits: 0,
});

export function formatCurrencyCLP(value: number) {
  return currencyFormatter.format(value);
}

export function formatSignedCurrencyCLP(value: number) {
  const prefix = value > 0 ? "+" : "";

  return `${prefix}${formatCurrencyCLP(value)}`;
}
