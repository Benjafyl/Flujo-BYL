import { NextResponse } from "next/server";
import { z } from "zod";

import { formatCurrencyCLP } from "@/lib/dashboard-data";
import { parseTransactionInput } from "@/lib/transaction-parser";
import { createSupabaseServerClient } from "@/lib/supabase-server";

const requestSchema = z.object({
  text: z.string().min(2).max(240),
  source: z.enum(["manual", "voice"]).default("manual"),
});

type AccountRow = {
  id: string;
  name: string;
  institution: string | null;
  is_default: boolean;
};

type CategoryRow = {
  id: string;
  slug: string;
  name: string;
  kind: "income" | "expense";
};

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

  const parsedTransaction = parseTransactionInput(parsedBody.data.text);

  if (!parsedTransaction.amount) {
    return NextResponse.json(
      {
        error: "Necesito detectar un monto para guardar el movimiento.",
      },
      { status: 422 },
    );
  }

  const [accountsResult, categoriesResult] = await Promise.all([
    supabase
      .from("accounts")
      .select("id, name, institution, is_default")
      .order("display_order", { ascending: true })
      .order("created_at", { ascending: true }),
    supabase.from("categories").select("id, slug, name, kind"),
  ]);

  const accounts = Array.isArray(accountsResult.data)
    ? (accountsResult.data as AccountRow[])
    : [];
  const categories = Array.isArray(categoriesResult.data)
    ? (categoriesResult.data as CategoryRow[])
    : [];

  const account = resolveAccount(parsedTransaction.normalizedText, accounts);
  const category = resolveCategory(parsedTransaction, categories);
  const occurredAt = parsedTransaction.occurredAtIso ?? new Date().toISOString();

  const { data: inserted, error: insertError } = await supabase
    .from("transactions")
    .insert({
      user_id: user.id,
      type: parsedTransaction.type,
      amount: parsedTransaction.amount,
      occurred_at: occurredAt,
      description_raw: parsedTransaction.input,
      merchant_raw: parsedTransaction.merchant,
      merchant_normalized: parsedTransaction.merchant?.toLowerCase() ?? null,
      category_id: category?.id ?? null,
      account_id: account?.id ?? null,
      created_via: parsedBody.data.source,
      confidence_score: parsedTransaction.confidence,
      needs_review: false,
    })
    .select("id, type, amount, occurred_at, description_raw, merchant_raw")
    .single();

  if (insertError || !inserted) {
    return NextResponse.json(
      {
        error: "No pude guardar el movimiento en la base.",
      },
      { status: 500 },
    );
  }

  const accountLabel = account
    ? [account.institution, account.name].filter(Boolean).join(" ")
    : "Sin cuenta";

  return NextResponse.json(
    {
      transaction: {
        id: inserted.id,
        title: inserted.merchant_raw?.trim() || compactDescription(inserted.description_raw),
        description: accountLabel,
        amount: Number(inserted.amount),
        type: inserted.type,
        categorySlug: category?.slug ?? null,
        categoryLabel: category?.name ?? "Sin categoria",
        account: account?.name ?? "Sin cuenta",
        occurredAt: new Intl.DateTimeFormat("es-CL", {
          day: "2-digit",
          month: "short",
          hour: "2-digit",
          minute: "2-digit",
          hour12: false,
          timeZone: "America/Santiago",
        }).format(new Date(inserted.occurred_at)),
      },
      parsedTransaction: {
        ...parsedTransaction,
        occurredAtIso: occurredAt,
      },
      accountLabel,
      summary: `${formatCurrencyCLP(parsedTransaction.amount)} registrado como ${
        category?.name ?? "Sin categoria"
      } en ${accountLabel}.`,
    },
    { status: 201 },
  );
}

function resolveAccount(normalizedText: string, accounts: AccountRow[]) {
  const exactMatchers: Array<{
    terms: string[];
    predicate: (account: AccountRow) => boolean;
  }> = [
    {
      terms: ["tenpo"],
      predicate: (account) =>
        [account.name, account.institution ?? ""].join(" ").toLowerCase().includes("tenpo"),
    },
    {
      terms: ["cuentarut", "banco estado", "bancoestado"],
      predicate: (account) =>
        [account.name, account.institution ?? ""]
          .join(" ")
          .toLowerCase()
          .includes("estado"),
    },
    {
      terms: ["bice credito", "credito bice", "tarjeta bice", "credito"],
      predicate: (account) =>
        [account.name, account.institution ?? ""]
          .join(" ")
          .toLowerCase()
          .includes("credito"),
    },
  ];

  for (const matcher of exactMatchers) {
    if (!matcher.terms.some((term) => normalizedText.includes(term))) {
      continue;
    }

    const matched = accounts.find(matcher.predicate);

    if (matched) {
      return matched;
    }
  }

  return accounts.find((account) => account.is_default) ?? accounts[0] ?? null;
}

function resolveCategory(
  parsedTransaction: ReturnType<typeof parseTransactionInput>,
  categories: CategoryRow[],
) {
  if (!parsedTransaction.category) {
    return null;
  }

  const expectedKind = parsedTransaction.type === "income" ? "income" : "expense";

  return (
    categories.find(
      (category) =>
        category.slug === parsedTransaction.category && category.kind === expectedKind,
    ) ??
    categories.find(
      (category) => category.slug === "other" && category.kind === expectedKind,
    ) ??
    null
  );
}

function compactDescription(value: string) {
  return value.trim().slice(0, 48);
}
