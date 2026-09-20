create extension if not exists pg_net;

alter table public.books_invoices
  add column if not exists receipt_delivery_status text
    check (receipt_delivery_status is null or receipt_delivery_status in ('queued', 'sent', 'failed'));

alter table public.books_invoices
  add column if not exists receipt_delivery_error text;

alter table public.books_invoices
  add column if not exists receipt_delivery_attempted_at timestamptz;

create unique index if not exists books_invoices_id_organization_uidx
  on public.books_invoices (id, organization_id);

create table if not exists public.books_invoice_webhook_deliveries (
  id uuid primary key default gen_random_uuid(),
  invoice_id uuid not null,
  organization_id uuid not null references public.books_organizations(id) on delete cascade,
  foreign key (invoice_id, organization_id)
    references public.books_invoices(id, organization_id) on delete cascade,
  event_type text not null,
  correlation_id uuid not null default gen_random_uuid(),
  dedupe_key text not null,
  sanitized_payload jsonb not null default '{}'::jsonb,
  pg_net_request_id bigint,
  status text not null default 'queued' check (status in ('queued', 'sent', 'failed')),
  attempt_count integer not null default 0 check (attempt_count >= 0),
  http_status integer,
  sanitized_response jsonb,
  sanitized_error text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  sent_at timestamptz,
  unique (organization_id, dedupe_key)
);

create index if not exists books_invoice_webhook_deliveries_invoice_idx
  on public.books_invoice_webhook_deliveries (invoice_id, created_at desc);

create index if not exists books_invoice_webhook_deliveries_org_status_idx
  on public.books_invoice_webhook_deliveries (organization_id, status, created_at desc);

alter table public.books_invoice_webhook_deliveries enable row level security;

drop policy if exists books_invoice_webhook_deliveries_member
  on public.books_invoice_webhook_deliveries;
create policy books_invoice_webhook_deliveries_member
on public.books_invoice_webhook_deliveries
for all
using (
  organization_id in (select public.user_books_organization_ids())
)
with check (
  organization_id in (select public.user_books_organization_ids())
);

create or replace function public.send_paid_invoice_pdf_webhook()
returns trigger
language plpgsql
security definer
set search_path = public, extensions, net
as $$
declare
  webhook_body jsonb;
  delivery_id uuid;
  request_id bigint;
  dedupe_value text;
  correlation_value uuid;
begin
  if new.status = 'paid'
     and (
       tg_op = 'INSERT'
       or old.status is distinct from 'paid'
     ) then
    begin
      dedupe_value := 'invoice_paid:' || new.id::text;
      correlation_value := gen_random_uuid();
      webhook_body := jsonb_build_object(
        'correlationId', correlation_value::text,
        'type', tg_op,
        'table', tg_table_name,
        'schema', tg_table_schema,
        'record', to_jsonb(new),
        'old_record',
          case
            when tg_op = 'UPDATE' then to_jsonb(old)
            else null
          end
      );

      insert into public.books_invoice_webhook_deliveries (
        invoice_id,
        organization_id,
        event_type,
        correlation_id,
        dedupe_key,
        sanitized_payload,
        attempt_count,
        status
      )
      values (
        new.id,
        new.organization_id,
        'invoice.paid',
        correlation_value,
        dedupe_value,
        webhook_body,
        1,
        'queued'
      )
      on conflict (organization_id, dedupe_key) do nothing
      returning id into delivery_id;

      if delivery_id is not null then
        select net.http_post(
          url := 'https://us-central1-speshio.cloudfunctions.net/generateAndSendInvoicePDF',
          headers := jsonb_build_object(
            'Content-Type', 'application/json',
            'X-Webhook-Secret', 'REPLACE_WITH_YOUR_NEW_WEBHOOK_SECRET'
          ),
          body := webhook_body,
          timeout_milliseconds := 10000
        ) into request_id;

        update public.books_invoice_webhook_deliveries
        set pg_net_request_id = request_id,
            updated_at = now()
        where id = delivery_id;

        update public.books_invoices
        set receipt_delivery_status = 'queued',
            receipt_delivery_error = null,
            receipt_delivery_attempted_at = now()
        where id = new.id;
      end if;
    exception when others then
      if delivery_id is not null then
        update public.books_invoice_webhook_deliveries
        set status = 'failed',
            sanitized_error = left(sqlerrm, 2000),
            updated_at = now()
        where id = delivery_id;
      end if;

      begin
        update public.books_invoices
        set receipt_delivery_status = 'failed',
            receipt_delivery_error = left(sqlerrm, 2000),
            receipt_delivery_attempted_at = now()
        where id = new.id;
      exception when others then
        null;
      end;
    end;
  end if;

  return new;
end;
$$;

drop trigger if exists send_paid_invoice_pdf
on public.books_invoices;

create trigger send_paid_invoice_pdf
after insert or update of status
on public.books_invoices
for each row
execute function public.send_paid_invoice_pdf_webhook();

revoke all on function public.send_paid_invoice_pdf_webhook()
from public;
