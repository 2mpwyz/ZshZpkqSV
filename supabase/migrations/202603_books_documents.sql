create unique index if not exists books_invoices_id_org_idx
on public.books_invoices (id, organization_id);

alter table public.books_invoices
  add column if not exists receipt_url text;

alter table public.books_invoices
  add column if not exists receipt_storage_key text;

create table if not exists public.books_invoice_lines (
  id uuid primary key default gen_random_uuid(),
  invoice_id uuid not null references public.books_invoices(id) on delete cascade,
  organization_id uuid not null references public.books_organizations(id) on delete cascade,
  description text not null,
  quantity numeric(20,4) not null default 1 check (quantity > 0),
  unit_price numeric(20,4) not null check (unit_price >= 0),
  line_total numeric(20,4) generated always as (quantity * unit_price) stored,
  created_at timestamptz not null default now(),
  foreign key (invoice_id, organization_id) references public.books_invoices(id, organization_id) on delete cascade
);

create unique index if not exists books_invoice_lines_invoice_org_idx
on public.books_invoice_lines (id, organization_id);

alter table public.books_invoice_lines enable row level security;

drop policy if exists books_invoice_lines_member on public.books_invoice_lines;
create policy books_invoice_lines_member
on public.books_invoice_lines
for all
using (
  organization_id in (
    select public.user_books_organization_ids()
  )
)
with check (
  organization_id in (
    select public.user_books_organization_ids()
  )
);

create index if not exists books_invoice_lines_invoice_idx
on public.books_invoice_lines (invoice_id, created_at);
