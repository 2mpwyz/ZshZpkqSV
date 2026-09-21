alter table public.books_invoices
  drop constraint if exists books_invoices_receipt_delivery_status_check;

alter table public.books_invoices
  add constraint books_invoices_receipt_delivery_status_check
  check (receipt_delivery_status is null or receipt_delivery_status in ('queued', 'sent', 'failed', 'skipped'));

alter table public.books_invoice_webhook_deliveries
  drop constraint if exists books_invoice_webhook_deliveries_status_check;

alter table public.books_invoice_webhook_deliveries
  add constraint books_invoice_webhook_deliveries_status_check
  check (status in ('queued', 'sent', 'failed', 'skipped'));
