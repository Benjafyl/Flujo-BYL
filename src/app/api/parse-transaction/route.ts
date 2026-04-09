import { NextResponse } from "next/server";
import { z } from "zod";

import { parseTransactionInput } from "@/lib/transaction-parser";

const requestSchema = z.object({
  text: z.string().min(2).max(240),
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

  return NextResponse.json(parsedTransaction, { status: 200 });
}
