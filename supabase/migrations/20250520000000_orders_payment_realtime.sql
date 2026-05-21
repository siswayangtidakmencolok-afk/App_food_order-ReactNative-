-- Kolom pembayaran Midtrans + aktifkan Realtime pada tabel orders
ALTER TABLE public.orders
  ADD COLUMN IF NOT EXISTS midtrans_order_id text,
  ADD COLUMN IF NOT EXISTS payment_status text NOT NULL DEFAULT 'unpaid';

COMMENT ON COLUMN public.orders.midtrans_order_id IS 'ID transaksi Snap Midtrans, contoh: FOODS-ORD12345678';
COMMENT ON COLUMN public.orders.payment_status IS 'unpaid | paid | failed | expired';

CREATE INDEX IF NOT EXISTS orders_midtrans_order_id_idx ON public.orders (midtrans_order_id);

-- Supabase Realtime: broadcast UPDATE/INSERT pada orders
ALTER PUBLICATION supabase_realtime ADD TABLE public.orders;
