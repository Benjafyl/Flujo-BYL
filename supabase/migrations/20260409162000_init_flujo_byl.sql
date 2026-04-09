create extension if not exists pgcrypto;

create type public.transaction_type as enum ('income', 'expense', 'transfer');
create type public.category_kind as enum ('income', 'expense');
create type public.capture_source as enum ('manual', 'voice', 'import', 'rule');
create type public.voice_capture_status as enum ('queued', 'transcribed', 'parsed', 'failed');

create or replace function public.set_updated_at()
returns trigger
language plpgsql
as $$
begin
  new.updated_at = timezone('utc', now());
  return new;
end;
$$;

create table public.profiles (
  id uuid primary key references auth.users(id) on delete cascade,
  full_name text,
  preferred_currency text not null default 'CLP',
  timezone text not null default 'America/Santiago',
  default_account_name text,
  created_at timestamptz not null default timezone('utc', now()),
  updated_at timestamptz not null default timezone('utc', now())
);

create table public.accounts (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  name text not null,
  account_type text not null default 'checking',
  balance numeric(12, 2) not null default 0,
  currency text not null default 'CLP',
  is_default boolean not null default false,
  created_at timestamptz not null default timezone('utc', now()),
  updated_at timestamptz not null default timezone('utc', now())
);

create table public.categories (
  id uuid primary key default gen_random_uuid(),
  user_id uuid references auth.users(id) on delete cascade,
  kind public.category_kind not null,
  slug text not null,
  name text not null,
  icon text,
  color text,
  parent_id uuid references public.categories(id) on delete set null,
  is_system boolean not null default false,
  sort_order integer not null default 0,
  created_at timestamptz not null default timezone('utc', now()),
  updated_at timestamptz not null default timezone('utc', now()),
  constraint categories_scope_check check (
    (is_system = true and user_id is null) or
    (is_system = false and user_id is not null)
  )
);

create table public.transactions (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  type public.transaction_type not null,
  amount numeric(12, 2) not null check (amount >= 0),
  currency text not null default 'CLP',
  occurred_at timestamptz not null,
  description_raw text not null,
  merchant_raw text,
  merchant_normalized text,
  category_id uuid references public.categories(id) on delete set null,
  account_id uuid references public.accounts(id) on delete set null,
  created_via public.capture_source not null default 'manual',
  confidence_score numeric(4, 3) not null default 1 check (confidence_score >= 0 and confidence_score <= 1),
  needs_review boolean not null default false,
  notes text,
  created_at timestamptz not null default timezone('utc', now()),
  updated_at timestamptz not null default timezone('utc', now())
);

create table public.merchant_aliases (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  alias text not null,
  merchant_normalized text not null,
  category_id uuid references public.categories(id) on delete set null,
  confidence_override numeric(4, 3) check (confidence_override >= 0 and confidence_override <= 1),
  last_used_at timestamptz,
  created_at timestamptz not null default timezone('utc', now()),
  updated_at timestamptz not null default timezone('utc', now())
);

create table public.classification_feedback (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  transaction_id uuid not null references public.transactions(id) on delete cascade,
  original_category_id uuid references public.categories(id) on delete set null,
  corrected_category_id uuid references public.categories(id) on delete set null,
  original_confidence numeric(4, 3),
  feedback_note text,
  created_at timestamptz not null default timezone('utc', now())
);

create table public.monthly_budgets (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  category_id uuid not null references public.categories(id) on delete cascade,
  month_date date not null,
  amount_limit numeric(12, 2) not null check (amount_limit >= 0),
  created_at timestamptz not null default timezone('utc', now()),
  updated_at timestamptz not null default timezone('utc', now())
);

create table public.recurring_transactions (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  type public.transaction_type not null,
  amount numeric(12, 2) not null check (amount >= 0),
  description text not null,
  category_id uuid references public.categories(id) on delete set null,
  account_id uuid references public.accounts(id) on delete set null,
  merchant_normalized text,
  cadence text not null,
  next_occurrence date,
  active boolean not null default true,
  created_at timestamptz not null default timezone('utc', now()),
  updated_at timestamptz not null default timezone('utc', now())
);

create table public.voice_captures (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  transcript text,
  audio_path text,
  status public.voice_capture_status not null default 'queued',
  parsed_transaction jsonb,
  confidence_score numeric(4, 3) check (confidence_score >= 0 and confidence_score <= 1),
  related_transaction_id uuid references public.transactions(id) on delete set null,
  created_at timestamptz not null default timezone('utc', now()),
  updated_at timestamptz not null default timezone('utc', now())
);

create unique index categories_system_kind_slug_idx
  on public.categories (kind, slug)
  where is_system = true;

create unique index categories_user_kind_slug_idx
  on public.categories (user_id, kind, slug)
  where is_system = false;

create unique index merchant_aliases_user_alias_idx
  on public.merchant_aliases (user_id, lower(alias));

create unique index monthly_budgets_unique_idx
  on public.monthly_budgets (user_id, category_id, month_date);

create index transactions_user_occurred_at_idx on public.transactions (user_id, occurred_at desc);
create index transactions_user_category_idx on public.transactions (user_id, category_id);
create index voice_captures_user_status_idx on public.voice_captures (user_id, status);

create trigger profiles_set_updated_at
before update on public.profiles
for each row execute function public.set_updated_at();

