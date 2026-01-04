-- 1. Create table to store Admin Profiles (linked to Auth Users)
create table if not exists public.admin_profiles (
  id uuid references auth.users on delete cascade primary key,
  email text,
  two_factor_secret text,
  is_super_admin boolean default false,
  created_at timestamp with time zone default now()
);

-- 2. Enable Row Level Security (RLS)
alter table public.admin_profiles enable row level security;

-- 3. Create RLS Policies
-- Allow admins to view their own profile
create policy "Admins can view their own profile" 
  on public.admin_profiles for select 
  using (auth.uid() = id);

-- Allow admins to update their own profile (to save 2FA secret)
create policy "Admins can update their own profile" 
  on public.admin_profiles for update 
  using (auth.uid() = id);

-- Allow admins to insert their own profile (if not exists)
create policy "Admins can insert their own profile" 
  on public.admin_profiles for insert 
  with check (auth.uid() = id);

-- 4. Create a Helper Function to handle new user signup (Optional but recommended)
-- This automatically creates a profile entry when a new user signs up via Supabase Auth
create or replace function public.handle_new_user() 
returns trigger as $$
begin
  insert into public.admin_profiles (id, email)
  values (new.id, new.email);
  return new;
end;
$$ language plpgsql security definer;

-- Trigger the function on new user creation
create trigger on_auth_user_created
  after insert on auth.users
  for each row execute procedure public.handle_new_user();
