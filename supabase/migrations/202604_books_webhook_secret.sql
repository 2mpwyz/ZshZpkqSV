create extension if not exists supabase_vault with schema vault;

create or replace function public.send_paid_invoice_pdf_webhook()
returns trigger
language plpgsql
security definer
set search_path = public, extensions, net
as $$
declare
  webhook_body jsonb;
  webhook_secret text;
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
    select decrypted_secret
      into webhook_secret
      from vault.decrypted_secrets
     where name = 'supabase_webhook_secret'
     limit 1;

    if webhook_secret is null or webhook_secret = '' then
      raise exception 'Vault secret supabase_webhook_secret is not configured';
    end if;

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
          'X-Webhook-Secret', webhook_secret,
          'X-Correlation-ID', correlation_value::text
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
  end if;

  return new;
exception when others then
  if delivery_id is not null then
    update public.books_invoice_webhook_deliveries
       set status = 'failed',
           sanitized_error = left(sqlerrm, 2000),
           updated_at = now()
     where id = delivery_id;
  end if;

  update public.books_invoices
     set receipt_delivery_status = 'failed',
         receipt_delivery_error = left(sqlerrm, 2000),
         receipt_delivery_attempted_at = now()
   where id = new.id;

  return new;
end;
$$;

drop trigger if exists send_paid_invoice_pdf on public.books_invoices;

create trigger send_paid_invoice_pdf
after insert or update of status
on public.books_invoices
for each row
execute function public.send_paid_invoice_pdf_webhook();

revoke all on function public.send_paid_invoice_pdf_webhook() from public;
