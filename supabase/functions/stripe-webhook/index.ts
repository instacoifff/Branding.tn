// BrandingTN — Stripe Webhook Handler
// Deploy as Supabase Edge Function: supabase functions deploy stripe-webhook
//
// Required env vars:
//   - STRIPE_SECRET_KEY
//   - STRIPE_WEBHOOK_SECRET
//   - SUPABASE_URL
//   - SUPABASE_SERVICE_ROLE_KEY
//
// Configure in Stripe Dashboard: Webhook endpoint → https://<project-ref>.supabase.co/functions/v1/stripe-webhook
// Events to listen for: checkout.session.completed

import Stripe from "https://esm.sh/stripe@14.21.0?target=deno";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.48.1";

const stripe = new Stripe(Deno.env.get("STRIPE_SECRET_KEY")!, {
  apiVersion: "2024-06-20",
  httpClient: Stripe.createFetchHttpClient(),
});

const supabaseAdmin = createClient(
  Deno.env.get("SUPABASE_URL")!,
  Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!
);

Deno.serve(async (req) => {
  const signature = req.headers.get("stripe-signature");

  if (!signature) {
    return new Response("Missing stripe-signature header", { status: 400 });
  }

  try {
    const body = await req.text();
    const webhookSecret = Deno.env.get("STRIPE_WEBHOOK_SECRET")!;
    const event = await stripe.webhooks.constructEventAsync(body, signature, webhookSecret);

    if (event.type === "checkout.session.completed") {
      const session = event.data.object as Stripe.Checkout.Session;
      const projectId = session.metadata?.project_id;

      if (projectId) {
        // Update project: mark deposit as paid
        const { error: updateError } = await supabaseAdmin
          .from("projects")
          .update({
            deposit_paid: true,
            status: "active",
            updated_at: new Date().toISOString(),
          })
          .eq("id", projectId);

        if (updateError) {
          console.error("Failed to update project:", updateError);
        }

        // Get project details for notification
        const { data: project } = await supabaseAdmin
          .from("projects")
          .select("client_id, title, creative_id")
          .eq("id", projectId)
          .single();

        if (project) {
          // Notify client
          await supabaseAdmin.from("notifications").insert({
            user_id: project.client_id,
            title: "Payment Received! 🎉",
            body: `Your deposit for "${project.title}" has been confirmed. Your creative team will start working immediately!`,
          });

          // Notify creative if assigned
          if (project.creative_id) {
            await supabaseAdmin.from("notifications").insert({
              user_id: project.creative_id,
              title: `New Project Activated: ${project.title}`,
              body: "Client deposit has been paid. You can start working on this project now!",
            });
          }

          // Notify all admins
          const { data: admins } = await supabaseAdmin
            .from("profiles")
            .select("id")
            .eq("role", "admin");

          if (admins) {
            const adminNotifications = admins.map((admin) => ({
              user_id: admin.id,
              title: `💰 Payment Received: ${project.title}`,
              body: `Client deposit of ${(session.amount_total! / 100).toFixed(2)} ${session.currency?.toUpperCase()} has been paid.`,
            }));
            await supabaseAdmin.from("notifications").insert(adminNotifications);
          }
        }
      }
    }

    return new Response(JSON.stringify({ received: true }), {
      headers: { "Content-Type": "application/json" },
    });
  } catch (error: any) {
    console.error("Webhook error:", error);
    return new Response(`Webhook Error: ${error.message}`, { status: 400 });
  }
});
