// Buat transaksi Snap Midtrans dari server (SERVER_KEY tidak di app)
// Client: supabase.functions.invoke('create-midtrans-snap', { body: {...} })

import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.49.1';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

const SNAP_URL = 'https://app.sandbox.midtrans.com/snap/v1/transactions';

Deno.serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders });
  }

  if (req.method !== 'POST') {
    return new Response(JSON.stringify({ error: 'Method not allowed' }), {
      status: 405,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  }

  const serverKey = Deno.env.get('MIDTRANS_SERVER_KEY');
  if (!serverKey) {
    return new Response(JSON.stringify({ error: 'MIDTRANS_SERVER_KEY not set' }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  }

  let body: {
    orderId: string;
    orderNumber: string;
    total: number;
    items: Array<{ id?: string; name: string; price: number; quantity: number }>;
    customerName?: string;
    customerEmail?: string;
  };

  try {
    body = await req.json();
  } catch {
    return new Response(JSON.stringify({ error: 'Invalid JSON' }), {
      status: 400,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  }

  const midtransOrderId = `FOODS-${body.orderNumber}`;
  const grossAmount = Math.floor(Number(body.total));

  const snapBody = {
    transaction_details: {
      order_id: midtransOrderId,
      gross_amount: grossAmount,
    },
    item_details: (body.items || []).map((item) => ({
      id: String(item.id || 'item'),
      price: Math.floor(Number(item.price)),
      quantity: item.quantity,
      name: (item.name || 'Item').substring(0, 50),
    })),
    customer_details: {
      first_name: body.customerName || 'Pelanggan',
      email: body.customerEmail || 'customer@example.com',
    },
    credit_card: { secure: true },
  };

  const auth = btoa(`${serverKey}:`);

  const mtRes = await fetch(SNAP_URL, {
    method: 'POST',
    headers: {
      Accept: 'application/json',
      'Content-Type': 'application/json',
      Authorization: `Basic ${auth}`,
    },
    body: JSON.stringify(snapBody),
  });

  const data = await mtRes.json();

  if (!mtRes.ok || !data.token) {
    const err = data.error_messages?.[0] || data.status_message || 'Midtrans error';
    return new Response(JSON.stringify({ success: false, error: err }), {
      status: 400,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  }

  // Simpan midtrans_order_id ke DB (service role)
  const supabaseUrl = Deno.env.get('SUPABASE_URL');
  const serviceRoleKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY');
  if (supabaseUrl && serviceRoleKey && body.orderId) {
    const supabase = createClient(supabaseUrl, serviceRoleKey);
    await supabase
      .from('orders')
      .update({ midtrans_order_id: midtransOrderId })
      .eq('id', body.orderId);
  }

  return new Response(
    JSON.stringify({
      success: true,
      token: data.token,
      redirect_url: data.redirect_url,
      order_id: midtransOrderId,
    }),
    { headers: { ...corsHeaders, 'Content-Type': 'application/json' } },
  );
});
