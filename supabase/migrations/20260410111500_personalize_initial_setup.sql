alter table public.accounts
  add column if not exists institution text,
  add column if not exists credit_limit numeric(12, 2) not null default 0,
  add column if not exists display_order integer not null default 0,
  add column if not exists notes text;

update public.profiles
set default_account_name = coalesce(default_account_name, 'Banco Bice Cuenta Corriente');

update public.accounts
set
  institution = coalesce(institution, 'Banco Bice'),
  display_order = case when display_order = 0 then 10 else display_order end,
  notes = coalesce(notes, 'Cuenta principal del dia a dia')
where name = 'Cuenta corriente';

update public.accounts
set
  institution = coalesce(institution, 'Banco Bice'),
  display_order = case when display_order = 0 then 20 else display_order end,
  notes = coalesce(notes, 'Tarjeta de debito asociada')
where name = 'Debito principal';

update public.accounts
set
  institution = coalesce(institution, 'Caja'),
  display_order = case when display_order = 0 then 90 else display_order end,
  notes = coalesce(notes, 'Disponible en efectivo')
where name = 'Efectivo';

create or replace function public.handle_new_user()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
begin
  insert into public.profiles (id, full_name, default_account_name)
  values (
    new.id,
    coalesce(new.raw_user_meta_data ->> 'full_name', 'Benja'),
    'Banco Bice Cuenta Corriente'
  )
  on conflict (id) do update
  set
    full_name = excluded.full_name,
    default_account_name = excluded.default_account_name,
    updated_at = timezone('utc', now());

  insert into public.accounts (
    user_id,
    institution,
    name,
    account_type,
    balance,
    credit_limit,
    is_default,
    display_order,
    notes
  )
  values
    (
      new.id,
      'Banco Bice',
      'Cuenta Corriente',
      'checking',
      0,
      0,
      true,
      10,
      'Cuenta principal del dia a dia'
    ),
    (
      new.id,
      'Banco Bice',
      'Tarjeta de Credito',
      'credit_card',
      0,
      300000,
      false,
      20,
      'Cupo base de 300.000 CLP'
    ),
    (
      new.id,
      'BancoEstado',
      'CuentaRUT',
      'checking',
      0,
      0,
      false,
      30,
      'Cuenta secundaria'
    ),
    (
      new.id,
      'Tenpo',
      'Tarjeta de Credito',
      'credit_card',
      -300000,
      300000,
      false,
      40,
      'Deuda pendiente actual'
    );

  return new;
end;
$$;

insert into public.categories (kind, slug, name, icon, color, is_system, sort_order)
values
  ('income', 'severance', 'Finiquito', 'briefcase', '#15803d', true, 25),
  ('expense', 'condo_fees', 'Gasto comun', 'building-2', '#64748b', true, 55),
  ('expense', 'utilities', 'Servicios basicos', 'zap', '#0f766e', true, 65),
  ('expense', 'internet', 'Internet', 'wifi', '#0369a1', true, 66),
  ('expense', 'debt', 'Deuda / credito', 'badge-alert', '#b91c1c', true, 75)
on conflict do nothing;

insert into public.profiles (id, full_name, default_account_name)
select
  users.id,
  coalesce(users.raw_user_meta_data ->> 'full_name', 'Benja'),
  'Banco Bice Cuenta Corriente'
from auth.users as users
where not exists (
  select 1
  from public.profiles
  where profiles.id = users.id
);

insert into public.accounts (
  user_id,
  institution,
  name,
  account_type,
  balance,
  credit_limit,
  is_default,
  display_order,
  notes
)
select
  users.id,
  'Banco Bice',
  'Cuenta Corriente',
  'checking',
  0,
  0,
  true,
  10,
  'Cuenta principal del dia a dia'
from auth.users as users
where not exists (
  select 1
  from public.accounts
  where accounts.user_id = users.id
    and accounts.name = 'Cuenta Corriente'
    and coalesce(accounts.institution, '') = 'Banco Bice'
);

insert into public.accounts (
  user_id,
  institution,
  name,
  account_type,
  balance,
  credit_limit,
  is_default,
  display_order,
  notes
)
select
  users.id,
  'Banco Bice',
  'Tarjeta de Credito',
  'credit_card',
  0,
  300000,
  false,
  20,
  'Cupo base de 300.000 CLP'
from auth.users as users
where not exists (
  select 1
  from public.accounts
  where accounts.user_id = users.id
    and accounts.name = 'Tarjeta de Credito'
    and coalesce(accounts.institution, '') = 'Banco Bice'
);

insert into public.accounts (
  user_id,
  institution,
  name,
  account_type,
  balance,
  credit_limit,
  is_default,
  display_order,
  notes
)
select
  users.id,
  'BancoEstado',
  'CuentaRUT',
  'checking',
  0,
  0,
  false,
  30,
  'Cuenta secundaria'
from auth.users as users
where not exists (
  select 1
  from public.accounts
  where accounts.user_id = users.id
    and accounts.name = 'CuentaRUT'
    and coalesce(accounts.institution, '') = 'BancoEstado'
);

insert into public.accounts (
  user_id,
  institution,
  name,
  account_type,
  balance,
  credit_limit,
  is_default,
  display_order,
  notes
)
select
  users.id,
  'Tenpo',
  'Tarjeta de Credito',
  'credit_card',
  -300000,
  300000,
  false,
  40,
  'Deuda pendiente actual'
from auth.users as users
where not exists (
  select 1
  from public.accounts
  where accounts.user_id = users.id
    and accounts.name = 'Tarjeta de Credito'
    and coalesce(accounts.institution, '') = 'Tenpo'
);
