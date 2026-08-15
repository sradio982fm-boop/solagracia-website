-- Per-frequency control for the public sticky-player Video button.
alter table public.frequencies
  add column if not exists show_video boolean not null default true;

comment on column public.frequencies.show_video is
  'When false, hide the Video control on the public sticky player. Stream URL is kept.';
