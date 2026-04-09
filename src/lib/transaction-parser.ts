import type {
  CategorySlug,
  ParsedTransactionCandidate,
  TransactionType,
} from "@/lib/finance-types";
import { merchantRules } from "@/lib/merchant-rules";

const INCOME_HINTS = ["me llegaron", "ingrese", "ingresé", "recibi", "recibí", "pago", "deposito", "depósito"];
const EXPENSE_HINTS = ["gaste", "gasté", "pague", "pagué", "compre", "compré", "salio", "salió"];
const TRANSFER_HINTS = ["transferi", "transferí", "movi", "moví", "pasé"];

export function parseTransactionInput(input: string): ParsedTransactionCandidate {
  const normalizedText = normalizeText(input);
  const amount = extractAmount(normalizedText);
  const type = inferType(normalizedText);
  const merchantMatch = matchMerchantRule(normalizedText);
  const merchant = merchantMatch?.merchant ?? extractMerchantFallback(normalizedText);
  const category = merchantMatch?.category ?? inferCategory(normalizedText, type);

  let confidence = 0.32;
  if (amount !== null) confidence += 0.26;
  if (type !== "expense" || EXPENSE_HINTS.some((hint) => normalizedText.includes(hint))) {
    confidence += 0.16;
  }
  if (merchant) confidence += 0.08;
  if (category) confidence += 0.1;
  if (merchantMatch) confidence += 0.12;
  if (normalizedText.split(" ").length >= 4) confidence += 0.05;

  confidence = Math.min(confidence, 0.98);

  const needsReview = confidence < 0.9;
  const explanation = buildExplanation({
    amount,
    type,
    merchant,
    category,
    needsReview,
    merchantMatched: Boolean(merchantMatch),
  });

  return {
    input,
    normalizedText,
    amount,
    type,
    merchant,
    category,
    confidence,
    needsReview,
    explanation,
  };
}

function normalizeText(input: string) {
  return input
    .normalize("NFD")
    .replace(/\p{Diacritic}/gu, "")
    .toLowerCase()
    .replace(/[^\p{L}\p{N}\s.,]/gu, " ")
    .replace(/\s+/g, " ")
    .trim();
}

function inferType(normalizedText: string): TransactionType {
  if (TRANSFER_HINTS.some((hint) => normalizedText.includes(hint))) {
    return "transfer";
  }

  if (INCOME_HINTS.some((hint) => normalizedText.includes(hint))) {
    return "income";
  }

  return "expense";
}

function extractAmount(normalizedText: string): number | null {
  const match = normalizedText.match(
    /(\d{1,3}(?:[.\s]\d{3})+|\d+(?:[.,]\d+)?)(?:\s*)(luca|lucas|mil|k)?/,
  );

  if (!match) {
    return null;
  }

  const rawNumber = match[1];
  const rawUnit = match[2] ?? "";

  let value = rawNumber.includes(".")
    ? Number(rawNumber.replace(/\./g, "").replace(",", "."))
    : Number(rawNumber.replace(",", "."));

  if (Number.isNaN(value)) {
    return null;
  }

  if (rawUnit === "mil" || rawUnit === "k") {
    value *= 1_000;
  }

  if (rawUnit === "luca" || rawUnit === "lucas") {
    value *= 1_000;
  }

  return Math.round(value);
}

function matchMerchantRule(normalizedText: string) {
  return merchantRules.find((rule) =>
    rule.keywords.some((keyword) => normalizedText.includes(keyword)),
  );
}

function extractMerchantFallback(normalizedText: string) {
  const match = normalizedText.match(
    /\b(?:en|por|de|desde|para)\s+([a-z0-9\s]{2,40})$/,
  );

  if (!match) {
    return null;
  }

  return toTitleCase(match[1].trim());
}

function inferCategory(
  normalizedText: string,
  type: TransactionType,
): CategorySlug | null {
  if (type === "income") {
    if (normalizedText.includes("freelance") || normalizedText.includes("honorario")) {
      return "freelance";
    }

    if (normalizedText.includes("sueldo") || normalizedText.includes("salario")) {
      return "salary";
    }

    if (normalizedText.includes("reembolso")) {
      return "refund";
    }

    return "transfer_in";
  }

  if (normalizedText.includes("cafe") || normalizedText.includes("sandwich")) {
    return "snacks";
  }

  if (
    normalizedText.includes("universidad") ||
    normalizedText.includes("campus") ||
    normalizedText.includes("matricula")
  ) {
    return "education";
  }

  if (normalizedText.includes("uber") || normalizedText.includes("micro")) {
    return "transport";
  }

  if (
    normalizedText.includes("supermercado") ||
    normalizedText.includes("mercado")
  ) {
    return "supermarket";
  }

  return null;
}

function buildExplanation({
  amount,
  type,
  merchant,
  category,
  needsReview,
  merchantMatched,
}: {
  amount: number | null;
  type: TransactionType;
  merchant: string | null;
  category: CategorySlug | null;
  needsReview: boolean;
  merchantMatched: boolean;
}) {
  const fragments = [
    amount ? `Detecté monto ${amount}.` : "No pude detectar el monto con certeza.",
    `Lo interpreté como ${type === "income" ? "ingreso" : type === "transfer" ? "transferencia" : "egreso"}.`,
    merchant
      ? merchantMatched
        ? `El comercio coincide con una regla conocida: ${merchant}.`
        : `El merchant sugerido es ${merchant}.`
      : "No hubo un comercio inequívoco en el texto.",
    category ? `La categoría propuesta es ${category}.` : "No hubo categoría concluyente.",
    needsReview
      ? "La confianza todavía es media, así que conviene mostrar confirmación."
      : "La confianza es alta y el movimiento podría auto-registrarse.",
  ];

  return fragments.join(" ");
}

function toTitleCase(value: string) {
  return value.replace(/\b\w/g, (letter) => letter.toUpperCase());
}
