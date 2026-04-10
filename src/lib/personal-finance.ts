import pg, { type PoolClient, type QueryResultRow } from "pg";

import type {
  CapturedTransactionResult,
  ParsedTransactionCandidate,
} from "@/lib/finance-types";

const { Pool } = pg;

const currencyFormatter = new Intl.NumberFormat("es-CL", {
  style: "currency",
  currency: "CLP",
  maximumFractionDigits: 0,
});

const occurredAtFormatter = new Intl.DateTimeFormat("es-CL", {
  day: "2-digit",
  month: "short",
  hour: "2-digit",
  minute: "2-digit",
  hour12: false,
  timeZone: "America/Santiago",
});

const PERSONAL_OWNER_EMAIL = "benjafyl@gmail.com";

type PoolLike = InstanceType<typeof Pool>;

type GlobalWithPool = typeof globalThis & {
  flujoBylPool?: PoolLike;
};

export type PersonalWorkspaceOwner = {
  id: string;
  email: string;
  fullName: string | null;
  defaultAccountName: string | null;
};

export type ProfileRow = {
  full_name: string | null;
  default_account_name: string | null;
};

export type AccountRow = {
  id: string;
  name: string;
  institution: string | null;
  account_type: string;
  balance: number | string;
  credit_limit: number | string | null;
  is_default: boolean;
  display_order: number | null;
  notes: string | null;
};

export type CategoryRow = {
  id: string;
  slug: string;
  name: string;
  kind: "income" | "expense";
  color: string | null;
  sort_order: number;
};

export type TransactionRow = {
  id: string;
  type: "income" | "expense" | "transfer";
  amount: number | string;
  occurred_at: string;
  description_raw: string;
  merchant_raw: string | null;
  category_id: string | null;
  account_id: string | null;
};

export type BudgetRow = {
  id: string;
  category_id: string;
  amount_limit: number | string;
};

type InsertedTransactionRow = {
  id: string;
  type: "income" | "expense" | "transfer";
  amount: number | string;
  occurred_at: string;
  description_raw: string;
  merchant_raw: string | null;
};

let ownerPromise: Promise<PersonalWorkspaceOwner> | null = null;

function getDatabaseUrl() {
  const databaseUrl = process.env.DATABASE_URL;

  if (!databaseUrl) {
    throw new Error("DATABASE_URL no esta configurada.");
  }

  return databaseUrl;
}

function getPool() {
  const globalForPool = globalThis as GlobalWithPool;

  if (!globalForPool.flujoBylPool) {
    globalForPool.flujoBylPool = new Pool({
      connectionString: getDatabaseUrl(),
      ssl: {
        rejectUnauthorized: false,
      },
      max: 5,
    });
  }

  return globalForPool.flujoBylPool;
}

async function queryRows<T extends QueryResultRow>(
  text: string,
  values: unknown[] = [],
  client?: PoolClient,
) {
  const executor = client ?? getPool();
  const result = await executor.query<T>(text, values);

  return result.rows;
}

async function withTransaction<T>(callback: (client: PoolClient) => Promise<T>) {
  const client = await getPool().connect();

  try {
    await client.query("begin");
    const result = await callback(client);
    await client.query("commit");
    return result;
  } catch (error) {
    await client.query("rollback");
    throw error;
  } finally {
    client.release();
  }
}

async function resolvePersonalOwner() {
  const preferredOwnerRows = await queryRows<PersonalWorkspaceOwner>(
    `
      select
        users.id,
        users.email,
        profiles.full_name as "fullName",
        profiles.default_account_name as "defaultAccountName"
      from auth.users as users
      join public.profiles as profiles
        on profiles.id = users.id
      where lower(users.email) = lower($1)
      limit 1
    `,
    [PERSONAL_OWNER_EMAIL],
  );

  const preferredOwner = preferredOwnerRows[0];

  if (preferredOwner) {
    return preferredOwner;
  }

  const fallbackOwnerRows = await queryRows<PersonalWorkspaceOwner>(
    `
      select
        users.id,
        users.email,
        profiles.full_name as "fullName",
        profiles.default_account_name as "defaultAccountName"
      from auth.users as users
      join public.profiles as profiles
        on profiles.id = users.id
      order by users.created_at desc
      limit 1
    `,
  );

  const fallbackOwner = fallbackOwnerRows[0];

  if (!fallbackOwner) {
    throw new Error(
      "No encontre un usuario base para FLUJO BYL. Crea uno en Supabase o revisa auth.users.",
    );
  }

  return fallbackOwner;
}

