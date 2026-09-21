alter table public.user_profiles
  add column if not exists organization_name text;

alter table public.books_organizations
  add column if not exists address text,
  add column if not exists city text,
  add column if not exists state text,
  add column if not exists postal_code text,
  add column if not exists country text,
  add column if not exists phone text,
  add column if not exists email text,
  add column if not exists website text,
  add column if not exists logo_url text;

create or replace function public.get_or_create_books_organization()
returns uuid
language plpgsql
security definer
set search_path = public
as $$
declare
  target_organization_id uuid;
  target_name text;
begin
  select organization_name
    into target_name
    from public.user_profiles
   where user_id = auth.uid();

  select bm.organization_id
    into target_organization_id
    from public.books_memberships bm
   where bm.user_id = auth.uid()
   order by bm.created_at
   limit 1;

  if target_organization_id is null then
    insert into public.books_organizations (name, owner_id)
    values (coalesce(nullif(trim(target_name), ''), 'My business'), auth.uid())
    returning id into target_organization_id;

    insert into public.books_memberships (organization_id, user_id, role)
    values (target_organization_id, auth.uid(), 'owner');

    insert into public.books_accounts (organization_id, code, name, type, is_system)
    values
      (target_organization_id, '1000', 'Cash and bank', 'asset', true),
      (target_organization_id, '1100', 'Accounts receivable', 'asset', true),
      (target_organization_id, '2000', 'Accounts payable', 'liability', true),
      (target_organization_id, '3000', 'Owner equity', 'equity', true),
      (target_organization_id, '4000', 'Sales revenue', 'income', true),
      (target_organization_id, '5000', 'Operating expenses', 'expense', true);
  end if;

  insert into public.books_menu_sales_settings (id, organization_id)
  values (true, target_organization_id)
  on conflict (id) do nothing;

  return target_organization_id;
end;
$$;

grant execute on function public.get_or_create_books_organization() to authenticated;

create or replace function public.sync_manager_books_organization_name()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
begin
  if new.organization_name is distinct from old.organization_name then
    update public.books_organizations bo
       set name = coalesce(nullif(trim(new.organization_name), ''), bo.name)
      from public.books_memberships bm
     where bm.organization_id = bo.id
       and bm.user_id = new.user_id
       and bm.role = 'owner';
  end if;
  return new;
end;
$$;

drop trigger if exists sync_manager_books_organization_name on public.user_profiles;
create trigger sync_manager_books_organization_name
after update of organization_name
on public.user_profiles
for each row
execute function public.sync_manager_books_organization_name();

revoke all on function public.sync_manager_books_organization_name() from public;

alter table public.menu_orders
  add column if not exists books_invoice_id uuid references public.books_invoices(id) on delete set null,
  add column if not exists books_accounting_status text not null default 'pending',
  add column if not exists books_accounting_error text;

create table if not exists public.books_menu_sales_settings (
  id boolean primary key default true check (id),
  organization_id uuid not null references public.books_organizations(id) on delete restrict,
  updated_at timestamptz not null default now()
);

alter table public.books_menu_sales_settings enable row level security;

drop policy if exists books_menu_sales_settings_member on public.books_menu_sales_settings;
create policy books_menu_sales_settings_member
  on public.books_menu_sales_settings
  for all
  using (organization_id in (select public.user_books_organization_ids()))
  with check (organization_id in (select public.user_books_organization_ids()));

create or replace function public.post_paid_menu_order_to_books_v2()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
declare
  seller_organization_id uuid;
  customer_contact_id uuid;
  invoice_uuid uuid;
  tax_uuid uuid;
  customer_name text;
  customer_email text;
  customer_phone text;
  order_subtotal numeric;
  order_tax numeric;
  order_currency char(3);
  tax_percentage numeric;
  order_date date := coalesce(new.created_at::date, current_date);
