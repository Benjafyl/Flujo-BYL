import { NextResponse } from "next/server";
import { z } from "zod";

import { getDashboardData } from "@/lib/dashboard-data";
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

  const dashboardData = await getDashboardData();
  const answer = answerFinanceQuestion(parsedBody.data.question, dashboardData);

  return NextResponse.json(answer, { status: 200 });
}