export async function getPersonalWorkspaceOwner() {
  if (!ownerPromise) {
    ownerPromise = resolvePersonalOwner();
  }

  return ownerPromise;
}

export async function getPersonalDashboardRecords({
  monthStartIso,
  nextMonthIso,
  monthDate,
}: {
  monthStartIso: string;
  nextMonthIso: string;
  monthDate: string;
}): Promise<{
  owner: PersonalWorkspaceOwner;
  profile: ProfileRow;
  accounts: AccountRow[];
  categories: CategoryRow[];
  monthTransactions: TransactionRow[];
  recentTransactions: TransactionRow[];
  budgets: BudgetRow[];
}> {
  const owner = await getPersonalWorkspaceOwner();

  const [accounts, categories, monthTransactions, recentTransactions, budgets] =
    await Promise.all([
      queryRows<AccountRow>(
        `
          select
            id,
            name,
            institution,
            account_type,
            balance,
            credit_limit,
            is_default,
            display_order,
            notes
          from public.accounts
          where user_id = $1
          order by display_order asc, created_at asc
        `,
        [owner.id],
      ),
      queryRows<CategoryRow>(
        `
          select
            id,
            slug,
            name,
            kind,
            color,
            sort_order
          from public.categories
          where is_system = true or user_id = $1
          order by sort_order asc, created_at asc
        `,
        [owner.id],
      ),
      queryRows<TransactionRow>(
        `
          select
            id,
            type,
            amount,
            occurred_at,
            description_raw,
            merchant_raw,
            category_id,
            account_id
          from public.transactions
          where user_id = $1
            and occurred_at >= $2::timestamptz
            and occurred_at < $3::timestamptz
          order by occurred_at desc
        `,
        [owner.id, monthStartIso, nextMonthIso],
      ),
      queryRows<TransactionRow>(
        `
          select
            id,
            type,
            amount,
            occurred_at,
            description_raw,
            merchant_raw,
            category_id,
            account_id
          from public.transactions
          where user_id = $1
          order by occurred_at desc
          limit 12
        `,
        [owner.id],
      ),
      queryRows<BudgetRow>(
        `
          select
            id,
            category_id,
            amount_limit
          from public.monthly_budgets
          where user_id = $1
            and month_date = $2::date
        `,
        [owner.id, monthDate],
      ),
    ]);

  return {
    owner,
    profile: {
      full_name: owner.fullName,
      default_account_name: owner.defaultAccountName,
    } satisfies ProfileRow,
    accounts,
    categories,
    monthTransactions,
    recentTransactions,
    budgets,
  };
}

