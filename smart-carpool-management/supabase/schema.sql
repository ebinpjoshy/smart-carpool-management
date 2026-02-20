-- Supabase schema for Smart Carpool Management
-- Tables: users, rides, requests

create extension if not exists "pgcrypto";

-- Users
create table if not exists users (
  id uuid primary key default gen_random_uuid(),
  email text not null unique,
  full_name text,
  role text not null default 'rider',
  created_at timestamptz default now()
);

-- Rides (offered by drivers)
create table if not exists rides (
  id uuid primary key default gen_random_uuid(),
  driver_id uuid references users(id) on delete set null,
  origin text,
  destination text,
  depart_at timestamptz,
  seats_available int,
  created_at timestamptz default now()
);

-- Requests (riders requesting seats)
create table if not exists requests (
  id uuid primary key default gen_random_uuid(),
  rider_id uuid references users(id) on delete cascade,
  ride_id uuid references rides(id) on delete cascade,
  status text default 'pending',
  created_at timestamptz default now()
);

create index if not exists idx_rides_depart_at on rides(depart_at);
create index if not exists idx_requests_status on requests(status);
