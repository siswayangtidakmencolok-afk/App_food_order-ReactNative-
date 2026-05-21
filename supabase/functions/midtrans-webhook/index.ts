// Webhook notification Midtrans → update orders di Supabase
// Deploy: supabase functions deploy midtrans-webhook --no-verify-jwt
// Dashboard Midtrans → Payment Notification URL:
//   https://<PROJECT_REF>.supabase.co/functions/v1/midtrans-webhook

import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.49.1';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

async function verifySignature(
  orderId: string,
  statusCode: string,
  grossAmount: string,
  serverKey: string,
  signatureKey: string,
): Promise<boolean> {
  const payload = orderId + statusCode + grossAmount + serverKey;
  const data = new TextEncoder().encode(payload);
  const buf = await crypto.subtle.digest('SHA-512', data);
  const hash = Array.from(new Uint8Array(buf))
    .map((b) => b.toString(16).padStart(2, '0'))
    .join('');
  return hash === signatureKey;
}

function mapPayment(transactionStatus: string): {
  payment_status: string;
  status?: string;
} {
  switch (transactionStatus) {
    case 'capture':
    case 'settlement':
      return { payment_status: 'paid', status: 'Preparing' };
    case 'pending':
      return { payment_status: 'unpaid' };
    case 'expire':
      return { payment_status: 'expired' };
    case 'deny':
    case 'cancel':
      return { payment_status: 'failed' };
    default:
      return { payment_status: 'unpaid' };
  }
}

Deno.serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders });
  }

  if (req.method !== 'POST') {
    return new Response(JSON.stringify({ message: 'Method not allowed' }), {
      status: 405,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  }

  const serverKey = Deno.env.get('MIDTRANS_SERVER_KEY');
  const supabaseUrl = Deno.env.get('SUPABASE_URL');
  const serviceRoleKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY');

  if (!serverKey || !supabaseUrl || !serviceRoleKey) {
    console.error('Missing env: MIDTRANS_SERVER_KEY, SUPABASE_URL, or SUPABASE_SERVICE_ROLE_KEY');
    return new Response(JSON.stringify({ message: 'Server misconfigured' }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  }

  let body: Record<string, string>;
  try {
    body = await req.json();
  } catch {
    return new Response(JSON.stringify({ message: 'Invalid JSON' }), {
      status: 400,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  }
  const {
    order_id: orderId,
    status_code: statusCode,
    gross_amount: grossAmount,
    signature_key: signatureKey,
    transaction_status: transactionStatus,
  } = body;

  if (!orderId || !statusCode || !grossAmount || !signatureKey) {
    return new Response(JSON.stringify({ message: 'Missing fields' }), {
      status: 400,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  }

  const valid = await verifySignature(
    orderId,
    statusCode,
    grossAmount,
    serverKey,
    signatureKey,
  );

  if (!valid) {
    console.warn('[midtrans-webhook] Invalid signature for', orderId);
    return new Response(JSON.stringify({ message: 'Invalid signature' }), {
      status: 403,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  }

  const supabase = createClient(supabaseUrl, serviceRoleKey);
  const { data: order, error: findError } = await supabase
    .from('orders')
    .select('id, total, payment_status')
    .eq('midtrans_order_id', orderId)
    .maybeSingle();

  if (findError || !order) {
    console.warn('[midtrans-webhook] Order not found:', orderId, findError?.message);
    // Tetap 200 agar Midtrans tidak retry terus-menerus untuk order tidak dikenal
    return new Response(JSON.stringify({ message: 'Order not found', order_id: orderId }), {
      status: 200,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  }

  const expectedAmount = Math.floor(Number(order.total));
  const receivedAmount = Math.floor(Number(grossAmount));
  if (expectedAmount !== receivedAmount) {
    console.warn('[midtrans-webhook] Amount mismatch', { expectedAmount, receivedAmount });
    return new Response(JSON.stringify({ message: 'Amount mismatch' }), {
      status: 400,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  }

  const mapped = mapPayment(transactionStatus || '');
  const updates: Record<string, string> = {
    payment_status: mapped.payment_status,
  };
  if (mapped.status) {
    updates.status = mapped.status;
  }

  const { error: updateError } = await supabase
    .from('orders')
    .update(updates)
    .eq('id', order.id);

  if (updateError) {
    console.error('[midtrans-webhook] Update failed:', updateError.message);
    return new Response(JSON.stringify({ message: 'Update failed' }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  }

  console.log('[midtrans-webhook] OK', orderId, transactionStatus, updates);

  return new Response(
    JSON.stringify({ message: 'OK', order_id: orderId, ...updates }),
    { status: 200, headers: { ...corsHeaders, 'Content-Type': 'application/json' } },
  );
});