export async function savePersonalTransaction({
  parsedTransaction,
  source,
  descriptionRaw,
  overrideOccurredAt,
}: {
  parsedTransaction: ParsedTransactionCandidate;
  source: "manual" | "voice" | "import" | "rule";
  descriptionRaw?: string;
  overrideOccurredAt?: string | null;
}): Promise<CapturedTransactionResult> {
  const owner = await getPersonalWorkspaceOwner();

  return withTransaction(async (client) => {
    const [accounts, categories] = await Promise.all([
      queryRows<AccountRow>(
        `
          select
            id,
            name,
            institution,
            account_type,
            balance,
            credit_limit,
            is_default,
            display_order,
            notes
          from public.accounts
          where user_id = $1
          order by display_order asc, created_at asc
        `,
        [owner.id],
        client,
      ),
      queryRows<CategoryRow>(
        `
          select
            id,
            slug,
            name,
            kind,
            color,
            sort_order
          from public.categories
          where is_system = true or user_id = $1
          order by sort_order asc, created_at asc
        `,
        [owner.id],
        client,
      ),
    ]);

    const account = resolveAccount(parsedTransaction.normalizedText, accounts);
    const category = resolveCategory(parsedTransaction, categories);
    const occurredAt = overrideOccurredAt ?? parsedTransaction.occurredAtIso ?? new Date().toISOString();
    const rawDescription = descriptionRaw?.trim() || parsedTransaction.input;

    const insertedRows = await queryRows<InsertedTransactionRow>(
      `
        insert into public.transactions (
          user_id,
          type,
          amount,
          occurred_at,
          description_raw,
          merchant_raw,
          merchant_normalized,
          category_id,
          account_id,
          created_via,
          confidence_score,
          needs_review
        )
        values (
          $1, $2, $3, $4::timestamptz, $5, $6, $7, $8, $9, $10, $11, false
        )
        returning
          id,
          type,
          amount,
          occurred_at,
          description_raw,
          merchant_raw
      `,
      [
        owner.id,
        parsedTransaction.type,
        parsedTransaction.amount,
        occurredAt,
        rawDescription,
        parsedTransaction.merchant,
        parsedTransaction.merchant?.toLowerCase() ?? null,
        category?.id ?? null,
        account?.id ?? null,
        source,
        parsedTransaction.confidence,
      ],
      client,
    );

    const inserted = insertedRows[0];

    if (!inserted) {
      throw new Error("No pude insertar el movimiento.");
    }

    const balanceDelta =
      parsedTransaction.type === "income"
        ? parsedTransaction.amount ?? 0
        : parsedTransaction.type === "expense"
          ? -(parsedTransaction.amount ?? 0)
          : 0;

    if (account && balanceDelta !== 0) {
      await client.query(
        `
          update public.accounts
          set
            balance = balance + $1,
            updated_at = timezone('utc', now())
          where id = $2
        `,
        [balanceDelta, account.id],
      );
    }

    if (parsedTransaction.merchant && category) {
      await client.query(
        `
          insert into public.merchant_aliases (
            user_id,
            alias,
            merchant_normalized,
            category_id,
            confidence_override,
            last_used_at
          )
          select
            $1,
            $2,
            $3,
            $4,
            $5,
            $6::timestamptz
          where not exists (
            select 1
            from public.merchant_aliases
            where user_id = $1
              and lower(alias) = lower($2)
          )
        `,
        [
          owner.id,
          parsedTransaction.merchant,
          parsedTransaction.merchant.toLowerCase(),
          category.id,
          parsedTransaction.confidence,
          occurredAt,
        ],
      );

      await client.query(
        `
          update public.merchant_aliases
          set
            merchant_normalized = $3,
            category_id = $4,
            confidence_override = $5,
            last_used_at = $6::timestamptz,
            updated_at = timezone('utc', now())
          where user_id = $1
            and lower(alias) = lower($2)
        `,
        [
          owner.id,
          parsedTransaction.merchant,
          parsedTransaction.merchant.toLowerCase(),
          category.id,
          parsedTransaction.confidence,
          occurredAt,
        ],
      );
    }

    const accountLabel = account
      ? [account.institution, account.name].filter(Boolean).join(" ")
      : "Sin cuenta";

    return {
      transaction: {
        id: inserted.id,
        title: inserted.merchant_raw?.trim() || compactDescription(inserted.description_raw),
        description: accountLabel,
        amount: Number(inserted.amount),
        type: inserted.type,
        categorySlug: category?.slug ?? null,
        categoryLabel: category?.name ?? "Sin categoria",
        account: account?.name ?? "Sin cuenta",
        occurredAt: capitalize(occurredAtFormatter.format(new Date(inserted.occurred_at))),
      },
      parsedTransaction: {
        ...parsedTransaction,
        occurredAtIso: occurredAt,
      },
      accountLabel,
      summary: `${formatCurrencyCLP(parsedTransaction.amount ?? 0)} registrado como ${
        category?.name ?? "Sin categoria"
      } en ${accountLabel}.`,
    };
  });
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
      terms: ["cuentarut", "cuenta rut", "banco estado", "bancoestado"],
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
  parsedTransaction: ParsedTransactionCandidate,
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

function formatCurrencyCLP(value: number) {
  return currencyFormatter.format(value);
}

function capitalize(value: string) {
  if (!value) {
    return value;
  }

  return value.charAt(0).toUpperCase() + value.slice(1);
}
