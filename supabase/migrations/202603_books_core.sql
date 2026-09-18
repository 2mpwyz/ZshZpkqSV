create extension if not exists pgcrypto;

create table if not exists public.books_organizations (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  country_code text not null default 'UG',
  base_currency char(3) not null default 'UGX',
  owner_id uuid not null references auth.users(id) on delete restrict,
  created_at timestamptz not null default now()
);

create table if not exists public.books_memberships (
  organization_id uuid not null references public.books_organizations(id) on delete cascade,
  user_id uuid not null references auth.users(id) on delete cascade,
  role text not null default 'member' check (role in ('owner', 'admin', 'member', 'provider')),
  created_at timestamptz not null default now(),
  primary key (organization_id, user_id)
);

create or replace function public.user_books_organization_ids()
returns setof uuid language sql stable security definer set search_path = public
as $$ select organization_id from public.books_memberships where user_id = auth.uid() $$;

create or replace function public.get_or_create_books_organization()
returns uuid language plpgsql security definer set search_path = public
as $$
declare organization_id uuid;
begin
  select bm.organization_id into organization_id from public.books_memberships bm where bm.user_id = auth.uid() order by bm.created_at limit 1;
  if organization_id is null then
    insert into public.books_organizations (name, owner_id) values ('My business', auth.uid()) returning id into organization_id;
    insert into public.books_memberships (organization_id, user_id, role) values (organization_id, auth.uid(), 'owner');
    insert into public.books_accounts (organization_id, code, name, type, is_system) values
      (organization_id, '1000', 'Cash and bank', 'asset', true),
      (organization_id, '1100', 'Accounts receivable', 'asset', true),
      (organization_id, '2000', 'Accounts payable', 'liability', true),
      (organization_id, '3000', 'Owner equity', 'equity', true),
      (organization_id, '4000', 'Sales revenue', 'income', true),
      (organization_id, '5000', 'Operating expenses', 'expense', true);
  end if;
  return organization_id;
end;
$$;

grant execute on function public.get_or_create_books_organization() to authenticated;

