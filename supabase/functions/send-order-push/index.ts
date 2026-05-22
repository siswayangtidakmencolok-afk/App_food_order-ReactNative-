// Deploy: supabase functions deploy send-order-push
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.49.1';

const cors = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

async function sendExpoPush(tokens: string[], title: string, body: string, data?: Record<string, string>) {
  const list = tokens.filter((t) => t?.startsWith('ExponentPushToken'));
  if (!list.length) return;
  await fetch('https://exp.host/--/api/v2/push/send', {
    method: 'POST',
    headers: { Accept: 'application/json', 'Content-Type': 'application/json' },
    body: JSON.stringify(list.map((to) => ({ to, sound: 'default', title, body, data: data ?? {}, channelId: 'orders' }))),
  });
}

Deno.serve(async (req) => {
  if (req.method === 'OPTIONS') return new Response('ok', { headers: cors });
  if (req.method !== 'POST') {
    return new Response(JSON.stringify({ error: 'Method not allowed' }), { status: 405, headers: { ...cors, 'Content-Type': 'application/json' } });
  }

  const supabaseUrl = Deno.env.get('SUPABASE_URL');
  const serviceRoleKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY');
  if (!supabaseUrl || !serviceRoleKey) {
    return new Response(JSON.stringify({ error: 'Server misconfigured' }), { status: 500, headers: { ...cors, 'Content-Type': 'application/json' } });
  }

  let payload: { user_id?: string; title?: string; body?: string; data?: Record<string, string> };
  try {
    payload = await req.json();
  } catch {
    return new Response(JSON.stringify({ error: 'Invalid JSON' }), { status: 400, headers: { ...cors, 'Content-Type': 'application/json' } });
  }
  if (!payload.user_id) {
    return new Response(JSON.stringify({ error: 'user_id required' }), { status: 400, headers: { ...cors, 'Content-Type': 'application/json' } });
  }

  const supabase = createClient(supabaseUrl, serviceRoleKey);
  const { data: profile } = await supabase.from('profiles').select('expo_push_token').eq('id', payload.user_id).maybeSingle();
  if (!profile?.expo_push_token) {
    return new Response(JSON.stringify({ ok: true, sent: false }), { status: 200, headers: { ...cors, 'Content-Type': 'application/json' } });
  }

  await sendExpoPush([profile.expo_push_token], payload.title ?? 'FoodsStrets', payload.body ?? 'Update pesanan', payload.data);
  return new Response(JSON.stringify({ ok: true, sent: true }), { status: 200, headers: { ...cors, 'Content-Type': 'application/json' } });
});
