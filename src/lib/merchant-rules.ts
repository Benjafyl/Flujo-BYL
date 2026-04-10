import type { MerchantRule } from "@/lib/finance-types";

const categoryStyles: Record<
  string,
  {
    label: string;
    ink: string;
    soft: string;
  }
> = {
  salary: { label: "Sueldo", ink: "#0c7c59", soft: "rgba(12,124,89,0.14)" },
  freelance: { label: "Freelance", ink: "#14532d", soft: "rgba(34,197,94,0.15)" },
  severance: {
    label: "Finiquito",
    ink: "#14532d",
    soft: "rgba(74,222,128,0.15)",
  },
  refund: { label: "Reembolso", ink: "#065f46", soft: "rgba(16,185,129,0.14)" },
  sale: { label: "Venta", ink: "#166534", soft: "rgba(74,222,128,0.15)" },
  transfer_in: {
    label: "Transferencia",
    ink: "#0f766e",
    soft: "rgba(45,212,191,0.15)",
  },
  supermarket: {
    label: "Supermercado",
    ink: "#0f766e",
    soft: "rgba(45,212,191,0.16)",
  },
  snacks: { label: "Snacks / Cafe", ink: "#9a3412", soft: "rgba(251,146,60,0.16)" },
  delivery: { label: "Delivery", ink: "#c2410c", soft: "rgba(249,115,22,0.17)" },
  transport: { label: "Transporte", ink: "#1d4ed8", soft: "rgba(96,165,250,0.16)" },
  education: {
    label: "Universidad / Estudio",
    ink: "#7c3aed",
    soft: "rgba(167,139,250,0.16)",
  },
  home: { label: "Hogar", ink: "#374151", soft: "rgba(148,163,184,0.18)" },
  utilities: {
    label: "Servicios basicos",
    ink: "#155e75",
    soft: "rgba(103,232,249,0.18)",
  },
  internet: { label: "Internet", ink: "#0369a1", soft: "rgba(56,189,248,0.16)" },
  condo_fees: {
    label: "Gasto comun",
    ink: "#475569",
    soft: "rgba(148,163,184,0.18)",
  },
  debt: { label: "Deuda / credito", ink: "#7f1d1d", soft: "rgba(252,165,165,0.18)" },
  health: { label: "Salud", ink: "#be123c", soft: "rgba(251,113,133,0.16)" },
  subscriptions: {
    label: "Suscripciones",
    ink: "#6d28d9",
    soft: "rgba(196,181,253,0.19)",
  },
  leisure: { label: "Ocio", ink: "#4338ca", soft: "rgba(129,140,248,0.16)" },
  shopping: { label: "Compras", ink: "#b45309", soft: "rgba(253,186,116,0.18)" },
  gifts: { label: "Regalos", ink: "#be185d", soft: "rgba(244,114,182,0.17)" },
  other: { label: "Otros", ink: "#334155", soft: "rgba(148,163,184,0.18)" },
};

export function getCategoryAppearance(
  slug: string | null | undefined,
  fallbackLabel?: string | null,
) {
  if (!slug) {
    return {
      label: fallbackLabel ?? "Sin categoria",
      ink: "#334155",
      soft: "rgba(148,163,184,0.18)",
    };
  }

  const match = categoryStyles[slug];

  if (match) {
    return match;
  }

  return {
    label: fallbackLabel ?? humanizeSlug(slug),
    ink: "#334155",
    soft: "rgba(148,163,184,0.18)",
  };
}

export const merchantRules: MerchantRule[] = [
  {
    keywords: ["imark", "unimarc", "lider", "jumbo", "tottus", "santa isabel"],
    merchant: "Supermercado",
    category: "supermarket",
    type: "expense",
  },
  {
    keywords: ["starbucks", "cafe", "cafeteria", "coffee", "nescafe"],
    merchant: "Cafeteria",
    category: "snacks",
    type: "expense",
  },
  {
    keywords: ["universidad", "campus", "casino u", "casino", "fotocopia", "libro"],
    merchant: "Universidad",
    category: "education",
    type: "expense",
  },
  {
    keywords: ["uber", "cabify", "micro", "bus", "metro", "bip"],
    merchant: "Transporte",
    category: "transport",
    type: "expense",
  },
  {
    keywords: ["rappi", "pedidos ya", "uber eats", "delivery"],
    merchant: "Delivery",
    category: "delivery",
    type: "expense",
  },
  {
    keywords: ["cine", "cinemark", "movie", "pelicula"],
    merchant: "Panorama",
    category: "leisure",
    type: "expense",
  },
  {
    keywords: ["notion", "spotify", "netflix", "youtube premium", "icloud"],
    merchant: "Suscripcion",
    category: "subscriptions",
    type: "expense",
  },
  {
    keywords: ["farmacia", "cruz verde", "salcobrand"],
    merchant: "Farmacia",
    category: "health",
    type: "expense",
  },
  {
    keywords: ["gasto comun", "gasto común", "edificio", "condominio"],
    merchant: "Gasto comun",
    category: "condo_fees",
    type: "expense",
  },
  {
    keywords: ["agua", "luz", "electricidad", "servicios basicos", "servicios básicos"],
    merchant: "Servicios basicos",
    category: "utilities",
    type: "expense",
  },
  {
    keywords: ["internet", "mundo", "movistar hogar", "vtr", "entel hogar"],
    merchant: "Internet",
    category: "internet",
    type: "expense",
  },
  {
    keywords: ["tenpo", "credito tenpo", "crédito tenpo"],
    merchant: "Tenpo",
    category: "debt",
    type: "expense",
  },
  {
    keywords: ["freelance", "cliente", "honorario"],
    merchant: "Ingreso freelance",
    category: "freelance",
    type: "income",
  },
  {
    keywords: ["finiquito", "interchileclima", "indemnizacion", "indemnización"],
    merchant: "Interchileclima",
    category: "severance",
    type: "income",
  },
  {
    keywords: ["sueldo", "salario", "pago empresa", "remuneracion"],
    merchant: "Sueldo",
    category: "salary",
    type: "income",
  },
];

function humanizeSlug(value: string) {
  return value
    .split("_")
    .map((chunk) => chunk.charAt(0).toUpperCase() + chunk.slice(1))
    .join(" ");
}
