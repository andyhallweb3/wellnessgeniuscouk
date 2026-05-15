-- Business notes: quick operator insights saved to Genie's context
create table if not exists business_notes (
  id uuid primary key default gen_random_uuid(),
  user_id uuid references auth.users(id) on delete cascade not null,
  note text not null,
  category text not null default 'general',
  created_at timestamptz default now() not null,
  updated_at timestamptz default now() not null
);

alter table business_notes enable row level security;

create policy "Users can read own notes"
  on business_notes for select
  using (auth.uid() = user_id);

create policy "Users can insert own notes"
  on business_notes for insert
  with check (auth.uid() = user_id);

create policy "Users can update own notes"
  on business_notes for update
  using (auth.uid() = user_id);

create policy "Users can delete own notes"
  on business_notes for delete
  using (auth.uid() = user_id);

create index business_notes_user_id_idx on business_notes(user_id);
create index business_notes_created_at_idx on business_notes(user_id, created_at desc);
