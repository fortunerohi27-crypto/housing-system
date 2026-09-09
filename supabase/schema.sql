-- EstateHub: shared Supabase database schema
-- Run this in Supabase Dashboard → SQL Editor → New query.

create extension if not exists "pgcrypto";

create type public.member_role as enum ('owner', 'manager');
create type public.unit_status as enum ('vacant', 'occupied', 'maintenance', 'notice_given');
create type public.invoice_status as enum ('pending', 'paid', 'overdue');
create type public.maintenance_status as enum ('open', 'in_progress', 'resolved');
create type public.maintenance_priority as enum ('low', 'medium', 'high');

create table public.profiles (
  id uuid primary key references auth.users(id) on delete cascade,
  full_name text not null default '',
  email text not null unique,
  created_at timestamptz not null default now()
);

create table public.organizations (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  owner_id uuid not null references public.profiles(id) on delete restrict,
  created_at timestamptz not null default now()
);

create table public.organization_members (
  organization_id uuid not null references public.organizations(id) on delete cascade,
  user_id uuid not null references public.profiles(id) on delete cascade,
  role public.member_role not null default 'manager',
  created_at timestamptz not null default now(),
  primary key (organization_id, user_id)
);

create table public.properties (
  id uuid primary key default gen_random_uuid(),
  organization_id uuid not null references public.organizations(id) on delete cascade,
  name text not null,
  address text not null,
  property_type text not null default 'Apartment',
  amenities text[] not null default '{}',
  archived boolean not null default false,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table public.units (
  id uuid primary key default gen_random_uuid(),
  property_id uuid not null references public.properties(id) on delete cascade,
  label text not null,
  bedrooms integer not null default 0 check (bedrooms >= 0),
  square_feet integer not null default 0 check (square_feet >= 0),
  monthly_rent numeric(12,2) not null default 0 check (monthly_rent >= 0),
  status public.unit_status not null default 'vacant',
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  unique (property_id, label)
);

create table public.tenants (
  id uuid primary key default gen_random_uuid(),
  organization_id uuid not null references public.organizations(id) on delete cascade,
  user_id uuid unique references public.profiles(id) on delete set null,
  unit_id uuid unique references public.units(id) on delete set null,
  full_name text not null,
  email text not null,
  phone text,
  status text not null default 'active',
  move_in_date date,
  emergency_contact jsonb not null default '{}'::jsonb,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  unique (organization_id, email)
);

create table public.leases (
  id uuid primary key default gen_random_uuid(),
  organization_id uuid not null references public.organizations(id) on delete cascade,
  tenant_id uuid not null references public.tenants(id) on delete cascade,
  unit_id uuid not null references public.units(id) on delete restrict,
  start_date date not null,
  end_date date not null check (end_date > start_date),
  monthly_rent numeric(12,2) not null check (monthly_rent >= 0),
  deposit numeric(12,2) not null default 0 check (deposit >= 0),
  status text not null default 'active',
  signed_at timestamptz,
  created_at timestamptz not null default now()
);

create table public.invoices (
  id uuid primary key default gen_random_uuid(),
  organization_id uuid not null references public.organizations(id) on delete cascade,
  tenant_id uuid not null references public.tenants(id) on delete cascade,
  amount numeric(12,2) not null check (amount >= 0),
  late_fee numeric(12,2) not null default 0 check (late_fee >= 0),
  due_date date not null,
  paid_at timestamptz,
  status public.invoice_status not null default 'pending',
  created_at timestamptz not null default now()
);

create table public.payments (
  id uuid primary key default gen_random_uuid(),
  invoice_id uuid not null references public.invoices(id) on delete cascade,
  amount numeric(12,2) not null check (amount > 0),
  method text not null,
  reference text,
  paid_at timestamptz not null default now(),
  created_at timestamptz not null default now()
);

create table public.maintenance_requests (
  id uuid primary key default gen_random_uuid(),
  organization_id uuid not null references public.organizations(id) on delete cascade,
  tenant_id uuid not null references public.tenants(id) on delete cascade,
  unit_id uuid not null references public.units(id) on delete restrict,
  title text not null,
  description text,
  priority public.maintenance_priority not null default 'medium',
  status public.maintenance_status not null default 'open',
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table public.messages (
  id uuid primary key default gen_random_uuid(),
  organization_id uuid not null references public.organizations(id) on delete cascade,
  sender_id uuid not null references public.profiles(id) on delete cascade,
  recipient_id uuid references public.profiles(id) on delete set null,
  tenant_id uuid references public.tenants(id) on delete set null,
  subject text,
  body text not null,
  read_at timestamptz,
  created_at timestamptz not null default now()
);

create or replace function public.handle_new_user()
returns trigger language plpgsql security definer set search_path = public as $$
begin
  insert into public.profiles (id, full_name, email)
  values (new.id, coalesce(new.raw_user_meta_data ->> 'full_name', ''), new.email);
  update public.tenants set user_id = new.id, updated_at = now()
  where lower(email) = lower(new.email) and user_id is null;
  return new;
end;
$$;

create trigger on_auth_user_created
  after insert on auth.users for each row execute procedure public.handle_new_user();

create or replace function public.add_organization_owner()
returns trigger language plpgsql security definer set search_path = public as $$
begin
  insert into public.organization_members (organization_id, user_id, role)
  values (new.id, new.owner_id, 'owner');
  return new;
end;
$$;

create trigger organization_owner_membership
  after insert on public.organizations for each row execute procedure public.add_organization_owner();

create or replace function public.is_org_member(org_id uuid)
returns boolean language sql stable security definer set search_path = public as $$
  select exists (
    select 1 from public.organization_members
    where organization_id = org_id and user_id = auth.uid()
  );
$$;

create or replace function public.is_org_admin(org_id uuid)
returns boolean language sql stable security definer set search_path = public as $$
  select exists (
    select 1 from public.organization_members
    where organization_id = org_id and user_id = auth.uid()
      and role in ('owner', 'manager')
  );
$$;

alter table public.profiles enable row level security;
alter table public.organizations enable row level security;
alter table public.organization_members enable row level security;
alter table public.properties enable row level security;
alter table public.units enable row level security;
alter table public.tenants enable row level security;
alter table public.leases enable row level security;
alter table public.invoices enable row level security;
alter table public.payments enable row level security;
alter table public.maintenance_requests enable row level security;
alter table public.messages enable row level security;

create policy "profiles: read own" on public.profiles for select using (id = auth.uid());
create policy "profiles: update own" on public.profiles for update using (id = auth.uid()) with check (id = auth.uid());
create policy "organizations: members read" on public.organizations for select using (public.is_org_member(id));
create policy "organizations: authenticated create" on public.organizations for insert with check (owner_id = auth.uid());
create policy "members: read own organization" on public.organization_members for select using (public.is_org_member(organization_id));

create policy "properties: managers manage" on public.properties for all using (public.is_org_admin(organization_id)) with check (public.is_org_admin(organization_id));
create policy "properties: tenants read own" on public.properties for select using (exists (select 1 from public.tenants t join public.units u on u.id = t.unit_id where t.user_id = auth.uid() and u.property_id = properties.id));
create policy "units: managers manage" on public.units for all using (public.is_org_admin((select organization_id from public.properties p where p.id = property_id))) with check (public.is_org_admin((select organization_id from public.properties p where p.id = property_id)));
create policy "units: tenants read own" on public.units for select using (exists (select 1 from public.tenants t where t.user_id = auth.uid() and t.unit_id = units.id));
create policy "tenants: managers manage" on public.tenants for all using (public.is_org_admin(organization_id)) with check (public.is_org_admin(organization_id));
create policy "tenants: read own" on public.tenants for select using (user_id = auth.uid());
create policy "leases: managers manage" on public.leases for all using (public.is_org_admin(organization_id)) with check (public.is_org_admin(organization_id));
create policy "leases: tenants read own" on public.leases for select using (exists (select 1 from public.tenants t where t.id = tenant_id and t.user_id = auth.uid()));
create policy "invoices: managers manage" on public.invoices for all using (public.is_org_admin(organization_id)) with check (public.is_org_admin(organization_id));
create policy "invoices: tenants read own" on public.invoices for select using (exists (select 1 from public.tenants t where t.id = tenant_id and t.user_id = auth.uid()));
create policy "payments: managers manage" on public.payments for all using (exists (select 1 from public.invoices i where i.id = invoice_id and public.is_org_admin(i.organization_id)));
create policy "payments: tenants read own" on public.payments for select using (exists (select 1 from public.invoices i join public.tenants t on t.id = i.tenant_id where i.id = invoice_id and t.user_id = auth.uid()));
create policy "maintenance: managers manage" on public.maintenance_requests for all using (public.is_org_admin(organization_id)) with check (public.is_org_admin(organization_id));
create policy "maintenance: tenants read own" on public.maintenance_requests for select using (exists (select 1 from public.tenants t where t.id = tenant_id and t.user_id = auth.uid()));
create policy "maintenance: tenants create own" on public.maintenance_requests for insert with check (exists (select 1 from public.tenants t where t.id = tenant_id and t.user_id = auth.uid() and t.unit_id = unit_id));
create policy "messages: members read" on public.messages for select using (public.is_org_admin(organization_id) or sender_id = auth.uid() or recipient_id = auth.uid());
create policy "messages: members send" on public.messages for insert with check (sender_id = auth.uid() and (public.is_org_admin(organization_id) or exists (select 1 from public.tenants t where t.id = tenant_id and t.user_id = auth.uid())));

create index units_property_id_idx on public.units(property_id);
create index tenants_organization_id_idx on public.tenants(organization_id);
create index tenants_user_id_idx on public.tenants(user_id);
create index invoices_tenant_id_idx on public.invoices(tenant_id);
create index leases_tenant_id_idx on public.leases(tenant_id);
create index maintenance_tenant_id_idx on public.maintenance_requests(tenant_id);
