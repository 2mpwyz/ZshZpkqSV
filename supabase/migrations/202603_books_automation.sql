create table if not exists public.books_tax_rates (
  id uuid primary key default gen_random_uuid(),
  organization_id uuid not null references public.books_organizations(id) on delete cascade,
  country_code char(2) not null,
  name text not null,
  rate_percentage numeric(7,4) not null check (rate_percentage >= 0 and rate_percentage <= 100),
  effective_from date not null default current_date,
  effective_to date,
  is_active boolean not null default true,
  created_at timestamptz not null default now(),
  check (effective_to is null or effective_to >= effective_from),
  unique (organization_id, name, effective_from)
);

alter table public.books_invoices add column if not exists tax_rate_id uuid references public.books_tax_rates(id) on delete restrict;
alter table public.books_invoices add column if not exists tax_rate_percentage numeric(7,4) not null default 0 check (tax_rate_percentage >= 0 and tax_rate_percentage <= 100);

create table if not exists public.books_bank_imports (
  id uuid primary key default gen_random_uuid(),
  organization_id uuid not null references public.books_organizations(id) on delete cascade,
  file_name text not null,
  storage_key text,
  currency_code char(3) not null default 'UGX',
  status text not null default 'pending' check (status in ('pending', 'processing', 'ready', 'failed', 'completed')),
  error_message text,
  uploaded_by uuid not null references auth.users(id),
  created_at timestamptz not null default now(),
  unique (id, organization_id)
);

create table if not exists public.books_bank_import_rows (
  id uuid primary key default gen_random_uuid(),
  import_id uuid not null,
  organization_id uuid not null references public.books_organizations(id) on delete cascade,
  transaction_date date not null,
  description text not null,
  amount numeric(20,4) not null,
  currency_code char(3) not null default 'UGX',
  reference text,
  status text not null default 'pending' check (status in ('pending', 'matched', 'posted', 'ignored')),
  created_at timestamptz not null default now(),
  foreign key (import_id, organization_id) references public.books_bank_imports(id, organization_id) on delete cascade
);

create or replace function public.seed_books_tax_rates(target_organization_id uuid)
returns void language plpgsql security definer set search_path = public
as $$
begin
  if not exists (select 1 from public.books_memberships where organization_id = target_organization_id and user_id = auth.uid()) then
    raise exception 'Not authorized for this Books organization';
  end if;
  insert into public.books_tax_rates (organization_id, country_code, name, rate_percentage)
  values (target_organization_id, 'UG', 'URA VAT', 18)
  on conflict (organization_id, name, effective_from) do nothing;
end;
$$;

revoke all on function public.seed_books_tax_rates(uuid) from public;
grant execute on function public.seed_books_tax_rates(uuid) to authenticated;

create or replace function public.apply_books_invoice_tax()
returns trigger language plpgsql security definer set search_path = public
as $$
declare selected_rate numeric;
begin
  if new.tax_rate_id is not null then
    select rate_percentage into selected_rate
    from public.books_tax_rates
    where id = new.tax_rate_id
      and organization_id = new.organization_id
      and is_active
      and new.issue_date >= effective_from
      and (effective_to is null or new.issue_date <= effective_to);
    if selected_rate is null then
      raise exception 'Selected tax rate is not active for this invoice date';
    end if;
    new.tax_rate_percentage := selected_rate;
    new.tax_amount := round(new.subtotal * selected_rate / 100, 4);
  else
    new.tax_rate_percentage := 0;
    new.tax_amount := 0;
  end if;
  return new;
end;
$$;

drop trigger if exists books_invoice_tax_before_write on public.books_invoices;
create trigger books_invoice_tax_before_write
before insert or update on public.books_invoices
for each row execute function public.apply_books_invoice_tax();

create unique index if not exists books_journal_source_unique
on public.books_journal_transactions (organization_id, source_type, source_id)
where source_id is not null;

