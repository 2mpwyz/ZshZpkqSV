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
  profile_name text;
  profile_email text;
  profile_phone text;
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

  select organization_id into seller_organization_id
    from public.books_menu_sales_settings where id = true;

  if seller_organization_id is null then
    select bm.organization_id into seller_organization_id
      from public.menu_order_items moi
      join public.menu_items mi on mi.id = moi.menu_item_id
      join public.books_memberships bm on bm.user_id = mi.managed_by
     where moi.order_id = new.id
     order by bm.created_at limit 1;
  end if;

  if seller_organization_id is null and new.user_id is not null then
    select bm.organization_id into seller_organization_id
      from public.books_memberships bm
     where bm.user_id = new.user_id
     order by bm.created_at limit 1;
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
    select nullif(trim(concat_ws(' ', first_name, last_name)), ''),
           nullif(trim(email), ''), nullif(trim(phone), '')
      into profile_name, profile_email, profile_phone
      from public.user_profiles
     where user_id = new.user_id;
    customer_name := coalesce(customer_name, profile_name);
    customer_email := coalesce(customer_email, profile_email);
    customer_phone := coalesce(customer_phone, profile_phone);
  end if;

  order_tax := coalesce(new.tax_amount, 0);
  order_subtotal := coalesce(new.subtotal, new.total_amount - order_tax);
  order_currency := upper(coalesce(new.currency, 'USD'))::char(3);

  if customer_email is not null then
    select id into customer_contact_id
      from public.books_contacts
     where organization_id = seller_organization_id
       and lower(email) = lower(customer_email)
       and type in ('customer', 'both')
     order by created_at limit 1;
  end if;

  if customer_contact_id is null then
    insert into public.books_contacts (organization_id, name, type, email, phone)
    values (seller_organization_id, coalesce(customer_name, customer_email, 'Menu customer'),
            'customer', customer_email, customer_phone)
    returning id into customer_contact_id;
  else
    update public.books_contacts
       set name = coalesce(customer_name, name),
           phone = coalesce(customer_phone, phone), updated_at = now()
     where id = customer_contact_id;
  end if;

  if order_tax > 0 and order_subtotal > 0 then
    tax_percentage := round(order_tax / order_subtotal * 100, 4);
    insert into public.books_tax_rates (organization_id, country_code, name, rate_percentage)
    values (seller_organization_id, 'UG', 'Menu sale tax ' || tax_percentage || '%', tax_percentage)
    on conflict (organization_id, name, effective_from) do nothing;

    select id into tax_uuid
      from public.books_tax_rates
     where organization_id = seller_organization_id
       and rate_percentage = tax_percentage and is_active
       and order_date >= effective_from
       and (effective_to is null or order_date <= effective_to)
     order by created_at desc limit 1;
  end if;

  select id into invoice_uuid
    from public.books_invoices
   where organization_id = seller_organization_id
     and invoice_number = 'MENU-' || new.order_number;

  if invoice_uuid is null then
    insert into public.books_invoices (
      organization_id, contact_id, invoice_number, issue_date, due_date,
      currency_code, subtotal, tax_amount, tax_rate_id, status, notes
    ) values (
      seller_organization_id, customer_contact_id, 'MENU-' || new.order_number,
      order_date, order_date, order_currency, order_subtotal, order_tax,
      tax_uuid, 'paid', 'Digital menu order ' || new.order_number || ' (' || new.id || ')'
    ) returning id into invoice_uuid;
  end if;

  if not exists (select 1 from public.books_invoice_lines where invoice_id = invoice_uuid) then
    insert into public.books_invoice_lines (invoice_id, organization_id, description, quantity, unit_price)
    select invoice_uuid, seller_organization_id, item_name, quantity, unit_price
      from public.menu_order_items where order_id = new.id;
  end if;

  update public.menu_orders
     set books_invoice_id = invoice_uuid,
         books_accounting_status = 'posted', books_accounting_error = null
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

revoke all on function public.post_paid_menu_order_to_books_v2() from public;
