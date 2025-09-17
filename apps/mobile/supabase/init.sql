-- Create the reports table
create table public.reports (
  id uuid default gen_random_uuid() primary key,
  description text not null,
  image_url text not null,
  status text not null default 'pending' check (status in ('pending', 'in_progress', 'resolved')),
  location jsonb, -- For storing lat/lng coordinates
  created_at timestamptz default now(),
  updated_at timestamptz default now()
);

-- Enable Row Level Security (RLS)
alter table public.reports enable row level security;

-- Create a policy that allows anyone to create reports
create policy "Anyone can create reports"
  on public.reports
  for insert
  with check (true);

-- Create a policy that allows anyone to read reports
create policy "Anyone can view reports"
  on public.reports
  for select
  using (true);

-- Create an update trigger for updated_at
create or replace function handle_updated_at()
returns trigger as $$
begin
  new.updated_at = now();
  return new;
end;
$$ language plpgsql;

create trigger reports_updated_at
  before update on public.reports
  for each row
  execute function handle_updated_at();