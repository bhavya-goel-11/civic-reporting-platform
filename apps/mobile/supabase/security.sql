-- Enable Row Level Security (RLS)
alter table public.reports enable row level security;

-- Create a policy for anonymous users to insert reports
create policy "Enable anonymous report submissions"
on public.reports
for insert
to anon
with check (true);

-- Create a policy for anonymous users to read reports
create policy "Enable anonymous report reading"
on public.reports
for select
to anon
using (true);

-- Grant necessary permissions to the authenticated and anonymous roles
grant usage on schema public to anon, authenticated;
grant all on public.reports to anon, authenticated;

-- If you're using storage, also set up bucket policies
-- Enable access to the storage bucket (if it doesn't exist)
insert into storage.buckets (id, name, public)
select 'report-images', 'report-images', true
where not exists (
    select 1 from storage.buckets where id = 'report-images'
);

-- Set up storage policy for the report-images bucket
create policy "Give public access to report-images"
on storage.objects
for all
to public
using (bucket_id = 'report-images');