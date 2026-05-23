-- Run this in your Supabase SQL editor

create table if not exists llm_tracking_tokens (
  id         uuid        default gen_random_uuid() primary key,
  user_id    uuid        not null references auth.users(id) on delete cascade,
  token      text        not null unique default encode(gen_random_bytes(16), 'hex'),
  created_at timestamptz default now()
);
create unique index if not exists llm_tracking_tokens_user_id on llm_tracking_tokens(user_id);

create table if not exists llm_visits (
  id         uuid        default gen_random_uuid() primary key,
  token      text        not null,
  source     text        not null,
  type       text        not null default 'visitor',
  page_url   text,
  created_at timestamptz default now()
);
create index if not exists llm_visits_token_idx      on llm_visits(token);
create index if not exists llm_visits_created_at_idx on llm_visits(created_at);

-- RLS
alter table llm_tracking_tokens enable row level security;
alter table llm_visits           enable row level security;

create policy "users manage own tokens"
  on llm_tracking_tokens for all
  using (auth.uid() = user_id);

create policy "public insert visits"
  on llm_visits for insert
  with check (exists (
    select 1 from llm_tracking_tokens where token = llm_visits.token
  ));

create policy "users view own visits"
  on llm_visits for select
  using (exists (
    select 1 from llm_tracking_tokens
    where token = llm_visits.token and user_id = auth.uid()
  ));
