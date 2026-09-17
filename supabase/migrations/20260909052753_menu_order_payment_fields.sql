ALTER TABLE public.menu_orders
  ADD COLUMN IF NOT EXISTS currency text NOT NULL DEFAULT 'USD',
  ADD COLUMN IF NOT EXISTS payment_reference text,
  ADD COLUMN IF NOT EXISTS flutterwave_transaction_id text;

CREATE UNIQUE INDEX IF NOT EXISTS menu_orders_payment_reference_key
  ON public.menu_orders (payment_reference)
  WHERE payment_reference IS NOT NULL;

CREATE UNIQUE INDEX IF NOT EXISTS menu_orders_flutterwave_transaction_id_key
  ON public.menu_orders (flutterwave_transaction_id)
  WHERE flutterwave_transaction_id IS NOT NULL;
