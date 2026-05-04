// BrandingTN — Stripe Checkout Session Creator
// Deploy as Supabase Edge Function: supabase functions deploy create-checkout-session
//
// Required env vars (set via Supabase Dashboard > Edge Functions > Secrets):
//   - STRIPE_SECRET_KEY
//
// Usage: POST /functions/v1/create-checkout-session
// Body: { project_id, amount_cents, currency, client_email, project_title }

import Stripe from "https://esm.sh/stripe@14.21.0?target=deno";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.48.1";

const stripe = new Stripe(Deno.env.get("STRIPE_SECRET_KEY")!, {
  apiVersion: "2024-06-20",
  httpClient: Stripe.createFetchHttpClient(),
});

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

Deno.serve(async (req) => {
  // CORS preflight
  if (req.method === "OPTIONS") {
    return new Response("ok", { headers: corsHeaders });
  }

  try {
    const { project_id, amount_cents, currency, client_email, project_title } = await req.json();

    if (!project_id || !amount_cents) {
      return new Response(JSON.stringify({ error: "Missing project_id or amount_cents" }), {
        status: 400,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const origin = req.headers.get("origin") || "https://branding.tn";

    const session = await stripe.checkout.sessions.create({
      payment_method_types: ["card"],
      line_items: [
        {
          price_data: {
            currency: currency || "eur", // TND not supported by Stripe — use EUR or USD
            product_data: {
              name: `BrandingTN Deposit — ${project_title || "Project"}`,
              description: `30% deposit for project #${project_id.slice(0, 8)}`,
            },
            unit_amount: amount_cents,
          },
          quantity: 1,
        },
      ],
      mode: "payment",
      success_url: `${origin}/dashboard?payment=success&project=${project_id}`,
      cancel_url: `${origin}/dashboard?payment=cancelled`,
      metadata: { project_id },
      customer_email: client_email,
    });

    return new Response(JSON.stringify({ url: session.url, session_id: session.id }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  } catch (error: any) {
    console.error("Stripe error:", error);
    return new Response(JSON.stringify({ error: error.message }), {
      status: 500,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});