create trigger accounts_set_updated_at
before update on public.accounts
for each row execute function public.set_updated_at();

create trigger categories_set_updated_at
before update on public.categories
for each row execute function public.set_updated_at();

create trigger transactions_set_updated_at
before update on public.transactions
for each row execute function public.set_updated_at();

create trigger merchant_aliases_set_updated_at
before update on public.merchant_aliases
for each row execute function public.set_updated_at();

create trigger monthly_budgets_set_updated_at
before update on public.monthly_budgets
for each row execute function public.set_updated_at();

create trigger recurring_transactions_set_updated_at
before update on public.recurring_transactions
for each row execute function public.set_updated_at();

create trigger voice_captures_set_updated_at
before update on public.voice_captures
for each row execute function public.set_updated_at();

alter table public.profiles enable row level security;
alter table public.accounts enable row level security;
alter table public.categories enable row level security;
alter table public.transactions enable row level security;
alter table public.merchant_aliases enable row level security;
alter table public.classification_feedback enable row level security;
alter table public.monthly_budgets enable row level security;
alter table public.recurring_transactions enable row level security;
alter table public.voice_captures enable row level security;

create policy "profiles_select_own"
  on public.profiles for select
  using (auth.uid() = id);

create policy "profiles_update_own"
  on public.profiles for update
  using (auth.uid() = id)
  with check (auth.uid() = id);

create policy "accounts_all_own"
  on public.accounts for all
  using (auth.uid() = user_id)
  with check (auth.uid() = user_id);

create policy "categories_select_system_or_own"
  on public.categories for select
  using (is_system = true or auth.uid() = user_id);

create policy "categories_insert_own"
  on public.categories for insert
  with check (auth.uid() = user_id and is_system = false);

create policy "categories_update_own"
  on public.categories for update
  using (auth.uid() = user_id and is_system = false)
  with check (auth.uid() = user_id and is_system = false);

create policy "categories_delete_own"
  on public.categories for delete
  using (auth.uid() = user_id and is_system = false);

create policy "transactions_all_own"
  on public.transactions for all
  using (auth.uid() = user_id)
  with check (auth.uid() = user_id);

create policy "merchant_aliases_all_own"
  on public.merchant_aliases for all
  using (auth.uid() = user_id)
  with check (auth.uid() = user_id);

create policy "classification_feedback_all_own"
  on public.classification_feedback for all
  using (auth.uid() = user_id)
  with check (auth.uid() = user_id);

create policy "monthly_budgets_all_own"
  on public.monthly_budgets for all
  using (auth.uid() = user_id)
  with check (auth.uid() = user_id);

create policy "recurring_transactions_all_own"
  on public.recurring_transactions for all
  using (auth.uid() = user_id)
  with check (auth.uid() = user_id);

create policy "voice_captures_all_own"
  on public.voice_captures for all
  using (auth.uid() = user_id)
  with check (auth.uid() = user_id);

create or replace function public.handle_new_user()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
begin
  insert into public.profiles (id, full_name)
  values (new.id, coalesce(new.raw_user_meta_data ->> 'full_name', 'Benja'));

  insert into public.accounts (user_id, name, account_type, is_default)
  values
    (new.id, 'Cuenta corriente', 'checking', true),
    (new.id, 'Debito principal', 'debit', false),
    (new.id, 'Efectivo', 'cash', false);

  return new;
end;
$$;

drop trigger if exists on_auth_user_created on auth.users;

create trigger on_auth_user_created
after insert on auth.users
for each row execute procedure public.handle_new_user();

insert into public.categories (kind, slug, name, icon, color, is_system, sort_order)
values
  ('income', 'salary', 'Sueldo', 'wallet', '#0c7c59', true, 10),
  ('income', 'freelance', 'Freelance', 'sparkles', '#16a34a', true, 20),
  ('income', 'refund', 'Reembolso', 'rotate-ccw', '#0f766e', true, 30),
  ('income', 'sale', 'Venta', 'shopping-bag', '#65a30d', true, 40),
  ('income', 'transfer_in', 'Transferencia recibida', 'arrow-down-left', '#0284c7', true, 50),
  ('income', 'other', 'Otros ingresos', 'plus', '#475569', true, 60),
  ('expense', 'supermarket', 'Supermercado', 'shopping-cart', '#0f766e', true, 10),
  ('expense', 'snacks', 'Snacks / Cafe', 'coffee', '#ea580c', true, 20),
  ('expense', 'delivery', 'Delivery / comida', 'utensils', '#f97316', true, 30),
  ('expense', 'transport', 'Transporte', 'bus', '#2563eb', true, 40),
  ('expense', 'education', 'Universidad / estudio', 'book-open', '#7c3aed', true, 50),
  ('expense', 'home', 'Hogar', 'home', '#64748b', true, 60),
  ('expense', 'health', 'Salud', 'heart-pulse', '#e11d48', true, 70),
  ('expense', 'subscriptions', 'Suscripciones', 'badge-check', '#8b5cf6', true, 80),
  ('expense', 'leisure', 'Ocio', 'gamepad-2', '#4f46e5', true, 90),
  ('expense', 'shopping', 'Compras personales', 'shirt', '#d97706', true, 100),
  ('expense', 'gifts', 'Regalos', 'gift', '#db2777', true, 110),
  ('expense', 'other', 'Otros egresos', 'circle-ellipsis', '#475569', true, 120)
on conflict do nothing;
