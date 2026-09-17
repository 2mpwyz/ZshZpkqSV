CREATE TABLE IF NOT EXISTS public.menu_carts (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  status text NOT NULL DEFAULT 'active',
  order_id uuid REFERENCES public.menu_orders(id) ON DELETE SET NULL,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now(),
  abandoned_at timestamptz
);

CREATE UNIQUE INDEX IF NOT EXISTS menu_carts_one_active_per_user
  ON public.menu_carts(user_id)
  WHERE status = 'active';

CREATE TABLE IF NOT EXISTS public.menu_cart_items (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  cart_id uuid NOT NULL REFERENCES public.menu_carts(id) ON DELETE CASCADE,
  menu_item_id uuid NOT NULL REFERENCES public.menu_items(id),
  quantity integer NOT NULL CHECK (quantity > 0),
  unit_price numeric NOT NULL,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now(),
  UNIQUE(cart_id, menu_item_id)
);

CREATE TABLE IF NOT EXISTS public.menu_payment_attempts (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  order_id uuid NOT NULL REFERENCES public.menu_orders(id) ON DELETE CASCADE,
  provider text NOT NULL DEFAULT 'flutterwave',
  tx_ref text NOT NULL UNIQUE,
  transaction_id text,
  amount numeric NOT NULL,
  currency text NOT NULL,
  status text NOT NULL DEFAULT 'initiated',
  payment_url text,
  failure_reason text,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now(),
  completed_at timestamptz,
  cancelled_at timestamptz
);

CREATE INDEX IF NOT EXISTS menu_payment_attempts_order_id_idx
  ON public.menu_payment_attempts(order_id);

CREATE UNIQUE INDEX IF NOT EXISTS menu_payment_attempts_transaction_id_key
  ON public.menu_payment_attempts(transaction_id)
  WHERE transaction_id IS NOT NULL;

ALTER TABLE public.menu_carts
  DROP CONSTRAINT IF EXISTS menu_carts_status_check;
ALTER TABLE public.menu_carts
  ADD CONSTRAINT menu_carts_status_check
  CHECK (status IN ('active', 'converted', 'abandoned')) NOT VALID;

ALTER TABLE public.menu_orders
  DROP CONSTRAINT IF EXISTS menu_orders_payment_status_check;
ALTER TABLE public.menu_orders
  ADD CONSTRAINT menu_orders_payment_status_check
  CHECK (payment_status IN ('pending', 'paid', 'failed', 'cancelled', 'expired')) NOT VALID;

ALTER TABLE public.menu_payment_attempts
  DROP CONSTRAINT IF EXISTS menu_payment_attempts_status_check;
ALTER TABLE public.menu_payment_attempts
  ADD CONSTRAINT menu_payment_attempts_status_check
  CHECK (status IN ('initiated', 'redirected', 'completed', 'failed', 'cancelled')) NOT VALID;

ALTER TABLE public.menu_carts ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.menu_cart_items ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.menu_payment_attempts ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS menu_carts_owner_select ON public.menu_carts;
CREATE POLICY menu_carts_owner_select
  ON public.menu_carts FOR SELECT
  USING (auth.uid() = user_id);

DROP POLICY IF EXISTS menu_carts_owner_insert ON public.menu_carts;
CREATE POLICY menu_carts_owner_insert
  ON public.menu_carts FOR INSERT
  WITH CHECK (auth.uid() = user_id);

DROP POLICY IF EXISTS menu_carts_owner_update ON public.menu_carts;
CREATE POLICY menu_carts_owner_update
  ON public.menu_carts FOR UPDATE
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

DROP POLICY IF EXISTS menu_carts_owner_delete ON public.menu_carts;
CREATE POLICY menu_carts_owner_delete
  ON public.menu_carts FOR DELETE
  USING (auth.uid() = user_id);

DROP POLICY IF EXISTS menu_cart_items_owner_select ON public.menu_cart_items;
CREATE POLICY menu_cart_items_owner_select
  ON public.menu_cart_items FOR SELECT
  USING (EXISTS (
    SELECT 1 FROM public.menu_carts
    WHERE menu_carts.id = menu_cart_items.cart_id
      AND menu_carts.user_id = auth.uid()
  ));

DROP POLICY IF EXISTS menu_cart_items_owner_insert ON public.menu_cart_items;
CREATE POLICY menu_cart_items_owner_insert
  ON public.menu_cart_items FOR INSERT
  WITH CHECK (EXISTS (
    SELECT 1 FROM public.menu_carts
    WHERE menu_carts.id = menu_cart_items.cart_id
      AND menu_carts.user_id = auth.uid()
  ));

DROP POLICY IF EXISTS menu_cart_items_owner_update ON public.menu_cart_items;
CREATE POLICY menu_cart_items_owner_update
  ON public.menu_cart_items FOR UPDATE
  USING (EXISTS (
    SELECT 1 FROM public.menu_carts
    WHERE menu_carts.id = menu_cart_items.cart_id
      AND menu_carts.user_id = auth.uid()
  ))
  WITH CHECK (EXISTS (
    SELECT 1 FROM public.menu_carts
    WHERE menu_carts.id = menu_cart_items.cart_id
      AND menu_carts.user_id = auth.uid()
  ));

DROP POLICY IF EXISTS menu_cart_items_owner_delete ON public.menu_cart_items;
CREATE POLICY menu_cart_items_owner_delete
  ON public.menu_cart_items FOR DELETE
  USING (EXISTS (
    SELECT 1 FROM public.menu_carts
    WHERE menu_carts.id = menu_cart_items.cart_id
      AND menu_carts.user_id = auth.uid()
  ));

DROP POLICY IF EXISTS menu_payment_attempts_owner_select ON public.menu_payment_attempts;
CREATE POLICY menu_payment_attempts_owner_select
  ON public.menu_payment_attempts FOR SELECT
  USING (EXISTS (
    SELECT 1 FROM public.menu_orders
    WHERE menu_orders.id = menu_payment_attempts.order_id
      AND menu_orders.user_id = auth.uid()
  ));
