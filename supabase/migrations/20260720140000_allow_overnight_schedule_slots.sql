-- Allow overnight windows (e.g. 22:00–02:00) used by late-night shows.
alter table public.schedule_slots drop constraint if exists schedule_slots_check;
alter table public.schedule_slots
  add constraint schedule_slots_check check (end_hour <> start_hour);