create table if not exists public.books_contacts (
  id uuid primary key default gen_random_uuid(),
  organization_id uuid not null references public.books_organizations(id) on delete cascade,
  name text not null,
  type text not null check (type in ('customer', 'vendor', 'both')),
  email text,
  phone text,
  tax_id text,
  country_code text not null default 'UG',
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists public.books_invoices (
  id uuid primary key default gen_random_uuid(),
  organization_id uuid not null references public.books_organizations(id) on delete cascade,
  contact_id uuid references public.books_contacts(id) on delete restrict,
  invoice_number text not null,
  issue_date date not null default current_date,
  due_date date not null,
  currency_code char(3) not null default 'UGX',
  subtotal numeric(20,4) not null check (subtotal >= 0),
  tax_amount numeric(20,4) not null default 0 check (tax_amount >= 0),
  total numeric(20,4) generated always as (subtotal + tax_amount) stored,
  status text not null default 'draft' check (status in ('draft', 'sent', 'paid', 'overdue', 'void')),
  notes text,
  created_at timestamptz not null default now(),
  unique (organization_id, invoice_number)
);

create table if not exists public.books_expenses (
  id uuid primary key default gen_random_uuid(),
  organization_id uuid not null references public.books_organizations(id) on delete cascade,
  contact_id uuid references public.books_contacts(id) on delete restrict,
  description text not null,
  expense_date date not null default current_date,
  currency_code char(3) not null default 'UGX',
  amount numeric(20,4) not null check (amount > 0),
  tax_amount numeric(20,4) not null default 0 check (tax_amount >= 0),
  payment_status text not null default 'paid' check (payment_status in ('paid', 'unpaid')),
  receipt_url text,
  created_at timestamptz not null default now()
);

create table if not exists public.books_accounts (
  id uuid primary key default gen_random_uuid(),
  organization_id uuid not null references public.books_organizations(id) on delete cascade,
  code text not null,
  name text not null,
  type text not null check (type in ('asset', 'liability', 'equity', 'income', 'expense')),
  is_system boolean not null default false,
  unique (organization_id, code)
);

create table if not exists public.books_journal_transactions (
  id uuid primary key default gen_random_uuid(),
  organization_id uuid not null references public.books_organizations(id) on delete cascade,
  source_type text not null,
  source_id uuid,
  transaction_date date not null default current_date,
  description text not null,
  created_by uuid not null references auth.users(id),
  created_at timestamptz not null default now()
);

create table if not exists public.books_journal_lines (
  id uuid primary key default gen_random_uuid(),
  transaction_id uuid not null references public.books_journal_transactions(id) on delete restrict,
  account_id uuid not null references public.books_accounts(id) on delete restrict,
  debit numeric(20,4) not null default 0 check (debit >= 0),
  credit numeric(20,4) not null default 0 check (credit >= 0),
  currency_code char(3) not null default 'UGX',
  exchange_rate numeric(20,8) not null default 1 check (exchange_rate > 0),
  check ((debit = 0 and credit > 0) or (credit = 0 and debit > 0))
);

create or replace function public.prevent_books_journal_mutation()
returns trigger language plpgsql set search_path = public
as $$ begin raise exception 'Posted accounting entries are immutable'; end; $$;

create or replace function public.assert_books_journal_balanced()
returns trigger language plpgsql set search_path = public
as $$
declare difference numeric;
begin
  select coalesce(sum(debit), 0) - coalesce(sum(credit), 0) into difference
  from public.books_journal_lines where transaction_id = new.transaction_id;
  if difference <> 0 then raise exception 'Journal transaction must balance debits and credits'; end if;
  return new;
end; $$;

drop trigger if exists books_journal_lines_balanced on public.books_journal_lines;
create constraint trigger books_journal_lines_balanced after insert on public.books_journal_lines deferrable initially deferred for each row execute function public.assert_books_journal_balanced();

drop trigger if exists books_journal_transactions_no_update on public.books_journal_transactions;
create trigger books_journal_transactions_no_update before update or delete on public.books_journal_transactions execute function public.prevent_books_journal_mutation();
drop trigger if exists books_journal_lines_no_update on public.books_journal_lines;
create trigger books_journal_lines_no_update before update or delete on public.books_journal_lines execute function public.prevent_books_journal_mutation();

alter table public.books_organizations enable row level security;
alter table public.books_memberships enable row level security;
alter table public.books_contacts enable row level security;
alter table public.books_invoices enable row level security;
alter table public.books_expenses enable row level security;
alter table public.books_accounts enable row level security;
alter table public.books_journal_transactions enable row level security;
alter table public.books_journal_lines enable row level security;

drop policy if exists books_org_member on public.books_organizations;
create policy books_org_member on public.books_organizations for all using (id in (select public.user_books_organization_ids())) with check (owner_id = auth.uid());
drop policy if exists books_membership_member on public.books_memberships;
create policy books_membership_member on public.books_memberships for select using (user_id = auth.uid() or organization_id in (select public.user_books_organization_ids()));

do $$ declare table_name text; begin
  foreach table_name in array array['books_contacts','books_invoices','books_expenses','books_accounts','books_journal_transactions'] loop
    execute format('drop policy if exists %I_member on public.%I', table_name, table_name);
    execute format('create policy %I_member on public.%I for all using (organization_id in (select public.user_books_organization_ids())) with check (organization_id in (select public.user_books_organization_ids()))', table_name, table_name);
  end loop;
end $$;
drop policy if exists books_journal_lines_member on public.books_journal_lines;
create policy books_journal_lines_member on public.books_journal_lines for all using (transaction_id in (select id from public.books_journal_transactions where organization_id in (select public.user_books_organization_ids()))) with check (transaction_id in (select id from public.books_journal_transactions where organization_id in (select public.user_books_organization_ids())));

create index if not exists books_contacts_org_idx on public.books_contacts (organization_id, type);
create index if not exists books_invoices_org_idx on public.books_invoices (organization_id, issue_date desc);
create index if not exists books_expenses_org_idx on public.books_expenses (organization_id, expense_date desc);
