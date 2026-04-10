import { NextResponse } from "next/server";
import { z } from "zod";

import { getDashboardData, type DashboardSupabase } from "@/lib/dashboard-data";
import { answerFinanceQuestion } from "@/lib/finance-qa";
import { createSupabaseServerClient } from "@/lib/supabase-server";

const requestSchema = z.object({
  question: z.string().min(3).max(240),
});

export async function POST(request: Request) {
  const supabase = await createSupabaseServerClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return NextResponse.json({ error: "No autenticado" }, { status: 401 });
  }

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

  const dashboardData = await getDashboardData(
    supabase as unknown as DashboardSupabase,
    user,
  );
  const answer = answerFinanceQuestion(parsedBody.data.question, dashboardData);

  return NextResponse.json(answer, { status: 200 });
}
