create extension if not exists pg_net;

create or replace function public.send_paid_invoice_pdf_webhook()
returns trigger
language plpgsql
security definer
set search_path = public, extensions, net
as $$
declare
  webhook_body jsonb;
begin
  if new.status = 'paid'
     and (
       tg_op = 'INSERT'
       or old.status is distinct from 'paid'
     ) then

    webhook_body := jsonb_build_object(
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

    perform net.http_post(
      url := 'https://us-central1-speshio.cloudfunctions.net/generateAndSendInvoicePDF',
      headers := jsonb_build_object(
        'Content-Type', 'application/json',
        'X-Webhook-Secret', 'REPLACE_WITH_YOUR_NEW_WEBHOOK_SECRET'
      ),
      body := webhook_body,
      timeout_milliseconds := 10000
    );
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
