import type {
  CategorySlug,
  ParsedTransactionCandidate,
  TransactionType,
} from "@/lib/finance-types";
import { merchantRules } from "@/lib/merchant-rules";

const INCOME_HINTS = [
  "me llegaron",
  "ingrese",
  "recibi",
  "pago",
  "deposito",
  "abono",
  "transferencia recibida",
];

const EXPENSE_HINTS = [
  "gaste",
  "pague",
  "compre",
  "salio",
  "me cobraron",
  "me costo",
];

const TRANSFER_HINTS = ["transferi", "movi", "pase", "traspase"];

export function parseTransactionInput(input: string): ParsedTransactionCandidate {
  const normalizedText = normalizeText(input);
  const amount = extractAmount(normalizedText);
  const matchedMerchantRule = matchMerchantRule(normalizedText);
  const inferredType = inferType(normalizedText);
  const type =
    inferredType === "expense" && matchedMerchantRule?.type
      ? matchedMerchantRule.type
      : inferredType;
  const merchant =
    matchedMerchantRule?.merchant ?? extractMerchantFallback(normalizedText);
  const category =
    matchedMerchantRule?.category ?? inferCategory(normalizedText, type);
  const occurredAt = detectOccurredAt(normalizedText);

  let confidence = 0.32;
  if (amount !== null) confidence += 0.24;
  if (EXPENSE_HINTS.some((hint) => normalizedText.includes(hint))) confidence += 0.12;
  if (INCOME_HINTS.some((hint) => normalizedText.includes(hint))) confidence += 0.12;
  if (merchant) confidence += 0.08;
  if (category) confidence += 0.1;
  if (matchedMerchantRule) confidence += 0.12;
  if (occurredAt) confidence += 0.05;
  if (normalizedText.split(" ").length >= 4) confidence += 0.05;

  confidence = Math.min(confidence, 0.98);

  const needsReview = confidence < 0.9;
  const explanation = buildExplanation({
    amount,
    type,
    merchant,
    category,
    needsReview,
    merchantMatched: Boolean(matchedMerchantRule),
    detectedDateLabel: occurredAt?.label ?? null,
  });

  return {
    input,
    normalizedText,
    amount,
    type,
    merchant,
    category,
    occurredAtIso: occurredAt?.iso ?? null,
    detectedDateLabel: occurredAt?.label ?? null,
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
    .replace(/[^\p{L}\p{N}\s.,/$-]/gu, " ")
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

  if (rawUnit === "mil" || rawUnit === "k" || rawUnit === "luca" || rawUnit === "lucas") {
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
  const trailingMatch = normalizedText.match(
    /\b(?:en|por|de|desde|para)\s+([a-z0-9\s]{2,40})$/,
  );

  if (trailingMatch) {
    return toTitleCase(trailingMatch[1].trim());
  }

  const inlineMatch = normalizedText.match(
    /\b(?:gaste|pague|compre|recibi|ingrese)\s+(?:\d{1,3}(?:[.\s]\d{3})+|\d+(?:[.,]\d+)?)\s+(?:luca|lucas|mil|k)?\s*(?:en|por|de)\s+([a-z0-9\s]{2,40})/,
  );

  if (!inlineMatch) {
    return null;
  }

  return toTitleCase(inlineMatch[1].trim());
}

function inferCategory(
  normalizedText: string,
  type: TransactionType,
): CategorySlug | null {
  if (type === "income") {
    if (normalizedText.includes("freelance") || normalizedText.includes("honorario")) {
      return "freelance";
    }

    if (
      normalizedText.includes("sueldo") ||
      normalizedText.includes("salario") ||
      normalizedText.includes("remuneracion")
    ) {
      return "salary";
    }

    if (normalizedText.includes("reembolso")) {
      return "refund";
    }

    return "transfer_in";
  }

  if (
    normalizedText.includes("supermercado") ||
    normalizedText.includes("mercado") ||
    normalizedText.includes("compra semanal")
  ) {
    return "supermarket";
  }

  if (
    normalizedText.includes("cafe") ||
    normalizedText.includes("cafeteria") ||
    normalizedText.includes("sandwich") ||
    normalizedText.includes("snack")
  ) {
    return "snacks";
  }

  if (
    normalizedText.includes("delivery") ||
    normalizedText.includes("almuerzo") ||
    normalizedText.includes("comida") ||
    normalizedText.includes("pedido")
  ) {
    return "delivery";
  }

  if (
    normalizedText.includes("uber") ||
    normalizedText.includes("cabify") ||
    normalizedText.includes("micro") ||
    normalizedText.includes("metro") ||
    normalizedText.includes("bip")
  ) {
    return "transport";
  }

  if (
    normalizedText.includes("universidad") ||
    normalizedText.includes("campus") ||
    normalizedText.includes("matricula") ||
    normalizedText.includes("fotocopia") ||
    normalizedText.includes("libro")
  ) {
    return "education";
  }

  if (
    normalizedText.includes("cine") ||
    normalizedText.includes("pelicula") ||
    normalizedText.includes("entrada") ||
    normalizedText.includes("juego")
  ) {
    return "leisure";
  }

  if (
    normalizedText.includes("spotify") ||
    normalizedText.includes("netflix") ||
    normalizedText.includes("suscripcion") ||
    normalizedText.includes("icloud")
  ) {
    return "subscriptions";
  }

  if (
    normalizedText.includes("farmacia") ||
    normalizedText.includes("medicamento") ||
    normalizedText.includes("consulta")
  ) {
    return "health";
  }

  if (
    normalizedText.includes("ropa") ||
    normalizedText.includes("zapatilla") ||
    normalizedText.includes("polera") ||
    normalizedText.includes("jeans")
  ) {
    return "shopping";
  }

  if (
    normalizedText.includes("arriendo") ||
    normalizedText.includes("hogar") ||
    normalizedText.includes("mueble")
  ) {
    return "home";
  }

  return null;
}

function detectOccurredAt(normalizedText: string) {
  if (normalizedText.includes("ayer") || normalizedText.includes("anoche")) {
    const date = new Date();
    date.setDate(date.getDate() - 1);

    return {
      label: "Ayer",
      iso: buildMiddayIso(date),
    };
  }

  if (
    normalizedText.includes("hoy") ||
    normalizedText.includes("recien") ||
    normalizedText.includes("ahora")
  ) {
    const date = new Date();

    return {
      label: "Hoy",
      iso: buildMiddayIso(date),
    };
  }

  const explicitMatch = normalizedText.match(
    /\b(\d{1,2})[/-](\d{1,2})(?:[/-](\d{2,4}))?\b/,
  );

  if (!explicitMatch) {
    return null;
  }

  const day = Number(explicitMatch[1]);
  const month = Number(explicitMatch[2]) - 1;
  const year = explicitMatch[3]
    ? normalizeYear(Number(explicitMatch[3]))
    : new Date().getFullYear();

  const date = new Date(year, month, day, 12, 0, 0);

  if (Number.isNaN(date.getTime())) {
    return null;
  }

  return {
    label: `${String(day).padStart(2, "0")}/${String(month + 1).padStart(2, "0")}`,
    iso: date.toISOString(),
  };
}

function normalizeYear(year: number) {
  if (year < 100) {
    return 2000 + year;
  }

  return year;
}

function buildExplanation({
  amount,
  type,
  merchant,
  category,
  needsReview,
  merchantMatched,
  detectedDateLabel,
}: {
  amount: number | null;
  type: TransactionType;
  merchant: string | null;
  category: CategorySlug | null;
  needsReview: boolean;
  merchantMatched: boolean;
  detectedDateLabel: string | null;
}) {
  const fragments = [
    amount ? `Detecte monto ${amount}.` : "No pude detectar el monto con certeza.",
    `Lo interprete como ${renderType(type)}.`,
    detectedDateLabel
      ? `La fecha sugerida es ${detectedDateLabel}.`
      : "Asumi que el movimiento corresponde a hoy si se confirma.",
    merchant
      ? merchantMatched
        ? `El comercio coincide con una regla conocida: ${merchant}.`
        : `El merchant sugerido es ${merchant}.`
      : "No hubo un comercio inequivoco en el texto.",
    category ? `La categoria propuesta es ${category}.` : "No hubo categoria concluyente.",
    needsReview
      ? "La confianza todavia es media, asi que conviene mostrar confirmacion."
      : "La confianza es alta y el movimiento podria auto-registrarse.",
  ];

  return fragments.join(" ");
}

function renderType(type: TransactionType) {
  if (type === "income") {
    return "ingreso";
  }

  if (type === "transfer") {
    return "transferencia";
  }

  return "egreso";
}

function buildMiddayIso(date: Date) {
  return new Date(
    date.getFullYear(),
    date.getMonth(),
    date.getDate(),
    12,
    0,
    0,
    0,
  ).toISOString();
}

function toTitleCase(value: string) {
  return value.replace(/\b\w/g, (letter) => letter.toUpperCase());
}
