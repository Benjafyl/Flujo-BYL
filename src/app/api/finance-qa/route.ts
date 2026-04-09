import { NextResponse } from "next/server";
import { z } from "zod";

import { answerFinanceQuestion } from "@/lib/finance-qa";

const requestSchema = z.object({
  question: z.string().min(3).max(240),
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

  const answer = answerFinanceQuestion(parsedBody.data.question);

  return NextResponse.json(answer, { status: 200 });
}
