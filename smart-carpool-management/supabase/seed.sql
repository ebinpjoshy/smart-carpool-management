-- Seed data for Smart Carpool Management (minimal examples)

insert into users (id, email, full_name, role) values
(gen_random_uuid(), 'driver@example.com', 'Alice Driver', 'driver'),
(gen_random_uuid(), 'rider@example.com', 'Bob Rider', 'rider')
on conflict (email) do nothing;

-- create a sample ride for the driver
insert into rides (driver_id, origin, destination, depart_at, seats_available)
select id, 'Downtown', 'Airport', now() + interval '1 day', 3
from users where email='driver@example.com' limit 1
on conflict do nothing;

-- create a sample request by the rider
insert into requests (rider_id, ride_id, status)
select
  (select id from users where email='rider@example.com' limit 1),
  (select id from rides where driver_id = (select id from users where email='driver@example.com' limit 1) limit 1),
  'pending'
on conflict do nothing;
