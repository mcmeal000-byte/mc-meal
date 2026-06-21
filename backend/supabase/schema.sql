-- MC Meal Backend Schema v1
-- Use in Supabase SQL Editor.

create table if not exists public.profiles (
  wallet_address text primary key,
  access_tier text not null default 'Visitor',
  xp bigint not null default 0,
  meal_balance bigint not null default 0,
  meal_burned bigint not null default 0,
  reward_pool bigint not null default 0,
  best_score bigint not null default 0,
  mini_runs bigint not null default 0,
  meals_crafted bigint not null default 0,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists public.inventory_items (
  wallet_address text not null references public.profiles(wallet_address) on delete cascade,
  item_name text not null,
  qty bigint not null default 0 check (qty >= 0),
  updated_at timestamptz not null default now(),
  primary key (wallet_address, item_name)
);

create table if not exists public.daily_streaks (
  wallet_address text primary key references public.profiles(wallet_address) on delete cascade,
  current_streak int not null default 0,
  last_claim_date date,
  total_claims int not null default 0,
  updated_at timestamptz not null default now()
);

create table if not exists public.game_runs (
  id bigserial primary key,
  wallet_address text not null references public.profiles(wallet_address) on delete cascade,
  game_key text not null,
  score bigint not null default 0,
  drops jsonb not null default '[]'::jsonb,
  client_run_id text,
  created_at timestamptz not null default now(),
  unique(wallet_address, client_run_id)
);

create table if not exists public.craft_actions (
  id bigserial primary key,
  wallet_address text not null references public.profiles(wallet_address) on delete cascade,
  recipe_id text not null,
  cost_meal bigint not null default 0,
  burned_meal bigint not null default 0,
  pool_meal bigint not null default 0,
  result_item text not null,
  created_at timestamptz not null default now()
);

create table if not exists public.shop_transactions (
  id bigserial primary key,
  wallet_address text not null references public.profiles(wallet_address) on delete cascade,
  action text not null check (action in ('buy', 'sell')),
  item_name text not null,
  qty bigint not null default 1,
  meal_amount bigint not null default 0,
  tx_signature text unique,
  status text not null default 'demo',
  created_at timestamptz not null default now()
);

create table if not exists public.processed_signatures (
  tx_signature text primary key,
  wallet_address text not null,
  purpose text not null,
  created_at timestamptz not null default now()
);

-- Recommended RLS:
-- Enable RLS and only allow reads/writes through server API using SUPABASE_SERVICE_ROLE_KEY.
alter table public.profiles enable row level security;
alter table public.inventory_items enable row level security;
alter table public.daily_streaks enable row level security;
alter table public.game_runs enable row level security;
alter table public.craft_actions enable row level security;
alter table public.shop_transactions enable row level security;
alter table public.processed_signatures enable row level security;
