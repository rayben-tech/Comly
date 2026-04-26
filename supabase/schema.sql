-- Comly database schema
-- Run this in your Supabase SQL editor

-- Audits table: stores full audit results
create table if not exists audits (
  id uuid default gen_random_uuid() primary key,
  url text not null,
  brand_name text not null,
  score integer not null check (score >= 0 and score <= 100),
  profile jsonb not null,
  results jsonb not null,
  created_at timestamp with time zone default timezone('utc', now()) not null
);

-- Email captures table: weekly report subscriptions
create table if not exists email_captures (
  id uuid default gen_random_uuid() primary key,
  email text not null,
  url text not null,
  score integer,
  created_at timestamp with time zone default timezone('utc', now()) not null
);

-- Indexes for common queries
create index if not exists audits_url_idx on audits (url);
create index if not exists audits_created_at_idx on audits (created_at desc);
create index if not exists email_captures_email_idx on email_captures (email);

-- RLS: allow public inserts (no auth in MVP)
alter table audits enable row level security;
alter table email_captures enable row level security;

create policy "Allow public insert on audits"
  on audits for insert
  with check (true);

create policy "Allow public insert on email_captures"
  on email_captures for insert
  with check (true);
