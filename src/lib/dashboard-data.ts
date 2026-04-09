import type {
  AccountSnapshot,
  AutomationMethod,
  BudgetCategory,
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
    description: "Tu categoria mas constante. Aqui conviene vigilar ticket promedio.",
  },
  {
    slug: "delivery",
    label: "Delivery / comida",
    amount: 132_000,
    share: 0.18,
    change: 29_000,
    budgetFill: 0.83,
    description: "El punto mas sensible cuando hay cansancio o semanas desordenadas.",
  },
  {
    slug: "transport",
    label: "Transporte",
    amount: 86_500,
    share: 0.12,
    change: -8_000,
    budgetFill: 0.58,
    description: "Buen candidato para automatizar desde Wallet o mensajes del banco.",
  },
  {
    slug: "snacks",
    label: "Snacks / cafe",
    amount: 74_000,
    share: 0.1,
    change: 12_500,
    budgetFill: 0.88,
    description: "Gasto hormiga. Aqui la captura por voz vale oro.",
  },
];

export const budgetCategories: BudgetCategory[] = [
  {
    slug: "supermarket",
    label: "Supermercado",
    spent: 201_000,
    limit: 280_000,
    note: "Compra semanal y reposicion basica.",
  },
  {
    slug: "delivery",
    label: "Delivery / comida",
    spent: 132_000,
    limit: 160_000,
    note: "Mantener este numero bajo control cambia el mes completo.",
  },
  {
    slug: "snacks",
    label: "Snacks / cafe",
    spent: 74_000,
    limit: 84_000,
    note: "Aqui es clave ver el restante antes de aceptar otro cafe.",
  },
  {
    slug: "transport",
    label: "Transporte",
    spent: 86_500,
    limit: 150_000,
    note: "Espacio sano para micro, uber y viajes puntuales.",
  },
];

export const recentTransactions: RecentTransaction[] = [
  {
    id: "tx_01",
    title: "iMark Los Carrera",
    description: "Compra semanal registrada por texto natural",
    amount: 24_800,
    type: "expense",
    category: "supermarket",
    account: "Debito principal",
    occurredAt: "Hoy - 13:42",
  },
  {
    id: "tx_02",
    title: "Pago freelance landing",
    description: "Transferencia recibida desde cliente",
    amount: 350_000,
    type: "income",
    category: "freelance",
    account: "Cuenta corriente",
    occurredAt: "Ayer - 10:18",
  },
  {
    id: "tx_03",
    title: "Cafe en la universidad",
    description: "Entrada creada por voz y marcada para revisar",
    amount: 4_500,
    type: "expense",
    category: "snacks",
    account: "Efectivo",
    occurredAt: "Ayer - 09:05",
    needsReview: true,
  },
  {
    id: "tx_04",
    title: "Uber a casa",
    description: "Categoria resuelta por merchant alias",
    amount: 7_400,
    type: "expense",
    category: "transport",
    account: "Debito principal",
    occurredAt: "Lun - 22:19",
  },
];

export const accountSnapshots: AccountSnapshot[] = [
  {
    name: "Cuenta corriente",
    balance: 426_300,
    note: "Cuenta operativa principal",
  },
  {
    name: "Debito principal",
    balance: 109_200,
    note: "La cuenta mas usada en el dia a dia",
  },
  {
    name: "Efectivo",
    balance: 30_000,
    note: "Caja chica para campus y gastos chicos",
  },
];

export const automationMethods: AutomationMethod[] = [
  {
    id: "apple-pay",
    title: "Apple Pay -> Shortcut -> FLUJO",
    description:
      "La app recibe una nota automatica inmediatamente despues del pago y la convierte en una transaccion preliminar.",
    bullets: [
      "Disparo instantaneo post-pago.",
      "Sin abrir la app si no hace falta.",
      "Ideal para el flujo que mas te interesa.",
    ],
    footnote: "Requiere un Atajo de iPhone que llame al webhook de FLUJO BYL.",
  },
  {
    id: "voice-button",
    title: "Boton de voz",
    description:
      "Dictas el gasto al momento y el parser detecta monto, merchant, categoria y confianza.",
    bullets: [
      "Registro manos libres.",
      "Detecta fechas como hoy o ayer.",
      "Muestra cuanto presupuesto quedaria.",
    ],
    footnote: "Hoy se puede probar en web/PWA con reconocimiento de voz del navegador.",
  },
  {
    id: "message-trigger",
    title: "Mensaje o confirmacion",
    description:
      "Una confirmacion de compra o un mensaje tuyo puede entrar al webhook y pasar por el mismo parser.",
    bullets: [
      "Sirve para SMS del banco o mensajes guardados.",
      "Comparte el mismo motor de normalizacion.",
      "Te deja una sola capa backend para automatizaciones.",
    ],
    footnote: "Es el siguiente candidato despues de Apple Pay.",
  },
];

export const askFinancePrompts = [
  "En que categoria gaste mas este mes?",
  "Cuanto me queda en delivery?",
  "Que categoria esta mas cerca del limite?",
];

export const captureExamples = [
  "Gaste 2.000 en iMark",
  "Compre un cafe en la universidad por 4.500",
  "Me llegaron 350 mil de pago freelance",
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

export function findBudgetByCategory(slug?: string | null) {
  if (!slug) {
    return null;
  }

  return budgetCategories.find((category) => category.slug === slug) ?? null;
}
