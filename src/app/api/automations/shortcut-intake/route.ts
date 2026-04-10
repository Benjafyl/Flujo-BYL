import { NextResponse } from "next/server";
import { z } from "zod";

import { savePersonalTransaction } from "@/lib/personal-finance";
import { parseTransactionInput } from "@/lib/transaction-parser";

const requestSchema = z
  .object({
    text: z.string().min(2).max(240).optional(),
    merchant: z.string().min(2).max(120).optional(),
    amount: z.number().positive().max(999999999).optional(),
    currency: z.string().min(3).max(3).optional(),
    occurredAt: z.string().datetime().optional(),
    note: z.string().min(2).max(240).optional(),
    source: z.enum(["apple_pay", "shortcut", "voice_button", "message"]).optional(),
    device: z.string().min(2).max(80).optional(),
    webhookSecret: z.string().min(1).optional(),
  })
  .refine(
    (value) => Boolean(value.text?.trim()) || Boolean(value.merchant && value.amount),
    {
      message: "Debes enviar text o bien merchant + amount.",
      path: ["text"],
    },
  );

export async function POST(request: Request) {
  const payload = await request.json().catch(() => null);
  const parsedBody = requestSchema.safeParse(payload);

  if (!parsedBody.success) {
    return NextResponse.json(
      {
        error: "Solicitud invalida",
        details: parsedBody.error.flatten(),
      },
      { status: 400 },
    );
  }

  const headerSecret = request.headers.get("x-shortcut-secret");
  const providedSecret = parsedBody.data.webhookSecret ?? headerSecret;
  const configuredSecret = process.env.SHORTCUTS_WEBHOOK_SECRET;

  if (configuredSecret && providedSecret !== configuredSecret) {
    return NextResponse.json(
      {
        error: "Webhook no autorizado",
      },
      { status: 401 },
    );
  }

  const captureText = composeCaptureText(parsedBody.data);
  const parsedTransaction = parseTransactionInput(captureText);
  const occurredAt = parsedBody.data.occurredAt ?? parsedTransaction.occurredAtIso;

  if (!parsedTransaction.amount) {
    return NextResponse.json(
      {
        error: "No pude detectar un monto para registrar desde el atajo.",
      },
      { status: 422 },
    );
  }

  try {
    const savedTransaction = await savePersonalTransaction({
      parsedTransaction: {
        ...parsedTransaction,
        occurredAtIso: occurredAt,
      },
      source: mapShortcutSource(parsedBody.data.source),
      descriptionRaw: captureText,
      overrideOccurredAt: occurredAt,
    });

    return NextResponse.json(
      {
        receivedAt: new Date().toISOString(),
        source: parsedBody.data.source ?? "shortcut",
        device: parsedBody.data.device ?? null,
        captureText,
        parsedTransaction: savedTransaction.parsedTransaction,
        transaction: savedTransaction.transaction,
        accountLabel: savedTransaction.accountLabel,
        summary: savedTransaction.summary,
        persistenceStatus: "stored",
      },
      { status: 201 },
    );
  } catch {
    return NextResponse.json(
      {
        error: "No pude guardar el movimiento del atajo.",
      },
      { status: 500 },
    );
  }
}

function composeCaptureText(payload: z.infer<typeof requestSchema>) {
  if (payload.text?.trim()) {
    return payload.text.trim();
  }

  const pieces = [
    "pague",
    payload.amount ? formatShortcutAmount(payload.amount, payload.currency) : null,
    payload.merchant ? `en ${payload.merchant}` : null,
    payload.note ? `por ${payload.note}` : null,
  ].filter(Boolean);

  return pieces.join(" ");
}

function formatShortcutAmount(amount: number, currency?: string) {
  if (currency && currency !== "CLP") {
    return `${amount} ${currency}`;
  }

  return String(Math.round(amount));
}

function mapShortcutSource(
  source: z.infer<typeof requestSchema>["source"],
): "manual" | "voice" | "import" | "rule" {
  switch (source) {
    case "voice_button":
      return "voice";
    case "apple_pay":
    case "shortcut":
    case "message":
    default:
      return "rule";
  }
}
