import { serve } from "https://deno.land/std@0.168.0/http/server.ts"

const RESEND_API_KEY = Deno.env.get("RESEND_API_KEY")

serve(async (req) => {
  // CORS Headers
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: { 'Access-Control-Allow-Origin': '*', 'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type' } })
  }

  try {
    const payload = await req.json();
    
    // The webhook payload from pg_net usually contains 'record' with the new row.
    const record = payload.record;
    
    if (!record || !record.user_id) {
      return new Response(JSON.stringify({ error: "Invalid payload, missing user_id" }), { status: 400 });
    }

    if (!RESEND_API_KEY) {
       console.error("RESEND_API_KEY is not set.");
       return new Response(JSON.stringify({ error: "Server Configuration Error" }), { status: 500 });
    }

    // Initialize Supabase Client to fetch user email (using service role key)
    // To keep this pure HTTP without heavy dependencies, we could also pass the email in the webhook
    // but fetching is safer. For simplicity, assuming the webhook includes email in the payload 
    // or we fetch it. But since this is pg_net, we might only have `record`.
    
    // Simplest Resend Fetch Implementation
    const res = await fetch('https://api.resend.com/emails', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${RESEND_API_KEY}`
      },
      body: JSON.stringify({
        from: 'Branding.tn <hello@branding.tn>', // Ensure domain is verified in Resend
        to: ['client@example.com'], // Replace with actual lookup or webhook field
        subject: record.title || 'New Notification from Branding.tn',
        html: `
          <div style="font-family: sans-serif; max-w-md; margin: auto; padding: 20px; border: 1px solid #eee; border-radius: 12px;">
            <h2 style="color: #111;">${record.title || 'New Notification'}</h2>
            <p style="color: #444; line-height: 1.5;">${record.body || 'You have a new update on your project.'}</p>
            <hr style="border: none; border-top: 1px solid #eee; margin: 20px 0;" />
            <a href="https://branding-tn.vercel.app/dashboard" style="display: inline-block; background: #000; color: #fff; padding: 10px 20px; text-decoration: none; border-radius: 8px; font-weight: bold;">View in Dashboard</a>
          </div>
        `
      })
    })

    const data = await res.json()
    return new Response(JSON.stringify(data), {
      headers: { 'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*' },
      status: res.ok ? 200 : 400
    })

  } catch (error) {
    return new Response(JSON.stringify({ error: error.message }), {
      headers: { 'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*' },
      status: 400,
    })
  }
})
