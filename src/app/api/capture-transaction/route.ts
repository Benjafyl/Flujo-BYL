import { NextResponse } from "next/server";
import { z } from "zod";

import { parseTransactionInput } from "@/lib/transaction-parser";
import { savePersonalTransaction } from "@/lib/personal-finance";

const requestSchema = z.object({
  text: z.string().min(2).max(240),
  source: z.enum(["manual", "voice"]).default("manual"),
});

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

  const parsedTransaction = parseTransactionInput(parsedBody.data.text);

  if (!parsedTransaction.amount) {
    return NextResponse.json(
      {
        error: "Necesito detectar un monto para guardar el movimiento.",
      },
      { status: 422 },
    );
  }

  try {
    const savedTransaction = await savePersonalTransaction({
      parsedTransaction,
      source: parsedBody.data.source,
    });

    return NextResponse.json(savedTransaction, { status: 201 });
  } catch {
    return NextResponse.json(
      {
        error: "No pude guardar el movimiento en la base.",
      },
      { status: 500 },
    );
  }
}
