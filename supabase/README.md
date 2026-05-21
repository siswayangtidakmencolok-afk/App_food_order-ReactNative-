# Supabase: Midtrans Webhook + Realtime

## Cara kerja (ringkas)

```
[App] saveOrder → status: Pending, payment_status: unpaid
[App] create-midtrans-snap (Edge Function) → Snap URL + simpan midtrans_order_id
[User] bayar di Midtrans WebView
[Midtrans] POST webhook → midtrans-webhook (Edge Function)
[Edge Function] verifikasi signature → UPDATE orders (paid, Preparing)
[Supabase Realtime] broadcast UPDATE ke semua client yang subscribe
[App] AppContext terima event → orderHistory & notifikasi ter-update
[GatewayScreen] deteksi payment_status === paid → navigasi ke Lacak Pesanan
```

### 1. Edge Function `midtrans-webhook`

- Midtrans mengirim HTTP POST setiap status transaksi berubah.
- Function memverifikasi `signature_key` (SHA512) dengan `MIDTRANS_SERVER_KEY`.
- Mencari order: `midtrans_order_id = order_id` dari Midtrans.
- Mengupdate `payment_status` dan `status` (delivery).

### 2. Edge Function `create-midtrans-snap`

- Membuat transaksi Snap **di server** (SERVER_KEY aman).
- Menyimpan `midtrans_order_id` ke baris order.

### 3. Supabase Realtime

- Migration menambahkan tabel `orders` ke publication `supabase_realtime`.
- App subscribe channel `orders-{userId}` filter `user_id=eq.{id}`.
- Setiap UPDATE di DB langsung masuk ke `orderHistory` tanpa refresh manual.

---

## Setup (sekali)

### A. Jalankan migration SQL

Di **Supabase Dashboard → SQL Editor**, jalankan isi file:

`migrations/20250520000000_orders_payment_realtime.sql`

### B. Secrets Edge Function

```bash
supabase login
supabase link --project-ref qwidhvmdcaituefyzkeo

supabase secrets set MIDTRANS_SERVER_KEY=SB-Mid-server-xxx
```

`SUPABASE_URL` dan `SUPABASE_SERVICE_ROLE_KEY` biasanya sudah otomatis di environment function.

### C. Deploy functions

```bash
supabase functions deploy create-midtrans-snap
supabase functions deploy midtrans-webhook --no-verify-jwt
```

`--no-verify-jwt` wajib untuk webhook: Midtrans tidak mengirim header Authorization Supabase.

### D. Midtrans Dashboard

**Settings → Configuration → Payment Notification URL:**

```
https://qwidhvmdcaituefyzkeo.supabase.co/functions/v1/midtrans-webhook
```

Pastikan mode **Sandbox** sama dengan `BASE_URL` di app.

### E. Realtime di Dashboard (jika migration gagal)

**Database → Replication** → aktifkan `orders` untuk Realtime.

---

## Testing webhook lokal (opsional)

```bash
supabase functions serve midtrans-webhook --no-verify-jwt
```

Gunakan [Midtrans Simulator](https://simulator.sandbox.midtrans.com/)atau kirim sample notification dari dashboard.
