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

create or replace function public.post_paid_menu_order_to_books()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
declare
  target_organization_id uuid;
  target_contact_id uuid;
  target_invoice_id uuid;
  target_tax_rate_id uuid;
  menu_tax_rate numeric;
  order_subtotal numeric;
  order_tax numeric;
  order_total numeric;
  order_email text;
  order_name text;
  order_currency char(3);
  order_date date;
begin
  if new.payment_status <> 'paid'
     or not (tg_op = 'INSERT' or old.payment_status is distinct from 'paid')
     or new.books_invoice_id is not null then
    return new;
  end if;

  select organization_id
    into target_organization_id
    from public.books_menu_sales_settings
   where id = true;

  if target_organization_id is null then
    select min(id)
      into target_organization_id
      from public.books_organizations;

    if (select count(*) from public.books_organizations) <> 1 then
      update public.menu_orders
         set books_accounting_status = 'failed',
             books_accounting_error = 'Configure one Books organization for digital menu sales'
       where id = new.id;
      return new;
    end if;
  end if;

  order_subtotal := coalesce(new.subtotal, new.total_amount - coalesce(new.tax_amount, 0));
  order_tax := coalesce(new.tax_amount, 0);
  order_total := coalesce(new.total_amount, order_subtotal + order_tax);
  order_currency := upper(coalesce(new.currency, 'USD'))::char(3);
  order_date := current_date;
  order_email := nullif(trim(new.email), '');
  order_name := nullif(trim(concat_ws(' ', new.first_name, new.last_name)), '');

  if order_subtotal <= 0 or order_total <= 0 or order_email is null then
    update public.menu_orders
       set books_accounting_status = 'failed',
           books_accounting_error = 'Menu order is missing a valid total or customer email'
     where id = new.id;
    return new;
  end if;

  select id
    into target_contact_id
    from public.books_contacts
   where organization_id = target_organization_id
     and lower(email) = lower(order_email)
     and type in ('customer', 'both')
   order by created_at
   limit 1;

  if target_contact_id is null then
    insert into public.books_contacts (
      organization_id,
      name,
      type,
      email,
      phone
    ) values (
      target_organization_id,
      coalesce(order_name, order_email),
      'customer',
      order_email,
      nullif(trim(new.phone), '')
    ) returning id into target_contact_id;
  end if;

  if order_tax > 0 and order_subtotal > 0 then
    menu_tax_rate := round(order_tax / order_subtotal * 100, 4);
    insert into public.books_tax_rates (
      organization_id,
      country_code,
      name,
      rate_percentage
    ) values (
      target_organization_id,
      'UG',
      'Digital menu tax ' || menu_tax_rate || '%',
      menu_tax_rate
    ) on conflict (organization_id, name, effective_from) do nothing;

    select id
      into target_tax_rate_id
      from public.books_tax_rates
     where organization_id = target_organization_id
       and rate_percentage = menu_tax_rate
       and is_active
       and order_date >= effective_from
       and (effective_to is null or order_date <= effective_to)
     order by created_at desc
     limit 1;
  end if;

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
    target_organization_id,
    target_contact_id,
    'MENU-' || new.order_number,
    order_date,
    order_date,
    order_currency,
    order_subtotal,
    order_tax,
    target_tax_rate_id,
    'paid',
    'Digital menu order ' || new.order_number || ' (' || new.id || ')'
  ) returning id into target_invoice_id;

  update public.menu_orders
     set books_invoice_id = target_invoice_id,
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
create trigger menu_order_paid_books
after insert or update of payment_status
on public.menu_orders
for each row
execute function public.post_paid_menu_order_to_books();

revoke all on function public.post_paid_menu_order_to_books() from public;