create or replace function public.post_books_journal_entry(
  target_organization_id uuid,
  source_kind text,
  source_uuid uuid,
  entry_date date,
  entry_description text,
  debit_code text,
  credit_code text,
  entry_amount numeric,
  entry_currency char(3),
  entry_user uuid
)
returns uuid language plpgsql security definer set search_path = public
as $$
declare transaction_uuid uuid; debit_account uuid; credit_account uuid;
begin
  if entry_amount <= 0 then return null; end if;
  select id into transaction_uuid from public.books_journal_transactions
  where organization_id = target_organization_id and source_type = source_kind and source_id = source_uuid;
  if transaction_uuid is not null then return transaction_uuid; end if;
  select id into debit_account from public.books_accounts where organization_id = target_organization_id and code = debit_code;
  select id into credit_account from public.books_accounts where organization_id = target_organization_id and code = credit_code;
  if debit_account is null or credit_account is null then raise exception 'Required Books account is missing'; end if;
  insert into public.books_journal_transactions (organization_id, source_type, source_id, transaction_date, description, created_by)
  values (target_organization_id, source_kind, source_uuid, entry_date, entry_description, coalesce(entry_user, (select owner_id from public.books_organizations where id = target_organization_id)))
  on conflict do nothing
  returning id into transaction_uuid;
  if transaction_uuid is null then
    select id into transaction_uuid from public.books_journal_transactions
    where organization_id = target_organization_id and source_type = source_kind and source_id = source_uuid;
    return transaction_uuid;
  end if;
  insert into public.books_journal_lines (transaction_id, account_id, debit, currency_code)
  values (transaction_uuid, debit_account, entry_amount, entry_currency);
  insert into public.books_journal_lines (transaction_id, account_id, credit, currency_code)
  values (transaction_uuid, credit_account, entry_amount, entry_currency);
  return transaction_uuid;
end;
$$;

revoke all on function public.post_books_journal_entry(uuid, text, uuid, date, text, text, text, numeric, char, uuid) from public;

create or replace function public.post_books_paid_invoice()
returns trigger language plpgsql security definer set search_path = public
as $$
begin
  if new.status = 'paid' and (tg_op = 'INSERT' or old.status is distinct from 'paid') then
    perform public.post_books_journal_entry(new.organization_id, 'invoice_payment', new.id, new.issue_date, 'Payment received for invoice ' || new.invoice_number, '1000', '1100', new.total, new.currency_code, auth.uid());
  end if;
  return new;
end;
$$;

drop trigger if exists books_invoice_paid_post on public.books_invoices;
create trigger books_invoice_paid_post
after insert or update of status on public.books_invoices
for each row execute function public.post_books_paid_invoice();

create or replace function public.post_books_expense()
returns trigger language plpgsql security definer set search_path = public
as $$
begin
  perform public.post_books_journal_entry(new.organization_id, 'expense', new.id, new.expense_date, 'Expense: ' || new.description, '5000', '1000', new.amount + new.tax_amount, new.currency_code, auth.uid());
  return new;
end;
$$;

drop trigger if exists books_expense_post on public.books_expenses;
create trigger books_expense_post
after insert on public.books_expenses
for each row execute function public.post_books_expense();

revoke all on function public.apply_books_invoice_tax() from public;
revoke all on function public.post_books_paid_invoice() from public;
revoke all on function public.post_books_expense() from public;

alter table public.books_tax_rates enable row level security;
alter table public.books_bank_imports enable row level security;
alter table public.books_bank_import_rows enable row level security;

drop policy if exists books_tax_rates_member on public.books_tax_rates;
create policy books_tax_rates_member on public.books_tax_rates for all using (organization_id in (select public.user_books_organization_ids())) with check (organization_id in (select public.user_books_organization_ids()));
drop policy if exists books_bank_imports_member on public.books_bank_imports;
create policy books_bank_imports_member on public.books_bank_imports for all using (organization_id in (select public.user_books_organization_ids())) with check (organization_id in (select public.user_books_organization_ids()));
drop policy if exists books_bank_import_rows_member on public.books_bank_import_rows;
create policy books_bank_import_rows_member on public.books_bank_import_rows for all using (organization_id in (select public.user_books_organization_ids())) with check (organization_id in (select public.user_books_organization_ids()));

create index if not exists books_tax_rates_org_idx on public.books_tax_rates (organization_id, country_code, is_active);
create index if not exists books_bank_import_rows_import_idx on public.books_bank_import_rows (import_id, status);

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
  perform public.seed_books_tax_rates(organization_id);
  return organization_id;
end;
$$;
