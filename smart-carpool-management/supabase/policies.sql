-- Row Level Security policies for Smart Carpool Management

-- Users table policies
alter table users enable row level security;
create policy "Users: owner" on users
  for select, update, delete
  using (auth.uid() = id::text)
  with check (auth.uid() = id::text);

-- Rides policies
alter table rides enable row level security;
create policy "Rides: public select" on rides
  for select using (true);
create policy "Rides: insert auth" on rides
  for insert with check (auth.uid() is not null);
create policy "Rides: driver owner" on rides
  for update, delete
  using (auth.uid() = driver_id::text)
  with check (auth.uid() = driver_id::text);

-- Requests policies
alter table requests enable row level security;
create policy "Requests: owner" on requests
  for select, update, delete
  using (auth.uid() = rider_id::text)
  with check (auth.uid() = rider_id::text);
create policy "Requests: insert auth" on requests
  for insert with check (auth.uid() is not null);
