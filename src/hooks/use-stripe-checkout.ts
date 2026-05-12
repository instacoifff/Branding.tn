import { useState } from "react";
import { supabase } from "@/lib/supabase";
import { toast } from "sonner";

type CheckoutParams = {
  projectId: string;
  amountCents: number;
  currency?: string;
  clientEmail: string;
  projectTitle: string;
};

/**
 * useStripeCheckout — Calls the create-checkout-session Edge Function
 * and redirects the user to Stripe's hosted checkout page.
 */
export function useStripeCheckout() {
  const [loading, setLoading] = useState(false);

  const startCheckout = async ({
    projectId,
    amountCents,
    currency = "eur",
    clientEmail,
    projectTitle,
  }: CheckoutParams) => {
    setLoading(true);
    try {
      const {
        data: { session: authSession },
      } = await supabase.auth.getSession();

      const token = authSession?.access_token;
      if (!token) {
        toast.error("You must be logged in to make a payment.");
        return;
      }

      const response = await fetch(
        `${import.meta.env.VITE_SUPABASE_URL}/functions/v1/create-checkout-session`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify({
            project_id: projectId,
            amount_cents: amountCents,
            currency,
            client_email: clientEmail,
            project_title: projectTitle,
          }),
        }
      );

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || "Failed to create checkout session");
      }

      // Redirect to Stripe Checkout
      if (data.url) {
        window.location.href = data.url;
      } else {
        throw new Error("No checkout URL returned");
      }
    } catch (error: any) {
      console.error("Checkout error:", error);
      toast.error(error.message || "Payment failed. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  return { startCheckout, loading };
}
