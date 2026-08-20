-- Ejecuta esto entero en Supabase: Project > SQL Editor > New query > Run

create extension if not exists "pgcrypto";

create table if not exists accounts (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  name text not null,
  type text not null default 'corriente',
  balance numeric not null default 0,
  currency text not null default 'CHF',
  created_at timestamptz not null default now()
);

-- Si la tabla ya existía de antes (sin esta columna), esto la añade sin tocar tus datos.
alter table accounts add column if not exists currency text not null default 'CHF';

create table if not exists transactions (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  date date not null,
  description text not null,
  category text,
  type text not null,
  amount numeric not null,
  currency text not null default 'CHF',
  created_at timestamptz not null default now()
);

-- Si la tabla ya existía de antes (sin esta columna), esto la añade sin tocar tus datos.
alter table transactions add column if not exists currency text not null default 'CHF';

alter table accounts enable row level security;
alter table transactions enable row level security;

create policy "Users manage their own accounts"
  on accounts for all
  using (auth.uid() = user_id)
  with check (auth.uid() = user_id);

create policy "Users manage their own transactions"
  on transactions for all
  using (auth.uid() = user_id)
  with check (auth.uid() = user_id);