begin
  if new.payment_status <> 'paid'
     or not (tg_op = 'INSERT' or old.payment_status is distinct from 'paid')
     or new.books_invoice_id is not null then
    return new;
  end if;

  select organization_id
    into seller_organization_id
    from public.books_menu_sales_settings
   where id = true;

  if seller_organization_id is null and new.user_id is not null then
    select min(bm.organization_id)
      into seller_organization_id
      from public.books_memberships bm
     where bm.user_id = new.user_id
     group by bm.user_id
    having count(*) = 1;
  end if;

  if seller_organization_id is null then
    update public.menu_orders
       set books_accounting_status = 'failed',
           books_accounting_error = 'No Books organization is configured for menu sales'
     where id = new.id;
    return new;
  end if;

  customer_name := nullif(trim(concat_ws(' ', new.first_name, new.last_name)), '');
  customer_email := nullif(trim(new.email), '');
  customer_phone := nullif(trim(new.phone), '');

  if new.user_id is not null then
    select first_name, last_name, email, phone
      into customer_name, customer_email, customer_phone
      from public.user_profiles up
     where up.user_id = new.user_id;
    customer_name := coalesce(customer_name, nullif(trim(concat_ws(' ', new.first_name, new.last_name)), ''));
    customer_email := coalesce(customer_email, nullif(trim(new.email), ''));
    customer_phone := coalesce(customer_phone, nullif(trim(new.phone), ''));
  end if;

  if customer_email is null then
    update public.menu_orders
       set books_accounting_status = 'failed',
           books_accounting_error = 'A customer email is required for the Books invoice'
     where id = new.id;
    return new;
  end if;

  order_tax := coalesce(new.tax_amount, 0);
  order_subtotal := coalesce(new.subtotal, new.total_amount - order_tax);
  order_currency := upper(coalesce(new.currency, 'USD'))::char(3);

  select id
    into customer_contact_id
    from public.books_contacts
   where organization_id = seller_organization_id
     and lower(email) = lower(customer_email)
     and type in ('customer', 'both')
   order by created_at
   limit 1;

  if customer_contact_id is null then
    insert into public.books_contacts (organization_id, name, type, email, phone)
    values (
      seller_organization_id,
      coalesce(customer_name, customer_email),
      'customer',
      customer_email,
      customer_phone
    )
    returning id into customer_contact_id;
  else
    update public.books_contacts
       set name = coalesce(customer_name, name),
           phone = coalesce(customer_phone, phone),
           updated_at = now()
     where id = customer_contact_id;
  end if;

  if order_tax > 0 and order_subtotal > 0 then
    tax_percentage := round(order_tax / order_subtotal * 100, 4);
    insert into public.books_tax_rates (organization_id, country_code, name, rate_percentage)
    values (
      seller_organization_id,
      'UG',
      'Menu sale tax ' || tax_percentage || '%',
      tax_percentage
    ) on conflict (organization_id, name, effective_from) do nothing;

    select id
      into tax_uuid
      from public.books_tax_rates
     where organization_id = seller_organization_id
       and rate_percentage = tax_percentage
       and is_active
       and order_date >= effective_from
       and (effective_to is null or order_date <= effective_to)
     order by created_at desc
     limit 1;
  end if;

  select id
    into invoice_uuid
    from public.books_invoices
   where organization_id = seller_organization_id
     and invoice_number = 'MENU-' || new.order_number;

  if invoice_uuid is null then
    insert into public.books_invoices (
      organization_id,
      contact_id,
      invoice_number,
      issue_date,
      due_date,
      currency_code,
      subtotal,
      tax_amount,
      tax_rate_id,
      status,
      notes
    ) values (
    seller_organization_id,
    customer_contact_id,
    'MENU-' || new.order_number,
    order_date,
    order_date,
    order_currency,
    order_subtotal,
    order_tax,
    tax_uuid,
      'paid',
      'Digital menu order ' || new.order_number || ' (' || new.id || ')'
    ) returning id into invoice_uuid;
  end if;

  if not exists (
    select 1
    from public.books_invoice_lines
    where invoice_id = invoice_uuid
  ) then
    insert into public.books_invoice_lines (
    invoice_id,
    organization_id,
    description,
    quantity,
    unit_price
  )
  select
    invoice_uuid,
    seller_organization_id,
    item_name,
    quantity,
    unit_price
    from public.menu_order_items
    where order_id = new.id;
  end if;

  update public.menu_orders
     set books_invoice_id = invoice_uuid,
         books_accounting_status = 'posted',
         books_accounting_error = null
   where id = new.id;

  return new;
exception when others then
  update public.menu_orders
     set books_accounting_status = 'failed',
         books_accounting_error = left(sqlerrm, 2000)
   where id = new.id;
  return new;
end;
$$;

drop trigger if exists menu_order_paid_books on public.menu_orders;
drop trigger if exists menu_order_paid_books_v2 on public.menu_orders;
create trigger menu_order_paid_books_v2
after insert or update of payment_status
on public.menu_orders
for each row
execute function public.post_paid_menu_order_to_books_v2();

revoke all on function public.post_paid_menu_order_to_books_v2() from public;
