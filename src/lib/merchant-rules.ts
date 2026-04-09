import type { CategorySlug, MerchantRule } from "@/lib/finance-types";

export const categoryMeta: Record<
  CategorySlug,
  {
    label: string;
    ink: string;
    soft: string;
  }
> = {
  salary: { label: "Sueldo", ink: "#0c7c59", soft: "rgba(12,124,89,0.14)" },
  freelance: { label: "Freelance", ink: "#14532d", soft: "rgba(34,197,94,0.15)" },
  refund: { label: "Reembolso", ink: "#065f46", soft: "rgba(16,185,129,0.14)" },
  sale: { label: "Venta", ink: "#166534", soft: "rgba(74,222,128,0.15)" },
  transfer_in: { label: "Transferencia", ink: "#0f766e", soft: "rgba(45,212,191,0.15)" },
  supermarket: { label: "Supermercado", ink: "#0f766e", soft: "rgba(45,212,191,0.16)" },
  snacks: { label: "Snacks / Café", ink: "#9a3412", soft: "rgba(251,146,60,0.16)" },
  delivery: { label: "Delivery", ink: "#c2410c", soft: "rgba(249,115,22,0.17)" },
  transport: { label: "Transporte", ink: "#1d4ed8", soft: "rgba(96,165,250,0.16)" },
  education: { label: "Universidad / Estudio", ink: "#7c3aed", soft: "rgba(167,139,250,0.16)" },
  home: { label: "Hogar", ink: "#374151", soft: "rgba(148,163,184,0.18)" },
  health: { label: "Salud", ink: "#be123c", soft: "rgba(251,113,133,0.16)" },
  subscriptions: { label: "Suscripciones", ink: "#6d28d9", soft: "rgba(196,181,253,0.19)" },
  leisure: { label: "Ocio", ink: "#4338ca", soft: "rgba(129,140,248,0.16)" },
  shopping: { label: "Compras", ink: "#b45309", soft: "rgba(253,186,116,0.18)" },
  gifts: { label: "Regalos", ink: "#be185d", soft: "rgba(244,114,182,0.17)" },
  other: { label: "Otros", ink: "#334155", soft: "rgba(148,163,184,0.18)" },
};

export const merchantRules: MerchantRule[] = [
  {
    keywords: ["imark", "unimarc", "lider", "jumbo", "tottus", "santa isabel"],
    merchant: "Supermercado",
    category: "supermarket",
    type: "expense",
  },
  {
    keywords: ["starbucks", "cafe", "cafeteria", "coffee", "nescafe"],
    merchant: "Cafetería",
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
    keywords: ["notion", "spotify", "netflix", "youtube premium", "icloud"],
    merchant: "Suscripción",
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
    keywords: ["freelance", "cliente", "honorario"],
    merchant: "Ingreso freelance",
    category: "freelance",
    type: "income",
  },
  {
    keywords: ["sueldo", "salario", "pago empresa", "remuneracion"],
    merchant: "Sueldo",
    category: "salary",
    type: "income",
  },
];
